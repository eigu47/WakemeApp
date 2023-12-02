import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/Colors";
import { formatDistance } from "../lib/helpers";
import { useMapStore } from "../lib/mapStore";
import { Text } from "./Themed";

export default function MapDistance() {
  const distance = useMapStore((state) => state.distance);
  const radius = useMapStore((state) => state.radius);
  const changeView = useMapStore((state) => state.changeView);
  const inset = useSafeAreaInsets().top;

  if (!distance) return null;

  return (
    <Pressable style={styles.container} onPress={() => changeView(inset)}>
      <Text>Destination: {formatDistance(distance)}</Text>
      <Text>In range: {formatDistance(distance - radius / 1000)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.secondary,
    margin: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
