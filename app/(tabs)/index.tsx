import { useState } from "react";
import { StyleSheet } from "react-native";

import Map from "../../components/Map";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import SearchBar from "../../components/SearchBar";
import { View } from "../../components/Themed";

export default function TabOneScreen() {
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState(1000);

  return (
    <View style={styles.container}>
      <SearchBar search={search} setSearch={setSearch} />
      <MapRadiusSlider radius={radius} setRadius={setRadius} />
      <Map radius={radius} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
