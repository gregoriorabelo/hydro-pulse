import type { WaterBlock, WaterStatus } from "@/types/block";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BlockCardProps = {
  block: WaterBlock;
};

function getStatusStyle(status: WaterStatus) {
  const styles = {
    Normal: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    Atenção: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    Crítico: "border-red-500/20 bg-red-500/10 text-red-300",
    "Sem sinal": "border-slate-500/20 bg-slate-500/10 text-slate-300",
    Pausado: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    Reabastecendo: "border-brand-tech/20 bg-brand-tech/10 text-brand-cyan",
  };

  return styles[status];
}

export default function BlockCard({ block }: BlockCardProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400">Bloco {block.blockName}</p>

          <h3 className="mt-2 text-5xl font-black text-white">
            {block.id}
          </h3>
        </div>

        <div
          className={`rounded-full border px-5 py-2 text-lg font-semibold ${getStatusStyle(
            block.status
          )}`}
        >
          {block.status}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-brand-petrol p-5">
          <p className="text-slate-400">Nível atual</p>

          <h4 className="mt-4 text-5xl font-black text-white">
            {block.nivel}%
          </h4>
        </div>

        <div className="rounded-3xl bg-brand-petrol p-5">
          <p className="text-slate-400">Profundidade</p>

          <h4 className="mt-4 text-5xl font-black text-white">
            {block.profundidade} cm
          </h4>
        </div>
      </div>

      <div className="mt-6 h-56 rounded-3xl bg-brand-petrol p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={block.historico}>
            <defs>
              <linearGradient
                id={`water-gradient-${block.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#00B8FF" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00B8FF" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="hora"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "#0B1220",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                color: "#fff",
              }}
            />

            <Area
              type="monotone"
              dataKey="valor"
              stroke="#00B8FF"
              strokeWidth={3}
              fill={`url(#water-gradient-${block.id})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 rounded-3xl bg-brand-petrol p-5">
        <p className="text-slate-400">Autonomia estimada</p>

        <h4 className="mt-3 text-3xl font-bold text-white">
          {block.autonomia}
        </h4>

        <p className="mt-4 text-slate-500">
          Última atualização: {block.atualizacao}
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-brand-tech/20 bg-brand-tech/10 p-5">
        <p className="font-semibold text-brand-cyan">
          Alerta Operacional
        </p>

        <p className="mt-3 text-slate-200">{block.alerta}</p>
      </div>
    </div>
  );
}