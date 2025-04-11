import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContactsContext } from "../ContactsContext";
import { Feather } from "@expo/vector-icons";

const STORAGE_KEY = "@trusted_contacts";

const ContactsScreen = () => {
  const { contacts, setContacts } = useContext(ContactsContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setContacts(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load contacts", e);
      }
    };
    loadContacts();
  }, []);

  useEffect(() => {
    const saveContacts = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
      } catch (e) {
        console.error("Failed to save contacts", e);
      }
    };
    saveContacts();
  }, [contacts]);

  const addContact = () => {
    if (name && phone) {
      setContacts([...contacts, { id: Date.now().toString(), name, phone }]);
      setName("");
      setPhone("");
    }
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trusted Contacts</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity style={styles.addBtn} onPress={addContact}>
        <Text style={styles.addText}>Add Contact</Text>
      </TouchableOpacity>

      {contacts.length === 0 ? (
        <Text style={styles.noContacts}>No contact added...</Text>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              <View>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteContact(item.id)}>
                <Feather name="trash-2" size={22} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF6F0" },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 15,
    paddingTop: 30,
    fontFamily: "System",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#FF5A5F",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  addText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  noContacts: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  contactCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  contactName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  contactPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});

export default ContactsScreen;
