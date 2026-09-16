import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { getBlocks } from "@/services/waterService";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("hydro_pulse_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const blocks = await getBlocks();

  return NextResponse.json({ blocks });
}
