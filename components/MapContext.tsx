import {
  createContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { fromLatLng, fromPlaceId, setKey } from "react-geocode";
import { Keyboard } from "react-native";
import type MapView from "react-native-maps";
import { type LatLng, type UserLocationChangeEvent } from "react-native-maps";

import {
  PermissionStatus,
  requestForegroundPermissionsAsync,
} from "expo-location";

import { INITIAL_RADIUS, REFRESH_RATE, ZOOM } from "../constants/Maps";
import { type Address, type GeocodeResponse } from "../type/geocode";

process.env.EXPO_PUBLIC_MAPS_API && setKey(process.env.EXPO_PUBLIC_MAPS_API);

export const MapContext = createContext<{
  userLocation?: LatLng;
  setUserLocation: Dispatch<SetStateAction<LatLng | undefined>>;
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  selectedLocation?: LatLng;
  setSelectedLocation: Dispatch<SetStateAction<LatLng | undefined>>;
  userAddress?: Address;
  setUserAddress: (latLng: LatLng | null) => Promise<void>;
  selectedAddress?: Address;
  setSelectedAddress: (latLng: LatLng | null) => Promise<void>;
  mapRef?: RefObject<MapView>;
  centerMap: (latLng: LatLng, duration?: number) => void;
  searchPlace: (place: string) => Promise<void>;
  countryCode?: string;
  isKeyboardOpen: boolean;
  onUserChangeLocation: (e: UserLocationChangeEvent) => void;
  followUser: boolean;
  setFollowUser: Dispatch<SetStateAction<boolean>>;
  zoom: number;
  setZoom: Dispatch<SetStateAction<number>>;
  permissionDenied: boolean;
  getPermission: () => Promise<void>;
}>({
  radius: INITIAL_RADIUS,
  setUserLocation: () => {},
  setRadius: () => {},
  setUserAddress: async () => {},
  setSelectedLocation: () => {},
  setSelectedAddress: async () => {},
  centerMap: () => {},
  searchPlace: async () => {},
  isKeyboardOpen: false,
  onUserChangeLocation: () => {},
  followUser: true,
  setFollowUser: () => {},
  zoom: ZOOM,
  setZoom: () => {},
  permissionDenied: false,
  getPermission: async () => {},
});

export function MapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [userAddress, setUserAddress] = useState<Address>();
  const [selectedLocation, setSelectedLocation] = useState<LatLng>();
  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [radius, setRadius] = useState(INITIAL_RADIUS);
  const [zoom, setZoom] = useState(ZOOM);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const mapRef = useRef<MapView>(null);
  const refreshTimes = useRef(0);
  const firstCenter = useRef(true);

  async function getPermission() {
    const { status } = await requestForegroundPermissionsAsync();
    if (status === PermissionStatus.GRANTED) {
      return setPermissionDenied(false);
    }

    setPermissionDenied(true);
  }

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardOpen(false);
    });

    getPermission().catch(console.error);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function setUserAddressFromLatLng(latLng: LatLng | null) {
    return latLngToAddress(latLng).then(setUserAddress);
  }

  function setSelectedAddressFromLatLng(latLng: LatLng | null) {
    return latLngToAddress(latLng).then(setSelectedAddress);
  }

  function onUserChangeLocation(e: UserLocationChangeEvent) {
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;

    setUserLocation(coords);

    if (firstCenter.current) {
      centerMap(coords);
      setUserAddressFromLatLng(coords).catch(console.error);
      firstCenter.current = false;
    }

    refreshTimes.current += 1;

    if (followUser) {
      centerMap(coords);

      if (refreshTimes.current % REFRESH_RATE === 0) {
        setUserAddressFromLatLng(coords).catch(console.error);
      }
    }
  }

  function centerMap(latLng: LatLng, duration = 750) {
    mapRef?.current?.animateToRegion(
      { ...latLng, latitudeDelta: zoom, longitudeDelta: zoom },
      duration,
    );
  }

  async function searchPlace(place: string) {
    const { results } = (await fromPlaceId(place)) as GeocodeResponse;
    const result = results[0];
    if (!result) return;

    const latLng = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };

    setSelectedLocation(latLng);
    centerMap(latLng);

    setSelectedAddress(getAddress(result.address_components));
  }

  return (
    <MapContext.Provider
      value={{
        userLocation,
        setUserLocation,
        radius,
        setRadius,
        selectedLocation,
        setSelectedLocation,
        mapRef,
        centerMap,
        searchPlace,
        setUserAddress: setUserAddressFromLatLng,
        setSelectedAddress: setSelectedAddressFromLatLng,
        userAddress,
        selectedAddress,
        countryCode: userAddress?.[0]?.toLocaleLowerCase(),
        isKeyboardOpen,
        onUserChangeLocation,
        followUser,
        setFollowUser,
        zoom,
        setZoom,
        permissionDenied,
        getPermission,
      }}
    >
      <SliderContextProvider>{children}</SliderContextProvider>
    </MapContext.Provider>
  );
}

// Separate context for sliders to avoid rerendering the whole map
export const SliderContext = createContext<{
  visualRadius: number;
  setVisualRadius: Dispatch<SetStateAction<number>>;
  visualZoom: number;
  setVisualZoom: Dispatch<SetStateAction<number>>;
}>({
  visualRadius: INITIAL_RADIUS,
  setVisualRadius: () => {},
  visualZoom: ZOOM,
  setVisualZoom: () => {},
});

export function SliderContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visualRadius, setVisualRadius] = useState(INITIAL_RADIUS);
  const [visualZoom, setVisualZoom] = useState(ZOOM);

  return (
    <SliderContext.Provider
      value={{ visualRadius, setVisualRadius, visualZoom, setVisualZoom }}
    >
      {children}
    </SliderContext.Provider>
  );
}

function getAddress(
  address: GeocodeResponse["results"][number]["address_components"],
) {
  return address.reduce((acc: Address, cur) => {
    if (cur.types.includes("country")) {
      acc[0] = cur.short_name;
      return acc;
    }
    if (cur.types.includes("administrative_area_level_1")) {
      acc[1] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("locality")) {
      acc[2] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("sublocality_level_1")) {
      acc[3] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("sublocality_level_2")) {
      acc[4] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("administrative_area_level_2") && !acc[4]) {
      acc[4] = cur.long_name;
      return acc;
    }
    return acc;
  }, []);
}

function latLngToAddress(latLng: LatLng | null) {
  if (!latLng) return Promise.resolve(undefined);

  return fromLatLng(latLng.latitude, latLng.longitude).then(
    ({ results }: GeocodeResponse) => {
      console.log(results);
      const components = results[0]?.address_components;
      if (!components) throw new Error("No address found");

      return getAddress(components);
    },
  );
}
