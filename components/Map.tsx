import { useContext, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, {
  Circle,
  Marker,
  type LatLng,
  type Region,
} from "react-native-maps";

import { COLORS, hexToRgb } from "../constants/Colors";
import { MapContext } from "./MapContext";
import MapGpsButton from "./MapGpsButton";

const ZOOM = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function Map() {
  const { radius, userLocation } = useContext(MapContext);

  const [locations, setLocations] = useState<LatLng[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LatLng>();
  const mapRef = useRef<MapView>(null);

  const region: Region | undefined = userLocation && {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    ...ZOOM,
  };

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
            radius={radius ?? 0}
            fillColor={hexToRgb(COLORS.primary, 0.15)}
            strokeColor={hexToRgb(COLORS.ring, 0.5)}
          />
        )}
      </MapView>
      <MapGpsButton mapRef={mapRef} region={region} />
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
