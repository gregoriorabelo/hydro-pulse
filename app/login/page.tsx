"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "E-mail ou senha inválidos.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

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

          <p className="mt-4 text-slate-400">
            Entre com sua conta para acessar o painel.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-slate-400"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-brand-petrol px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-slate-400"
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-brand-petrol px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-brand-gold px-4 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-slate-400">
            <Link href="/esqueci-senha" className="text-brand-cyan hover:underline">
              Esqueci minha senha
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
