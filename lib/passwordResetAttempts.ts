import { sql } from "@/lib/db";
import { normalizeEmail, resolveLockStatus } from "@/lib/loginAttempts";

const MAX_REQUESTS = 3;
const LOCK_MINUTES = 60;

type AttemptRow = { attempts: number; locked_until: string | null };

export async function getResetLockStatus(email: string): Promise<{
  locked: boolean;
  minutesRemaining: number;
}> {
  const rows = (await sql`
    select attempts, locked_until from password_reset_attempts
    where email = ${normalizeEmail(email)}
  `) as AttemptRow[];

  return resolveLockStatus(rows[0]?.locked_until ?? null);
}

export async function recordResetRequest(email: string): Promise<void> {
  const normalized = normalizeEmail(email);

  const rows = (await sql`
    insert into password_reset_attempts (email, attempts, updated_at)
    values (${normalized}, 1, now())
    on conflict (email) do update set
      attempts = password_reset_attempts.attempts + 1,
      updated_at = now()
    returning attempts
  `) as AttemptRow[];

  const attempts = rows[0]?.attempts ?? 1;

  if (attempts >= MAX_REQUESTS) {
    await sql`
      update password_reset_attempts set
        locked_until = now() + make_interval(mins => ${LOCK_MINUTES}),
        attempts = 0
      where email = ${normalized}
    `;
  }
}
