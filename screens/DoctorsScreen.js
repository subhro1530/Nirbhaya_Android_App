import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";

export default function DoctorsScreen() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", specialty: "" });
  const [list, setList] = useState([]);

  const submit = async () => {
    if (user?.role !== "ngo") return;
    if (!form.name || !form.phone) return Alert.alert("Fill required");
    try {
      const res = await apiFetch("/doctors", {
        token,
        method: "POST",
        body: form,
      });
      setList([{ id: res.id || Date.now().toString(), ...form }, ...list]);
      setForm({ name: "", phone: "", specialty: "" });
    } catch {
      Alert.alert("Error", "Failed to add doctor");
    }
  };

  if (user?.role !== "ngo") {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>NGO only.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NGO Doctors</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={form.phone}
          onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
          keyboardType="phone-pad"
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Specialty"
        value={form.specialty}
        onChangeText={(v) => setForm((f) => ({ ...f, specialty: v }))}
      />
      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Add Doctor</Text>
      </TouchableOpacity>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.doc}>
              {item.name} • {item.specialty || "General"}
            </Text>
            <Text style={styles.meta}>{item.phone}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No doctors yet.</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    padding: 18,
    paddingTop: 48,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#222", marginBottom: 12 },
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6DBD2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  btn: {
    backgroundColor: "#FF5A5F",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    marginBottom: 10,
  },
  doc: { fontWeight: "700", color: "#333", marginBottom: 4 },
  meta: { color: "#555", fontSize: 12 },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
});
