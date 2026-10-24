import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
import type {
  ApplicationEvent,
} from "@/models/job-tracker.models";
import {
  subscribeApplicationEvents,
  updateApplication,
} from "@/services/job-tracker";
import { useAuth } from "@/services/auth-context";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const applicationId = typeof params.id === "string" ? params.id : "";
  const { currentUser, loading: authLoading } = useAuth();
  const { applications, loading, error } = useJobTracker(currentUser?.uid);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [eventsError, setEventsError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) router.replace("/");
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    if (!currentUser || !applicationId) return;
    return subscribeApplicationEvents(
      currentUser.uid,
      applicationId,
      setEvents,
      (firestoreError) =>
        setEventsError(`Could not load status history: ${firestoreError.message}`),
    );
  }, [applicationId, currentUser]);

  const application = applications.find(
    (record) => record.id === applicationId,
  );

  const archive = async () => {
    if (!currentUser || !application || application.status === "Archived") {
      return;
    }
    setUpdating(true);
    setEventsError("");
    try {
      await updateApplication(
        currentUser.uid,
        application.id,
        {
          title: application.title,
          company: application.company,
          status: "Archived",
          location: application.location,
          jobUrl: application.jobUrl,
          appliedOn: application.appliedOn,
          nextAction: application.nextAction,
          nextActionDate: application.nextActionDate,
          notes: application.notes,
        },
        application.status,
      );
    } catch (archiveError: unknown) {
      setEventsError(
        archiveError instanceof Error
          ? archiveError.message
          : "Could not archive the application.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || !currentUser || loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={Colors.light.text} />
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.loading}>
        <ThemedText style={styles.heading}>Application not found</ThemedText>
        <Pressable onPress={() => router.replace("/applications")}>
          <ThemedText style={styles.link}>Return to applications</ThemedText>
        </Pressable>
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <ThemedText style={styles.link}>← Applications</ThemedText>
          </Pressable>

          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <ThemedText style={styles.eyebrow}>APPLICATION</ThemedText>
              <ThemedText style={styles.heading}>{application.title}</ThemedText>
              <ThemedText style={styles.company}>{application.company}</ThemedText>
            </View>
            <ThemedText style={styles.status}>{application.status}</ThemedText>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/application-form",
                  params: { id: application.id },
                })
              }
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryText}>Edit details</ThemedText>
            </Pressable>
            <Pressable
              disabled={updating || application.status === "Archived"}
              onPress={() => void archive()}
              style={[styles.secondaryButton, updating && styles.disabled]}
            >
              <ThemedText style={styles.secondaryText}>
                {application.status === "Archived"
                  ? "Archived"
                  : updating
                    ? "Archiving…"
                    : "Archive"}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Role details</ThemedText>
            <Detail label="Location" value={application.location} />
            <Detail label="Applied on" value={application.appliedOn} />
            {application.jobUrl ? (
              <View style={styles.detail}>
                <ThemedText style={styles.detailLabel}>Job posting</ThemedText>
                <Pressable
                  accessibilityRole="link"
                  onPress={() =>
                    void Linking.openURL(application.jobUrl).catch(
                      (openError: unknown) =>
                        setEventsError(
                          openError instanceof Error
                            ? openError.message
                            : "Could not open the job link.",
                        ),
                    )
                  }
                >
                  <ThemedText style={styles.link}>Open job posting</ThemedText>
                </Pressable>
              </View>
            ) : null}
          </View>

          {application.nextAction ? (
            <View style={styles.nextAction}>
              <ThemedText style={styles.eyebrow}>NEXT STEP</ThemedText>
              <ThemedText style={styles.nextTitle}>
                {application.nextAction}
              </ThemedText>
              {application.nextActionDate ? (
                <ThemedText style={styles.muted}>
                  {application.nextActionDate}
                </ThemedText>
              ) : null}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/tasks",
                    params: {
                      applicationId: application.id,
                      title: application.nextAction,
                      dueDate: application.nextActionDate,
                    },
                  })
                }
              >
                <ThemedText style={styles.link}>Add a task reminder</ThemedText>
              </Pressable>
            </View>
          ) : null}

          {application.notes ? (
            <View style={styles.card}>
              <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
              <ThemedText style={styles.notes}>{application.notes}</ThemedText>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Status history</ThemedText>
            {eventsError ? (
              <ThemedText accessibilityRole="alert" style={styles.error}>
                {eventsError}
              </ThemedText>
            ) : null}
            {events.length ? (
              events.map((event) => (
                <View key={event.id} style={styles.event}>
                  <View style={styles.eventDot} />
                  <View style={styles.eventCopy}>
                    <ThemedText style={styles.eventDescription}>
                      {event.description}
                    </ThemedText>
                    <ThemedText style={styles.muted}>
                      {formatDate(event.createdAt)}
                    </ThemedText>
                  </View>
                </View>
              ))
            ) : (
              <ThemedText style={styles.muted}>
                No activity has been recorded yet.
              </ThemedText>
            )}
          </View>
        </View>
      </ScrollView>
      <JobTrackerNav active="Applications" />
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value || "Not provided"}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
    backgroundColor: Colors.light.background,
  },
  scroll: { alignItems: "center", paddingBottom: 24 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    padding: 24,
    gap: 18,
  },
  back: { alignSelf: "flex-start" },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleCopy: { flex: 1, gap: 4 },
  eyebrow: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heading: { fontSize: 27, lineHeight: 34, fontWeight: "700", letterSpacing: -0.7 },
  company: { fontSize: 16, color: Colors.light.textSecondary },
  status: {
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 11,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  actions: { flexDirection: "row", gap: 9 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  secondaryText: { fontSize: 14, fontWeight: "600" },
  disabled: { opacity: 0.5 },
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 13,
    padding: 16,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  detail: { gap: 3 },
  detailLabel: { color: Colors.light.textSecondary, fontSize: 14 },
  detailValue: { fontSize: 16, lineHeight: 22 },
  link: { color: Colors.light.royalBlue, fontSize: 15, fontWeight: "600", textDecorationLine: "underline" },
  nextAction: {
    gap: 7,
    borderRadius: 13,
    backgroundColor: Colors.light.backgroundElement,
    padding: 17,
  },
  nextTitle: { fontSize: 16, fontWeight: "600" },
  muted: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 22 },
  notes: { fontSize: 16, lineHeight: 24 },
  section: { gap: 13 },
  event: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  eventDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: Colors.light.text,
  },
  eventCopy: { flex: 1, gap: 2 },
  eventDescription: { fontSize: 15, lineHeight: 22 },
  error: { color: "#B42318", fontSize: 15, lineHeight: 22 },
});
