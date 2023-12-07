import { type RefObject } from "react";
import { fromLatLng } from "react-geocode";
import type MapView from "react-native-maps";
import { type LatLng } from "react-native-maps";

import {
  dismissAllNotificationsAsync,
  scheduleNotificationAsync,
} from "expo-notifications";
import { create } from "zustand";

import {
  ANIMATE_CAMERA_DURATION,
  INITIAL_RADIUS,
  INITIAL_ZOOM,
} from "../constants/Maps";
import { type Address, type GeocodeResponse } from "../type/geocode";
import { useAppStore } from "./appStore";
import {
  formatDistance,
  getAddress,
  getDistance,
  getStringAddress,
  roundByMagnitude,
  saveTest,
} from "./helpers";

export const useMapStore = create<{
  userLocation?: LatLng;
  selectedLocation?: LatLng;
  userAddress?: Address;
  selectedAddress?: Address;
  distance?: number;
  radius: number;
  followUser: boolean;
  mapRef: RefObject<MapView>;
  lastLocation?: LatLng;
  roundDistance?: number;
}>()(() => ({
  userLocation: undefined,
  selectedLocation: undefined,
  userAddress: undefined,
  selectedAddress: undefined,
  distance: undefined,
  radius: INITIAL_RADIUS,
  followUser: true,
  mapRef: { current: null },
  lastLocation: undefined,
  roundDistance: undefined,
}));

export async function setUserAddress(latLng: LatLng, refreshDistance: number) {
  let { lastLocation } = useMapStore.getState();
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
  const { userLocation, selectedLocation, selectedAddress, roundDistance } =
    useMapStore.getState();
  const { alarm } = useAppStore.getState();
  if (!userLocation || !selectedLocation) {
    useMapStore.setState({ distance: undefined, roundDistance: undefined });
    return;
  }

  const distance = getDistance(userLocation, selectedLocation);
  useMapStore.setState({ distance });

  const rounded = Math.max(100, roundByMagnitude(distance));
  if (!selectedAddress || !alarm || roundDistance === rounded) return;

  useMapStore.setState({ roundDistance: rounded });

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
