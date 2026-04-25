import nextEnv from "@next/env";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const DEFAULT_INTERVAL_MS = 5000;

const seedMatrices = [
  {
    id: "matriz_001",
    codigo: "MX-001",
    nome: "Matriz Sandalia Feminina",
    descricao: "Linha feminina com foco em estabilidade termica e repetibilidade por ciclo.",
    vidaUtilTotal: 100000,
    ciclosAtuais: 45200,
    temperaturaLimite: 80,
    vibracaoLimite: 4.5,
    impactoLimite: 90,
    cicloIdeal: 12,
  },
  {
    id: "matriz_002",
    codigo: "MX-002",
    nome: "Matriz Solado Masculino",
    descricao: "Matriz de alta cadencia usada em turnos longos, com desgaste moderado.",
    vidaUtilTotal: 300000,
    ciclosAtuais: 210000,
    temperaturaLimite: 85,
    vibracaoLimite: 5,
    impactoLimite: 95,
    cicloIdeal: 15,
  },
  {
    id: "matriz_003",
    codigo: "MX-003",
    nome: "Matriz Chinelo Infantil",
    descricao: "Ativo proximo do limite de vida util, ideal para demonstrar manutencao preditiva.",
    vidaUtilTotal: 80000,
    ciclosAtuais: 72000,
    temperaturaLimite: 75,
    vibracaoLimite: 4,
    impactoLimite: 85,
    cicloIdeal: 10,
  },
];

function parseArgs(argv) {
  const options = {
    intervalMs: DEFAULT_INTERVAL_MS,
    matrixId: null,
    once: false,
    reset: false,
  };

  for (const arg of argv) {
    if (arg === "--once") {
      options.once = true;
      continue;
    }

    if (arg === "--reset") {
      options.reset = true;
      continue;
    }

    if (arg.startsWith("--interval=")) {
      const value = Number(arg.slice("--interval=".length));
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Use --interval com um numero positivo em milissegundos.");
      }

      options.intervalMs = value;
      continue;
    }

    if (arg.startsWith("--matrix=")) {
      options.matrixId = arg.slice("--matrix=".length);
      continue;
    }

    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Argumento nao reconhecido: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log("Uso:");
  console.log("  npm run simulate:firebase");
  console.log("  npm run simulate:firebase -- --interval=2000");
  console.log("  npm run simulate:firebase -- --matrix=matriz_001");
  console.log("  npm run simulate:firebase -- --once");
  console.log("  npm run simulate:firebase -- --reset");
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }

  return value;
}

function getPrivateKey() {
  return getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
}

function getDatabaseInstance() {
  const existingApp = getApps()[0];
  const app =
    existingApp ??
    initializeApp({
      credential: cert({
        projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
        clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
        privateKey: getPrivateKey(),
      }),
      databaseURL: getRequiredEnv("NEXT_PUBLIC_FIREBASE_DATABASE_URL"),
    });

  return getDatabase(app);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calcularVidaRestante(ciclosAtuais, vidaUtilTotal) {
  const vidaConsumida = vidaUtilTotal > 0 ? ciclosAtuais / vidaUtilTotal : 1;
  return clamp(100 - vidaConsumida * 100, 0, 100);
}

function classificarStatus(saude) {
  if (saude >= 80) return "SAUDAVEL";
  if (saude >= 60) return "ATENCAO";
  if (saude >= 40) return "RISCO";
  return "CRITICO";
}

function calcularSaudeMatriz(matriz, leitura) {
  let saude = calcularVidaRestante(matriz.ciclosAtuais, matriz.vidaUtilTotal);

  if (!leitura) {
    return clamp(saude, 0, 100);
  }

  if (leitura.temperatura > matriz.temperaturaLimite) saude -= 10;
  if (leitura.vibracao > matriz.vibracaoLimite) saude -= 10;
  if (leitura.impacto > matriz.impactoLimite) saude -= 10;
  if (leitura.tempoCiclo > matriz.cicloIdeal * 1.15) saude -= 10;

  return clamp(saude, 0, 100);
}

function definirNivelAlerta(fator) {
  if (fator >= 1.25) return "CRITICO";
  if (fator >= 1.1) return "RISCO";
  return "ATENCAO";
}

function gerarAlertasDaLeitura(matriz, leitura, vidaRestante) {
  const alertas = [];

  const criarAlerta = (tipo, nivel, mensagem) => {
    alertas.push({
      matrizId: matriz.id,
      tipo,
      nivel,
      mensagem,
      resolvido: false,
      createdAt: leitura.createdAt,
    });
  };

  if (leitura.temperatura > matriz.temperaturaLimite) {
    criarAlerta(
      "TEMPERATURA",
      definirNivelAlerta(leitura.temperatura / matriz.temperaturaLimite),
      `Temperatura em ${leitura.temperatura.toFixed(1)}C acima do limite de ${matriz.temperaturaLimite}C.`,
    );
  }

  if (leitura.vibracao > matriz.vibracaoLimite) {
    criarAlerta(
      "VIBRACAO",
      definirNivelAlerta(leitura.vibracao / matriz.vibracaoLimite),
      `Vibracao em ${leitura.vibracao.toFixed(2)} acima do limite de ${matriz.vibracaoLimite}.`,
    );
  }

  if (leitura.impacto > matriz.impactoLimite) {
    criarAlerta(
      "IMPACTO",
      definirNivelAlerta(leitura.impacto / matriz.impactoLimite),
      `Impacto em ${leitura.impacto.toFixed(1)} acima do limite de ${matriz.impactoLimite}.`,
    );
  }

  if (leitura.tempoCiclo > matriz.cicloIdeal * 1.15) {
    criarAlerta(
      "CICLO",
      definirNivelAlerta(leitura.tempoCiclo / (matriz.cicloIdeal * 1.15)),
      `Tempo de ciclo em ${leitura.tempoCiclo.toFixed(1)}s acima da faixa ideal da matriz.`,
    );
  }

  if (vidaRestante < 20) {
    criarAlerta(
      "VIDA_UTIL",
      vidaRestante < 10 ? "CRITICO" : vidaRestante < 15 ? "RISCO" : "ATENCAO",
      `Vida util restante em ${vidaRestante.toFixed(1)}%. Planeje manutencao preventiva.`,
    );
  }

  return alertas;
}

function syncAlertasDaMatriz(snapshot, matriz, leitura, vidaRestante) {
  const alertasGerados = gerarAlertasDaLeitura(matriz, leitura, vidaRestante);
  const tiposAtivos = new Set(alertasGerados.map((alerta) => alerta.tipo));
  const tiposJaAbertos = new Set();
  const alertasResolvidos = [];
  const novosAlertas = [];

  for (const [alertaId, alerta] of Object.entries(snapshot.alertas ?? {})) {
    if (alerta.matrizId !== matriz.id || alerta.resolvido) {
      continue;
    }

    if (tiposAtivos.has(alerta.tipo)) {
      tiposJaAbertos.add(alerta.tipo);
      continue;
    }

    alertasResolvidos.push(alertaId);
  }

  for (const alerta of alertasGerados) {
    if (!tiposJaAbertos.has(alerta.tipo)) {
      novosAlertas.push(alerta);
    }
  }

  return {
    alertasResolvidos,
    novosAlertas,
  };
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function toFixedNumber(value, digits) {
  return Number(value.toFixed(digits));
}

function chance(probability) {
  return Math.random() < probability;
}

function buildLeitura(matriz) {
  const temperatura = toFixedNumber(
    chance(0.22)
      ? randomBetween(matriz.temperaturaLimite * 1.01, matriz.temperaturaLimite * 1.12)
      : randomBetween(matriz.temperaturaLimite * 0.9, matriz.temperaturaLimite * 0.99),
    1,
  );
  const vibracao = toFixedNumber(
    chance(0.2)
      ? randomBetween(matriz.vibracaoLimite * 1.01, matriz.vibracaoLimite * 1.1)
      : randomBetween(matriz.vibracaoLimite * 0.88, matriz.vibracaoLimite * 0.99),
    2,
  );
  const impacto = toFixedNumber(
    chance(0.18)
      ? randomBetween(matriz.impactoLimite * 1.01, matriz.impactoLimite * 1.11)
      : randomBetween(matriz.impactoLimite * 0.89, matriz.impactoLimite * 0.99),
    1,
  );
  const tempoCiclo = toFixedNumber(
    chance(0.2)
      ? randomBetween(matriz.cicloIdeal * 1.16, matriz.cicloIdeal * 1.24)
      : randomBetween(matriz.cicloIdeal * 0.96, matriz.cicloIdeal * 1.08),
    1,
  );
  const anomalias =
    Number(temperatura > matriz.temperaturaLimite) +
    Number(vibracao > matriz.vibracaoLimite) +
    Number(impacto > matriz.impactoLimite) +
    Number(tempoCiclo > matriz.cicloIdeal * 1.15);
  const pecaBoa = Math.random() > 0.04 + anomalias * 0.14;

  return {
    temperatura,
    vibracao,
    impacto,
    tempoCiclo,
    pecaBoa,
  };
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createSeedSnapshot() {
  const createdAt = new Date().toISOString();
  const matrizes = {};
  const leituras = {};

  for (const matriz of seedMatrices) {
    const saude = calcularVidaRestante(matriz.ciclosAtuais, matriz.vidaUtilTotal);
    matrizes[matriz.id] = {
      ...matriz,
      saude,
      status: classificarStatus(saude),
      createdAt,
      updatedAt: createdAt,
    };
    leituras[matriz.id] = {};
  }

  return {
    matrizes,
    leituras,
    alertas: {},
  };
}

async function resetSnapshot(db) {
  const seeded = createSeedSnapshot();
  await db.ref("/").set(seeded);
  console.log("Realtime Database resetado com os dados iniciais.");
}

async function ensureSnapshot(db) {
  const snapshotRef = db.ref("/");
  const snapshot = await snapshotRef.get();

  if (snapshot.exists() && snapshot.child("matrizes").exists()) {
    const value = snapshot.val();
    return {
      matrizes: value.matrizes ?? {},
      leituras: value.leituras ?? {},
      alertas: value.alertas ?? {},
    };
  }

  const seeded = createSeedSnapshot();
  await snapshotRef.set(seeded);
  console.log("Base vazia. Snapshot inicial criado no Realtime Database.");
  return seeded;
}

async function writeReading(db, options) {
  const snapshot = await ensureSnapshot(db);
  const matrizes = Object.values(snapshot.matrizes);

  if (!matrizes.length) {
    throw new Error("Nenhuma matriz encontrada no banco.");
  }

  const matriz =
    (options.matrixId ? snapshot.matrizes[options.matrixId] : null) ??
    matrizes[Math.floor(Math.random() * matrizes.length)];

  if (!matriz) {
    throw new Error(`Matriz nao encontrada: ${options.matrixId}`);
  }

  const leituraBase = buildLeitura(matriz);
  const createdAt = new Date().toISOString();
  const leituraId = createId("leitura");
  const ciclosAtuais = matriz.ciclosAtuais + 1;
  const leitura = {
    id: leituraId,
    matrizId: matriz.id,
    createdAt,
    ...leituraBase,
  };
  const matrizAtualizada = {
    ...matriz,
    ciclosAtuais,
    saude: 0,
    status: "SAUDAVEL",
    updatedAt: createdAt,
  };

  matrizAtualizada.saude = calcularSaudeMatriz(matrizAtualizada, leitura);
  matrizAtualizada.status = classificarStatus(matrizAtualizada.saude);

  const vidaRestante = calcularVidaRestante(
    matrizAtualizada.ciclosAtuais,
    matrizAtualizada.vidaUtilTotal,
  );
  const { alertasResolvidos, novosAlertas } = syncAlertasDaMatriz(
    snapshot,
    matrizAtualizada,
    leitura,
    vidaRestante,
  );

  const updates = {
    [`matrizes/${matriz.id}`]: matrizAtualizada,
    [`leituras/${matriz.id}/${leituraId}`]: {
      temperatura: leitura.temperatura,
      vibracao: leitura.vibracao,
      impacto: leitura.impacto,
      tempoCiclo: leitura.tempoCiclo,
      pecaBoa: leitura.pecaBoa,
      createdAt: leitura.createdAt,
    },
  };

  for (const alertaId of alertasResolvidos) {
    updates[`alertas/${alertaId}/resolvido`] = true;
  }

  for (const alerta of novosAlertas) {
    updates[`alertas/${createId("alerta")}`] = alerta;
  }

  await db.ref("/").update(updates);

  console.log(
    `[${new Date().toLocaleTimeString("pt-BR")}] ${matriz.codigo} | temp ${leitura.temperatura}C | vib ${leitura.vibracao} | impacto ${leitura.impacto} | ciclo ${leitura.tempoCiclo}s | status ${matrizAtualizada.status} | novos alertas ${novosAlertas.length} | resolvidos ${alertasResolvidos.length}`,
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = getDatabaseInstance();

  if (options.reset) {
    await resetSnapshot(db);

    if (options.once) {
      return;
    }
  }

  await writeReading(db, options);

  if (options.once) {
    return;
  }

  console.log(`Atualizando Firebase a cada ${options.intervalMs}ms. Ctrl+C para parar.`);

  const timer = setInterval(() => {
    writeReading(db, options).catch((error) => {
      console.error("Falha ao escrever leitura:", error);
    });
  }, options.intervalMs);

  const shutdown = () => {
    clearInterval(timer);
    console.log("Simulador encerrado.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
