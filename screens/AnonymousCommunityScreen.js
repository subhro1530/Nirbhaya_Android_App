import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";

export default function AnonymousCommunityScreen() {
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([
    {
      id: "1",
      username: "Anonymous1",
      body: "Stay strong, everyone. We're in this together.",
      time: "10:30 AM",
    },
    {
      id: "2",
      username: "Anonymous2",
      body: "Does anyone know about self-defense workshops nearby?",
      time: "11:15 AM",
    },
    {
      id: "3",
      username: "Anonymous3",
      body: "Remember, you're never alone. Reach out if you need help.",
      time: "12:00 PM",
    },
  ]);

  const submit = () => {
    if (!text.trim()) return;
    setPosts((prev) => [
      {
        id: Date.now().toString(),
        username: "Anonymous",
        body: text.trim(),
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
    setText("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🕊️ Anonymous Community</Text>
      <Text style={styles.info}>
        Share experiences, tips, or encouragement anonymously. Avoid sharing
        identifiable details. Local-only.
      </Text>
      <View style={styles.box}>
        <TextInput
          style={styles.input}
          placeholder="Write something supportive..."
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.postBtn} onPress={submit}>
          <Text style={styles.postText}>Post</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postUsername}>{item.username}</Text>
            <Text style={styles.postBody}>{item.body}</Text>
            <Text style={styles.postMeta}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF6F0",
    padding: 18,
    paddingTop: 48,
  },
  header: { color: "#222", fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  info: { color: "#555", fontSize: 12, lineHeight: 17, marginBottom: 16 },
  box: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  input: { color: "#333", minHeight: 70, fontSize: 14 },
  postBtn: {
    backgroundColor: "#11998e",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  postText: { color: "#fff", fontWeight: "600" },
  postCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6DBD2",
  },
  postUsername: { color: "#11998e", fontWeight: "700", marginBottom: 4 },
  postBody: { color: "#333", fontSize: 14, lineHeight: 20 },
  postMeta: { color: "#666", fontSize: 11, marginTop: 8, textAlign: "right" },
});
