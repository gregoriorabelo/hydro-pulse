-- Adiciona controle de tentativas de login (bloqueio temporário por e-mail).
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

create table if not exists login_attempts (
  email text primary key,
  attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
