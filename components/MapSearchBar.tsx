import { useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import {
  GooglePlacesAutocomplete,
  type GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";

import { Fontisto } from "@expo/vector-icons";

import { COLORS, hexToRgb } from "../constants/Colors";
import { useMapStore } from "../lib/mapStore";
import { OutsidePress } from "./OutsidePress";

export default function MapSearchBar() {
  const onSearchPlace = useMapStore((state) => state.onSearchPlace);
  const isKeyboardOpen = useMapStore((state) => state.keyboardIsOpen);
  const countryCode = useMapStore(
    (state) => state.userAddress?.[0]?.toLowerCase(),
  );
  const [error, setError] = useState(false);

  const inputRef = useRef<GooglePlacesAutocompleteRef>(null);

  return (
    <OutsidePress
      onOutsidePress={Keyboard.dismiss}
      disable={error}
      style={styles.view}
    >
      <GooglePlacesAutocomplete
        ref={inputRef}
        query={{
          key: process.env.EXPO_PUBLIC_MAPS_API,
          rankby: "distance",
          components: countryCode && `country:${countryCode}`,
        }}
        placeholder={error ? "Something went wrong..." : "Search"}
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
            height: 38,
            // height: "auto",
            paddingRight: 35,
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
        onPress={(e) => {
          onSearchPlace(e).catch((e) => {
            console.error(e);
            setError(true);
          });
        }}
      />
      <Fontisto
        name="close"
        size={20}
        style={[styles.clear, !isKeyboardOpen && { opacity: 0.2 }]}
        onPress={() => inputRef.current?.clear()}
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
  clear: {
    position: "absolute",
    right: 7,
    height: 38,
    textAlignVertical: "center",
    color: COLORS.background,
  },
});
