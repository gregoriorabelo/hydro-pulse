import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));

const { getNiveisReport } = await import("./reportService");

beforeEach(() => {
  sqlMock.mockReset();
});

describe("getNiveisReport", () => {
  it("returns null when the condominium does not exist", async () => {
    sqlMock.mockResolvedValueOnce([]); // condominium lookup

    const report = await getNiveisReport("missing-condo", "2026-01-01", "2026-01-31");

    expect(report).toBeNull();
  });

  it("groups multiple reading rows into a single reservoir entry", async () => {
    sqlMock.mockResolvedValueOnce([{ name: "Residencial Teste" }]); // condominium lookup
    sqlMock.mockResolvedValueOnce([
      {
        block_name: "Bloco A",
        reservoir_name: "Caixa 1",
        reservoir_type: "Superior",
        reservoir_status: "ativo",
        critical_level_percent: "35",
        attention_level_percent: "60",
        capacity_liters: "5000",
        water_level: "80",
        depth_cm: "150",
        recorded_at: "2026-01-10T10:00:00Z",
      },
      {
        block_name: "Bloco A",
        reservoir_name: "Caixa 1",
        reservoir_type: "Superior",
        reservoir_status: "ativo",
        critical_level_percent: "35",
        attention_level_percent: "60",
        capacity_liters: "5000",
        water_level: "78",
        depth_cm: "148",
        recorded_at: "2026-01-10T16:00:00Z",
      },
    ]);

    const report = await getNiveisReport("condo-1", "2026-01-01", "2026-01-31");

    expect(report).not.toBeNull();
    expect(report!.reservoirs).toHaveLength(1);
    expect(report!.reservoirs[0].readings).toHaveLength(2);
    expect(report!.reservoirs[0].capacityLiters).toBe(5000);
    expect(report!.reservoirs[0].criticalLevelPercent).toBe(35);
  });

  it("keeps a reservoir with zero readings in the period (empty readings array)", async () => {
    sqlMock.mockResolvedValueOnce([{ name: "Residencial Teste" }]);
    sqlMock.mockResolvedValueOnce([
      {
        block_name: "Bloco B",
        reservoir_name: "Cisterna",
        reservoir_type: "Cisterna",
        reservoir_status: "pausado",
        critical_level_percent: "20",
        attention_level_percent: "40",
        capacity_liters: null,
        water_level: null,
        depth_cm: null,
        recorded_at: null,
      },
    ]);

    const report = await getNiveisReport("condo-1", "2026-01-01", "2026-01-31");

    expect(report!.reservoirs).toHaveLength(1);
    expect(report!.reservoirs[0].readings).toHaveLength(0);
    expect(report!.reservoirs[0].capacityLiters).toBeNull();
  });

  it("keeps separate reservoirs with the same name in different blocks apart", async () => {
    sqlMock.mockResolvedValueOnce([{ name: "Residencial Teste" }]);
    sqlMock.mockResolvedValueOnce([
      {
        block_name: "Bloco A",
        reservoir_name: "Caixa 1",
        reservoir_type: "Superior",
        reservoir_status: "ativo",
        critical_level_percent: "35",
        attention_level_percent: "60",
        capacity_liters: null,
        water_level: null,
        depth_cm: null,
        recorded_at: null,
      },
      {
        block_name: "Bloco B",
        reservoir_name: "Caixa 1",
        reservoir_type: "Superior",
        reservoir_status: "ativo",
        critical_level_percent: "35",
        attention_level_percent: "60",
        capacity_liters: null,
        water_level: null,
        depth_cm: null,
        recorded_at: null,
      },
    ]);

    const report = await getNiveisReport("condo-1", "2026-01-01", "2026-01-31");

    expect(report!.reservoirs).toHaveLength(2);
  });
});
