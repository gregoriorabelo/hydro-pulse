import { supabase } from "@/lib/supabase";
import type { WaterBlock, WaterHistoryPoint } from "@/types/block";

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

function formatLastUpdate(recordedAt?: string) {
  if (!recordedAt) {
    return "Sem leitura";
  }

  const date = new Date(recordedAt);

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildHistory(readings: SupabaseReading[]): WaterHistoryPoint[] {
  return readings
    .slice()
    .reverse()
    .map((reading) => ({
      hora: formatLastUpdate(reading.recorded_at),
      valor: Number(reading.water_level),
    }));
}

export async function fetchBlocks(): Promise<WaterBlock[]> {
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

    return {
      databaseId: block.id,
      id: getVisualBlockName(block.name),
      nivel: lastReading ? Number(lastReading.water_level) : 0,
      profundidade: lastReading ? Number(lastReading.depth_cm) : 0,
      tendencia: "Estável",
      autonomia: "Calculando",
      atualizacao: formatLastUpdate(lastReading?.recorded_at),
      alerta: lastReading
        ? "Leitura real conectada ao Supabase"
        : "Nenhuma leitura recebida do sensor",
      historico: buildHistory(block.readings || []),
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