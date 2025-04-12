import React, { useEffect, useState } from "react";
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

export default function EmergencyMapScreen() {
  const [location, setLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [view, setView] = useState("map");
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const url = `https://api.geoapify.com/v2/places?categories=${type}&filter=circle:${location.longitude},${location.latitude},5000&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.features) {
        setPlaces(data.features);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch places.");
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

  const renderPlaceList = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#3498db" />;
    }
    if (places.length === 0) {
      return <Text>No places found.</Text>;
    }
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
              <Callout
                onPress={() =>
                  openInGoogleMaps(
                    place.geometry.coordinates[1],
                    place.geometry.coordinates[0],
                    place.properties.name
                  )
                }
              >
                <View style={{ width: 150 }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {place.properties.name}
                  </Text>
                  <Text>{place.properties.address_line1}</Text>
                  <Text style={{ color: "#3498db", marginTop: 4 }}>
                    Tap to open in Maps
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {view === "list" && renderPlaceList()}

      {view === "bookmark" && (
        <BookmarkList bookmarks={bookmarks} toggleBookmark={toggleBookmark} />
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
});
