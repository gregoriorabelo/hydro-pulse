const GRAPH_API_VERSION = "v21.0";
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME ?? "alerta_critico";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG ?? "pt_BR";

function normalizePhoneNumber(raw: string): string {
  // A Cloud API espera dígitos com código do país, sem símbolos (ex.: 5511999998888).
  return raw.replace(/\D/g, "");
}

export async function sendCriticalAlertWhatsApp(params: {
  to: string;
  reservoirName: string;
  blockName: string;
  levelPercent: number;
  criticalLevelPercent: number;
}): Promise<{ sent: boolean; error?: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.warn("[whatsapp] WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID não configurados — mensagem não enviada.");
    return { sent: false, error: "WhatsApp não configurado" };
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhoneNumber(params.to),
        type: "template",
        template: {
          name: TEMPLATE_NAME,
          language: { code: TEMPLATE_LANG },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: params.reservoirName },
                { type: "text", text: params.blockName },
                { type: "text", text: String(params.levelPercent) },
                { type: "text", text: String(params.criticalLevelPercent) },
              ],
            },
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error(`[whatsapp] Falha ao enviar (status ${response.status}):`, errorBody);
    return { sent: false, error: `status ${response.status}` };
  }

  return { sent: true };
}
