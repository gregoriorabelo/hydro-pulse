import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { calculateAlert, calculateStatus } from "@/lib/reservoirStatus";
import type {
  NiveisReport,
  ReportReservoir,
  ReportReading,
} from "@/services/reportService";
import type { WaterStatus } from "@/types/block";

const COLORS = {
  navy: "#071522",
  petrol: "#0A1F2E",
  tech: "#0088CC",
  cyan: "#00B8FF",
  white: "#FFFFFF",
  gray950: "#111820",
  gray800: "#28323B",
  gray700: "#46515B",
  gray600: "#5E6974",
  gray500: "#74808B",
  gray300: "#D5DDE3",
  gray200: "#E6EBEF",
  gray100: "#F4F7F9",
  gray050: "#F9FAFB",
  green: "#159455",
  greenBg: "#E5F7ED",
  yellow: "#B88900",
  yellowBg: "#FFF5CF",
  red: "#D53B43",
  redBg: "#FDE8E9",
  orange: "#E66A19",
  orangeBg: "#FFF0E5",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 48,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.gray950,
    backgroundColor: COLORS.white,
  },
  coverPage: {
    paddingTop: 50,
    paddingBottom: 48,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    color: COLORS.gray950,
    backgroundColor: COLORS.white,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  brandHydro: {
    fontSize: 27,
    fontWeight: 700,
    color: COLORS.navy,
  },
  brandPulse: {
    fontSize: 27,
    fontWeight: 700,
    color: COLORS.tech,
  },
  brandSmallHydro: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.navy,
  },
  brandSmallPulse: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.tech,
  },
  eyebrow: {
    marginTop: 8,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: COLORS.tech,
  },
  coverHero: {
    marginTop: 70,
    padding: 28,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
  },
  coverHeroEyebrow: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.4,
    color: COLORS.cyan,
  },
  coverTitle: {
    marginTop: 22,
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.white,
  },
  coverSubtitle: {
    marginTop: 14,
    fontSize: 12,
    color: "#C7D4DE",
  },
  heroLine: {
    marginTop: 20,
    width: 140,
    height: 3,
    backgroundColor: COLORS.cyan,
  },
  coverMetaRow: {
    flexDirection: "row",
    marginTop: 56,
  },
  coverCondo: {
    width: "36%",
    padding: 18,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  coverMeta: {
    width: "50%",
    marginLeft: "14%",
    padding: 18,
    borderRadius: 8,
    backgroundColor: COLORS.gray050,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  metaLabel: {
    fontSize: 7,
    color: COLORS.gray500,
    textTransform: "uppercase",
  },
  coverCondoName: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.navy,
  },
  coverCondoDetail: {
    marginTop: 14,
    fontSize: 8,
    color: COLORS.gray600,
  },
  metaLine: {
    flexDirection: "row",
    marginBottom: 7,
  },
  metaLineLabel: {
    width: 58,
    fontSize: 7.5,
    color: COLORS.gray500,
  },
  metaLineValue: {
    flex: 1,
    fontSize: 8.5,
    fontWeight: 700,
    color: COLORS.navy,
  },
  generatedBadgeWrap: {
    marginTop: 55,
    alignItems: "center",
  },
  generatedBadge: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.petrol,
  },
  generatedBadgeText: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: COLORS.white,
  },
  reportContext: {
    marginTop: 4,
    fontSize: 7.5,
    color: COLORS.gray500,
  },
  section: {
    marginTop: 18,
  },
  sectionCompact: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: COLORS.navy,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 8,
    color: COLORS.gray500,
  },
  sectionLine: {
    marginTop: 8,
    height: 1.5,
    backgroundColor: COLORS.tech,
  },
  metricsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    minHeight: 92,
    marginRight: 7,
    padding: 11,
    borderRadius: 7,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  metricCardLast: {
    marginRight: 0,
  },
  metricLabel: {
    fontSize: 7.5,
    color: COLORS.gray500,
  },
  metricValue: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: 700,
  },
  metricDetail: {
    marginTop: 14,
    fontSize: 7,
    color: COLORS.gray500,
  },
  infoBox: {
    marginTop: 12,
    padding: 11,
    borderRadius: 6,
    backgroundColor: COLORS.gray100,
    borderLeftWidth: 3,
  },
  infoTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: COLORS.navy,
  },
  infoText: {
    marginTop: 5,
    fontSize: 8,
    lineHeight: 1.45,
    color: COLORS.gray700,
  },
  thresholdTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.petrol,
  },
  tableHeaderText: {
    paddingVertical: 6,
    paddingHorizontal: 7,
    fontSize: 7.5,
    fontWeight: 700,
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.gray300,
  },
  tableRowAlt: {
    backgroundColor: COLORS.gray100,
  },
  tableText: {
    paddingVertical: 6,
    paddingHorizontal: 7,
    fontSize: 7.5,
    color: COLORS.gray800,
  },
  thresholdRange: {
    width: "23%",
  },
  thresholdStatus: {
    width: "23%",
    alignItems: "center",
  },
  thresholdDescription: {
    width: "54%",
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 7,
    fontWeight: 700,
  },
  reservoirHeader: {
    marginTop: 14,
  },
  reservoirTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: COLORS.navy,
  },
  reservoirSubtitle: {
    marginTop: 5,
    fontSize: 8,
    color: COLORS.gray500,
  },
  reservoirGrid: {
    flexDirection: "row",
    marginTop: 12,
  },
  levelPanel: {
    width: "23%",
    minHeight: 122,
    padding: 13,
    borderRadius: 8,
    backgroundColor: COLORS.petrol,
  },
  levelPanelLabel: {
    fontSize: 7,
    letterSpacing: 0.5,
    color: "#AFC3D1",
  },
  levelPanelValue: {
    marginTop: 22,
    fontSize: 30,
    fontWeight: 700,
    color: COLORS.white,
  },
  levelPanelBadge: {
    marginTop: 19,
  },
  technicalPanel: {
    width: "74%",
    marginLeft: "3%",
    minHeight: 122,
    padding: 13,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  technicalRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  technicalCell: {
    width: "33.33%",
  },
  technicalLabel: {
    fontSize: 7,
    color: COLORS.gray500,
  },
  technicalValue: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.navy,
  },
  historyTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  historyDate: { width: "30%" },
  historyLevel: { width: "16%", textAlign: "center" },
  historyDepth: { width: "22%", textAlign: "center" },
  historyStatus: { width: "32%", alignItems: "center" },
  analysisGrid: {
    flexDirection: "row",
    marginTop: 10,
  },
  analysisColumn: {
    width: "49%",
  },
  analysisColumnRight: {
    marginLeft: "2%",
  },
  analysisCard: {
    minHeight: 70,
    padding: 10,
    borderRadius: 6,
    backgroundColor: COLORS.gray100,
    borderLeftWidth: 3,
  },
  analysisCardSecond: {
    marginTop: 8,
  },
  analysisTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.navy,
  },
  analysisValue: {
    marginTop: 5,
    fontSize: 9.5,
    fontWeight: 700,
    color: COLORS.gray800,
  },
  analysisText: {
    marginTop: 4,
    fontSize: 7.5,
    lineHeight: 1.35,
    color: COLORS.gray700,
  },
  conclusionBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 7,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  conclusionText: {
    fontSize: 8,
    lineHeight: 1.5,
    color: COLORS.gray700,
  },
  emptyState: {
    marginTop: 12,
    padding: 14,
    borderRadius: 7,
    backgroundColor: COLORS.gray100,
    fontSize: 8.5,
    color: COLORS.gray500,
  },
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 18,
    paddingTop: 7,
    borderTopWidth: 0.6,
    borderTopColor: COLORS.gray300,
    flexDirection: "row",
    justifyContent: "space-between",
    color: COLORS.gray500,
    fontSize: 7,
  },
  footerBrand: {
    flexDirection: "row",
  },
  footerHydro: {
    fontWeight: 700,
    color: COLORS.navy,
  },
  footerPulse: {
    fontWeight: 700,
    color: COLORS.tech,
  },
});

function formatDate(value: string) {
  const normalized = value.trim().slice(0, 10);
  const [year, month, day] = normalized.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

function getReadingStatus(
  reservoir: ReportReservoir,
  reading: ReportReading | undefined
): WaterStatus {
  return calculateStatus(
    reservoir.status,
    Boolean(reading),
    reading?.waterLevel ?? 0,
    reservoir.criticalLevelPercent,
    reservoir.attentionLevelPercent,
    reservoir.highLevelPercent
  );
}

function getStatusColors(status: WaterStatus) {
  if (status === "Crítico") return { bg: COLORS.redBg, fg: COLORS.red };
  if (status === "Atenção") return { bg: COLORS.yellowBg, fg: COLORS.yellow };
  if (status === "Normal") return { bg: COLORS.greenBg, fg: COLORS.green };
  if (status === "Transbordamento") {
    return { bg: COLORS.orangeBg, fg: COLORS.orange };
  }
  return { bg: COLORS.gray200, fg: COLORS.gray600 };
}

function StatusBadge({ status }: { status: WaterStatus }) {
  const colors = getStatusColors(status);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.fg }]}>{status}</Text>
    </View>
  );
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <Text style={small ? styles.brandSmallHydro : styles.brandHydro}>Hydro</Text>
      <Text style={small ? styles.brandSmallPulse : styles.brandPulse}>Pulse</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerBrand}>
        <Text style={styles.footerHydro}>Hydro</Text>
        <Text style={styles.footerPulse}>Pulse</Text>
        <Text>  Monitoramento hídrico inteligente</Text>
      </View>
      <Text render={({ pageNumber }) => `Página ${pageNumber}`} />
    </View>
  );
}

function SectionTitle({
  title,
  subtitle,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <View style={compact ? styles.sectionCompact : styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionLine} />
    </View>
  );
}

function MetricCard({
  label,
  value,
  detail,
  color,
  last = false,
}: {
  label: string;
  value: string;
  detail: string;
  color: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.metricCard, last ? styles.metricCardLast : {}]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function InfoBox({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: string;
}) {
  return (
    <View style={[styles.infoBox, { borderLeftColor: color }]} wrap={false}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function ThresholdTable({ reservoir }: { reservoir: ReportReservoir }) {
  const rows: { range: string; status: WaterStatus; description: string }[] = [
    {
      range: `Abaixo de ${reservoir.criticalLevelPercent}%`,
      status: "Crítico",
      description: "Nível baixo. Atuação operacional imediata.",
    },
    {
      range: `${reservoir.criticalLevelPercent}% a < ${reservoir.attentionLevelPercent}%`,
      status: "Atenção",
      description: "Faixa preventiva. Acompanhar evolução do nível.",
    },
    {
      range: `${reservoir.attentionLevelPercent}% a ${reservoir.highLevelPercent}%`,
      status: "Normal",
      description: "Operação dentro da faixa esperada.",
    },
    {
      range: `Acima de ${reservoir.highLevelPercent}%`,
      status: "Transbordamento",
      description: "Nível superior ao limite. Risco de transbordamento.",
    },
  ];

  return (
    <View style={styles.thresholdTable} wrap={false}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.thresholdRange]}>Faixa</Text>
        <Text style={[styles.tableHeaderText, styles.thresholdStatus]}>Status</Text>
        <Text style={[styles.tableHeaderText, styles.thresholdDescription]}>
          Interpretação
        </Text>
      </View>

      {rows.map((row, index) => (
        <View
          key={row.status}
          style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}]}
        >
          <Text style={[styles.tableText, styles.thresholdRange]}>{row.range}</Text>
          <View style={[styles.tableText, styles.thresholdStatus]}>
            <StatusBadge status={row.status} />
          </View>
          <Text style={[styles.tableText, styles.thresholdDescription]}>
            {row.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TechnicalValue({
  label,
  value,
  color = COLORS.navy,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.technicalCell}>
      <Text style={styles.technicalLabel}>{label}</Text>
      <Text style={[styles.technicalValue, { color }]}>{value}</Text>
    </View>
  );
}

function ReservoirOverview({ reservoir }: { reservoir: ReportReservoir }) {
  const latest = reservoir.readings.at(-1);
  const status = getReadingStatus(reservoir, latest);
  const alertColor = getStatusColors(status).fg;
  const currentLevel = latest ? `${latest.waterLevel.toFixed(0)}%` : "—";
  const currentDepth =
    latest?.depthCm != null ? `${latest.depthCm.toFixed(1)} cm` : "—";

  return (
    <View wrap={false}>
      <View style={styles.reservoirHeader}>
        <Text style={styles.reservoirTitle}>Reservatório {reservoir.reservoirName}</Text>
        <Text style={styles.reservoirSubtitle}>
          {reservoir.blockName} · {reservoir.reservoirType}
        </Text>
        <View style={styles.sectionLine} />
      </View>

      <View style={styles.reservoirGrid}>
        <View style={styles.levelPanel}>
          <Text style={styles.levelPanelLabel}>NÍVEL ATUAL</Text>
          <Text style={styles.levelPanelValue}>{currentLevel}</Text>
          <View style={styles.levelPanelBadge}>
            <StatusBadge status={status} />
          </View>
        </View>

        <View style={styles.technicalPanel}>
          <View style={styles.technicalRow}>
            <TechnicalValue
              label="Capacidade"
              value={
                reservoir.capacityLiters != null
                  ? `${reservoir.capacityLiters.toLocaleString("pt-BR")} L`
                  : "—"
              }
            />
            <TechnicalValue label="Profundidade" value={currentDepth} />
            <TechnicalValue
              label="Status"
              value={reservoir.status === "ativo" ? "Ativo" : "Pausado"}
              color={reservoir.status === "ativo" ? COLORS.green : COLORS.gray600}
            />
          </View>
          <View style={styles.technicalRow}>
            <TechnicalValue
              label="Limite crítico"
              value={`${reservoir.criticalLevelPercent}%`}
              color={COLORS.red}
            />
            <TechnicalValue
              label="Atenção"
              value={`${reservoir.attentionLevelPercent}%`}
              color={COLORS.yellow}
            />
            <TechnicalValue
              label="Limite alto"
              value={`${reservoir.highLevelPercent}%`}
              color={COLORS.orange}
            />
          </View>
        </View>
      </View>

      <InfoBox
        title={status === "Normal" ? "Situação operacional" : "Alerta operacional"}
        text={calculateAlert(status)}
        color={alertColor}
      />
    </View>
  );
}

function HistoryTable({ reservoir }: { reservoir: ReportReservoir }) {
  if (reservoir.readings.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text>Nenhuma leitura registrada no período selecionado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.historyTable}>
      <View style={styles.tableHeader} fixed>
        <Text style={[styles.tableHeaderText, styles.historyDate]}>Data / Hora</Text>
        <Text style={[styles.tableHeaderText, styles.historyLevel]}>Nível</Text>
        <Text style={[styles.tableHeaderText, styles.historyDepth]}>Profundidade</Text>
        <Text style={[styles.tableHeaderText, styles.historyStatus]}>Situação</Text>
      </View>

      {reservoir.readings.map((reading, index) => {
        const status = getReadingStatus(reservoir, reading);

        return (
          <View
            key={`${reading.recordedAt}-${index}`}
            style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}]}
            wrap={false}
          >
            <Text style={[styles.tableText, styles.historyDate]}>
              {formatDateTime(reading.recordedAt)}
            </Text>
            <Text style={[styles.tableText, styles.historyLevel]}>
              {reading.waterLevel.toFixed(1)}%
            </Text>
            <Text style={[styles.tableText, styles.historyDepth]}>
              {reading.depthCm != null ? `${reading.depthCm.toFixed(1)} cm` : "—"}
            </Text>
            <View style={[styles.tableText, styles.historyStatus]}>
              <StatusBadge status={status} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Analysis({ reservoir }: { reservoir: ReportReservoir }) {
  if (reservoir.readings.length === 0) return null;

  const minReading = reservoir.readings.reduce((min, reading) =>
    reading.waterLevel < min.waterLevel ? reading : min
  );
  const maxReading = reservoir.readings.reduce((max, reading) =>
    reading.waterLevel > max.waterLevel ? reading : max
  );
  const latest = reservoir.readings.at(-1)!;
  const latestStatus = getReadingStatus(reservoir, latest);

  return (
    <>
      <SectionTitle
        title="Análise do Período"
        subtitle="Interpretação automatizada dos registros apresentados"
        compact
      />

      <View style={styles.analysisGrid}>
        <View style={styles.analysisColumn}>
          <View style={[styles.analysisCard, { borderLeftColor: COLORS.red }]}>
            <Text style={styles.analysisTitle}>Menor nível registrado</Text>
            <Text style={styles.analysisValue}>{minReading.waterLevel.toFixed(1)}%</Text>
            <Text style={styles.analysisText}>
              Menor valor identificado entre as leituras do período selecionado.
            </Text>
          </View>
          <View
            style={[
              styles.analysisCard,
              styles.analysisCardSecond,
              { borderLeftColor: COLORS.yellow },
            ]}
          >
            <Text style={styles.analysisTitle}>Limite de atenção</Text>
            <Text style={styles.analysisValue}>
              {reservoir.attentionLevelPercent}%
            </Text>
            <Text style={styles.analysisText}>
              Abaixo deste limite, o HydroPulse classifica a leitura em atenção
              ou crítico, conforme a faixa configurada.
            </Text>
          </View>
        </View>

        <View style={[styles.analysisColumn, styles.analysisColumnRight]}>
          <View style={[styles.analysisCard, { borderLeftColor: COLORS.orange }]}>
            <Text style={styles.analysisTitle}>Maior nível registrado</Text>
            <Text style={styles.analysisValue}>{maxReading.waterLevel.toFixed(1)}%</Text>
            <Text style={styles.analysisText}>
              Maior valor identificado entre as leituras do período selecionado.
            </Text>
          </View>
          <View
            style={[
              styles.analysisCard,
              styles.analysisCardSecond,
              { borderLeftColor: getStatusColors(latestStatus).fg },
            ]}
          >
            <Text style={styles.analysisTitle}>Última situação do período</Text>
            <Text style={styles.analysisValue}>{latestStatus}</Text>
            <Text style={styles.analysisText}>
              Última leitura: {latest.waterLevel.toFixed(1)}%.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

function ReservoirHistoryPage({ reservoir }: { reservoir: ReportReservoir }) {
  const latest = reservoir.readings.at(-1);
  const status = getReadingStatus(reservoir, latest);

  return (
    <Page size="A4" style={styles.page}>
      <Brand small />
      <Text style={styles.reportContext}>
        Histórico operacional · {reservoir.blockName} · {reservoir.reservoirName}
      </Text>

      <SectionTitle
        title="Histórico de Leituras"
        subtitle="Registros considerados no período apresentado"
        compact
      />

      <HistoryTable reservoir={reservoir} />
      <Analysis reservoir={reservoir} />

      <SectionTitle title="Conclusão" subtitle="Síntese técnica do monitoramento" compact />
      <View style={styles.conclusionBox} wrap={false}>
        <Text style={styles.conclusionText}>
          O HydroPulse classificou as leituras deste reservatório conforme os
          limites configurados de {reservoir.criticalLevelPercent}% para nível
          crítico, {reservoir.attentionLevelPercent}% para atenção e
          {reservoir.highLevelPercent}% para limite alto.{"\n\n"}
          {latest
            ? `A última leitura do período foi de ${latest.waterLevel.toFixed(
                1
              )}%, classificada como ${status}.`
            : "Não houve leituras no período selecionado."}
        </Text>
      </View>

      <Footer />
    </Page>
  );
}

export default function NiveisReportDocument({ report }: { report: NiveisReport }) {
  const allReadings = report.reservoirs.flatMap((reservoir) => reservoir.readings);
  const latestReadings = report.reservoirs
    .map((reservoir) => ({ reservoir, reading: reservoir.readings.at(-1) }))
    .filter(
      (
        item
      ): item is {
        reservoir: ReportReservoir;
        reading: ReportReading;
      } => Boolean(item.reading)
    );

  const averageCurrent =
    latestReadings.length > 0
      ? Math.round(
          latestReadings.reduce((sum, item) => sum + item.reading.waterLevel, 0) /
            latestReadings.length
        )
      : null;

  const statuses = report.reservoirs.map((reservoir) =>
    getReadingStatus(reservoir, reservoir.readings.at(-1))
  );
  const activeAlerts = statuses.filter((status) =>
    ["Crítico", "Atenção", "Transbordamento", "Sem sinal"].includes(status)
  ).length;

  const primaryReservoir = report.reservoirs[0];
  const primaryStatus = primaryReservoir
    ? getReadingStatus(primaryReservoir, primaryReservoir.readings.at(-1))
    : null;

  const diagnostic =
    primaryReservoir && primaryStatus
      ? `Situação da última leitura do primeiro reservatório: ${primaryStatus}. ${calculateAlert(
          primaryStatus
        )}`
      : "Nenhum reservatório com leitura disponível no período selecionado.";

  return (
    <Document title={`Relatório de Monitoramento Hídrico - ${report.condominiumName}`}>
      <Page size="A4" style={styles.coverPage}>
        <Brand />
        <Text style={styles.eyebrow}>INTELIGÊNCIA HÍDRICA PARA CONDOMÍNIOS</Text>

        <View style={styles.coverHero}>
          <Text style={styles.coverHeroEyebrow}>RELATÓRIO TÉCNICO OPERACIONAL</Text>
          <Text style={styles.coverTitle}>Monitoramento Hídrico</Text>
          <Text style={styles.coverSubtitle}>
            Análise operacional dos níveis dos reservatórios
          </Text>
          <View style={styles.heroLine} />
        </View>

        <View style={styles.coverMetaRow}>
          <View style={styles.coverCondo}>
            <Text style={styles.metaLabel}>Condomínio</Text>
            <Text style={styles.coverCondoName}>{report.condominiumName}</Text>
            <Text style={styles.coverCondoDetail}>
              Ambiente monitorado pelo HydroPulse
            </Text>
          </View>

          <View style={styles.coverMeta}>
            <View style={styles.metaLine}>
              <Text style={styles.metaLineLabel}>Período</Text>
              <Text style={styles.metaLineValue}>
                {formatDate(report.from)} a {formatDate(report.to)}
              </Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={styles.metaLineLabel}>Emissão</Text>
              <Text style={styles.metaLineValue}>
                {new Date().toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "America/Sao_Paulo",
                })}
              </Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={styles.metaLineLabel}>Tipo</Text>
              <Text style={styles.metaLineValue}>Níveis dos reservatórios</Text>
            </View>
          </View>
        </View>

        <View style={styles.generatedBadgeWrap}>
          <View style={styles.generatedBadge}>
            <Text style={styles.generatedBadgeText}>
              DOCUMENTO GERADO AUTOMATICAMENTE PELO HYDROPULSE
            </Text>
          </View>
        </View>

        <Footer />
      </Page>

      <Page size="A4" style={styles.page}>
        <Brand small />
        <Text style={styles.reportContext}>
          Relatório operacional · {report.condominiumName}
        </Text>

        <SectionTitle
          title="Resumo Executivo"
          subtitle="Visão consolidada do monitoramento hídrico no período selecionado"
          compact
        />

        <View style={styles.metricsRow}>
          <MetricCard
            label="Reservatórios"
            value={String(report.reservoirs.length)}
            detail="monitorados"
            color={COLORS.tech}
          />
          <MetricCard
            label="Leituras"
            value={String(allReadings.length)}
            detail="no período"
            color={COLORS.navy}
          />
          <MetricCard
            label="Nível médio atual"
            value={averageCurrent == null ? "—" : `${averageCurrent}%`}
            detail="últimas leituras"
            color={activeAlerts > 0 ? COLORS.orange : COLORS.green}
          />
          <MetricCard
            label="Alertas ativos"
            value={String(activeAlerts)}
            detail="na última leitura"
            color={activeAlerts > 0 ? COLORS.orange : COLORS.green}
            last
          />
        </View>

        <InfoBox
          title="Diagnóstico operacional"
          text={diagnostic}
          color={primaryStatus ? getStatusColors(primaryStatus).fg : COLORS.gray500}
        />

        {primaryReservoir ? (
          <>
            <SectionTitle
              title="Faixas de Monitoramento"
              subtitle="Critérios configurados para classificação automática"
              compact
            />
            <ThresholdTable reservoir={primaryReservoir} />

            <SectionTitle
              title={`Reservatório ${primaryReservoir.reservoirName}`}
              subtitle={`${primaryReservoir.blockName} · ${primaryReservoir.reservoirType}`}
              compact
            />
            <ReservoirOverview reservoir={primaryReservoir} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text>Nenhum reservatório cadastrado para este condomínio.</Text>
          </View>
        )}

        <Footer />
      </Page>

      {report.reservoirs.map((reservoir) => (
        <ReservoirHistoryPage
          key={`${reservoir.blockName}-${reservoir.reservoirName}`}
          reservoir={reservoir}
        />
      ))}
    </Document>
  );
}
