import { sql } from "@/lib/db";

export type ReportReading = {
  recordedAt: string;
  waterLevel: number;
  depthCm: number | null;
};

export type ReportReservoir = {
  blockName: string;
  reservoirName: string;
  reservoirType: string;
  status: "ativo" | "pausado";
  criticalLevelPercent: number;
  attentionLevelPercent: number;
  capacityLiters: number | null;
  readings: ReportReading[];
};

export type NiveisReport = {
  condominiumName: string;
  from: string;
  to: string;
  reservoirs: ReportReservoir[];
};

type Row = {
  block_name: string;
  reservoir_name: string;
  reservoir_type: string;
  reservoir_status: "ativo" | "pausado";
  critical_level_percent: string;
  attention_level_percent: string;
  capacity_liters: string | null;
  water_level: string | null;
  depth_cm: string | null;
  recorded_at: string | null;
};

export async function getNiveisReport(
  condominiumId: string,
  from: string,
  to: string
): Promise<NiveisReport | null> {
  const condominiumRows = (await sql`
    select name from condominiums where id = ${condominiumId}
  `) as { name: string }[];

  const condominium = condominiumRows[0];

  if (!condominium) return null;

  const rows = (await sql`
    select
      b.name as block_name,
      r.name as reservoir_name,
      r.type as reservoir_type,
      r.status as reservoir_status,
      r.critical_level_percent,
      r.attention_level_percent,
      r.capacity_liters,
      rd.water_level,
      rd.depth_cm,
      rd.recorded_at
    from reservoirs r
    join blocks b on b.id = r.block_id
    left join readings rd
      on rd.reservoir_id = r.id
      and rd.recorded_at >= ${from}
      and rd.recorded_at <= ${to}
    where b.condominium_id = ${condominiumId}
    order by b.name asc, r.name asc, rd.recorded_at asc
  `) as Row[];

  const byReservoir = new Map<string, ReportReservoir>();

  for (const row of rows) {
    const key = `${row.block_name}::${row.reservoir_name}`;
    const entry =
      byReservoir.get(key) ??
      ({
        blockName: row.block_name,
        reservoirName: row.reservoir_name,
        reservoirType: row.reservoir_type,
        status: row.reservoir_status,
        criticalLevelPercent: Number(row.critical_level_percent),
        attentionLevelPercent: Number(row.attention_level_percent),
        capacityLiters: row.capacity_liters ? Number(row.capacity_liters) : null,
        readings: [],
      } satisfies ReportReservoir);

    if (row.recorded_at) {
      entry.readings.push({
        recordedAt: row.recorded_at,
        waterLevel: Number(row.water_level),
        depthCm: row.depth_cm ? Number(row.depth_cm) : null,
      });
    }

    byReservoir.set(key, entry);
  }

  return {
    condominiumName: condominium.name,
    from,
    to,
    reservoirs: Array.from(byReservoir.values()),
  };
}
