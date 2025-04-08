import React from "react";
import { TextInput, StyleSheet } from "react-native";

const InputField = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
}) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
  />
);

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginVertical: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default InputField;
