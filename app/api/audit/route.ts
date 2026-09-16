import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";
import { sql } from "@/lib/db";

type AuditRow = {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const rows = (await sql`
    select id, user_email, action, entity_type, entity_id, details, created_at
    from audit_log
    order by created_at desc
    limit 200
  `) as AuditRow[];

  return NextResponse.json({
    entries: rows.map((row) => ({
      id: row.id,
      userEmail: row.user_email,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: row.details,
      createdAt: row.created_at,
    })),
  });
}
