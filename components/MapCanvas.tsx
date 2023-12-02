import { StyleSheet } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

import { COLORS, hexToRgb } from "../constants/Colors";
import { useMapStore } from "../lib/mapStore";

export default function MapCanvas() {
  const mapRef = useMapStore((state) => state.mapRef);
  const onCanvasLongPress = useMapStore((state) => state.onCanvasLongPress);
  const onUserChangeLocation = useMapStore(
    (state) => state.onUserChangeLocation,
  );

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      onLongPress={onCanvasLongPress}
      showsUserLocation
      onUserLocationChange={onUserChangeLocation}
      followsUserLocation
      rotateEnabled={false}
      toolbarEnabled={false}
      showsMyLocationButton={false}
    >
      <SelectedMarker />
    </MapView>
  );
}

function SelectedMarker() {
  const selectedLocation = useMapStore((state) => state.selectedLocation);
  const radius = useMapStore((state) => state.radius);

  if (!selectedLocation) return null;
  return (
    <>
      <Marker coordinate={selectedLocation} />
      <Circle
        center={selectedLocation}
        radius={radius ?? 0}
        fillColor={hexToRgb(COLORS.primary, 0.15)}
        strokeColor={hexToRgb(COLORS.ring, 0.5)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
