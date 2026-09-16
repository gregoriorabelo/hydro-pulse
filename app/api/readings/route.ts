import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { notifyIfEnteredCritical } from "@/services/notificationService";

type SensorRow = {
  reservoir_id: string | null;
};

type LastReadingRow = {
  water_level: string;
};

function isAuthorized(request: Request) {
  const expectedKey = process.env.SENSOR_API_KEY;

  if (!expectedKey) {
    console.warn("[readings] SENSOR_API_KEY não está configurada no ambiente.");
    return false;
  }

  const providedKey = request.headers.get("x-api-key");

  if (!providedKey) {
    console.warn("[readings] Requisição sem header x-api-key.");
    return false;
  }

  const expected = Buffer.from(expectedKey);
  const provided = Buffer.from(providedKey);

  if (expected.length !== provided.length) {
    console.warn(
      `[readings] Tamanho da chave não bate. Esperado: ${expected.length} caracteres. Recebido: ${provided.length} caracteres.`
    );
    return false;
  }

  const matches = timingSafeEqual(expected, provided);

  if (!matches) {
    console.warn("[readings] Chave recebida tem o mesmo tamanho da esperada, mas o conteúdo é diferente.");
  }

  return matches;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          error: "Não autorizado",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      sensor_id,
      water_level,
      depth_cm,
    } = body;

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

    const sensorRows = (await sql`
      select reservoir_id from sensors where serial = ${sensor_id}
    `) as SensorRow[];

    const sensor = sensorRows[0];

    if (!sensor) {
      return NextResponse.json(
        {
          error: "Sensor não encontrado",
        },
        {
          status: 404,
        }
      );
    }

    if (!sensor.reservoir_id) {
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
      where reservoir_id = ${sensor.reservoir_id}
      order by recorded_at desc
      limit 1
    `) as LastReadingRow[];

    const previousLevel = previousReadingRows[0]
      ? Number(previousReadingRows[0].water_level)
      : null;

    await sql`
      insert into readings (reservoir_id, water_level, depth_cm)
      values (${sensor.reservoir_id}, ${water_level}, ${depth_cm ?? null})
    `;

    await notifyIfEnteredCritical(sensor.reservoir_id, Number(water_level), previousLevel);

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