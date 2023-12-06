import { setKey } from "react-geocode";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapAddress from "../../components/MapAddress";
import MapAlarmButton from "../../components/MapAlarmButton";
import MapCanvas from "../../components/MapCanvas";
import MapDistance from "../../components/MapDistance";
import MapGpsButton from "../../components/MapGpsButton";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import MapSearchBar from "../../components/MapSearchBar";
import { View } from "../../components/Themed";
import { COLORS, hexToRgb } from "../../constants/Colors";

process.env.EXPO_PUBLIC_MAPS_API && setKey(process.env.EXPO_PUBLIC_MAPS_API);

export default function TabOneScreen() {
  const inset = useSafeAreaInsets().top;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { paddingTop: inset }]}>
          <MapSearchBar />
          <View style={styles.barButton}>
            <MapRadiusSlider />
            <MapAlarmButton />
          </View>
        </View>

        <MapDistance />
      </View>

      {/* <View style={{ height: insets.top + 96, backgroundColor: "red" }} /> */}

      <MapCanvas />
      <MapGpsButton />
      <MapAddress />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
  },
  barContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    zIndex: 1,
    backgroundColor: "transparent",
  },
  bar: {
    backgroundColor: hexToRgb(COLORS.background, 0.6),
    paddingHorizontal: "5%",
    width: "100%",
    gap: 5,
    paddingBottom: 8,
    zIndex: 1,
  },
  barButton: {
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },
});
