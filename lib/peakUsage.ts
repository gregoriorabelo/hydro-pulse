export type UsageReadingRow = {
  reservoirId: string;
  reservoirName: string;
  blockName: string;
  capacityLiters: number | null;
  waterLevel: number;
  recordedAt: string;
};

export type ReservoirPeakUsage = {
  reservoirId: string;
  reservoirName: string;
  blockName: string;
  peakHour: number | null;
  peakHourLabel: string | null;
  peakConsumptionPercent: number;
  peakConsumptionLiters: number | null;
  totalConsumptionPercent: number;
  totalConsumptionLiters: number | null;
  sampleCount: number;
};

function toLiters(percent: number, capacityLiters: number | null) {
  if (capacityLiters === null) return null;
  return Math.round((percent / 100) * capacityLiters);
}

/**
 * Consumo = queda de nível entre leituras consecutivas do mesmo reservatório.
 * Aumentos de nível (reabastecimento) são ignorados. As quedas são somadas
 * por hora do dia (0-23) para achar o horário de maior consumo acumulado.
 */
export function computePeakUsage(rows: UsageReadingRow[]): ReservoirPeakUsage[] {
  const byReservoir = new Map<string, UsageReadingRow[]>();

  for (const row of rows) {
    const list = byReservoir.get(row.reservoirId) ?? [];
    list.push(row);
    byReservoir.set(row.reservoirId, list);
  }

  const results: ReservoirPeakUsage[] = [];

  for (const [reservoirId, readings] of byReservoir) {
    const sorted = readings
      .slice()
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

    const hourlyConsumption = new Map<number, number>();
    let totalConsumptionPercent = 0;

    for (let i = 1; i < sorted.length; i++) {
      const drop = sorted[i - 1].waterLevel - sorted[i].waterLevel;

      if (drop > 0) {
        const hour = new Date(sorted[i].recordedAt).getHours();
        hourlyConsumption.set(hour, (hourlyConsumption.get(hour) ?? 0) + drop);
        totalConsumptionPercent += drop;
      }
    }

    let peakHour: number | null = null;
    let peakConsumptionPercent = 0;

    for (const [hour, consumption] of hourlyConsumption) {
      if (consumption > peakConsumptionPercent) {
        peakHour = hour;
        peakConsumptionPercent = consumption;
      }
    }

    const capacityLiters = sorted[0].capacityLiters;

    results.push({
      reservoirId,
      reservoirName: sorted[0].reservoirName,
      blockName: sorted[0].blockName,
      peakHour,
      peakHourLabel: peakHour === null ? null : `${String(peakHour).padStart(2, "0")}h`,
      peakConsumptionPercent: Math.round(peakConsumptionPercent * 10) / 10,
      peakConsumptionLiters: toLiters(peakConsumptionPercent, capacityLiters),
      totalConsumptionPercent: Math.round(totalConsumptionPercent * 10) / 10,
      totalConsumptionLiters: toLiters(totalConsumptionPercent, capacityLiters),
      sampleCount: sorted.length,
    });
  }

  return results;
}
