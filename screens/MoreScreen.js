import React from "react";
import { View, Button } from "react-native";

export default function MoreScreen({ navigation }) {
  return (
    <View>
      <Button
        title="Go to Context Screen"
        onPress={() => navigation.navigate("Context")}
      />
    </View>
  );
}
