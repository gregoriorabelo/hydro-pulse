import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyResetToken } from "@/lib/passwordReset";
import { clearAttempts } from "@/lib/loginAttempts";

type UserRow = { email: string };

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    const userId = await verifyResetToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: "Link inválido ou expirado. Peça um novo." },
        { status: 400 }
      );
    }

    const passwordHash = await hash(newPassword, 12);

    const rows = (await sql`
      update users set password_hash = ${passwordHash}
      where id = ${userId}
      returning email
    `) as UserRow[];

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    await clearAttempts(user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
