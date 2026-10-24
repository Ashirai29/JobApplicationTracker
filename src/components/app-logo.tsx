import { Image } from "expo-image";
import { StyleSheet, View, type ViewProps } from "react-native";

type AppLogoProps = ViewProps & {
  size?: number;
};

export function AppLogo({ size = 38, style, ...props }: AppLogoProps) {
  return (
    <View
      accessibilityLabel="Job Tracker"
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size * 0.3 },
        style,
      ]}
      {...props}
    >
      <Image
        accessibilityLabel="Briefcase logo"
        contentFit="contain"
        source={require("../../assets/images/job-tracker-logo.svg")}
        style={{ width: size * 0.58, height: size * 0.58 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
});
