import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapAddress from "../../components/MapAddress";
import MapCanvas from "../../components/MapCanvas";
import MapContextProvider from "../../components/MapContext";
import MapGpsButton from "../../components/MapGpsButton";
import MapLocationModal from "../../components/MapLocationModal";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import MapSearchBar from "../../components/MapSearchBar";
import { View } from "../../components/Themed";
import { COLORS, hexToRgb } from "../../constants/Colors";

export default function TabOneScreen() {
  const insets = useSafeAreaInsets();

  return (
    <MapContextProvider>
      <MapLocationModal />

      <View style={styles.container}>
        <View style={[{ paddingTop: insets.top }, styles.bar]}>
          <MapSearchBar />
          <View style={styles.barButton}>
            <MapRadiusSlider />
          </View>
        </View>

        <MapCanvas />
        <MapGpsButton />
        <MapAddress />
      </View>
    </MapContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
  },
  bar: {
    position: "absolute",
    top: 0,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
    paddingHorizontal: "5%",
    gap: 5,
    paddingBottom: 8,
    backgroundColor: hexToRgb(COLORS.background, 0.8),
  },
  barButton: {
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },
});
