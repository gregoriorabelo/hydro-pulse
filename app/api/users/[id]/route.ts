import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { deleteUser, updateUser } from "@/services/userService";
import type { UserInput } from "@/types/entities";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as UserInput;

  if (!body.email || !body.role) {
    return NextResponse.json({ error: "email e role são obrigatórios" }, { status: 400 });
  }

  try {
    const user = await updateUser(id, body);

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await logAudit({
      session,
      action: "update",
      entityType: "user",
      entityId: id,
      details: { email: user.email, role: user.role },
    });

    return NextResponse.json({ user });
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.userId) {
    return NextResponse.json(
      { error: "Você não pode excluir o seu próprio usuário" },
      { status: 400 }
    );
  }

  await deleteUser(id);

  await logAudit({ session, action: "delete", entityType: "user", entityId: id });

  return NextResponse.json({ success: true });
}
