"use client";

import React from "react";
import AppShell from "@/components/AppShell";
import MetricCard from "@/components/MetricCard";
import BlockCard from "@/components/BlockCard";
import OperationalInsights from "@/components/OperationalInsights";
import OperationalOverview from "@/components/OperationalOverview";
import AlertCenter from "@/components/AlertCenter";
import { useWaterMonitoring } from "@/hooks/useWaterMonitoring";
import { supabase } from "@/lib/supabase";

function getAverageLevel(levels: number[]) {
  if (levels.length === 0) {
    return 0;
  }

  const total = levels.reduce((sum, value) => sum + value, 0);

  return Math.round(total / levels.length);
}

export default function Home() {
  const { blocks } = useWaterMonitoring();

  React.useEffect(() => {
    async function testSupabaseConnection() {
      const { data, error } = await supabase
        .from("condominiums")
        .select("*");

      console.log("Supabase data:", data);
      console.log("Supabase error:", error);
    }

    testSupabaseConnection();
  }, []);

  const averageLevel = getAverageLevel(
    blocks.map((block) => block.nivel)
  );

  return (
    <AppShell>
      <main className="space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-[#D5B56B]/20 bg-[#D5B56B]/10 px-5 py-2 text-sm font-medium text-[#F4D58D]">
                Plataforma Magnacon Gestão Condominial
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white lg:text-7xl">
                Magnacon Smart Water
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">
                Monitoramento hídrico inteligente para condomínios com visão
                operacional, alertas preventivos e inteligência gerencial.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#1E3A5F] bg-[#021126] p-8">
              <p className="text-lg text-slate-400">
                Ambiente monitorado
              </p>

              <h2 className="mt-4 text-5xl font-black text-white">
                Condomínio Modelo
              </h2>

              <p className="mt-6 text-lg text-sky-100">
                Dados simulados em tempo real
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            titulo="Condomínios monitorados"
            valor="1"
          />

          <MetricCard
            titulo="Blocos monitorados"
            valor={blocks.length}
          />

          <MetricCard
            titulo="Sensores online"
            valor="5/6"
          />

          <MetricCard
            titulo="Alertas ativos"
            valor="0"
          />

          <MetricCard
            titulo="Nível médio geral"
            valor={`${averageLevel}%`}
          />
        </section>

        <OperationalOverview blocks={blocks} />

        <AlertCenter blocks={blocks} />

        <OperationalInsights blocks={blocks} />

        <section>
          <h2 className="text-5xl font-black text-white">
            Monitoramento dos Blocos
          </h2>

          <p className="mt-4 text-xl text-slate-400">
            Visão operacional individual por reservatório
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
              />
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}