import { sql } from "@/lib/db";
import type { CondominiumContact, CondominiumContactInput } from "@/types/entities";

type Row = {
  id: string;
  condominium_id: string;
  name: string;
  phone_number: string;
  created_at: string;
};

function mapRow(row: Row): CondominiumContact {
  return {
    id: row.id,
    condominiumId: row.condominium_id,
    name: row.name,
    phoneNumber: row.phone_number,
    createdAt: row.created_at,
  };
}

export async function listContactsByCondominium(
  condominiumId: string
): Promise<CondominiumContact[]> {
  const rows = (await sql`
    select * from condominium_contacts
    where condominium_id = ${condominiumId}
    order by name asc
  `) as Row[];

  return rows.map(mapRow);
}

export async function createContact(
  condominiumId: string,
  data: CondominiumContactInput
): Promise<CondominiumContact> {
  const rows = (await sql`
    insert into condominium_contacts (condominium_id, name, phone_number)
    values (${condominiumId}, ${data.name}, ${data.phoneNumber})
    returning *
  `) as Row[];

  return mapRow(rows[0]);
}

export async function deleteContact(id: string): Promise<void> {
  await sql`delete from condominium_contacts where id = ${id}`;
}
