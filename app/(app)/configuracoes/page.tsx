"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/FormField";

type Me = { name: string | null; email: string; role: "admin" | "operador" };

const ROLE_LABELS: Record<Me["role"], string> = {
  admin: "Administrador",
  operador: "Operador",
};

export default function ConfiguracoesPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: Me) => {
        setMe(data);
        setName(data.name ?? "");
      });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("A confirmação de senha não confere.");
      return;
    }

    setSaving(true);

    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || null,
        currentPassword,
        ...(newPassword ? { newPassword } : {}),
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar as alterações.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  if (!me) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Configurações</h1>
        <p className="mt-4 text-slate-400">Carregando…</p>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white">Configurações</h1>
        <p className="mt-2 text-slate-400">Gerencie os dados da sua conta.</p>
      </div>

      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" value={name} onChange={setName} />

            <div>
              <label className="mb-2 block text-sm text-slate-400">E-mail</label>
              <input
                disabled
                value={me.email}
                className="w-full rounded-2xl border border-white/10 bg-brand-deep/60 px-4 py-3 text-slate-400"
              />
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Papel: <span className="text-brand-cyan">{ROLE_LABELS[me.role]}</span>
          </p>

          <hr className="border-white/10" />

          <Field
            label="Senha atual"
            type="password"
            required
            value={currentPassword}
            onChange={setCurrentPassword}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Nova senha (opcional)"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Field
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Alterações salvas com sucesso.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-brand-gold px-4 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </main>
  );
}
