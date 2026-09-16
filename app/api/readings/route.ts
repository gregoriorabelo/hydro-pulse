import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type SensorRow = {
  reservoir_id: string | null;
};

function isAuthorized(request: Request) {
  const expectedKey = process.env.SENSOR_API_KEY;

  if (!expectedKey) {
    return false;
  }

  const providedKey = request.headers.get("x-api-key");

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

    await sql`
      insert into readings (reservoir_id, water_level, depth_cm)
      values (${sensor.reservoir_id}, ${water_level}, ${depth_cm ?? null})
    `;

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