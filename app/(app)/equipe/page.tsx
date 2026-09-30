"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import ActionsMenu from "@/components/ActionsMenu";
import { Field, SelectField } from "@/components/FormField";
import { useCondominiumContext } from "@/lib/condominium-context";
import { CONDOMINIUM_ROLE_LABELS, type CondominiumRole } from "@/types/entities";

type TeamMember = {
  userId: string;
  name: string | null;
  email: string;
  role: CondominiumRole;
};

const INVITABLE_ROLES: CondominiumRole[] = ["sindico", "operador", "visualizador"];
const INVITABLE_ROLE_LABELS: Record<CondominiumRole, string> = CONDOMINIUM_ROLE_LABELS;

export default function EquipePage() {
  const { activeCondominiumId, condominiums, loading: loadingCondominiums } =
    useCondominiumContext();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [invitedCount, setInvitedCount] = useState(0);
  const [maxInvited, setMaxInvited] = useState(2);
  const [canManage, setCanManage] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CondominiumRole>("operador");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadData() {
    if (!activeCondominiumId) return;

    fetch(`/api/team?condominiumId=${activeCondominiumId}`)
      .then((r) => r.json())
      .then((data) => {
        setTeam(data.team ?? []);
        setInvitedCount(data.invitedCount ?? 0);
        setMaxInvited(data.maxInvited ?? 2);
        setCanManage(Boolean(data.canManage));
        setLoadingTeam(false);
      });
  }

  useEffect(() => {
    if (activeCondominiumId) loadData();
  }, [activeCondominiumId]);

  function openInvite() {
    setError(null);
    setEmail("");
    setRole("operador");
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condominiumId: activeCondominiumId, email, role }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível convidar esse usuário.");
      return;
    }

    setModalOpen(false);
    loadData();
  }

  async function handleRemove(member: TeamMember) {
    const confirmed = window.confirm(
      `Remover "${member.name || member.email}" deste condomínio?`
    );

    if (!confirmed) return;

    const response = await fetch(
      `/api/team?condominiumId=${activeCondominiumId}&userId=${member.userId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      window.alert(data?.error ?? "Não foi possível remover esse usuário.");
      return;
    }

    loadData();
  }

  if (!loadingCondominiums && condominiums.length === 0) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Equipe</h1>
        <p className="mt-4 text-slate-400">Cadastre um condomínio primeiro.</p>
      </main>
    );
  }

  const slotsLeft = Math.max(0, maxInvited - invitedCount);

  return (
    <>
      <main className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Equipe</h1>

            <p className="mt-2 text-slate-400">
              Pessoas com acesso a este condomínio no HydroPulse.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openInvite}
              disabled={slotsLeft === 0}
              className="rounded-2xl bg-brand-gold px-5 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Convidar pessoa
            </button>
          )}
        </div>

        {canManage && (
          <p className="text-sm text-slate-400">
            {slotsLeft} de {maxInvited} vaga(s) adicional(is) disponível(is) neste
            condomínio.
          </p>
        )}

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
          {loadingTeam ? (
            <p className="p-8 text-slate-400">Carregando…</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">E-mail</th>
                  <th className="px-6 py-4 font-medium">Papel</th>
                  {canManage && <th className="px-6 py-4"></th>}
                </tr>
              </thead>

              <tbody>
                {team.map((member) => (
                  <tr key={member.userId} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">
                      {member.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{member.email}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {CONDOMINIUM_ROLE_LABELS[member.role]}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        {member.role !== "admin" && (
                          <ActionsMenu
                            actions={[
                              {
                                label: "Remover",
                                onClick: () => handleRemove(member),
                                danger: true,
                              },
                            ]}
                          />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modalOpen && (
        <Modal title="Convidar pessoa" onClose={() => setModalOpen(false)}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={setEmail}
            />

            <SelectField
              label="Papel neste condomínio"
              value={INVITABLE_ROLE_LABELS[role]}
              options={INVITABLE_ROLES.map((r) => INVITABLE_ROLE_LABELS[r])}
              onChange={(label) => {
                const found = INVITABLE_ROLES.find(
                  (r) => INVITABLE_ROLE_LABELS[r] === label
                );
                setRole(found ?? "operador");
              }}
            />

            <p className="text-xs text-slate-500">
              Se o e-mail já tiver uma conta no HydroPulse, só liberamos o
              acesso a este condomínio. Se for novo, enviamos um link para a
              pessoa definir a própria senha.
            </p>

            {error && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-brand-gold px-4 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
            >
              {saving ? "Enviando..." : "Convidar"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
