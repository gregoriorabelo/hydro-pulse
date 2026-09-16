import { sql } from "@/lib/db";
import type { Condominium, CondominiumInput } from "@/types/entities";

type Row = {
  id: string;
  name: string;
  city: string | null;
  cnpj: string | null;
  phone: string | null;
  responsible_name: string | null;
  address: string | null;
  blocks_expected: number | null;
  units_expected: number | null;
  reservoirs_expected: number | null;
  created_at: string;
};

function mapRow(row: Row): Condominium {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    cnpj: row.cnpj,
    phone: row.phone,
    responsibleName: row.responsible_name,
    address: row.address,
    blocksExpected: row.blocks_expected,
    unitsExpected: row.units_expected,
    reservoirsExpected: row.reservoirs_expected,
    createdAt: row.created_at,
  };
}

export async function listCondominiums(userId?: string): Promise<Condominium[]> {
  const rows = userId
    ? ((await sql`
        select c.* from condominiums c
        join user_condominiums uc on uc.condominium_id = c.id
        where uc.user_id = ${userId}
        order by c.name asc
      `) as Row[])
    : ((await sql`
        select * from condominiums order by name asc
      `) as Row[]);

  return rows.map(mapRow);
}

export async function createCondominium(data: CondominiumInput): Promise<Condominium> {
  const rows = (await sql`
    insert into condominiums (
      name, city, cnpj, phone, responsible_name, address,
      blocks_expected, units_expected, reservoirs_expected
    ) values (
      ${data.name}, ${data.city ?? null}, ${data.cnpj ?? null}, ${data.phone ?? null},
      ${data.responsibleName ?? null}, ${data.address ?? null},
      ${data.blocksExpected ?? null}, ${data.unitsExpected ?? null}, ${data.reservoirsExpected ?? null}
    )
    returning *
  `) as Row[];

  return mapRow(rows[0]);
}

export async function updateCondominium(
  id: string,
  data: CondominiumInput
): Promise<Condominium | null> {
  const rows = (await sql`
    update condominiums set
      name = ${data.name},
      city = ${data.city ?? null},
      cnpj = ${data.cnpj ?? null},
      phone = ${data.phone ?? null},
      responsible_name = ${data.responsibleName ?? null},
      address = ${data.address ?? null},
      blocks_expected = ${data.blocksExpected ?? null},
      units_expected = ${data.unitsExpected ?? null},
      reservoirs_expected = ${data.reservoirsExpected ?? null}
    where id = ${id}
    returning *
  `) as Row[];

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function deleteCondominium(id: string): Promise<void> {
  await sql`delete from condominiums where id = ${id}`;
}
