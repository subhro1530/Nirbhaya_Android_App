// navigation/index.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import ArticlesScreen from "../screens/ArticlesScreen";
import TrustedContactsScreen from "../screens/ContactsScreen";
import ContentScreen from "../screens/ContentScreen";
import MoreScreen from "../screens/MoreScreen";
import ContextScreen from "../screens/ContextScreen"; // will be opened from More
import EmergencyMapScreen from "../screens/EmergencyMapScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// More Stack
const MoreStack = createNativeStackNavigator();

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: true }}>
      <MoreStack.Screen name="More Home" component={MoreScreen} />
      <MoreStack.Screen name="Context" component={ContextScreen} />
      {/* You can add more screens here later */}
    </MoreStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF6F0",
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: "#FF5A5F",
        tabBarLabelStyle: { paddingBottom: 5 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Articles"
        component={ArticlesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Trusted"
        component={TrustedContactsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Content"
        component={ContentScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-open" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="More"
        component={MoreStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="EmergencyMap" component={EmergencyMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
