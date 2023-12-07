import { StyleSheet } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { COLORS } from "../constants/Colors";
import { REFRESH_DISTANCE } from "../constants/Maps";
import { getPermission } from "../lib/appStore";
import { centerMap, setUserAddress, useMapStore } from "../lib/mapStore";
import AnimatedButton from "./AnimatedButton";
import { OutsidePress } from "./OutsidePress";

export default function MapGpsButton() {
  const followUser = useMapStore((state) => state.followUser);

  return (
    <AnimatedButton onPress={onGPSButtonPress} style={styles.button}>
      <OutsidePress
        id="gps"
        onOutsidePress={() => useMapStore.setState({ followUser: false })}
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

function onGPSButtonPress() {
  const { userLocation } = useMapStore.getState();
  if (!userLocation) {
    getPermission().catch(console.error);
    return;
  }

  centerMap(userLocation);
  setUserAddress(userLocation, REFRESH_DISTANCE / 4).catch(console.error);
  useMapStore.setState({ followUser: true });
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
