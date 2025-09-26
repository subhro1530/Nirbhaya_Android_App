// navigation/index.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

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
import GuardianRequestsScreen from "../screens/GuardianRequestsScreen"; // NEW
import IncomingTrackRequestsScreen from "../screens/IncomingTrackRequestsScreen"; // NEW
import AccessListScreen from "../screens/AccessListScreen"; // NEW
import VisibleToScreen from "../screens/VisibleToScreen"; // NEW
import DoctorsScreen from "../screens/DoctorsScreen"; // NEW
import AutoLocationUploadScreen from "../screens/AutoLocationUploadScreen"; // NEW
import UserTrackRequestsScreen from "../screens/UserTrackRequestsScreen"; // NEW

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
      <MoreStack.Screen
        name="Other Nirbhaya Facilities"
        component={MoreScreen}
      />
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
      <MoreStack.Screen name="EmergencyMap" component={EmergencyMapScreen} />
      <MoreStack.Screen name="WalkMode" component={WalkModeScreen} />
      <MoreStack.Screen
        name="SmartSafetyKit"
        component={SmartSafetyKitScreen}
      />
      <MoreStack.Screen
        name="GuardianRequests"
        component={GuardianRequestsScreen}
      />
      <MoreStack.Screen name="AccessList" component={AccessListScreen} />
      <MoreStack.Screen name="VisibleTo" component={VisibleToScreen} />
      <MoreStack.Screen name="Doctors" component={DoctorsScreen} />
      <MoreStack.Screen
        name="IncomingTrackRequests"
        component={IncomingTrackRequestsScreen}
      />
      <MoreStack.Screen
        name="AutoLocationUpload"
        component={AutoLocationUploadScreen}
      />
      <MoreStack.Screen
        name="UserTrackRequests"
        component={UserTrackRequestsScreen}
        options={{ title: "Track Requests" }}
      />
      {/* NEW */}
    </MoreStack.Navigator>
  );
}

// Role-aware tabs
function RoleTabs() {
  const { user } = useAuth();
  const role = user?.role;

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

      {role === "user" && (
        <>
          <Tab.Screen
            name="Chat"
            component={ChatbotScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="chatbubble-ellipses"
                  size={size}
                  color={color}
                />
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
            name="UserTrackRequests"
            component={UserTrackRequestsScreen}
            options={{
              title: "Requests",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Community"
            component={CommunityScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people-circle" size={size} color={color} />
              ),
            }}
          />
          {/* Removed Articles tab for user */}
        </>
      )}

      {role === "guardian" && (
        <>
          <Tab.Screen
            name="AccessList"
            component={AccessListScreen}
            options={{
              title: "Access",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="locate" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="GuardianRequests"
            component={GuardianRequestsScreen}
            options={{
              title: "Requests",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-add" size={size} color={color} />
              ),
            }}
          />
          {/* Removed Articles tab for guardian */}
        </>
      )}

      {role === "ngo" && (
        <>
          <Tab.Screen
            name="AccessList"
            component={AccessListScreen}
            options={{
              title: "Access",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="locate" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="GuardianRequests"
            component={GuardianRequestsScreen}
            options={{
              title: "Requests",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-add" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Doctors"
            component={DoctorsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="medkit" size={size} color={color} />
              ),
            }}
          />
          {/* Removed Articles tab for NGO */}
        </>
      )}

      {role === "admin" && (
        <>
          {/* Removed Articles tab for admin (Articles accessible via More) */}
        </>
      )}

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

// Main Tabs
function MainTabs() {
  return <RoleTabs />;
}

// Main App Navigator
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login" // was "Home"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={MainTabs} />
        {/* Direct access fallback for deep links or navigation pushes */}
        <Stack.Screen name="EmergencyMap" component={EmergencyMapScreen} />
        <Stack.Screen name="WalkMode" component={WalkModeScreen} />
        <Stack.Screen name="SmartSafetyKit" component={SmartSafetyKitScreen} />
        <Stack.Screen
          name="AnonymousCommunity"
          component={AnonymousCommunityScreen}
        />
        <Stack.Screen
          name="SelfDefenseWorkshops"
          component={SelfDefenseWorkshopsScreen}
        />
        <Stack.Screen
          name="GuardianRequests"
          component={GuardianRequestsScreen}
        />
        <Stack.Screen
          name="IncomingTrackRequests"
          component={IncomingTrackRequestsScreen}
        />
        <Stack.Screen name="AccessList" component={AccessListScreen} />
        <Stack.Screen name="VisibleTo" component={VisibleToScreen} />
        <Stack.Screen name="Doctors" component={DoctorsScreen} />
        <Stack.Screen
          name="AutoLocationUpload"
          component={AutoLocationUploadScreen}
        />
        {/* NEW */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
         