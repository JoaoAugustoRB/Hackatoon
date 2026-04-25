import { calcularSaudeMatriz, classificarStatus, gerarAlertasDaLeitura } from "@/lib/calculations";
import type { Leitura, Matriz, MoldGuardSnapshot } from "@/types";

function isoFromMinutesAgo(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

function criarLeituraBase(
  id: string,
  matrizId: string,
  temperatura: number,
  vibracao: number,
  impacto: number,
  tempoCiclo: number,
  pecaBoa: boolean,
  minutesAgo: number,
): Leitura {
  return {
    id,
    matrizId,
    temperatura,
    vibracao,
    impacto,
    tempoCiclo,
    pecaBoa,
    createdAt: isoFromMinutesAgo(minutesAgo),
  };
}

const matrizesBase: Matriz[] = [
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
    saude: 0,
    status: "SAUDAVEL",
    createdAt: isoFromMinutesAgo(7200),
    updatedAt: isoFromMinutesAgo(20),
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
    saude: 0,
    status: "ATENCAO",
    createdAt: isoFromMinutesAgo(8400),
    updatedAt: isoFromMinutesAgo(16),
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
    saude: 0,
    status: "RISCO",
    createdAt: isoFromMinutesAgo(9600),
    updatedAt: isoFromMinutesAgo(12),
  },
];

const leiturasBase: Leitura[] = [
  criarLeituraBase("leitura_001", "matriz_001", 70, 2.8, 66, 12.1, true, 120),
  criarLeituraBase("leitura_002", "matriz_001", 74, 3.1, 68, 12.5, true, 95),
  criarLeituraBase("leitura_003", "matriz_001", 82, 3.2, 72, 13.9, true, 72),
  criarLeituraBase("leitura_004", "matriz_001", 78, 2.9, 70, 12.4, true, 48),
  criarLeituraBase("leitura_005", "matriz_001", 76, 3.4, 74, 12.8, false, 24),
  criarLeituraBase("leitura_006", "matriz_002", 79, 4.7, 82, 15.4, true, 150),
  criarLeituraBase("leitura_007", "matriz_002", 84, 5.2, 90, 16.2, true, 118),
  criarLeituraBase("leitura_008", "matriz_002", 88, 5.4, 98, 18.1, true, 92),
  criarLeituraBase("leitura_009", "matriz_002", 83, 4.9, 91, 15.6, false, 60),
  criarLeituraBase("leitura_010", "matriz_002", 86, 5.1, 94, 17.2, true, 28),
  criarLeituraBase("leitura_011", "matriz_003", 72, 3.8, 80, 10.6, true, 135),
  criarLeituraBase("leitura_012", "matriz_003", 77, 4.2, 87, 12.1, false, 110),
  criarLeituraBase("leitura_013", "matriz_003", 79, 4.5, 92, 13.4, true, 80),
  criarLeituraBase("leitura_014", "matriz_003", 74, 4.1, 84, 11.2, true, 50),
  criarLeituraBase("leitura_015", "matriz_003", 81, 4.8, 97, 14.2, false, 18),
];

export function buildSeedSnapshot(): MoldGuardSnapshot {
  const matrizes: Record<string, Matriz> = {};
  const leituras: MoldGuardSnapshot["leituras"] = {};
  const alertas: MoldGuardSnapshot["alertas"] = {};

  for (const matriz of matrizesBase) {
    const leiturasDaMatriz = leiturasBase
      .filter((leitura) => leitura.matrizId === matriz.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const ultimaLeitura = leiturasDaMatriz.at(-1);
    const saude = calcularSaudeMatriz(matriz, ultimaLeitura);
    const status = classificarStatus(saude);

    matrizes[matriz.id] = {
      ...matriz,
      saude,
      status,
    };

    leituras[matriz.id] = {};

    for (const leitura of leiturasDaMatriz) {
      leituras[matriz.id][leitura.id] = {
        temperatura: leitura.temperatura,
        vibracao: leitura.vibracao,
        impacto: leitura.impacto,
        tempoCiclo: leitura.tempoCiclo,
        pecaBoa: leitura.pecaBoa,
        createdAt: leitura.createdAt,
      };
    }

    if (ultimaLeitura) {
      const alertasGerados = gerarAlertasDaLeitura(
        matrizes[matriz.id],
        ultimaLeitura,
        Math.max(0, 100 - (matriz.ciclosAtuais / matriz.vidaUtilTotal) * 100),
      );

      for (const alerta of alertasGerados) {
        alertas[`alerta_${matriz.id}_${alerta.tipo.toLowerCase()}`] = alerta;
      }
    }
  }

  return { matrizes, leituras, alertas };
}
