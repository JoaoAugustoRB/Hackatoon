import type {
  Alerta,
  Leitura,
  Matriz,
  NivelAlerta,
  OEE,
  StatusMatriz,
  TipoAlerta,
} from "@/types";
import { clamp } from "@/lib/utils";

export function calcularVidaRestante(
  ciclosAtuais: number,
  vidaUtilTotal: number,
) {
  const vidaConsumida = vidaUtilTotal > 0 ? ciclosAtuais / vidaUtilTotal : 1;

  return clamp(100 - vidaConsumida * 100, 0, 100);
}

export function classificarStatus(saude: number): StatusMatriz {
  if (saude >= 80) return "SAUDAVEL";
  if (saude >= 60) return "ATENCAO";
  if (saude >= 40) return "RISCO";
  return "CRITICO";
}

export function calcularSaudeMatriz(
  matriz: Pick<
    Matriz,
    | "vidaUtilTotal"
    | "ciclosAtuais"
    | "temperaturaLimite"
    | "vibracaoLimite"
    | "impactoLimite"
    | "cicloIdeal"
  >,
  leitura?: Pick<Leitura, "temperatura" | "vibracao" | "impacto" | "tempoCiclo">,
) {
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

function definirNivelAlerta(fator: number): NivelAlerta {
  if (fator >= 1.25) return "CRITICO";
  if (fator >= 1.1) return "RISCO";
  return "ATENCAO";
}

export function gerarAlertasDaLeitura(
  matriz: Matriz,
  leitura: Leitura,
  vidaRestante: number,
) {
  const alertas: Omit<Alerta, "id">[] = [];

  const criarAlerta = (
    tipo: TipoAlerta,
    nivel: NivelAlerta,
    mensagem: string,
  ) => {
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
      `Temperatura em ${leitura.temperatura.toFixed(1)}°C acima do limite de ${matriz.temperaturaLimite}°C.`,
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

export function calcularOEE(
  leituras: Leitura[],
  cicloIdeal: number,
): OEE {
  if (!leituras.length) {
    return {
      disponibilidade: 0,
      performance: 0,
      qualidade: 0,
      oee: 0,
      classificacao: "PROBLEMA",
      tempoOperando: 0,
      tempoPlanejado: 0,
      pecasBoas: 0,
      pecasTotais: 0,
      tempoCicloMedio: 0,
    };
  }

  const pecasTotais = leituras.length;
  const pecasBoas = leituras.filter((leitura) => leitura.pecaBoa).length;
  const tempoOperando = leituras.reduce(
    (acc, leitura) => acc + leitura.tempoCiclo,
    0,
  );
  const perdasPorLentidao = leituras.reduce((acc, leitura) => {
    return acc + Math.max(0, leitura.tempoCiclo - cicloIdeal);
  }, 0);
  const tempoPlanejado = tempoOperando + perdasPorLentidao;
  const tempoCicloMedio = tempoOperando / pecasTotais;

  const disponibilidade =
    tempoPlanejado > 0 ? clamp(tempoOperando / tempoPlanejado, 0, 1) : 0;
  const performance =
    tempoCicloMedio > 0 ? clamp(cicloIdeal / tempoCicloMedio, 0, 1) : 0;
  const qualidade = pecasTotais > 0 ? clamp(pecasBoas / pecasTotais, 0, 1) : 0;
  const oee = disponibilidade * performance * qualidade;

  return {
    disponibilidade,
    performance,
    qualidade,
    oee,
    classificacao:
      oee > 0.85 ? "EXCELENTE" : oee >= 0.6 ? "ACEITAVEL" : "PROBLEMA",
    tempoOperando,
    tempoPlanejado,
    pecasBoas,
    pecasTotais,
    tempoCicloMedio,
  };
}
