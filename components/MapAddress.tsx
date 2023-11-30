import { useContext } from "react";
import { StyleSheet } from "react-native";

import { COLORS } from "../constants/Colors";
import { type Address } from "../type/geocode";
import { MapContext } from "./MapContext";
import { Text, View } from "./Themed";

export default function MapAddress() {
  const { selectedAddress, userAddress } = useContext(MapContext);

  return (
    <View style={styles.view}>
      {selectedAddress && (
        <Text style={styles.font}>To: {getStringAddress(selectedAddress)}</Text>
      )}
      {userAddress && (
        <Text style={styles.font}>At: {getStringAddress(userAddress)}</Text>
      )}
    </View>
  );
}

function getStringAddress(address: Address | undefined) {
  return address
    ?.slice(2)
    .filter((a) => a)
    .join(", ");
}

const styles = StyleSheet.create({
  view: {
    backgroundColor: COLORS.secondary,
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 15,
    padding: 10,
  },
  font: {
    fontSize: 11,
  },
});
