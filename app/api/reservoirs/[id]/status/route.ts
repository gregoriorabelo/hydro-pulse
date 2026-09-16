import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { canWrite, getCondominiumIdForReservoir, getCondominiumRole } from "@/lib/access";
import { setReservoirStatus } from "@/services/reservoirService";
import type { ReservoirStatus } from "@/types/entities";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status: ReservoirStatus };

  if (body.status !== "ativo" && body.status !== "pausado") {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  const condominiumId = await getCondominiumIdForReservoir(id);

  if (!condominiumId) {
    return NextResponse.json({ error: "Reservatório não encontrado" }, { status: 404 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  await setReservoirStatus(id, body.status);

  return NextResponse.json({ success: true });
}
