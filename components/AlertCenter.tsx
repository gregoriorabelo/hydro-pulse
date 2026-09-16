import type { WaterBlock } from "@/types/block";

type AlertCenterProps = {
  blocks: WaterBlock[];
};

function generateAlerts(blocks: WaterBlock[]) {
  return blocks.flatMap((block) => {
    const alerts = [];

    if (block.status === "Sem sinal") {
      alerts.push({
        tipo: "Sensor offline",
        severidade: "Crítico",
        mensagem: `${block.id} (bloco ${block.blockName}) está sem comunicação.`,
      });
    }

    if (block.status === "Crítico") {
      alerts.push({
        tipo: "Baixo nível",
        severidade: "Crítico",
        mensagem: `${block.id} (bloco ${block.blockName}) em nível crítico.`,
      });
    }

    if (block.status === "Atenção") {
      alerts.push({
        tipo: "Atenção operacional",
        severidade: "Atenção",
        mensagem: `${block.id} (bloco ${block.blockName}) em faixa de atenção.`,
      });
    }

    return alerts;
  });
}

function getAlertStyle(severidade: string) {
  if (severidade === "Crítico") {
    return "border-red-500/20 bg-red-500/10";
  }

  return "border-yellow-500/20 bg-yellow-500/10";
}

export default function AlertCenter({
  blocks,
}: AlertCenterProps) {
  const alerts = generateAlerts(blocks);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.30em] text-brand-cyan">
            Central operacional
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            Alertas Inteligentes
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-petrol px-5 py-3">
          <p className="text-sm text-slate-400">
            Alertas ativos
          </p>

          <p className="mt-1 text-3xl font-black text-white">
            {alerts.length}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-3xl border p-5 ${getAlertStyle(
              alert.severidade
            )}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  {alert.tipo}
                </p>

                <p className="mt-2 text-slate-300">
                  {alert.mensagem}
                </p>
              </div>

              <div className="rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-white">
                {alert.severidade}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}