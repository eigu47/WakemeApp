import { useContext } from "react";
import { StyleSheet } from "react-native";

import { requestForegroundPermissionsAsync } from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "../constants/Colors";
import AnimatedButton from "./AnimatedButton";
import { MapContext } from "./MapContext";

export default function MapGpsButton() {
  const { userLocation, centerMap, setUserAddress, setFollowUser } =
    useContext(MapContext);

  return (
    <AnimatedButton
      onPress={() => {
        if (!userLocation) {
          requestForegroundPermissionsAsync().catch(console.error);
        }

        if (userLocation) {
          centerMap(userLocation);
          setUserAddress(userLocation).catch(console.error);
          setFollowUser(true);
        }
      }}
      style={[styles.button, !userLocation && styles.disabled]}
    >
      <MaterialCommunityIcons
        style={styles.icon}
        name="crosshairs-gps"
        size={25}
      />
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
});
