import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));

const { getPeakUsageByCondominium } = await import("./consumptionService");

beforeEach(() => {
  sqlMock.mockReset();
});

describe("getPeakUsageByCondominium", () => {
  it("maps rows and computes the peak usage per reservoir", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        reservoir_id: "r1",
        reservoir_name: "Caixa Superior 1",
        block_name: "Bloco A",
        capacity_liters: "1000",
        water_level: "100",
        recorded_at: "2026-01-01T08:00:00Z",
      },
      {
        reservoir_id: "r1",
        reservoir_name: "Caixa Superior 1",
        block_name: "Bloco A",
        capacity_liters: "1000",
        water_level: "70",
        recorded_at: "2026-01-01T09:00:00Z",
      },
    ]);

    const result = await getPeakUsageByCondominium("condo-1");

    expect(result).toHaveLength(1);
    expect(result[0].reservoirId).toBe("r1");
    expect(result[0].peakHour).toBe(9);
    expect(result[0].peakConsumptionLiters).toBe(300);
  });

  it("returns an empty array when there are no readings", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const result = await getPeakUsageByCondominium("condo-1");

    expect(result).toEqual([]);
  });
});
