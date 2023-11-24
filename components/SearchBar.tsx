import { useEffect, useState } from "react";
import { Keyboard, StyleSheet } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import Colors from "../constants/Colors";

export default function SearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (search: string) => void;
}) {
  const [keyboardIsShow, setKeyboardIsShow] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardIsShow(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardIsShow(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <TextInput
      style={styles.input}
      value={search}
      onChangeText={setSearch}
      placeholder="Search"
      caretHidden={!keyboardIsShow}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "80%",
    backgroundColor: "#fff",
    position: "absolute",
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderColor: Colors.light.tint,
    borderWidth: 2,
    top: 15,
    zIndex: 1,
  },
});
