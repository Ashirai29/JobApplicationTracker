import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { JobTrackerNav } from "@/components/job-tracker-nav";
import { ThemedText } from "@/components/themed-text";
import { Colors, MaxContentWidth } from "@/constants/theme";

const prepChecklist = [
  "Read the job description and highlight the three main needs.",
  "Choose two examples that show your impact with measurable results.",
  "Prepare a few questions about the team, role, and next steps.",
];

const interviewPrompts = [
  "What problem did you own, and why did it matter?",
  "What did you do, and what changed because of your work?",
  "What would you do differently if you tackled it again?",
];

export default function ToolkitScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <ThemedText style={styles.eyebrow}>PRACTICAL RESOURCES</ThemedText>
          <ThemedText style={styles.heading}>Career toolkit</ThemedText>
          <ThemedText style={styles.muted}>
            Small, reusable prompts to help you prepare, follow up, and make decisions with more confidence.
          </ThemedText>

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Before an interview
            </ThemedText>
            {prepChecklist.map((item, index) => (
              <View key={item} style={styles.bulletRow}>
                <ThemedText style={styles.bulletNumber}>
                  0{index + 1}
                </ThemedText>
                <ThemedText style={styles.body}>{item}</ThemedText>
              </View>
            ))}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/tasks",
                  params: {
                    title: "Prepare interview examples and questions",
                  },
                })
              }
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Add prep reminder
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              A simple story framework
            </ThemedText>
            <ThemedText style={styles.muted}>
              Use these prompts to keep an answer specific and focused.
            </ThemedText>
            {interviewPrompts.map((prompt, index) => (
              <View key={prompt} style={styles.promptRow}>
                <ThemedText style={styles.promptLabel}>
                  {["Situation & task", "Action & result", "Reflection"][index]}
                </ThemedText>
                <ThemedText style={styles.body}>{prompt}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Follow-up email starter
            </ThemedText>
            <ThemedText style={styles.muted}>
              Select and adapt this template. Keep it personal and concise.
            </ThemedText>
            <ThemedText selectable style={styles.template}>
              {`Subject: Thank you — [Role title]\n\nHi [Name],\n\nThank you for speaking with me about the [Role title] position. I especially enjoyed learning about [specific detail]. Our conversation strengthened my interest in the role, and I would be glad to share anything else that would be helpful.\n\nBest,\n[Your name]`}
            </ThemedText>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/tasks",
                  params: { title: "Send a thoughtful interview follow-up" },
                })
              }
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Remind me to follow up
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>
              Compare an offer
            </ThemedText>
            <ThemedText style={styles.body}>
              Look beyond the headline salary. Compare role scope, manager
              support, growth, benefits, flexibility, commute, and the
              expectations for success in the first six months.
            </ThemedText>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/tasks",
                  params: { title: "Review and compare offer details" },
                })
              }
              style={styles.secondaryButton}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Add decision reminder
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <JobTrackerNav active="Toolkit" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { alignItems: "center", paddingBottom: 24 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    padding: 24,
    gap: 15,
  },
  eyebrow: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  heading: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  muted: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 22 },
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletNumber: {
    width: 25,
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  body: { flex: 1, fontSize: 16, lineHeight: 24 },
  promptRow: {
    gap: 3,
    borderTopWidth: 1,
    borderColor: Colors.light.border,
    paddingTop: 10,
  },
  promptLabel: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  template: {
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundElement,
    padding: 13,
    fontSize: 15,
    lineHeight: 23,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.light.text,
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "600" },
});
