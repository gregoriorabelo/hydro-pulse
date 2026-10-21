import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { getCondominiumRole } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import {
  MAX_INVITED_TEAM_MEMBERS,
  cancelInvite,
  countInvitedMembers,
  countPendingInvites,
  createTeamInvite,
  isInvitableRole,
  listPendingInvites,
  listTeam,
  removeTeamMember,
} from "@/services/teamService";

function canManageTeam(role: string | null): boolean {
  return role === "admin" || role === "sindico";
}

export async function GET(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const condominiumId = request.nextUrl.searchParams.get("condominiumId");

  if (!condominiumId) {
    return NextResponse.json({ error: "condominiumId é obrigatório" }, { status: 400 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!role) {
    return NextResponse.json({ error: "Sem acesso a este condomínio" }, { status: 403 });
  }

  const manage = canManageTeam(role);

  const [team, invitedCount, pendingCount, pendingInvites] = await Promise.all([
    listTeam(condominiumId),
    countInvitedMembers(condominiumId),
    countPendingInvites(condominiumId),
    manage ? listPendingInvites(condominiumId) : Promise.resolve([]),
  ]);

  return NextResponse.json({
    team,
    invitedCount,
    pendingCount,
    maxInvited: MAX_INVITED_TEAM_MEMBERS,
    canManage: manage,
    pendingInvites,
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    condominiumId?: string;
    email?: string;
    role?: string;
  };

  if (!body.condominiumId || !body.email || !body.role) {
    return NextResponse.json(
      { error: "condominiumId, email e role são obrigatórios" },
      { status: 400 }
    );
  }

  const role = await getCondominiumRole(session, body.condominiumId);

  if (!canManageTeam(role)) {
    return NextResponse.json(
      { error: "Só o administrador ou síndico deste condomínio pode convidar pessoas" },
      { status: 403 }
    );
  }

  if (!isInvitableRole(body.role)) {
    return NextResponse.json({ error: "Papel inválido para convite" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const result = await createTeamInvite(
    body.condominiumId,
    body.email,
    body.role,
    session.userId,
    appUrl
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAudit({
    session,
    action: "create",
    entityType: "user",
    entityId: result.inviteId,
    details: { email: body.email, role: body.role, condominiumId: body.condominiumId, invite: true },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const condominiumId = request.nextUrl.searchParams.get("condominiumId");
  const userId = request.nextUrl.searchParams.get("userId");
  const inviteId = request.nextUrl.searchParams.get("inviteId");

  if (!condominiumId || (!userId && !inviteId)) {
    return NextResponse.json(
      { error: "condominiumId e (userId ou inviteId) são obrigatórios" },
      { status: 400 }
    );
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canManageTeam(role)) {
    return NextResponse.json(
      { error: "Só o administrador ou síndico deste condomínio pode remover pessoas" },
      { status: 403 }
    );
  }

  if (inviteId) {
    await cancelInvite(condominiumId, inviteId);

    await logAudit({
      session,
      action: "delete",
      entityType: "user",
      entityId: inviteId,
      details: { condominiumId, invite: true },
    });

    return NextResponse.json({ success: true });
  }

  const result = await removeTeamMember(condominiumId, userId!);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAudit({
    session,
    action: "delete",
    entityType: "user",
    entityId: userId!,
    details: { condominiumId },
  });

  return NextResponse.json({ success: true });
}
