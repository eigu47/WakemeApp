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
import { type LatLng, type Region } from "react-native-maps";

import {
  getCurrentPositionAsync,
  PermissionStatus,
  requestForegroundPermissionsAsync,
} from "expo-location";

import { type Address, type GeocodeResponse } from "../type/geocode";

process.env.EXPO_PUBLIC_MAPS_API && setKey(process.env.EXPO_PUBLIC_MAPS_API);

const INITIAL_RADIUS = 1000;

export const MapContext = createContext<{
  userLocation?: LatLng;
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  getLocation: () => Promise<void>;
  selectedLocation?: LatLng;
  setSelectedLocation: Dispatch<SetStateAction<LatLng | undefined>>;
  mapRef?: RefObject<MapView>;
  centerMap: (latLng?: LatLng | undefined, duration?: number) => void;
  userRegion?: Region;
  searchPlaceById: (place: string) => Promise<void>;
  setAddress: (
    state: "user" | "selected",
    latLng: LatLng | null,
  ) => Promise<void>;
  userAddress?: Address;
  selectedAddress?: Address;
  countryCode?: string;
  isKeyboardOpen: boolean;
}>({
  radius: INITIAL_RADIUS,
  setRadius: () => {},
  getLocation: async () => {},
  setSelectedLocation: () => {},
  centerMap: () => {},
  searchPlaceById: async () => {},
  setAddress: async () => {},
  isKeyboardOpen: false,
});

export default function MapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [userAddress, setUserAddress] = useState<Address>();
  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [radius, setRadius] = useState(INITIAL_RADIUS);
  const [selectedLocation, setSelectedLocation] = useState<LatLng>();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const mapRef = useRef<MapView>(null);

  async function getLocation() {
    const { status } = await requestForegroundPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      return;
    }

    const location = await getCurrentPositionAsync();

    const latLng = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setUserLocation(latLng);
  }

  async function setAddress(state: "user" | "selected", latLng: LatLng | null) {
    if (!latLng) {
      if (state === "user") {
        setUserAddress(undefined);
      }
      if (state === "selected") {
        setSelectedAddress(undefined);
      }
      return;
    }

    const { results } = (await fromLatLng(
      latLng.latitude,
      latLng.longitude,
    )) as GeocodeResponse;

    if (results[0]) {
      if (state === "user") {
        setUserAddress(getAddress(results[0].address_components));
      }
      if (state === "selected") {
        setSelectedAddress(getAddress(results[0].address_components));
      }
    }
  }

  useEffect(() => {
    getLocation().catch(console.error);

    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardOpen(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardOpen(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const region: Region | undefined = userLocation && {
    ...userLocation,
    ...ZOOM,
  };

  function centerMap(latLng: LatLng | undefined = region, duration = 500) {
    latLng &&
      mapRef?.current?.animateToRegion({ ...latLng, ...ZOOM }, duration);
  }

  async function searchPlaceById(place: string) {
    const { results } = (await fromPlaceId(place)) as GeocodeResponse;
    const result = results[0];
    if (!result) return;

    const latLng = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };

    const adress = getAddress(result.address_components);

    setSelectedLocation(latLng);
    centerMap(latLng);
    setSelectedAddress(adress);
  }

  return (
    <MapContext.Provider
      value={{
        userLocation,
        radius,
        setRadius,
        getLocation,
        selectedLocation,
        setSelectedLocation,
        mapRef,
        centerMap,
        userRegion: region,
        searchPlaceById,
        setAddress,
        userAddress,
        selectedAddress,
        countryCode: userAddress?.[0]?.toLocaleLowerCase(),
        isKeyboardOpen,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

const ZOOM = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

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
    return acc;
  }, []);
}
