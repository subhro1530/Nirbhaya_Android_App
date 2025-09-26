import React, { useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, API_BASE } from "../contexts/AuthContext";
import { notifySuccess, notifyError } from "../utils/notify";

const STORAGE_KEY = "@user_profile";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useAuth();

  const handleLogin = async () => {
    // fallback to existing local flow if backend fails
    try {
      const res = await fetch(`${API_BASE}/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        await setAuthState(data.accessToken, data.user); // stores AsyncStorage
        notifySuccess("Logged in");
      } else {
        notifyError("Login failed");
      }
    } catch (e) {
      // ignore -> continue legacy local profile save
    }
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const profile = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...profile,
          email: email || profile.email || "user@gmail.com",
        })
      );
    } catch {}
    navigation.replace("Home", { email });
  };

  return (
    <View style={styles.outer}>
      <Text style={styles.brand}>Nirbhaya</Text>
      <View style={styles.authCard}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue your safety journey.
        </Text>

        <InputField placeholder="Email" value={email} onChangeText={setEmail} />
        <InputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text
          style={{
            fontSize: 10,
            color: "#999",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Use admin email to access admin role after login.
        </Text>

        <CustomButton title="Login" onPress={handleLogin} />
      </View>
      <Text onPress={() => navigation.navigate("Signup")} style={styles.link}>
        Don't have an account? Sign up
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    height: 100,
    width: 100,
    alignSelf: "center",
    marginBottom: 30,
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
  },
  outer: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  brand: {
    position: "absolute",
    top: 60,
    left: 20,
    fontSize: 28,
    fontWeight: "800",
    color: "#FF5A5F",
    letterSpacing: 1,
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
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: -6,
    marginBottom: 14,
    textAlign: "center",
  },
});

export default LoginScreen;
