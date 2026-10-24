import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JobTrackerNav } from "@/components/job-tracker-nav";
import { ThemedText } from "@/components/themed-text";
import { Colors, MaxContentWidth } from "@/constants/theme";
import { useJobTracker } from "@/hooks/use-job-tracker";
import { APPLICATION_STATUSES } from "@/models/job-tracker.models";
import { useAuth } from "@/services/auth-context";
import { exportJobTrackerData } from "@/services/export-job-data";
import { getApplicationEvents } from "@/services/job-tracker";

const exportHeaders = [
  "record_type",
  "title",
  "company",
  "status",
  "location",
  "job_url",
  "applied_on",
  "next_action",
  "next_action_date",
  "notes",
  "due_date",
  "completed",
  "created_at",
  "updated_at",
  "event_type",
  "event_description",
];

function csvCell(value: string | number | boolean) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function InsightsScreen() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const { applications, tasks, loading, error } = useJobTracker(
    currentUser?.uid,
  );
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    if (!authLoading && !currentUser) router.replace("/");
  }, [authLoading, currentUser, router]);

  if (authLoading || !currentUser || loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={Colors.light.text} />
      </SafeAreaView>
    );
  }

  const activeApplications = applications.filter(
    (application) => application.status !== "Archived",
  );
  const total = activeApplications.length;
  const interviewCount = activeApplications.filter(
    (application) => application.status === "Interview",
  ).length;
  const offerCount = activeApplications.filter((application) =>
    ["Offer", "Accepted"].includes(application.status),
  ).length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const conversionRate = total
    ? Math.round(((interviewCount + offerCount) / total) * 100)
    : 0;
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const statusCounts = APPLICATION_STATUSES.map((status) => ({
    status,
    count: applications.filter((application) => application.status === status)
      .length,
  })).filter((item) => item.count > 0);

  const exportData = async () => {
    setExportError("");
    setExporting(true);
    try {
      const companyByApplicationId = new Map(
        applications.map((application) => [
          application.id,
          application.company,
        ]),
      );
      const rows = [
        ...applications.map((application) => [
          "application",
          application.title,
          application.company,
          application.status,
          application.location,
          application.jobUrl,
          application.appliedOn,
          application.nextAction,
          application.nextActionDate,
          application.notes,
          "",
          "",
          application.createdAt
            ? new Date(application.createdAt).toISOString()
            : "",
          application.updatedAt
            ? new Date(application.updatedAt).toISOString()
            : "",
          "",
          "",
        ]),
        ...tasks.map((task) => [
          "task",
          task.title,
          companyByApplicationId.get(task.applicationId) ?? "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          task.dueDate,
          task.completed,
          task.createdAt ? new Date(task.createdAt).toISOString() : "",
          task.updatedAt ? new Date(task.updatedAt).toISOString() : "",
          "",
          "",
        ]),
      ];
      const histories = await Promise.all(
        applications.map(async (application) => {
          const events = await getApplicationEvents(
            currentUser.uid,
            application.id,
          );
          return events.map((event) => [
            "application_event",
            application.title,
            application.company,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            event.createdAt ? new Date(event.createdAt).toISOString() : "",
            "",
            event.type,
            event.description,
          ]);
        }),
      );
      const csv = [exportHeaders, ...rows, ...histories.flat()]
        .map((row) => row.map(csvCell).join(","))
        .join("\r\n");
      await exportJobTrackerData(csv);
    } catch (exportFailure: unknown) {
      setExportError(
        exportFailure instanceof Error
          ? exportFailure.message
          : "Could not export your data.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <ThemedText style={styles.eyebrow}>YOUR PROGRESS</ThemedText>
          <ThemedText style={styles.heading}>Insights</ThemedText>
          <ThemedText style={styles.muted}>
            A clear picture of your job search, based on the roles and tasks you track.
          </ThemedText>

          {error || exportError ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>
              {error || exportError}
            </ThemedText>
          ) : null}

          <View style={styles.metrics}>
            <Metric
              value={`${conversionRate}%`}
              label="Interview or offer progress"
              detail={`${interviewCount + offerCount} of ${total} active applications`}
            />
            <Metric
              value={`${completionRate}%`}
              label="Task completion"
              detail={`${completedTasks} of ${tasks.length} reminders completed`}
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Pipeline breakdown</ThemedText>
            {statusCounts.length ? (
              statusCounts.map(({ status, count }) => {
                const width = applications.length
                  ? Math.max((count / applications.length) * 100, 5)
                  : 0;
                return (
                  <View key={status} style={styles.statusRow}>
                    <View style={styles.statusLabelRow}>
                      <ThemedText style={styles.statusName}>{status}</ThemedText>
                      <ThemedText style={styles.statusCount}>{count}</ThemedText>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.bar, { width: `${width}%` }]} />
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.empty}>
                <ThemedText style={styles.emptyTitle}>No pipeline data yet</ThemedText>
                <ThemedText style={styles.muted}>
                  Add applications to see how your search is progressing.
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.note}>
            <ThemedText style={styles.noteTitle}>A note on these numbers</ThemedText>
            <ThemedText style={styles.muted}>
              Progress is based on current statuses and completed tasks. Status history preserves earlier pipeline steps, while the breakdown shows each application&apos;s current stage.
            </ThemedText>
          </View>
          <View style={styles.exportCard}>
            <View style={styles.exportCopy}>
              <ThemedText style={styles.noteTitle}>
                Your data, whenever you need it
              </ThemedText>
              <ThemedText style={styles.muted}>
                Export application and task records as a CSV file.
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={exporting || Boolean(error)}
              onPress={() => void exportData()}
              style={({ pressed }) => [
                styles.exportButton,
                (pressed || exporting || Boolean(error)) &&
                  styles.exportButtonMuted,
              ]}
            >
              {exporting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.exportButtonText}>
                  Export data
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <JobTrackerNav active="Insights" />
    </SafeAreaView>
  );
}

function Metric({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <View style={styles.metric}>
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      <ThemedText style={styles.muted}>{detail}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  scroll: { alignItems: "center", paddingBottom: 24 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    padding: 24,
    gap: 16,
  },
  eyebrow: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  heading: { fontSize: 30, lineHeight: 37, fontWeight: "700", letterSpacing: -0.8 },
  muted: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 22 },
  error: { color: "#B42318", fontSize: 15, lineHeight: 22 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  metric: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 140,
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 15,
  },
  metricValue: { fontSize: 30, fontWeight: "700", letterSpacing: -0.7 },
  metricLabel: { fontSize: 14, fontWeight: "600" },
  section: { gap: 14, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  statusRow: { gap: 6 },
  statusLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusName: { fontSize: 14, fontWeight: "600" },
  statusCount: { color: Colors.light.textSecondary, fontSize: 14 },
  track: {
    height: 7,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: Colors.light.backgroundElement,
  },
  bar: { height: "100%", borderRadius: 5, backgroundColor: Colors.light.text },
  empty: {
    gap: 5,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundElement,
    padding: 16,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700" },
  note: {
    gap: 6,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
    paddingTop: 14,
  },
  noteTitle: { fontSize: 14, fontWeight: "700" },
  exportCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 13,
    padding: 14,
  },
  exportCopy: { flex: 1, gap: 4 },
  exportButton: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
    backgroundColor: Colors.light.text,
    paddingHorizontal: 13,
  },
  exportButtonMuted: { opacity: 0.65 },
  exportButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
