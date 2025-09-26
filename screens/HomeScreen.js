import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { Linking } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { ContactsContext } from "../ContactsContext";
import Toast from "react-native-root-toast";
import { Accelerometer } from "expo-sensors";
import * as SMS from "expo-sms";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { useNavigation } from "@react-navigation/native";
import { notifySuccess, notifyError, notifyInfo } from "../utils/notify";

const STORAGE_KEY = "@user_profile";

const HomeScreen = ({ route }) => {
  const defaultEmail = route?.params?.email || "user@gmail.com";

  const { contacts } = useContext(ContactsContext);
  const { token, user, signOut } = useAuth(); // added signOut
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: defaultEmail,
    bloodGroup: "B+",
    phone: "+91-9876543210",
    dob: "12/05/2000",
    address: "Not set",
    avatar: null,
  });

  // NEW guardian/ngo state
  const [accessStats, setAccessStats] = useState({ canAccess: 0, pending: 0 });
  const [trackEmail, setTrackEmail] = useState("");
  const [pendingLocal, setPendingLocal] = useState([]); // local pending list (emails)
  const [inlineErr, setInlineErr] = useState(null);

  const sosCooldownRef = useRef(0);
  const SHAKE_ENABLED = false; // turn off shake-to-SOS to avoid loops

  useEffect(() => {
    loadProfile();
    getLocation();
  }, []);

  useEffect(() => {
    if (!SHAKE_ENABLED) return; // disabled to prevent loop
    let lastShake = 0;
    const threshold = 2.2; // higher threshold = less sensitive
    const delayBetweenShakes = 15000; // 15s cooldown

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      if (totalForce > threshold) {
        const now = Date.now();
        if (now - lastShake > delayBetweenShakes) {
          lastShake = now;
          handleSendSOS();
        }
      }
    });
    Accelerometer.setUpdateInterval(400);
    return () => subscription && subscription.remove();
  }, [location, contacts]);

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const res = await fetch(
            "https://nirbhayabackend.onrender.com/profile/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setProfile((prev) => ({
              ...prev,
              name: data.name || prev.name,
              email: data.email || prev.email,
              bloodGroup: data.blood_group || prev.bloodGroup,
              dob: data.dob || prev.dob,
              address: data.address || prev.address,
            }));
          }
        } catch {}
      })();
    }
  }, [token]);

  useEffect(() => {
    if ((user?.role === "guardian" || user?.role === "ngo") && token) {
      refreshAccess();
    }
  }, [user, token]);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading profile", e);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (token) {
        try {
          await apiFetch("/profile/me", {
            token,
            method: "PUT",
            body: {
              dob: profile.dob || null,
              address: profile.address || null,
              blood_group: profile.bloodGroup || null,
              emergency_info: "N/A",
            },
          });
        } catch {}
      }
      Toast.show("Changes saved!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } catch (e) {
      console.error("Error saving profile", e);
    }
  };

  const uploadLocationToBackend = async () => {
    if (!token || user?.role !== "user") return;
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const link = `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;
      await apiFetch("/location/upload", {
        token,
        method: "POST",
        body: { link },
      });
      notifySuccess("Location uploaded");
    } catch {
      notifyError("Upload failed");
    }
  };

  const handleSendSOS = async () => {
    // cooldown guard for any accidental loops
    const now = Date.now();
    if (now - sosCooldownRef.current < 15000) return;
    sosCooldownRef.current = now;

    if (!location) {
      alert("Location not available");
      return;
    }

    const { latitude, longitude } = location;
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = `🚨 SOS Alert!\nI need help!\nHere is my location: ${mapsLink}`;

    if (contacts.length === 0) {
      alert("No trusted contacts found. Please add some.");
      return;
    }

    const numbers = contacts.map((c) => c.phone);

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync(numbers, message);
    } else {
      alert("SMS is not available on this device.");
    }

    if (token && user?.role === "user") {
      try {
        await apiFetch("/sos", {
          token,
          method: "POST",
          body: { note: "Mobile SOS", emergency_type: "general" },
        });
      } catch {}
    }
    notifyInfo("SOS sent");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: false,
    });

    if (!result.canceled) {
      setProfile((prev) => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  const handleInputChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleEdit = () => {
    if (editMode) saveProfile();
    setEditMode(!editMode);
  };

  const refreshAccess = async () => {
    try {
      const data = await apiFetch("/profile/me/access-to", { token });
      const list = data?.canAccess || [];
      // Remove from pending if approved
      setPendingLocal((prev) =>
        prev.filter((e) => !list.some((id) => id === e.resolvedId))
      );
      setAccessStats({ canAccess: list.length, pending: pendingLocal.length });
    } catch {}
  };

  const submitTrackRequestInline = async () => {
    const email = trackEmail.trim().toLowerCase();
    if (!email) return;
    setInlineErr(null);
    try {
      await apiFetch("/guardian/track-request", {
        token,
        method: "POST",
        body: { targetEmail: email },
      });
      setPendingLocal((p) => [{ email, ts: Date.now() }, ...p]);
      setTrackEmail("");
      refreshAccess();
      notifySuccess("Request sent");
    } catch (err) {
      const msg = err.network
        ? err.message
        : err.status
        ? `${err.status}: ${err.message}`
        : "Failed to send request";
      setInlineErr(msg);
      notifyError(msg);
    }
  };

  const doLogout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.topRow}>
        <View style={styles.roleChip}>
          <Text style={styles.roleChipText}>
            {(user?.role || "guest").toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity onPress={doLogout} style={styles.logoutMini}>
          <Feather name="log-out" size={18} color="#fff" />
          <Text style={styles.logoutMiniText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile (all roles) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle-outline" size={100} color="#ccc" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.username}>
          {profile.name ? profile.name : "User"}
        </Text>
        <TouchableOpacity style={styles.editIcon} onPress={toggleEdit}>
          <Feather
            name={editMode ? "check" : "edit"}
            size={20}
            color="#FF5A5F"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dashboard}>
        <Field
          label="Name"
          value={profile.name}
          editable={editMode}
          onChange={(val) => handleInputChange("name", val)}
        />
        <Field
          label="Email"
          value={profile.email}
          editable={editMode}
          onChange={(val) => handleInputChange("email", val)}
        />
        <Field
          label="Blood Group"
          value={profile.bloodGroup}
          editable={editMode}
          onChange={(val) => handleInputChange("bloodGroup", val)}
        />
        <Field
          label="Phone"
          value={profile.phone}
          editable={editMode}
          onChange={(val) => handleInputChange("phone", val)}
        />
        <Field
          label="DOB"
          value={profile.dob}
          editable={editMode}
          onChange={(val) => handleInputChange("dob", val)}
        />
        <Field
          label="Address"
          value={profile.address}
          editable={editMode}
          onChange={(val) => handleInputChange("address", val)}
        />
      </View>

      {/* User-only actions */}
      {user?.role === "user" && (
        <>
          <TouchableOpacity style={styles.sosButton} onPress={handleSendSOS}>
            <Ionicons name="alert-circle-outline" size={28} color="#fff" />
            <Text style={styles.sosText}>Send SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sosButton, { backgroundColor: "#2e7d32" }]}
            onPress={uploadLocationToBackend}
          >
            <Ionicons name="navigate" size={24} color="#fff" />
            <Text style={styles.sosText}>Upload Location</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Guardian / NGO tracking panel (unchanged core) */}
      {(user?.role === "guardian" || user?.role === "ngo") && (
        <View style={styles.guardianWrap}>
          <Text style={styles.gTitle}>
            Welcome {profile.name || user?.name || "Guardian"}
          </Text>
          <Text style={styles.gSubtitle}>
            Track approved users, send new access requests, and view latest
            shared locations.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{accessStats.canAccess}</Text>
              <Text style={styles.statLbl}>Approved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{pendingLocal.length}</Text>
              <Text style={styles.statLbl}>Pending</Text>
            </View>
          </View>

          <View style={styles.inlineRequest}>
            <TextInput
              style={styles.reqInput}
              placeholder="Enter user email to request"
              placeholderTextColor="#888"
              value={trackEmail}
              onChangeText={setTrackEmail}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.reqBtn}
              onPress={submitTrackRequestInline}
            >
              <Text style={styles.reqBtnText}>Request</Text>
            </TouchableOpacity>
          </View>
          {inlineErr && <Text style={styles.inlineErr}>{inlineErr}</Text>}

          <TouchableOpacity
            style={styles.primaryWide}
            onPress={() => navigation.navigate("AccessList")}
          >
            <Ionicons name="locate" size={18} color="#fff" />
            <Text style={styles.primaryWideText}>Open Tracking Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryWide, { backgroundColor: "#546e7a" }]}
            onPress={refreshAccess}
          >
            <Feather name="refresh-ccw" size={16} color="#fff" />
            <Text style={styles.primaryWideText}>Refresh Access</Text>
          </TouchableOpacity>

          {pendingLocal.length > 0 && (
            <View style={styles.pendingList}>
              <Text style={styles.pendingTitle}>Pending Requests</Text>
              {pendingLocal.map((p) => (
                <Text key={p.ts} style={styles.pendingItem}>
                  • {p.email}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const Field = ({ label, value, editable, onChange }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}:</Text>
    {editable ? (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={label}
      />
    ) : (
      <Text style={styles.value}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF6F0",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48, // more top margin
  },
  explain: {
    color: "#555",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#FFE1E3",
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  username: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
    color: "#222",
  },
  editIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 8,
  },
  dashboard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "700",
    color: "#666",
  },
  value: {
    fontSize: 16,
    marginTop: 2,
    color: "#333",
  },
  input: {
    fontSize: 16,
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#E6DBD2",
    paddingVertical: 4,
    color: "#333",
  },
  sosButton: {
    backgroundColor: "#FF5A5F",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 50,
    marginBottom: 30,
    shadowColor: "#FF5A5F",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  sosText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    marginLeft: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  roleChip: {
    backgroundColor: "#FF5A5F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleChipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  logoutMini: {
    flexDirection: "row",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  logoutMiniText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  guardianWrap: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  gTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
  },
  gSubtitle: {
    fontSize: 12,
    color: "#555",
    lineHeight: 17,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F2E2D8",
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FF5A5F",
  },
  statLbl: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  inlineRequest: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 8,
  },
  reqInput: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    borderWidth: 1,
    borderColor: "#E6DBD2",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#333",
    height: 48,
  },
  reqBtn: {
    backgroundColor: "#FF5A5F",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  reqBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  primaryWide: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FF5A5F",
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    marginBottom: 12,
  },
  primaryWideText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  pendingList: {
    marginTop: 8,
  },
  pendingTitle: {
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
    fontSize: 13,
  },
  pendingItem: {
    color: "#555",
    fontSize: 12,
    marginBottom: 2,
  },
  inlineErr: { color: "#c62828", fontSize: 11, marginTop: -8, marginBottom: 8 },
});

export default HomeScreen;
