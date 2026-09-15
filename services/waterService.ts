import { sql } from "@/lib/db";
import type { WaterBlock } from "@/types/block";

type BlockReadingRow = {
  block_id: string;
  block_name: string;
  water_level: string | null;
  depth_cm: string | null;
  recorded_at: string | null;
};

function getVisualBlockName(name: string) {
  return name.replace("Bloco ", "").trim();
}

function formatTime(value?: string | null) {
  if (!value) {
    return "Sem atualização";
  }

  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getBlocks(): Promise<WaterBlock[]> {
  const rows = (await sql`
    select
      b.id as block_id,
      b.name as block_name,
      r.water_level,
      r.depth_cm,
      r.recorded_at
    from blocks b
    left join lateral (
      select water_level, depth_cm, recorded_at
      from readings
      where readings.block_id = b.id
      order by recorded_at desc
      limit 12
    ) r on true
    order by b.name asc, r.recorded_at desc nulls last
  `) as BlockReadingRow[];

  const blocksById = new Map<
    string,
    { name: string; readings: BlockReadingRow[] }
  >();

  for (const row of rows) {
    const entry = blocksById.get(row.block_id) ?? {
      name: row.block_name,
      readings: [],
    };

    if (row.recorded_at) {
      entry.readings.push(row);
    }

    blocksById.set(row.block_id, entry);
  }

  return Array.from(blocksById.entries()).map(([blockId, block]) => {
    const lastReading = block.readings[0];

    const nivel = Number(lastReading?.water_level ?? 0);
    const profundidade = Number(lastReading?.depth_cm ?? 0);

    return {
      databaseId: blockId,
      id: getVisualBlockName(block.name),
      nivel,
      profundidade,
      status: nivel <= 20 ? "Crítico" : nivel <= 45 ? "Atenção" : "Normal",
      tendencia: "Estável",
      autonomia: nivel > 0 ? `${Math.floor(nivel / 3)}h` : "Sem leitura",
      atualizacao: formatTime(lastReading?.recorded_at),
      alerta: lastReading
        ? "Leitura real conectada ao banco de dados"
        : "Nenhuma leitura recebida do sensor.",
      historico: block.readings
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
  await sql`
    insert into readings (block_id, water_level, depth_cm)
    values (${blockDatabaseId}, ${waterLevel}, ${depthCm})
  `;
}
