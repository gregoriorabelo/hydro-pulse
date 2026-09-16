import { SignJWT, jwtVerify } from "jose";

const RESET_DURATION_SECONDS = 30 * 60;

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET não está configurada.");
  }

  return new TextEncoder().encode(secret);
}

export async function createResetToken(userId: string): Promise<string> {
  return new SignJWT({ userId, purpose: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${RESET_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyResetToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (payload.purpose !== "password_reset" || typeof payload.userId !== "string") {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}
