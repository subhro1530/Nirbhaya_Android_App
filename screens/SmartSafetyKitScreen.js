import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import Torch from "react-native-torch";
import { useNavigation } from "@react-navigation/native";

export default function SmartSafetyKitScreen() {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Request location permissions
  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  const toggleFlashlight = async () => {
    try {
      setFlashlightOn((prevState) => !prevState); // Toggle the state

      if (Platform.OS === "android") {
        await Torch.switchState(!flashlightOn);
        Alert.alert(
          "Flashlight",
          flashlightOn ? "Flashlight turned off" : "Flashlight turned on"
        );
      } else {
        Alert.alert("Note", "Flashlight toggle works only on Android for now.");
      }
    } catch (error) {
      console.error("Error toggling flashlight:", error);
      Alert.alert(
        "Error",
        "Unable to toggle the flashlight. Please try again."
      );
    }
  };

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      Alert.alert(
        "📍 Location Fetched",
        `Lat: ${loc.coords.latitude}\nLon: ${loc.coords.longitude}`
      );
    } catch (error) {
      Alert.alert("Error", "Unable to fetch location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToMap = () => {
    if (location) {
      // Navigate to a map screen (if available)
      navigation.navigate("MapScreen", { location });
    } else {
      Alert.alert("Location", "No location data available yet.");
    }
  };

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ Smart Safety Kit</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn} onPress={toggleFlashlight}>
          <MaterialIcons
            name="flashlight-on"
            size={28}
            color={flashlightOn ? "#FFD700" : "#FFFFFF"}
          />
          <Text style={styles.btnText}>
            {flashlightOn ? "Turn Off" : "Turn On"} Flashlight
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={fetchLocation}>
          <Entypo name="location-pin" size={28} color="#FFFFFF" />
          <Text style={styles.btnText}>Get Location</Text>
        </TouchableOpacity>
      </View>

      {/* Video recording section */}
      <TouchableOpacity style={styles.recordBtn}>
        <Text style={styles.recordBtnText}>Start Recording</Text>
      </TouchableOpacity>

      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            📍 Location: {location.latitude}, {location.longitude}
          </Text>
          <TouchableOpacity style={styles.mapBtn} onPress={navigateToMap}>
            <Text style={styles.mapBtnText}>View on Map</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Smart Safety Kit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1C",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Roboto-Bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  btn: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "40%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  btnText: {
    color: "#FFF",
    fontSize: 14,
    marginTop: 5,
    fontFamily: "Roboto-Regular",
  },
  recordBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  recordBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
    textTransform: "uppercase",
  },
  locationContainer: {
    marginTop: 20,
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "Roboto-Regular",
  },
  mapBtn: {
    backgroundColor: "#FF5722",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  mapBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  footer: {
    marginTop: "auto",
    paddingVertical: 10,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    alignItems: "center",
  },
  footerText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
  },
});
