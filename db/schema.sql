create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  password_hash text not null,
  role text not null default 'operador' check (role in ('admin', 'operador')),
  created_at timestamptz not null default now()
);

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

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  condominium_id uuid not null references condominiums(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

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

create table if not exists user_condominiums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  condominium_id uuid not null references condominiums(id) on delete cascade,
  role text not null default 'visualizador'
    check (role in ('admin', 'sindico', 'operador', 'visualizador')),
  created_at timestamptz not null default now(),
  unique (user_id, condominium_id)
);

create table if not exists login_attempts (
  email text primary key,
  attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  reservoir_id uuid not null references reservoirs(id) on delete cascade,
  water_level numeric not null,
  depth_cm numeric,
  recorded_at timestamptz not null default now()
);

create index if not exists user_condominiums_user_id_idx on user_condominiums (user_id);
create index if not exists user_condominiums_condominium_id_idx on user_condominiums (condominium_id);
create index if not exists blocks_condominium_id_idx on blocks (condominium_id);
create index if not exists reservoirs_block_id_idx on reservoirs (block_id);
create index if not exists sensors_block_id_idx on sensors (block_id);
create index if not exists readings_reservoir_id_recorded_at_idx
  on readings (reservoir_id, recorded_at desc);
