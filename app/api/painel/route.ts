import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { getCondominiumRole } from "@/lib/access";
import { getBlocks } from "@/services/waterService";

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

  const blocks = await getBlocks(condominiumId);

  return NextResponse.json({ blocks });
}
