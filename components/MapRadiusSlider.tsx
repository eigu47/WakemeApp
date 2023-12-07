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
import { updateGeofencing, useMapStore } from "../lib/mapStore";
import { AnimatedPressable } from "./AnimatedButton";
import { OutsidePress } from "./OutsidePress";
import { Text } from "./Themed";

export default function MapRadiusSlider() {
  const radius = useMapStore((state) => state.radius);

  const [isShow, setIsShow] = useState(false);
  const animate = useSharedValue(0);

  const animatedSlide = useAnimatedStyle(() => ({
    height: animate.value * 45,
    opacity: animate.value,
  }));

  const animatedView = useAnimatedStyle(() => ({
    height: 30 + animate.value * 50,
  }));

  function closeSlider() {
    if (isShow) {
      setIsShow(false);
      animate.value = withTiming(0, {
        duration: 150,
        easing: Easing.inOut(Easing.cubic),
      });
    }
  }

  return (
    <>
      <OutsidePress
        id="radius"
        onOutsidePress={closeSlider}
        style={styles.outside}
      >
        <AnimatedPressable
          style={[animatedView]}
          onPress={() => {
            setIsShow((prev) => !prev);
            animate.value = withTiming(isShow ? 0 : 1, {
              duration: 150,
              easing: Easing.inOut(Easing.cubic),
            });
          }}
        >
          <Text style={styles.text}>Range: {radius} m</Text>
        </AnimatedPressable>
      </OutsidePress>
      <OutsidePress
        id="radius"
        onOutsidePress={closeSlider}
        style={styles.sliderPress}
      >
        <Animated.View style={[styles.sliderAnimated, animatedSlide]}>
          <Slider
            minimumValue={100}
            maximumValue={5000}
            value={radius}
            step={100}
            onValueChange={(radius) => useMapStore.setState({ radius })}
            onSlidingComplete={() => {
              updateGeofencing().catch(console.error);
            }}
            style={[styles.slider]}
            thumbTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.primary}
            minimumTrackTintColor={COLORS.primary}
          />
        </Animated.View>
      </OutsidePress>
    </>
  );
}

const styles = StyleSheet.create({
  outside: {
    borderRadius: 10,
    width: "40%",
    backgroundColor: COLORS.background,
  },
  text: {
    textAlign: "center",
    textAlignVertical: "center",
    top: 5,
  },
  sliderPress: {
    width: "100%",
    borderRadius: 10,
    position: "absolute",
    top: 35,
  },
  sliderAnimated: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
  },
  slider: {
    height: "100%",
  },
});
