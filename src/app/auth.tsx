import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { firebaseAuth } from "@/firebase.web";

type AuthMode = "signIn" | "signUp";

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text variant="h2" style={styles.title}>
            {isSignUp ? "Create an account" : "Welcome back"}
          </Text>
          <Text style={styles.description}>
            {isSignUp
              ? "Create an account to start tracking your job applications and managing your opportunities."
              : "Sign in to continue tracking your job applications and managing your opportunities."}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#788398"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              accessibilityLabel="Password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              onChangeText={setPassword}
              onSubmitEditing={submit}
              placeholder="Enter your password"
              placeholderTextColor="#788398"
              returnKeyType="done"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            accessibilityLabel={isSignUp ? "Create account" : "Sign in"}
            disabled={isSubmitting}
            onPress={submit}
            style={styles.submitButton}
          >
            <Text>{isSubmitting ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}</Text>
          </Button>

          <View style={styles.modeSwitch}>
            <Text>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </Text>
            <Button
              accessibilityLabel={
                isSignUp ? "Switch to sign in" : "Switch to sign up"
              }
              onPress={() => {
                setError("");
                setIsSignUp(!isSignUp);
              }}
              variant="link"
            >
              <Text>{isSignUp ? "Sign in" : "Sign up"}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    textAlign: "left",
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  description: {
    color: "#536078",
    lineHeight: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#D3D9E3",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#172033",
    backgroundColor: "#FFFFFF",
  },
  error: {
    color: "#B42318",
  },
  submitButton: {
    minHeight: 48,
  },
  modeSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
});
