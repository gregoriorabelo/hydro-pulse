import { describe, expect, it } from "vitest";
import { checkEnvVars } from "./systemDiagnostics";

describe("checkEnvVars", () => {
  it("marks a variable as configured when present and non-empty", () => {
    const result = checkEnvVars({ DATABASE_URL: "postgres://x" });

    const check = result.find((c) => c.key === "DATABASE_URL");
    expect(check?.configured).toBe(true);
  });

  it("marks a variable as not configured when missing", () => {
    const result = checkEnvVars({});

    const check = result.find((c) => c.key === "AUTH_SECRET");
    expect(check?.configured).toBe(false);
  });

  it("marks a variable as not configured when set to an empty string", () => {
    const result = checkEnvVars({ RESEND_API_KEY: "" });

    const check = result.find((c) => c.key === "RESEND_API_KEY");
    expect(check?.configured).toBe(false);
  });

  it("never includes the actual value of any variable", () => {
    const result = checkEnvVars({ AUTH_SECRET: "super-secreto" });

    expect(JSON.stringify(result)).not.toContain("super-secreto");
  });
});
