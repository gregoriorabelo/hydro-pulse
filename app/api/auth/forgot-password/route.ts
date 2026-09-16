import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createResetToken } from "@/lib/passwordReset";
import { sendEmail } from "@/lib/email";

type UserRow = { id: string; email: string; name: string | null };

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });
    }

    const rows = (await sql`
      select id, email, name from users where email = ${email}
    `) as UserRow[];

    const user = rows[0];

    if (user) {
      const token = await createResetToken(user.id);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
      const resetLink = `${appUrl}/reset-senha?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: "Redefinir senha — HydroPulse",
        html: `
          <p>Olá${user.name ? `, ${user.name}` : ""},</p>
          <p>Recebemos um pedido para redefinir a senha da sua conta no HydroPulse.</p>
          <p><a href="${resetLink}">Clique aqui para escolher uma nova senha</a></p>
          <p>Esse link expira em 30 minutos. Se você não pediu isso, pode ignorar este e-mail.</p>
        `,
      });
    }

    // Sempre responde sucesso, exista o e-mail ou não, para não vazar quais contas existem.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
