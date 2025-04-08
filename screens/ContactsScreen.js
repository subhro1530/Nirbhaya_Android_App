import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ContactsContext } from "../ContactsContext";

const ContactsScreen = () => {
  const { contacts, setContacts } = useContext(ContactsContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <Text>{item.name}</Text>
            <Text>{item.phone}</Text>
            <TouchableOpacity onPress={() => deleteContact(item.id)}>
              <Text style={{ color: "red" }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF6F0" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, paddingTop: 30 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#FF5A5F",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  addText: { color: "#fff", textAlign: "center" },
  contactCard: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
});

export default ContactsScreen;
