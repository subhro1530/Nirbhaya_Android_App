import React, { useState, useEffect } from "react";
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
import { notifyError, notifySuccess } from "../utils/notify";

export default function GuardianRequestsScreen() {
  const { token, user } = useAuth();
  const [email, setEmail] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [outgoing, setOutgoing] = useState([]);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);

  const normEmail = (v) => v.trim().toLowerCase();

  const lookup = async () => {
    const e = normEmail(email);
    if (!e) return;
    setLastError(null);
    try {
      const res = await fetch(
        `${API_BASE}/users/lookup/email/${encodeURIComponent(e)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data);
      } else {
        setLookupResult(null);
        setLastError(`Lookup failed (HTTP ${res.status})`);
        Alert.alert("Not found", "User email not found or not a valid target.");
      }
    } catch (err) {
      setLastError("Lookup network error");
      Alert.alert("Error", "Lookup failed (network).");
    }
  };

  const sendRequest = async () => {
    const e = normEmail(email);
    if (!lookupResult && !e) return;
    setSending(true);
    setLastError(null);
    try {
      const body = lookupResult
        ? { targetUserId: lookupResult.id }
        : { targetEmail: e };
      await apiFetch("/guardian/track-request", {
        token,
        method: "POST",
        body,
      });
      notifySuccess("Request sent");
      Alert.alert("Success", "Tracking request created.");
      await loadOutgoing();
    } catch (err) {
      let msg = "Could not send request.";
      if (err.network) msg = err.message;
      else if (err.status) msg = `${err.status}: ${err.message}`;
      setLastError(msg);
      notifyError(msg);
      Alert.alert("Error", msg);
      // optional quick health probe to help debug
      try {
        setChecking(true);
        const h = await fetch(`${API_BASE}/health`);
        if (!h.ok) setLastError((p) => (p || "") + " | Health check failed");
      } catch {
        setLastError((p) => (p || "") + " | Server unreachable");
      } finally {
        setChecking(false);
      }
    } finally {
      setSending(false);
    }
  };

  const loadOutgoing = async () => {
    if (!token || (user?.role !== "guardian" && user?.role !== "ngo")) return;
    setLoadingOutgoing(true);
    try {
      const res = await fetch(`${API_BASE}/guardian/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // sort newest first
        const sorted = Array.isArray(data)
          ? [...data].sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )
          : [];
        setOutgoing(sorted);
      }
    } catch {
      // silent
    } finally {
      setLoadingOutgoing(false);
    }
  };

  useEffect(() => {
    loadOutgoing();
  }, [token]);

  if (user?.role !== "guardian" && user?.role !== "ngo") {
    return (
      <View style={styles.center}>
        <Text style={styles.warn}>
          Only guardians and NGOs can access this screen.
        </Text>
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
      {lastError && <Text style={styles.errLine}>{lastError}</Text>}

      {/* REFRESH BUTTON (always visible once component mounted) */}
      <TouchableOpacity
        onPress={loadOutgoing}
        style={styles.refreshMini}
        disabled={loadingOutgoing}
      >
        <Text style={styles.refreshMiniText}>
          {loadingOutgoing ? "Refreshing..." : "Refresh List"}
        </Text>
      </TouchableOpacity>

      {outgoing.length > 0 && (
        <View style={styles.outList}>
          <Text style={styles.outTitle}>Your Requests</Text>
          {outgoing.map((r) => (
            <View key={r.id} style={styles.outItem}>
              <Text style={styles.outLine}>
                To: {r.user?.id || "user"} •{" "}
                {new Date(r.created_at).toLocaleTimeString()}
              </Text>
              <Text
                style={[
                  styles.outStatus,
                  r.status === "approved"
                    ? styles.txtApproved
                    : r.status === "rejected"
                    ? styles.txtRejected
                    : styles.txtPending,
                ]}
              >
                {r.status}
              </Text>
            </View>
          ))}
        </View>
      )}
      {/* NOTE: Guardians/NGOs only create requests here.
          User approvals happen in the user requests screen. */}
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
  errLine: {
    marginTop: 10,
    color: "#c62828",
    fontSize: 12,
    fontStyle: "italic",
  },
  refreshMini: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#FFE1E3",
    alignSelf: "flex-start",
    marginTop: 6,
    marginBottom: 10,
  },
  refreshMiniText: { fontSize: 11, fontWeight: "600", color: "#FF5A5F" },
  outList: {
    marginTop: 4,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    gap: 6,
  },
  outTitle: { fontSize: 13, fontWeight: "800", color: "#222", marginBottom: 4 },
  outItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  outLine: { fontSize: 11, color: "#444", flexShrink: 1, marginRight: 8 },
  outStatus: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  txtApproved: { color: "#2e7d32" },
  txtRejected: { color: "#c62828" },
  txtPending: { color: "#f39c12" },
});