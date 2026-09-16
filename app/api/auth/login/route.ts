import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: "admin" | "operador";
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    const rows = (await sql`
      select id, email, password_hash, role from users where email = ${email}
    `) as UserRow[];

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 }
      );
    }

    const passwordMatches = await compare(password, user.password_hash);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
