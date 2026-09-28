-- Migração 009: faixas operacionais de nível dos reservatórios
-- Mantém atenção em 60%, altera o limite crítico padrão para 30%
-- e adiciona o limite superior de risco de transbordamento em 95%.

alter table reservoirs
  add column if not exists high_level_percent numeric not null default 95;

alter table reservoirs
  alter column critical_level_percent set default 30;

-- Converte somente o antigo valor-padrão de 35% para o novo padrão de 30%.
-- Valores personalizados diferentes de 35% são preservados.
update reservoirs
set critical_level_percent = 30
where critical_level_percent = 35;
