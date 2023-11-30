import { useContext, useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import {
  GooglePlacesAutocomplete,
  type GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";

import { COLORS, hexToRgb } from "../constants/Colors";
import { MapContext } from "./MapContext";
import { OutsidePress } from "./OutsidePress";

export default function MapSearchBar() {
  const { searchPlaceById, userAddress } = useContext(MapContext);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const inputRef = useRef<GooglePlacesAutocompleteRef>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const countryCode = userAddress?.country?.short_name.toLocaleLowerCase();

  return (
    <OutsidePress
      onOutsidePress={() => {
        Keyboard.dismiss();
      }}
      style={styles.view}
    >
      <GooglePlacesAutocomplete
        ref={inputRef}
        query={{
          key: process.env.EXPO_PUBLIC_MAPS_API,
          rankby: "distance",
          components: countryCode && `country:${countryCode}`,
        }}
        placeholder="Search"
        enablePoweredByContainer={false}
        styles={{
          container: {
            position: "relative",
          },
          textInput: {
            backgroundColor: isKeyboardOpen
              ? COLORS.foreground
              : hexToRgb(COLORS.foreground, 0.8),
            borderRadius: 10,
            height: "auto",
            overflow: "hidden",
          },
          row: {
            borderRadius: 10,
            backgroundColor: "transparent",
          },
          listView: {
            position: "absolute",
            top: "100%",
            borderRadius: 10,
            backgroundColor: hexToRgb(COLORS.foreground),
            borderColor: hexToRgb(COLORS.background, 0.3),
            borderWidth: 1,
          },
          separator: {
            height: 1,
            backgroundColor: hexToRgb(COLORS.background, 0.1),
          },
        }}
        onPress={(data) => {
          searchPlaceById(data.place_id).catch(console.error);
        }}
      />
    </OutsidePress>
  );
}

const styles = StyleSheet.create({
  view: {
    marginTop: 10,
    flexDirection: "row",
    zIndex: 1,
  },
  onKeyOpen: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.foreground,
  },
});
