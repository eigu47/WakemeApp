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

import { requestForegroundPermissionsAsync } from "expo-location";

import { INITIAL_RADIUS, ZOOM } from "../constants/Maps";
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
  const [followUser, setFollowUser] = useState(true);
  const [radius, setRadius] = useState(INITIAL_RADIUS);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const mapRef = useRef<MapView>(null);
  const firstCenter = useRef(true);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardOpen(false);
    });

    requestForegroundPermissionsAsync().catch(console.error);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function onUserChangeLocation(e: UserLocationChangeEvent) {
    const coords = e.nativeEvent.coordinate;
    if (!coords) return;

    setUserLocation(coords);

    if (followUser || firstCenter.current) {
      centerMap(coords);
      firstCenter.current = false;
    }
  }

  function centerMap(latLng: LatLng, duration = 750) {
    mapRef?.current?.animateToRegion({ ...latLng, ...ZOOM }, duration);
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
        setUserAddress: (latLng: LatLng | null) =>
          latLngToAddress(latLng).then(setUserAddress),
        setSelectedAddress: (latLng: LatLng | null) =>
          latLngToAddress(latLng).then(setSelectedAddress),
        userAddress,
        selectedAddress,
        countryCode: userAddress?.[0]?.toLocaleLowerCase(),
        isKeyboardOpen,
        onUserChangeLocation,
        followUser,
        setFollowUser,
      }}
    >
      <RadiusContextProvider>{children}</RadiusContextProvider>
    </MapContext.Provider>
  );
}

// Separate context for radius to avoid rerendering the whole map
export const RadiusContext = createContext<{
  circleRadius: number;
  setCircleRadius: Dispatch<SetStateAction<number>>;
}>({
  circleRadius: INITIAL_RADIUS,
  setCircleRadius: () => {},
});

export function RadiusContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [circleRadius, setCircleRadius] = useState(INITIAL_RADIUS);

  return (
    <RadiusContext.Provider value={{ circleRadius, setCircleRadius }}>
      {children}
    </RadiusContext.Provider>
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
      const components = results[0]?.address_components;
      if (!components) throw new Error("No address found");

      return getAddress(components);
    },
  );
}
