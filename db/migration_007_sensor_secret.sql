-- Substitui a SENSOR_API_KEY global (compartilhada por todos os sensores)
-- por um segredo individual por sensor. Cada sensor cadastrado passa a
-- ter sua própria chave; vazar a chave de um sensor não compromete os
-- outros clientes/condomínios.
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

alter table sensors
  add column if not exists secret text;

-- Gera um segredo para os sensores que já existiam antes desta migração.
update sensors set secret = encode(gen_random_bytes(24), 'hex') where secret is null;

alter table sensors
  alter column secret set not null,
  alter column secret set default encode(gen_random_bytes(24), 'hex');
