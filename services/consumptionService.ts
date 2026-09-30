import { sql } from "@/lib/db";
import { computePeakUsage, type ReservoirPeakUsage } from "@/lib/peakUsage";

type PeakUsageRow = {
  reservoir_id: string;
  reservoir_name: string;
  block_name: string;
  capacity_liters: string | null;
  water_level: string;
  recorded_at: string;
};

export async function getPeakUsageByCondominium(
  condominiumId: string,
  days = 7
): Promise<ReservoirPeakUsage[]> {
  const rows = (await sql`
    select
      r.id as reservoir_id,
      r.name as reservoir_name,
      r.capacity_liters,
      b.name as block_name,
      readings.water_level,
      readings.recorded_at
    from reservoirs r
    join blocks b on b.id = r.block_id
    join readings on readings.reservoir_id = r.id
    where b.condominium_id = ${condominiumId}
      and readings.recorded_at >= now() - make_interval(days => ${days})
    order by r.id, readings.recorded_at asc
  `) as PeakUsageRow[];

  return computePeakUsage(
    rows.map((row) => ({
      reservoirId: row.reservoir_id,
      reservoirName: row.reservoir_name,
      blockName: row.block_name,
      capacityLiters: row.capacity_liters === null ? null : Number(row.capacity_liters),
      waterLevel: Number(row.water_level),
      recordedAt: row.recorded_at,
    }))
  );
}
