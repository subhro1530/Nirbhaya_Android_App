import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BookmarkList = ({ bookmarks, toggleBookmark }) => {
  if (!bookmarks.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bookmarks yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarks}
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
            <MaterialCommunityIcons name="bookmark" size={24} color="#e67e22" />
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  listItem: {
    backgroundColor: "#fcefe6",
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
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default BookmarkList;
