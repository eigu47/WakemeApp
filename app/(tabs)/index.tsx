import { useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BlurView } from "expo-blur";

import Map from "../../components/Map";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import SearchBar from "../../components/SearchBar";
import { View } from "../../components/Themed";

export default function TabOneScreen() {
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState(1000);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <BlurView
        intensity={100}
        tint="light"
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: 100,
          alignItems: "center",
          zIndex: 1,
          paddingTop: insets.top,
        }}
      >
        <SearchBar search={search} setSearch={setSearch} />
        <MapRadiusSlider radius={radius} setRadius={setRadius} />
      </BlurView>
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
