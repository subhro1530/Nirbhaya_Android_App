import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, API_BASE } from "../contexts/AuthContext";
import { notifySuccess, notifyError } from "../utils/notify";

const STORAGE_KEY = "@user_profile";

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const { setAuthState } = useAuth();

  const handleSignup = async () => {
    try {
      await fetch(`${API_BASE}/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      // auto sign-in
      const res = await fetch(`${API_BASE}/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        await setAuthState(data.accessToken, data.user);
        notifySuccess("Account created");
      } else {
        notifyError("Signup failed");
      }
    } catch {}
    navigation.replace("Home", { email });
  };

  return (
    <ScrollView contentContainerStyle={styles.outer}>
      <View style={styles.authCard}>
        <Image source={require("../assets/icon.png")} style={styles.logo} />
        <Text style={styles.mainTitle}>Create Account</Text>
        <Text style={styles.subtitle}>
          Choose your role & join the safety network.
        </Text>

        <InputField
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <InputField
          placeholder="Date of Birth (DD/MM/YYYY)"
          value={dob}
          onChangeText={setDob}
        />
        <InputField placeholder="Email" value={email} onChangeText={setEmail} />
        <InputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <InputField
          placeholder="Blood Group (e.g. B+)"
          value={bloodGroup}
          onChangeText={setBloodGroup}
        />
        <InputField
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {["user", "guardian", "ngo", "admin"].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 14,
                marginHorizontal: 4,
                backgroundColor: role === r ? "#FF5A5F" : "#ffe1e3",
              }}
            >
              <Text
                style={{
                  color: role === r ? "#fff" : "#333",
                  fontSize: 12,
                }}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton title="Sign Up" onPress={handleSignup} />
      </View>
      <Text onPress={() => navigation.navigate("Login")} style={styles.link}>
        Already have an account? Log in
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF6F0",
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  logo: {
    height: 100,
    width: 100,
    alignSelf: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    color: "#FF5A5F",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
  outer: {
    backgroundColor: "#FFF6F0",
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  authCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
    color: "#222",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
});

export default SignupScreen;
