import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/Colors";
import { getStringAddress } from "../lib/helpers";
import { useMapStore } from "../lib/mapStore";
import { Text } from "./Themed";

export default function MapAddress() {
  const selectedAddress = useMapStore((state) => state.selectedAddress);
  const userAddress = useMapStore((state) => state.userAddress);
  const onAddressPress = useMapStore((state) => state.changeView);
  const inset = useSafeAreaInsets().top;

  if (!selectedAddress && !userAddress) return null;
  return (
    <Pressable style={styles.view} onPress={() => onAddressPress(inset)}>
      {selectedAddress && (
        <Text style={styles.font}>To: {getStringAddress(selectedAddress)}</Text>
      )}
      {userAddress && (
        <Text style={styles.font}>At: {getStringAddress(userAddress)}</Text>
      )}
    </Pressable>
  );
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
