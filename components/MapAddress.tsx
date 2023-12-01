import { useContext, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BAR_HEIGHT } from "../app/(tabs)";
import { COLORS } from "../constants/Colors";
import { type Address } from "../type/geocode";
import { MapContext } from "./MapContext";
import { Text } from "./Themed";

export default function MapAddress() {
  const {
    selectedAddress,
    userAddress,
    centerMap,
    selectedLocation,
    userLocation,
    mapRef,
  } = useContext(MapContext);

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

function getStringAddress(address: Address) {
  const filter = address.filter((a) => a);
  const cutTo = Math.max(0, filter.length - 2);

  return filter.slice(cutTo).join(", ");
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
