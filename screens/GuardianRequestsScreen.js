import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { apiFetch } from "../api/client";
import { API_BASE, useAuth } from "../contexts/AuthContext";

export default function GuardianRequestsScreen() {
  const { token, user } = useAuth();
  const [email, setEmail] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [sending, setSending] = useState(false);

  const lookup = async () => {
    if (!email.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE}/users/lookup/email/${encodeURIComponent(email.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data);
      } else {
        setLookupResult(null);
        Alert.alert("Not found");
      }
    } catch {
      Alert.alert("Error", "Lookup failed");
    }
  };

  const sendRequest = async () => {
    if (!lookupResult && !email.trim()) return;
    setSending(true);
    try {
      const body = lookupResult
        ? { targetUserId: lookupResult.id }
        : { targetEmail: email.trim() };
      await apiFetch("/guardian/track-request", {
        token,
        method: "POST",
        body,
      });
      Alert.alert("Sent", "Tracking request created.");
    } catch {
      Alert.alert("Error", "Could not send request");
    } finally {
      setSending(false);
    }
  };

  if (user?.role !== "guardian" && user?.role !== "ngo") {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Only guardians and NGOs can access this screen.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guardian Track Requests</Text>
      <Text style={styles.help}>
        Look up a user by email and send a tracking request.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Target user email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#546e7a" }]}
          onPress={lookup}
        >
          <Text style={styles.btnText}>Lookup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#FF5A5F" }]}
          onPress={sendRequest}
          disabled={sending}
        >
          <Text style={styles.btnText}>
            {sending ? "Sending..." : "Send Request"}
          </Text>
        </TouchableOpacity>
      </View>
      {lookupResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            Found: {lookupResult.name} ({lookupResult.email})
          </Text>
        </View>
      )}
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
  title: { fontSize: 22, fontWeight: "800", color: "#222", marginBottom: 8 },
  help: { color: "#555", fontSize: 13, marginBottom: 14 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#333",
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  resultBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  resultText: { color: "#333", fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "600" },
});

