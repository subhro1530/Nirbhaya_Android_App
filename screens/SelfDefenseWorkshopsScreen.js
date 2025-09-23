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
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return Alert.alert("Invalid", "Enter a valid email.");
    Alert.alert("Subscribed", "You will receive workshop updates.");
    setEmail("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Self-Defense Workshops</Text>
      <Text style={styles.desc}>
        Learn practical skills to build confidence and awareness. Explore
        upcoming sessions and subscribe for updates.
      </Text>

      <Image
        source={require("../assets/poster1.png")}
        style={styles.poster}
        resizeMode="cover"
      />

      <Text style={styles.subHeader}>Upcoming Highlights</Text>
      <View style={styles.highlight}>
        <Text style={styles.point}>• Urban Escape Basics – Sat 6 PM</Text>
        <Text style={styles.point}>• Wrist Grab Defense – Sun 11 AM</Text>
        <Text style={styles.point}>• Awareness & De-escalation – Wed 7 PM</Text>
      </View>

      {/* Subscribe at the end */}
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
        We only send essential workshop reminders. You can opt out anytime.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#FFF6F0", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "800", color: "#222", marginBottom: 6 },
  desc: {
    color: "#555",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: "center",
  },
  poster: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  subHeader: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  highlight: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  point: { color: "#333", fontSize: 13, marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    color: "#333",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    marginBottom: 10,
    marginTop: 4,
  },
  btn: {
    backgroundColor: "#11998e",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  footer: {
    color: "#777",
    fontSize: 11,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
