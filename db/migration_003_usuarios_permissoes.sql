-- Adiciona papéis de usuário e vínculo usuário <-> condomínio.
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

alter table users add column if not exists name text;
alter table users add column if not exists role text not null default 'operador'
  check (role in ('admin', 'operador'));

-- Usuários já existentes (criados antes desta migração) viram admin,
-- para não perder acesso ao sistema.
update users set role = 'admin' where role = 'operador';

create table if not exists user_condominiums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  condominium_id uuid not null references condominiums(id) on delete cascade,
  role text not null default 'visualizador'
    check (role in ('admin', 'sindico', 'operador', 'visualizador')),
  created_at timestamptz not null default now(),
  unique (user_id, condominium_id)
);

create index if not exists user_condominiums_user_id_idx on user_condominiums (user_id);
create index if not exists user_condominiums_condominium_id_idx on user_condominiums (condominium_id);
