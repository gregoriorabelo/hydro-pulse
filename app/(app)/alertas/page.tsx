"use client";

import { useState } from "react";
import { useWaterMonitoring } from "@/hooks/useWaterMonitoring";
import { useCondominiumContext } from "@/lib/condominium-context";
import type { WaterBlock, WaterStatus } from "@/types/block";

type Severity = "Crítico" | "Atenção" | "Sem sinal";

const SEVERITY_STATUSES: Severity[] = ["Crítico", "Atenção", "Sem sinal"];

const FILTERS: { label: string; value: Severity | "Todos" }[] = [
  { label: "Todos", value: "Todos" },
  { label: "Crítico", value: "Crítico" },
  { label: "Atenção", value: "Atenção" },
  { label: "Sem sinal", value: "Sem sinal" },
];

function severityStyle(status: WaterStatus) {
  if (status === "Crítico") return "border-red-500/20 bg-red-500/10";
  if (status === "Sem sinal") return "border-slate-500/20 bg-slate-500/10";
  return "border-yellow-500/20 bg-yellow-500/10";
}

function severityBadge(status: WaterStatus) {
  if (status === "Crítico") return "bg-red-500/20 text-red-300";
  if (status === "Sem sinal") return "bg-slate-500/20 text-slate-300";
  return "bg-yellow-500/20 text-yellow-300";
}

export default function AlertasPage() {
  const { condominiums, loading: loadingCondominiums } = useCondominiumContext();
  const { blocks, loading } = useWaterMonitoring();
  const [filter, setFilter] = useState<Severity | "Todos">("Todos");

  const alerts = blocks.filter((block) =>
    SEVERITY_STATUSES.includes(block.status as Severity)
  );

  const visibleAlerts =
    filter === "Todos" ? alerts : alerts.filter((block) => block.status === filter);

  const counts = SEVERITY_STATUSES.reduce<Record<Severity, number>>(
    (acc, severity) => {
      acc[severity] = alerts.filter((block) => block.status === severity).length;
      return acc;
    },
    { Crítico: 0, Atenção: 0, "Sem sinal": 0 }
  );

  if (!loadingCondominiums && condominiums.length === 0) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Alertas</h1>
        <p className="mt-4 text-slate-400">Cadastre um condomínio primeiro.</p>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white">Alertas</h1>
          <p className="mt-2 text-slate-400">
            Reservatórios que precisam de atenção no condomínio ativo.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[1.7rem] border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-slate-300">Crítico</p>
          <h3 className="mt-3 text-4xl font-black text-red-300">{counts["Crítico"]}</h3>
        </div>
        <div className="rounded-[1.7rem] border border-yellow-500/20 bg-yellow-500/10 p-6">
          <p className="text-slate-300">Atenção</p>
          <h3 className="mt-3 text-4xl font-black text-yellow-300">{counts["Atenção"]}</h3>
        </div>
        <div className="rounded-[1.7rem] border border-slate-500/20 bg-slate-500/10 p-6">
          <p className="text-slate-300">Sem sinal</p>
          <h3 className="mt-3 text-4xl font-black text-slate-300">{counts["Sem sinal"]}</h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              filter === item.value
                ? "bg-brand-gold text-brand-deep"
                : "border border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-400">Carregando…</p>
        ) : visibleAlerts.length === 0 ? (
          <p className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-slate-400">
            Nenhum alerta ativo{filter !== "Todos" ? ` na categoria "${filter}"` : ""} no
            momento.
          </p>
        ) : (
          visibleAlerts.map((block: WaterBlock) => (
            <div
              key={block.databaseId}
              className={`rounded-3xl border p-6 ${severityStyle(block.status)}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {block.id}{" "}
                    <span className="font-normal text-slate-400">
                      · Bloco {block.blockName}
                    </span>
                  </p>
                  <p className="mt-2 text-slate-300">{block.alerta}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Nível atual: {block.nivel}% · Atualizado às {block.atualizacao}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${severityBadge(
                    block.status
                  )}`}
                >
                  {block.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
