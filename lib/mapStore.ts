import { type RefObject } from "react";
import { fromLatLng, fromPlaceId } from "react-geocode";
import { type GooglePlaceData } from "react-native-google-places-autocomplete";
import type MapView from "react-native-maps";
import {
  type LatLng,
  type LongPressEvent,
  type UserLocationChangeEvent,
} from "react-native-maps";

import {
  PermissionStatus,
  requestForegroundPermissionsAsync,
} from "expo-location";
import {
  dismissAllNotificationsAsync,
  scheduleNotificationAsync,
} from "expo-notifications";
import { create } from "zustand";

import {
  ANIMATE_CAMERA_DURATION,
  BAR_HEIGHT,
  INITIAL_RADIUS,
  INITIAL_ZOOM,
  REFRESH_DISTANCE,
} from "../constants/Maps";
import { type Address, type GeocodeResponse } from "../type/geocode";
import {
  formatDistance,
  getAddress,
  getDistance,
  getStringAddress,
  roundByMagnitude,
} from "./helpers";

let lastLocation: LatLng | undefined;
let viewBoth = true;
let userZoom: number | undefined;
let roundDistance: number | undefined;

type MapState = {
  userLocation?: LatLng;
  selectedLocation?: LatLng;
  userAddress?: Address;
  selectedAddress?: Address;
  radius: number;
  keyboardIsOpen: boolean;
  followUser: boolean;
  distance?: number;
  mapRef: RefObject<MapView>;
  appIsActive: boolean;
  onAppAwake: () => void;
  alarm: boolean;
  switchAlarm: () => void;
  permissionDenied: boolean;
  getPermission: () => void;
  centerMap: (
    latLng: LatLng,
    options?: { duration?: number; zoom?: number },
  ) => void;
  onSearchPlace: (e: GooglePlaceData) => Promise<void>;
  onUserChangeLocation: (e: UserLocationChangeEvent) => void;
  onCanvasLongPress: (e: LongPressEvent) => void;
  onGPSButtonPress: () => void;
  changeView: (inset: number) => void;
  setState: (
    state: Partial<
      Pick<MapState, "radius" | "keyboardIsOpen" | "followUser" | "appIsActive">
    >,
  ) => void;
};

export const useMapStore = create<MapState>()((set, get) => ({
  userLocation: undefined,
  selectedLocation: undefined,
  userAddress: undefined,
  selectedAddress: undefined,
  radius: INITIAL_RADIUS,
  keyboardIsOpen: false,
  followUser: true,
  distance: undefined,
  mapRef: { current: null },

  appIsActive: true,
  onAppAwake: () => {
    const { userLocation } = get();
    if (!userLocation) return;

    setUserAddress(userLocation, REFRESH_DISTANCE / 4).catch(console.error);
  },

  alarm: false,
  switchAlarm: () => {
    const { alarm } = get();

    if (!alarm) {
      checkDistance();
    } else {
      roundDistance = undefined;
      dismissAllNotificationsAsync().catch(console.error);
    }

    set({ alarm: !alarm });
  },

  permissionDenied: false,
  getPermission: () => {
    requestForegroundPermissionsAsync()
      .then(({ status }) =>
        set({ permissionDenied: status !== PermissionStatus.GRANTED }),
      )
      .catch((e) => {
        console.error(e);
        set({ permissionDenied: true });
      });
  },

  centerMap: (
    latLng,
    { duration, zoom } = { duration: ANIMATE_CAMERA_DURATION, zoom: undefined },
  ) => {
    const { mapRef } = get();
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
  },

  onSearchPlace: async (e) => {
    const { centerMap } = get();
    const { results } = (await fromPlaceId(e.place_id)) as GeocodeResponse;
    const result = results[0];
    if (!result) return;

    const latLng = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };

    centerMap(latLng);
    set({ selectedLocation: latLng });
    set({ selectedAddress: getAddress(result.address_components) });
    checkDistance();
  },

  onUserChangeLocation: (e) => {
    const { centerMap, followUser } = get();
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;
    const latLng = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    set({ userLocation: latLng });
    checkDistance();

    if (followUser) {
      centerMap(latLng);
    }

    setUserAddress(latLng, REFRESH_DISTANCE).catch(console.error);
  },

  onCanvasLongPress: (e) => {
    const { centerMap } = get();
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;

    set({ selectedLocation: coords });
    centerMap(coords);

    checkDistance();
    setSelectedAddress(coords).catch(console.error);
  },

  onGPSButtonPress: () => {
    const { userLocation, getPermission, centerMap } = get();
    if (!userLocation) {
      getPermission();
      return;
    }

    centerMap(userLocation);
    setUserAddress(userLocation, REFRESH_DISTANCE / 4).catch(console.error);
    set({ followUser: true });
  },

  changeView: (inset) => {
    const { selectedLocation, userLocation, mapRef, centerMap } = get();
    if (!userLocation && selectedLocation) {
      centerMap(selectedLocation);
    }

    if (userLocation && selectedLocation) {
      if (viewBoth) {
        mapRef.current
          ?.getCamera()
          .then(({ zoom }) => (userZoom = zoom))
          .catch(console.error);

        mapRef?.current?.fitToCoordinates([selectedLocation, userLocation], {
          edgePadding: {
            top: inset + BAR_HEIGHT + 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
        viewBoth = false;
        return;
      }

      if (!viewBoth) {
        centerMap(selectedLocation, { zoom: userZoom });
        viewBoth = true;
      }
    }
  },

  setState: (state) => set(state),
}));

async function latLngToAddress(latLng: LatLng) {
  const { results } = (await fromLatLng(
    latLng.latitude,
    latLng.longitude,
  )) as GeocodeResponse;

  const components = results[0]?.address_components;
  if (!components) throw new Error("No address found");
  return getAddress(components);
}

async function setUserAddress(latLng: LatLng, refreshDistance: number) {
  if (!lastLocation || getDistance(lastLocation, latLng) > refreshDistance) {
    const userAddress = await latLngToAddress(latLng);
    useMapStore.setState({ userAddress });
    lastLocation = latLng;

    // saveTest(latLng, userAddress);
  }
}

async function setSelectedAddress(latLng: LatLng) {
  const selectedAddress = await latLngToAddress(latLng);
  useMapStore.setState({ selectedAddress });
}

function checkDistance() {
  const { userLocation, selectedLocation, radius, alarm, selectedAddress } =
    useMapStore.getState();
  if (!userLocation || !selectedLocation) {
    useMapStore.setState({ distance: undefined });
    roundDistance = undefined;
    return;
  }

  const distance = getDistance(userLocation, selectedLocation);
  useMapStore.setState({ distance });

  if (!alarm) return;

  if (distance < radius) {
    // TODO send notification
  }

  const rounded = Math.max(100, roundByMagnitude(distance));
  if (selectedAddress && roundDistance !== rounded) {
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

    // useDebugStore.setState({ roundDistance: rounded });
  }
}
