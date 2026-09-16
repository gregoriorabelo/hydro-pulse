"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CondominiumProvider, useCondominiumContext } from "@/lib/condominium-context";

const NAV_LINKS_BEFORE_ADMIN = [
  { href: "/", label: "Painel" },
  { href: "/alertas", label: "Alertas" },
  { href: "/condominios", label: "Condomínios" },
  { href: "/blocos", label: "Blocos" },
  { href: "/reservatorios", label: "Reservatórios" },
  { href: "/sensores", label: "Sensores" },
  { href: "/relatorios", label: "Relatórios" },
];

const ADMIN_NAV_LINKS = [
  { href: "/usuarios", label: "Usuários" },
  { href: "/auditoria", label: "Auditoria" },
];

const NAV_LINKS_AFTER_ADMIN = [{ href: "/configuracoes", label: "Configurações" }];

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

type SidebarContentProps = {
  isAdmin: boolean;
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
};

function SidebarContent({ isAdmin, pathname, onNavigate, onLogout }: SidebarContentProps) {
  return (
    <>
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
        {[
          ...NAV_LINKS_BEFORE_ADMIN,
          ...(isAdmin ? ADMIN_NAV_LINKS : []),
          ...NAV_LINKS_AFTER_ADMIN,
        ].map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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
      </nav>

      <div className="mt-12 rounded-3xl border border-brand-tech/20 bg-brand-tech/10 p-5">
        <p className="font-semibold text-brand-cyan">Produto em desenvolvimento</p>

        <p className="mt-3 text-sm text-slate-300">
          Estrutura preparada para condomínios, blocos, sensores e alertas.
        </p>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full rounded-2xl border border-white/10 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        Sair
      </button>
    </>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        <header className="flex items-center justify-between border-b border-white/10 bg-brand-petrol px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <img
              src="/images/hydropulse-icon.png"
              alt="HydroPulse"
              className="h-8 w-auto object-contain"
            />
            <p className="text-lg font-black tracking-tight">
              <span className="text-white">Hydro</span>
              <span className="bg-gradient-to-r from-brand-tech to-brand-cyan bg-clip-text text-transparent">
                Pulse
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu"
            className="rounded-xl border border-white/10 p-2 text-white transition hover:bg-white/10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileNavOpen(false)}
            />

            <aside className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto border-r border-white/10 bg-brand-petrol p-6">
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Fechar menu"
                  className="rounded-xl border border-white/10 p-2 text-white transition hover:bg-white/10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <SidebarContent
                isAdmin={isAdmin}
                pathname={pathname}
                onNavigate={() => setMobileNavOpen(false)}
                onLogout={handleLogout}
              />
            </aside>
          </div>
        )}

        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-brand-petrol p-6 lg:block">
          <SidebarContent isAdmin={isAdmin} pathname={pathname} onLogout={handleLogout} />
        </aside>

        <div className="min-w-0 flex-1 p-6 lg:p-10">{children}</div>
      </div>
    </CondominiumProvider>
  );
}
