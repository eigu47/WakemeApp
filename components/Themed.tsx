import {
  Appearance,
  Text as DefaultText,
  View as DefaultView,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { COLORS } from "../constants/Colors";

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
  const color = COLORS[theme].foreground;

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

export function DarkModeButton() {
  return (
    <Pressable
      style={[styles.button]}
      onPress={() => {
        Appearance.setColorScheme("light");
      }}
    >
      <MaterialCommunityIcons
        name="theme-light-dark"
        size={24}
        color="black"
        style={styles.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: "10%",
    left: 20,
    borderRadius: 50,
    borderWidth: 1,
    width: 40,
    height: 40,
    opacity: 0.8,
  },
  icon: {
    textAlign: "center",
    textAlignVertical: "center",
    height: "100%",
  },
});
