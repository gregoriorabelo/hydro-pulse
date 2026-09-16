import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { canWrite, getCondominiumIdForBlock, getCondominiumRole } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { deleteBlock, updateBlock } from "@/services/blockService";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }

  const condominiumId = await getCondominiumIdForBlock(id);

  if (!condominiumId) {
    return NextResponse.json({ error: "Bloco não encontrado" }, { status: 404 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  const block = await updateBlock(id, name);

  if (!block) {
    return NextResponse.json({ error: "Bloco não encontrado" }, { status: 404 });
  }

  await logAudit({
    session,
    action: "update",
    entityType: "block",
    entityId: id,
    details: { name: block.name },
  });

  return NextResponse.json({ block });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const condominiumId = await getCondominiumIdForBlock(id);

  if (!condominiumId) {
    return NextResponse.json({ error: "Bloco não encontrado" }, { status: 404 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  await deleteBlock(id);

  await logAudit({ session, action: "delete", entityType: "block", entityId: id });

  return NextResponse.json({ success: true });
}
