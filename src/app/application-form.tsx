import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import {
  APPLICATION_STATUSES,
  type ApplicationInput,
  type ApplicationStatus,
} from "@/models/job-tracker.models";
import {
  createApplication,
  getApplication,
  updateApplication,
} from "@/services/job-tracker";
import { useAuth } from "@/services/auth-context";

const emptyForm: ApplicationInput = {
  title: "",
  company: "",
  status: "Saved",
  location: "",
  jobUrl: "",
  appliedOn: "",
  nextAction: "",
  nextActionDate: "",
  notes: "",
};

function isValidDateInput(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "url";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSecondary}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multiline ? "top" : "center"}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

export default function ApplicationFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const applicationId = typeof params.id === "string" ? params.id : undefined;
  const { currentUser, loading: authLoading } = useAuth();
  const [form, setForm] = useState<ApplicationInput>(emptyForm);
  const [initialStatus, setInitialStatus] =
    useState<ApplicationStatus>("Saved");
  const [recordState, setRecordState] = useState<{
    id: string | null;
    loading: boolean;
  }>({ id: null, loading: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loadingRecord = Boolean(
    applicationId &&
      (recordState.id !== applicationId || recordState.loading),
  );

  useEffect(() => {
    if (!authLoading && !currentUser) router.replace("/");
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    if (!currentUser || !applicationId) return;
    let active = true;
    getApplication(currentUser.uid, applicationId)
      .then((application) => {
        if (!active) return;
        if (!application) {
          setError("This application could not be found.");
          setRecordState({ id: applicationId, loading: false });
          return;
        }
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...applicationInput
        } = application;
        setForm(applicationInput);
        setInitialStatus(application.status);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load this application.",
          );
        }
      })
      .finally(() => {
        if (active) setRecordState({ id: applicationId, loading: false });
      });
    return () => {
      active = false;
    };
  }, [applicationId, currentUser]);

  const updateField = <K extends keyof ApplicationInput>(
    key: K,
    value: ApplicationInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!currentUser) return;
    const title = form.title.trim();
    const company = form.company.trim();
    if (!title || !company) {
      setError("Add the role title and company to continue.");
      return;
    }
    if (!isValidDateInput(form.appliedOn)) {
      setError("Use a valid YYYY-MM-DD date for the application date.");
      return;
    }
    if (!isValidDateInput(form.nextActionDate)) {
      setError("Use a valid YYYY-MM-DD date for the next step.");
      return;
    }
    if (form.jobUrl.trim()) {
      try {
        const parsedUrl = new URL(form.jobUrl.trim());
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setError("Enter a valid job link starting with https://.");
        return;
      }
    }
    setError("");
    setSaving(true);
    const input = {
      ...form,
      title,
      company,
      location: form.location.trim(),
      jobUrl: form.jobUrl.trim(),
      nextAction: form.nextAction.trim(),
      notes: form.notes.trim(),
    };
    try {
      if (applicationId) {
        await updateApplication(
          currentUser.uid,
          applicationId,
          input,
          initialStatus,
        );
        router.replace({
          pathname: "/application/[id]",
          params: { id: applicationId },
        });
      } else {
        const newId = await createApplication(currentUser.uid, input);
        router.replace({
          pathname: "/application/[id]",
          params: { id: newId },
        });
      }
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save this application. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !currentUser || loadingRecord) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={Colors.light.text} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Pressable onPress={() => router.back()} style={styles.back}>
              <ThemedText style={styles.backText}>← Back</ThemedText>
            </Pressable>
            <ThemedText style={styles.eyebrow}>APPLICATION DETAILS</ThemedText>
            <ThemedText style={styles.heading}>
              {applicationId ? "Edit application" : "Add an application"}
            </ThemedText>
            <ThemedText style={styles.muted}>
              Keep the important details together so your next step is always clear.
            </ThemedText>

            <Field
              label="Role title *"
              value={form.title}
              onChangeText={(value) => updateField("title", value)}
              placeholder="e.g. Product Designer"
            />
            <Field
              label="Company *"
              value={form.company}
              onChangeText={(value) => updateField("company", value)}
              placeholder="Company name"
            />
            <Field
              label="Location"
              value={form.location}
              onChangeText={(value) => updateField("location", value)}
              placeholder="City, remote, or hybrid"
            />
            <Field
              label="Job posting link"
              value={form.jobUrl}
              onChangeText={(value) => updateField("jobUrl", value)}
              placeholder="https://"
              keyboardType="url"
              autoCapitalize="none"
            />
            <Field
              label="Applied on"
              value={form.appliedOn}
              onChangeText={(value) => updateField("appliedOn", value)}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />

            <View style={styles.field}>
              <ThemedText style={styles.label}>Status</ThemedText>
              <View style={styles.statusOptions}>
                {APPLICATION_STATUSES.map((status) => {
                  const selected = form.status === status;
                  return (
                    <Pressable
                      key={status}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => updateField("status", status)}
                      style={[
                        styles.statusOption,
                        selected && styles.statusOptionSelected,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          selected && styles.statusTextSelected,
                        ]}
                      >
                        {status}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Field
              label="Next step"
              value={form.nextAction}
              onChangeText={(value) => updateField("nextAction", value)}
              placeholder="e.g. Send a follow-up email"
            />
            <Field
              label="Next step date"
              value={form.nextActionDate}
              onChangeText={(value) => updateField("nextActionDate", value)}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
            <Field
              label="Notes"
              value={form.notes}
              onChangeText={(value) => updateField("notes", value)}
              placeholder="Interview notes, contact details, or anything to remember"
              multiline
            />

            {error ? (
              <ThemedText accessibilityRole="alert" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => void save()}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && !saving && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.saveButtonText}>
                  {applicationId ? "Save changes" : "Create application"}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <JobTrackerNav active="Applications" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  keyboard: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  scroll: { alignItems: "center", paddingBottom: 25 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    padding: 24,
    gap: 15,
  },
  back: { alignSelf: "flex-start", paddingVertical: 5 },
  backText: { fontSize: 15, fontWeight: "600" },
  eyebrow: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  heading: { fontSize: 28, lineHeight: 35, fontWeight: "700", letterSpacing: -0.7 },
  muted: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 23 },
  field: { gap: 7 },
  label: { fontSize: 14, fontWeight: "600" },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
    paddingHorizontal: 13,
    fontSize: 16,
  },
  multiline: { minHeight: 115, paddingTop: 12 },
  statusOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  statusOption: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusOptionSelected: {
    borderColor: Colors.light.text,
    backgroundColor: Colors.light.text,
  },
  statusText: { color: Colors.light.textSecondary, fontSize: 14 },
  statusTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  error: { color: "#B42318", fontSize: 15, lineHeight: 22 },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: Colors.light.text,
    marginTop: 3,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
