import type { WaterBlock } from "@/types/block";

type OperationalOverviewProps = {
  blocks: WaterBlock[];
};

function getAverageLevel(blocks: WaterBlock[]) {
  const withValidReading = blocks.filter(
    (block) => block.status === "Normal" || block.status === "Atenção" || block.status === "Crítico"
  );

  if (withValidReading.length === 0) return 0;

  const total = withValidReading.reduce((sum, block) => sum + block.nivel, 0);
  return Math.round(total / withValidReading.length);
}

function getCriticalBlocks(blocks: WaterBlock[]) {
  return blocks.filter((block) => block.status === "Crítico").length;
}

function getAttentionBlocks(blocks: WaterBlock[]) {
  return blocks.filter((block) => block.status === "Atenção").length;
}

function getOperationalRisk(blocks: WaterBlock[]) {
  const critical = getCriticalBlocks(blocks);
  const attention = getAttentionBlocks(blocks);

  if (critical > 0) return "Alto";
  if (attention >= 2) return "Moderado";
  if (attention === 1) return "Baixo";
  return "Controlado";
}

export default function OperationalOverview({ blocks }: OperationalOverviewProps) {
  const averageLevel = getAverageLevel(blocks);
  const criticalBlocks = getCriticalBlocks(blocks);
  const attentionBlocks = getAttentionBlocks(blocks);
  const risk = getOperationalRisk(blocks);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <p className="text-sm uppercase tracking-[0.28em] text-brand-cyan">
        Visão Gerencial
      </p>

      <h2 className="mt-3 text-4xl font-black text-white">
        Saúde operacional do condomínio
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-brand-petrol p-6">
          <p className="text-slate-400">Nível médio</p>
          <h3 className="mt-4 text-4xl font-black text-white">{averageLevel}%</h3>
        </div>

        <div className="rounded-3xl bg-brand-petrol p-6">
          <p className="text-slate-400">Blocos críticos</p>
          <h3 className="mt-4 text-4xl font-black text-white">{criticalBlocks}</h3>
        </div>

        <div className="rounded-3xl bg-brand-petrol p-6">
          <p className="text-slate-400">Blocos em atenção</p>
          <h3 className="mt-4 text-4xl font-black text-white">{attentionBlocks}</h3>
        </div>

        <div className="rounded-3xl bg-brand-petrol p-6">
          <p className="text-slate-400">Risco de falta d’água</p>
          <h3 className="mt-4 text-4xl font-black text-white">{risk}</h3>
        </div>
      </div>
    </section>
  );
}