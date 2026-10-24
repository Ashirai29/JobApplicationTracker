import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JobTrackerNav } from "@/components/job-tracker-nav";
import { ThemedText } from "@/components/themed-text";
import { Colors, MaxContentWidth } from "@/constants/theme";
import { useJobTracker } from "@/hooks/use-job-tracker";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/models/job-tracker.models";
import { useAuth } from "@/services/auth-context";

export default function ApplicationsScreen() {
  const router = useRouter();
  const { currentUser, loading: authLoading } = useAuth();
  const { applications, loading, error } = useJobTracker(currentUser?.uid);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">(
    "All",
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !currentUser) router.replace("/");
  }, [authLoading, currentUser, router]);

  const visibleApplications = useMemo(
    () =>
      applications.filter((application) => {
        const matchesStatus =
          statusFilter === "All" || application.status === statusFilter;
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          `${application.title} ${application.company} ${application.location}`
            .toLowerCase()
            .includes(normalizedSearch);
        return matchesStatus && matchesSearch;
      }),
    [applications, search, statusFilter],
  );

  if (authLoading || !currentUser || loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={Colors.light.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View>
              <ThemedText style={styles.eyebrow}>YOUR SEARCH</ThemedText>
              <ThemedText style={styles.heading}>Applications</ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/application-form")}
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.addButtonText}>+ Add</ThemedText>
            </Pressable>
          </View>
          <ThemedText style={styles.muted}>
            {applications.length} {applications.length === 1 ? "role" : "roles"}{" "}
            tracked
          </ThemedText>

          {error ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <TextInput
            accessibilityLabel="Search applications"
            placeholder="Search role, company, or location"
            placeholderTextColor={Colors.light.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {(["All", ...APPLICATION_STATUSES] as const).map((status) => {
              const selected = statusFilter === status;
              return (
                <Pressable
                  key={status}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setStatusFilter(status)}
                  style={[styles.filter, selected && styles.filterSelected]}
                >
                  <ThemedText
                    style={[
                      styles.filterText,
                      selected && styles.filterTextSelected,
                    ]}
                  >
                    {status}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.list}>
            {visibleApplications.map((application) => (
              <Pressable
                key={application.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/application/[id]",
                    params: { id: application.id },
                  })
                }
                style={({ pressed }) => [
                  styles.applicationCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardCopy}>
                    <ThemedText style={styles.role}>
                      {application.title}
                    </ThemedText>
                    <ThemedText style={styles.company}>
                      {application.company}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.status}>
                    {application.status}
                  </ThemedText>
                </View>
                <View style={styles.cardFooter}>
                  <ThemedText style={styles.muted}>
                    {application.location || "Location not specified"}
                  </ThemedText>
                  <ThemedText style={styles.muted}>
                    {application.appliedOn
                      ? `Applied ${application.appliedOn}`
                      : "Date not set"}
                  </ThemedText>
                </View>
                {application.nextAction ? (
                  <ThemedText style={styles.nextAction}>
                    Next: {application.nextAction}
                    {application.nextActionDate
                      ? ` · ${application.nextActionDate}`
                      : ""}
                  </ThemedText>
                ) : null}
              </Pressable>
            ))}
            {!visibleApplications.length ? (
              <View style={styles.emptyCard}>
                <ThemedText style={styles.emptyTitle}>
                  {applications.length
                    ? "No matching applications"
                    : "Start your application pipeline"}
                </ThemedText>
                <ThemedText style={styles.muted}>
                  {applications.length
                    ? "Try another search or status."
                    : "Save a role to keep its status, details, and follow-up in one place."}
                </ThemedText>
                {!applications.length ? (
                  <Pressable
                    onPress={() => router.push("/application-form")}
                    style={styles.emptyButton}
                  >
                    <ThemedText style={styles.emptyButtonText}>
                      Add your first application
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
      <JobTrackerNav active="Applications" />
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 15,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  heading: { fontSize: 30, lineHeight: 37, fontWeight: "700", letterSpacing: -0.8 },
  muted: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 22 },
  error: { color: "#B42318", fontSize: 15 },
  addButton: {
    borderRadius: 10,
    backgroundColor: Colors.light.text,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.65 },
  search: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 11,
    backgroundColor: Colors.light.backgroundElement,
    color: Colors.light.text,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  filters: { gap: 7, paddingVertical: 2 },
  filter: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterSelected: {
    borderColor: Colors.light.text,
    backgroundColor: Colors.light.text,
  },
  filterText: { fontSize: 14, color: Colors.light.textSecondary },
  filterTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  list: { gap: 10, paddingTop: 3 },
  applicationCard: {
    gap: 13,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    backgroundColor: Colors.light.background,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardCopy: { flex: 1, gap: 3 },
  role: { fontSize: 17, lineHeight: 22, fontWeight: "700" },
  company: { fontSize: 14, color: Colors.light.textSecondary },
  status: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 13,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  nextAction: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  emptyCard: {
    alignItems: "flex-start",
    gap: 8,
    padding: 20,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundElement,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyButton: {
    marginTop: 4,
    backgroundColor: Colors.light.text,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});
