import { type LatLng } from "react-native-maps";

import type * as Location from "expo-location";

export default function MapGeocoding({
  userLocation,
  locations,
}: {
  userLocation: Location.LocationObject;
  locations: LatLng[];
}) {
  return <div>MapGeocoding</div>;
}
