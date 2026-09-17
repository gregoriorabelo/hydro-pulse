"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import ActionsMenu from "@/components/ActionsMenu";
import { Field } from "@/components/FormField";
import { useCondominiumContext } from "@/lib/condominium-context";
import { formatPhone } from "@/lib/masks";
import type { CondominiumContact } from "@/types/entities";

export default function ContatosPage() {
  const { activeCondominiumId, condominiums, loading: loadingCondominiums } =
    useCondominiumContext();
  const [contacts, setContacts] = useState<CondominiumContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadData() {
    if (!activeCondominiumId) return;

    fetch(`/api/contacts?condominiumId=${activeCondominiumId}`)
      .then((r) => r.json())
      .then((data) => {
        setContacts(data.contacts ?? []);
        setLoadingContacts(false);
      });
  }

  useEffect(() => {
    if (activeCondominiumId) loadData();
  }, [activeCondominiumId]);

  function openCreate() {
    setError(null);
    setName("");
    setPhoneNumber("");
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        condominiumId: activeCondominiumId,
        name,
        phoneNumber,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar o contato.");
      return;
    }

    setModalOpen(false);
    loadData();
  }

  async function handleDelete(contact: CondominiumContact) {
    const confirmed = window.confirm(`Remover o contato "${contact.name}"?`);

    if (!confirmed) return;

    await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
    loadData();
  }

  if (!loadingCondominiums && condominiums.length === 0) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Contatos</h1>

        <p className="mt-4 text-slate-400">Cadastre um condomínio primeiro.</p>
      </main>
    );
  }

  return (
    <>
      <main className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Contatos</h1>

            <p className="mt-2 text-slate-400">
              Números de WhatsApp que recebem alerta quando algum reservatório
              deste condomínio entra em nível crítico — mesmo sem login no
              HydroPulse.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-2xl bg-brand-gold px-5 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c]"
          >
            + Novo Contato
          </button>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
          {loadingContacts ? (
            <p className="p-8 text-slate-400">Carregando…</p>
          ) : contacts.length === 0 ? (
            <p className="p-8 text-slate-400">
              Nenhum contato cadastrado para este condomínio ainda.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">WhatsApp</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">{contact.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-brand-cyan">
                      {contact.phoneNumber}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu
                        actions={[
                          {
                            label: "Remover",
                            onClick: () => handleDelete(contact),
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
        <Modal title="Novo Contato" onClose={() => setModalOpen(false)}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Nome" required value={name} onChange={setName} />

            <Field
              label="WhatsApp (com DDD)"
              required
              value={phoneNumber}
              onChange={(v) => setPhoneNumber(formatPhone(v))}
            />

            <p className="text-xs text-slate-500">
              Ex.: (11) 91234-5678. Enquanto o número de WhatsApp do HydroPulse
              estiver em modo de teste, só recebem alerta os números cadastrados
              como destinatários de teste no Meta for Developers.
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
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
