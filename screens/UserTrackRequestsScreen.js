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
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { notifySuccess, notifyError } from "../utils/notify";

export default function UserTrackRequestsScreen() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAct, setLoadingAct] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    if (!token || user?.role !== "user") return;
    setRefreshing(true);
    setLoadError(null);
    try {
      const data = await apiFetch("/user/track-requests", { token });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError("Failed to load requests");
      notifyError("Load failed");
    }
    setRefreshing(false);
  }, [token, user]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, action) => {
    setLoadingAct(id + action);
    try {
      await apiFetch(`/user/track-request/${id}`, {
        token,
        method: "PUT",
        body: { action },
      });
      notifySuccess(action === "approve" ? "Approved" : "Rejected");
      await load();
    } catch (e) {
      notifyError("Action failed");
    } finally {
      setLoadingAct(null);
    }
  };

  if (user?.role !== "user") {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Not authorized.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const pending = item.status === "pending";
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.gName}>
            {item.guardian?.name || "Guardian"}{" "}
            <Text style={styles.gEmail}>({item.guardian?.email})</Text>
          </Text>
          <View
            style={[
              styles.statusChip,
              item.status === "approved"
                ? styles.stApproved
                : item.status === "rejected"
                ? styles.stRejected
                : styles.stPending,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.meta}>
          Requested: {new Date(item.created_at).toLocaleString()}
        </Text>
        {pending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              disabled={!!loadingAct}
              style={[styles.actionBtn, { backgroundColor: "#2e7d32" }]}
              onPress={() => act(item.id, "approve")}
            >
              {loadingAct === item.id + "approve" ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionTxt}>Approve</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!!loadingAct}
              style={[styles.actionBtn, { backgroundColor: "#c62828" }]}
              onPress={() => act(item.id, "reject")}
            >
              {loadingAct === item.id + "reject" ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionTxt}>Reject</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Access Requests</Text>
      <Text style={styles.sub}>
        Guardians who want to view your shared location will appear here.
        Approve only those you trust.
      </Text>
      {loadError && <Text style={styles.err}>{loadError}</Text>}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        ListEmptyComponent={
          !refreshing && (
            <Text style={styles.empty}>No requests at the moment.</Text>
          )
        }
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
  title: { fontSize: 22, fontWeight: "800", color: "#222" },
  sub: {
    fontSize: 12,
    color: "#555",
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6DBD2",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gName: { fontWeight: "700", color: "#222", flexShrink: 1 },
  gEmail: { color: "#666", fontSize: 12, fontWeight: "400" },
  meta: { color: "#666", fontSize: 11, marginTop: 6 },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 11 },
  stPending: { backgroundColor: "#f39c12" },
  stApproved: { backgroundColor: "#2e7d32" },
  stRejected: { backgroundColor: "#c62828" },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionTxt: { color: "#fff", fontWeight: "700", fontSize: 12 },
  empty: { textAlign: "center", color: "#666", marginTop: 40 },
  err: { color: "#c62828", fontSize: 12, marginBottom: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
});
