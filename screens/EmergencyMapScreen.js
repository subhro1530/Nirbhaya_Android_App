import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GEOAPIFY_API_KEY } from "@env";

import BookmarkList from "../components/BookmarkList"; // ✅

const { height } = Dimensions.get("window");

const categories = [
  { name: "Hospitals", filter: "healthcare.hospital", icon: "hospital-box" },
  { name: "Police Stations", filter: "amenity.police", icon: "police-badge" },
  {
    name: "Fire Stations",
    filter: "emergency.fire_station",
    icon: "fire-truck",
  },
  { name: "Restrooms", filter: "amenity.toilets", icon: "toilet" },
];

const FETCH_TIMEOUT_MS = 9000;

export default function EmergencyMapScreen() {
  const [location, setLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [view, setView] = useState("map");
  const [bookmarks, setBookmarks] = useState([]);
  const [infoVisible, setInfoVisible] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    if (selectedCategory && location) {
      fetchNearbyPlaces(selectedCategory.filter);
    }
  }, [selectedCategory, location]);

  const fetchNearbyPlaces = async (type) => {
    if (!location) return;
    setLoading(true);
    setErrorMsg("");
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = `https://api.geoapify.com/v2/places?categories=${type}&filter=circle:${location.longitude},${location.latitude},5000&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
    const timeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error("timeout")), FETCH_TIMEOUT_MS)
    );

    try {
      const res = await Promise.race([
        fetch(url, { signal: controller.signal }),
        timeout,
      ]);
      const data = await res.json();
      if (data?.features) setPlaces(data.features);
      else setPlaces([]);
    } catch (e) {
      setErrorMsg(
        e.message === "timeout"
          ? "Request timed out. Tap retry."
          : "Failed to load places."
      );
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = (lat, lon, label = "") => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${label}`;
    Linking.openURL(url).catch((err) =>
      Alert.alert("Error", "Couldn't open Google Maps.")
    );
  };

  const toggleBookmark = async (place) => {
    const exists = bookmarks.some(
      (b) => b.properties.place_id === place.properties.place_id
    );

    const updatedBookmarks = exists
      ? bookmarks.filter(
          (b) => b.properties.place_id !== place.properties.place_id
        )
      : [...bookmarks, place];

    setBookmarks(updatedBookmarks);

    try {
      await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    } catch (error) {
      Alert.alert("Error", "Failed to save bookmarks.");
    }
  };

  const loadBookmarks = async () => {
    try {
      const storedBookmarks = await AsyncStorage.getItem("bookmarks");
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load bookmarks.");
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryBtn,
        selectedCategory?.name === item.name && styles.activeCategoryBtn,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <MaterialCommunityIcons name={item.icon} size={20} color="#fff" />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPlaceDetails = (place) => {
    const { name, address_line1, address_line2, phone, website } =
      place.properties;

    return (
      <View style={{ width: 200 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 4 }}>{name}</Text>
        <Text>{address_line1 || "Address not available"}</Text>
        {address_line2 && <Text>{address_line2}</Text>}
        {phone && <Text>📞 {phone}</Text>}
        {website && (
          <Text
            style={{ color: "blue", textDecorationLine: "underline" }}
            onPress={() => Linking.openURL(website)}
          >
            🌐 Visit Website
          </Text>
        )}
        <Text
          style={{ color: "orangered", marginTop: 8 }}
          onPress={() =>
            openInGoogleMaps(
              place.geometry.coordinates[1],
              place.geometry.coordinates[0],
              name
            )
          }
        >
          📍 Get Directions
        </Text>
      </View>
    );
  };

  const renderPlaceList = () => {
    if (loading)
      return (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="orangered" />
          <Text style={styles.loaderText}>
            Scanning nearby safety resources...
          </Text>
        </View>
      );
    if (errorMsg)
      return (
        <View style={styles.loaderBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() =>
              selectedCategory && fetchNearbyPlaces(selectedCategory.filter)
            }
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    if (places.length === 0)
      return <Text style={{ padding: 20 }}>No places found.</Text>;
    return (
      <FlatList
        data={places}
        keyExtractor={(item) => item.properties.place_id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              openInGoogleMaps(
                item.geometry.coordinates[1],
                item.geometry.coordinates[0],
                item.properties.name
              )
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.placeName}>{item.properties.name}</Text>
              <Text style={styles.placeAddress}>
                {item.properties.address_line1}
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleBookmark(item)}>
              <MaterialCommunityIcons
                name={
                  bookmarks.some(
                    (b) => b.properties.place_id === item.properties.place_id
                  )
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {infoVisible && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Find nearby hospitals, police, fire stations, and restrooms. Tap a
            marker or list item for directions.
          </Text>
          <TouchableOpacity onPress={() => setInfoVisible(false)}>
            <Text style={styles.dismiss}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {view === "map" && location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
        >
          {places.map((place) => (
            <Marker
              key={place.properties.place_id}
              coordinate={{
                latitude: place.geometry.coordinates[1],
                longitude: place.geometry.coordinates[0],
              }}
            >
              <Callout>{renderPlaceDetails(place)}</Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {view === "list" && renderPlaceList()}

      {view === "bookmark" && (
        <BookmarkList bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
      )}

      {loading && view === "map" && (
        <View style={styles.mapLoaderOverlay}>
          <ActivityIndicator size="large" color="orangered" />
          <Text style={styles.loaderText}>Loading nearby places...</Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.name}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />

        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => setView("map")}
            style={[styles.navBtn, view === "map" && styles.activeNavBtn]}
          >
            <MaterialCommunityIcons
              name="map"
              size={24}
              color={view === "map" ? "orangered" : "gray"}
            />
            <Text style={styles.navText}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView("list")}
            style={[styles.navBtn, view === "list" && styles.activeNavBtn]}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={24}
              color="#7f8c8d"
            />
            <Text style={styles.navText}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView("bookmark")}
            style={[styles.navBtn, view === "bookmark" && styles.activeNavBtn]}
          >
            <MaterialCommunityIcons
              name="bookmark-outline"
              size={24}
              color="#7f8c8d"
            />
            <Text style={styles.navText}>Bookmarks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffffee",
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  navBtn: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  activeNavBtn: {
    color: "#000000",
  },
  navText: {
    color: "#7f8c8d",
    fontSize: 12,
    marginTop: 3,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  listItem: {
    backgroundColor: "#f4f6f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  placeName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c3e50",
  },
  placeAddress: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  categoryBtn: {
    backgroundColor: "#7f8c8d",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  activeCategoryBtn: {
    backgroundColor: "orangered",
  },
  categoryText: {
    fontSize: 12,
    color: "#fff",
  },
  infoBanner: {
    backgroundColor: "#fff3e0",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ffe0b2",
  },
  infoText: { fontSize: 12, color: "#5d4037", lineHeight: 16 },
  dismiss: {
    color: "orangered",
    marginTop: 6,
    fontWeight: "600",
    fontSize: 12,
  },
  mapLoaderOverlay: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "#ffffffdd",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loaderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loaderText: { marginTop: 10, color: "#555", fontSize: 13 },
  errorText: { color: "#c62828", textAlign: "center", marginBottom: 12 },
  retryBtn: {
    backgroundColor: "orangered",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});
