import { useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Map from "../../components/Map";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import SearchBar from "../../components/SearchBar";
import { View } from "../../components/Themed";
import { COLORS, hexToRgb } from "../../constants/Colors";

export default function TabOneScreen() {
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState(1000);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          alignItems: "center",
          zIndex: 1,
          paddingTop: insets.top,
          paddingHorizontal: "5%",
          gap: 15,
          paddingBottom: 8,
          backgroundColor: hexToRgb(COLORS.foreground, 0.8),
        }}
      >
        <SearchBar search={search} setSearch={setSearch} />
        <View
          style={{
            width: "100%",
            backgroundColor: "transparent",
          }}
        >
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
});
