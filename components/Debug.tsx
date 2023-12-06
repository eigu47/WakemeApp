import { StyleSheet } from "react-native";

import { create } from "zustand";

import { Text, View } from "./Themed";

export default function Debug() {
  const { roundDistance } = useDebugStore();

  return (
    <View style={styles.container}>
      <Text>{roundDistance}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 0,
    margin: 20,
    padding: 5,
    zIndex: 100,
  },
});

export const useDebugStore = create<{
  roundDistance?: number;
}>()(() => ({
  roundDistance: undefined,
}));
