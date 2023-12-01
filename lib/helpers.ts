import { fromLatLng } from "react-geocode";
import { type LatLng } from "react-native-maps";

import { type Address, type GeocodeResponse } from "../type/geocode";

export function getAddress(
  address: GeocodeResponse["results"][number]["address_components"],
) {
  return address.reduce((acc: Address, cur) => {
    if (cur.types.includes("country")) {
      acc[0] = cur.short_name;
      return acc;
    }
    if (cur.types.includes("administrative_area_level_1")) {
      acc[1] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("locality")) {
      acc[2] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("sublocality_level_1")) {
      acc[3] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("sublocality_level_2")) {
      acc[4] = cur.long_name;
      return acc;
    }
    if (cur.types.includes("administrative_area_level_2") && !acc[4]) {
      acc[4] = cur.long_name;
      return acc;
    }
    return acc;
  }, []);
}

export function latLngToAddress(latLng: LatLng | null) {
  if (!latLng) return Promise.resolve(undefined);

  return fromLatLng(latLng.latitude, latLng.longitude).then(
    ({ results }: GeocodeResponse) => {
      // console.log(results);
      const components = results[0]?.address_components;
      if (!components) throw new Error("No address found");

      return getAddress(components);
    },
  );
}

export function getStringAddress(address: Address) {
  const filter = address.filter((a) => a);
  const cutTo = Math.max(0, filter.length - 2);

  return filter.slice(cutTo).join(", ");
}