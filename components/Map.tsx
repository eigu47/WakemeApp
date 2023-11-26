import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, type LatLng } from "react-native-maps";

import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import COLORS from "../constants/Colors";
import AnimatedButton from "./AnimatedButton";

const ZOOM = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type LocacionType = LatLng & { range: number };

export default function Map() {
  const [userLocation, setUserLocation] = useState<Location.LocationObject>();
  const [locations, setLocations] = useState<LocacionType[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<LocacionType>();
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const region = userLocation && {
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
          setLocations([
            ...locations,
            { ...e.nativeEvent.coordinate, range: 500 },
          ]);
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
          <Marker key={i} coordinate={loc} />
        ))}
      </MapView>
      <AnimatedButton
        onPress={() => {
          mapRef.current?.animateToRegion(region!, 500);
          if (region) return;

          getLocation().catch(console.error);
        }}
        buttonProps={{
          style: [styles.button, !region && styles.disabled],
        }}
        animatedProps={{ style: styles.animated }}
      >
        <MaterialCommunityIcons
          style={styles.icon}
          name="crosshairs-gps"
          size={25}
        />
      </AnimatedButton>
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  animated: {
    position: "absolute",
    bottom: 15,
    right: 15,
  },
  button: {
    backgroundColor: COLORS.light.background,
    borderRadius: 50,
    borderColor: "rgba(0, 0, 0, 0.4)",
    borderWidth: 1,
    width: 40,
    height: 40,
    opacity: 0.8,
  },
  icon: {
    textAlign: "center",
    textAlignVertical: "center",
    height: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
});