"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível redefinir a senha.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.replace("/login"), 2000);
  }

  if (!token) {
    return (
      <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Link inválido. Peça um novo link em{" "}
        <Link href="/esqueci-senha" className="underline">
          Esqueci minha senha
        </Link>
        .
      </p>
    );
  }

  if (success) {
    return (
      <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        Senha redefinida com sucesso. Redirecionando para o login...
      </p>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-slate-400">
          Nova senha
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

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm text-slate-400">
          Confirmar nova senha
        </label>

        <input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
        {submitting ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}

export default function ResetSenhaPage() {
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

          <p className="mt-4 text-slate-400">Escolha sua nova senha.</p>
        </div>

        <Suspense fallback={<p className="text-slate-400">Carregando...</p>}>
          <ResetSenhaForm />
        </Suspense>
      </div>
    </div>
  );
}
