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

import { ThemedText as BaseThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppLogo } from "@/components/app-logo";
import { Colors, Fonts, MaxContentWidth, Spacing } from "@/constants/theme";
import { firebaseAuth } from "@/firebase";

const features = [
  {
    icon: { ios: "briefcase", android: "work_outline", web: "work_outline" },
    title: "Keep everything together",
    description: "Save roles, companies, and application details in one place.",
  },
  {
    icon: { ios: "chart.bar", android: "monitoring", web: "monitoring" },
    title: "See your progress",
    description: "Know where each opportunity stands at a glance.",
  },
  {
    icon: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
    title: "Stay on top of follow-ups",
    description: "Keep interviews and next steps from slipping through.",
  },
] as const;

function AppText(props: React.ComponentProps<typeof BaseThemedText>) {
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

export default function HomeScreen() {
  const router = useRouter();

  const openDashboard = () => {
    router.push(firebaseAuth.currentUser ? "/dashboard" : "/signin");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <AppLogo size={38} />
              <AppText style={styles.brandName}>JobTrack</AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/signin")}
              style={({ pressed }) => [
                styles.headerLink,
                pressed && styles.pressed,
              ]}
            >
              <AppText style={styles.headerLinkText}>Sign in</AppText>
            </Pressable>
          </View>

          <View style={styles.hero}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <AppText style={styles.eyebrowText}>
                YOUR NEXT CHAPTER STARTS HERE
              </AppText>
            </View>
            <AppText style={styles.heroTitle}>
              Make your job search feel{" "}
              <AppText style={styles.heroTitleEmphasis}>more manageable.</AppText>
            </AppText>
            <AppText style={styles.heroDescription}>
              Bring applications, interviews, and follow-ups together in one
              clear view. Spend less time keeping track and more time moving
              forward.
            </AppText>
            <View style={styles.heroActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/signup")}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText style={styles.primaryButtonText}>
                  Get started
                </AppText>
                <SymbolView
                  name={{
                    ios: "arrow.right",
                    android: "arrow_forward",
                    web: "arrow_forward",
                  }}
                  tintColor="#FFFFFF"
                  size={18}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={openDashboard}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText style={styles.secondaryButtonText}>
                  I already have an account
                </AppText>
              </Pressable>
            </View>
            <View style={styles.heroFootnote}>
              <SymbolView
                name={{ ios: "checkmark", android: "check", web: "check" }}
                tintColor={Colors.light.textSecondary}
                size={15}
              />
              <AppText style={styles.heroFootnoteText}>
                A clearer way to stay organized, at your own pace.
              </AppText>
            </View>
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.sectionIntro}>
              <AppText style={styles.sectionKicker}>A LITTLE MORE CLARITY</AppText>
              <AppText style={styles.sectionTitle}>
                Everything you need to keep moving.
              </AppText>
            </View>
            <View style={styles.featureList}>
              {features.map((feature, index) => (
                <View
                  key={feature.title}
                  style={[
                    styles.featureCard,
                    index === features.length - 1 && styles.lastFeatureCard,
                  ]}
                >
                  <View style={styles.featureIcon}>
                    <SymbolView
                      name={feature.icon}
                      tintColor={
                        index === 1
                          ? Colors.light.purple
                          : Colors.light.royalBlue
                      }
                      size={22}
                    />
                  </View>
                  <View style={styles.featureCopy}>
                    <AppText style={styles.featureTitle}>
                      {feature.title}
                    </AppText>
                    <AppText style={styles.featureDescription}>
                      {feature.description}
                    </AppText>
                  </View>
                  <SymbolView
                    name={{
                      ios: "arrow.up.right",
                      android: "north_east",
                      web: "north_east",
                    }}
                    tintColor="#777777"
                    size={16}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomCta}>
            <View style={styles.bottomCtaCopy}>
              <AppText style={styles.bottomCtaTitle}>
                Ready to get organized?
              </AppText>
              <AppText style={styles.bottomCtaDescription}>
                Start building a job search that works for you.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/signup")}
              style={({ pressed }) => [
                styles.bottomCtaButton,
                pressed && styles.pressed,
              ]}
            >
              <AppText style={styles.primaryButtonText}>Create account</AppText>
            </Pressable>
          </View>

          <AppText style={styles.footer}>
            GHOSTTECH · Your next opportunity starts here
          </AppText>
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
    backgroundColor: "#FFFFFF",
    gap: Spacing.four,
  },
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  headerLinkText: {
    fontSize: 15,
    fontWeight: "700",
  },
  hero: {
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.blueTint,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.purple,
  },
  eyebrowText: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 1.1,
    fontWeight: "700",
  },
  heroTitle: {
    maxWidth: 670,
    fontSize: 42,
    lineHeight: 49,
    fontWeight: "800",
    letterSpacing: -1.4,
  },
  heroTitleEmphasis: {
    color: Colors.light.royalBlue,
    fontSize: 42,
    lineHeight: 49,
    fontWeight: "800",
    letterSpacing: -1.4,
  },
  heroDescription: {
    maxWidth: 560,
    color: "#4D4D4D",
    fontSize: 17,
    lineHeight: 26,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  primaryButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    backgroundColor: Colors.light.royalBlue,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  heroFootnote: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  heroFootnoteText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  featuresSection: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  sectionIntro: {
    gap: Spacing.two,
  },
  sectionKicker: {
    color: Colors.light.purple,
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: "700",
  },
  sectionTitle: {
    maxWidth: 560,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  featureList: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  featureCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  lastFeatureCard: {
    borderBottomWidth: 0,
  },
  featureIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.blueTint,
  },
  featureCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  featureDescription: {
    color: Colors.light.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  bottomCta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    backgroundColor: Colors.light.purpleTint,
  },
  bottomCtaCopy: {
    flex: 1,
    minWidth: 200,
    gap: Spacing.one,
  },
  bottomCtaTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  bottomCtaDescription: {
    color: Colors.light.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  bottomCtaButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    borderRadius: 9,
    backgroundColor: Colors.light.purple,
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});
