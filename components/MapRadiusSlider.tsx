import { useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import Slider from "@react-native-community/slider";

import { COLORS } from "../constants/Colors";
import { AnimatedPressable } from "./AnimatedButton";
import { Text } from "./Themed";

export default function MapRadiusSlider({
  radius,
  setRadius,
}: {
  radius: number;
  setRadius: (radius: number) => void;
}) {
  const [isShow, setIsShow] = useState(false);
  const animate = useSharedValue(0);

  const animatedSlide = useAnimatedStyle(() => ({
    height: animate.value * 50,
    opacity: animate.value,
    top: -10 + animate.value * 10,
  }));

  const animatedView = useAnimatedStyle(() => ({
    borderBottomLeftRadius: 5 - animate.value * 5,
    borderBottomRightRadius: 5 - animate.value * 5,
  }));

  return (
    <>
      <AnimatedPressable
        style={[styles.button, animatedView]}
        onPress={() => {
          setIsShow((prev) => !prev);
          animate.value = withTiming(isShow ? 0 : 1, {
            duration: 150,
            easing: Easing.inOut(Easing.cubic),
          });
        }}
      >
        <Text style={styles.text}>Range: {radius}</Text>
      </AnimatedPressable>
      <Animated.View style={[styles.sliderAnimated, animatedSlide]}>
        <Slider
          minimumValue={100}
          maximumValue={5000}
          value={radius}
          onValueChange={setRadius}
          style={styles.slider}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    width: "40%",
    backgroundColor: COLORS.muted,
    zIndex: 1,
  },
  text: {
    height: 35,
    textAlign: "center",
    textAlignVertical: "center",
  },
  sliderAnimated: {
    borderRadius: 10,
    backgroundColor: COLORS.muted,
    borderTopLeftRadius: 0,
  },
  slider: {
    height: "100%",
    top: 3,
  },
});
