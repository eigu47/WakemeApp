import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/Colors";
import { BAR_HEIGHT } from "../constants/Maps";
import { getStringAddress } from "../lib/helpers";
import { centerMap, useMapStore } from "../lib/mapStore";
import { Text } from "./Themed";

export default function MapAddress() {
  const selectedAddress = useMapStore((state) => state.selectedAddress);
  const userAddress = useMapStore((state) => state.userAddress);
  const inset = useSafeAreaInsets().top;

  if (!selectedAddress && !userAddress) return null;
  return (
    <Pressable style={styles.view} onPress={() => changeView(inset)}>
      {selectedAddress && (
        <Text style={styles.font}>To: {getStringAddress(selectedAddress)}</Text>
      )}
      {userAddress && (
        <Text style={styles.font}>At: {getStringAddress(userAddress)}</Text>
      )}
    </Pressable>
  );
}

let viewBoth = true;
let userZoom: number | undefined;

function changeView(inset: number) {
  const { selectedLocation, userLocation, mapRef } = useMapStore.getState();
  if (!userLocation && selectedLocation) {
    centerMap(selectedLocation);
  }

  if (userLocation && selectedLocation) {
    if (viewBoth) {
      mapRef.current
        ?.getCamera()
        .then(({ zoom }) => (userZoom = zoom))
        .catch(console.error);

      mapRef?.current?.fitToCoordinates([selectedLocation, userLocation], {
        edgePadding: {
          top: inset + BAR_HEIGHT + 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
      viewBoth = false;
      return;
    }

    if (!viewBoth) {
      centerMap(selectedLocation, { zoom: userZoom });
      viewBoth = true;
    }
  }
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
