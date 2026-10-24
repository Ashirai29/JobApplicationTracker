import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";

import { Colors, MaxContentWidth } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";

const items = [
  {
    label: "Overview",
    route: "/dashboard" as const,
    icon: { ios: "square.grid.2x2", android: "dashboard", web: "dashboard" },
  },
  {
    label: "Applications",
    route: "/applications" as const,
    icon: { ios: "briefcase", android: "work_outline", web: "work_outline" },
  },
  {
    label: "Tasks",
    route: "/tasks" as const,
    icon: { ios: "checkmark.circle", android: "task_alt", web: "task_alt" },
  },
  {
    label: "Insights",
    route: "/insights" as const,
    icon: { ios: "chart.bar", android: "bar_chart", web: "bar_chart" },
  },
  {
    label: "Toolkit",
    route: "/toolkit" as const,
    icon: { ios: "sparkles", android: "auto_awesome", web: "auto_awesome" },
  },
] as const;

export function JobTrackerNav({ active }: { active: string }) {
  const router = useRouter();
  return (
    <View style={styles.wrapper}>
      <View style={styles.nav}>
        {items.map((item) => {
          const selected = item.label === active;
          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [
                styles.item,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={item.icon}
                tintColor={selected ? Colors.light.text : Colors.light.textSecondary}
                size={19}
              />
              <ThemedText
                style={[styles.label, selected && styles.selectedLabel]}
              >
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: Colors.light.background,
  },
  nav: {
    width: "100%",
    maxWidth: MaxContentWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 9,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 46,
    borderRadius: 10,
  },
  selected: {
    backgroundColor: Colors.light.backgroundElement,
  },
  label: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  selectedLabel: {
    color: Colors.light.text,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.65,
  },
});
