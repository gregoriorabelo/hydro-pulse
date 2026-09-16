import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { NiveisReport } from "@/services/reportService";

const COLORS = {
  deep: "#071522",
  petrol: "#0A1F2E",
  tech: "#0088CC",
  cyan: "#00B8FF",
  gray: "#6B7684",
  border: "#D9DEE3",
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#1A1F26",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.tech,
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.deep,
  },
  brandCyan: {
    color: COLORS.tech,
  },
  meta: {
    fontSize: 9,
    color: COLORS.gray,
    textAlign: "right",
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
    color: COLORS.deep,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 16,
  },
  reservoirBlock: {
    marginBottom: 18,
  },
  reservoirHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.petrol,
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  reservoirTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 700,
  },
  reservoirSubtitle: {
    color: "#B8C4CE",
    fontSize: 9,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 12,
  },
  summaryItem: {
    fontSize: 9,
    color: "#3A4149",
  },
  summaryLabel: {
    color: COLORS.gray,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F4F7",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  cellDate: { width: "35%", fontSize: 9 },
  cellLevel: { width: "30%", fontSize: 9 },
  cellDepth: { width: "35%", fontSize: 9 },
  headerCell: { fontSize: 9, fontWeight: 700, color: COLORS.gray },
  emptyState: {
    fontSize: 9,
    color: COLORS.gray,
    fontStyle: "italic",
    padding: 8,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 8,
    color: COLORS.gray,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
});

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function NiveisReportDocument({ report }: { report: NiveisReport }) {
  return (
    <Document title={`Relatório de Níveis - ${report.condominiumName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brand}>
            Hydro<Text style={styles.brandCyan}>Pulse</Text>
          </Text>

          <Text style={styles.meta}>
            Gerado em {new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
          </Text>
        </View>

        <Text style={styles.title}>Relatório de Níveis — {report.condominiumName}</Text>
        <Text style={styles.subtitle}>
          Período: {formatDate(report.from)} a {formatDate(report.to)}
        </Text>

        {report.reservoirs.length === 0 && (
          <Text style={styles.emptyState}>
            Nenhum reservatório cadastrado para este condomínio.
          </Text>
        )}

        {report.reservoirs.map((reservoir) => (
          <View key={`${reservoir.blockName}-${reservoir.reservoirName}`} style={styles.reservoirBlock} wrap={false}>
            <View style={styles.reservoirHeader}>
              <View>
                <Text style={styles.reservoirTitle}>
                  {reservoir.blockName} — {reservoir.reservoirName}
                </Text>
                <Text style={styles.reservoirSubtitle}>
                  {reservoir.reservoirType} · {reservoir.status === "ativo" ? "Ativo" : "Pausado"}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Nível crítico: </Text>
                {reservoir.criticalLevelPercent}%
              </Text>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Nível de atenção: </Text>
                {reservoir.attentionLevelPercent}%
              </Text>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Capacidade: </Text>
                {reservoir.capacityLiters ? `${reservoir.capacityLiters} L` : "—"}
              </Text>
              <Text style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Leituras no período: </Text>
                {reservoir.readings.length}
              </Text>
            </View>

            {reservoir.readings.length === 0 ? (
              <Text style={styles.emptyState}>
                Nenhuma leitura registrada neste período.
              </Text>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableRowHeader}>
                  <Text style={[styles.cellDate, styles.headerCell]}>Data/Hora</Text>
                  <Text style={[styles.cellLevel, styles.headerCell]}>Nível</Text>
                  <Text style={[styles.cellDepth, styles.headerCell]}>Coluna d&apos;água</Text>
                </View>

                {reservoir.readings.map((reading, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.cellDate}>{formatDateTime(reading.recordedAt)}</Text>
                    <Text style={styles.cellLevel}>{reading.waterLevel.toFixed(1)}%</Text>
                    <Text style={styles.cellDepth}>
                      {reading.depthCm !== null ? `${reading.depthCm.toFixed(1)} cm` : "—"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Hydro Pulse — Inteligência hídrica. Relatório gerado automaticamente.
        </Text>
      </Page>
    </Document>
  );
}
