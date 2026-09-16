import { NextResponse } from "next/server";

export async function GET() {
  throw new Error("Teste de integração do Sentry — pode ignorar/remover depois de ver no Sentry.");
}

export function OPTIONS() {
  return NextResponse.json({ ok: true });
}
