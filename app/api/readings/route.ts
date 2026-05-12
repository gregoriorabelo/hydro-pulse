import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
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