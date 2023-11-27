import { useState } from "react";
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
    top: -15 + animate.value * 15,
  }));

  const animatedView = useAnimatedStyle(() => ({
    borderBottomLeftRadius: 10 - animate.value * 10,
    borderBottomRightRadius: 10 - animate.value * 10,
  }));

  return (
    <>
      <AnimatedPressable
        style={[
          {
            borderRadius: 10,
            width: "40%",
            backgroundColor: COLORS.muted,
            zIndex: 1,
          },
          animatedView,
        ]}
        onPress={() => {
          setIsShow((prev) => !prev);
          animate.value = withTiming(isShow ? 0 : 1, {
            duration: 100,
            easing: Easing.inOut(Easing.cubic),
          });
        }}
      >
        <Text
          style={{
            height: 35,
            textAlign: "center",
            textAlignVertical: "center",
          }}
        >
          Range: {~~radius}
        </Text>
      </AnimatedPressable>
      <Animated.View
        style={[
          {
            borderRadius: 10,
            backgroundColor: COLORS.muted,
            borderTopLeftRadius: 0,
          },
          animatedSlide,
        ]}
      >
        <Slider
          minimumValue={100}
          maximumValue={5000}
          value={radius}
          onValueChange={setRadius}
          style={{
            height: "100%",
            top: 3,
          }}
        />
      </Animated.View>
    </>
  );
}
