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
  const [posts, setPosts] = useState([]);

  const submit = () => {
    if (!text.trim()) return;
    setPosts((prev) => [
      {
        id: Date.now().toString(),
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
        ListEmptyComponent={
          <Text style={styles.empty}>
            No posts yet. Start the conversation.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postBody}>{item.body}</Text>
            <Text style={styles.postMeta}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 18 },
  header: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  info: { color: "#bbb", fontSize: 12, lineHeight: 17, marginBottom: 16 },
  box: {
    backgroundColor: "#1c1c1c",
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  input: { color: "#fff", minHeight: 70, fontSize: 14 },
  postBtn: {
    backgroundColor: "#ff512f",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  postText: { color: "#fff", fontWeight: "600" },
  postCard: {
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  postBody: { color: "#eee", fontSize: 14, lineHeight: 20 },
  postMeta: { color: "#666", fontSize: 11, marginTop: 8, textAlign: "right" },
  empty: { color: "#555", textAlign: "center", marginTop: 30 },
});
