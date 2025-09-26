import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";

export default function VisibleToScreen() {
  const { token, user } = useAuth();
  const [ids, setIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token || user?.role !== "user") return;
    setRefreshing(true);
    try {
      const data = await apiFetch("/profile/me/visible-to", { token });
      setIds(data?.visibleTo || []);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, [token]);

  if (user?.role !== "user") {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Not authorized.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who Can See Me</Text>
      <FlatList
        data={ids}
        keyExtractor={(i) => i}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.id}>{item}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No guardians approved.</Text>
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
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  id: { color: "#333", fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
});
