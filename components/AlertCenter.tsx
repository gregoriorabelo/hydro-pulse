import type { WaterBlock } from "@/types/block";

type AlertCenterProps = {
  blocks: WaterBlock[];
};

function generateAlerts(blocks: WaterBlock[]) {
  return blocks.flatMap((block) => {
    const alerts = [];

    if (block.atualizacao === "Sem sinal") {
      alerts.push({
        tipo: "Sensor offline",
        severidade: "Crítico",
        mensagem: `Bloco ${block.id} está sem comunicação.`,
      });
    }

    if (block.nivel <= 35) {
      alerts.push({
        tipo: "Baixo nível",
        severidade: "Crítico",
        mensagem: `Reservatório do bloco ${block.id} abaixo de 35%.`,
      });
    }

    if (block.nivel > 35 && block.nivel <= 60) {
      alerts.push({
        tipo: "Atenção operacional",
        severidade: "Atenção",
        mensagem: `Consumo elevado detectado no bloco ${block.id}.`,
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
          <p className="text-sm uppercase tracking-[0.30em] text-[#D5B56B]">
            Central operacional
          </p>

          <h2 className="mt-4 text-5xl font-black text-white">
            Alertas Inteligentes
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#021126] px-5 py-3">
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