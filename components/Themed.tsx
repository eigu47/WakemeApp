import { Text as DefaultText, View as DefaultView } from "react-native";

import { COLORS } from "../constants/Colors";

export function Text({ style, ...props }: DefaultText["props"]) {
  return (
    <DefaultText style={[{ color: COLORS.foreground }, style]} {...props} />
  );
}

export function View({ style, ...props }: DefaultView["props"]) {
  return (
    <DefaultView
      style={[{ backgroundColor: COLORS.background }, style]}
      {...props}
    />
  );
}
