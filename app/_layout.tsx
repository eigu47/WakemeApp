import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useFonts } from "expo-font";
import {
  setBackgroundColorAsync,
  setButtonStyleAsync,
} from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";

import { OutsidePressProvider } from "../components/OutsidePress";
import { COLORS } from "../constants/Colors";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  setBackgroundColorAsync(COLORS.background).catch(console.error);
  setButtonStyleAsync("dark").catch(console.error);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <OutsidePressProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ThemeProvider
          value={{
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              primary: COLORS.primary,
              background: COLORS.background,
              text: COLORS.foreground,
              notification: COLORS.destructive,
            },
          }}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </OutsidePressProvider>
  );
}
