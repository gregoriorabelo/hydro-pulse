-- Migração 002: Condomínios, Reservatórios e Sensores
-- Rode isso no SQL Editor do seu projeto Neon (depois do schema.sql original).

create table if not exists condominiums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  cnpj text,
  phone text,
  responsible_name text,
  address text,
  blocks_expected integer,
  units_expected integer,
  reservoirs_expected integer,
  created_at timestamptz not null default now()
);

alter table blocks add column if not exists condominium_id uuid references condominiums(id) on delete cascade;

create table if not exists reservoirs (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks(id) on delete cascade,
  name text not null,
  type text not null default 'Superior' check (type in ('Superior', 'Inferior', 'Cisterna', 'Reúso')),
  capacity_liters numeric,
  total_depth_cm numeric,
  useful_height_cm numeric,
  min_operational_volume_liters numeric,
  critical_level_percent numeric not null default 35,
  attention_level_percent numeric not null default 60,
  reading_interval_minutes numeric,
  expected_autonomy_hours numeric,
  status text not null default 'ativo' check (status in ('ativo', 'pausado')),
  created_at timestamptz not null default now()
);

create table if not exists sensors (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks(id) on delete cascade,
  reservoir_id uuid references reservoirs(id) on delete set null,
  name text not null,
  serial text unique not null,
  model text,
  created_at timestamptz not null default now()
);

alter table readings add column if not exists reservoir_id uuid references reservoirs(id) on delete cascade;

-- As colunas antigas (blocks.sensor_identifier e readings.block_id) não são mais usadas.
-- Como ainda não há sensor físico real conectado, é seguro removê-las agora.
alter table blocks drop column if exists sensor_identifier;
alter table readings drop column if exists block_id;

create index if not exists blocks_condominium_id_idx on blocks (condominium_id);
create index if not exists reservoirs_block_id_idx on reservoirs (block_id);
create index if not exists sensors_block_id_idx on sensors (block_id);
create index if not exists readings_reservoir_id_recorded_at_idx
  on readings (reservoir_id, recorded_at desc);
