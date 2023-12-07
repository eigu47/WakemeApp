import { useEffect } from "react";
import { AppState, Keyboard } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { isDevice } from "expo-device";
import { useFonts } from "expo-font";
import { startLocationUpdatesAsync } from "expo-location";
import {
  setBackgroundColorAsync,
  setButtonStyleAsync,
} from "expo-navigation-bar";
import { setNotificationHandler } from "expo-notifications";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";

import Debug from "../components/Debug";
import { OutsidePressProvider } from "../components/OutsidePress";
import { COLORS } from "../constants/Colors";
import { REFRESH_DISTANCE } from "../constants/Maps";
import { getPermission, useAppStore } from "../lib/appStore";
import { LOCATION, setUserAddress, useMapStore } from "../lib/mapStore";

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

setNotificationHandler({
  // eslint-disable-next-line @typescript-eslint/require-await
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      useAppStore.setState({ keyboardIsOpen: true });
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      useAppStore.setState({ keyboardIsOpen: false });
    });

    const appSubscription = AppState.addEventListener("change", (state) => {
      if (!useAppStore.getState().appIsActive && state === "active") {
        onAppAwake().catch(console.error);
      }

      useAppStore.setState({ appIsActive: state === "active" });
    });

    getPermission().catch(console.error);

    startLocationUpdatesAsync(LOCATION, {
      // deferredUpdatesDistance: 100,
    }).catch(console.error);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      appSubscription.remove();
    };
  }, []);

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
        <StatusBar style="light" />
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
          {!isDevice && <Debug />}
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </OutsidePressProvider>
  );
}

async function onAppAwake() {
  const { userLocation } = useMapStore.getState();
  if (userLocation) {
    await setUserAddress(userLocation, REFRESH_DISTANCE / 4);
  }
}
