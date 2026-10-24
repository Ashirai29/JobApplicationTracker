import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ComponentProps } from "react";

import { ThemedText as BaseThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppLogo } from "@/components/app-logo";
import { Colors, Fonts, MaxContentWidth, Spacing } from "@/constants/theme";

function ThemedText(props: ComponentProps<typeof BaseThemedText>) {
  return (
    <BaseThemedText
      {...props}
      style={[
        styles.text,
        Platform.select({ web: { fontFamily: Fonts.sans } }),
        props.style,
      ]}
    />
  );
}

const steps = [
  {
    number: "01",
    title: "Save the opportunity",
    detail: "Keep the role, company, and application date together.",
  },
  {
    number: "02",
    title: "Keep your next step visible",
    detail: "Track progress from application to interview and offer.",
  },
  {
    number: "03",
    title: "Follow through with confidence",
    detail: "Make space for thoughtful follow-ups and preparation.",
  },
];

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/")}
              style={({ pressed }) => [
                styles.brand,
                pressed && styles.pressed,
              ]}
            >
              <AppLogo size={38} />
              <ThemedText style={styles.brandName}>Job tracker</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/signin")}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedText style={styles.headerLink}>Sign in</ThemedText>
            </Pressable>
          </View>

          <View style={styles.intro}>
            <ThemedText style={styles.kicker}>A JOB SEARCH, LESS SCATTERED</ThemedText>
            <ThemedText style={styles.title}>
              A little structure goes a long way.
            </ThemedText>
            <ThemedText style={styles.description}>
              Job hunting has a lot of moving pieces. Job tracker gives you a
              simple place to keep them in view and take the next step.
            </ThemedText>
          </View>

          <View style={styles.steps}>
            {steps.map((step) => (
              <View key={step.number} style={styles.step}>
                <View style={styles.stepNumber}>
                  <ThemedText
                    style={[
                      styles.stepNumberText,
                      { color: step.number === "02" ? Colors.light.purple : Colors.light.royalBlue },
                    ]}
                  >
                    {step.number}
                  </ThemedText>
                </View>
                <View style={styles.stepCopy}>
                  <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                  <ThemedText style={styles.stepDetail}>
                    {step.detail}
                  </ThemedText>
                </View>
                <SymbolView
                  name={{
                    ios: "arrow.up.right",
                    android: "north_east",
                    web: "north_east",
                  }}
                  tintColor={Colors.light.purple}
                  size={16}
                />
              </View>
            ))}
          </View>

          <View style={styles.callout}>
            <View style={styles.calloutCopy}>
              <ThemedText style={styles.calloutTitle}>
                Ready when you are.
              </ThemedText>
              <ThemedText style={styles.calloutDescription}>
                Start with one application and build from there.
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/signup")}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText style={styles.ctaText}>Get started</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.footer}>
            GHOSTTECH · Your next opportunity starts here
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    color: Colors.light.text,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
    backgroundColor: "#FFFFFF",
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  brandName: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerLink: {
    fontSize: 15,
    fontWeight: "700",
  },
  intro: {
    gap: Spacing.two,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.two,
  },
  kicker: {
    color: Colors.light.purple,
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: "700",
  },
  title: {
    maxWidth: 620,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: "800",
    letterSpacing: -1,
  },
  description: {
    maxWidth: 580,
    color: Colors.light.textSecondary,
    fontSize: 16,
    lineHeight: 25,
  },
  steps: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  step: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  stepNumber: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  stepCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  stepDetail: {
    color: Colors.light.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  callout: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    backgroundColor: Colors.light.blueTint,
  },
  calloutCopy: {
    flex: 1,
    minWidth: 190,
    gap: Spacing.one,
  },
  calloutTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  calloutDescription: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  ctaButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    borderRadius: 9,
    backgroundColor: Colors.light.purple,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.72,
  },
});
