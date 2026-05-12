import type { WaterBlock, WaterTrend } from "@/types/block";

function getCurrentHour() {
  return new Date().getHours();
}

function getConsumptionFactor() {
  const hour = getCurrentHour();

  if (hour >= 6 && hour <= 9) {
    return 4;
  }

  if (hour >= 18 && hour <= 22) {
    return 5;
  }

  if (hour >= 0 && hour <= 5) {
    return 1;
  }

  return 2;
}

function limitLevel(value: number) {
  return Math.max(5, Math.min(98, value));
}

function calculateTrend(previousLevel: number, nextLevel: number): WaterTrend {
  if (nextLevel > previousLevel) {
    return "Subindo";
  }

  if (nextLevel < previousLevel) {
    return "Caindo";
  }

  return "Estável";
}

function calculateAutonomy(level: number, consumptionFactor: number) {
  const hours = Math.max(1, Math.round(level / consumptionFactor));

  return `${hours}h`;
}

function calculateAlert(level: number, trend: WaterTrend, autonomy: string) {
  const autonomyHours = Number(autonomy.replace("h", ""));

  if (level < 25) {
    return "Risco crítico de falta d’água";
  }

  if (autonomyHours <= 6) {
    return "Autonomia operacional reduzida";
  }

  if (level <= 45 && trend === "Caindo") {
    return "Queda de nível exige acompanhamento";
  }

  if (trend === "Subindo") {
    return "Reservatório em recuperação";
  }

  return "Operação dentro do padrão esperado";
}

export function simulateNextReading(block: WaterBlock): WaterBlock {
  const consumptionFactor = getConsumptionFactor();

  const rechargeChance = Math.random();

  const variation =
    rechargeChance > 0.78
      ? Math.floor(Math.random() * 6) + 1
      : -Math.floor(Math.random() * consumptionFactor);

  const nextLevel = limitLevel(block.nivel + variation);

  const trend = calculateTrend(block.nivel, nextLevel);

  const autonomy = calculateAutonomy(nextLevel, consumptionFactor);

  const alert = calculateAlert(nextLevel, trend, autonomy);

  return {
    ...block,
    nivel: nextLevel,
    tendencia: trend,
    autonomia: autonomy,
    alerta: alert,
    atualizacao: "Agora",
  };
}