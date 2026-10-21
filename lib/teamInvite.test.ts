import { describe, expect, it } from "vitest";
import { createTeamInviteToken, verifyTeamInviteToken } from "./teamInvite";

describe("team invite token", () => {
  it("round-trips the invite id", async () => {
    const token = await createTeamInviteToken("invite-123");
    expect(await verifyTeamInviteToken(token)).toBe("invite-123");
  });

  it("rejects a garbage token", async () => {
    expect(await verifyTeamInviteToken("not-a-real-token")).toBeNull();
  });

  it("rejects a password-reset token (different purpose)", async () => {
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    const token = await new SignJWT({ userId: "u1", purpose: "password_reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(secret);

    expect(await verifyTeamInviteToken(token)).toBeNull();
  });
});
