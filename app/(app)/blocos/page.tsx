"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import ActionsMenu from "@/components/ActionsMenu";
import { Field } from "@/components/FormField";
import { useCondominiumContext } from "@/lib/condominium-context";
import type { Block } from "@/types/entities";

export default function BlocosPage() {
  const { activeCondominiumId, condominiums, loading: loadingCondominiums } =
    useCondominiumContext();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Block | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  function loadBlocks() {
    if (!activeCondominiumId) return;

    fetch(`/api/blocks?condominiumId=${activeCondominiumId}`)
      .then((response) => response.json())
      .then((data: { blocks?: Block[] }) => {
        setBlocks(data.blocks ?? []);
        setLoadingBlocks(false);
      });
  }

  useEffect(() => {
    if (activeCondominiumId) loadBlocks();
  }, [activeCondominiumId]);

  function openCreate() {
    setEditing(null);
    setName("");
    setModalOpen(true);
  }

  function openEdit(block: Block) {
    setEditing(block);
    setName(block.name);
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    if (editing) {
      await fetch(`/api/blocks/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } else {
      await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condominiumId: activeCondominiumId, name }),
      });
    }

    setSaving(false);
    setModalOpen(false);
    loadBlocks();
  }

  async function handleDelete(block: Block) {
    const confirmed = window.confirm(
      `Excluir o bloco "${block.name}"? Isso também remove os reservatórios vinculados a ele.`
    );

    if (!confirmed) return;

    await fetch(`/api/blocks/${block.id}`, { method: "DELETE" });
    loadBlocks();
  }

  if (!loadingCondominiums && condominiums.length === 0) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Blocos</h1>

        <p className="mt-4 text-slate-400">
          Cadastre um condomínio primeiro para poder criar blocos.
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Blocos</h1>

            <p className="mt-2 text-slate-400">
              Subdivisões físicas do condomínio ativo (torres, edifícios ou setores).
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={!activeCondominiumId}
            className="rounded-2xl bg-brand-gold px-5 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
          >
            + Novo Bloco
          </button>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
          {loadingBlocks ? (
            <p className="p-8 text-slate-400">Carregando…</p>
          ) : blocks.length === 0 ? (
            <p className="p-8 text-slate-400">
              Nenhum bloco cadastrado para este condomínio ainda.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {blocks.map((block) => (
                  <tr key={block.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">{block.name}</td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu
                        actions={[
                          { label: "Editar", onClick: () => openEdit(block) },
                          {
                            label: "Excluir",
                            onClick: () => handleDelete(block),
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
          title={editing ? "Editar Bloco" : "Novo Bloco"}
          onClose={() => setModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Nome" required value={name} onChange={setName} />

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
