import { type RefObject } from "react";
import { fromLatLng } from "react-geocode";
import { Alert, Vibration } from "react-native";
import type MapView from "react-native-maps";
import { type LatLng } from "react-native-maps";

import {
  GeofencingEventType,
  getBackgroundPermissionsAsync,
  hasStartedGeofencingAsync,
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

import {
  ANIMATE_CAMERA_DURATION,
  INITIAL_RADIUS,
  INITIAL_ZOOM,
  REFRESH_DISTANCE,
} from "../constants/Maps";
import { type Address, type GeocodeResponse } from "../type/geocode";
import { getPermission, useAppStore } from "./appStore";
import {
  formatDistance,
  getAddress,
  getDistance,
  getStringAddress,
  roundByMagnitude,
  saveTest,
} from "./helpers";

let lastLocation: LatLng | undefined;
let roundDistance: number | undefined;

export const useMapStore = create<{
  userLocation?: LatLng;
  selectedLocation?: LatLng;
  userAddress?: Address;
  selectedAddress?: Address;
  distance?: number;
  radius: number;
  followUser: boolean;
  mapRef: RefObject<MapView>;
  alarm: boolean;
}>()(() => ({
  userLocation: undefined,
  selectedLocation: undefined,
  userAddress: undefined,
  selectedAddress: undefined,
  distance: undefined,
  radius: INITIAL_RADIUS,
  followUser: true,
  mapRef: { current: null },
  alarm: false,
}));

export async function setUserAddress(latLng: LatLng, refreshDistance: number) {
  if (!lastLocation || getDistance(lastLocation, latLng) > refreshDistance) {
    const userAddress = await latLngToAddress(latLng);
    useMapStore.setState({ userAddress });
    lastLocation = latLng;

    saveTest(latLng, userAddress);
  }
}

export async function setSelectedAddress(latLng: LatLng) {
  const selectedAddress = await latLngToAddress(latLng);
  useMapStore.setState({ selectedAddress });
}

export function centerMap(
  latLng: LatLng,
  { duration, zoom }: { duration?: number; zoom?: number } = {
    duration: ANIMATE_CAMERA_DURATION,
  },
) {
  const { mapRef } = useMapStore.getState();
  mapRef.current
    ?.getCamera()
    .then(({ zoom: cameraZoom = 0 }) => {
      mapRef.current?.animateCamera(
        { center: latLng, zoom: cameraZoom < 11 ? INITIAL_ZOOM : zoom },
        { duration },
      );
    })
    .catch((e) => {
      console.error(e);
      mapRef.current?.animateCamera({ center: latLng, zoom }, { duration });
    });
}

export function checkDistance() {
  const { userLocation, selectedLocation, selectedAddress, alarm } =
    useMapStore.getState();
  if (!userLocation || !selectedLocation) {
    useMapStore.setState({ distance: undefined });
    roundDistance = undefined;
    return;
  }

  const distance = getDistance(userLocation, selectedLocation);
  useMapStore.setState({ distance });

  const rounded = Math.max(100, roundByMagnitude(distance));
  if (!selectedAddress || !alarm || roundDistance === rounded) return;

  roundDistance = rounded;

  dismissAllNotificationsAsync().catch(console.error);
  scheduleNotificationAsync({
    content: {
      title: `To: ${getStringAddress(selectedAddress)}`,
      body: `You are within ${formatDistance(distance)} of your destination`,
      sticky: true,
    },
    trigger: null,
  }).catch(console.error);
}

async function latLngToAddress(latLng: LatLng) {
  const { results } = (await fromLatLng(
    latLng.latitude,
    latLng.longitude,
  )) as GeocodeResponse;

  const components = results[0]?.address_components;
  if (!components) throw new Error("No address found");
  return getAddress(components);
}

export async function updateGeofencing() {
  const { selectedLocation, radius, alarm } = useMapStore.getState();
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

  useMapStore.setState({ alarm: false });
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
  roundDistance = undefined;
  Vibration.cancel();
  await dismissAllNotificationsAsync();
  const hasStarted = await hasStartedGeofencingAsync(GEOFENCING);
  if (hasStarted) {
    await stopGeofencingAsync(GEOFENCING);
  }
}
