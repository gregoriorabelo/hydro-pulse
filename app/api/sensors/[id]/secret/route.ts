import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { canWrite, getCondominiumIdForSensor, getCondominiumRole } from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { regenerateSensorSecret } from "@/services/sensorService";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const condominiumId = await getCondominiumIdForSensor(id);

  if (!condominiumId) {
    return NextResponse.json({ error: "Sensor não encontrado" }, { status: 404 });
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!canWrite(role)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  const secret = await regenerateSensorSecret(id);

  if (!secret) {
    return NextResponse.json({ error: "Sensor não encontrado" }, { status: 404 });
  }

  await logAudit({
    session,
    action: "update",
    entityType: "sensor",
    entityId: id,
    details: { action: "regenerate_secret" },
  });

  return NextResponse.json({ secret });
}
