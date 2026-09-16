import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { sql } from "@/lib/db";

type UserRow = { name: string | null; password_hash?: string };

export async function GET(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = (await sql`
    select name from users where id = ${session.userId}
  `) as UserRow[];

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    role: session.role,
    name: rows[0]?.name ?? null,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string | null;
    currentPassword?: string;
    newPassword?: string;
  };

  if (!body.currentPassword) {
    return NextResponse.json(
      { error: "Informe sua senha atual para confirmar as alterações." },
      { status: 400 }
    );
  }

  const rows = (await sql`
    select password_hash from users where id = ${session.userId}
  `) as UserRow[];

  const user = rows[0];

  if (!user?.password_hash) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const passwordMatches = await compare(body.currentPassword, user.password_hash);

  if (!passwordMatches) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  if (body.newPassword) {
    const newPasswordHash = await hash(body.newPassword, 12);

    await sql`
      update users set name = ${body.name ?? null}, password_hash = ${newPasswordHash}
      where id = ${session.userId}
    `;
  } else {
    await sql`
      update users set name = ${body.name ?? null}
      where id = ${session.userId}
    `;
  }

  return NextResponse.json({ success: true });
}
