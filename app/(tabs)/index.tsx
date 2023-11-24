import { useState } from "react";
import { StyleSheet } from "react-native";

import Map from "../../components/Map";
import SearchBar from "../../components/SearchBar";
import { View } from "../../components/Themed";

export default function TabOneScreen() {
  const [search, setSearch] = useState("");

  return (
    <View style={styles.container}>
      <SearchBar search={search} setSearch={setSearch} />
      <Map />
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
