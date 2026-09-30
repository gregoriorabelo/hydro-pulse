"use client";

import { useState } from "react";
import type { WaterBlock, WaterStatus } from "@/types/block";
import type { ReservoirPeakUsage } from "@/lib/peakUsage";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Modal from "@/components/Modal";

type BlockCardProps = {
  block: WaterBlock;
  peak?: ReservoirPeakUsage;
};

function getStatusStyle(status: WaterStatus) {
  const styles = {
    Normal: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    Atenção: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
    Crítico: "border-red-500/20 bg-red-500/10 text-red-300",
    "Sem sinal": "border-slate-500/20 bg-slate-500/10 text-slate-300",
    Pausado: "border-slate-500/20 bg-slate-500/10 text-slate-400",
    Reabastecendo: "border-brand-tech/20 bg-brand-tech/10 text-brand-cyan",
    Transbordamento: "border-orange-500/20 bg-orange-500/10 text-orange-300",
  };

  return styles[status];
}

function WaterHistoryChart({
  block,
  height,
  compact = false,
}: {
  block: WaterBlock;
  height: number;
  compact?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
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

        {!compact && <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />}

        <XAxis
          dataKey="hora"
          tick={compact ? false : { fill: "#94A3B8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          hide={compact}
        />

        <YAxis
          domain={[0, 100]}
          tick={compact ? false : { fill: "#94A3B8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          hide={compact}
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
          strokeWidth={compact ? 2 : 3}
          fill={`url(#water-gradient-${block.id})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function BlockCard({ block, peak }: BlockCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-slate-400">Bloco {block.blockName}</p>

          <h3 className="mt-1 text-2xl font-black text-white">
            {block.id}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusStyle(
              block.status
            )}`}
          >
            {block.status}
          </div>

          <p className="text-sm text-slate-400">
            Nível: <span className="font-semibold text-white">{block.nivel}%</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="group mt-4 block w-full rounded-2xl bg-brand-petrol p-3 text-left transition hover:ring-2 hover:ring-brand-cyan/40"
        aria-label={`Ver detalhes completos de ${block.id}`}
      >
        <div className="h-24">
          <WaterHistoryChart block={block} height={96} compact />
        </div>

        <p className="mt-2 text-center text-xs text-slate-400 transition group-hover:text-brand-cyan">
          Clique para ver todas as informações
        </p>
      </button>

      {detailsOpen && (
        <Modal
          title={`Detalhes — ${block.id}`}
          onClose={() => setDetailsOpen(false)}
          maxWidthClassName="max-w-4xl"
        >
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="text-slate-400">Bloco {block.blockName}</span>

            <span
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusStyle(
                block.status
              )}`}
            >
              {block.status}
            </span>

            <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-slate-300">
              Tendência: {block.tendencia}
            </span>
          </div>

          <div className="h-80 rounded-3xl bg-brand-deep p-4">
            <WaterHistoryChart block={block} height={320} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-brand-deep p-5">
              <p className="text-slate-400">Nível atual</p>
              <h4 className="mt-2 text-3xl font-black text-white">{block.nivel}%</h4>
            </div>

            <div className="rounded-3xl bg-brand-deep p-5">
              <p className="text-slate-400">Profundidade</p>
              <h4 className="mt-2 text-3xl font-black text-white">
                {block.profundidade !== null ? `${block.profundidade} cm` : "—"}
              </h4>
            </div>

            <div className="rounded-3xl bg-brand-deep p-5">
              <p className="text-slate-400">Autonomia estimada</p>
              <h4 className="mt-2 text-2xl font-bold text-white">{block.autonomia}</h4>
            </div>

            <div className="rounded-3xl bg-brand-deep p-5">
              <p className="text-slate-400">Última atualização</p>
              <h4 className="mt-2 text-2xl font-bold text-white">{block.atualizacao}</h4>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-brand-tech/20 bg-brand-tech/10 p-5">
            <p className="font-semibold text-brand-cyan">Alerta Operacional</p>
            <p className="mt-3 text-slate-200">{block.alerta}</p>
          </div>

          {peak && (
            <div className="mt-6 rounded-3xl bg-brand-deep p-5">
              <p className="text-slate-400">Pico de uso (últimos 7 dias)</p>

              {peak.peakHourLabel === null ? (
                <p className="mt-2 text-lg text-slate-300">
                  Sem consumo detectado no período.
                </p>
              ) : (
                <>
                  <h4 className="mt-2 text-2xl font-bold text-white">
                    {peak.peakHourLabel} — queda de {peak.peakConsumptionPercent}%
                    {peak.peakConsumptionLiters !== null &&
                      ` (≈${peak.peakConsumptionLiters} L)`}
                  </h4>

                  <p className="mt-2 text-slate-500">
                    Consumo total no período:{" "}
                    {peak.totalConsumptionPercent}%
                    {peak.totalConsumptionLiters !== null &&
                      ` (≈${peak.totalConsumptionLiters} L)`}
                  </p>
                </>
              )}
            </div>
          )}

          {block.historico.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 font-semibold text-white">Histórico de leituras</p>

              <div className="max-h-64 overflow-y-auto rounded-3xl bg-brand-deep">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-brand-deep">
                    <tr className="text-slate-400">
                      <th className="p-4 font-medium">Horário</th>
                      <th className="p-4 font-medium">Nível</th>
                    </tr>
                  </thead>

                  <tbody>
                    {block.historico.map((point, index) => (
                      <tr key={`${point.hora}-${index}`} className="border-t border-white/5">
                        <td className="p-4 text-slate-300">{point.hora}</td>
                        <td className="p-4 text-white">{point.valor}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}