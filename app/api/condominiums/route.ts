import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { createCondominium, listCondominiums } from "@/services/condominiumService";
import type { CondominiumInput } from "@/types/entities";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const condominiums = await listCondominiums(
    session.role === "admin" ? undefined : session.userId
  );

  return NextResponse.json({ condominiums });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (session.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem cadastrar condomínios" }, { status: 403 });
  }

  const body = (await request.json()) as CondominiumInput;

  if (!body.name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }

  const condominium = await createCondominium(body);

  await logAudit({
    session,
    action: "create",
    entityType: "condominium",
    entityId: condominium.id,
    details: { name: condominium.name },
  });

  return NextResponse.json({ condominium }, { status: 201 });
}
