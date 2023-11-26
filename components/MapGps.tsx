import { type RefObject } from "react";
import { StyleSheet } from "react-native";
import type MapView from "react-native-maps";
import { type Region } from "react-native-maps";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "../constants/Colors";
import AnimatedButton from "./AnimatedButton";

export default function MapGps({
  mapRef,
  region,
  getLocation,
}: {
  mapRef: RefObject<MapView>;
  region?: Region;
  getLocation: () => Promise<void>;
}) {
  return (
    <AnimatedButton
      onPress={() => {
        if (region) {
          mapRef.current?.animateToRegion(region, 500);
          return;
        }

        getLocation().catch(console.error);
      }}
      buttonProps={{
        style: [styles.button, !region && styles.disabled],
      }}
      animatedProps={{ style: styles.animated }}
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
  animated: {
    position: "absolute",
    bottom: 15,
    right: 15,
  },
  button: {
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
