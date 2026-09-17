-- Contatos de WhatsApp por condomínio, para receber alertas de nível
-- crítico mesmo sem ter login no HydroPulse (ex.: zelador, síndico).
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

create table if not exists condominium_contacts (
  id uuid primary key default gen_random_uuid(),
  condominium_id uuid not null references condominiums(id) on delete cascade,
  name text not null,
  phone_number text not null,
  created_at timestamptz not null default now()
);

create index if not exists condominium_contacts_condominium_id_idx
  on condominium_contacts (condominium_id);
