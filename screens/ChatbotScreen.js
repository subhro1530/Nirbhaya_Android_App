import React, { useState, useRef } from "react";
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
  ScrollView,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const suggestions = [
  "I feel unsafe walking home.",
  "How can I report abuse anonymously?",
  "What are my legal rights at work?",
];

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);

    const updatedMessages = [...messages, { role: "user", content: userText }];
    setMessages(updatedMessages);
    flatListRef.current?.scrollToEnd({ animated: true });

    const userPrompt = `You are a compassionate and powerful AI built to help women in distress. Respond with kindness, actionable steps, and support links when possible. Be concise and respectful. User says: ${userText}`;

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: userPrompt }],
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
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Groq API error:", error.response?.data || error.message);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again later.",
        },
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
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
        {messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text style={styles.welcome}>How can I help you today?</Text>
            {suggestions.map((text, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => setInput(text)}
              >
                <Text style={styles.suggestionText}>{text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
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
        )}

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
  welcome: {
    fontSize: 18,
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  suggestionButton: {
    backgroundColor: "#f8bbd0",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    alignSelf: "stretch",
  },
  suggestionText: {
    color: "#333",
    fontSize: 15,
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
