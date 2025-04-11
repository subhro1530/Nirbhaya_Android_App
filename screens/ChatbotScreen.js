import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";

const BASE_PROMPT = `
You are a compassionate and powerful AI built to help women in distress, guide them with resources, legal information, and mental support.
Respond with kindness, actionable steps, and support links when possible. Be concise and respectful.
`;

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [fullPrompt, setFullPrompt] = useState(BASE_PROMPT);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setFullPrompt((prev) => prev + "\nUser: " + input);

    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mixtral-8x7b",
          messages: [
            { role: "system", content: fullPrompt },
            { role: "user", content: input },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${Constants.expoConfig.extra.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse = res.data.choices[0].message.content;
      const botMessage = { role: "bot", content: aiResponse };

      setMessages([...updatedMessages, botMessage]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          role: "bot",
          content: "Something went wrong. Please try again later.",
        },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
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
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatbotScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f5",
    paddingHorizontal: 10,
  },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#f06292",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  messageText: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: "#f06292",
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
