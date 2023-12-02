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

export function getStringAddress(address: Address) {
  const filter = address.filter((a) => a);
  const cutTo = Math.max(0, filter.length - 2);

  return filter.slice(cutTo).join(", ");
}

export function getDistance(from: LatLng, to: LatLng) {
  const R = 6371;
  const dLat = (to.latitude - from.latitude) * (Math.PI / 180);
  const dLon = (to.longitude - from.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.latitude * (Math.PI / 180)) *
      Math.cos(to.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = Math.round(R * c * 100) / 100;
  return d;
}

export function formatDistance(n: number) {
  const abs = Math.abs(n);
  if (abs < 1) return `${(n * 1000).toFixed(0)} m`;
  if (abs < 10) return `${n.toFixed(2)} Km`;
  if (abs < 100) return `${n.toFixed(1)} Km`;
  return `${n.toFixed(0)} Km`;
}

const testData: {
  latLng: LatLng;
  date: Date;
  totalDist: number;
  diffDist: number;
  totalTime: number;
  diffTime: number;
}[] = [];

export function saveTest(latLng: LatLng) {
  const first = testData[0];
  const last = testData.at(-1);
  const date = new Date();

  if (!first || !last) {
    testData.push({
      latLng,
      date,
      totalDist: 0,
      diffDist: 0,
      totalTime: 0,
      diffTime: 0,
    });
  } else {
    const totalDist = Math.round(getDistance(latLng, first.latLng) / 1000);
    const diffDist = Math.round(getDistance(latLng, last.latLng) / 1000);
    const totalTime = Math.round(
      (date.getTime() - last.date.getTime()) / (1000 * 60),
    );
    const diffTime = Math.round(
      (date.getTime() - last.date.getTime()) / (1000 * 60),
    );
    testData.push({ latLng, date, totalDist, diffDist, totalTime, diffTime });
  }

  // eslint-disable-next-line no-console
  console.log(testData);
}
