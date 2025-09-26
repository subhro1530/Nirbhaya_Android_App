import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { notifySuccess, notifyError, notifyInfo } from "../utils/notify";

const LOCAL_KEY = "@sos_local_logs";

export default function SosLogScreen() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [resolving, setResolving] = useState(null);
  const canUse = user?.role === "user";

  const merge = (server, local) => {
    const map = {};
    local.forEach((l) => (map[l.id] = l));
    server.forEach((s) => {
      map[s.id] = { ...map[s.id], ...s, source: "server" };
    });
    return Object.values(map).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  };

  const load = useCallback(
    async (silent = false) => {
      if (!token || !canUse) return;
      if (!silent) setRefreshing(true);
      let local = [];
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        local = raw ? JSON.parse(raw) : [];
      } catch {}
      let server = [];
      try {
        const r = await apiFetch("/sos/mine", { token });
        server = Array.isArray(r) ? r : [];
      } catch {
        notifyInfo("Offline – showing cached SOS");
      }
      setItems(merge(server, local));
      if (!silent) setRefreshing(false);
    },
    [token, canUse]
  );

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id) => {
    setResolving(id);
    try {
      await apiFetch(`/sos/resolve/${id}`, {
        token,
        method: "PUT",
        body: { note: "Resolved" },
      });
      notifySuccess("Resolved");
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, active: false } : i))
      );
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        await AsyncStorage.setItem(
          LOCAL_KEY,
          JSON.stringify(
            arr.map((i) => (i.id === id ? { ...i, active: false } : i))
          )
        );
      } catch {}
    } catch {
      notifyError("Resolve failed");
    } finally {
      setResolving(null);
    }
  };

  if (!canUse) {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Not authorized.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text
          style={[
            styles.status,
            item.active ? styles.stActive : styles.stResolved,
          ]}
        >
          {item.active ? "ACTIVE" : "RESOLVED"}
        </Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.note}>{item.note || "No note"}</Text>
      <Text style={styles.meta}>Type: {item.emergency_type || "-"}</Text>
      <Text style={styles.metaSmall}>
        Source: {item.source || (item.id.startsWith("local-") ? "local" : "server")}
      </Text>
      {item.active && (
        <TouchableOpacity
          style={styles.resolveBtn}
            onPress={() => resolve(item.id)}
          disabled={!!resolving}
        >
          {resolving === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.resolveTxt}>Resolve</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My SOS Log</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load()} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {refreshing ? "Loading..." : "No SOS alerts yet."}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF6F0", padding: 18, paddingTop: 48 },
  title: { fontSize: 22, fontWeight: "800", color: "#222", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6DBD2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  status: {
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    color: "#fff",
  },
  stActive: { backgroundColor: "#c62828" },
  stResolved: { backgroundColor: "#2e7d32" },
  note: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
  meta: { fontSize: 12, color: "#555" },
  metaSmall: { fontSize: 10, color: "#777", marginTop: 2 },
  resolveBtn: {
    marginTop: 10,
    backgroundColor: "#2e7d32",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  resolveTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
});
