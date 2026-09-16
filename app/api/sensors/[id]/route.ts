import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
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

  try {
    const sensor = await updateSensor(id, body);

    if (!sensor) {
      return NextResponse.json({ error: "Sensor não encontrado" }, { status: 404 });
    }

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

  await deleteSensor(id);

  return NextResponse.json({ success: true });
}
