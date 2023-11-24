import { useEffect, useRef, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { BlurView } from "expo-blur";
import { FontAwesome } from "@expo/vector-icons";

import Colors from "../constants/Colors";
import AnimatedButton from "./AnimatedButton";
import { OutsidePress } from "./OutsidePress";

export default function SearchBar({
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
    <BlurView
      intensity={100}
      tint="light"
      style={[
        styles.blur,
        isKeyboardOpen && {
          borderColor: Colors.light.tint,
          backgroundColor: Colors.light.background,
          opacity: 0.8,
        },
      ]}
    >
      <OutsidePress
        onOutsidePress={() => {
          Keyboard.dismiss();
        }}
        style={styles.view}
        onPress={() => inputRef.current?.focus()}
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
            // TODO search
          }}
          buttonProps={{ disabled: !isKeyboardOpen || search.trim() === "" }}
          animatedProps={{
            style: { ...styles.button, opacity: isKeyboardOpen ? 1 : 0.5 },
          }}
        >
          <FontAwesome name="search" size={24} />
        </AnimatedButton>
      </OutsidePress>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    width: "80%",
    position: "absolute",
    overflow: "hidden",
    borderColor: "transparent",
    borderRadius: 20,
    borderWidth: 2,
    top: 10,
    zIndex: 1,
  },
  view: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
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
