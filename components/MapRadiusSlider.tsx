import { StyleSheet } from "react-native";

import Slider from "@react-native-community/slider";

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
    width: "40%",
    height: 40,
    borderRadius: 10,
  },
});
