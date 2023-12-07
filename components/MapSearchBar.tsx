import { useRef, useState } from "react";
import { fromPlaceId } from "react-geocode";
import { Keyboard, StyleSheet } from "react-native";
import {
  GooglePlacesAutocomplete,
  type GooglePlaceData,
  type GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";

import { Fontisto } from "@expo/vector-icons";

import { COLORS, hexToRgb } from "../constants/Colors";
import { getAddress } from "../lib/helpers";
import { centerMap, checkDistance, useMapStore } from "../lib/mapStore";
import { type GeocodeResponse } from "../type/geocode";
import { OutsidePress } from "./OutsidePress";

export default function MapSearchBar() {
  const keyboardIsOpen = useMapStore((state) => state.keyboardIsOpen);
  const countryCode = useMapStore(
    (state) => state.userAddress?.[0]?.toLowerCase(),
  );
  const [error, setError] = useState<string>();

  const inputRef = useRef<GooglePlacesAutocompleteRef>(null);

  return (
    <OutsidePress
      onOutsidePress={Keyboard.dismiss}
      disable={!!error}
      style={styles.view}
    >
      <GooglePlacesAutocomplete
        ref={inputRef}
        query={{
          key: process.env.EXPO_PUBLIC_MAPS_API,
          rankby: "distance",
          components: countryCode && `country:${countryCode}`,
        }}
        placeholder={error ?? "Search"}
        enablePoweredByContainer={false}
        styles={{
          container: {
            position: "relative",
          },
          textInput: {
            backgroundColor: keyboardIsOpen
              ? COLORS.foreground
              : hexToRgb(COLORS.foreground, 0.8),
            borderRadius: 10,
            height: 38,
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
          onSearchPlace(e).catch((e: Error) => {
            console.error(e);
            setError(e.message ?? "Something went wrong...");
          });
        }}
      />
      <Fontisto
        name="close"
        size={20}
        style={[styles.clear, !keyboardIsOpen && { opacity: 0.2 }]}
        onPress={() => inputRef.current?.setAddressText("")}
      />
    </OutsidePress>
  );
}

async function onSearchPlace(e: GooglePlaceData) {
  const { results } = (await fromPlaceId(e.place_id)) as GeocodeResponse;
  const result = results[0];
  if (!result) return;

  const latLng = {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  };

  centerMap(latLng);
  useMapStore.setState({ selectedLocation: latLng });
  useMapStore.setState({
    selectedAddress: getAddress(result.address_components),
  });
  checkDistance();
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
