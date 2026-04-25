export type StatusMatriz = "SAUDAVEL" | "ATENCAO" | "RISCO" | "CRITICO";

export type TipoAlerta =
  | "TEMPERATURA"
  | "VIBRACAO"
  | "IMPACTO"
  | "CICLO"
  | "VIDA_UTIL";

export type NivelAlerta = "ATENCAO" | "RISCO" | "CRITICO";

export interface Matriz {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  vidaUtilTotal: number;
  ciclosAtuais: number;
  temperaturaLimite: number;
  vibracaoLimite: number;
  impactoLimite: number;
  cicloIdeal: number;
  saude: number;
  status: StatusMatriz;
  createdAt: string;
  updatedAt: string;
}

export interface Leitura {
  id: string;
  matrizId: string;
  temperatura: number;
  vibracao: number;
  impacto: number;
  tempoCiclo: number;
  pecaBoa: boolean;
  createdAt: string;
}

export interface Alerta {
  id: string;
  matrizId: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  mensagem: string;
  resolvido: boolean;
  createdAt: string;
}

export interface OEE {
  disponibilidade: number;
  performance: number;
  qualidade: number;
  oee: number;
  classificacao: "EXCELENTE" | "ACEITAVEL" | "PROBLEMA";
  tempoOperando: number;
  tempoPlanejado: number;
  pecasBoas: number;
  pecasTotais: number;
  tempoCicloMedio: number;
}

export interface DashboardStats {
  totalMatrizes: number;
  porStatus: Record<StatusMatriz, number>;
  oeeMedio: number;
  matrizesCriticas: number;
  alertasAbertos: number;
}

export interface MoldGuardSnapshot {
  matrizes: Record<string, Matriz>;
  leituras: Record<string, Record<string, Omit<Leitura, "id" | "matrizId">>>;
  alertas: Record<string, Omit<Alerta, "id">>;
}

export interface MatrizFormValues {
  codigo: string;
  nome: string;
  descricao: string;
  vidaUtilTotal: number;
  ciclosAtuais: number;
  temperaturaLimite: number;
  vibracaoLimite: number;
  impactoLimite: number;
  cicloIdeal: number;
}
