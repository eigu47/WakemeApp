import { StyleSheet } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "../constants/Colors";
import { useMapStore } from "../lib/mapStore";
import AnimatedButton from "./AnimatedButton";
import { OutsidePress } from "./OutsidePress";

export default function MapGpsButton() {
  const userLocation = useMapStore((state) => state.userLocation);
  const centerMap = useMapStore((state) => state.centerMap);
  const setUserAddress = useMapStore((state) => state.setUserAddress);
  const setFollowUser = useMapStore((state) => state.setFollowUser);
  const followUser = useMapStore((state) => state.followUser);
  const getPermission = useMapStore((state) => state.getPermission);

  return (
    <AnimatedButton
      onPress={() => {
        if (!userLocation) {
          getPermission().catch(console.error);
        }

        if (userLocation) {
          centerMap(userLocation);
          setUserAddress(userLocation).catch(console.error);
          setFollowUser(true);
        }
      }}
      style={[styles.button, !userLocation && styles.disabled]}
    >
      <OutsidePress id="gps" onOutsidePress={() => setFollowUser(false)}>
        <MaterialCommunityIcons
          style={[styles.icon, followUser && styles.follow]}
          name="crosshairs-gps"
          size={25}
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
  disabled: {
    opacity: 0.6,
  },
  follow: {
    color: COLORS.ring,
  },
});
