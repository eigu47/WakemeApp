import { useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Map from "../../components/Map";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import MapSearchBar from "../../components/MapSearchBar";
import { View } from "../../components/Themed";
import { COLORS, hexToRgb } from "../../constants/Colors";

export default function TabOneScreen() {
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState(1000);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[{ paddingTop: insets.top }, styles.bar]}>
        <MapSearchBar search={search} setSearch={setSearch} />
        <View style={styles.barButton}>
          <MapRadiusSlider radius={radius} setRadius={setRadius} />
        </View>
      </View>
      <Map radius={radius} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  bar: {
    position: "absolute",
    top: 0,
    width: "100%",
    alignItems: "center",
    zIndex: 1,
    paddingHorizontal: "5%",
    gap: 15,
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
