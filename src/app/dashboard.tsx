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

import { AppLogo } from "@/components/app-logo";
import { JobTrackerNav } from "@/components/job-tracker-nav";
import { ThemedText } from "@/components/themed-text";
import { Colors, MaxContentWidth } from "@/constants/theme";
import { useJobTracker } from "@/hooks/use-job-tracker";
import { useAuth } from "@/services/auth-context";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(value: string) {
  if (!value) return "No due date";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardScreen() {
  const router = useRouter();
  const { currentUser, loading: authLoading, logout } = useAuth();
  const { applications, tasks, loading, error } = useJobTracker(
    currentUser?.uid,
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

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
  const openTasks = tasks.filter((task) => !task.completed);
  const counts = [
    { label: "Applications", value: activeApplications.length },
    {
      label: "In progress",
      value: activeApplications.filter((application) =>
        ["Applied", "Assessment", "Interview", "Offer"].includes(
          application.status,
        ),
      ).length,
    },
    {
      label: "Interviews",
      value: activeApplications.filter(
        (application) => application.status === "Interview",
      ).length,
    },
    {
      label: "Offers",
      value: activeApplications.filter((application) =>
        ["Offer", "Accepted"].includes(application.status),
      ).length,
    },
  ];
  const upcomingTasks = openTasks.slice(0, 4);
  const recentApplications = activeApplications.slice(0, 4);
  const firstName =
    currentUser.displayName?.trim().split(/\s+/)[0] ??
    currentUser.email?.split("@")[0] ??
    "there";

  const handleSignOut = async () => {
    setSignOutError("");
    setIsSigningOut(true);
    try {
      await logout();
      router.replace("/");
    } catch (logoutError: unknown) {
      setSignOutError(
        logoutError instanceof Error
          ? logoutError.message
          : "Could not sign out. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to home"
              onPress={() => router.replace("/")}
              style={({ pressed }) => [
                styles.brand,
                pressed && styles.pressed,
              ]}
            >
              <AppLogo size={34} />
              <ThemedText style={styles.brandName}>JobTrack</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isSigningOut}
              onPress={() => void handleSignOut()}
              style={({ pressed }) => pressed && styles.pressed}
            >
              {isSigningOut ? (
                <ActivityIndicator color={Colors.light.text} />
              ) : (
                <ThemedText style={styles.signOut}>Sign out</ThemedText>
              )}
            </Pressable>
          </View>

          <View style={styles.greeting}>
            <ThemedText style={styles.eyebrow}>{getGreeting()}</ThemedText>
            <ThemedText style={styles.heading}>Welcome back, {firstName}</ThemedText>
            {!!currentUser.email && (
              <ThemedText style={styles.muted}>{currentUser.email}</ThemedText>
            )}
          </View>

          {error || signOutError ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>
              {error || signOutError}
            </ThemedText>
          ) : null}

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <ThemedText style={styles.heroEyebrow}>YOUR NEXT MOVE</ThemedText>
              <ThemedText style={styles.heroTitle}>
                Keep every opportunity in view.
              </ThemedText>
              <ThemedText style={styles.muted}>
                Track applications, follow-ups, and progress in one place.
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/application-form")}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.primaryButtonText}>
                Add application
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your overview</ThemedText>
            <View style={styles.metrics}>
              {counts.map((item) => (
                <View key={item.label} style={styles.metric}>
                  <ThemedText style={styles.metricValue}>{item.value}</ThemedText>
                  <ThemedText style={styles.muted}>{item.label}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <ThemedText style={styles.sectionTitle}>Upcoming tasks</ThemedText>
              <Pressable onPress={() => router.push("/tasks")}>
                <ThemedText style={styles.textLink}>View all</ThemedText>
              </Pressable>
            </View>
            {upcomingTasks.length ? (
              upcomingTasks.map((task) => {
                const linkedApplication = applications.find(
                  (application) => application.id === task.applicationId,
                );
                return (
                  <View key={task.id} style={styles.listRow}>
                    <View style={styles.rowCopy}>
                      <ThemedText style={styles.rowTitle}>{task.title}</ThemedText>
                      <ThemedText style={styles.muted}>
                        {linkedApplication?.company ?? "Personal task"} ·{" "}
                        {formatDate(task.dueDate)}
                      </ThemedText>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <ThemedText style={styles.rowTitle}>No open tasks</ThemedText>
                <ThemedText style={styles.muted}>
                  Add a reminder to keep your next step on track.
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <ThemedText style={styles.sectionTitle}>
                Recent applications
              </ThemedText>
              <Pressable onPress={() => router.push("/applications")}>
                <ThemedText style={styles.textLink}>View pipeline</ThemedText>
              </Pressable>
            </View>
            {recentApplications.length ? (
              recentApplications.map((application) => (
                <Pressable
                  key={application.id}
                  onPress={() =>
                    router.push({
                      pathname: "/application/[id]",
                      params: { id: application.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.listRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.rowCopy}>
                    <ThemedText style={styles.rowTitle}>
                      {application.title}
                    </ThemedText>
                    <ThemedText style={styles.muted}>
                      {application.company}
                      {application.location ? ` · ${application.location}` : ""}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.status}>{application.status}</ThemedText>
                </Pressable>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <ThemedText style={styles.rowTitle}>
                  Your tracker is ready
                </ThemedText>
                <ThemedText style={styles.muted}>
                  Add an opportunity to see it appear here.
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <JobTrackerNav active="Overview" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
  },
  scrollContent: { alignItems: "center", paddingBottom: 24 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandName: { fontSize: 18, fontWeight: "700", letterSpacing: -0.4 },
  signOut: { fontSize: 14, fontWeight: "600" },
  greeting: { gap: 3 },
  eyebrow: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  heading: { fontSize: 30, lineHeight: 37, fontWeight: "700", letterSpacing: -1 },
  muted: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 23 },
  error: { color: "#B42318", fontSize: 15, lineHeight: 22 },
  hero: {
    backgroundColor: Colors.light.backgroundElement,
    borderColor: Colors.light.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    gap: 18,
  },
  heroCopy: { gap: 8 },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: Colors.light.textSecondary,
  },
  heroTitle: { fontSize: 25, lineHeight: 32, fontWeight: "700", letterSpacing: -0.5 },
  primaryButton: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: Colors.light.text,
    paddingHorizontal: 17,
    paddingVertical: 12,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  section: { gap: 12 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    flexGrow: 1,
    flexBasis: "45%",
    minHeight: 92,
    justifyContent: "center",
    gap: 3,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    backgroundColor: Colors.light.background,
  },
  metricValue: { fontSize: 27, lineHeight: 32, fontWeight: "700" },
  textLink: { fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  listRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, lineHeight: 20, fontWeight: "600" },
  status: {
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 13,
    backgroundColor: Colors.light.backgroundElement,
    padding: 16,
  },
  pressed: { opacity: 0.65 },
});
