import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth";
import {
  acceptInviteForExistingUser,
  acceptInviteForNewUser,
  getInviteDetails,
} from "@/services/teamService";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "token é obrigatório" }, { status: 400 });
  }

  const result = await getInviteDetails(token);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    condominiumName: result.condominiumName,
    role: result.role,
    email: result.email,
    hasAccount: result.hasAccount,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    token?: string;
    password?: string;
    name?: string;
  };

  if (!body.token) {
    return NextResponse.json({ error: "token é obrigatório" }, { status: 400 });
  }

  const details = await getInviteDetails(body.token);

  if (!details.ok) {
    return NextResponse.json({ error: details.error }, { status: 400 });
  }

  if (details.hasAccount) {
    const session = await requireSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Entre com sua conta para aceitar este convite.", requiresLogin: true },
        { status: 401 }
      );
    }

    const result = await acceptInviteForExistingUser(body.token, session.userId, session.email);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  if (!body.password) {
    return NextResponse.json({ error: "password é obrigatório" }, { status: 400 });
  }

  const result = await acceptInviteForNewUser(body.token, body.password, body.name ?? null);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const sessionToken = await createSessionToken({
    userId: result.userId,
    email: result.email,
    role: "operador",
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieOptions.name, sessionToken, sessionCookieOptions);

  return response;
}
