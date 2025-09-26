import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  RefreshControl,
  TextInput,
} from "react-native";
import { useAuth, API_BASE } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { notifyError, notifySuccess } from "../utils/notify";

export default function AccessListScreen() {
  const { token, user } = useAuth();

  const [ids, setIds] = useState([]); // approved user IDs
  const [locations, setLocations] = useState({}); // id -> latest location object
  const [requests, setRequests] = useState([]); // outgoing guardian requests
  const [pendingLocal, setPendingLocal] = useState([]); // locally added (optimistic) pending emails

  const [email, setEmail] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [sendingReq, setSendingReq] = useState(false);

  const [reqError, setReqError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const canUse = user?.role === "guardian" || user?.role === "ngo";
  if (!canUse) {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>Not authorized.</Text>
      </View>
    );
  }

  // Send a new track request
  const sendRequest = async () => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;
    setSendingReq(true);
    setReqError(null);
    try {
      await apiFetch("/guardian/track-request", {
        token,
        method: "POST",
        body: { targetEmail },
      });
      // optimistic local pending
      setPendingLocal((p) => [{ email: targetEmail, ts: Date.now() }, ...p]);
      setEmail("");
      notifySuccess("Request sent");
      // reload statuses to reflect server state
      load(true);
    } catch (err) {
      const msg = err.network
        ? err.message
        : err.status
        ? `${err.status}: ${err.message}`
        : "Failed to send request.";
      setReqError(msg);
      notifyError(msg);
    } finally {
      setSendingReq(false);
    }
  };

  // Load data (approved ids, requests, locations)
  const load = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) {
        setRefreshing(true);
        setLoadError(null);
      }
      setLoadingStatuses(true);

      let approvedIds = [];
      // Approved IDs
      try {
        const res = await fetch(`${API_BASE}/profile/me/access-to`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          approvedIds = data?.canAccess || [];
          setIds(approvedIds);
        } else {
          setLoadError(`Access fetch failed (${res.status})`);
        }
      } catch {
        setLoadError("Access fetch error");
      }

      // Outgoing requests (statuses)
      try {
        const res = await fetch(`${API_BASE}/guardian/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const sorted = Array.isArray(data)
            ? [...data].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              )
            : [];
          setRequests(sorted);
        } else {
          setRequests([]);
        }
      } catch {
        setRequests([]);
      }

      // Latest locations for approved IDs (404 => none yet)
      const locMap = {};
      for (const id of approvedIds) {
        try {
          const r = await fetch(`${API_BASE}/location/latest/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) locMap[id] = await r.json();
          else locMap[id] = null;
        } catch {
          locMap[id] = null;
        }
      }
      setLocations(locMap);

      // Remove local pending if now resolved (approved)
      setPendingLocal((prev) =>
        prev.filter((p) => !approvedIds.some((id) => id.includes(p.email)))
      );

      setLoadingStatuses(false);
      if (!silent) setRefreshing(false);
    },
    [token, API_BASE]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Map approved user id -> request status
  const statusMap = useMemo(() => {
    const m = {};
    requests.forEach((r) => {
      if (r?.user?.id) m[r.user.id] = r.status;
    });
    return m;
  }, [requests]);

  // Server-side pending/rejected not yet approved
  const serverPending = requests.filter(
    (r) => r.status !== "approved" && !ids.includes(r?.user?.id)
  );

  // UI helpers
  const renderTracked = ({ item }) => {
    const info = locations[item];
    const st = statusMap[item] || "approved";
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.uid}>{item}</Text>
          <View
            style={[
              styles.statusChip,
              st === "approved"
                ? styles.chipApproved
                : st === "rejected"
                ? styles.chipRejected
                : styles.chipPending,
            ]}
          >
            <Text style={styles.chipText}>{st}</Text>
          </View>
        </View>
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
          <Text style={styles.meta}>
            {loadingStatuses
              ? "Loading location..."
              : "No location uploaded yet."}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracked Users</Text>

      {loadError && <Text style={styles.errLine}>{loadError}</Text>}

      <View style={styles.refreshRow}>
        <TouchableOpacity
          style={styles.refreshBtn}
          disabled={refreshing || loadingStatuses}
          onPress={() => load()}
        >
          <Text style={styles.refreshTxt}>
            {refreshing || loadingStatuses ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

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
          disabled={sendingReq}
        >
          <Text style={styles.reqBtnText}>
            {sendingReq ? "..." : "Request"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.countsRow}>
        <View style={styles.countCard}>
          <Text style={styles.countNum}>{ids.length}</Text>
          <Text style={styles.countLbl}>Approved</Text>
        </View>
        <View style={styles.countCard}>
          <Text style={styles.countNum}>
            {serverPending.length + pendingLocal.length}
          </Text>
          <Text style={styles.countLbl}>Pending</Text>
        </View>
      </View>

      {reqError && <Text style={styles.err}>{reqError}</Text>}

      {serverPending.length > 0 && (
        <View style={styles.pendingWrap}>
          <Text style={styles.pendingTitle}>
            Server Requests (Pending / Rejected)
          </Text>
          {serverPending.map((r) => (
            <Text key={r.id} style={styles.pendingItem}>
              • {r.user?.id || "user"}{" "}
              <Text
                style={[
                  styles.statusTag,
                  r.status === "pending"
                    ? styles.tagPending
                    : r.status === "rejected"
                    ? styles.tagRejected
                    : styles.tagApproved,
                ]}
              >
                {r.status}
              </Text>
            </Text>
          ))}
        </View>
      )}

      {pendingLocal.length > 0 && (
        <View style={styles.pendingWrap}>
          <Text style={styles.pendingTitle}>
            Local Pending (Not yet resolved)
          </Text>
          {pendingLocal.map((p) => (
            <Text key={p.ts} style={styles.pendingItem}>
              • {p.email}{" "}
              <Text style={[styles.statusTag, styles.tagPending]}>pending</Text>
            </Text>
          ))}
        </View>
      )}

      <FlatList
        data={ids}
        keyExtractor={(i) => i}
        renderItem={renderTracked}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load()} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loadingStatuses ? "Loading..." : "No users accessible."}
          </Text>
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
  refreshRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  refreshBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFE1E3",
    borderRadius: 14,
  },
  refreshTxt: { fontSize: 11, fontWeight: "600", color: "#FF5A5F" },
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
    fontSize: 13,
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
  pendingItem: { fontSize: 11, color: "#555", marginBottom: 2 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uid: { fontWeight: "700", color: "#333", marginBottom: 4, maxWidth: "70%" },
  meta: { color: "#555", fontSize: 12, marginBottom: 6 },
  link: { color: "#FF5A5F", fontWeight: "700" },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18 },
  chipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipApproved: { backgroundColor: "#2e7d32" },
  chipRejected: { backgroundColor: "#c62828" },
  chipPending: { backgroundColor: "#f39c12" },
  statusTag: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
    marginLeft: 4,
  },
  tagPending: { backgroundColor: "#f39c12", color: "#fff" },
  tagRejected: { backgroundColor: "#c62828", color: "#fff" },
  tagApproved: { backgroundColor: "#2e7d32", color: "#fff" },
  err: { color: "#c62828", fontSize: 12, marginBottom: 6, fontStyle: "italic" },
  errLine: { color: "#c62828", fontSize: 12, marginBottom: 6 },
  empty: { textAlign: "center", marginTop: 40, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warn: { color: "#c62828", fontWeight: "700" },
});
