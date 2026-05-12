export type WaterStatus = "Normal" | "Atenção" | "Crítico" | "Sem sinal";

export type WaterTrend = "Subindo" | "Caindo" | "Estável";

export interface WaterHistoryPoint {
  hora: string;
  valor: number;
}

export interface WaterBlock {
  databaseId: string;
  id: string;
  nivel: number;
  profundidade: number;
  tendencia: WaterTrend;
  autonomia: string;
  atualizacao: string;
  alerta: string;
  historico: WaterHistoryPoint[];
}