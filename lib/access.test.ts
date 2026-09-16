import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionPayload } from "./auth";

const sqlMock = vi.fn();

vi.mock("./db", () => ({ sql: sqlMock }));

const {
  getCondominiumRole,
  canWrite,
  getCondominiumIdForBlock,
  getCondominiumIdForReservoir,
  getCondominiumIdForSensor,
} = await import("./access");

function session(role: SessionPayload["role"]): SessionPayload {
  return { userId: "user-1", email: "user@teste.com", role };
}

beforeEach(() => {
  sqlMock.mockReset();
});

describe("getCondominiumRole", () => {
  it("admin sessions get admin role without querying the database", async () => {
    const role = await getCondominiumRole(session("admin"), "condo-1");

    expect(role).toBe("admin");
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("operador with an explicit grant gets their condominium-scoped role", async () => {
    sqlMock.mockResolvedValueOnce([{ role: "sindico" }]);

    const role = await getCondominiumRole(session("operador"), "condo-1");

    expect(role).toBe("sindico");
  });

  it("operador without any grant for that condominium gets null", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const role = await getCondominiumRole(session("operador"), "condo-2");

    expect(role).toBeNull();
  });
});

describe("canWrite", () => {
  it("allows admin, sindico and operador roles", () => {
    expect(canWrite("admin")).toBe(true);
    expect(canWrite("sindico")).toBe(true);
    expect(canWrite("operador")).toBe(true);
  });

  it("blocks visualizador and no access at all", () => {
    expect(canWrite("visualizador")).toBe(false);
    expect(canWrite(null)).toBe(false);
  });
});

describe("condominium id resolution", () => {
  it("getCondominiumIdForBlock returns the owning condominium", async () => {
    sqlMock.mockResolvedValueOnce([{ condominium_id: "condo-9" }]);

    expect(await getCondominiumIdForBlock("block-1")).toBe("condo-9");
  });

  it("getCondominiumIdForBlock returns null for an unknown block", async () => {
    sqlMock.mockResolvedValueOnce([]);

    expect(await getCondominiumIdForBlock("does-not-exist")).toBeNull();
  });

  it("getCondominiumIdForReservoir resolves through the block join", async () => {
    sqlMock.mockResolvedValueOnce([{ condominium_id: "condo-4" }]);

    expect(await getCondominiumIdForReservoir("reservoir-1")).toBe("condo-4");
  });

  it("getCondominiumIdForSensor resolves through the block join", async () => {
    sqlMock.mockResolvedValueOnce([{ condominium_id: "condo-7" }]);

    expect(await getCondominiumIdForSensor("sensor-1")).toBe("condo-7");
  });
});
