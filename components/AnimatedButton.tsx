import { type ComponentProps } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export default function AnimatedButton({
  children,
  duration = 60,
  offset = 3,
  style,
  onPress,
  ...props
}: {
  children: React.ReactNode;
  duration?: number;
  offset?: number;
} & ComponentProps<typeof Pressable>) {
  const translateY = useSharedValue(0);

  return (
    <AnimatedPressable
      {...props}
      style={[style, { translateY }]}
      onPress={(e) => {
        onPress?.(e);
        translateY.value = withRepeat(
          withTiming(offset, {
            duration,
            easing: Easing.inOut(Easing.cubic),
          }),
          2,
          true,
        );
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
