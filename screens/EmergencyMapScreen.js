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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For local storage
import { GEOAPIFY_API_KEY } from "@env"; // Your API key

const { height } = Dimensions.get("window");

const categories = [
  { name: "Hospitals", filter: "healthcare.hospital", icon: "hospital-box" },
  { name: "Police Stations", filter: "amenity.police", icon: "police-badge" },
  {
    name: "Fire Stations",
    filter: "emergency.fire_station",
    icon: "fire-truck",
  },
  { name: "Restrooms", filter: "amenity.toilets", icon: "toilet" }, // Added restrooms
];

export default function EmergencyMapScreen() {
  const [location, setLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [view, setView] = useState("map");
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false); // For loading state

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

  // Fetch nearby places from API
  const fetchNearbyPlaces = async (type) => {
    setLoading(true); // Show loading spinner
    const url = `https://api.geoapify.com/v2/places?categories=${type}&filter=circle:${location.longitude},${location.latitude},5000&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.features) {
        setPlaces(data.features);
      } else {
        setPlaces([]); // No results, set empty array
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch places.");
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  // Toggle bookmark for a place
  const toggleBookmark = async (place) => {
    const exists = bookmarks.find(
      (b) => b.properties.place_id === place.properties.place_id
    );
    let updatedBookmarks = [...bookmarks];
    if (exists) {
      updatedBookmarks = updatedBookmarks.filter(
        (b) => b.properties.place_id !== place.properties.place_id
      );
    } else {
      updatedBookmarks.push(place);
    }
    setBookmarks(updatedBookmarks);
    await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks)); // Save to local storage
  };

  // Load bookmarks from local storage
  const loadBookmarks = async () => {
    const storedBookmarks = await AsyncStorage.getItem("bookmarks");
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  };

  useEffect(() => {
    loadBookmarks(); // Load bookmarks when component mounts
  }, []);

  // Render category buttons
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

  // Render places list
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
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.placeName}>{item.properties.name}</Text>
              <Text style={styles.placeAddress}>
                {item.properties.address_line1}
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleBookmark(item)}>
              <MaterialCommunityIcons
                name={
                  bookmarks.find(
                    (b) => b.properties.place_id === item.properties.place_id
                  )
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          </View>
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
              title={place.properties.name}
              description={place.properties.address_line1}
            >
              <FontAwesome name="map-marker" size={30} color="#e74c3c" />
            </Marker>
          ))}
        </MapView>
      )}

      {view === "list" && renderPlaceList()}

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
    paddingTop: 35, // Padding for notification panel
    backgroundColor: "#fff", // Changed background to white
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
    color: "#000000", // Changed active button color to blue;
  },
  navText: {
    color: "#7f8c8d", // Changed text color to grayish
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
    color: "#fff",
    fontWeight: "600",
  },
});
