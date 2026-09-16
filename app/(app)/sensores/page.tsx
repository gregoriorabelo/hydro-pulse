"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "@/components/Modal";
import ActionsMenu from "@/components/ActionsMenu";
import { Field, SelectField } from "@/components/FormField";
import { useCondominiumContext } from "@/lib/condominium-context";
import type { Block, Reservoir, Sensor, SensorInput } from "@/types/entities";

type SensorRow = Sensor & { blockName: string; reservoirName: string | null };
type ReservoirOption = Reservoir & { blockName: string };

const NO_RESERVOIR = "Nenhum";

function generateSerial() {
  const random = crypto.randomUUID().split("-")[0].toUpperCase();
  return `SN-${random}`;
}

export default function SensoresPage() {
  const { activeCondominiumId, condominiums, loading: loadingCondominiums } =
    useCondominiumContext();
  const [sensors, setSensors] = useState<SensorRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [reservoirs, setReservoirs] = useState<ReservoirOption[]>([]);
  const [loadingSensors, setLoadingSensors] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sensor | null>(null);
  const [blockName, setBlockName] = useState("");
  const [reservoirName, setReservoirName] = useState(NO_RESERVOIR);
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadData() {
    if (!activeCondominiumId) return;

    Promise.all([
      fetch(`/api/sensors?condominiumId=${activeCondominiumId}`).then((r) => r.json()),
      fetch(`/api/blocks?condominiumId=${activeCondominiumId}`).then((r) => r.json()),
      fetch(`/api/reservoirs?condominiumId=${activeCondominiumId}`).then((r) => r.json()),
    ]).then(([sensorsData, blocksData, reservoirsData]) => {
      setSensors(sensorsData.sensors ?? []);
      setBlocks(blocksData.blocks ?? []);
      setReservoirs(reservoirsData.reservoirs ?? []);
      setLoadingSensors(false);
    });
  }

  useEffect(() => {
    if (activeCondominiumId) loadData();
  }, [activeCondominiumId]);

  const reservoirsForBlock = reservoirs.filter((r) => r.blockName === blockName);

  function openCreate() {
    setEditing(null);
    setError(null);
    setBlockName(blocks[0]?.name ?? "");
    setReservoirName(NO_RESERVOIR);
    setName("");
    setSerial(generateSerial());
    setModel("");
    setModalOpen(true);
  }

  function openEdit(sensor: SensorRow) {
    setEditing(sensor);
    setError(null);
    setBlockName(sensor.blockName);
    setReservoirName(sensor.reservoirName ?? NO_RESERVOIR);
    setName(sensor.name);
    setSerial(sensor.serial);
    setModel(sensor.model ?? "");
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const block = blocks.find((b) => b.name === blockName);
    const reservoir = reservoirs.find(
      (r) => r.name === reservoirName && r.blockName === blockName
    );

    if (!block) {
      setError("Selecione um bloco válido.");
      setSaving(false);
      return;
    }

    const payload: SensorInput = {
      blockId: block.id,
      reservoirId: reservoir?.id ?? null,
      name,
      serial,
      model: model || null,
    };

    const response = editing
      ? await fetch(`/api/sensors/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/sensors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar o sensor.");
      return;
    }

    setModalOpen(false);
    loadData();
  }

  async function handleDelete(sensor: SensorRow) {
    const confirmed = window.confirm(`Excluir o sensor "${sensor.name}"?`);

    if (!confirmed) return;

    await fetch(`/api/sensors/${sensor.id}`, { method: "DELETE" });
    loadData();
  }

  if (!loadingCondominiums && condominiums.length === 0) {
    return (
      <main>
        <h1 className="text-4xl font-black text-white">Sensores</h1>

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
            <h1 className="text-4xl font-black text-white">Sensores</h1>

            <p className="mt-2 text-slate-400">
              Dispositivos físicos que enviam leituras para os reservatórios.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={blocks.length === 0}
            className="rounded-2xl bg-brand-gold px-5 py-3 font-semibold text-brand-deep transition hover:bg-[#e0c15c] disabled:opacity-60"
            title={blocks.length === 0 ? "Cadastre um bloco primeiro" : undefined}
          >
            + Novo Sensor
          </button>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-white/[0.03]">
          {loadingSensors ? (
            <p className="p-8 text-slate-400">Carregando…</p>
          ) : sensors.length === 0 ? (
            <p className="p-8 text-slate-400">
              Nenhum sensor cadastrado para este condomínio ainda.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">Bloco</th>
                  <th className="px-6 py-4 font-medium">Reservatório</th>
                  <th className="px-6 py-4 font-medium">Número de série</th>
                  <th className="px-6 py-4 font-medium">Modelo</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {sensors.map((sensor) => (
                  <tr key={sensor.id} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 font-semibold text-white">{sensor.name}</td>
                    <td className="px-6 py-4 text-slate-300">{sensor.blockName}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {sensor.reservoirName ?? (
                        <span className="text-slate-500">Não vinculado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-brand-cyan">
                      {sensor.serial}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{sensor.model || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu
                        actions={[
                          { label: "Editar", onClick: () => openEdit(sensor) },
                          {
                            label: "Excluir",
                            onClick: () => handleDelete(sensor),
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
          title={editing ? "Editar Sensor" : "Novo Sensor"}
          onClose={() => setModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Nome" required value={name} onChange={setName} />

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Bloco"
                value={blockName}
                options={blocks.map((b) => b.name)}
                onChange={(v) => {
                  setBlockName(v);
                  setReservoirName(NO_RESERVOIR);
                }}
              />
              <SelectField
                label="Reservatório (opcional)"
                value={reservoirName}
                options={[NO_RESERVOIR, ...reservoirsForBlock.map((r) => r.name)]}
                onChange={setReservoirName}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Número de série
              </label>

              <div className="flex gap-2">
                <input
                  required
                  value={serial}
                  onChange={(event) => setSerial(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-brand-deep px-4 py-3 font-mono text-white outline-none focus:border-brand-cyan/50"
                />

                <button
                  type="button"
                  onClick={() => setSerial(generateSerial())}
                  className="shrink-0 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Gerar
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                É esse valor que o sensor deve enviar no campo{" "}
                <code>sensor_id</code> do corpo da requisição a{" "}
                <code>POST /api/readings</code> (junto com o header{" "}
                <code>x-api-key</code>).
              </p>
            </div>

            <Field label="Modelo (opcional)" value={model} onChange={setModel} />

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
