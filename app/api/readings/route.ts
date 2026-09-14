import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { data: block } = await supabase
      .from("blocks")
      .select("id")
      .eq("sensor_identifier", sensor_id)
      .single();

    if (!block) {
      return NextResponse.json(
        {
          error: "Sensor não encontrado",
        },
        {
          status: 404,
        }
      );
    }

    const { error } = await supabase
      .from("readings")
      .insert({
        block_id: block.id,
        water_level,
        depth_cm,
      });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          error: "Erro ao salvar leitura",
        },
        {
          status: 500,
        }
      );
    }

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