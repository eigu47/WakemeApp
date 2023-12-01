import { useContext } from "react";
import { StyleSheet } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

import { COLORS, hexToRgb } from "../constants/Colors";
import { MapContext, RadiusContext } from "./MapContext";

export default function MapCanvas() {
  const {
    mapRef,
    centerMap,
    userRegion,
    selectedLocation,
    setSelectedLocation,
    setSelectedAddress,
  } = useContext(MapContext);

  const { circleRadius: radius } = useContext(RadiusContext);

  return (
    <MapView
      ref={mapRef}
      region={userRegion}
      style={styles.map}
      onLongPress={(e) => {
        setSelectedLocation(e.nativeEvent.coordinate);
        centerMap(e.nativeEvent.coordinate);
        setSelectedAddress(e.nativeEvent.coordinate).catch(console.error);
      }}
      showsUserLocation
      rotateEnabled={false}
      toolbarEnabled={false}
      showsMyLocationButton={false}
    >
      {selectedLocation && (
        <>
          <Marker coordinate={selectedLocation} />
          <Circle
            center={selectedLocation}
            radius={radius ?? 0}
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
