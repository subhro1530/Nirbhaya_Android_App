import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import * as SMS from "expo-sms";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

const { width } = Dimensions.get("window");
const LOCATION_TASK_NAME = "background-location-task";

let globalTrustedContact = "";
let globalInterval = 5;
let globalLastSentAt = null; // track last sent timestamp

export default function WalkMode() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [trustedContact, setTrustedContact] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("5");
  const timerRef = useRef(null);

  // NEW: enhanced UI state
  const [nextSendIn, setNextSendIn] = useState(0);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [log, setLog] = useState([]);
  const [quote, setQuote] = useState("");

  const quoteList = [
    "You are strong. Keep moving forward.",
    "Every step is protected. You are not alone.",
    "Your safety matters. Stay aware & confident.",
    "Courage is your silent companion tonight.",
    "Breathe. Focus. You are in control.",
  ];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // NEW: countdown + poll background sent time
  useEffect(() => {
    if (!isActive || isPaused) return;
    const id = setInterval(() => {
      setNextSendIn((s) => (s <= 1 ? globalInterval * 60 : s - 1));
      if (globalLastSentAt && globalLastSentAt !== lastSentAt) {
        setLastSentAt(globalLastSentAt);
        setLog((prev) =>
          [
            {
              ts: globalLastSentAt,
              label: `Location SMS sent at ${new Date(
                globalLastSentAt
              ).toLocaleTimeString()}`,
            },
            ...prev,
          ].slice(0, 5)
        );
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, isPaused, lastSentAt]);

  const startJourney = async () => {
    if (!trustedContact || !intervalMinutes) {
      Alert.alert("Hold on", "Please enter both contact number and interval.");
      return;
    }
    const interval = parseInt(intervalMinutes);
    if (isNaN(interval) || interval <= 0) {
      Alert.alert(
        "Invalid Interval",
        "Please enter a valid number of minutes."
      );
      return;
    }

    globalTrustedContact = trustedContact;
    globalInterval = interval;

    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (foregroundStatus !== "granted" || backgroundStatus !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need your location permission to start tracking."
      );
      return;
    }

    setIsActive(true);
    setIsPaused(false);
    setQuote(quoteList[Math.floor(Math.random() * quoteList.length)]);
    setNextSendIn(interval * 60);
    setLastSentAt(null);
    setLog([]);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: interval * 60 * 1000, // in ms
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Emergency Walk Mode",
        notificationBody: "Keeping you safe with location updates.",
        notificationColor: "#FF0000",
      },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Emergency Walk Mode",
        body: "Your journey has started. Stay alert!",
        categoryIdentifier: "stop",
      },
      trigger: null,
    });
  };

  const pauseJourney = async () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  };

  const resumeJourney = async () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: globalInterval * 60 * 1000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Emergency Walk Mode",
        notificationBody: "Tracking your journey in real-time.",
        notificationColor: "#FF0000",
      },
    });
  };

  const stopJourney = async () => {
    setIsActive(false);
    setIsPaused(false);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    setQuote("");
    setNextSendIn(0);
  };

  const formatMMSS = (sec) =>
    `${Math.floor(sec / 60)
      .toString()
      .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Text style={styles.note}>
        🚨 Location will be shared every {intervalMinutes || "5"} minute(s).
        Stay safe!
      </Text>

      {!isActive && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter trusted contact number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            onChangeText={setTrustedContact}
            value={trustedContact}
          />
          <TextInput
            style={styles.input}
            placeholder="Interval in minutes (e.g., 5)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            onChangeText={setIntervalMinutes}
            value={intervalMinutes}
          />
        </>
      )}

      <Text style={styles.header}>🚶‍♀️ Emergency Walk Mode</Text>
      {quote ? <Text style={styles.quote}>“{quote}”</Text> : null}

      <View style={styles.circle}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startJourney}>
            <Text style={styles.buttonText}>START</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controls}>
            <Text style={styles.timer}>
              {`${Math.floor(timer / 60)
                .toString()
                .padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`}
            </Text>
            <Text style={styles.meta}>
              Next send in: {formatMMSS(nextSendIn)}
            </Text>
            <Text style={styles.meta}>
              {lastSentAt
                ? `Last sent: ${new Date(lastSentAt).toLocaleTimeString()}`
                : "Waiting for first location send..."}
            </Text>
            <View style={styles.controlButtons}>
              {isPaused ? (
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: "#27ae60" }]}
                  onPress={resumeJourney}
                >
                  <Text style={styles.controlText}>Resume</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: "#f39c12" }]}
                  onPress={pauseJourney}
                >
                  <Text style={styles.controlText}>Pause</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: "#e74c3c" }]}
                onPress={stopJourney}
              >
                <Text style={styles.controlText}>Stop</Text>
              </TouchableOpacity>
            </View>

            {log.length > 0 && (
              <View style={styles.logBox}>
                <Text style={styles.logTitle}>Recent Sends</Text>
                <FlatList
                  data={log}
                  keyExtractor={(i) => i.ts.toString()}
                  renderItem={({ item }) => (
                    <Text style={styles.logItem}>• {item.label}</Text>
                  )}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (globalTrustedContact && location) {
      const message = `📍 Live Location: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
      await SMS.sendSMSAsync([globalTrustedContact], message);
      globalLastSentAt = Date.now(); // NEW: mark last sent
    }
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  note: {
    color: "#ff6b6b",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  header: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  circle: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    elevation: 10,
  },
  startButton: {
    backgroundColor: "#3498db",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 100,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  controls: {
    alignItems: "center",
  },
  timer: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  controlButtons: {
    flexDirection: "row",
    gap: 20,
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  controlText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quote: {
    color: "#f5f5f5",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "center",
    opacity: 0.9,
  },
  meta: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 4,
  },
  logBox: {
    marginTop: 16,
    backgroundColor: "#1d1d1d",
    padding: 10,
    borderRadius: 10,
    width: width * 0.65,
    maxHeight: 120,
  },
  logTitle: { color: "#fff", fontWeight: "bold", marginBottom: 6 },
  logItem: { color: "#bbb", fontSize: 12, marginBottom: 2 },
});
