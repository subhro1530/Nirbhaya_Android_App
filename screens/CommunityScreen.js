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
      <Text style={styles.title}>🌐 Community Hub</Text>
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
  container: { padding: 22, backgroundColor: "#101010", flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  desc: { color: "#ccc", fontSize: 14, lineHeight: 20, marginBottom: 30 },
  btn: {
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 18,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
