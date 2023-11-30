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
import type MapView from "react-native-maps";
import { type LatLng, type Region } from "react-native-maps";

import {
  getCurrentPositionAsync,
  PermissionStatus,
  requestForegroundPermissionsAsync,
} from "expo-location";

import { type Address, type GeocodeResponse } from "../type/geocode";

process.env.EXPO_PUBLIC_MAPS_API && setKey(process.env.EXPO_PUBLIC_MAPS_API);

export const MapContext = createContext<{
  userLocation?: LatLng;
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  getLocation: () => Promise<void>;
  selectedLocation?: LatLng;
  setSelectedLocation: Dispatch<SetStateAction<LatLng | undefined>>;
  mapRef: RefObject<MapView> | null;
  centerMap: (latLng?: LatLng | undefined, duration?: number) => void;
  userRegion?: Region;
  searchPlaceById: (place: string) => Promise<void>;
  getCurrentAddress: (latLng: LatLng | undefined) => Promise<void>;
  userAddress?: Address;
  selectedAddress?: Address;
}>({
  radius: 1000,
  setRadius: () => {},
  getLocation: async () => {},
  setSelectedLocation: () => {},
  mapRef: null,
  centerMap: () => {},
  userRegion: undefined,
  searchPlaceById: async () => {},
  getCurrentAddress: async () => {},
});

export default function MapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [userAddress, setUserAddress] = useState<Address>();
  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [radius, setRadius] = useState(1000);
  const [selectedLocation, setSelectedLocation] = useState<LatLng>();
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

  async function getCurrentAddress(latLng: LatLng | undefined) {
    if (!latLng) return;

    const { results } = (await fromLatLng(
      latLng.latitude,
      latLng.longitude,
    )) as GeocodeResponse;

    if (results[0]) {
      setUserAddress(getAdress(results[0].adress_components));
    }
  }

  useEffect(() => {
    getLocation().catch(console.error);
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

    const adress = getAdress(result.adress_components);

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
        getCurrentAddress,
        userAddress,
        selectedAddress,
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

function getAdress(
  adress: GeocodeResponse["results"][number]["adress_components"],
) {
  return adress.reduce((acc: Address, cur) => {
    if (cur.types.includes("country")) {
      acc.country = cur.long_name;
      return acc;
    }
    if (cur.types.includes("administrative_area_level_1")) {
      acc.area = cur.long_name;
      return acc;
    }
    if (cur.types.includes("locality")) {
      acc.locality = cur.long_name;
      return acc;
    }
    if (cur.types.includes("sublocality")) {
      acc.sublocality = cur.long_name;
      return acc;
    }
    return acc;
  }, {});
}
