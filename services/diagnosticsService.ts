import { sql } from "@/lib/db";

export type SchemaCheck = {
  label: string;
  ok: boolean;
};

type SchemaCheckRow = {
  login_attempts: boolean;
  audit_log: boolean;
  password_reset_attempts: boolean;
  sensors_secret: boolean;
  condominium_contacts: boolean;
  reservoirs_high_level: boolean;
};

export async function getSchemaChecks(): Promise<SchemaCheck[]> {
  const rows = (await sql`
    select
      exists (
        select 1 from information_schema.tables where table_name = 'login_attempts'
      ) as login_attempts,
      exists (
        select 1 from information_schema.tables where table_name = 'audit_log'
      ) as audit_log,
      exists (
        select 1 from information_schema.tables where table_name = 'password_reset_attempts'
      ) as password_reset_attempts,
      exists (
        select 1 from information_schema.columns
        where table_name = 'sensors' and column_name = 'secret'
      ) as sensors_secret,
      exists (
        select 1 from information_schema.tables where table_name = 'condominium_contacts'
      ) as condominium_contacts,
      exists (
        select 1 from information_schema.columns
        where table_name = 'reservoirs' and column_name = 'high_level_percent'
      ) as reservoirs_high_level
  `) as SchemaCheckRow[];

  const row = rows[0];

  return [
    { label: "login_attempts — limite de tentativas de login", ok: row.login_attempts },
    { label: "audit_log — registro de auditoria", ok: row.audit_log },
    {
      label: "password_reset_attempts — limite de recuperação de senha",
      ok: row.password_reset_attempts,
    },
    { label: "sensors.secret — chave individual por sensor", ok: row.sensors_secret },
    { label: "condominium_contacts — contatos de alerta por WhatsApp", ok: row.condominium_contacts },
    {
      label: "reservoirs.high_level_percent — limite de transbordamento",
      ok: row.reservoirs_high_level,
    },
  ];
}
