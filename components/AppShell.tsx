"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#07111F] text-white lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0B1627] p-6 lg:block">
        <div className="rounded-3xl border border-white/10 bg-[#07111F] p-5">
          <div className="flex items-center justify-center">
            <img
              src="/images/Magnacon.png.png"
              alt="Magnacon Gestão Condominial"
              className="h-auto w-52 object-contain"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs uppercase tracking-[0.30em] text-[#D5B56B]">
              Magnacon
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Monitoramento Hídrico Inteligente
            </p>
          </div>
        </div>

        <nav className="mt-12 space-y-3 text-sm">
          {[
            "Painel",
            "Condomínios",
            "Blocos",
            "Sensores",
            "Alertas",
            "Relatórios",
            "Configurações",
          ].map((item) => (
            <button
              key={item}
              className="w-full rounded-2xl px-4 py-3 text-left text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-12 rounded-3xl border border-[#D5B56B]/20 bg-[#D5B56B]/10 p-5">
          <p className="font-semibold text-[#F4D58D]">
            Produto em desenvolvimento
          </p>

          <p className="mt-3 text-sm text-slate-300">
            Estrutura preparada para condomínios, blocos, sensores e alertas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full rounded-2xl border border-white/10 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Sair
        </button>
      </aside>

      <div className="min-w-0 flex-1 p-6 lg:p-10">
        {children}
      </div>
    </div>
  );
}