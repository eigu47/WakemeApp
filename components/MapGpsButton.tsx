import { StyleSheet } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { COLORS } from "../constants/Colors";
import { useMapStore } from "../lib/mapStore";
import AnimatedButton from "./AnimatedButton";
import { OutsidePress } from "./OutsidePress";

export default function MapGpsButton() {
  const followUser = useMapStore((state) => state.followUser);
  const setState = useMapStore((state) => state.setState);
  const onGPSButtonPress = useMapStore((state) => state.onGPSButtonPress);

  return (
    <AnimatedButton onPress={onGPSButtonPress} style={styles.button}>
      <OutsidePress
        id="gps"
        onOutsidePress={() => setState({ followUser: false })}
      >
        <MaterialIcons
          name="gps-fixed"
          size={24}
          style={[styles.icon, followUser && styles.follow]}
        />
      </OutsidePress>
    </AnimatedButton>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: COLORS.foreground,
    borderColor: COLORS.muted,
    borderRadius: 50,
    borderWidth: 1,
    width: 40,
    height: 40,
    opacity: 0.8,
  },
  icon: {
    textAlign: "center",
    textAlignVertical: "center",
    height: "100%",
  },
  follow: {
    color: COLORS.ring,
  },
});
