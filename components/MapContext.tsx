import {
  createContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { fromPlaceId, setKey } from "react-geocode";
import type MapView from "react-native-maps";
import { type LatLng, type Region } from "react-native-maps";

import {
  getCurrentPositionAsync,
  PermissionStatus,
  requestForegroundPermissionsAsync,
  type LocationObject,
} from "expo-location";

import { type GeocodeResponse } from "../type/geocode";

process.env.EXPO_PUBLIC_MAPS_API && setKey(process.env.EXPO_PUBLIC_MAPS_API);

export const MapContext = createContext<{
  userLocation?: LocationObject;
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  getLocation: () => Promise<void>;
  selectedLocation?: LatLng;
  setSelectedLocation: Dispatch<SetStateAction<LatLng | undefined>>;
  mapRef: RefObject<MapView> | null;
  centerMap: (latLng?: LatLng | undefined, duration?: number) => void;
  userRegion?: Region;
  searchPlaceById: (place: string) => void;
}>({
  radius: 1000,
  setRadius: () => {},
  getLocation: async () => {},
  setSelectedLocation: () => {},
  mapRef: null,
  centerMap: () => {},
  userRegion: undefined,
  searchPlaceById: () => {},
});

export default function MapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userLocation, setUserLocation] = useState<LocationObject>();
  const [radius, setRadius] = useState(1000);
  const [selectedLocation, setSelectedLocation] = useState<LatLng>();
  const mapRef = useRef<MapView>(null);

  async function getLocation() {
    const { status } = await requestForegroundPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      return;
    }

    const location = await getCurrentPositionAsync();
    setUserLocation(location);
  }

  useEffect(() => {
    getLocation().catch(console.error);
  }, []);

  const region: Region | undefined = userLocation && {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    ...ZOOM,
  };

  function centerMap(latLng: LatLng | undefined = region, duration = 500) {
    latLng &&
      mapRef?.current?.animateToRegion({ ...latLng, ...ZOOM }, duration);
  }

  function searchPlaceById(place: string) {
    fromPlaceId(place)
      .then(({ results }: GeocodeResponse) => {
        const result = results[0];
        if (!result) return;

        const latLng = {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        setSelectedLocation(latLng);
        centerMap(latLng);
      })
      .catch(console.error);
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
