import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { sendCriticalAlertWhatsApp } from "@/lib/whatsapp";
import { calculateStatus } from "@/lib/reservoirStatus";

type ReservoirRow = {
  id: string;
  name: string;
  status: "ativo" | "pausado";
  critical_level_percent: string;
  attention_level_percent: string;
  block_name: string;
  condominium_id: string;
  condominium_name: string;
};

type RecipientRow = { email: string };
type ContactRow = { phone_number: string };

export async function notifyIfEnteredCritical(
  reservoirId: string,
  newLevel: number,
  previousLevel: number | null
): Promise<void> {
  try {
    const rows = (await sql`
      select
        r.id, r.name, r.status, r.critical_level_percent, r.attention_level_percent,
        b.name as block_name, b.condominium_id, c.name as condominium_name
      from reservoirs r
      join blocks b on b.id = r.block_id
      join condominiums c on c.id = b.condominium_id
      where r.id = ${reservoirId}
    `) as ReservoirRow[];

    const reservoir = rows[0];

    if (!reservoir) return;

    const criticalLevel = Number(reservoir.critical_level_percent);
    const attentionLevel = Number(reservoir.attention_level_percent);

    const newStatus = calculateStatus(
      reservoir.status,
      true,
      newLevel,
      criticalLevel,
      attentionLevel
    );

    if (newStatus !== "Crítico") return;

    const previousStatus =
      previousLevel === null
        ? null
        : calculateStatus(reservoir.status, true, previousLevel, criticalLevel, attentionLevel);

    // Só notifica na transição para Crítico, para não reenviar a cada leitura.
    if (previousStatus === "Crítico") return;

    const recipients = (await sql`
      select distinct email from users where role = 'admin'
      union
      select distinct u.email
      from users u
      join user_condominiums uc on uc.user_id = u.id
      where uc.condominium_id = ${reservoir.condominium_id}
        and uc.role in ('admin', 'sindico', 'operador')
    `) as RecipientRow[];

    const contacts = (await sql`
      select phone_number from condominium_contacts
      where condominium_id = ${reservoir.condominium_id}
    `) as ContactRow[];

    await Promise.all([
      ...recipients.map((recipient) =>
        sendEmail({
          to: recipient.email,
          subject: `Nível crítico — ${reservoir.name} (${reservoir.condominium_name})`,
          html: `
            <p>O reservatório <strong>${reservoir.name}</strong> (bloco ${reservoir.block_name},
            ${reservoir.condominium_name}) atingiu nível crítico.</p>
            <p>Nível atual: <strong>${newLevel}%</strong> (limite crítico: ${criticalLevel}%)</p>
            <p>Acesse o HydroPulse para mais detalhes.</p>
          `,
        })
      ),
      ...contacts.map((contact) =>
        sendCriticalAlertWhatsApp({
          to: contact.phone_number,
          reservoirName: reservoir.name,
          blockName: reservoir.block_name,
          levelPercent: newLevel,
          criticalLevelPercent: criticalLevel,
        })
      ),
    ]);
  } catch (error) {
    console.error("Falha ao notificar nível crítico:", error);
  }
}
