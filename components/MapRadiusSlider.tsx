import { StyleSheet } from "react-native";

import Slider from "@react-native-community/slider";

import { COLORS } from "../constants/Colors";
import { Text, View } from "./Themed";

export default function MapRadiusSlider({
  radius,
  setRadius,
}: {
  radius: number;
  setRadius: (radius: number) => void;
}) {
  return (
    <View style={styles.radius}>
      <Text>Radius range</Text>
      <Slider
        minimumValue={100}
        maximumValue={5000}
        value={radius}
        onValueChange={setRadius}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  radius: {
    position: "absolute",
    top: 100,
    right: 20,
    width: "40%",
    height: 40,
    backgroundColor: COLORS.light.background,
    borderRadius: 10,
  },
});
