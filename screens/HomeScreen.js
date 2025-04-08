import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { ContactsContext } from "../ContactsContext";

const HomeScreen = ({ route }) => {
  const email = route?.params?.email || "user@gmail.com";
  const username = email.split("@")[0];

  const [location, setLocation] = useState(null);
  const { contacts } = useContext(ContactsContext); // 💡 Get dynamic contacts

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  const handleSendSOS = () => {
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

    contacts.forEach((contact) => {
      const url = `whatsapp://send?phone=${
        contact.phone
      }&text=${encodeURIComponent(message)}`;

      Linking.openURL(url).catch(() => {
        alert("Make sure WhatsApp is installed");
      });
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome, {username}</Text>

      <View style={styles.dashboard}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email}</Text>

        <Text style={styles.label}>Blood Group:</Text>
        <Text style={styles.value}>B+</Text>

        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>+91-9876543210</Text>

        <Text style={styles.label}>DOB:</Text>
        <Text style={styles.value}>12/05/2000</Text>
      </View>

      <TouchableOpacity style={styles.sosButton} onPress={handleSendSOS}>
        <Ionicons name="alert-circle-outline" size={28} color="#fff" />
        <Text style={styles.sosText}>Send SOS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF6F0",
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dashboard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  sosButton: {
    backgroundColor: "#FF5A5F",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 50,
  },
  sosText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default HomeScreen;
