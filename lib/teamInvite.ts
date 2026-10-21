import { SignJWT, jwtVerify } from "jose";

const INVITE_DURATION_SECONDS = 7 * 24 * 60 * 60;

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET não está configurada.");
  }

  return new TextEncoder().encode(secret);
}

export async function createTeamInviteToken(inviteId: string): Promise<string> {
  return new SignJWT({ inviteId, purpose: "team_invite" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${INVITE_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyTeamInviteToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (payload.purpose !== "team_invite" || typeof payload.inviteId !== "string") {
      return null;
    }

    return payload.inviteId;
  } catch {
    return null;
  }
}
