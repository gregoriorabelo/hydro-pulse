import { sql } from "@/lib/db";
import type { Reservoir, ReservoirInput, ReservoirStatus, ReservoirType } from "@/types/entities";

type Row = {
  id: string;
  block_id: string;
  name: string;
  type: ReservoirType;
  capacity_liters: string | null;
  total_depth_cm: string | null;
  useful_height_cm: string | null;
  min_operational_volume_liters: string | null;
  critical_level_percent: string;
  attention_level_percent: string;
  reading_interval_minutes: string | null;
  expected_autonomy_hours: string | null;
  status: ReservoirStatus;
  created_at: string;
};

function toNumber(value: string | null): number | null {
  return value === null ? null : Number(value);
}

function mapRow(row: Row): Reservoir {
  return {
    id: row.id,
    blockId: row.block_id,
    name: row.name,
    type: row.type,
    capacityLiters: toNumber(row.capacity_liters),
    totalDepthCm: toNumber(row.total_depth_cm),
    usefulHeightCm: toNumber(row.useful_height_cm),
    minOperationalVolumeLiters: toNumber(row.min_operational_volume_liters),
    criticalLevelPercent: Number(row.critical_level_percent),
    attentionLevelPercent: Number(row.attention_level_percent),
    readingIntervalMinutes: toNumber(row.reading_interval_minutes),
    expectedAutonomyHours: toNumber(row.expected_autonomy_hours),
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listReservoirsByCondominium(
  condominiumId: string
): Promise<(Reservoir & { blockName: string })[]> {
  const rows = (await sql`
    select r.*, b.name as block_name
    from reservoirs r
    join blocks b on b.id = r.block_id
    where b.condominium_id = ${condominiumId}
    order by b.name asc, r.name asc
  `) as (Row & { block_name: string })[];

  return rows.map((row) => ({ ...mapRow(row), blockName: row.block_name }));
}

export async function createReservoir(
  blockId: string,
  data: ReservoirInput
): Promise<Reservoir> {
  const rows = (await sql`
    insert into reservoirs (
      block_id, name, type, capacity_liters, total_depth_cm, useful_height_cm,
      min_operational_volume_liters, critical_level_percent, attention_level_percent,
      reading_interval_minutes, expected_autonomy_hours
    ) values (
      ${blockId}, ${data.name}, ${data.type},
      ${data.capacityLiters ?? null}, ${data.totalDepthCm ?? null}, ${data.usefulHeightCm ?? null},
      ${data.minOperationalVolumeLiters ?? null},
      ${data.criticalLevelPercent ?? 35}, ${data.attentionLevelPercent ?? 60},
      ${data.readingIntervalMinutes ?? null}, ${data.expectedAutonomyHours ?? null}
    )
    returning *
  `) as Row[];

  return mapRow(rows[0]);
}

export async function updateReservoir(
  id: string,
  data: ReservoirInput
): Promise<Reservoir | null> {
  const rows = (await sql`
    update reservoirs set
      name = ${data.name},
      type = ${data.type},
      capacity_liters = ${data.capacityLiters ?? null},
      total_depth_cm = ${data.totalDepthCm ?? null},
      useful_height_cm = ${data.usefulHeightCm ?? null},
      min_operational_volume_liters = ${data.minOperationalVolumeLiters ?? null},
      critical_level_percent = ${data.criticalLevelPercent ?? 35},
      attention_level_percent = ${data.attentionLevelPercent ?? 60},
      reading_interval_minutes = ${data.readingIntervalMinutes ?? null},
      expected_autonomy_hours = ${data.expectedAutonomyHours ?? null}
    where id = ${id}
    returning *
  `) as Row[];

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function setReservoirStatus(
  id: string,
  status: ReservoirStatus
): Promise<void> {
  await sql`update reservoirs set status = ${status} where id = ${id}`;
}

export async function deleteReservoir(id: string): Promise<void> {
  await sql`delete from reservoirs where id = ${id}`;
}
