import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSensorAuth } from "@/services/sensorService";
import { notifyIfEnteredCritical } from "@/services/notificationService";

type LastReadingRow = {
  water_level: string;
};

function keysMatch(expectedKey: string, providedKey: string | null): boolean {
  if (!providedKey) {
    return false;
  }

  const expected = Buffer.from(expectedKey);
  const provided = Buffer.from(providedKey);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { sensor_id, water_level, depth_cm } = body;

    if (!sensor_id || water_level === undefined) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
        },
        {
          status: 400,
        }
      );
    }

    const providedKey = request.headers.get("x-api-key");
    const sensorAuth = await getSensorAuth(sensor_id);

    // Mensagem e status idênticos tanto pra sensor inexistente quanto pra
    // chave errada, pra não deixar alguém descobrir números de série
    // válidos só testando chaves aleatórias.
    if (!sensorAuth || !keysMatch(sensorAuth.secret, providedKey)) {
      console.warn(`[readings] Autenticação recusada para o sensor "${sensor_id}".`);

      return NextResponse.json(
        {
          error: "Não autorizado",
        },
        {
          status: 401,
        }
      );
    }

    if (!sensorAuth.reservoirId) {
      return NextResponse.json(
        {
          error: "Sensor não está vinculado a um reservatório",
        },
        {
          status: 422,
        }
      );
    }

    const previousReadingRows = (await sql`
      select water_level from readings
      where reservoir_id = ${sensorAuth.reservoirId}
      order by recorded_at desc
      limit 1
    `) as LastReadingRow[];

    const previousLevel = previousReadingRows[0]
      ? Number(previousReadingRows[0].water_level)
      : null;

    await sql`
      insert into readings (reservoir_id, water_level, depth_cm)
      values (${sensorAuth.reservoirId}, ${water_level}, ${depth_cm ?? null})
    `;

    await notifyIfEnteredCritical(sensorAuth.reservoirId, Number(water_level), previousLevel);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro interno",
      },
      {
        status: 500,
      }
    );
  }
}
