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
import WalkModeScreen from "../screens/WalkModeScreen";
import SmartSafetyKitScreen from "../screens/SmartSafetyKitScreen";
import CommunityScreen from "../screens/CommunityScreen"; // NEW
import AnonymousCommunityScreen from "../screens/AnonymousCommunityScreen"; // NEW
import SelfDefenseWorkshopsScreen from "../screens/SelfDefenseWorkshopsScreen"; // NEW

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

// More Stack
function MoreStackNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerShown: true, // Show the header for the More stack
        headerTitleStyle: { fontWeight: "800", color: "#222" },
        headerStyle: { backgroundColor: "#FFF6F0" },
      }}
    >
      <MoreStack.Screen name="Other Nirbhaya Facilities" component={MoreScreen} />
      <MoreStack.Screen name="Context" component={ContextScreen} />
      {/* NEW */}
      <MoreStack.Screen name="Community" component={CommunityScreen} />
      <MoreStack.Screen
        name="AnonymousCommunity"
        component={AnonymousCommunityScreen}
        options={{ title: "Anonymous Community" }}
      />
      <MoreStack.Screen
        name="SelfDefenseWorkshops"
        component={SelfDefenseWorkshopsScreen}
        options={{ title: "Workshops" }}
      />
    </MoreStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true, // show title bar on tab screens too
        headerTitleStyle: { fontWeight: "800", color: "#222" },
        headerStyle: { backgroundColor: "#FFF6F0" },
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

      {/* Replace Content with Community */}
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle" size={size} color={color} />
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
        screenOptions={{
          headerShown: false, // Tab stack manages headers
        }}
        initialRouteName="Home"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="EmergencyMap" component={EmergencyMapScreen} />
        <Stack.Screen name="WalkMode" component={WalkModeScreen} />
        <Stack.Screen name="SmartSafetyKit" component={SmartSafetyKitScreen} />
        {/* allow direct stack access */}
        <Stack.Screen
          name="AnonymousCommunity"
          component={AnonymousCommunityScreen}
        />
        <Stack.Screen
          name="SelfDefenseWorkshops"
          component={SelfDefenseWorkshopsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
