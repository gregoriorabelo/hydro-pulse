"use client";

import { useState } from "react";
import { useCondominiumContext } from "@/lib/condominium-context";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultFrom() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return isoDate(date);
}

export default function RelatoriosPage() {
  const { activeCondominiumId, condominiums, loading } = useCondominiumContext();
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(isoDate(new Date()));
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCondominium = condominiums.find((c) => c.id === activeCondominiumId);

  async function handleGenerate() {
    if (!activeCondominiumId) return;

    setGenerating(true);
    setError(null);

    const response = await fetch(
      `/api/relatorios/niveis?condominiumId=${activeCondominiumId}&from=${from}&to=${to}`
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível gerar o relatório.");
      setGenerating(false);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-niveis-${from}-a-${to}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    setGenerating(false);
  }

  if (!loading && condominiums.length === 0) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Relatórios</h1>

        <p className="mt-4 text-slate-400">Cadastre um condomínio primeiro.</p>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white">Relatórios</h1>

        <p className="mt-2 text-slate-400">
          Gere relatórios em PDF com o histórico de níveis dos reservatórios.
        </p>
      </div>

      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <h2 className="text-xl font-bold text-white">Relatório de Níveis</h2>

        <p className="mt-2 text-sm text-slate-400">
          Condomínio ativo:{" "}
          <span className="text-brand-cyan">{activeCondominium?.name ?? "Nenhum"}</span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">De</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-brand-deep px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">Até</label>
            <input
              type="date"
              value={to}
              min={from}
              max={isoDate(new Date())}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-brand-deep px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!activeCondominiumId || generating}
          className="mt-6 w-full rounded-2xl bg-brand-gold px-4 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
        >
          {generating ? "Gerando PDF..." : "Gerar PDF"}
        </button>
      </div>
    </main>
  );
}
