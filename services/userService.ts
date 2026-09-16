import { hash } from "bcryptjs";
import { sql } from "@/lib/db";
import type { CondominiumRole, GlobalRole, User, UserInput } from "@/types/entities";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: GlobalRole;
  created_at: string;
};

type AccessRow = {
  user_id: string;
  condominium_id: string;
  condominium_name: string;
  role: CondominiumRole;
};

async function attachCondominiums(users: UserRow[]): Promise<User[]> {
  if (users.length === 0) return [];

  const accessRows = (await sql`
    select uc.user_id, uc.condominium_id, c.name as condominium_name, uc.role
    from user_condominiums uc
    join condominiums c on c.id = uc.condominium_id
    order by c.name asc
  `) as AccessRow[];

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    condominiums: accessRows
      .filter((row) => row.user_id === user.id)
      .map((row) => ({
        condominiumId: row.condominium_id,
        condominiumName: row.condominium_name,
        role: row.role,
      })),
  }));
}

export async function listUsers(): Promise<User[]> {
  const rows = (await sql`
    select id, name, email, role, created_at from users order by created_at asc
  `) as UserRow[];

  return attachCondominiums(rows);
}

export async function getUserById(id: string): Promise<User | null> {
  const rows = (await sql`
    select id, name, email, role, created_at from users where id = ${id}
  `) as UserRow[];

  if (!rows[0]) return null;

  const [user] = await attachCondominiums(rows);
  return user;
}

async function setUserCondominiums(
  userId: string,
  condominiums: { condominiumId: string; role: CondominiumRole }[]
) {
  await sql`delete from user_condominiums where user_id = ${userId}`;

  for (const entry of condominiums) {
    await sql`
      insert into user_condominiums (user_id, condominium_id, role)
      values (${userId}, ${entry.condominiumId}, ${entry.role})
    `;
  }
}

export async function createUser(data: UserInput): Promise<User> {
  if (!data.password) {
    throw new Error("password é obrigatório ao criar um usuário");
  }

  const passwordHash = await hash(data.password, 12);

  const rows = (await sql`
    insert into users (name, email, password_hash, role)
    values (${data.name ?? null}, ${data.email}, ${passwordHash}, ${data.role})
    returning id, name, email, role, created_at
  `) as UserRow[];

  const user = rows[0];

  await setUserCondominiums(user.id, data.condominiums);

  return (await getUserById(user.id))!;
}

export async function updateUser(id: string, data: UserInput): Promise<User | null> {
  if (data.password) {
    const passwordHash = await hash(data.password, 12);

    await sql`
      update users set
        name = ${data.name ?? null},
        email = ${data.email},
        role = ${data.role},
        password_hash = ${passwordHash}
      where id = ${id}
    `;
  } else {
    await sql`
      update users set
        name = ${data.name ?? null},
        email = ${data.email},
        role = ${data.role}
      where id = ${id}
    `;
  }

  const existing = await getUserById(id);
  if (!existing) return null;

  await setUserCondominiums(id, data.condominiums);

  return getUserById(id);
}

export async function deleteUser(id: string): Promise<void> {
  await sql`delete from users where id = ${id}`;
}
