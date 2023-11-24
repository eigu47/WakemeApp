import { useEffect, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import MapView from "react-native-maps";

import * as Location from "expo-location";
import { useRouter } from "expo-router";

import SearchBar from "../../components/SearchBar";
import { View } from "../../components/Themed";
import Colors from "../../constants/Colors";

export default function TabOneScreen() {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        router.push({
          pathname: "/modal",
          params: {
            title: "Error",
            error: "Permission to access location was denied",
            body: "Please enable location services in your settings",
          },
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })().catch((e) => console.error(e));
  }, [router]);

  return (
    <View style={styles.container}>
      <SearchBar search={search} setSearch={setSearch} />
      <MapView style={styles.map} onPress={() => Keyboard.dismiss()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "80%",
    backgroundColor: "#fff",
    position: "absolute",
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderColor: Colors.light.tint,
    borderWidth: 2,
    top: 15,
    zIndex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
