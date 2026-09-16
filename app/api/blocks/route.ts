import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { canWrite, getCondominiumRole } from "@/lib/access";
import { createBlock, listBlocksByCondominium } from "@/services/blockService";

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

  const blocks = await listBlocksByCondominium(condominiumId);

  return NextResponse.json({ blocks });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { condominiumId, name } = body;

  if (!condominiumId || !name) {
    return NextResponse.json(
      { error: "condominiumId e name são obrigatórios" },
      { status: 400 }
    );
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  const block = await createBlock(condominiumId, name);

  return NextResponse.json({ block }, { status: 201 });
}
