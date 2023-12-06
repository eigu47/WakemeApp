import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "../constants/Colors";
import { useMapStore } from "../lib/mapStore";
import { Text } from "./Themed";

export default function MapAlarmButton() {
  const alarm = useMapStore((state) => state.alarm);
  const setAlarm = useMapStore((state) => state.switchAlarm);

  return (
    <Pressable style={styles.container} onPress={setAlarm}>
      <Text style={styles.text}>Alarm: {alarm ? "ON" : "OFF"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    width: "40%",
    backgroundColor: COLORS.background,
    height: 30,
  },
  text: {
    textAlign: "center",
    textAlignVertical: "center",
    top: 5,
  },
});
