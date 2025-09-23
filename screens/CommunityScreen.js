import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function CommunityScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 12 }} />
      <Text style={styles.title}>Community Hub</Text>
      <Text style={styles.desc}>
        Connect, learn, and empower. Join anonymous discussions or explore
        upcoming self-defense workshops.
      </Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#ff512f" }]}
        onPress={() => navigation.navigate("AnonymousCommunity")}
      >
        <Text style={styles.btnText}>Enter Anonymous Community</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#11998e" }]}
        onPress={() => navigation.navigate("SelfDefenseWorkshops")}
      >
        <Text style={styles.btnText}>View Workshops</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#FFF6F0", flexGrow: 1 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    color: "#555",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
    textAlign: "center",
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
