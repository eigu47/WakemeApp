import { useEffect, useRef, type ComponentProps } from "react";
import { View } from "react-native";

export default function OutsidePress({
  children,
  ...props
}: {
  children: React.ReactNode & ComponentProps<typeof View>;
}) {
  const viewRef = useRef<View>(null);

  useEffect(() => {}, []);

  return (
    <View ref={viewRef} {...props}>
      {children}
    </View>
  );
}
