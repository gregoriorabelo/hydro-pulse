# HydroPulse

Monitoramento hídrico inteligente para condomínios, com visão operacional,
alertas preventivos e inteligência gerencial.

## Variáveis de ambiente

Crie um arquivo `.env.local` (nunca comitado) com:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do banco Postgres (Neon). |
| `AUTH_SECRET` | Segredo usado para assinar o cookie de sessão. Gere com `openssl rand -hex 32`. |
| `SENSOR_API_KEY` | Chave exigida no header `x-api-key` para os sensores enviarem leituras via `POST /api/readings`. |

## Banco de dados

O schema (tabelas `users`, `blocks`, `readings`) está em [`db/schema.sql`](./db/schema.sql).
Rode esse arquivo uma vez no seu banco Neon (ex.: pelo SQL Editor do painel Neon).

## Criando o primeiro usuário

Não há tela de cadastro — o acesso é só para os administradores. Crie/atualize
um usuário com:

```bash
DATABASE_URL="postgresql://..." node scripts/create-user.mjs seu-email@exemplo.com sua-senha
```

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy

Importe o repositório na [Vercel](https://vercel.com/new) e configure as
três variáveis de ambiente acima nas configurações do projeto antes do
primeiro deploy.
