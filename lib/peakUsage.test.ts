import { describe, expect, it } from "vitest";
import { computePeakUsage, type UsageReadingRow } from "./peakUsage";

function reading(overrides: Partial<UsageReadingRow>): UsageReadingRow {
  return {
    reservoirId: "r1",
    reservoirName: "Caixa Superior 1",
    blockName: "Bloco A",
    capacityLiters: 1000,
    waterLevel: 80,
    recordedAt: "2026-01-01T10:00:00Z",
    ...overrides,
  };
}

describe("computePeakUsage", () => {
  it("returns an empty array for no readings", () => {
    expect(computePeakUsage([])).toEqual([]);
  });

  it("reports no peak when there is only one reading", () => {
    const result = computePeakUsage([reading({})]);

    expect(result[0].peakHour).toBeNull();
    expect(result[0].peakHourLabel).toBeNull();
    expect(result[0].totalConsumptionPercent).toBe(0);
  });

  it("ignores level increases (refills)", () => {
    const result = computePeakUsage([
      reading({ waterLevel: 50, recordedAt: "2026-01-01T08:00:00Z" }),
      reading({ waterLevel: 90, recordedAt: "2026-01-01T09:00:00Z" }),
    ]);

    expect(result[0].peakHour).toBeNull();
    expect(result[0].totalConsumptionPercent).toBe(0);
  });

  it("finds the hour with the largest accumulated consumption", () => {
    const result = computePeakUsage([
      reading({ waterLevel: 100, recordedAt: "2026-01-01T08:00:00Z" }),
      reading({ waterLevel: 92, recordedAt: "2026-01-01T09:00:00Z" }),
      reading({ waterLevel: 60, recordedAt: "2026-01-01T14:00:00Z" }),
      reading({ waterLevel: 55, recordedAt: "2026-01-01T14:40:00Z" }),
      reading({ waterLevel: 50, recordedAt: "2026-01-01T18:00:00Z" }),
    ]);

    expect(result[0].peakHour).toBe(14);
    expect(result[0].peakHourLabel).toBe("14h");
    expect(result[0].peakConsumptionPercent).toBe(37);
    expect(result[0].totalConsumptionPercent).toBe(50);
  });

  it("converts percent consumption into liters using the reservoir capacity", () => {
    const result = computePeakUsage([
      reading({ waterLevel: 100, capacityLiters: 2000, recordedAt: "2026-01-01T08:00:00Z" }),
      reading({ waterLevel: 80, capacityLiters: 2000, recordedAt: "2026-01-01T09:00:00Z" }),
    ]);

    expect(result[0].peakConsumptionLiters).toBe(400);
    expect(result[0].totalConsumptionLiters).toBe(400);
  });

  it("leaves liters fields null when the reservoir has no capacity configured", () => {
    const result = computePeakUsage([
      reading({ waterLevel: 100, capacityLiters: null, recordedAt: "2026-01-01T08:00:00Z" }),
      reading({ waterLevel: 80, capacityLiters: null, recordedAt: "2026-01-01T09:00:00Z" }),
    ]);

    expect(result[0].peakConsumptionLiters).toBeNull();
    expect(result[0].totalConsumptionLiters).toBeNull();
  });

  it("computes independent peaks per reservoir", () => {
    const result = computePeakUsage([
      reading({
        reservoirId: "r1",
        reservoirName: "Caixa 1",
        waterLevel: 100,
        recordedAt: "2026-01-01T08:00:00Z",
      }),
      reading({
        reservoirId: "r1",
        reservoirName: "Caixa 1",
        waterLevel: 70,
        recordedAt: "2026-01-01T09:00:00Z",
      }),
      reading({
        reservoirId: "r2",
        reservoirName: "Caixa 2",
        waterLevel: 90,
        recordedAt: "2026-01-01T08:00:00Z",
      }),
      reading({
        reservoirId: "r2",
        reservoirName: "Caixa 2",
        waterLevel: 85,
        recordedAt: "2026-01-01T09:00:00Z",
      }),
    ]);

    expect(result).toHaveLength(2);

    const r1 = result.find((r) => r.reservoirId === "r1")!;
    const r2 = result.find((r) => r.reservoirId === "r2")!;

    expect(r1.totalConsumptionPercent).toBe(30);
    expect(r2.totalConsumptionPercent).toBe(5);
  });

  it("sorts out-of-order readings before computing deltas", () => {
    const result = computePeakUsage([
      reading({ waterLevel: 60, recordedAt: "2026-01-01T09:00:00Z" }),
      reading({ waterLevel: 100, recordedAt: "2026-01-01T08:00:00Z" }),
    ]);

    expect(result[0].totalConsumptionPercent).toBe(40);
  });
});
