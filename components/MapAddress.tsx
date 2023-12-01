import { useContext } from "react";
import { StyleSheet } from "react-native";

import { COLORS } from "../constants/Colors";
import { type Address } from "../type/geocode";
import { MapContext } from "./MapContext";
import { Text, View } from "./Themed";

export default function MapAddress() {
  const { selectedAddress, userAddress } = useContext(MapContext);

  if (!selectedAddress && !userAddress) return null;
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

function getStringAddress(address: Address) {
  const filter = address.filter((a) => a);
  const cutTo = Math.max(0, filter.length - 2);

  return filter.slice(cutTo).join(", ");
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
