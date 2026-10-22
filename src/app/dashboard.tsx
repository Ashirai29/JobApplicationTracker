import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { firebaseAuth } from "@/firebase";

const overviewItems = [
  { label: "Applications", value: "0", detail: "No applications yet" },
  { label: "Interviews", value: "0", detail: "Keep an eye on progress" },
  { label: "Follow-ups", value: "0", detail: "Nothing due right now" },
];

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[colorScheme];
  const [user, setUser] = useState<User | null>(firebaseAuth.currentUser);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, setUser);
  }, []);

  const handleSignOut = async () => {
    setError("");
    setIsSigningOut(true);
    try {
      await signOut(firebaseAuth);
      router.replace("/auth");
    } catch {
      setError("Could not sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const firstName = user?.displayName?.trim().split(/\s+/)[0] ??
    user?.email?.split("@")[0] ??
    "there";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <ThemedText style={styles.brandMarkText}>J</ThemedText>
              </View>
              <ThemedText style={styles.brandName}>Job tracker</ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              disabled={isSigningOut}
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.signOutButton,
                { borderColor: colors.backgroundSelected },
                pressed && styles.pressed,
              ]}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <ThemedText type="smallBold">Sign out</ThemedText>
              )}
            </Pressable>
          </View>

          <View style={styles.greeting}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              YOUR JOB SEARCH
            </ThemedText>
            <ThemedText style={styles.heading}>Good to see you, {firstName}.</ThemedText>
            <ThemedText themeColor="textSecondary">
              A little progress each day gets you closer to the right opportunity.
            </ThemedText>
          </View>

          <View style={styles.overview}>
            {overviewItems.map((item) => (
              <ThemedView
                key={item.label}
                type="backgroundElement"
                style={styles.statCard}
              >
                <ThemedText type="small" themeColor="textSecondary">
                  {item.label}
                </ThemedText>
                <ThemedText style={styles.statValue}>{item.value}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.detail}
                </ThemedText>
              </ThemedView>
            ))}
          </View>

          <ThemedView
            type="backgroundElement"
            style={styles.applicationsCard}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeading}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Applications
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Your recent job search activity
                </ThemedText>
              </View>
              <View style={styles.countBadge}>
                <ThemedText style={styles.countText}>0</ThemedText>
              </View>
            </View>

            <View
              style={[
                styles.emptyState,
                { borderColor: colors.backgroundSelected },
              ]}
            >
              <View style={styles.emptyIcon}>
                <ThemedText style={styles.emptyIconText}>↗</ThemedText>
              </View>
              <ThemedText style={styles.emptyTitle}>
                Your next opportunity starts here
              </ThemedText>
              <ThemedText
                themeColor="textSecondary"
                style={styles.emptyDescription}
              >
                Your applications will show up here once you start tracking
                them.
              </ThemedText>
            </View>
          </ThemedView>

          {error ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.footer}
          >
            Stay organised. Keep moving forward.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#233B83",
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
  brandName: {
    fontSize: 17,
    fontWeight: "700",
  },
  signOutButton: {
    minWidth: 84,
    height: 40,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  greeting: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  heading: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
  },
  overview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 145,
    minHeight: 128,
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
  },
  applicationsCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
  },
  sectionHeading: {
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: Spacing.two,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E6F7",
  },
  countText: {
    color: "#233B83",
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E6F7",
  },
  emptyIconText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#233B83",
  },
  emptyDescription: {
    textAlign: "center",
    lineHeight: 22,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  error: {
    color: "#B42318",
  },
  footer: {
    textAlign: "center",
  },
});
