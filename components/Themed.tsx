import {
  Text as DefaultText,
  View as DefaultView,
  useColorScheme,
} from "react-native";

import COLORS from "../constants/Colors";

export function Text({
  style,
  light,
  dark,
  ...props
}: {
  light?: DefaultText["props"]["style"];
  dark?: DefaultText["props"]["style"];
} & DefaultText["props"]) {
  const theme = useColorScheme() ?? "light";
  const themeStyle = theme === "light" ? light : dark;
  const color = COLORS[theme].text;

  return <DefaultText style={[style, { color }, themeStyle]} {...props} />;
}

export function View({
  style,
  light,
  dark,
  ...props
}: {
  light?: DefaultView["props"]["style"];
  dark?: DefaultView["props"]["style"];
} & DefaultView["props"]) {
  const theme = useColorScheme() ?? "light";
  const themeStyle = theme === "light" ? light : dark;
  const backgroundColor = COLORS[theme].background;

  return (
    <DefaultView style={[style, { backgroundColor }, themeStyle]} {...props} />
  );
}
