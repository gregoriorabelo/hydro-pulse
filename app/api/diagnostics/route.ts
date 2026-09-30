import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireMaster } from "@/lib/session";
import { checkEnvVars } from "@/lib/systemDiagnostics";
import { getSchemaChecks } from "@/services/diagnosticsService";

export async function GET(request: NextRequest) {
  const session = await requireMaster(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const [schema, env] = await Promise.all([
    getSchemaChecks(),
    Promise.resolve(checkEnvVars(process.env)),
  ]);

  return NextResponse.json({ schema, env });
}
