"use client";

import React from "react";
import AppShell from "@/components/AppShell";
import BlockCard from "@/components/BlockCard";
import OperationalInsights from "@/components/OperationalInsights";
import OperationalOverview from "@/components/OperationalOverview";
import AlertCenter from "@/components/AlertCenter";
import { useWaterMonitoring } from "@/hooks/useWaterMonitoring";
import { supabase } from "@/lib/supabase";

function getAverageLevel(levels: number[]) {
  if (levels.length === 0) return 0;

  const total = levels.reduce((sum, value) => sum + value, 0);
  return Math.round(total / levels.length);
}

export default function Home() {
  const { blocks } = useWaterMonitoring();

  React.useEffect(() => {
    async function protectPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
      }
    }

    protectPage();
  }, []);

  const averageLevel = getAverageLevel(blocks.map((block) => block.nivel));
  const activeAlerts = blocks.filter((block) => block.status !== "Normal").length;

  return (
    <AppShell>
      <main className="space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#06162A] p-10 shadow-2xl shadow-black/30">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute bottom-0 left-0 h-40 w-full bg-[radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.35),transparent_45%)]" />
            <div className="absolute bottom-0 right-0 h-40 w-full bg-[radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_45%)]" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <div className="mb-7 inline-flex rounded-2xl border border-[#D5B56B]/40 bg-[#D5B56B]/10 px-5 py-2 text-sm font-semibold text-[#F4C542]">
                Plataforma Magnacon Gestão Condominial
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white lg:text-6xl">
                Magnacon Smart Water
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">
                Monitoramento hídrico inteligente para condomínios com visão
                operacional, alertas preventivos e inteligência gerencial.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#041225]/80 p-8 shadow-xl">
              <p className="text-xl text-slate-400">Ambiente monitorado</p>

              <h2 className="mt-6 text-4xl font-black text-white">
                Condomínio Modelo
              </h2>

              <p className="mt-6 flex items-center gap-2 text-lg text-sky-100">
                Dados conectados ao Supabase
                <span className="text-emerald-400">✓</span>
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[1.7rem] border border-white/10 bg-[#07182D] p-6">
            <p className="text-slate-300">Condomínios monitorados</p>
            <h3 className="mt-4 text-5xl font-black">1</h3>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-[#07182D] p-6">
            <p className="text-slate-300">Blocos monitorados</p>
            <h3 className="mt-4 text-5xl font-black">{blocks.length}</h3>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-[#07182D] p-6">
            <p className="text-slate-300">Sensores online</p>
            <h3 className="mt-4 text-5xl font-black">
              {blocks.length}/<span className="text-emerald-400">{blocks.length}</span>
            </h3>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-[#07182D] p-6">
            <p className="text-slate-300">Alertas ativos</p>
            <h3 className="mt-4 text-5xl font-black text-red-400">
              {activeAlerts}
            </h3>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-[#07182D] p-6">
            <p className="text-slate-300">Nível médio geral</p>
            <h3 className="mt-4 text-5xl font-black text-blue-400">
              {averageLevel}%
            </h3>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <OperationalOverview blocks={blocks} />
          <AlertCenter blocks={blocks} />
          <OperationalInsights blocks={blocks} />
        </section>

        <section>
          <h2 className="text-5xl font-black text-white">
            Monitoramento dos Blocos
          </h2>

          <p className="mt-4 text-xl text-slate-400">
            Visão operacional individual por reservatório
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {blocks.map((block) => (
              <BlockCard key={block.databaseId} block={block} />
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}