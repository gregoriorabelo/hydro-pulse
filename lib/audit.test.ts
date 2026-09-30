import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));

const { logAudit } = await import("./audit");

beforeEach(() => {
  sqlMock.mockReset();
});

describe("logAudit", () => {
  it("inserts a row with the given session and action", async () => {
    sqlMock.mockResolvedValueOnce([]);

    await logAudit({
      session: { userId: "u1", email: "admin@teste.com", role: "master" },
      action: "update",
      entityType: "sensor",
      entityId: "s1",
      details: { action: "regenerate_secret" },
    });

    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it("does not throw when the insert fails (e.g. table missing)", async () => {
    sqlMock.mockRejectedValueOnce(new Error('relation "audit_log" does not exist'));

    await expect(
      logAudit({
        session: { userId: "u1", email: "admin@teste.com", role: "master" },
        action: "update",
        entityType: "sensor",
        entityId: "s1",
      })
    ).resolves.toBeUndefined();
  });
});
