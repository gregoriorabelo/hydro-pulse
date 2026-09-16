import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import {
  canWrite,
  getCondominiumIdForBlock,
  getCondominiumIdForSensor,
  getCondominiumRole,
} from "@/lib/access";
import { logAudit } from "@/lib/audit";
import { deleteSensor, updateSensor } from "@/services/sensorService";
import type { SensorInput } from "@/types/entities";

type RouteParams = { params: Promise<{ id: string }> };

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && "code" in error && error.code === "23505"
  );
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as SensorInput;

  if (!body.blockId || !body.name || !body.serial) {
    return NextResponse.json(
      { error: "blockId, name e serial são obrigatórios" },
      { status: 400 }
    );
  }

  const currentCondominiumId = await getCondominiumIdForSensor(id);

  if (!currentCondominiumId) {
    return NextResponse.json({ error: "Sensor não encontrado" }, { status: 404 });
  }

  const targetCondominiumId = await getCondominiumIdForBlock(body.blockId);

  if (!targetCondominiumId) {
    return NextResponse.json({ error: "Bloco não encontrado" }, { status: 404 });
  }

  const currentRole = await getCondominiumRole(session, currentCondominiumId);
  const targetRole =
    targetCondominiumId === currentCondominiumId
      ? currentRole
      : await getCondominiumRole(session, targetCondominiumId);

  if (!canWrite(currentRole) || !canWrite(targetRole)) {
    return NextResponse.json({ error: "Sem permissão para este condomínio" }, { status: 403 });
  }

  try {
    const sensor = await updateSensor(id, body);

    if (!sensor) {
      return NextResponse.json({ error: "Sensor não encontrado" }, { status: 404 });
    }

    await logAudit({
      session,
      action: "update",
      entityType: "sensor",
      entityId: id,
      details: { name: sensor.name, serial: sensor.serial },
    });

    return NextResponse.json({ sensor });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Já existe um sensor com esse número de série" },
        { status: 409 }
      );
    }

    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

  await deleteSensor(id);

  await logAudit({ session, action: "delete", entityType: "sensor", entityId: id });

  return NextResponse.json({ success: true });
}
