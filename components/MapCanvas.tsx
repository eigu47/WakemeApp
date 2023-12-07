import { StyleSheet } from "react-native";
import MapView, {
  Circle,
  Marker,
  type LongPressEvent,
} from "react-native-maps";

import { COLORS, hexToRgb } from "../constants/Colors";
import {
  centerMap,
  checkDistance,
  setSelectedAddress,
  useMapStore,
} from "../lib/mapStore";

export default function MapCanvas() {
  const mapRef = useMapStore((state) => state.mapRef);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      onLongPress={onCanvasLongPress}
      showsUserLocation
      // onUserLocationChange={onUserChangeLocation}
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

function onCanvasLongPress(e: LongPressEvent) {
  const coords = e.nativeEvent.coordinate;
  if (!coords) return;

  useMapStore.setState({ selectedLocation: coords });
  centerMap(coords);

  checkDistance();
  setSelectedAddress(coords).catch(console.error);
}

// function onUserChangeLocation(e: UserLocationChangeEvent) {
//   const { followUser } = get();
//   const coords = e.nativeEvent.coordinate;
//   if (!coords) return;
//   const latLng = {
//     latitude: coords.latitude,
//     longitude: coords.longitude,
//   };
//   set({ userLocation: latLng });
//   checkDistance();
//   if (followUser) {
//     centerMap(latLng);
//   }
//   setUserAddress(latLng, REFRESH_DISTANCE).catch(console.error);
// }

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
