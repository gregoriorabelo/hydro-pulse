import { sql } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

export type AuditAction = "create" | "update" | "delete" | "status_change";
export type AuditEntityType =
  | "condominium"
  | "block"
  | "reservoir"
  | "sensor"
  | "user";

export async function logAudit(params: {
  session: SessionPayload;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const { session, action, entityType, entityId, details } = params;

  await sql`
    insert into audit_log (user_id, user_email, action, entity_type, entity_id, details)
    values (
      ${session.userId}, ${session.email}, ${action}, ${entityType}, ${entityId},
      ${details ? JSON.stringify(details) : null}
    )
  `;
}
