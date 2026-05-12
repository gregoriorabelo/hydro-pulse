export type WaterStatus =
  | "Normal"
  | "Atenção"
  | "Crítico"
  | "Sem sinal"
  | "Reabastecendo";

export type WaterTrend =
  | "Subindo"
  | "Caindo"
  | "Estável"
  | "Queda crítica"
  | "Consumo elevado"
  | "Recuperação";

export interface WaterHistoryPoint {
  hora: string;
  valor: number;
}

export interface WaterBlock {
  databaseId: string;
  id: string;
  nivel: number;
  profundidade: number;
  status: WaterStatus;
  tendencia: WaterTrend;
  autonomia: string;
  atualizacao: string;
  alerta: string;
  historico: WaterHistoryPoint[];
}