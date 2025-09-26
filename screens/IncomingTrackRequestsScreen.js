import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE } from "../contexts/AuthContext";

export default function IncomingTrackRequestsScreen() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/user/track-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, action) => {
    try {
      const res = await fetch(`${API_BASE}/user/track-request/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await load();
      } else {
        Alert.alert("Failed", `Status ${res.status}`);
      }
    } catch {
      Alert.alert("Error", "Action failed");
    }
  };

  if (user?.role !== "user") {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>
          Only users can view incoming track requests.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Track Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.line}>
              Guardian: {item.guardian?.name || "Unknown"}
            </Text>
            <Text style={styles.line}>Email: {item.guardian?.email}</Text>
            <Text style={styles.status}>Status: {item.status}</Text>
            {item.status === "pending" && (
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#2e7d32" }]}
                  onPress={() => act(item.id, "approve")}
                >
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#c62828" }]}
                  onPress={() => act(item.id, "reject")}
                >
                  <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          !refreshing && (
            <Text style={{ textAlign: "center", marginTop: 40, color: "#555" }}>
              No requests.
            </Text>
          )
        }
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
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  line: { color: "#333", fontSize: 13, marginBottom: 4 },
  status: { color: "#555", fontSize: 12, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
});
