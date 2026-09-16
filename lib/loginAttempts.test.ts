import { describe, expect, it } from "vitest";
import { normalizeEmail, resolveLockStatus } from "./loginAttempts";

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases the email", () => {
    expect(normalizeEmail("  Admin@Teste.COM  ")).toBe("admin@teste.com");
  });
});

describe("resolveLockStatus", () => {
  it("is not locked when there is no locked_until value", () => {
    expect(resolveLockStatus(null)).toEqual({ locked: false, minutesRemaining: 0 });
  });

  it("is not locked once the lock has expired", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(resolveLockStatus(past)).toEqual({ locked: false, minutesRemaining: 0 });
  });

  it("is locked with minutes remaining rounded up while still in the future", () => {
    const now = Date.now();
    const future = new Date(now + 5 * 60_000 + 1000).toISOString();
    const result = resolveLockStatus(future, now);

    expect(result.locked).toBe(true);
    expect(result.minutesRemaining).toBe(6);
  });
});
