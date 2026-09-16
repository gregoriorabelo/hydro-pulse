"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import ActionsMenu from "@/components/ActionsMenu";
import { Field, SelectField } from "@/components/FormField";
import { useCondominiumContext } from "@/lib/condominium-context";
import {
  CONDOMINIUM_ROLE_LABELS,
  type CondominiumRole,
  type GlobalRole,
  type User,
  type UserInput,
} from "@/types/entities";

const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  admin: "Administrador",
  operador: "Operador",
};

const CONDOMINIUM_ROLES: CondominiumRole[] = ["admin", "sindico", "operador", "visualizador"];

type FormState = {
  name: string;
  email: string;
  password: string;
  role: GlobalRole;
  condominiums: Record<string, CondominiumRole>;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  role: "operador",
  condominiums: {},
};

export default function UsuariosPage() {
  const { condominiums } = useCondominiumContext();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadUsers() {
    fetch("/api/users")
      .then(async (response) => {
        if (response.status === 403) {
          setForbidden(true);
          setLoading(false);
          return null;
        }

        return response.json();
      })
      .then((data: { users?: User[] } | null) => {
        if (!data) return;
        setUsers(data.users ?? []);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreate() {
    setEditing(null);
    setError(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setError(null);
    setForm({
      name: user.name ?? "",
      email: user.email,
      password: "",
      role: user.role,
      condominiums: Object.fromEntries(
        user.condominiums.map((c) => [c.condominiumId, c.role])
      ),
    });
    setModalOpen(true);
  }

  function toggleCondominium(condominiumId: string, checked: boolean) {
    setForm((prev) => {
      const next = { ...prev.condominiums };

      if (checked) {
        next[condominiumId] = next[condominiumId] ?? "visualizador";
      } else {
        delete next[condominiumId];
      }

      return { ...prev, condominiums: next };
    });
  }

  function setCondominiumRole(condominiumId: string, role: CondominiumRole) {
    setForm((prev) => ({
      ...prev,
      condominiums: { ...prev.condominiums, [condominiumId]: role },
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: UserInput = {
      name: form.name || null,
      email: form.email,
      role: form.role,
      condominiums: Object.entries(form.condominiums).map(([condominiumId, role]) => ({
        condominiumId,
        role,
      })),
      ...(form.password ? { password: form.password } : {}),
    };

    if (!editing && !form.password) {
      setError("A senha é obrigatória para um novo usuário.");
      setSaving(false);
      return;
    }

    const response = editing
      ? await fetch(`/api/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar o usuário.");
      return;
    }

    setModalOpen(false);
    loadUsers();
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(`Excluir o usuário "${user.email}"?`);

    if (!confirmed) return;

    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      window.alert(data?.error ?? "Não foi possível excluir o usuário.");
      return;
    }

    loadUsers();
  }

  if (forbidden) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Usuários</h1>

        <p className="mt-4 text-slate-400">
          Apenas administradores têm acesso a esta área.
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Usuários</h1>

            <p className="mt-2 text-slate-400">
              Controle quem acessa o Hydro Pulse e quais condomínios cada pessoa enxerga.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-2xl bg-brand-gold px-5 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c]"
          >
            + Novo Usuário
          </button>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
          {loading ? (
            <p className="p-8 text-slate-400">Carregando…</p>
          ) : users.length === 0 ? (
            <p className="p-8 text-slate-400">Nenhum usuário cadastrado ainda.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">E-mail</th>
                  <th className="px-6 py-4 font-medium">Papel</th>
                  <th className="px-6 py-4 font-medium">Condomínios</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">
                      {user.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {GLOBAL_ROLE_LABELS[user.role]}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {user.role === "admin" ? (
                        <span className="text-slate-500">Todos (admin)</span>
                      ) : user.condominiums.length === 0 ? (
                        <span className="text-slate-500">Nenhum</span>
                      ) : (
                        user.condominiums.map((c) => c.condominiumName).join(", ")
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu
                        actions={[
                          { label: "Editar", onClick: () => openEdit(user) },
                          {
                            label: "Excluir",
                            onClick: () => handleDelete(user),
                            danger: true,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {modalOpen && (
        <Modal
          title={editing ? "Editar Usuário" : "Novo Usuário"}
          onClose={() => setModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field
              label="Nome"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="E-mail"
                type="email"
                required
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <SelectField
                label="Papel global"
                value={GLOBAL_ROLE_LABELS[form.role]}
                options={Object.values(GLOBAL_ROLE_LABELS)}
                onChange={(label) => {
                  const role = (Object.entries(GLOBAL_ROLE_LABELS).find(
                    ([, v]) => v === label
                  )?.[0] ?? "operador") as GlobalRole;
                  setForm({ ...form, role });
                }}
              />
            </div>

            <Field
              label={editing ? "Nova senha (deixe em branco para manter)" : "Senha"}
              type="password"
              required={!editing}
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />

            {form.role === "operador" && (
              <div>
                <p className="mb-2 text-sm text-slate-400">
                  Condomínios que este usuário pode acessar
                </p>

                {condominiums.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Nenhum condomínio cadastrado ainda.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-white/10 p-4">
                    {condominiums.map((condominium) => {
                      const checked = condominium.id in form.condominiums;

                      return (
                        <div
                          key={condominium.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <label className="flex items-center gap-2 text-sm text-slate-200">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) =>
                                toggleCondominium(condominium.id, event.target.checked)
                              }
                            />
                            {condominium.name}
                          </label>

                          {checked && (
                            <select
                              value={form.condominiums[condominium.id]}
                              onChange={(event) =>
                                setCondominiumRole(
                                  condominium.id,
                                  event.target.value as CondominiumRole
                                )
                              }
                              className="rounded-xl border border-white/10 bg-brand-deep px-3 py-2 text-xs text-white outline-none focus:border-brand-cyan/50"
                            >
                              {CONDOMINIUM_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {CONDOMINIUM_ROLE_LABELS[role]}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
