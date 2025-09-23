import React, { useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@user_profile";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
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
    <View style={styles.container}>
      <Image source={require("../assets/icon.png")} style={styles.logo} />
      <Text style={styles.title}>Login to Nirbhaya</Text>

      <InputField placeholder="Email" value={email} onChangeText={setEmail} />
      <InputField
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <CustomButton title="Login" onPress={handleLogin} />
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
});

export default LoginScreen;
