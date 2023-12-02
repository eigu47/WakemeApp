import { fromPlaceId } from "react-geocode";
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
import { getAddress, latLngToAddress } from "./helpers";

let firstCenter = true;
let refreshTimes = 0;
let viewBoth = true;
let userZoom: number | undefined = undefined;

type MapState = {
  userLocation?: LatLng;
  selectedLocation?: LatLng;
  radius: number;
  keyboardIsOpen: boolean;
  followUser: boolean;
  mapRef: React.RefObject<MapView>;
  userAddress?: Address;
  setUserAddress: (latLng: LatLng | null) => Promise<void>;
  selectedAddress?: Address;
  setSelectedAddress: (latLng: LatLng | null) => Promise<void>;
  permissionDenied: boolean;
  getPermission: () => Promise<void>;
  centerMap: (
    latLng: LatLng,
    options?: { duration?: number; zoom?: number },
  ) => void;
  onSearchPlace: (e: GooglePlaceData) => void;
  onUserChangeLocation: (e: UserLocationChangeEvent) => void;
  onCanvasLongPress: (e: LongPressEvent) => void;
  onGPSButtonPress: () => void;
  onAddressPress: (inset: number) => void;
  setState: (
    state: Partial<Pick<MapState, "radius" | "keyboardIsOpen" | "followUser">>,
  ) => void;
};

export const useMapStore = create<MapState>()((set, get) => ({
  userLocation: undefined,
  selectedLocation: undefined,
  radius: INITIAL_RADIUS,
  keyboardIsOpen: false,
  followUser: false,
  mapRef: { current: null },

  userAddress: undefined,
  setUserAddress: async (latLng) =>
    latLngToAddress(latLng).then((userAddress) => set({ userAddress })),

  selectedAddress: undefined,
  setSelectedAddress: async (latLng) =>
    latLngToAddress(latLng).then((selectedAddress) => set({ selectedAddress })),

  permissionDenied: false,
  getPermission: async () =>
    requestForegroundPermissionsAsync().then(({ status }) =>
      set({ permissionDenied: status !== PermissionStatus.GRANTED }),
    ),

  centerMap: (
    latLng,
    { duration, zoom } = { duration: 750, zoom: undefined },
  ) =>
    get().mapRef.current?.animateCamera({ center: latLng, zoom }, { duration }),

  onSearchPlace: (e) => {
    const { centerMap } = get();
    fromPlaceId(e.place_id)
      .then(({ results }: GeocodeResponse) => {
        const result = results[0];
        if (!result) return;

        const latLng = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        centerMap(latLng);
        set({ selectedLocation: latLng });

        set({ selectedAddress: getAddress(result.address_components) });
      })
      .catch(console.error);
  },

  onUserChangeLocation: (e) => {
    const { centerMap, userAddress, setUserAddress, followUser } = get();
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;

    set({ userLocation: coords });

    if (!userAddress) {
      setUserAddress(coords).catch(console.error);
      refreshTimes = 0;

      if (firstCenter) {
        centerMap(coords, { zoom: 12, duration: 1000 });
        firstCenter = false;
      }
    }

    refreshTimes += 1;

    if (followUser) {
      centerMap(coords);

      if (refreshTimes % REFRESH_RATE === 0) {
        setUserAddress(coords).catch(console.error);
      }
    }
  },

  onCanvasLongPress: (e) => {
    const { centerMap, setSelectedAddress } = get();
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;

    set({ selectedLocation: coords });
    centerMap(coords);

    setSelectedAddress(coords).catch(console.error);
  },

  onGPSButtonPress: () => {
    const { userLocation, getPermission, centerMap, setUserAddress } = get();
    if (!userLocation) {
      getPermission().catch(console.error);
      return;
    }

    centerMap(userLocation);
    setUserAddress(userLocation).catch(console.error);
    set({ followUser: true });
    refreshTimes = 0;
  },

  onAddressPress: (inset) => {
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
