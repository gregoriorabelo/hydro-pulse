import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function requireSession(request: NextRequest) {
  const token = request.cookies.get("hydro_pulse_session")?.value;
  return token ? await verifySessionToken(token) : null;
}
