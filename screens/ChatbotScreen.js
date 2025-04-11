import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput("");
    setLoading(true);

    // Show only the user input in the chat UI
    const updatedMessages = [...messages, { role: "user", content: userInput }];
    setMessages(updatedMessages);

    try {
      const fullPrompt = `You are a compassionate and powerful AI built to help women in distress. Respond with kindness, actionable steps, and support links when possible. Be concise and respectful. User says: ${userInput}`;

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: fullPrompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botReply =
        response.data.choices?.[0]?.message?.content ||
        "Sorry, I didn't understand that.";

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: botReply },
      ]);
    } catch (error) {
      console.error("Groq API error:", error.response?.data || error.message);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ec407a" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatbotScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff0f5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 14,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#f8bbd0",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
  },
  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderColor: "#f48fb1",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: "#333",
  },
  iconButton: {
    backgroundColor: "#ec407a",
    borderRadius: 8,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    marginBottom: 5,
  },
  loadingText: {
    marginLeft: 8,
    color: "#ec407a",
    fontStyle: "italic",
  },
});
