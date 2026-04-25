import {
  calcularOEE,
  calcularSaudeMatriz,
  calcularVidaRestante,
  classificarStatus,
  gerarAlertasDaLeitura,
} from "@/lib/calculations";
import { getAdminDatabase, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { buildSeedSnapshot } from "@/lib/seed";
import { toSlugId } from "@/lib/utils";
import type { DashboardStats, Leitura, Matriz, MoldGuardSnapshot } from "@/types";

declare global {
  var __moldguardMemoryDb: MoldGuardSnapshot | undefined;
}

function getMemoryDb() {
  if (!globalThis.__moldguardMemoryDb) {
    globalThis.__moldguardMemoryDb = buildSeedSnapshot();
  }

  return globalThis.__moldguardMemoryDb;
}

async function ensureFirebaseSeed() {
  const db = getAdminDatabase();
  const snapshot = await db.ref("matrizes").get();

  if (snapshot.exists()) {
    return;
  }

  await db.ref("/").set(buildSeedSnapshot());
}

async function getSnapshot(): Promise<MoldGuardSnapshot> {
  if (!isFirebaseAdminConfigured()) {
    return structuredClone(getMemoryDb());
  }

  await ensureFirebaseSeed();

  const db = getAdminDatabase();
  const snapshot = await db.ref("/").get();
  const value = snapshot.val() as Partial<MoldGuardSnapshot> | null;

  return {
    matrizes: value?.matrizes ?? {},
    leituras: value?.leituras ?? {},
    alertas: value?.alertas ?? {},
  };
}

async function writeSnapshot(snapshot: MoldGuardSnapshot) {
  if (!isFirebaseAdminConfigured()) {
    globalThis.__moldguardMemoryDb = snapshot;
    return;
  }

  const db = getAdminDatabase();
  await db.ref("/").set(snapshot);
}

function normalizeMatrizes(matrizes: Record<string, Matriz>) {
  return Object.values(matrizes).sort((a, b) => a.codigo.localeCompare(b.codigo));
}

function normalizeLeituras(snapshot: MoldGuardSnapshot, matrizId?: string) {
  const groups = matrizId
    ? { [matrizId]: snapshot.leituras[matrizId] ?? {} }
    : snapshot.leituras;

  return Object.entries(groups)
    .flatMap(([currentMatrizId, leituras]) =>
      Object.entries(leituras ?? {}).map(([id, leitura]) => ({
        id,
        matrizId: currentMatrizId,
        ...leitura,
      })),
    )
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function normalizeAlertas(snapshot: MoldGuardSnapshot) {
  return Object.entries(snapshot.alertas)
    .map(([id, alerta]) => ({ id, ...alerta }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function syncAlertasDaMatriz(
  snapshot: MoldGuardSnapshot,
  matriz: Matriz,
  leitura: Leitura,
  vidaRestante: number,
) {
  const alertasGerados = gerarAlertasDaLeitura(matriz, leitura, vidaRestante);
  const tiposAtivos = new Set(alertasGerados.map((alerta) => alerta.tipo));
  const tiposJaAbertos = new Set<string>();

  for (const [alertaId, alerta] of Object.entries(snapshot.alertas)) {
    if (alerta.matrizId !== matriz.id || alerta.resolvido) {
      continue;
    }

    if (tiposAtivos.has(alerta.tipo)) {
      tiposJaAbertos.add(alerta.tipo);
      continue;
    }

    snapshot.alertas[alertaId] = {
      ...alerta,
      resolvido: true,
    };
  }

  const novosAlertas = alertasGerados.filter((alerta) => !tiposJaAbertos.has(alerta.tipo));
  for (const alerta of novosAlertas) {
    snapshot.alertas[toSlugId("alerta")] = alerta;
  }

  return novosAlertas;
}

export async function getDashboardData() {
  const snapshot = await getSnapshot();
  const matrizes = normalizeMatrizes(snapshot.matrizes);
  const alertas = normalizeAlertas(snapshot);
  const oeeMedio =
    matrizes.length > 0
      ? matrizes.reduce((acc, matriz) => {
          const leituras = normalizeLeituras(snapshot, matriz.id);
          return acc + calcularOEE(leituras, matriz.cicloIdeal).oee;
        }, 0) / matrizes.length
      : 0;

  const stats: DashboardStats = {
    totalMatrizes: matrizes.length,
    porStatus: {
      SAUDAVEL: matrizes.filter((matriz) => matriz.status === "SAUDAVEL").length,
      ATENCAO: matrizes.filter((matriz) => matriz.status === "ATENCAO").length,
      RISCO: matrizes.filter((matriz) => matriz.status === "RISCO").length,
      CRITICO: matrizes.filter((matriz) => matriz.status === "CRITICO").length,
    },
    oeeMedio: oeeMedio * 100,
    matrizesCriticas: matrizes.filter((matriz) => matriz.status === "CRITICO").length,
    alertasAbertos: alertas.filter((alerta) => !alerta.resolvido).length,
  };

  return {
    snapshot,
    matrizes,
    alertas,
    stats,
  };
}

export async function getMatrizes() {
  const snapshot = await getSnapshot();
  const matrizes = normalizeMatrizes(snapshot.matrizes).map((matriz) => {
    const leituras = normalizeLeituras(snapshot, matriz.id);
    return {
      ...matriz,
      vidaRestante: calcularVidaRestante(matriz.ciclosAtuais, matriz.vidaUtilTotal),
      ultimaLeitura: leituras.at(-1) ?? null,
      oee: calcularOEE(leituras, matriz.cicloIdeal),
    };
  });

  return { snapshot, matrizes };
}

export async function getAlertas() {
  const snapshot = await getSnapshot();
  const alertas = normalizeAlertas(snapshot);

  return { snapshot, alertas };
}

export async function getMatrizDetail(matrizId: string) {
  const snapshot = await getSnapshot();
  const matriz = snapshot.matrizes[matrizId];

  if (!matriz) {
    return null;
  }

  const leituras = normalizeLeituras(snapshot, matrizId);
  const alertas = normalizeAlertas(snapshot).filter(
    (alerta) => alerta.matrizId === matrizId,
  );
  const ultimaLeitura = leituras.at(-1) ?? null;
  const vidaRestante = calcularVidaRestante(matriz.ciclosAtuais, matriz.vidaUtilTotal);
  const oee = calcularOEE(leituras, matriz.cicloIdeal);

  return {
    snapshot,
    matriz,
    leituras,
    alertas,
    ultimaLeitura,
    vidaRestante,
    oee,
  };
}

export async function createMatriz(data: Omit<Matriz, "id" | "createdAt" | "updatedAt" | "saude" | "status">) {
  const snapshot = await getSnapshot();
  const id = toSlugId("matriz");
  const createdAt = new Date().toISOString();
  const leituraInicial: Leitura = {
    id: toSlugId("leitura"),
    matrizId: id,
    temperatura: Number((data.temperaturaLimite * 0.92).toFixed(1)),
    vibracao: Number((data.vibracaoLimite * 0.88).toFixed(2)),
    impacto: Number((data.impactoLimite * 0.9).toFixed(1)),
    tempoCiclo: Number((data.cicloIdeal * 0.98).toFixed(1)),
    pecaBoa: true,
    createdAt,
  };
  const baseMatriz: Matriz = {
    id,
    ...data,
    saude: 100,
    status: "SAUDAVEL",
    createdAt,
    updatedAt: createdAt,
  };

  const vidaRestante = calcularVidaRestante(baseMatriz.ciclosAtuais, baseMatriz.vidaUtilTotal);
  baseMatriz.saude = calcularSaudeMatriz(baseMatriz, leituraInicial);
  baseMatriz.status = classificarStatus(baseMatriz.saude);
  snapshot.matrizes[id] = baseMatriz;
  snapshot.leituras[id] = {
    [leituraInicial.id]: {
      temperatura: leituraInicial.temperatura,
      vibracao: leituraInicial.vibracao,
      impacto: leituraInicial.impacto,
      tempoCiclo: leituraInicial.tempoCiclo,
      pecaBoa: leituraInicial.pecaBoa,
      createdAt: leituraInicial.createdAt,
    },
  };

  const alertas = gerarAlertasDaLeitura(baseMatriz, leituraInicial, vidaRestante);
  for (const alerta of alertas) {
    snapshot.alertas[toSlugId("alerta")] = alerta;
  }

  await writeSnapshot(snapshot);

  return baseMatriz;
}

export async function registerLeitura(
  matrizId: string,
  leituraInput: Omit<Leitura, "id" | "matrizId" | "createdAt">,
) {
  const snapshot = await getSnapshot();
  const matriz = snapshot.matrizes[matrizId];

  if (!matriz) {
    throw new Error("Matriz nao encontrada.");
  }

  const leitura: Leitura = {
    id: toSlugId("leitura"),
    matrizId,
    createdAt: new Date().toISOString(),
    ...leituraInput,
  };

  const ciclosAtuais = matriz.ciclosAtuais + 1;
  const saude = calcularSaudeMatriz(
    { ...matriz, ciclosAtuais },
    leitura,
  );
  const status = classificarStatus(saude);
  const vidaRestante = calcularVidaRestante(ciclosAtuais, matriz.vidaUtilTotal);
  const matrizAtualizada: Matriz = {
    ...matriz,
    ciclosAtuais,
    saude,
    status,
    updatedAt: leitura.createdAt,
  };

  snapshot.matrizes[matrizId] = matrizAtualizada;
  snapshot.leituras[matrizId] = snapshot.leituras[matrizId] ?? {};
  snapshot.leituras[matrizId][leitura.id] = {
    temperatura: leitura.temperatura,
    vibracao: leitura.vibracao,
    impacto: leitura.impacto,
    tempoCiclo: leitura.tempoCiclo,
    pecaBoa: leitura.pecaBoa,
    createdAt: leitura.createdAt,
  };

  const alertas = syncAlertasDaMatriz(snapshot, matrizAtualizada, leitura, vidaRestante);

  await writeSnapshot(snapshot);

  return {
    matriz: matrizAtualizada,
    leitura,
    alertas,
  };
}

export async function resolverAlerta(alertaId: string) {
  const snapshot = await getSnapshot();
  const alerta = snapshot.alertas[alertaId];

  if (!alerta) {
    throw new Error("Alerta nao encontrado.");
  }

  snapshot.alertas[alertaId] = {
    ...alerta,
    resolvido: true,
  };

  if (isFirebaseAdminConfigured()) {
    const db = getAdminDatabase();
    await db.ref(`alertas/${alertaId}`).update({ resolvido: true });
    return;
  }

  globalThis.__moldguardMemoryDb = snapshot;
}
