import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";
import { createResetToken } from "@/lib/passwordReset";
import { sendEmail } from "@/lib/email";
import type { CondominiumRole } from "@/types/entities";

export const MAX_INVITED_TEAM_MEMBERS = 2;
const INVITABLE_ROLES: CondominiumRole[] = ["sindico", "operador", "visualizador"];
const INVITE_LINK_DURATION_SECONDS = 7 * 24 * 60 * 60;

export function isInvitableRole(role: string): role is CondominiumRole {
  return (INVITABLE_ROLES as string[]).includes(role);
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

export type InviteResult =
  | { ok: true; member: TeamMember }
  | { ok: false; error: string };

export async function inviteTeamMember(
  condominiumId: string,
  email: string,
  role: CondominiumRole,
  appUrl: string
): Promise<InviteResult> {
  if (!isInvitableRole(role)) {
    return { ok: false, error: "Papel inválido para convite." };
  }

  const currentCount = await countInvitedMembers(condominiumId);

  if (currentCount >= MAX_INVITED_TEAM_MEMBERS) {
    return {
      ok: false,
      error: `Este condomínio já atingiu o limite de ${MAX_INVITED_TEAM_MEMBERS} usuários adicionais.`,
    };
  }

  const condominiumRows = (await sql`
    select name from condominiums where id = ${condominiumId}
  `) as { name: string }[];

  const condominiumName = condominiumRows[0]?.name ?? "seu condomínio";

  const existingUserRows = (await sql`
    select id, name, email from users where email = ${email}
  `) as { id: string; name: string | null; email: string }[];

  let userId: string;
  let userName: string | null;
  let isNewUser = false;

  if (existingUserRows[0]) {
    userId = existingUserRows[0].id;
    userName = existingUserRows[0].name;

    const alreadyLinkedRows = (await sql`
      select 1 from user_condominiums
      where user_id = ${userId} and condominium_id = ${condominiumId}
    `) as unknown[];

    if (alreadyLinkedRows.length > 0) {
      return { ok: false, error: "Esse e-mail já tem acesso a este condomínio." };
    }
  } else {
    isNewUser = true;
    userName = null;

    const randomPasswordHash = await hash(randomUUID(), 12);

    const rows = (await sql`
      insert into users (email, password_hash, role)
      values (${email}, ${randomPasswordHash}, 'operador')
      returning id
    `) as { id: string }[];

    userId = rows[0].id;
  }

  await sql`
    insert into user_condominiums (user_id, condominium_id, role)
    values (${userId}, ${condominiumId}, ${role})
  `;

  if (isNewUser) {
    const token = await createResetToken(userId, INVITE_LINK_DURATION_SECONDS);
    const inviteLink = `${appUrl}/reset-senha?token=${token}`;

    await sendEmail({
      to: email,
      subject: `Você foi convidado para o HydroPulse — ${condominiumName}`,
      html: `
        <p>Olá,</p>
        <p>Você foi convidado a acessar o monitoramento hídrico do
        condomínio <strong>${condominiumName}</strong> no HydroPulse.</p>
        <p><a href="${inviteLink}">Clique aqui para definir sua senha</a></p>
        <p>Esse link expira em 7 dias.</p>
      `,
    });
  } else {
    await sendEmail({
      to: email,
      subject: `Novo acesso liberado no HydroPulse — ${condominiumName}`,
      html: `
        <p>Olá${userName ? `, ${userName}` : ""},</p>
        <p>Você agora também tem acesso ao condomínio
        <strong>${condominiumName}</strong> no HydroPulse, com a sua conta
        já existente.</p>
      `,
    });
  }

  return { ok: true, member: { userId, name: userName, email, role } };
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
