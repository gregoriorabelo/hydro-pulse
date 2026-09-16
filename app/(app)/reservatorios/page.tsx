"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import ActionsMenu from "@/components/ActionsMenu";
import { Field, NumberField, SelectField } from "@/components/FormField";
import { useCondominiumContext } from "@/lib/condominium-context";
import type { Block, Reservoir, ReservoirInput, ReservoirType } from "@/types/entities";

const RESERVOIR_TYPES: ReservoirType[] = ["Superior", "Inferior", "Cisterna", "Reúso"];

const EMPTY_FORM: ReservoirInput = {
  name: "",
  type: "Superior",
  capacityLiters: null,
  totalDepthCm: null,
  usefulHeightCm: null,
  minOperationalVolumeLiters: null,
  criticalLevelPercent: 35,
  attentionLevelPercent: 60,
  readingIntervalMinutes: null,
  expectedAutonomyHours: null,
};

type ReservoirRow = Reservoir & { blockName: string };

export default function ReservatoriosPage() {
  const { activeCondominiumId, condominiums, loading: loadingCondominiums } =
    useCondominiumContext();
  const [reservoirs, setReservoirs] = useState<ReservoirRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loadingReservoirs, setLoadingReservoirs] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reservoir | null>(null);
  const [blockId, setBlockId] = useState("");
  const [form, setForm] = useState<ReservoirInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadData() {
    if (!activeCondominiumId) return;

    Promise.all([
      fetch(`/api/reservoirs?condominiumId=${activeCondominiumId}`).then((r) => r.json()),
      fetch(`/api/blocks?condominiumId=${activeCondominiumId}`).then((r) => r.json()),
    ]).then(([reservoirsData, blocksData]) => {
      setReservoirs(reservoirsData.reservoirs ?? []);
      setBlocks(blocksData.blocks ?? []);
      setLoadingReservoirs(false);
    });
  }

  useEffect(() => {
    if (activeCondominiumId) loadData();
  }, [activeCondominiumId]);

  function openCreate() {
    setEditing(null);
    setBlockId(blocks[0]?.id ?? "");
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(reservoir: ReservoirRow) {
    setEditing(reservoir);
    setBlockId(reservoir.blockId);
    setForm({
      name: reservoir.name,
      type: reservoir.type,
      capacityLiters: reservoir.capacityLiters,
      totalDepthCm: reservoir.totalDepthCm,
      usefulHeightCm: reservoir.usefulHeightCm,
      minOperationalVolumeLiters: reservoir.minOperationalVolumeLiters,
      criticalLevelPercent: reservoir.criticalLevelPercent,
      attentionLevelPercent: reservoir.attentionLevelPercent,
      readingIntervalMinutes: reservoir.readingIntervalMinutes,
      expectedAutonomyHours: reservoir.expectedAutonomyHours,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    if (editing) {
      await fetch(`/api/reservoirs/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/reservoirs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, ...form }),
      });
    }

    setSaving(false);
    setModalOpen(false);
    loadData();
  }

  async function handleDelete(reservoir: ReservoirRow) {
    const confirmed = window.confirm(`Excluir o reservatório "${reservoir.name}"?`);

    if (!confirmed) return;

    await fetch(`/api/reservoirs/${reservoir.id}`, { method: "DELETE" });
    loadData();
  }

  async function handleToggleStatus(reservoir: ReservoirRow) {
    const nextStatus = reservoir.status === "ativo" ? "pausado" : "ativo";

    await fetch(`/api/reservoirs/${reservoir.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    loadData();
  }

  if (!loadingCondominiums && condominiums.length === 0) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Reservatórios</h1>

        <p className="mt-4 text-slate-400">
          Cadastre um condomínio e ao menos um bloco primeiro.
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Reservatórios</h1>

            <p className="mt-2 text-slate-400">
              O núcleo da inteligência hídrica: capacidade, limites e regras de cada
              reservatório.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={blocks.length === 0}
            className="rounded-2xl bg-brand-gold px-5 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
            title={blocks.length === 0 ? "Cadastre um bloco primeiro" : undefined}
          >
            + Novo Reservatório
          </button>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
          {loadingReservoirs ? (
            <p className="p-8 text-slate-400">Carregando…</p>
          ) : reservoirs.length === 0 ? (
            <p className="p-8 text-slate-400">
              Nenhum reservatório cadastrado para este condomínio ainda.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">Bloco</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Capacidade</th>
                  <th className="px-6 py-4 font-medium">Crítico / Atenção</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {reservoirs.map((reservoir) => (
                  <tr key={reservoir.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">{reservoir.name}</td>
                    <td className="px-6 py-4 text-slate-300">{reservoir.blockName}</td>
                    <td className="px-6 py-4 text-slate-300">{reservoir.type}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {reservoir.capacityLiters
                        ? `${reservoir.capacityLiters.toLocaleString("pt-BR")} L`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {reservoir.criticalLevelPercent}% / {reservoir.attentionLevelPercent}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          reservoir.status === "ativo"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-500/10 text-slate-300"
                        }`}
                      >
                        {reservoir.status === "ativo" ? "Ativo" : "Pausado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu
                        actions={[
                          { label: "Editar", onClick: () => openEdit(reservoir) },
                          {
                            label:
                              reservoir.status === "ativo"
                                ? "Pausar leitura"
                                : "Retomar leitura",
                            onClick: () => handleToggleStatus(reservoir),
                          },
                          {
                            label: "Excluir",
                            onClick: () => handleDelete(reservoir),
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
          title={editing ? "Editar Reservatório" : "Novo Reservatório"}
          onClose={() => setModalOpen(false)}
        >
          <form className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" onSubmit={handleSubmit}>
            {!editing && (
              <SelectField
                label="Bloco"
                value={blockId}
                options={blocks.map((b) => b.name)}
                onChange={(name) => {
                  const block = blocks.find((b) => b.name === name);
                  if (block) setBlockId(block.id);
                }}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Nome"
                required
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <SelectField
                label="Tipo"
                value={form.type}
                options={RESERVOIR_TYPES}
                onChange={(v) => setForm({ ...form, type: v as ReservoirType })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Capacidade total (litros)"
                value={form.capacityLiters}
                onChange={(v) => setForm({ ...form, capacityLiters: v })}
              />
              <NumberField
                label="Volume mínimo operacional (litros)"
                value={form.minOperationalVolumeLiters}
                onChange={(v) => setForm({ ...form, minOperationalVolumeLiters: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Profundidade total (cm)"
                value={form.totalDepthCm}
                onChange={(v) => setForm({ ...form, totalDepthCm: v })}
              />
              <NumberField
                label="Altura útil (cm)"
                value={form.usefulHeightCm}
                onChange={(v) => setForm({ ...form, usefulHeightCm: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Nível crítico (%)"
                value={form.criticalLevelPercent}
                onChange={(v) => setForm({ ...form, criticalLevelPercent: v ?? 35 })}
              />
              <NumberField
                label="Nível de atenção (%)"
                value={form.attentionLevelPercent}
                onChange={(v) => setForm({ ...form, attentionLevelPercent: v ?? 60 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Intervalo entre leituras (min)"
                value={form.readingIntervalMinutes}
                onChange={(v) => setForm({ ...form, readingIntervalMinutes: v })}
              />
              <NumberField
                label="Autonomia esperada (h)"
                value={form.expectedAutonomyHours}
                onChange={(v) => setForm({ ...form, expectedAutonomyHours: v })}
              />
            </div>

            <button
              type="submit"
              disabled={saving || (!editing && !blockId)}
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
