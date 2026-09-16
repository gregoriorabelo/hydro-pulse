import { Resend } from "resend";

const FROM_EMAIL = process.env.EMAIL_FROM ?? "HydroPulse <onboarding@resend.dev>";

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  const client = getClient();

  if (!client) {
    console.warn("RESEND_API_KEY não configurada — e-mail não enviado.");
    return { sent: false, error: "E-mail não configurado" };
  }

  const result = await client.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (result.error) {
    console.error("Falha ao enviar e-mail:", result.error);
    return { sent: false, error: result.error.message };
  }

  return { sent: true };
}
