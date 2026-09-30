-- Migração 010: papel "master" (operador da plataforma) substitui o antigo
-- papel global "admin", que dava acesso irrestrito a TODOS os condomínios
-- cadastrados (inclusive de outros clientes/contas pagantes). Agora só
-- quem for "master" enxerga e gerencia a plataforma inteira; o papel
-- "admin" por condomínio (tabela user_condominiums) continua dando
-- controle total, mas só dentro do condomínio do próprio cliente.
--
-- IMPORTANTE: rode isso só DEPOIS que o deploy com o código novo já tiver
-- terminado (não antes). Depois de rodar, sua sessão atual vai expirar —
-- é só sair e entrar de novo que a conta volta ao normal, já como master.
-- Rode este arquivo no seu banco Neon existente (SQL editor ou psql).

alter table users drop constraint if exists users_role_check;

update users set role = 'master' where role = 'admin';

alter table users add constraint users_role_check check (role in ('master', 'operador'));

alter table users alter column role set default 'operador';
