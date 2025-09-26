import Toast from "react-native-root-toast";

const colorMap = {
  success: "#2e7d32",
  error: "#c62828",
  info: "#333",
};

export const notify = (msg, type = "info") => {
  if (!msg) return;
  Toast.show(msg, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.BOTTOM,
    shadow: false,
    backgroundColor: colorMap[type] || colorMap.info,
    textColor: "#fff",
    opacity: 1,
  });
};

export const notifySuccess = (m) => notify(m, "success");
export const notifyError = (m) => notify(m, "error");
export const notifyInfo = (m) => notify(m, "info");
