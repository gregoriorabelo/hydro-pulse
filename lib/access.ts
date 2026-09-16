import { sql } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";
import type { CondominiumRole } from "@/types/entities";

export async function getCondominiumRole(
  session: SessionPayload,
  condominiumId: string
): Promise<CondominiumRole | null> {
  if (session.role === "admin") return "admin";

  const rows = (await sql`
    select role from user_condominiums
    where user_id = ${session.userId} and condominium_id = ${condominiumId}
    limit 1
  `) as { role: CondominiumRole }[];

  return rows[0]?.role ?? null;
}

export function canWrite(role: CondominiumRole | null): boolean {
  return role === "admin" || role === "sindico" || role === "operador";
}

export async function getCondominiumIdForBlock(blockId: string): Promise<string | null> {
  const rows = (await sql`
    select condominium_id from blocks where id = ${blockId}
  `) as { condominium_id: string }[];

  return rows[0]?.condominium_id ?? null;
}

export async function getCondominiumIdForReservoir(
  reservoirId: string
): Promise<string | null> {
  const rows = (await sql`
    select b.condominium_id from reservoirs r
    join blocks b on b.id = r.block_id
    where r.id = ${reservoirId}
  `) as { condominium_id: string }[];

  return rows[0]?.condominium_id ?? null;
}

export async function getCondominiumIdForSensor(sensorId: string): Promise<string | null> {
  const rows = (await sql`
    select b.condominium_id from sensors s
    join blocks b on b.id = s.block_id
    where s.id = ${sensorId}
  `) as { condominium_id: string }[];

  return rows[0]?.condominium_id ?? null;
}
