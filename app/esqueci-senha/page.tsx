"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar o link.");
      return;
    }

    setSent(true);
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
            Informe seu e-mail para receber um link de redefinição de senha.
          </p>
        </div>

        {sent ? (
          <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Se esse e-mail estiver cadastrado, você vai receber um link para
            redefinir a senha em instantes.
          </p>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-slate-400">
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
              {submitting ? "Enviando..." : "Enviar link de redefinição"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/login" className="text-brand-cyan hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
