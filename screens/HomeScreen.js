import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { Linking } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { ContactsContext } from "../ContactsContext";
import Toast from "react-native-root-toast";

const STORAGE_KEY = "@user_profile";

const HomeScreen = ({ route }) => {
  const defaultEmail = route?.params?.email || "user@gmail.com";

  const { contacts } = useContext(ContactsContext);
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

  useEffect(() => {
    let lastX = 0,
      lastY = 0,
      lastZ = 0;
    let shakeCount = 0;

    const subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > 2.5) {
        shakeCount++;

        if (shakeCount >= 2) {
          handleSendSOS();
          shakeCount = 0;
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    });

    Accelerometer.setUpdateInterval(300);

    return () => {
      subscription && subscription.remove();
    };
  }, [location, contacts]);

  useEffect(() => {
    loadProfile();
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
      Toast.show("Changes saved!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
      });
    } catch (e) {
      console.error("Error saving profile", e);
    }
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ paddingTop: 10 }} /> {/* Added top padding */}
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
          Welcome, {profile.name ? profile.name : "User"}
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

      <TouchableOpacity style={styles.sosButton} onPress={handleSendSOS}>
        <Ionicons name="alert-circle-outline" size={28} color="#fff" />
        <Text style={styles.sosText}>Send SOS</Text>
      </TouchableOpacity>
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
    paddingTop: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 10,
  },
  editIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 8,
  },
  dashboard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    color: "#555",
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
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  sosButton: {
    backgroundColor: "#FF5A5F",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 50,
    marginBottom: 30,
  },
  sosText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default HomeScreen;
