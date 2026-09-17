# HydroPulse

Monitoramento hídrico inteligente para condomínios, com visão operacional,
alertas preventivos e inteligência gerencial.

## Variáveis de ambiente

Crie um arquivo `.env.local` (nunca comitado) com:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do banco Postgres (Neon). |
| `AUTH_SECRET` | Segredo usado para assinar o cookie de sessão. Gere com `openssl rand -hex 32`. |
| `RESEND_API_KEY` | Chave da API do [Resend](https://resend.com), usada para enviar e-mails de redefinição de senha e alertas de nível crítico. Sem ela, esses e-mails simplesmente não são enviados (o resto do app funciona normalmente). |
| `EMAIL_FROM` | (Opcional) Remetente dos e-mails, ex.: `HydroPulse <naoresponda@seudominio.com.br>`. Sem domínio verificado no Resend, usa o padrão de testes `onboarding@resend.dev` (só entrega para o e-mail da sua própria conta Resend). |
| `NEXT_PUBLIC_APP_URL` | (Opcional) URL pública do app, usada para montar o link de redefinição de senha no e-mail. Sem ela, usa a URL da própria requisição. |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do projeto no [Sentry](https://sentry.io), usado para capturar erros em produção (cliente e servidor). Sem ela, o Sentry fica desativado e o resto do app funciona normalmente. |
| `SENTRY_ORG` / `SENTRY_PROJECT` | (Opcional) Slugs da organização e do projeto no Sentry, usados só durante o build pra enviar source maps (facilita ler stack traces de código minificado). |
| `SENTRY_AUTH_TOKEN` | (Opcional, sensível) Token do Sentry para o build enviar os source maps. Sem ele, os erros continuam sendo capturados normalmente — só o stack trace fica menos legível. Gere em Sentry → Settings → Auth Tokens, com o escopo `project:releases`. |
| `WHATSAPP_ACCESS_TOKEN` | Token de acesso da [Meta Cloud API](https://developers.facebook.com) (WhatsApp Business), usado para enviar alerta de nível crítico aos contatos cadastrados em cada condomínio. Sem ele, o alerta por WhatsApp é simplesmente pulado (e-mail continua funcionando normalmente). |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número de telefone do WhatsApp Business (aparece em WhatsApp → API Setup no painel do Meta for Developers). |
| `WHATSAPP_TEMPLATE_NAME` / `WHATSAPP_TEMPLATE_LANG` | (Opcional) Nome e idioma do template aprovado no WhatsApp Manager usado para o alerta. Padrão: `alerta_critico` / `pt_BR`. |

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
- Cada **sensor** tem sua própria chave (`sensors.secret`), gerada
  automaticamente e mostrada uma única vez na tela Sensores (ou ao clicar em
  "Gerar nova chave"). Não existe mais uma `SENSOR_API_KEY` única
  compartilhada por todos os sensores — se a chave de um vazar, só aquele
  sensor precisa ser regenerado.

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
