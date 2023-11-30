import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getCurrentPositionAsync,
  PermissionStatus,
  requestForegroundPermissionsAsync,
  type LocationObject,
} from "expo-location";

import Map from "../../components/Map";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import MapSearchBar from "../../components/MapSearchBar";
import ModalComponent from "../../components/ModalComponent";
import { View } from "../../components/Themed";
import { COLORS, hexToRgb } from "../../constants/Colors";

export default function TabOneScreen() {
  const [userLocation, setUserLocation] = useState<LocationObject>();
  const [showModal, setShowModal] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState(1000);
  const insets = useSafeAreaInsets();

  const getLocation = useCallback(async () => {
    const { status } = await requestForegroundPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      setLoadingLocation(false);
      setShowModal(true);
      return;
    }

    const location = await getCurrentPositionAsync();
    setLoadingLocation(false);
    setShowModal(false);
    setUserLocation(location);
  }, []);

  useEffect(() => {
    getLocation().catch(console.error);
  }, [getLocation]);

  return (
    <>
      <ModalComponent
        show={showModal}
        onPress={() => getLocation}
        loading={loadingLocation}
      />
      <View style={styles.container}>
        <View style={[{ paddingTop: insets.top }, styles.bar]}>
          <MapSearchBar setSearch={setSearch} />
          <View style={styles.barButton}>
            <MapRadiusSlider radius={radius} setRadius={setRadius} />
          </View>
        </View>
        <Map
          radius={radius}
          userLocation={userLocation}
          getLocation={getLocation}
        />
      </View>
    </>
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
