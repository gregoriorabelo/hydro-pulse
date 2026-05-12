import type { WaterBlock } from "@/types/block";

type InsightSeverity = "Normal" | "Atenção" | "Crítico";

type Insight = {
  message: string;
  severity: InsightSeverity;
};

type OperationalInsightsProps = {
  blocks: WaterBlock[];
};

function getInsights(blocks: WaterBlock[]): Insight[] {
  return blocks.flatMap((block) => {
    const insights: Insight[] = [];

    if (block.nivel < 35) {
      insights.push({
        severity: "Crítico",
        message: `Bloco ${block.id} está em nível crítico e exige ação imediata.`,
      });
    }

    if (block.nivel >= 35 && block.nivel <= 60) {
      insights.push({
        severity: "Atenção",
        message: `Bloco ${block.id} está em faixa de atenção e deve ser acompanhado.`,
      });
    }

    if (block.tendencia === "Caindo") {
      insights.push({
        severity: "Atenção",
        message: `Bloco ${block.id} apresenta tendência de queda no reservatório.`,
      });
    }

    if (block.tendencia === "Subindo") {
      insights.push({
        severity: "Normal",
        message: `Bloco ${block.id} apresenta recuperação operacional.`,
      });
    }

    if (block.nivel > 60 && block.tendencia === "Estável") {
      insights.push({
        severity: "Normal",
        message: `Bloco ${block.id} mantém nível seguro e estabilidade operacional.`,
      });
    }

    return insights;
  });
}

function getInsightStyle(severity: InsightSeverity) {
  const styles = {
    Normal: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
    Atenção: "border-yellow-500/20 bg-yellow-500/10 text-yellow-100",
    Crítico: "border-red-500/20 bg-red-500/10 text-red-100",
  };

  return styles[severity];
}

export default function OperationalInsights({
  blocks,
}: OperationalInsightsProps) {
  const insights = getInsights(blocks);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[#D5B56B]">
          Inteligência Operacional
        </p>

        <h2 className="mt-3 text-4xl font-black text-white">
          Diagnósticos automáticos
        </h2>

        <p className="mt-4 max-w-3xl text-lg text-slate-400">
          Leitura inteligente dos reservatórios com base em nível, tendência e
          risco operacional.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`rounded-3xl border p-5 ${getInsightStyle(
              insight.severity
            )}`}
          >
            <div className="flex items-center justify-between gap-4">
              <p>{insight.message}</p>

              <span className="shrink-0 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold">
                {insight.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}