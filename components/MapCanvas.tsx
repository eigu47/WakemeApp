import { useContext } from "react";
import { StyleSheet } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

import { COLORS, hexToRgb } from "../constants/Colors";
import { MapContext, SliderContext } from "./MapContext";

export default function MapCanvas() {
  const {
    mapRef,
    centerMap,
    selectedLocation,
    setSelectedLocation,
    setSelectedAddress,
    onUserChangeLocation,
  } = useContext(MapContext);

  const { visualRadius } = useContext(SliderContext);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      onLongPress={(e) => {
        setSelectedLocation(e.nativeEvent.coordinate);
        centerMap(e.nativeEvent.coordinate);
        setSelectedAddress(e.nativeEvent.coordinate).catch(console.error);
      }}
      showsUserLocation
      onUserLocationChange={onUserChangeLocation}
      followsUserLocation
      rotateEnabled={false}
      toolbarEnabled={false}
      showsMyLocationButton={false}
    >
      {selectedLocation && (
        <>
          <Marker coordinate={selectedLocation} />
          <Circle
            center={selectedLocation}
            radius={visualRadius ?? 0}
            fillColor={hexToRgb(COLORS.primary, 0.15)}
            strokeColor={hexToRgb(COLORS.ring, 0.5)}
          />
        </>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
