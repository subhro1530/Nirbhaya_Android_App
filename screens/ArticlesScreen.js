import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Linking,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NEWSDATA_API_KEY } from "@env";

const ArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=women%20safety&country=in&language=en`
      );
      const data = await response.json();
      setArticles(data.results || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL(item.link)}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      ) : (
        <Image
          source={require("../assets/article-placeholder.png")} // Optional: Add a local placeholder image
          style={styles.image}
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={3} style={styles.description}>
          {item.description || "No description"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Latest Articles on Women Safety</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF5A5F" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    padding: 16,
    paddingTop: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  textContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    color: "#444",
  },
});

export default ArticlesScreen;
