import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { canWrite, getCondominiumRole } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { createContact, listContactsByCondominium } from "@/services/contactService";
import type { CondominiumContactInput } from "@/types/entities";

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

  const contacts = await listContactsByCondominium(condominiumId);

  return NextResponse.json({ contacts });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as CondominiumContactInput & { condominiumId: string };
  const { condominiumId, ...data } = body;

  if (!condominiumId || !data.name || !data.phoneNumber) {
    return NextResponse.json(
      { error: "condominiumId, name e phoneNumber são obrigatórios" },
      { status: 400 }
    );
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  const contact = await createContact(condominiumId, data);

  await logAudit({
    session,
    action: "create",
    entityType: "contact",
    entityId: contact.id,
    details: { name: contact.name, condominiumId },
  });

  return NextResponse.json({ contact }, { status: 201 });
}
