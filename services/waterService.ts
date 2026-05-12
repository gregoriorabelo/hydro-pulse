import { supabase } from "@/lib/supabase";
import type { WaterBlock } from "@/types/block";

type SupabaseReading = {
  water_level: number;
  depth_cm: number;
  recorded_at: string;
};

type SupabaseBlock = {
  id: string;
  name: string;
  sensor_identifier: string | null;
  readings: SupabaseReading[];
};

function getVisualBlockName(name: string) {
  return name.replace("Bloco ", "").trim();
}

function formatTime(value?: string) {
  if (!value) {
    return "Sem atualização";
  }

  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getBlocks(): Promise<WaterBlock[]> {
  const { data, error } = await supabase
    .from("blocks")
    .select(`
      id,
      name,
      sensor_identifier,
      readings (
        water_level,
        depth_cm,
        recorded_at
      )
    `)
    .order("name", { ascending: true })
    .order("recorded_at", {
      referencedTable: "readings",
      ascending: false,
    })
    .limit(12, {
      referencedTable: "readings",
    });

  if (error) {
    console.error("Erro ao buscar blocos:", error);
    return [];
  }

  return (data as SupabaseBlock[]).map((block) => {
    const lastReading = block.readings?.[0];

    const nivel = Number(lastReading?.water_level ?? 0);
    const profundidade = Number(lastReading?.depth_cm ?? 0);

    return {
      databaseId: block.id,
      id: getVisualBlockName(block.name),
      nivel,
      profundidade,
      status: nivel <= 20 ? "Crítico" : nivel <= 45 ? "Atenção" : "Normal",
      tendencia: "Estável",
      autonomia: nivel > 0 ? `${Math.floor(nivel / 3)}h` : "Sem leitura",
      atualizacao: formatTime(lastReading?.recorded_at),
      alerta: lastReading
        ? "Leitura real conectada ao Supabase"
        : "Nenhuma leitura recebida do sensor.",
      historico: (block.readings || [])
        .slice()
        .reverse()
        .map((reading) => ({
          hora: formatTime(reading.recorded_at),
          valor: Number(reading.water_level),
        })),
    };
  });
}

export async function saveReading(
  blockDatabaseId: string,
  waterLevel: number,
  depthCm: number
) {
  const { error } = await supabase.from("readings").insert({
    block_id: blockDatabaseId,
    water_level: waterLevel,
    depth_cm: depthCm,
  });

  if (error) {
    console.error("Erro ao salvar leitura:", error);
  }
}