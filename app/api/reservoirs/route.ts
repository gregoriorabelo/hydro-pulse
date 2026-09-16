import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { createReservoir, listReservoirsByCondominium } from "@/services/reservoirService";
import type { ReservoirInput } from "@/types/entities";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const condominiumId = request.nextUrl.searchParams.get("condominiumId");

  if (!condominiumId) {
    return NextResponse.json({ error: "condominiumId é obrigatório" }, { status: 400 });
  }

  const reservoirs = await listReservoirsByCondominium(condominiumId);

  return NextResponse.json({ reservoirs });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as ReservoirInput & { blockId: string };
  const { blockId, ...data } = body;

  if (!blockId || !data.name || !data.type) {
    return NextResponse.json(
      { error: "blockId, name e type são obrigatórios" },
      { status: 400 }
    );
  }

  const reservoir = await createReservoir(blockId, data);

  return NextResponse.json({ reservoir }, { status: 201 });
}
