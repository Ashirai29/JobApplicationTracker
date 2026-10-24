import { useLocalSearchParams, useRouter } from "expo-router";
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
  createTask,
  setTaskCompleted,
} from "@/services/job-tracker";
import { useAuth } from "@/services/auth-context";

function today() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isValidDateInput(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function formatDate(value: string) {
  if (!value) return "No due date";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    applicationId?: string;
    title?: string;
    dueDate?: string;
  }>();
  const initialApplicationId =
    typeof params.applicationId === "string" ? params.applicationId : "";
  const initialTitle = typeof params.title === "string" ? params.title : "";
  const initialDueDate =
    typeof params.dueDate === "string" && isValidDateInput(params.dueDate)
      ? params.dueDate
      : today();
  const { currentUser, loading: authLoading } = useAuth();
  const { applications, tasks, loading, error: dataError } = useJobTracker(
    currentUser?.uid,
  );
  const [title, setTitle] = useState(initialTitle);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [applicationId, setApplicationId] = useState(initialApplicationId);
  const [showCompleted, setShowCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !currentUser) router.replace("/");
  }, [authLoading, currentUser, router]);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => showCompleted || !task.completed),
    [showCompleted, tasks],
  );

  if (authLoading || !currentUser || loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={Colors.light.text} />
      </SafeAreaView>
    );
  }

  const addTask = async () => {
    if (!currentUser) return;
    if (!title.trim()) {
      setError("Enter a task description.");
      return;
    }
    if (!isValidDateInput(dueDate)) {
      setError("Use a valid YYYY-MM-DD date for the due date.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await createTask(currentUser.uid, {
        title: title.trim(),
        dueDate,
        applicationId,
      });
      setTitle("");
      setDueDate(today());
      setApplicationId("");
    } catch (createError: unknown) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create this task.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    setError("");
    try {
      await setTaskCompleted(currentUser.uid, taskId, !completed);
    } catch (updateError: unknown) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update this task.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <ThemedText style={styles.eyebrow}>STAY ON TRACK</ThemedText>
          <ThemedText style={styles.heading}>Tasks & reminders</ThemedText>
          <ThemedText style={styles.muted}>
            Make the next small step easy to remember.
          </ThemedText>

          {dataError || error ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>
              {error || dataError}
            </ThemedText>
          ) : null}

          <View style={styles.form}>
            <ThemedText style={styles.formTitle}>Add a task</ThemedText>
            <TextInput
              accessibilityLabel="Task description"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Follow up with the recruiter"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
            />
            <View style={styles.inlineFields}>
              <View style={styles.dateField}>
                <ThemedText style={styles.label}>Due date</ThemedText>
                <TextInput
                  accessibilityLabel="Due date"
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.light.textSecondary}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </View>
            {applications.length ? (
              <View style={styles.field}>
                <ThemedText style={styles.label}>Link to application</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.applicationOptions}
                >
                  <Pressable
                    onPress={() => setApplicationId("")}
                    style={[
                      styles.option,
                      !applicationId && styles.optionSelected,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        !applicationId && styles.optionTextSelected,
                      ]}
                    >
                      None
                    </ThemedText>
                  </Pressable>
                  {applications.map((application) => {
                    const selected = applicationId === application.id;
                    return (
                      <Pressable
                        key={application.id}
                        onPress={() => setApplicationId(application.id)}
                        style={[styles.option, selected && styles.optionSelected]}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            selected && styles.optionTextSelected,
                          ]}
                        >
                          {application.company}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => void addTask()}
              style={({ pressed }) => [
                styles.addButton,
                pressed && !saving && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.addButtonText}>Add reminder</ThemedText>
              )}
            </Pressable>
          </View>

          <View style={styles.taskHeading}>
            <ThemedText style={styles.sectionTitle}>
              {showCompleted ? "All tasks" : "Open tasks"}
            </ThemedText>
            <Pressable onPress={() => setShowCompleted((value) => !value)}>
              <ThemedText style={styles.textLink}>
                {showCompleted ? "Hide completed" : "Show completed"}
              </ThemedText>
            </Pressable>
          </View>
          {visibleTasks.length ? (
            visibleTasks.map((task) => {
              const linkedApplication = applications.find(
                (application) => application.id === task.applicationId,
              );
              return (
                <View key={task.id} style={styles.taskRow}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: task.completed }}
                    accessibilityLabel={`Mark ${task.title} ${
                      task.completed ? "incomplete" : "complete"
                    }`}
                    onPress={() =>
                      void toggleTask(task.id, task.completed)
                    }
                    style={[
                      styles.checkbox,
                      task.completed && styles.checkboxChecked,
                    ]}
                  >
                    {task.completed ? (
                      <ThemedText style={styles.check}>✓</ThemedText>
                    ) : null}
                  </Pressable>
                  <View style={styles.taskCopy}>
                    <ThemedText
                      style={[
                        styles.taskTitle,
                        task.completed && styles.completedTitle,
                      ]}
                    >
                      {task.title}
                    </ThemedText>
                    <ThemedText style={styles.muted}>
                      {formatDate(task.dueDate)}
                      {linkedApplication
                        ? ` · ${linkedApplication.company}`
                        : ""}
                    </ThemedText>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <ThemedText style={styles.emptyTitle}>Nothing on your list</ThemedText>
              <ThemedText style={styles.muted}>
                Your follow-ups and reminders will appear here.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
      <JobTrackerNav active="Tasks" />
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
  scroll: { alignItems: "center", paddingBottom: 24 },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  heading: { fontSize: 29, lineHeight: 36, fontWeight: "700", letterSpacing: -0.7 },
  muted: { color: Colors.light.textSecondary, fontSize: 15, lineHeight: 22 },
  error: { color: "#B42318", fontSize: 15, lineHeight: 22 },
  form: {
    gap: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 14,
    padding: 16,
  },
  formTitle: { fontSize: 16, fontWeight: "700" },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    color: Colors.light.text,
    fontSize: 16,
  },
  inlineFields: { flexDirection: "row", gap: 10 },
  dateField: { flex: 1, gap: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  field: { gap: 7 },
  applicationOptions: { gap: 7 },
  option: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionSelected: {
    borderColor: Colors.light.text,
    backgroundColor: Colors.light.text,
  },
  optionText: { color: Colors.light.textSecondary, fontSize: 14 },
  optionTextSelected: { color: "#FFFFFF", fontWeight: "600" },
  addButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.text,
    borderRadius: 9,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.65 },
  taskHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 11,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  textLink: { fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  taskRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: 10,
  },
  checkbox: {
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.textSecondary,
    borderRadius: 7,
  },
  checkboxChecked: {
    borderColor: Colors.light.text,
    backgroundColor: Colors.light.text,
  },
  check: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  taskCopy: { flex: 1, gap: 2 },
  taskTitle: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  completedTitle: {
    color: Colors.light.textSecondary,
    textDecorationLine: "line-through",
  },
  emptyCard: {
    gap: 5,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundElement,
    padding: 16,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700" },
});
