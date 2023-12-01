import { fromPlaceId } from "react-geocode";
import type MapView from "react-native-maps";
import { type LatLng, type UserLocationChangeEvent } from "react-native-maps";

import {
  PermissionStatus,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { create } from "zustand";

import { INITIAL_RADIUS, REFRESH_RATE, ZOOM } from "../constants/Maps";
import { type Address, type GeocodeResponse } from "../type/geocode";
import { getAddress, latLngToAddress } from "./helpers";

let firstCenter = true;
let refreshTimes = 0;

export const useMapStore = create<{
  userLocation?: LatLng;
  setUserLocation: (location: LatLng | undefined) => void;
  selectedLocation?: LatLng;
  setSelectedLocation: (location: LatLng | undefined) => void;
  userAddress?: Address;
  setUserAddress: (latLng: LatLng | null) => Promise<void>;
  selectedAddress?: Address;
  setSelectedAddress: (latLng: LatLng | null) => Promise<void>;
  radius: number;
  setRadius: (radius: number) => void;
  mapRef: React.RefObject<MapView>;
  setMapRef: (ref: React.RefObject<MapView>) => void;
  centerMap: (latLng: LatLng, duration?: number) => void;
  searchPlace: (place: string) => Promise<void>;
  onUserChangeLocation: (e: UserLocationChangeEvent) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  keyboardIsOpen: boolean;
  setKeyboardIsOpen: (isOpen: boolean) => void;
  followUser: boolean;
  setFollowUser: (follow: boolean) => void;
  permissionDenied: boolean;
  getPermission: () => Promise<void>;
}>((set, get) => ({
  userLocation: undefined,
  setUserLocation: (userLocation) => set({ userLocation }),

  selectedLocation: undefined,
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),

  userAddress: undefined,
  setUserAddress: async (latLng) =>
    latLngToAddress(latLng).then((userAddress) => set({ userAddress })),

  selectedAddress: undefined,
  setSelectedAddress: async (latLng) =>
    latLngToAddress(latLng).then((selectedAddress) => set({ selectedAddress })),

  radius: INITIAL_RADIUS,
  setRadius: (radius) => set({ radius }),

  mapRef: { current: null },
  setMapRef: (mapRef) => set({ mapRef }),

  centerMap: (latLng, duration = 750) =>
    get().mapRef.current?.animateToRegion(
      { ...latLng, latitudeDelta: get().zoom, longitudeDelta: get().zoom },
      duration,
    ),

  searchPlace: async (place) => {
    const { results } = (await fromPlaceId(place)) as GeocodeResponse;
    const result = results[0];
    if (!result) return;

    const latLng = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };

    get().centerMap(latLng);
    set({ selectedLocation: latLng });

    set({ selectedAddress: getAddress(result.address_components) });
  },

  onUserChangeLocation: (e) => {
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;

    set({ userLocation: coords });

    if (firstCenter) {
      get().centerMap(coords);
      get().setUserAddress(coords).catch(console.error);
      firstCenter = false;
    }

    refreshTimes += 1;

    if (get().followUser) {
      get().centerMap(coords);

      if (refreshTimes % REFRESH_RATE === 0) {
        get().setUserAddress(coords).catch(console.error);
      }
    }
  },

  zoom: ZOOM,
  setZoom: (zoom) => set({ zoom }),

  keyboardIsOpen: false,
  setKeyboardIsOpen: (keyboardIsOpen) => set({ keyboardIsOpen }),

  followUser: false,
  setFollowUser: (followUser) => set({ followUser }),

  permissionDenied: false,
  getPermission: async () =>
    requestForegroundPermissionsAsync().then(({ status }) =>
      set({ permissionDenied: status !== PermissionStatus.GRANTED }),
    ),
}));
