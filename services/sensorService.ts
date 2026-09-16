import { sql } from "@/lib/db";
import type { Sensor, SensorInput } from "@/types/entities";

type Row = {
  id: string;
  block_id: string;
  reservoir_id: string | null;
  name: string;
  serial: string;
  model: string | null;
  created_at: string;
};

function mapRow(row: Row): Sensor {
  return {
    id: row.id,
    blockId: row.block_id,
    reservoirId: row.reservoir_id,
    name: row.name,
    serial: row.serial,
    model: row.model,
    createdAt: row.created_at,
  };
}

export async function listSensorsByCondominium(
  condominiumId: string
): Promise<(Sensor & { blockName: string; reservoirName: string | null })[]> {
  const rows = (await sql`
    select s.id, s.block_id, s.reservoir_id, s.name, s.serial, s.model, s.created_at,
      b.name as block_name, r.name as reservoir_name
    from sensors s
    join blocks b on b.id = s.block_id
    left join reservoirs r on r.id = s.reservoir_id
    where b.condominium_id = ${condominiumId}
    order by b.name asc, s.name asc
  `) as (Row & { block_name: string; reservoir_name: string | null })[];

  return rows.map((row) => ({
    ...mapRow(row),
    blockName: row.block_name,
    reservoirName: row.reservoir_name,
  }));
}

export async function createSensor(data: SensorInput): Promise<Sensor> {
  const rows = (await sql`
    insert into sensors (block_id, reservoir_id, name, serial, model)
    values (${data.blockId}, ${data.reservoirId ?? null}, ${data.name}, ${data.serial}, ${data.model ?? null})
    returning id, block_id, reservoir_id, name, serial, model, created_at, secret
  `) as (Row & { secret: string })[];

  const row = rows[0];

  return { ...mapRow(row), secret: row.secret };
}

export async function updateSensor(
  id: string,
  data: SensorInput
): Promise<Sensor | null> {
  const rows = (await sql`
    update sensors set
      block_id = ${data.blockId},
      reservoir_id = ${data.reservoirId ?? null},
      name = ${data.name},
      serial = ${data.serial},
      model = ${data.model ?? null}
    where id = ${id}
    returning id, block_id, reservoir_id, name, serial, model, created_at
  `) as Row[];

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteSensor(id: string): Promise<void> {
  await sql`delete from sensors where id = ${id}`;
}

export async function regenerateSensorSecret(id: string): Promise<string | null> {
  const rows = (await sql`
    update sensors set secret = encode(gen_random_bytes(24), 'hex')
    where id = ${id}
    returning secret
  `) as { secret: string }[];

  return rows[0]?.secret ?? null;
}

export async function getSensorAuth(
  serial: string
): Promise<{ reservoirId: string | null; secret: string } | null> {
  const rows = (await sql`
    select reservoir_id, secret from sensors where serial = ${serial}
  `) as { reservoir_id: string | null; secret: string }[];

  const row = rows[0];

  return row ? { reservoirId: row.reservoir_id, secret: row.secret } : null;
}
