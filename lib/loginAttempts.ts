import { sql } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type AttemptRow = {
  attempts: number;
  locked_until: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getLockStatus(email: string): Promise<{
  locked: boolean;
  minutesRemaining: number;
}> {
  const rows = (await sql`
    select attempts, locked_until from login_attempts where email = ${normalizeEmail(email)}
  `) as AttemptRow[];

  const row = rows[0];

  if (!row?.locked_until) {
    return { locked: false, minutesRemaining: 0 };
  }

  const lockedUntil = new Date(row.locked_until).getTime();
  const now = Date.now();

  if (lockedUntil <= now) {
    return { locked: false, minutesRemaining: 0 };
  }

  return { locked: true, minutesRemaining: Math.ceil((lockedUntil - now) / 60000) };
}

export async function recordFailedAttempt(email: string): Promise<void> {
  const normalized = normalizeEmail(email);

  const rows = (await sql`
    insert into login_attempts (email, attempts, updated_at)
    values (${normalized}, 1, now())
    on conflict (email) do update set
      attempts = login_attempts.attempts + 1,
      updated_at = now()
    returning attempts
  `) as AttemptRow[];

  const attempts = rows[0]?.attempts ?? 1;

  if (attempts >= MAX_ATTEMPTS) {
    await sql`
      update login_attempts set
        locked_until = now() + make_interval(mins => ${LOCK_MINUTES}),
        attempts = 0
      where email = ${normalized}
    `;
  }
}

export async function clearAttempts(email: string): Promise<void> {
  await sql`delete from login_attempts where email = ${normalizeEmail(email)}`;
}
