create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sensor_identifier text unique,
  created_at timestamptz not null default now()
);

create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references blocks(id) on delete cascade,
  water_level numeric not null,
  depth_cm numeric,
  recorded_at timestamptz not null default now()
);

create index if not exists readings_block_id_recorded_at_idx
  on readings (block_id, recorded_at desc);
