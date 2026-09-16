import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { createSensor, listSensorsByCondominium } from "@/services/sensorService";
import type { SensorInput } from "@/types/entities";

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && "code" in error && error.code === "23505"
  );
}

export async function GET(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const condominiumId = request.nextUrl.searchParams.get("condominiumId");

  if (!condominiumId) {
    return NextResponse.json({ error: "condominiumId é obrigatório" }, { status: 400 });
  }

  const sensors = await listSensorsByCondominium(condominiumId);

  return NextResponse.json({ sensors });
}

export async function POST(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as SensorInput;

  if (!body.blockId || !body.name || !body.serial) {
    return NextResponse.json(
      { error: "blockId, name e serial são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const sensor = await createSensor(body);
    return NextResponse.json({ sensor }, { status: 201 });
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
