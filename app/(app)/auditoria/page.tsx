"use client";

import { useEffect, useState } from "react";

type AuditEntry = {
  id: string;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  create: "Criou",
  update: "Editou",
  delete: "Excluiu",
  status_change: "Mudou status",
};

const ENTITY_LABELS: Record<string, string> = {
  condominium: "condomínio",
  block: "bloco",
  reservoir: "reservatório",
  sensor: "sensor",
  user: "usuário",
};

const ACTION_STYLE: Record<string, string> = {
  create: "bg-emerald-500/20 text-emerald-300",
  update: "bg-brand-tech/20 text-brand-cyan",
  delete: "bg-red-500/20 text-red-300",
  status_change: "bg-yellow-500/20 text-yellow-300",
};

function summarize(entry: AuditEntry): string {
  const details = entry.details ?? {};
  const name = typeof details.name === "string" ? details.name : null;
  const email = typeof details.email === "string" ? details.email : null;
  const status = typeof details.status === "string" ? details.status : null;

  if (status) return `Status alterado para "${status}"`;
  if (name) return `"${name}"`;
  if (email) return email;

  return entry.entityId ?? "";
}

export default function AuditoriaPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetch("/api/audit")
      .then(async (response) => {
        if (response.status === 403) {
          setForbidden(true);
          setLoading(false);
          return null;
        }

        return response.json();
      })
      .then((data: { entries?: AuditEntry[] } | null) => {
        if (!data) return;
        setEntries(data.entries ?? []);
        setLoading(false);
      });
  }, []);

  if (forbidden) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Auditoria</h1>
        <p className="mt-4 text-slate-400">
          Apenas administradores têm acesso a esta área.
        </p>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white">Auditoria</h1>
        <p className="mt-2 text-slate-400">
          Últimas 200 alterações registradas no sistema.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
        {loading ? (
          <p className="p-8 text-slate-400">Carregando…</p>
        ) : entries.length === 0 ? (
          <p className="p-8 text-slate-400">Nenhum registro de auditoria ainda.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-sm text-slate-400">
                <th className="px-6 py-4 font-medium">Quando</th>
                <th className="px-6 py-4 font-medium">Quem</th>
                <th className="px-6 py-4 font-medium">Ação</th>
                <th className="px-6 py-4 font-medium">O quê</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(entry.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {entry.userEmail ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        ACTION_STYLE[entry.action] ?? "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {ACTION_LABELS[entry.action] ?? entry.action}{" "}
                      {ENTITY_LABELS[entry.entityType] ?? entry.entityType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{summarize(entry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
