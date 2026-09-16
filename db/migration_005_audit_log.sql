-- Adiciona log de auditoria (quem mudou o quê e quando).
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  user_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on audit_log (created_at desc);
