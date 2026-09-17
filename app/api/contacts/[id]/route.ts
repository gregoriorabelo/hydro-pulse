import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { canWrite, getCondominiumIdForContact, getCondominiumRole } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { deleteContact } from "@/services/contactService";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const condominiumId = await getCondominiumIdForContact(id);

  if (!condominiumId) {
    return NextResponse.json({ error: "Contato não encontrado" }, { status: 404 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  await deleteContact(id);

  await logAudit({ session, action: "delete", entityType: "contact", entityId: id });

  return NextResponse.json({ success: true });
}
