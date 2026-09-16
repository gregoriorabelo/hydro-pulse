import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { sql } from "@/lib/db";

type UserRow = { name: string | null };

export async function GET(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = (await sql`
    select name from users where id = ${session.userId}
  `) as UserRow[];

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    role: session.role,
    name: rows[0]?.name ?? null,
  });
}
