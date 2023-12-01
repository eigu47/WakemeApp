import { useContext, useState } from "react";
import { Button, Modal, StyleSheet } from "react-native";

import { requestForegroundPermissionsAsync } from "expo-location";

import { COLORS, hexToRgb } from "../constants/Colors";
import { MapContext } from "./MapContext";
import { Text, View } from "./Themed";

export default function MapLocationModal() {
  const { userLocation } = useContext(MapContext);

  const [loading, setLoading] = useState(false);

  return (
    <Modal animationType="fade" transparent visible={!userLocation}>
      <View style={[styles.container]}>
        <View style={styles.modal}>
          <Text>Permission to access location was denied</Text>
          <Button
            title={loading ? "Loading..." : "Try again"}
            onPress={() => {
              setLoading(true);
              requestForegroundPermissionsAsync().catch(console.error);
            }}
            disabled={loading}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: hexToRgb(COLORS.background, 0.6),
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    gap: 40,
  },
});
