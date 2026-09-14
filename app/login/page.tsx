"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [checkingSession, setCheckingSession] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function redirectIfLoggedIn() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (ignore) return;

      if (user) {
        router.replace("/");
        return;
      }

      setCheckingSession(false);
    }

    redirectIfLoggedIn();

    return () => {
      ignore = true;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.replace("/");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07111F] text-slate-400">
        Verificando sessão...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07111F] p-6 text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-10">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.30em] text-[#D5B56B]">
            Magnacon
          </p>

          <h1 className="mt-3 text-3xl font-black text-white">
            Smart Water
          </h1>

          <p className="mt-3 text-slate-400">
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
              className="w-full rounded-2xl border border-white/10 bg-[#021126] px-4 py-3 text-white outline-none focus:border-[#D5B56B]/50"
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
              className="w-full rounded-2xl border border-white/10 bg-[#021126] px-4 py-3 text-white outline-none focus:border-[#D5B56B]/50"
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
            className="w-full rounded-2xl bg-[#D5B56B] px-4 py-3 font-semibold text-[#07111F] transition hover:bg-[#e2c583] disabled:opacity-60"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
