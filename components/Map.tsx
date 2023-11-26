import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, {
  Circle,
  Marker,
  type LatLng,
  type Region,
} from "react-native-maps";

import * as Location from "expo-location";
import { useRouter } from "expo-router";

import { COLORS, hexToRgb } from "../constants/Colors";
import MapGps from "./MapGps";

const ZOOM = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function Map({ radius }: { radius: number }) {
  const [userLocation, setUserLocation] = useState<Location.LocationObject>();
  const [locations, setLocations] = useState<LatLng[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LatLng>();
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const region: Region | undefined = userLocation && {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    ...ZOOM,
  };

  const getLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      router.push({
        pathname: "/modal",
        params: {
          title: "Error",
          error: "Permission to access location was denied",
          body: "Please enable location services in your settings",
        },
      });
      return;
    }

    const location = await Location.getCurrentPositionAsync();
    setUserLocation(location);
  }, [router]);

  useEffect(() => {
    getLocation().catch(console.error);
  }, [getLocation]);

  return (
    <>
      <MapView
        ref={mapRef}
        region={region}
        style={styles.map}
        onLongPress={(e) => {
          setLocations([...locations, e.nativeEvent.coordinate]);
          setSelectedLocation(e.nativeEvent.coordinate);
          mapRef.current?.animateToRegion(
            {
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude,
              ...ZOOM,
            },
            500,
          );
        }}
        showsUserLocation
        rotateEnabled={false}
        toolbarEnabled={false}
        showsMyLocationButton={false}
      >
        {locations.map((loc, i) => (
          <Marker
            key={i}
            coordinate={loc}
            onPress={() => setSelectedLocation(loc)}
            opacity={selectedLocation === loc ? 1 : 0.7}
          />
        ))}
        {selectedLocation && (
          <Circle
            center={selectedLocation}
            radius={radius}
            fillColor={hexToRgb(COLORS.primary, 0.15)}
            strokeColor={hexToRgb(COLORS.ring, 0.5)}
          />
        )}
      </MapView>
      <MapGps mapRef={mapRef} region={region} getLocation={getLocation} />
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
