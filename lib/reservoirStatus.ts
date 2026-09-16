import type { WaterStatus } from "@/types/block";

export function calculateStatus(
  reservoirStatus: "ativo" | "pausado",
  hasReading: boolean,
  nivel: number,
  criticalLevel: number,
  attentionLevel: number
): WaterStatus {
  if (reservoirStatus === "pausado") return "Pausado";
  if (!hasReading) return "Sem sinal";
  if (nivel <= criticalLevel) return "Crítico";
  if (nivel <= attentionLevel) return "Atenção";
  return "Normal";
}

export function calculateAlert(status: WaterStatus): string {
  switch (status) {
    case "Crítico":
      return "Nível crítico. Ação imediata recomendada.";
    case "Atenção":
      return "Nível em faixa de atenção. Acompanhar.";
    case "Sem sinal":
      return "Nenhuma leitura recebida do sensor.";
    case "Pausado":
      return "Reservatório pausado. Fora do monitoramento ativo.";
    default:
      return "Operação dentro do padrão esperado.";
  }
}
