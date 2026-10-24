import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ComponentProps } from "react";

import { ThemedText as BaseThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AppLogo } from "@/components/app-logo";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { firebaseAuth } from "@/firebase";

type AuthMode = "signIn" | "signUp";

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

export default function AuthScreen({ mode }: { mode?: AuthMode }) {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [isSignUp, setIsSignUp] = useState(
    (mode ?? params.mode) === "signUp",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(
          firebaseAuth,
          normalizedEmail,
          password,
        );
      } else {
        await signInWithEmailAndPassword(
          firebaseAuth,
          normalizedEmail,
          password,
        );
      }
      router.replace("/dashboard");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.card}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/")}
              style={({ pressed }) => [
                styles.brand,
                pressed && styles.pressed,
              ]}
            >
              <AppLogo size={38} />
              <ThemedText style={styles.brandName}>Job tracker</ThemedText>
            </Pressable>

            <View style={styles.intro}>
              <ThemedText style={styles.title}>
                {isSignUp ? "Create your account" : "Welcome back"}
              </ThemedText>
              <ThemedText style={styles.description}>
                {isSignUp
                  ? "Start organizing your job applications and keep every opportunity moving forward."
                  : "Sign in to continue tracking your job applications and managing your opportunities."}
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <ThemedText style={styles.label}>Email address</ThemedText>
                <TextInput
                  accessibilityLabel="Email address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.light.textSecondary}
                  returnKeyType="next"
                  style={styles.input}
                  value={email}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  accessibilityLabel="Password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  onChangeText={setPassword}
                  onSubmitEditing={submit}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.light.textSecondary}
                  returnKeyType="done"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </View>
            </View>

            {error ? (
              <ThemedText accessibilityRole="alert" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={submit}
              style={({ pressed }) => [
                styles.submitButton,
                isSubmitting && styles.disabled,
                pressed && !isSubmitting && styles.pressed,
              ]}
            >
              <ThemedText style={styles.submitButtonText}>
                {isSubmitting
                  ? "Please wait..."
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}
              </ThemedText>
            </Pressable>

            <View style={styles.modeSwitch}>
              <ThemedText style={styles.modePrompt}>
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setError("");
                  setIsSignUp(!isSignUp);
                }}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedText style={styles.modeAction}>
                  {isSignUp ? "Sign in" : "Sign up"}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
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
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.four,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: Spacing.four,
    padding: Spacing.four,
    backgroundColor: "#FFFFFF",
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
  intro: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -0.6,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  description: {
    color: Colors.light.textSecondary,
    lineHeight: 24,
    paddingTop: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.two + 4,
    color: Colors.light.text,
    backgroundColor: Colors.light.blueTint,
    fontFamily: Platform.select({ web: Fonts.sans }),
    fontSize: 16,
  },
  error: {
    color: "#B42318",
    fontSize: 15,
    lineHeight: 22,
  },
  submitButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: Colors.light.royalBlue,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
  modeSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  modePrompt: {
    color: Colors.light.textSecondary,
  },
  modeAction: {
    color: Colors.light.purple,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.72,
  },
});
