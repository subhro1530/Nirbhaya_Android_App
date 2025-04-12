import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function MoreScreen({ navigation }) {
  const options = [
    {
      label: "Context",
      icon: <Ionicons name="chatbubbles-outline" size={26} color="#fff" />,
      screen: "Context",
      gradient: ["#667EEA", "#764BA2"],
    },
    {
      label: "Login",
      icon: <MaterialIcons name="login" size={26} color="#fff" />,
      screen: "Login",
      gradient: ["#FC5C7D", "#6A82FB"],
    },
    {
      label: "Signup",
      icon: <FontAwesome5 name="user-plus" size={22} color="#fff" />,
      screen: "Signup",
      gradient: ["#43CEA2", "#185A9D"],
    },
    {
      label: "Contacts",
      icon: <Ionicons name="people-outline" size={26} color="#fff" />,
      screen: "Contacts",
      gradient: ["#FF9966", "#FF5E62"],
    },
    {
      label: "Home",
      icon: <Ionicons name="home-outline" size={26} color="#fff" />,
      screen: "Home",
      gradient: ["#56CCF2", "#2F80ED"],
    },
    {
      label: "Articles",
      icon: <MaterialIcons name="article" size={26} color="#fff" />,
      screen: "Articles",
      gradient: ["#F7971E", "#FFD200"],
    },
    {
      label: "Emergency Map",
      icon: <MaterialIcons name="article" size={26} color="#fff" />,
      screen: "EmergencyMap",
      gradient: ["#F7971E", "#FFD200"],
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore More</Text>
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
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAF9F6",
    paddingVertical: 30,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 25,
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
