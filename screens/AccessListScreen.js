import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";

export default function AccessListScreen() {
  const { token, user } = useAuth();
  const [ids, setIds] = useState([]);
  const [locations, setLocations] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState([]); // local pending emails
  const [loadingReq, setLoadingReq] = useState(false);

  const sendRequest = async () => {
    const target = email.trim();
    if (!target) return;
    setLoadingReq(true);
    try {
      await apiFetch("/guardian/track-request", {
        token,
        method: "POST",
        body: { targetEmail: target },
      });
      setPending((p) => [{ email: target, ts: Date.now() }, ...p]);
      setEmail("");
      Alert.alert("Success", "Request sent.");
    } catch {
      Alert.alert("Error", "Failed to send request.");
    } finally {
      setLoadingReq(false);
    }
  };

  const load = useCallback(async () => {
    if (!token || !user) return;
    setRefreshing(true);
    try {
      const data = await apiFetch("/profile/me/access-to", { token });
      const list = data?.canAccess || [];
      setIds(list);
      const locPairs = {};
      for (const uid of list) {
        try {
          const latest = await apiFetch(`/location/latest/${uid}`, { token });
          locPairs[uid] = latest;
        } catch {
          locPairs[uid] = null;
        }
      }
      setLocations(locPairs);
      setPending((p) => p.filter((pr) => !list.includes(pr.email))); // remove approved ones
    } catch {}
    setRefreshing(false);
  }, [token, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (user?.role !== "guardian" && user?.role !== "ngo") {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Not authorized.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracked Users</Text>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="User email to request access"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.reqBtn}
          onPress={sendRequest}
          disabled={loadingReq}
        >
          <Text style={styles.reqBtnText}>
            {loadingReq ? "..." : "Request"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.countsRow}>
        <View style={styles.countCard}>
          <Text style={styles.countNum}>{ids.length}</Text>
          <Text style={styles.countLbl}>Approved</Text>
        </View>
        <View style={styles.countCard}>
          <Text style={styles.countNum}>{pending.length}</Text>
          <Text style={styles.countLbl}>Pending</Text>
        </View>
      </View>
      {pending.length > 0 && (
        <View style={styles.pendingWrap}>
          <Text style={styles.pendingTitle}>Pending Requests</Text>
          {pending.map((p) => (
            <Text key={p.ts} style={styles.pendingItem}>
              • {p.email}
            </Text>
          ))}
        </View>
      )}
      <FlatList
        data={ids}
        keyExtractor={(i) => i}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} />
        }
        renderItem={({ item }) => {
          const info = locations[item];
          return (
            <View style={styles.card}>
              <Text style={styles.uid}>{item}</Text>
              {info?.link ? (
                <>
                  <Text style={styles.meta}>
                    Updated: {new Date(info.updated_at).toLocaleTimeString()}
                  </Text>
                  <TouchableOpacity onPress={() => Linking.openURL(info.link)}>
                    <Text style={styles.link}>Open Location</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.meta}>No recent location.</Text>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No users accessible.</Text>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  uid: { fontWeight: "700", color: "#333", marginBottom: 4 },
  meta: { color: "#555", fontSize: 12, marginBottom: 6 },
  link: { color: "#FF5A5F", fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
  searchBox: { flexDirection: "row", gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    borderWidth: 1,
    borderColor: "#E6DBD2",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    color: "#333",
  },
  reqBtn: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  reqBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  countsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  countCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    alignItems: "center",
  },
  countNum: { fontSize: 18, fontWeight: "800", color: "#FF5A5F" },
  countLbl: { fontSize: 11, color: "#555", marginTop: 2 },
  pendingWrap: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    marginBottom: 12,
  },
  pendingTitle: {
    fontWeight: "700",
    fontSize: 12,
    color: "#222",
    marginBottom: 4,
  },
  pendingItem: { fontSize: 11, color: "#555" },
});
