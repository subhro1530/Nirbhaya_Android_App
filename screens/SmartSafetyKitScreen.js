import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import * as SMS from "expo-sms";
import * as Location from "expo-location";

export default function SmartSafetyKitScreen() {
  const [contactsText, setContactsText] = useState("");
  const [safeTimerMins, setSafeTimerMins] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [tip, setTip] = useState("");
  const tipIndex = useRef(0);

  const tips = [
    "Share your route with a trusted friend before starting.",
    "Keep your phone charged and volume slightly up.",
    "Trust your instincts—leave uncomfortable situations early.",
    "Use Walk Mode for periodic live location updates.",
    "Prepare a code word with family for discreet alerts.",
  ];

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      tipIndex.current = (tipIndex.current + 1) % tips.length;
      setTip(tips[tipIndex.current]);
    }, 7000);
    setTip(tips[0]);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    if (countdown <= 0) {
      setTimerActive(false);
      autoAlert();
      return;
    }
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, countdown]);

  const parseContacts = () =>
    contactsText
      .split(/[,;\s]+/)
      .map((c) => c.trim())
      .filter((c) => c.length >= 8);

  const getLocationLink = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      return `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;
    } catch {
      return "Location unavailable";
    }
  };

  const sendSmartMessage = async (mode) => {
    const list = parseContacts();
    if (!list.length) {
      Alert.alert("Contacts", "Please enter at least one contact number.");
      return;
    }
    const available = await SMS.isAvailableAsync();
    if (!available) {
      Alert.alert("SMS", "SMS not available on this device.");
      return;
    }
    const link = await getLocationLink();
    const msg =
      mode === "safe"
        ? `✅ Quick Check-In: I'm okay. My current location: ${link}`
        : `⚠️ I need help. Please check on me. Location: ${link}`;
    await SMS.sendSMSAsync(list, msg);
    Alert.alert(
      "Sent",
      mode === "safe" ? "Safe check-in sent." : "Help alert sent."
    );
  };

  const startSafeTimer = () => {
    const mins = parseInt(safeTimerMins);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert("Timer", "Enter valid minutes.");
      return;
    }
    if (!parseContacts().length) {
      Alert.alert("Contacts", "Add contacts first.");
      return;
    }
    setCountdown(mins * 60);
    setTimerActive(true);
    Alert.alert(
      "Safe Timer Active",
      `If you don't cancel in ${mins} minute(s), an alert will be sent.`
    );
  };

  const cancelSafeTimer = () => {
    setTimerActive(false);
    setCountdown(0);
  };

  const autoAlert = async () => {
    const list = parseContacts();
    if (!list.length) return;
    const link = await getLocationLink();
    const msg = `⏰ Safe Timer expired. Please reach me ASAP. Last known location: ${link}`;
    await SMS.sendSMSAsync(list, msg);
    Alert.alert("Auto Alert Sent", "Safe timer alert delivered.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Smart Safety Kit</Text>
      <Text style={styles.tip}>💡 {tip}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Contacts</Text>
        <TextInput
          placeholder="Enter contact numbers separated by commas"
          placeholderTextColor="#777"
          style={styles.input}
          value={contactsText}
          onChangeText={setContactsText}
        />
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#2e7d32" }]}
            onPress={() => sendSmartMessage("safe")}
          >
            <Text style={styles.actionText}>I'm Safe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#c62828" }]}
            onPress={() => sendSmartMessage("help")}
          >
            <Text style={styles.actionText}>Need Help</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safe Timer</Text>
        <TextInput
          placeholder="Minutes (e.g. 10)"
          placeholderTextColor="#777"
          keyboardType="numeric"
          style={styles.input}
          value={safeTimerMins}
          onChangeText={setSafeTimerMins}
        />
        {!timerActive ? (
          <TouchableOpacity
            style={[styles.fullBtn, { backgroundColor: "#ff8f00" }]}
            onPress={startSafeTimer}
          >
            <Text style={styles.fullBtnText}>Start Safe Timer</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>
              Auto alert in{" "}
              {`${Math.floor(countdown / 60)
                .toString()
                .padStart(2, "0")}:${(countdown % 60)
                .toString()
                .padStart(2, "0")}`}
            </Text>
            <TouchableOpacity
              style={[styles.fullBtn, { backgroundColor: "#555" }]}
              onPress={cancelSafeTimer}
            >
              <Text style={styles.fullBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Use Smart Safety Kit to stay proactive. Combine with Walk Mode for
          layered protection.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  tip: {
    textAlign: "center",
    color: "#ffca28",
    marginBottom: 20,
    fontSize: 14,
  },
  section: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#262626",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 14,
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "600" },
  fullBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  fullBtnText: { color: "#fff", fontWeight: "600" },
  timerBox: { alignItems: "center" },
  timerText: { color: "#fff", fontSize: 16, marginBottom: 8 },
  footer: { marginTop: "auto", paddingVertical: 20 },
  footerText: { color: "#666", fontSize: 12, textAlign: "center" },
});
