import { useEffect } from "react";
import { setKey } from "react-geocode";
import { Keyboard, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapAddress from "../../components/MapAddress";
import MapCanvas from "../../components/MapCanvas";
import MapGpsButton from "../../components/MapGpsButton";
import MapLocationModal from "../../components/MapLocationModal";
import MapRadiusSlider from "../../components/MapRadiusSlider";
import MapSearchBar from "../../components/MapSearchBar";
import { View } from "../../components/Themed";
import { COLORS, hexToRgb } from "../../constants/Colors";
import { useMapStore } from "../../lib/mapStore";

process.env.EXPO_PUBLIC_MAPS_API && setKey(process.env.EXPO_PUBLIC_MAPS_API);

export default function TabOneScreen() {
  const setKeyboardIsOpen = useMapStore((state) => state.setKeyboardIsOpen);
  const getPermission = useMapStore((state) => state.getPermission);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardIsOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardIsOpen(false);
    });

    getPermission().catch(console.error);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [setKeyboardIsOpen, getPermission]);

  return (
    <>
      <MapLocationModal />

      <View style={styles.container}>
        <View style={[{ paddingTop: insets.top }, styles.bar]}>
          <MapSearchBar />
          <View style={styles.barButton}>
            <MapRadiusSlider />
          </View>
        </View>

        {/* <View style={{ height: insets.top + 96, backgroundColor: "red" }} /> */}

        <MapCanvas />
        <MapGpsButton />
        <MapAddress />
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
