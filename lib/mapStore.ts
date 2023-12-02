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
import { create } from "zustand";

import { BAR_HEIGHT, INITIAL_RADIUS, REFRESH_RATE } from "../constants/Maps";
import { type Address, type GeocodeResponse } from "../type/geocode";
import { getAddress, getDistance, saveTest } from "./helpers";

let firstCenter = true;
let locationRefresh = 0;
let viewBoth = true;
let userZoom: number | undefined = undefined;

type MapState = {
  userLocation?: LatLng;
  selectedLocation?: LatLng;
  userAddress?: Address;
  selectedAddress?: Address;
  radius: number;
  keyboardIsOpen: boolean;
  followUser: boolean;
  mapRef: RefObject<MapView>;
  distance?: number;
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
    state: Partial<Pick<MapState, "radius" | "keyboardIsOpen" | "followUser">>,
  ) => void;
};

export const useMapStore = create<MapState>()((set, get) => ({
  userLocation: undefined,
  selectedLocation: undefined,
  userAddress: undefined,
  selectedAddress: undefined,
  radius: INITIAL_RADIUS,
  keyboardIsOpen: false,
  followUser: false,
  mapRef: { current: null },

  distance: undefined,

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
    { duration, zoom } = { duration: 750, zoom: undefined },
  ) =>
    get().mapRef.current?.animateCamera({ center: latLng, zoom }, { duration }),

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
    const { centerMap, userAddress, followUser } = get();
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;
    const latLng = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    set({ userLocation: latLng });

    if (!userAddress) {
      setUserAddress(latLng);

      if (firstCenter) {
        centerMap(latLng, { zoom: 14, duration: 1000 });
        firstCenter = false;
      }
    }

    if (followUser) {
      centerMap(latLng);
    }

    locationRefresh += 1;

    if (locationRefresh % REFRESH_RATE === 0) {
      setUserAddress(latLng);
    }

    console.log("refresh", locationRefresh);
  },

  onCanvasLongPress: (e) => {
    const { centerMap } = get();
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;

    set({ selectedLocation: coords });
    centerMap(coords);

    setSelectedAddress(coords);
  },

  onGPSButtonPress: () => {
    const { userLocation, getPermission, centerMap } = get();
    if (!userLocation) {
      getPermission();
      return;
    }

    centerMap(userLocation);
    setUserAddress(userLocation);
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

function checkDistance() {
  const { userLocation, selectedLocation, radius } = useMapStore.getState();
  if (!userLocation || !selectedLocation) {
    useMapStore.setState({ distance: undefined });
    return;
  }

  const distance = getDistance(userLocation, selectedLocation);
  useMapStore.setState({ distance });

  if (distance < radius / 1000) {
    // TODO send notification
  }
}

function setUserAddress(latLng: LatLng) {
  latLngToAddress(latLng)
    .then((userAddress) => useMapStore.setState({ userAddress }))
    .catch(console.error);

  checkDistance();
  locationRefresh = 0;
  latLng && saveTest(latLng);
}

function setSelectedAddress(latLng: LatLng) {
  latLngToAddress(latLng)
    .then((selectedAddress) => useMapStore.setState({ selectedAddress }))
    .catch(console.error);

  checkDistance();
}
