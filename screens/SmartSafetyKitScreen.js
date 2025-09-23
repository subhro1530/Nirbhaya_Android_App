import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
} from "react-native";
import * as SMS from "expo-sms";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import { GROQ_API_KEY } from "@env";

export default function SmartSafetyKitScreen() {
  const [contactsText, setContactsText] = useState("");
  const [safeTimerMins, setSafeTimerMins] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [tip, setTip] = useState("");
  const tipIndex = useRef(0);

  const [location, setLocation] = useState(null);
  const watcher = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const alertSentRef = useRef(false);

  const tips = [
    "Share your route with a trusted friend before starting.",
    "Keep your phone charged and volume slightly up.",
    "Trust your instincts—leave uncomfortable situations early.",
    "Use Walk Mode for periodic live location updates.",
    "Prepare a code word with family for discreet alerts.",
  ];

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      watcher.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 4000,
          distanceInterval: 5,
        },
        (loc) => setLocation(loc.coords)
      );
    })();
    return () => watcher.current?.remove();
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
      if (!alertSentRef.current) {
        alertSentRef.current = true; // one-shot guard
        setTimerActive(false);
        autoAlert();
      }
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
    if (!list.length) return Alert.alert("Contacts", "Please enter contacts.");
    const available = await SMS.isAvailableAsync();
    if (!available) return Alert.alert("SMS", "Not available on this device.");
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
    if (isNaN(mins) || mins <= 0)
      return Alert.alert("Timer", "Enter valid minutes.");
    if (!parseContacts().length)
      return Alert.alert("Contacts", "Add contacts first.");
    setCountdown(mins * 60);
    setTimerActive(true);
    alertSentRef.current = false; // reset guard on new timer
    Alert.alert(
      "Safe Timer Active",
      `If you don't cancel in ${mins} minute(s), an alert will be sent.`
    );
  };

  const cancelSafeTimer = () => {
    setTimerActive(false);
    setCountdown(0);
    alertSentRef.current = false; // reset guard
  };

  const autoAlert = async () => {
    const list = parseContacts();
    if (!list.length) return;
    const link = await getLocationLink();
    const msg = `⏰ Safe Timer expired. Please reach me ASAP. Last known location: ${link}`;
    await SMS.sendSMSAsync(list, msg);
    Alert.alert("Auto Alert Sent", "Safe timer alert delivered.");
  };

  const sendBotMessage = async () => {
    const userText = input.trim();
    if (!userText) return;
    const locText = location
      ? `My coords: ${location.latitude},${location.longitude}.`
      : "";
    const prompt = `You are a concise safety assistant. Provide quick, calm guidance and a short plan relevant to the user's situation and nearby environment. If helpful, suggest checking the Emergency Map screen. ${locText} User: ${userText}`;
    setInput("");
    const updated = [...messages, { role: "user", content: userText }];
    setMessages(updated);
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const botReply =
        res.data?.choices?.[0]?.message?.content ??
        "Stay aware. If urgent, use SOS.";
      setMessages([...updated, { role: "assistant", content: botReply }]);
    } catch (e) {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "I couldn't respond right now. Try again shortly.",
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Safety Kit</Text>
      <Text style={styles.explain}>
        This kit puts safety tools at your fingertips: quick check-ins, an auto
        Safe Timer, live map tracking, and a helper chatbot for guidance.
      </Text>
      <Text style={styles.tip}>💡 {tip}</Text>

      {/* Live Map (follows user) */}
      <View style={styles.mapWrap}>
        <MapView
          style={styles.map}
          showsUserLocation
          region={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
              : undefined
          }
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You"
              description="Current position"
            />
          )}
        </MapView>
      </View>

      {/* Quick Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Contacts</Text>
        <TextInput
          placeholder="Enter contact numbers separated by commas"
          placeholderTextColor="#888"
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

      {/* Safe Timer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safe Timer</Text>
        <TextInput
          placeholder="Minutes (e.g. 10)"
          placeholderTextColor="#888"
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
              style={[styles.fullBtn, { backgroundColor: "#777" }]}
              onPress={cancelSafeTimer}
            >
              <Text style={styles.fullBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mini Chatbot */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Helper Chat</Text>
        <FlatList
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ gap: 6 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.msg,
                item.role === "user" ? styles.userMsg : styles.botMsg,
              ]}
            >
              <Text style={styles.msgText}>{item.content}</Text>
            </View>
          )}
        />
        <View style={styles.chatRow}>
          <TextInput
            placeholder="Ask for quick guidance..."
            placeholderTextColor="#888"
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity
            style={[
              styles.fullBtn,
              { backgroundColor: "#FF5A5F", marginLeft: 8 },
            ]}
            onPress={sendBotMessage}
          >
            <Text style={styles.fullBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    paddingHorizontal: 16,
    paddingTop: 48, // more top margin
  },
  title: {
    fontSize: 24,
    color: "#222",
    textAlign: "center",
    fontWeight: "800",
  },
  explain: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 10,
  },
  tip: { textAlign: "center", color: "#7A4", marginBottom: 10, fontSize: 13 },
  mapWrap: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6DBD2",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  map: { flex: 1 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  sectionTitle: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EDE0D6",
    padding: 10,
    color: "#333",
    fontSize: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "700" },
  fullBtn: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  fullBtnText: { color: "#fff", fontWeight: "700" },
  timerBox: { alignItems: "center" },
  timerText: { color: "#333", fontSize: 14, marginBottom: 6 },
  msg: { padding: 10, borderRadius: 10, maxWidth: "90%" },
  userMsg: { alignSelf: "flex-end", backgroundColor: "#FFE1E3" },
  botMsg: { alignSelf: "flex-start", backgroundColor: "#F4F0EB" },
  msgText: { color: "#333", fontSize: 14 },
  chatRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
});
