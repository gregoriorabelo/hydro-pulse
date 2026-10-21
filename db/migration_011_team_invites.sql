-- Migração 011: convites de equipe com aceite explícito.
-- Antes, convidar alguém pela tela Equipe dava acesso imediato ao
-- condomínio, mesmo pra um e-mail de conta já existente, sem a pessoa
-- confirmar nada. Agora o convite fica pendente até a própria pessoa
-- aceitar (clicando no link do e-mail) — essencial pra operar em
-- grande escala, sem o síndico/admin de cada condomínio precisar ser
-- confiável quanto a avisar antes de adicionar alguém.
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

create table if not exists team_invites (
  id uuid primary key default gen_random_uuid(),
  condominium_id uuid not null references condominiums(id) on delete cascade,
  email text not null,
  role text not null check (role in ('sindico', 'operador', 'visualizador')),
  invited_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz
);

create index if not exists team_invites_condominium_id_idx
  on team_invites (condominium_id);
create index if not exists team_invites_email_idx on team_invites (email);
