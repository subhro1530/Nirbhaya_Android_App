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
import { notifyError, notifySuccess, notifyInfo } from "../utils/notify";
import { Feather } from "@expo/vector-icons";

export default function AccessListScreen() {
  const { token, user } = useAuth();

  const [approvedIds, setApprovedIds] = useState([]); // raw approved ids
  const [requests, setRequests] = useState([]); // /guardian/requests
  const [trackedUsers, setTrackedUsers] = useState([]); // [{id,name,email}]
  const [locationMap, setLocationMap] = useState({}); // id -> { link, updated_at } | null | { loading:true }

  const [pendingLocal, setPendingLocal] = useState([]); // locally added (optimistic) pending emails

  const [email, setEmail] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [sendingReq, setSendingReq] = useState(false);

  const [reqError, setReqError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [sosDetails, setSosDetails] = useState({}); // { userId: { loading, data, error, expanded }}

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

      let accessIds = [];
      try {
        const r = await fetch(`${API_BASE}/profile/me/access-to`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const data = await r.json();
          accessIds = data?.canAccess || [];
          setApprovedIds(accessIds);
        } else {
          setLoadError(`Access fetch failed (${r.status})`);
        }
      } catch {
        setLoadError("Access fetch error");
      }

      // Guardian requests
      let reqList = [];
      try {
        const rr = await fetch(`${API_BASE}/guardian/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (rr.ok) {
          const data = await rr.json();
          reqList = Array.isArray(data)
            ? [...data].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              )
            : [];
        }
      } catch {
        /* ignore */
      }
      setRequests(reqList);

      // Build trackedUsers from approved requests + accessIds
      const approvedFromRequests = reqList
        .filter((r) => r.status === "approved" && r.user?.id)
        .map((r) => ({
          id: r.user.id,
          name: r.user.name || "",
          email: r.user.email || "",
        }));

      const byId = {};
      approvedFromRequests.forEach((u) => (byId[u.id] = u));
      // include any accessIds not in request list (id only)
      accessIds.forEach((id) => {
        if (!byId[id]) byId[id] = { id, name: "", email: "" };
      });

      setTrackedUsers(Object.values(byId));

      // prune local pending (approved)
      setPendingLocal((prev) =>
        prev.filter((p) => !accessIds.some((id) => id.includes(p.email)))
      );

      setLoadingStatuses(false);
      if (!silent) setRefreshing(false);
    },
    [token, API_BASE] // removed pendingLocal to prevent infinite re-creation / re-run loop
  );

  useEffect(() => {
    load();
  }, [load]);

  // STATUS MAP (for chips)
  const statusMap = useMemo(() => {
    const m = {};
    requests.forEach((r) => {
      if (r?.user?.id) m[r.user.id] = r.status;
    });
    return m;
  }, [requests]);

  const serverPending = requests.filter(
    (r) => r.status !== "approved" && !approvedIds.includes(r.user?.id)
  );

  // Delete access request
  const deleteAccess = async (userId) => {
    const req = requests.find(
      (r) => r.user?.id === userId && r.status === "approved"
    );
    if (!req) {
      notifyError("Delete not available");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/guardian/track-request/${req.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        notifySuccess("Access removed");
        setTrackedUsers((prev) => prev.filter((u) => u.id !== userId));
        setRequests((prev) => prev.filter((r) => r.id !== req.id));
        setLocationMap((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
      } else {
        notifyError(`Failed (${res.status})`);
      }
    } catch {
      notifyError("Delete failed");
    }
  };

  // Fetch latest location on demand
  const fetchLocation = async (uid) => {
    setLocationMap((p) => ({ ...p, [uid]: { loading: true } }));
    let stored = null;
    try {
      const r = await fetch(`${API_BASE}/guardian/user-location/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        const j = await r.json();
        if (j?.link) {
          stored = {
            link: j.link,
            updated_at: j.recorded_at || j.updated_at || new Date().toISOString(),
          };
        } else if (j?.lat && j?.lng) {
          // build link if only coords present
          const link = j.link || `https://maps.google.com/?q=${j.lat},${j.lng}`;
          stored = {
            link,
            updated_at: j.recorded_at || new Date().toISOString(),
          };
        }
      } else if (r.status === 404) {
        stored = null;
      }
    } catch {
      // leave stored null (no location uploaded yet)
    }
    if (stored) notifySuccess("Location fetched");
    setLocationMap((p) => ({ ...p, [uid]: stored }));
  };

  // CARD RENDER
  const renderUser = ({ item }) => {
    const status = statusMap[item.id] || "approved";
    const loc = locationMap[item.id];
    const loadingLoc = loc && loc.loading;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.uid}>{item.name ? item.name : "User"}</Text>
            {!!item.email && <Text style={styles.metaSmall}>{item.email}</Text>}
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <View
              style={[
                styles.statusChip,
                status === "approved"
                  ? styles.chipApproved
                  : status === "rejected"
                  ? styles.chipRejected
                  : styles.chipPending,
              ]}
            >
              <Text style={styles.chipText}>{status}</Text>
            </View>
            {status === "approved" && (
              <TouchableOpacity
                style={styles.delBtn}
                onPress={() => deleteAccess(item.id)}
              >
                <Feather name="trash-2" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loc && !loc.loading && loc?.link && (
          <>
            <Text style={styles.meta}>
              Updated: {new Date(loc.updated_at).toLocaleTimeString()}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(loc.link);
                notifyInfo("Opening location");
              }}
            >
              <Text style={styles.link}>Open Location</Text>
            </TouchableOpacity>
          </>
        )}
        {!loc && <Text style={styles.meta}>No location fetched yet.</Text>}
        {loc && loc.loading && <Text style={styles.meta}>Fetching location...</Text>}
        {loc === null && <Text style={styles.meta}>No location uploaded yet.</Text>}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: "#546e7a" }]}
            onPress={() => fetchLocation(item.id)}
          >
            <Text style={styles.smallBtnText}>
              {loadingLoc ? "..." : "Fetch Location"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: "#FF5A5F" }]}
            onPress={() => toggleSOS(item.id)}
          >
            <Text style={styles.smallBtnText}>
              {sosDetails[item.id]?.expanded ? "Hide SOS" : "Last SOS"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SOS block reused */}
        {sosDetails[item.id]?.expanded && (
          <View style={styles.sosBox}>
            {sosDetails[item.id]?.loading && (
              <Text style={styles.sosLine}>Fetching SOS...</Text>
            )}
            {!sosDetails[item.id]?.loading && sosDetails[item.id]?.error && (
              <Text style={[styles.sosLine, { color: "#c62828" }]}>
                {sosDetails[item.id].error}
              </Text>
            )}
            {!sosDetails[item.id]?.loading && sosDetails[item.id]?.data && (
              <>
                <Text style={styles.sosLine}>
                  Note: {sosDetails[item.id].data.note || "(no note)"}
                </Text>
                <Text style={styles.sosLine}>
                  Type: {sosDetails[item.id].data.emergency_type || "-"}
                </Text>
                {sosDetails[item.id].data.location_link && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(sosDetails[item.id].data.location_link)
                    }
                  >
                    <Text style={[styles.link, { marginTop: 4 }]}>
                      Open SOS Location
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // ADJUST counts: approved = trackedUsers.length
  // PENDING = serverPending + pendingLocal

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

      {/* Send new request (unchanged) */}
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
          <Text style={styles.countNum}>{trackedUsers.length}</Text>
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

      {/* Pending lists (reuse existing blocks) */}
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
        data={trackedUsers}
        keyExtractor={(u) => u.id}
        renderItem={renderUser}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load()} />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loadingStatuses
              ? "Loading..."
              : "No approved users yet. Approvals appear after user accepts."}
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
  metaSmall: { color: "#666", fontSize: 11, marginBottom: 4 },
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
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  smallBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  sosBox: {
    marginTop: 8,
    backgroundColor: "#FFF6F0",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F2E2D8",
  },
  sosLine: { fontSize: 11, color: "#444", marginBottom: 2 },
  delBtn: {
    backgroundColor: "#c62828",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
  