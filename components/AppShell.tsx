"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CondominiumProvider, useCondominiumContext } from "@/lib/condominium-context";

const NAV_LINKS = [
  { href: "/", label: "Painel" },
  { href: "/condominios", label: "Condomínios" },
  { href: "/blocos", label: "Blocos" },
  { href: "/reservatorios", label: "Reservatórios" },
  { href: "/sensores", label: "Sensores" },
  { href: "/relatorios", label: "Relatórios" },
];

const ADMIN_NAV_LINKS = [{ href: "/usuarios", label: "Usuários" }];

const NAV_PLACEHOLDERS = ["Alertas", "Configurações"];

function CondominiumSelector() {
  const { condominiums, activeCondominiumId, setActiveCondominiumId, loading } =
    useCondominiumContext();

  if (loading) {
    return <p className="text-xs text-slate-500">Carregando condomínios…</p>;
  }

  if (condominiums.length === 0) {
    return (
      <Link
        href="/condominios"
        className="block rounded-2xl border border-brand-tech/20 bg-brand-tech/10 px-3 py-2 text-xs text-brand-cyan transition hover:bg-brand-tech/20"
      >
        + Cadastrar condomínio
      </Link>
    );
  }

  return (
    <select
      value={activeCondominiumId ?? ""}
      onChange={(event) => setActiveCondominiumId(event.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-brand-deep px-3 py-2 text-sm text-white outline-none focus:border-brand-cyan/50"
    >
      {condominiums.map((condominium) => (
        <option key={condominium.id} value={condominium.id}>
          {condominium.name}
        </option>
      ))}
    </select>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { role?: string } | null) => {
        setIsAdmin(data?.role === "admin");
      });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <CondominiumProvider>
      <div className="min-h-screen bg-brand-deep text-white lg:flex">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-brand-petrol p-6 lg:block">
          <div className="rounded-3xl border border-white/10 bg-brand-deep p-5">
            <div className="flex items-center justify-center">
              <img
                src="/images/hydropulse-icon.png"
                alt="HydroPulse"
                className="h-16 w-auto object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-2xl font-black tracking-tight">
                <span className="text-white">Hydro</span>
                <span className="bg-gradient-to-r from-brand-tech to-brand-cyan bg-clip-text text-transparent">
                  Pulse
                </span>
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Inteligência hídrica. Decisões em tempo real.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-brand-gray">
              Condomínio ativo
            </p>

            <CondominiumSelector />
          </div>

          <nav className="mt-8 space-y-3 text-sm">
            {[...NAV_LINKS, ...(isAdmin ? ADMIN_NAV_LINKS : [])].map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block w-full rounded-2xl px-4 py-3 text-left transition ${
                    active
                      ? "bg-brand-tech/15 text-brand-cyan"
                      : "text-slate-300 hover:bg-brand-tech/10 hover:text-brand-cyan"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {NAV_PLACEHOLDERS.map((item) => (
              <button
                key={item}
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-2xl px-4 py-3 text-left text-slate-600"
                title="Em desenvolvimento"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-12 rounded-3xl border border-brand-tech/20 bg-brand-tech/10 p-5">
            <p className="font-semibold text-brand-cyan">
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

        <div className="min-w-0 flex-1 p-6 lg:p-10">{children}</div>
      </div>
    </CondominiumProvider>
  );
}
