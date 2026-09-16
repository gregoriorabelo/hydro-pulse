import { sql } from "@/lib/db";
import type { WaterBlock, WaterStatus } from "@/types/block";

type ReservoirReadingRow = {
  reservoir_id: string;
  reservoir_name: string;
  reservoir_status: "ativo" | "pausado";
  critical_level_percent: string;
  attention_level_percent: string;
  expected_autonomy_hours: string | null;
  block_name: string;
  water_level: string | null;
  depth_cm: string | null;
  recorded_at: string | null;
};

function formatTime(value?: string | null) {
  if (!value) {
    return "Sem atualização";
  }

  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateStatus(
  reservoirStatus: "ativo" | "pausado",
  hasReading: boolean,
  nivel: number,
  criticalLevel: number,
  attentionLevel: number
): WaterStatus {
  if (reservoirStatus === "pausado") return "Pausado";
  if (!hasReading) return "Sem sinal";
  if (nivel <= criticalLevel) return "Crítico";
  if (nivel <= attentionLevel) return "Atenção";
  return "Normal";
}

function calculateAlert(status: WaterStatus): string {
  switch (status) {
    case "Crítico":
      return "Nível crítico. Ação imediata recomendada.";
    case "Atenção":
      return "Nível em faixa de atenção. Acompanhar.";
    case "Sem sinal":
      return "Nenhuma leitura recebida do sensor.";
    case "Pausado":
      return "Reservatório pausado. Fora do monitoramento ativo.";
    default:
      return "Operação dentro do padrão esperado.";
  }
}

export async function getBlocks(condominiumId: string): Promise<WaterBlock[]> {
  const rows = (await sql`
    select
      r.id as reservoir_id,
      r.name as reservoir_name,
      r.status as reservoir_status,
      r.critical_level_percent,
      r.attention_level_percent,
      r.expected_autonomy_hours,
      b.name as block_name,
      readings.water_level,
      readings.depth_cm,
      readings.recorded_at
    from reservoirs r
    join blocks b on b.id = r.block_id
    left join lateral (
      select water_level, depth_cm, recorded_at
      from readings
      where readings.reservoir_id = r.id
      order by recorded_at desc
      limit 12
    ) readings on true
    where b.condominium_id = ${condominiumId}
    order by b.name asc, r.name asc, readings.recorded_at desc nulls last
  `) as ReservoirReadingRow[];

  const byReservoir = new Map<
    string,
    { row: ReservoirReadingRow; readings: ReservoirReadingRow[] }
  >();

  for (const row of rows) {
    const entry = byReservoir.get(row.reservoir_id) ?? { row, readings: [] };

    if (row.recorded_at) {
      entry.readings.push(row);
    }

    byReservoir.set(row.reservoir_id, entry);
  }

  return Array.from(byReservoir.values()).map(({ row, readings }) => {
    const lastReading = readings[0];
    const nivel = Number(lastReading?.water_level ?? 0);
    const profundidade = Number(lastReading?.depth_cm ?? 0);
    const criticalLevel = Number(row.critical_level_percent);
    const attentionLevel = Number(row.attention_level_percent);

    const status = calculateStatus(
      row.reservoir_status,
      Boolean(lastReading),
      nivel,
      criticalLevel,
      attentionLevel
    );

    const autonomia = row.expected_autonomy_hours
      ? `${row.expected_autonomy_hours}h (parâmetro)`
      : "Sem parâmetro configurado";

    return {
      databaseId: row.reservoir_id,
      id: row.reservoir_name,
      blockName: row.block_name,
      nivel,
      profundidade,
      status,
      tendencia: "Estável",
      autonomia,
      atualizacao: formatTime(lastReading?.recorded_at),
      alerta: calculateAlert(status),
      historico: readings
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
  reservoirId: string,
  waterLevel: number,
  depthCm: number
) {
  await sql`
    insert into readings (reservoir_id, water_level, depth_cm)
    values (${reservoirId}, ${waterLevel}, ${depthCm})
  `;
}
