"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  sindico: "Síndico",
  operador: "Operador",
  visualizador: "Visualizador",
};

type InviteDetails = {
  condominiumName: string;
  role: string;
  email: string;
  hasAccount: boolean;
};

function ConviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/team/invite?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          setLoadError(data?.error ?? "Não foi possível carregar o convite.");
          return;
        }

        setDetails(data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function acceptAsExisting(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const loginResponse = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: details?.email, password: loginPassword }),
    });

    if (!loginResponse.ok) {
      const data = await loginResponse.json().catch(() => null);
      setFormError(data?.error ?? "E-mail ou senha inválidos.");
      setSubmitting(false);
      return;
    }

    const acceptResponse = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    setSubmitting(false);

    if (!acceptResponse.ok) {
      const data = await acceptResponse.json().catch(() => null);
      setFormError(data?.error ?? "Não foi possível aceitar o convite.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 1500);
  }

  async function acceptAsNew(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const response = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, name }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setFormError(data?.error ?? "Não foi possível criar sua conta.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 1500);
  }

  if (!token) {
    return (
      <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Link inválido.
      </p>
    );
  }

  if (loading) {
    return <p className="text-slate-400">Carregando convite...</p>;
  }

  if (loadError || !details) {
    return (
      <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {loadError ?? "Convite não encontrado."}
      </p>
    );
  }

  if (success) {
    return (
      <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        Convite aceito! Redirecionando...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-4 text-sm text-sky-100">
        Você foi convidado para acessar o condomínio{" "}
        <strong>{details.condominiumName}</strong> no HydroPulse, como{" "}
        <strong>{ROLE_LABELS[details.role] ?? details.role}</strong>.
        <br />
        E-mail: {details.email}
      </div>

      {details.hasAccount ? (
        <form className="space-y-5" onSubmit={acceptAsExisting}>
          <p className="text-sm text-slate-400">
            Você já tem uma conta com esse e-mail — entre com sua senha pra
            aceitar o convite.
          </p>

          <div>
            <label htmlFor="loginPassword" className="mb-2 block text-sm text-slate-400">
              Senha
            </label>

            <input
              id="loginPassword"
              type="password"
              required
              autoComplete="current-password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-brand-petrol px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
            />
          </div>

          {formError && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-gold px-4 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
          >
            {submitting ? "Entrando..." : "Entrar e aceitar convite"}
          </button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={acceptAsNew}>
          <p className="text-sm text-slate-400">
            Você ainda não tem conta no HydroPulse — crie uma senha pra
            aceitar o convite.
          </p>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-slate-400">
              Nome (opcional)
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-brand-petrol px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-400">
              Criar senha
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-brand-petrol px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
            />
          </div>

          {formError && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-gold px-4 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
          >
            {submitting ? "Criando conta..." : "Criar conta e aceitar convite"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ConvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-deep p-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-10">
        <div className="mb-8 text-center">
          <img
            src="/images/hydropulse-icon.png"
            alt="HydroPulse"
            className="mx-auto h-16 w-auto object-contain"
          />

          <h1 className="mt-4 text-3xl font-black tracking-tight">
            <span className="text-white">Hydro</span>
            <span className="bg-gradient-to-r from-brand-tech to-brand-cyan bg-clip-text text-transparent">
              Pulse
            </span>
          </h1>

          <p className="mt-4 text-slate-400">Convite de acesso</p>
        </div>

        <Suspense fallback={<p className="text-slate-400">Carregando...</p>}>
          <ConviteForm />
        </Suspense>
      </div>
    </div>
  );
}
