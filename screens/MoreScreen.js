import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";

export default function MoreScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const rows = [
    {
      label: "Emergency Map",
      desc: "Find nearby hospitals, police, fire stations, and restrooms.",
      screen: "EmergencyMap",
    },
    {
      label: "Walk Mode",
      desc: "Send your live location to a trusted contact at intervals.",
      screen: "WalkMode",
    },
    {
      label: "Smart Safety Kit",
      desc: "Quick contacts, Safe Timer, live map, and helper chat.",
      screen: "SmartSafetyKit",
    },
    {
      label: "Community",
      desc: "Join discussions or view workshops.",
      screen: "Community",
    },
    {
      label: "Anonymous Community",
      desc: "Share and support anonymously.",
      screen: "AnonymousCommunity",
    },
    {
      label: "Workshops",
      desc: "Upcoming self-defense sessions and alerts.",
      screen: "SelfDefenseWorkshops",
    },
    {
      label: "Trusted Contacts",
      desc: "Add, view and manage your trusted contacts.",
      screen: "Trusted",
    },
    {
      label: "Articles",
      desc: "Latest news and reads on safety and rights.",
      screen: "Articles",
    },
  ];

  // generate a simple options array (used by the grid)
  const colors = [
    "#FFF6F0",
    "#FFEFE6",
    "#E8F7FF",
    "#F0F7EA",
    "#FFF0F6",
    "#F7F7FF",
  ];

  const icons = ["🗺️", "🚶", "🧰", "👥", "🕵️‍♀️", "🥋", "📞", "📰"];

  const options = rows.map((r, idx) => ({
    ...r,
    gradient: [colors[idx % colors.length], colors[(idx + 1) % colors.length]],
    icon: icons[idx] || "🔹",
  }));

  const baseRows = [...rows]; // preserve
  // inject role-specific minimal set
  if (user?.role === "guardian" || user?.role === "ngo") {
    rows.splice(
      0,
      rows.length,
      {
        label: "Tracked Users",
        desc: "Approved users & locations",
        screen: "AccessList",
      },
      {
        label: "Send Track Request",
        desc: "Request access by email",
        screen: "GuardianRequests",
      },
      ...(user.role === "ngo"
        ? [{ label: "Doctors", desc: "Manage NGO doctors", screen: "Doctors" }]
        : [])
    );
  } else if (user?.role === "user") {
    rows.unshift({
      label: "Track Requests",
      desc: "Approve / reject guardian access",
      screen: "UserTrackRequests", // changed from IncomingTrackRequests
    });
    rows.unshift({
      label: "Auto Location Upload",
      desc: "Upload to server every interval",
      screen: "AutoLocationUpload",
    });
    rows.unshift({
      label: "Who Can See Me",
      desc: "Guardians with access",
      screen: "VisibleTo",
    });
  } else if (user?.role === "admin") {
    rows.splice(
      0,
      rows.length,
      {
        label: "Articles",
        desc: "Review safety & rights content",
        screen: "Articles",
      },
      {
        label: "Emergency Map",
        desc: "Critical facilities",
        screen: "EmergencyMap",
      },
      {
        label: "Smart Safety Kit",
        desc: "Assist users in emergencies",
        screen: "SmartSafetyKit",
      }
    );
  }

  const logout = async () => {
    await signOut();

    try {
      await AsyncStorage.multiRemove([
        "@user_profile",
        "@trusted_contacts",
        "@walkmode_active",
      ]);
    } catch (e) {
      // ignore or show a toast in your app
      console.warn("Error clearing storage", e);
    }

    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.grid}>
        {options.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
            style={[styles.card, { backgroundColor: item.gradient[0] }]}
            activeOpacity={0.85}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>

            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF6F0",
    padding: 18,
    paddingTop: 48,
    flexGrow: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    marginBottom: 12,
    minHeight: 110,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 8,
  },
  icon: { fontSize: 20 },
  label: { color: "#222", fontWeight: "800", marginBottom: 6 },
  cardDesc: { color: "#555", fontSize: 12 },
  logout: {
    marginTop: 20,
    backgroundColor: "#FF5A5F",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "800" },
});
