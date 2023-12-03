import { useState } from "react";
import { Button, Modal, StyleSheet } from "react-native";

import { COLORS, hexToRgb } from "../constants/Colors";
import { useMapStore } from "../lib/mapStore";
import { Text, View } from "./Themed";

export default function MapPermissionModal() {
  const permissionDenied = useMapStore((state) => state.permissionDenied);
  const getPermission = useMapStore((state) => state.getPermission);

  const [loading, setLoading] = useState(false);

  return (
    <Modal animationType="fade" transparent visible={permissionDenied}>
      <View style={[styles.container]}>
        <View style={styles.modal}>
          <Text>Permission to access location was denied</Text>
          <Button
            title={loading ? "Loading..." : "Try again"}
            onPress={() => {
              setLoading(true);
              getPermission();
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
