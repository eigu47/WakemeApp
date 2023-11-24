import { Platform, StyleSheet } from "react-native";

import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Text, View } from "../components/Themed";

export default function ModalScreen() {
  const { error, body, title } = useLocalSearchParams<{
    error: string;
    body: string;
    title: string;
  }>();

  return (
    <>
      <Stack.Screen options={{ title }} />
      <View style={styles.container}>
        <Text style={styles.title}>{error}</Text>
        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />
        <Text style={styles.body}>{body}</Text>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  title: {
    textAlign: "center",
    textAlignVertical: "bottom",
    fontSize: 20,
    fontWeight: "bold",
    flexGrow: 1,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  body: {
    textAlign: "center",
    marginVertical: 40,
    fontSize: 20,
    flexGrow: 3,
  },
});
