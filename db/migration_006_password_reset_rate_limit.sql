-- Limita quantas vezes "esqueci minha senha" pode ser pedido pro mesmo
-- e-mail, pra evitar spam de e-mails de redefinição.
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

create table if not exists password_reset_attempts (
  email text primary key,
  attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);
