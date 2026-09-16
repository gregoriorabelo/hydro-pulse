import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createUser, listUsers } from "@/services/userService";
import type { UserInput } from "@/types/entities";

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const users = await listUsers();

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as UserInput;

  if (!body.email || !body.password || !body.role) {
    return NextResponse.json(
      { error: "email, password e role são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const user = await createUser(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "Já existe um usuário com esse e-mail" },
        { status: 409 }
      );
    }

    throw error;
  }
}
