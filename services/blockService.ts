import { sql } from "@/lib/db";
import type { Block } from "@/types/entities";

type Row = {
  id: string;
  condominium_id: string;
  name: string;
  created_at: string;
};

function mapRow(row: Row): Block {
  return {
    id: row.id,
    condominiumId: row.condominium_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export async function listBlocksByCondominium(condominiumId: string): Promise<Block[]> {
  const rows = (await sql`
    select * from blocks where condominium_id = ${condominiumId} order by name asc
  `) as Row[];

  return rows.map(mapRow);
}

export async function createBlock(condominiumId: string, name: string): Promise<Block> {
  const rows = (await sql`
    insert into blocks (condominium_id, name) values (${condominiumId}, ${name})
    returning *
  `) as Row[];

  return mapRow(rows[0]);
}

export async function updateBlock(id: string, name: string): Promise<Block | null> {
  const rows = (await sql`
    update blocks set name = ${name} where id = ${id}
    returning *
  `) as Row[];

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteBlock(id: string): Promise<void> {
  await sql`delete from blocks where id = ${id}`;
}
