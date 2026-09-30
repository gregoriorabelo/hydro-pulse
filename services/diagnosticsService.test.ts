import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));

const { getSchemaChecks } = await import("./diagnosticsService");

beforeEach(() => {
  sqlMock.mockReset();
});

describe("getSchemaChecks", () => {
  it("maps every schema check from the query row", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        login_attempts: true,
        audit_log: true,
        password_reset_attempts: false,
        sensors_secret: true,
        condominium_contacts: true,
        reservoirs_high_level: true,
      },
    ]);

    const checks = await getSchemaChecks();

    expect(checks).toHaveLength(6);
    expect(checks.every((c) => typeof c.label === "string")).toBe(true);

    const passwordReset = checks.find((c) => c.label.includes("password_reset_attempts"));
    expect(passwordReset?.ok).toBe(false);

    const auditLog = checks.find((c) => c.label.includes("audit_log"));
    expect(auditLog?.ok).toBe(true);
  });
});
