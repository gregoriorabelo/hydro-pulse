"use client";

import { useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import ActionsMenu from "@/components/ActionsMenu";
import { Field, NumberField } from "@/components/FormField";
import { useCondominiumContext } from "@/lib/condominium-context";
import { formatCNPJ, formatPhone } from "@/lib/masks";
import type { Condominium, CondominiumInput } from "@/types/entities";

const EMPTY_FORM: CondominiumInput = {
  name: "",
  city: "",
  cnpj: "",
  phone: "",
  responsibleName: "",
  address: "",
  blocksExpected: null,
  unitsExpected: null,
  reservoirsExpected: null,
};

export default function CondominiosPage() {
  const { condominiums, refresh } = useCondominiumContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Condominium | null>(null);
  const [form, setForm] = useState<CondominiumInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(condominium: Condominium) {
    setEditing(condominium);
    setForm({
      name: condominium.name,
      city: condominium.city ?? "",
      cnpj: condominium.cnpj ?? "",
      phone: condominium.phone ?? "",
      responsibleName: condominium.responsibleName ?? "",
      address: condominium.address ?? "",
      blocksExpected: condominium.blocksExpected,
      unitsExpected: condominium.unitsExpected,
      reservoirsExpected: condominium.reservoirsExpected,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const url = editing ? `/api/condominiums/${editing.id}` : "/api/condominiums";
    const method = editing ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    setModalOpen(false);
    refresh();
  }

  async function handleDelete(condominium: Condominium) {
    const confirmed = window.confirm(
      `Excluir o condomínio "${condominium.name}"? Isso também remove blocos e reservatórios vinculados.`
    );

    if (!confirmed) return;

    await fetch(`/api/condominiums/${condominium.id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <>
      <main className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Condomínios</h1>

            <p className="mt-2 text-slate-400">
              Cadastre e gerencie os condomínios monitorados.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-2xl bg-brand-gold px-5 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c]"
          >
            + Novo Condomínio
          </button>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
          {condominiums.length === 0 ? (
            <p className="p-8 text-slate-400">Nenhum condomínio cadastrado ainda.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">Cidade</th>
                  <th className="px-6 py-4 font-medium">Responsável</th>
                  <th className="px-6 py-4 font-medium">Blocos previstos</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {condominiums.map((condominium) => (
                  <tr key={condominium.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">
                      {condominium.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{condominium.city || "—"}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {condominium.responsibleName || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {condominium.blocksExpected ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu
                        actions={[
                          { label: "Editar", onClick: () => openEdit(condominium) },
                          {
                            label: "Excluir",
                            onClick: () => handleDelete(condominium),
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
          title={editing ? "Editar Condomínio" : "Novo Condomínio"}
          onClose={() => setModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field
              label="Nome"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Cidade"
                value={form.city ?? ""}
                onChange={(v) => setForm({ ...form, city: v })}
              />
              <Field
                label="CNPJ"
                value={form.cnpj ?? ""}
                onChange={(v) => setForm({ ...form, cnpj: formatCNPJ(v) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Telefone"
                value={form.phone ?? ""}
                onChange={(v) => setForm({ ...form, phone: formatPhone(v) })}
              />
              <Field
                label="Responsável"
                value={form.responsibleName ?? ""}
                onChange={(v) => setForm({ ...form, responsibleName: v })}
              />
            </div>

            <Field
              label="Endereço"
              value={form.address ?? ""}
              onChange={(v) => setForm({ ...form, address: v })}
            />

            <div className="grid grid-cols-3 gap-4">
              <NumberField
                label="Blocos previstos"
                value={form.blocksExpected}
                onChange={(v) => setForm({ ...form, blocksExpected: v })}
              />
              <NumberField
                label="Unidades"
                value={form.unitsExpected}
                onChange={(v) => setForm({ ...form, unitsExpected: v })}
              />
              <NumberField
                label="Reservatórios previstos"
                value={form.reservoirsExpected}
                onChange={(v) => setForm({ ...form, reservoirsExpected: v })}
              />
            </div>

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
