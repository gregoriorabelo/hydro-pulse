import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireSession } from "@/lib/session";
import { getCondominiumRole } from "@/lib/access";
import { getNiveisReport } from "@/services/reportService";
import NiveisReportDocument from "@/components/reports/NiveisReportDocument";

export async function GET(request: NextRequest) {
  const session = await requireSession(request);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const condominiumId = searchParams.get("condominiumId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!condominiumId || !from || !to) {
    return NextResponse.json(
      { error: "condominiumId, from e to são obrigatórios" },
      { status: 400 }
    );
  }

  const role = await getCondominiumRole(session, condominiumId);

  if (!role) {
    return NextResponse.json({ error: "Sem acesso a este condomínio" }, { status: 403 });
  }

  const report = await getNiveisReport(condominiumId, from, `${to} 23:59:59`);

  if (!report) {
    return NextResponse.json({ error: "Condomínio não encontrado" }, { status: 404 });
  }

  const buffer = await renderToBuffer(NiveisReportDocument({ report }));
  const fileName = `relatorio-niveis-${report.condominiumName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${from}-a-${to}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
