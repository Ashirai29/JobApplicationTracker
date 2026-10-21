import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function SignIn() {
  return (
    <ThemedView style={styles.screen}>
      <View style={styles.container}>
        <ThemedText style={styles.heading}>
          Welcome back!
          &nbsp;
          &nbsp;
        </ThemedText>

        <ThemedText style={styles.description}>
          Sign in to continue tracking your job
          applications and managing your opportunities.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
  },
});