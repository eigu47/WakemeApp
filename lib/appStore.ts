import { Alert, Linking, Vibration } from "react-native";

import {
  GeofencingEventType,
  getBackgroundPermissionsAsync,
  hasStartedGeofencingAsync,
  PermissionStatus,
  requestBackgroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  startGeofencingAsync,
  stopGeofencingAsync,
  type LocationObject,
} from "expo-location";
import {
  dismissAllNotificationsAsync,
  scheduleNotificationAsync,
} from "expo-notifications";
import { defineTask } from "expo-task-manager";
import { create } from "zustand";

import { REFRESH_DISTANCE } from "../constants/Maps";
import { formatDistance, getStringAddress } from "./helpers";
import {
  centerMap,
  checkDistance,
  setUserAddress,
  useMapStore,
} from "./mapStore";

export const useAppStore = create<{
  keyboardIsOpen: boolean;
  appIsActive: boolean;
  alarm: boolean;
}>()(() => ({
  keyboardIsOpen: false,
  appIsActive: true,
  alarm: false,
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

export async function updateGeofencing() {
  const { selectedLocation, radius } = useMapStore.getState();
  const { alarm } = useAppStore.getState();
  if (!alarm || !selectedLocation) return;

  const { granted } = await getBackgroundPermissionsAsync();
  if (!granted) {
    await getPermission();
  }

  const geofencingHasStarted = await hasStartedGeofencingAsync(GEOFENCING);
  if (geofencingHasStarted) {
    await stopGeofencingAsync(GEOFENCING);
  }

  await startGeofencingAsync(GEOFENCING, [
    {
      ...selectedLocation,
      radius,
      notifyOnEnter: true,
      notifyOnExit: false,
    },
  ]);
}

const GEOFENCING = "geofencing-enter";
defineTask<{ eventType: GeofencingEventType }>(GEOFENCING, ({ data }) => {
  const { selectedAddress, radius, selectedLocation } = useMapStore.getState();
  if (
    data.eventType !== GeofencingEventType.Enter ||
    !selectedAddress ||
    !selectedLocation
  )
    return;

  dismissAllNotificationsAsync().catch(console.error);
  scheduleNotificationAsync({
    content: {
      title: `To: ${getStringAddress(selectedAddress)}`,
      body: `You are within ${formatDistance(radius)} of your destination`,
      sticky: true,
    },
    trigger: null,
  }).catch(console.error);
  centerMap(selectedLocation);

  Vibration.vibrate([1000, 1000], true);
  Alert.alert(
    "You have arrived!",
    `You are at ${formatDistance(
      radius,
    )} of your destination ${getStringAddress(selectedAddress)}`,
    [
      {
        text: "OK",
        onPress: () => {
          dismissAlert().catch(console.error);
        },
      },
    ],
    {
      cancelable: true,
      onDismiss: () => {
        dismissAlert().catch(console.error);
      },
    },
  );

  useAppStore.setState({ alarm: false });
});

export const LOCATION = "update-notification";
defineTask<{ locations: LocationObject[] }>(LOCATION, ({ data }) => {
  if (!data.locations[0]) return;

  const { latitude, longitude } = data.locations[0].coords;
  const latLng = { latitude, longitude };

  useMapStore.setState({ userLocation: latLng });
  checkDistance();

  const { followUser } = useMapStore.getState();
  const { appIsActive } = useAppStore.getState();

  if (followUser) {
    centerMap(latLng);
  }

  if (appIsActive) {
    setUserAddress(latLng, REFRESH_DISTANCE).catch(console.error);
  }
});

export async function dismissAlert() {
  Vibration.cancel();
  useMapStore.setState({ roundDistance: undefined });
  await dismissAllNotificationsAsync();
  const hasStarted = await hasStartedGeofencingAsync(GEOFENCING);
  if (hasStarted) {
    await stopGeofencingAsync(GEOFENCING);
  }
}
