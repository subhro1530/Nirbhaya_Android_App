import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";

export default function SelfDefenseWorkshopsScreen() {
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: "1",
      title: "Urban Escape Basics",
      likes: 12,
      comments: 4,
    },
    {
      id: "2",
      title: "Wrist Grab Defense",
      likes: 8,
      comments: 2,
    },
  ]);

  const workshops = [
    {
      id: "1",
      title: "Urban Escape Basics",
      desc: "Sat 6 PM • Beginner friendly • 90 mins",
      image: require("../assets/poster1.png"),
    },
    {
      id: "2",
      title: "Wrist Grab Defense",
      desc: "Sun 11 AM • Hands-on • 60 mins",
      image: require("../assets/poster2.png"),
    },
  ];

  const subscribe = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      Alert.alert("Invalid", "Enter a valid email.");
      return;
    }
    Alert.alert(
      "Subscribed",
      `You will receive updates for ${selectedWorkshop}.`
    );
    setEmail("");
    setModalVisible(false);
  };

  const openSubscriptionModal = (workshop) => {
    setSelectedWorkshop(workshop);
    setModalVisible(true);
  };

  const likePost = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Self-Defense Workshops</Text>
      <Text style={styles.desc}>
        Learn practical skills to build confidence and awareness. Explore
        upcoming sessions and subscribe for updates.
      </Text>

      {workshops.map((workshop) => (
        <View key={workshop.id} style={styles.card}>
          <Image
            source={workshop.image}
            style={styles.poster}
            resizeMode="cover"
          />
          <Text style={styles.cardTitle}>{workshop.title}</Text>
          <Text style={styles.cardMeta}>{workshop.desc}</Text>
          <TouchableOpacity
            style={styles.cardBtn}
            onPress={() => openSubscriptionModal(workshop.title)}
          >
            <Text style={styles.cardBtnText}>Subscribe for Updates</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.subHeader}>Recent Posts</Text>
      {posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <View style={styles.postActions}>
            <TouchableOpacity onPress={() => likePost(post.id)}>
              <Text style={styles.postAction}>👍 {post.likes}</Text>
            </TouchableOpacity>
            <Text style={styles.postAction}>💬 {post.comments}</Text>
          </View>
        </View>
      ))}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Subscribe to {selectedWorkshop}
            </Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#666"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={subscribe}>
              <Text style={styles.modalBtnText}>Subscribe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#FFF6F0",
    flexGrow: 1,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 8,
    textAlign: "center",
  },
  desc: {
    color: "#555",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6DBD2",
    marginBottom: 16,
    overflow: "hidden",
  },
  poster: { width: "100%", height: 280, backgroundColor: "#fff" },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  cardMeta: {
    fontSize: 12,
    color: "#666",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
  },
  cardBtn: {
    backgroundColor: "#11998e",
    marginHorizontal: 12,
    marginBottom: 14,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  cardBtnText: { color: "#fff", fontWeight: "700" },
  subHeader: {
    color: "#222",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  postTitle: { fontSize: 14, fontWeight: "700", color: "#222" },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  postAction: { fontSize: 12, color: "#555" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 12,
  },
  modalBtn: {
    backgroundColor: "#11998e",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  modalBtnText: { color: "#fff", fontWeight: "700" },
});
