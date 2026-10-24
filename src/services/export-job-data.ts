import { Platform } from "react-native";

export async function exportJobTrackerData(csv: string) {
  if (Platform.OS === "web") {
    if (typeof document === "undefined") {
      throw new Error("File export is not available in this browser context.");
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobtrack-export-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return;
  }

  const [{ File, Paths }, Sharing] = await Promise.all([
    import("expo-file-system"),
    import("expo-sharing"),
  ]);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("File sharing is not available on this device.");
  }

  const file = new File(Paths.cache, `jobtrack-export-${Date.now()}.csv`);
  file.create({ overwrite: true });
  file.write(csv);
  await Sharing.shareAsync(file.uri, {
    dialogTitle: "Export JobTrack data",
    mimeType: "text/csv",
    UTI: "public.comma-separated-values-text",
  });
}
