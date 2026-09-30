import type { ReservoirPeakUsage } from "@/lib/peakUsage";

type PeakUsageInsightsProps = {
  peaks: ReservoirPeakUsage[];
};

function formatConsumption(peak: ReservoirPeakUsage) {
  if (peak.peakHourLabel === null) {
    return "Sem consumo detectado no período";
  }

  const liters =
    peak.peakConsumptionLiters !== null ? ` (≈${peak.peakConsumptionLiters} L)` : "";

  return `Pico às ${peak.peakHourLabel} — queda de ${peak.peakConsumptionPercent}%${liters}`;
}

export default function PeakUsageInsights({ peaks }: PeakUsageInsightsProps) {
  const ranked = peaks
    .slice()
    .sort((a, b) => b.peakConsumptionPercent - a.peakConsumptionPercent);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-brand-cyan">
          Consumo Hídrico
        </p>

        <h2 className="mt-3 text-3xl font-black text-white">
          Pico de uso de água
        </h2>

        <p className="mt-4 text-slate-400">
          Horário de maior queda de nível acumulada nos últimos 7 dias, por
          reservatório.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {ranked.length === 0 ? (
          <p className="text-slate-500">
            Ainda não há leituras suficientes para identificar picos de
            consumo.
          </p>
        ) : (
          ranked.map((peak) => (
            <div
              key={peak.reservoirId}
              className="rounded-3xl border border-brand-tech/20 bg-brand-tech/10 p-5"
            >
              <p className="font-semibold text-brand-cyan">
                {peak.reservoirName} (bloco {peak.blockName})
              </p>

              <p className="mt-3 text-slate-200">{formatConsumption(peak)}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
