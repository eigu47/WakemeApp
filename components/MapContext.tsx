import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  getCurrentPositionAsync,
  PermissionStatus,
  requestForegroundPermissionsAsync,
  type LocationObject,
} from "expo-location";

export const MapContext = createContext<{
  userLocation?: LocationObject;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  radius: number;
  setRadius: Dispatch<SetStateAction<number>>;
  getLocation: () => Promise<void>;
}>({
  search: "",
  setSearch: () => {},
  radius: 1000,
  setRadius: () => {},
  getLocation: async () => {},
});

export default function MapContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userLocation, setUserLocation] = useState<LocationObject>();
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState(1000);

  const getLocation = useCallback(async () => {
    const { status } = await requestForegroundPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      return;
    }

    const location = await getCurrentPositionAsync();
    setUserLocation(location);
  }, []);

  useEffect(() => {
    getLocation().catch(console.error);
  }, [getLocation]);

  return (
    <MapContext.Provider
      value={{
        userLocation,
        search,
        setSearch,
        radius,
        setRadius,
        getLocation,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}
