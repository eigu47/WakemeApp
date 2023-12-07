import { Alert, Linking } from "react-native";

import {
  PermissionStatus,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { create } from "zustand";

export const useAppStore = create<{
  keyboardIsOpen: boolean;
  appIsActive: boolean;
}>()(() => ({
  keyboardIsOpen: false,
  appIsActive: true,
}));

export async function getPermission() {
  const { status: foregroundStatus } =
    await requestForegroundPermissionsAsync();
  const { status: backgroundStatus } =
    await requestBackgroundPermissionsAsync();
  if (
    foregroundStatus !== PermissionStatus.GRANTED ||
    backgroundStatus !== PermissionStatus.GRANTED
  ) {
    Alert.alert(
      "Permission Error",
      "Please enable location permissions in settings",
      [
        {
          text: "Settings",
          onPress: () => {
            Linking.openSettings().catch(console.error);
          },
        },
        { text: "Cancel" },
        {
          text: "Try again",
          onPress: () => {
            getPermission().catch(console.error);
          },
        },
      ],
    );
  }
}
