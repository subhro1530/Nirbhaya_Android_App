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
  const subscribe = (topic = "workshop") => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return Alert.alert("Invalid", "Enter a valid email.");
    Alert.alert("Subscribed", `You will receive updates for ${topic}.`);
    setEmail("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Self-Defense Workshops</Text>
      <Text style={styles.desc}>
        Learn practical skills to build confidence and awareness. Explore
        upcoming sessions and subscribe for updates.
      </Text>

      {/* Poster 1 */}
      <View style={styles.card}>
        <Image
          source={require("../assets/poster1.png")}
          style={styles.poster}
          resizeMode="cover"
        />
        <Text style={styles.cardTitle}>Urban Escape Basics</Text>
        <Text style={styles.cardMeta}>
          Sat 6 PM • Beginner friendly • 90 mins
        </Text>
        <TouchableOpacity
          style={styles.cardBtn}
          onPress={() => subscribe("Urban Escape Basics")}
        >
          <Text style={styles.cardBtnText}>Subscribe for Updates</Text>
        </TouchableOpacity>
      </View>

      {/* Poster 2 */}
      <View style={styles.card}>
        <Image
          source={require("../assets/poster2.png")}
          style={styles.poster}
          resizeMode="cover"
        />
        <Text style={styles.cardTitle}>Wrist Grab Defense</Text>
        <Text style={styles.cardMeta}>Sun 11 AM • Hands-on • 60 mins</Text>
        <TouchableOpacity
          style={styles.cardBtn}
          onPress={() => subscribe("Wrist Grab Defense")}
        >
          <Text style={styles.cardBtnText}>Subscribe for Updates</Text>
        </TouchableOpacity>
      </View>

      {/* Email field (optional) */}
      <Text style={styles.subHeader}>Use email to subscribe</Text>
      <TextInput
        placeholder="Your email"
        placeholderTextColor="#666"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.btn}
        onPress={() => subscribe("all workshops")}
      >
        <Text style={styles.btnText}>Subscribe</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        We only send essential workshop reminders. You can opt out anytime.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#FFF6F0",
    flexGrow: 1,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    color: "#555",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    marginBottom: 16,
    overflow: "hidden",
  },
  poster: { width: "100%", height: 280, backgroundColor: "#fff" },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  cardMeta: {
    fontSize: 12,
    color: "#666",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
  },
  cardBtn: {
    backgroundColor: "#11998e",
    marginHorizontal: 12,
    marginBottom: 14,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  cardBtnText: { color: "#fff", fontWeight: "700" },
  subHeader: {
    color: "#222",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    color: "#333",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    marginBottom: 10,
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
