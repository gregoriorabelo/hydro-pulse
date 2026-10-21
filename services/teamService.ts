import { hash } from "bcryptjs";
import { sql } from "@/lib/db";
import { createTeamInviteToken, verifyTeamInviteToken } from "@/lib/teamInvite";
import { sendEmail } from "@/lib/email";
import type { CondominiumRole } from "@/types/entities";

export const MAX_INVITED_TEAM_MEMBERS = 2;
const INVITABLE_ROLES: CondominiumRole[] = ["sindico", "operador", "visualizador"];
const INVITE_DURATION_SECONDS = 7 * 24 * 60 * 60;

export function isInvitableRole(role: string): role is CondominiumRole {
  return (INVITABLE_ROLES as string[]).includes(role);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type TeamMember = {
  userId: string;
  name: string | null;
  email: string;
  role: CondominiumRole;
};

type TeamRow = {
  user_id: string;
  name: string | null;
  email: string;
  role: CondominiumRole;
};

export async function listTeam(condominiumId: string): Promise<TeamMember[]> {
  const rows = (await sql`
    select u.id as user_id, u.name, u.email, uc.role
    from user_condominiums uc
    join users u on u.id = uc.user_id
    where uc.condominium_id = ${condominiumId}
    order by (uc.role = 'admin') desc, u.email asc
  `) as TeamRow[];

  return rows.map((row) => ({
    userId: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
  }));
}

export async function countInvitedMembers(condominiumId: string): Promise<number> {
  const rows = (await sql`
    select count(*)::int as count
    from user_condominiums
    where condominium_id = ${condominiumId} and role != 'admin'
  `) as { count: number }[];

  return rows[0]?.count ?? 0;
}

export type PendingInvite = {
  id: string;
  email: string;
  role: CondominiumRole;
  expiresAt: string;
};

type PendingInviteRow = {
  id: string;
  email: string;
  role: CondominiumRole;
  expires_at: string;
};

export async function listPendingInvites(condominiumId: string): Promise<PendingInvite[]> {
  const rows = (await sql`
    select id, email, role, expires_at
    from team_invites
    where condominium_id = ${condominiumId}
      and accepted_at is null
      and expires_at > now()
    order by created_at asc
  `) as PendingInviteRow[];

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    expiresAt: row.expires_at,
  }));
}

export async function countPendingInvites(condominiumId: string): Promise<number> {
  const rows = (await sql`
    select count(*)::int as count
    from team_invites
    where condominium_id = ${condominiumId}
      and accepted_at is null
      and expires_at > now()
  `) as { count: number }[];

  return rows[0]?.count ?? 0;
}

export type CreateInviteResult = { ok: true; inviteId: string } | { ok: false; error: string };

/**
 * Cria um convite PENDENTE — não dá acesso nenhum ainda. A pessoa só
 * ganha acesso ao condomínio depois de clicar no link do e-mail e
 * aceitar explicitamente (ver acceptInviteForExistingUser /
 * acceptInviteForNewUser), essencial pra operar em grande escala sem
 * depender do admin avisar a pessoa por fora do sistema.
 */
export async function createTeamInvite(
  condominiumId: string,
  email: string,
  role: CondominiumRole,
  invitedByUserId: string,
  appUrl: string
): Promise<CreateInviteResult> {
  if (!isInvitableRole(role)) {
    return { ok: false, error: "Papel inválido para convite." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "E-mail inválido." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [activeCount, pendingCount] = await Promise.all([
    countInvitedMembers(condominiumId),
    countPendingInvites(condominiumId),
  ]);

  if (activeCount + pendingCount >= MAX_INVITED_TEAM_MEMBERS) {
    return {
      ok: false,
      error: `Este condomínio já atingiu o limite de ${MAX_INVITED_TEAM_MEMBERS} usuários adicionais (contando convites pendentes).`,
    };
  }

  const condominiumRows = (await sql`
    select name from condominiums where id = ${condominiumId}
  `) as { name: string }[];

  const condominiumName = condominiumRows[0]?.name ?? "seu condomínio";

  const alreadyLinkedRows = (await sql`
    select 1 from user_condominiums uc
    join users u on u.id = uc.user_id
    where uc.condominium_id = ${condominiumId} and lower(u.email) = ${normalizedEmail}
  `) as unknown[];

  if (alreadyLinkedRows.length > 0) {
    return { ok: false, error: "Esse e-mail já tem acesso a este condomínio." };
  }

  const alreadyPendingRows = (await sql`
    select 1 from team_invites
    where condominium_id = ${condominiumId} and lower(email) = ${normalizedEmail}
      and accepted_at is null and expires_at > now()
  `) as unknown[];

  if (alreadyPendingRows.length > 0) {
    return { ok: false, error: "Já existe um convite pendente para esse e-mail." };
  }

  const inviteRows = (await sql`
    insert into team_invites (condominium_id, email, role, invited_by, expires_at)
    values (
      ${condominiumId}, ${normalizedEmail}, ${role}, ${invitedByUserId},
      now() + make_interval(secs => ${INVITE_DURATION_SECONDS})
    )
    returning id
  `) as { id: string }[];

  const inviteId = inviteRows[0].id;
  const token = await createTeamInviteToken(inviteId);
  const inviteLink = `${appUrl}/convite?token=${token}`;

  await sendEmail({
    to: normalizedEmail,
    subject: `Convite para o HydroPulse — ${condominiumName}`,
    html: `
      <p>Olá,</p>
      <p>Você foi convidado a acessar o monitoramento hídrico do
      condomínio <strong>${condominiumName}</strong> no HydroPulse.</p>
      <p><a href="${inviteLink}">Clique aqui para ver o convite e aceitar</a></p>
      <p>Esse link expira em 7 dias. Se você não esperava este convite,
      pode ignorar este e-mail.</p>
    `,
  });

  return { ok: true, inviteId };
}

export type InviteDetails =
  | {
      ok: true;
      condominiumName: string;
      role: CondominiumRole;
      email: string;
      hasAccount: boolean;
    }
  | { ok: false; error: string };

type InviteRow = {
  id: string;
  condominium_id: string;
  email: string;
  role: CondominiumRole;
  accepted_at: string | null;
  expires_at: string;
  condominium_name: string;
};

async function getValidInviteRow(token: string): Promise<InviteRow | { error: string }> {
  const inviteId = await verifyTeamInviteToken(token);

  if (!inviteId) {
    return { error: "Link de convite inválido." };
  }

  const rows = (await sql`
    select ti.id, ti.condominium_id, ti.email, ti.role, ti.accepted_at, ti.expires_at,
      c.name as condominium_name
    from team_invites ti
    join condominiums c on c.id = ti.condominium_id
    where ti.id = ${inviteId}
  `) as InviteRow[];

  const row = rows[0];

  if (!row) {
    return { error: "Convite não encontrado." };
  }

  if (row.accepted_at) {
    return { error: "Esse convite já foi aceito." };
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { error: "Esse convite expirou. Peça um novo." };
  }

  return row;
}

export async function getInviteDetails(token: string): Promise<InviteDetails> {
  const row = await getValidInviteRow(token);

  if ("error" in row) {
    return { ok: false, error: row.error };
  }

  const userRows = (await sql`
    select 1 from users where lower(email) = ${row.email}
  `) as unknown[];

  return {
    ok: true,
    condominiumName: row.condominium_name,
    role: row.role,
    email: row.email,
    hasAccount: userRows.length > 0,
  };
}

export type AcceptResult = { ok: true } | { ok: false; error: string };

async function grantAccessFromInvite(
  row: InviteRow,
  userId: string
): Promise<AcceptResult> {
  const insertedRows = (await sql`
    insert into user_condominiums (user_id, condominium_id, role)
    select ${userId}, ${row.condominium_id}, ${row.role}
    where (
      select count(*) from user_condominiums
      where condominium_id = ${row.condominium_id} and role != 'admin'
    ) < ${MAX_INVITED_TEAM_MEMBERS}
    on conflict (user_id, condominium_id) do nothing
    returning id
  `) as { id: string }[];

  if (insertedRows.length === 0) {
    return {
      ok: false,
      error: `Este condomínio já atingiu o limite de ${MAX_INVITED_TEAM_MEMBERS} usuários adicionais.`,
    };
  }

  await sql`update team_invites set accepted_at = now() where id = ${row.id}`;

  return { ok: true };
}

/** A pessoa já tem conta — precisa estar logada com o e-mail do convite. */
export async function acceptInviteForExistingUser(
  token: string,
  sessionUserId: string,
  sessionEmail: string
): Promise<AcceptResult> {
  const row = await getValidInviteRow(token);

  if ("error" in row) {
    return { ok: false, error: row.error };
  }

  if (sessionEmail.trim().toLowerCase() !== row.email) {
    return {
      ok: false,
      error: "Esse convite foi enviado para outro e-mail. Entre com a conta correta.",
    };
  }

  return grantAccessFromInvite(row, sessionUserId);
}

export type AcceptNewUserResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; error: string };

/** A pessoa ainda não tem conta — cria a conta e já aceita o convite. */
export async function acceptInviteForNewUser(
  token: string,
  password: string,
  name: string | null
): Promise<AcceptNewUserResult> {
  const row = await getValidInviteRow(token);

  if ("error" in row) {
    return { ok: false, error: row.error };
  }

  if (!password || password.length < 8) {
    return { ok: false, error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const existingRows = (await sql`
    select id from users where lower(email) = ${row.email}
  `) as { id: string }[];

  if (existingRows[0]) {
    return {
      ok: false,
      error: "Já existe uma conta com esse e-mail. Faça login para aceitar o convite.",
    };
  }

  const passwordHash = await hash(password, 12);

  const userRows = (await sql`
    insert into users (name, email, password_hash, role)
    values (${name || null}, ${row.email}, ${passwordHash}, 'operador')
    returning id
  `) as { id: string }[];

  const userId = userRows[0].id;

  const grantResult = await grantAccessFromInvite(row, userId);

  if (!grantResult.ok) {
    return grantResult;
  }

  return { ok: true, userId, email: row.email };
}

export async function cancelInvite(condominiumId: string, inviteId: string): Promise<void> {
  await sql`
    delete from team_invites
    where id = ${inviteId} and condominium_id = ${condominiumId} and accepted_at is null
  `;
}

export type RemoveResult = { ok: true } | { ok: false; error: string };

export async function removeTeamMember(
  condominiumId: string,
  userId: string
): Promise<RemoveResult> {
  const rows = (await sql`
    select role from user_condominiums
    where condominium_id = ${condominiumId} and user_id = ${userId}
  `) as { role: CondominiumRole }[];

  const currentRole = rows[0]?.role;

  if (!currentRole) {
    return { ok: false, error: "Esse usuário não tem acesso a este condomínio." };
  }

  if (currentRole === "admin") {
    return { ok: false, error: "Não é possível remover o administrador por aqui." };
  }

  await sql`
    delete from user_condominiums
    where condominium_id = ${condominiumId} and user_id = ${userId}
  `;

  return { ok: true };
}
