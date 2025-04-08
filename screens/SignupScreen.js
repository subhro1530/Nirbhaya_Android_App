import React, { useState } from "react";
import { View, StyleSheet, Text, Image, ScrollView } from "react-native";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = () => {
    // TODO: Save this info in a global state or DB for dashboard use
    navigation.replace("Home");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Create a Nirbhaya Account</Text>

      <InputField placeholder="Full Name" value={name} onChangeText={setName} />
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

      <CustomButton title="Sign Up" onPress={handleSignup} />
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
});

export default SignupScreen;
