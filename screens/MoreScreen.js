import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MoreScreen({ navigation }) {
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

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "@user_profile",
        "@trusted_contacts",
        "@walkmode_active",
      ]);
    } catch {}
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore More</Text>
      <View style={styles.list}>
        {rows.map((it, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.row}
            onPress={() => navigation.navigate(it.screen)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {idx + 1}. {it.label}
              </Text>
              <Text style={styles.rowDesc}>{it.desc}</Text>
            </View>
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
    backgroundColor: "#FAF9F6",
    paddingVertical: 30,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 12,
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});

return (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.grid}>
      {options.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigation.navigate(item.screen)}
          style={[
            styles.card,
            {
              backgroundColor: item.gradient[0],
            },
          ]}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainer}>{item.icon}</View>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);
