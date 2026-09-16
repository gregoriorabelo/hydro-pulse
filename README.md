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
| `RESEND_API_KEY` | Chave da API do [Resend](https://resend.com), usada para enviar e-mails de redefinição de senha e alertas de nível crítico. Sem ela, esses e-mails simplesmente não são enviados (o resto do app funciona normalmente). |
| `EMAIL_FROM` | (Opcional) Remetente dos e-mails, ex.: `HydroPulse <naoresponda@seudominio.com.br>`. Sem domínio verificado no Resend, usa o padrão de testes `onboarding@resend.dev` (só entrega para o e-mail da sua própria conta Resend). |
| `NEXT_PUBLIC_APP_URL` | (Opcional) URL pública do app, usada para montar o link de redefinição de senha no e-mail. Sem ela, usa a URL da própria requisição. |

## Banco de dados

O schema completo (`users`, `condominiums`, `blocks`, `reservoirs`, `sensors`,
`readings`) está em [`db/schema.sql`](./db/schema.sql). Para um banco novo,
rode esse arquivo uma vez no SQL Editor do Neon.

Se o seu banco já tinha o schema antigo (só `blocks`/`readings`, sem
condomínios), rode em vez disso
[`db/migration_002_condominios_reservatorios.sql`](./db/migration_002_condominios_reservatorios.sql)
para atualizar a estrutura existente.

## Estrutura de dados

- **Condomínio** → **Bloco** (torre/setor) → **Reservatório** (caixa
  d'água/cisterna, com limites de nível crítico/atenção próprios) →
  **Sensor** (vinculado a um bloco e, opcionalmente, a um reservatório).
- Leituras (`readings`) são sempre associadas a um reservatório.
- O Painel (`/`) e os Alertas usam o reservatório ativo selecionado como
  condomínio de contexto (seletor na barra lateral).

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
