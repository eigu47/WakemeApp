import { type ComponentProps } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function AnimatedButton({
  children,
  onPress,
  duration = 50,
  offset = 5,
  buttonProps,
  animatedProps,
}: {
  children: React.ReactNode;
  duration?: number;
  offset?: number;
  onPress?: () => void;
  buttonProps?: ComponentProps<typeof Pressable>;
  animatedProps?: ComponentProps<typeof Animated.View>;
}) {
  const animatedOffset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animatedOffset.value }],
  }));

  return (
    <Animated.View
      {...animatedProps}
      style={[animatedProps?.style, animatedStyle]}
    >
      <Pressable
        {...buttonProps}
        onPress={() => {
          onPress?.();
          animatedOffset.value = withSequence(
            withTiming(offset, { duration, easing: Easing.linear }),
            withTiming(0, { duration, easing: Easing.linear }),
          );
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
