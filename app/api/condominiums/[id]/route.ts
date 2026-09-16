import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { deleteCondominium, updateCondominium } from "@/services/condominiumService";
import type { CondominiumInput } from "@/types/entities";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem editar condomínios" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as CondominiumInput;

  if (!body.name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }

  const condominium = await updateCondominium(id, body);

  if (!condominium) {
    return NextResponse.json({ error: "Condomínio não encontrado" }, { status: 404 });
  }

  await logAudit({
    session,
    action: "update",
    entityType: "condominium",
    entityId: id,
    details: { name: condominium.name },
  });

  return NextResponse.json({ condominium });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem excluir condomínios" }, { status: 403 });
  }

  const { id } = await params;

  await deleteCondominium(id);

  await logAudit({ session, action: "delete", entityType: "condominium", entityId: id });

  return NextResponse.json({ success: true });
}
