import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

export default function SelfDefenseWorkshopsScreen() {
  const [email, setEmail] = useState("");

  const subscribe = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      Alert.alert("Invalid", "Enter a valid email.");
      return;
    }
    Alert.alert("Subscribed", "You will receive workshop updates.");
    setEmail("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🥋 Self-Defense Workshops</Text>
      <Text style={styles.desc}>
        Build confidence and practical safety skills. Join upcoming sessions
        below and subscribe for alerts.
      </Text>
      <View style={styles.posterRow}>
        <Image
          source={require("../assets/poster1.png")}
          style={styles.poster}
          resizeMode="cover"
        />
        <Image
          source={require("../assets/poster2.png")}
          style={styles.poster}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.subHeader}>Upcoming Highlights</Text>
      <View style={styles.highlight}>
        <Text style={styles.point}>• Urban Escape Basics – Sat 6 PM</Text>
        <Text style={styles.point}>• Wrist Grab Defense – Sun 11 AM</Text>
        <Text style={styles.point}>• Awareness & De-escalation – Wed 7 PM</Text>
      </View>
      <Text style={styles.subHeader}>Subscribe for Updates</Text>
      <TextInput
        placeholder="Your email"
        placeholderTextColor="#666"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.btn} onPress={subscribe}>
        <Text style={styles.btnText}>Subscribe</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        We only send essential workshop reminders. You can opt-out anytime.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#111", flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  desc: { color: "#bbb", fontSize: 13, lineHeight: 18, marginBottom: 20 },
  posterRow: { flexDirection: "row", justifyContent: "space-between" },
  poster: {
    width: "48%",
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  subHeader: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 10,
  },
  highlight: {
    backgroundColor: "#1b1b1b",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#272727",
  },
  point: { color: "#ddd", fontSize: 13, marginBottom: 4 },
  input: {
    backgroundColor: "#1d1d1d",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#272727",
    marginBottom: 12,
    marginTop: 4,
  },
  btn: {
    backgroundColor: "#11998e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  footer: {
    color: "#555",
    fontSize: 11,
    marginTop: 20,
    textAlign: "center",
    lineHeight: 16,
  },
});
