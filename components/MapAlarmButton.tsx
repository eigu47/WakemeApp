import { Pressable, StyleSheet } from "react-native";

import { COLORS } from "../constants/Colors";
import {
  checkDistance,
  dismissAlert,
  updateGeofencing,
  useMapStore,
} from "../lib/mapStore";
import { Text } from "./Themed";

export default function MapAlarmButton() {
  const alarm = useMapStore((state) => state.alarm);

  return (
    <Pressable style={styles.container} onPress={switchAlarm}>
      <Text style={styles.text}>Alarm: {alarm ? "ON" : "OFF"}</Text>
    </Pressable>
  );
}

export function switchAlarm() {
  useMapStore.setState((alarm) => ({ alarm: !alarm }));
  const { alarm, selectedLocation } = useMapStore.getState();

  if (!alarm || !selectedLocation) {
    dismissAlert().catch(console.error);
    return;
  }

  checkDistance();
  updateGeofencing().catch(console.error);
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
