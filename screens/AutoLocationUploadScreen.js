import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { notifyError, notifySuccess, notifyInfo } from "../utils/notify";

const TASK_NAME = "AUTO_LOCATION_UPLOAD_TASK";
let currentIntervalMs = 0;

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) return;
  try {
    const stateRaw = global.__AUTO_UPLOAD_STATE__;
    if (!stateRaw) return;
    const { token } = stateRaw;
    const loc = data?.locations?.[0];
    if (!token || !loc) return;
    const link = `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;
    // capture response
    let resp;
    try {
      resp = await apiFetch("/location/upload", {
        token,
        method: "POST",
        body: { link },
      });
    } catch {
      return;
    }
    global.__LAST_AUTO_UPLOAD__ = Date.now();
    if (resp?.recorded_at) {
      global.__LAST_AUTO_UPLOAD_RECORDED_AT__ = resp.recorded_at;
    }
  } catch {}
});

export default function AutoLocationUploadScreen() {
  const { token, user } = useAuth();
  const [minutes, setMinutes] = useState("5");
  const [active, setActive] = useState(false);
  const [lastTs, setLastTs] = useState(null);
  const [log, setLog] = useState([]);
  const [manualUploading, setManualUploading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (
        global.__LAST_AUTO_UPLOAD__ &&
        global.__LAST_AUTO_UPLOAD__ !== lastTs
      ) {
        setLastTs(global.__LAST_AUTO_UPLOAD__);
        setLog((p) =>
          [
            {
              id: global.__LAST_AUTO_UPLOAD__.toString(),
              ts: global.__LAST_AUTO_UPLOAD__,
            },
            ...p,
          ].slice(0, 10)
        );
      }
    }, 2000);
    return () => clearInterval(id);
  }, [lastTs]);

  const start = async () => {
    if (user?.role !== "user") return;
    const m = parseInt(minutes);
    if (isNaN(m) || m <= 0) {
      notifyError("Enter valid minutes");
      return;
    }
    if (!token) {
      notifyError("Login required");
      return;
    }
    const fg = await Location.requestForegroundPermissionsAsync();
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (fg.status !== "granted" || bg.status !== "granted") {
      notifyError("Location permission needed");
      return;
    }
    currentIntervalMs = m * 60 * 1000;
    global.__AUTO_UPLOAD_STATE__ = { token };
    try {
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: currentIntervalMs,
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Auto Location Upload",
          notificationBody: "Uploading location periodically.",
        },
      });
      setActive(true);
      setLog([]);
      setLastTs(null);
      notifySuccess("Auto upload started");
    } catch {
      notifyError("Failed to start");
    }
  };

  const stop = async () => {
    try {
      const running = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
      if (running) await Location.stopLocationUpdatesAsync(TASK_NAME);
    } catch {}
    setActive(false);
    notifyInfo("Stopped");
  };

  const manualUploadNow = async () => {
    if (user?.role !== "user" || !token) return;
    setManualUploading(true);
    try {
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") {
        notifyError("Permission denied");
        setManualUploading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const link = `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;
      const resp = await apiFetch("/location/upload", {
        token,
        method: "POST",
        body: { link },
      });
      notifySuccess(`Uploaded${resp?.recorded_at ? "" : ""}`);
      global.__LAST_AUTO_UPLOAD__ = Date.now();
      if (resp?.recorded_at) {
        global.__LAST_AUTO_UPLOAD_RECORDED_AT__ = resp.recorded_at;
      }
    } catch {
      notifyError("Manual upload failed");
    } finally {
      setManualUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      // optional: keep running if desired; leaving as-is
    };
  }, []);

  if (user?.role !== "user")
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Only users can use auto upload.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auto Location Upload</Text>
      <Text style={styles.desc}>
        Automatically uploads your location to trusted guardians every chosen
        interval. Works in background (keep app running). Use responsibly.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Interval minutes (e.g. 5)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={minutes}
        onChangeText={setMinutes}
        editable={!active}
      />
      {!active ? (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#2e7d32" }]}
          onPress={start}
        >
          <Text style={styles.btnText}>Start</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#c62828" }]}
          onPress={stop}
        >
          <Text style={styles.btnText}>Stop</Text>
        </TouchableOpacity>
      )}
      {active && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#546e7a", marginTop: -4 }]}
          onPress={manualUploadNow}
          disabled={manualUploading}
        >
          <Text style={styles.btnText}>
            {manualUploading ? "Uploading..." : "Upload Now"}
          </Text>
        </TouchableOpacity>
      )}
      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>
          Status:{" "}
          <Text style={{ color: active ? "#2e7d32" : "#c62828" }}>
            {active ? "ACTIVE" : "INACTIVE"}
          </Text>
        </Text>
        <Text style={styles.statusLabel}>
          Last Upload: {lastTs ? new Date(lastTs).toLocaleTimeString() : "—"}
        </Text>
        {global.__LAST_AUTO_UPLOAD_RECORDED_AT__ && (
          <Text style={styles.statusLabel}>
            Recorded:{" "}
            {new Date(
              global.__LAST_AUTO_UPLOAD_RECORDED_AT__
            ).toLocaleTimeString()}
          </Text>
        )}
        <Text style={styles.statusHint}>
          Uploads every {active ? currentIntervalMs / 60000 : minutes || "?"}{" "}
          min(s)
        </Text>
      </View>
      <Text style={styles.logHeader}>Recent Uploads</Text>
      <FlatList
        data={log}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Text style={styles.logItem}>
            • {new Date(item.ts).toLocaleTimeString()}
          </Text>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {active ? "Waiting..." : "None yet."}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ flexGrow: 0 }}
      />
      <Text style={styles.footerNote}>
        NOTE: Background tasks may be paused by the OS (especially on iOS) if
        the app is killed.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    padding: 20,
    paddingTop: 48,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#222", marginBottom: 6 },
  desc: { fontSize: 12, color: "#555", lineHeight: 16, marginBottom: 12 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6DBD2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#333",
    fontSize: 14,
    marginBottom: 12,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  statusBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    padding: 14,
    marginBottom: 20,
  },
  statusLabel: { fontSize: 12, color: "#444", marginBottom: 4 },
  statusHint: { fontSize: 11, color: "#777" },
  logHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  logItem: { fontSize: 12, color: "#444", marginBottom: 4 },
  empty: { textAlign: "center", color: "#777", fontSize: 12 },
  footerNote: { fontSize: 10, color: "#777", marginTop: 24, lineHeight: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
});
