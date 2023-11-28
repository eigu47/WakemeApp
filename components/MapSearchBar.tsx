import { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { FontAwesome } from "@expo/vector-icons";

import { COLORS } from "../constants/Colors";
import AnimatedButton from "./AnimatedButton";
import { OutsidePress } from "./OutsidePress";

export default function MapSearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <OutsidePress
      onOutsidePress={() => {
        Keyboard.dismiss();
      }}
      style={[styles.view, isKeyboardOpen && styles.onKeyOpen]}
      onTouchStart={() => inputRef.current?.focus()}
    >
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={search}
        onChangeText={setSearch}
        placeholder="Search"
        caretHidden={!isKeyboardOpen}
      />
      <AnimatedButton
        onPress={() => {
          //
        }}
        style={{ ...styles.button, opacity: isKeyboardOpen ? 1 : 0.5 }}
        disabled={!isKeyboardOpen || search.trim() === ""}
      >
        <FontAwesome name="search" size={24} />
      </AnimatedButton>
    </OutsidePress>
  );
}

const styles = StyleSheet.create({
  view: {
    overflow: "hidden",
    borderColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    top: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  onKeyOpen: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.foreground,
  },
  input: {
    fontSize: 15,
    flexGrow: 1,
    paddingLeft: 10,
    paddingRight: 35,
    paddingVertical: 2,
  },
  button: {
    position: "absolute",
    right: 0,
    flexShrink: 0,
    marginHorizontal: 6,
  },
});
