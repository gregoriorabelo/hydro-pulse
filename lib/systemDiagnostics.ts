export type EnvCheck = {
  key: string;
  label: string;
  required: boolean;
  configured: boolean;
};

const ENV_VARS: { key: string; label: string; required: boolean }[] = [
  { key: "DATABASE_URL", label: "Banco de dados (Neon)", required: true },
  { key: "AUTH_SECRET", label: "Assinatura da sessão", required: true },
  { key: "RESEND_API_KEY", label: "Envio de e-mail (Resend)", required: false },
  { key: "EMAIL_FROM", label: "Remetente dos e-mails", required: false },
  { key: "WHATSAPP_ACCESS_TOKEN", label: "WhatsApp Business (token)", required: false },
  { key: "WHATSAPP_PHONE_NUMBER_ID", label: "WhatsApp Business (telefone)", required: false },
  { key: "SENTRY_DSN", label: "Monitoramento de erros (Sentry)", required: false },
];

/**
 * Verifica só se cada variável de ambiente está presente, sem nunca expor
 * o valor — nem para a conta master.
 */
export function checkEnvVars(env: Record<string, string | undefined>): EnvCheck[] {
  return ENV_VARS.map(({ key, label, required }) => ({
    key,
    label,
    required,
    configured: Boolean(env[key]),
  }));
}
