import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { canWrite, getCondominiumIdForReservoir, getCondominiumRole } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { deleteReservoir, updateReservoir } from "@/services/reservoirService";
import type { ReservoirInput } from "@/types/entities";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as ReservoirInput;

  if (!body.name || !body.type) {
    return NextResponse.json({ error: "name e type são obrigatórios" }, { status: 400 });
  }

  const condominiumId = await getCondominiumIdForReservoir(id);

  if (!condominiumId) {
    return NextResponse.json({ error: "Reservatório não encontrado" }, { status: 404 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  const reservoir = await updateReservoir(id, body);

  if (!reservoir) {
    return NextResponse.json({ error: "Reservatório não encontrado" }, { status: 404 });
  }

  await logAudit({
    session,
    action: "update",
    entityType: "reservoir",
    entityId: id,
    details: { name: reservoir.name },
  });

  return NextResponse.json({ reservoir });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const condominiumId = await getCondominiumIdForReservoir(id);

  if (!condominiumId) {
    return NextResponse.json({ error: "Reservatório não encontrado" }, { status: 404 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  await deleteReservoir(id);

  await logAudit({ session, action: "delete", entityType: "reservoir", entityId: id });

  return NextResponse.json({ success: true });
}
