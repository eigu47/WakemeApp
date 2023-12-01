import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/Colors";
import { BAR_HEIGHT } from "../constants/Maps";
import { getStringAddress } from "../lib/helpers";
import { useMapStore } from "../lib/mapStore";
import { Text } from "./Themed";

export default function MapAddress() {
  const selectedAddress = useMapStore((state) => state.selectedAddress);
  const userAddress = useMapStore((state) => state.userAddress);
  const centerMap = useMapStore((state) => state.centerMap);
  const selectedLocation = useMapStore((state) => state.selectedLocation);
  const userLocation = useMapStore((state) => state.userLocation);
  const mapRef = useMapStore((state) => state.mapRef);

  const [viewBoth, setViewBoth] = useState(true);
  const insets = useSafeAreaInsets();

  if (!selectedAddress && !userAddress) return null;
  return (
    <Pressable
      style={styles.view}
      onPress={() => {
        if (!userLocation && selectedLocation) {
          centerMap(selectedLocation);
        }

        if (userLocation && selectedLocation) {
          if (viewBoth) {
            mapRef?.current?.fitToCoordinates(
              [selectedLocation, userLocation],
              {
                edgePadding: {
                  top: insets.top + BAR_HEIGHT + 50,
                  right: 50,
                  bottom: 50,
                  left: 50,
                },
                animated: true,
              },
            );
            setViewBoth(false);
          }

          if (!viewBoth) {
            centerMap(selectedLocation);
            setViewBoth(true);
          }
        }
      }}
    >
      {selectedAddress && (
        <Text style={styles.font}>To: {getStringAddress(selectedAddress)}</Text>
      )}
      {userAddress && (
        <Text style={styles.font}>At: {getStringAddress(userAddress)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: COLORS.secondary,
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 15,
    padding: 10,
  },
  font: {
    fontSize: 11,
  },
});
