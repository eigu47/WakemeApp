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
  const d = Math.round(R * c * 1000);
  return d;
}

export function formatDistance(m: number) {
  const km = m / 1000;
  const abs = Math.abs(km);
  if (abs < 1) return `${m.toFixed(0)} m`;
  if (abs < 10) return `${km.toFixed(2)} Km`;
  if (abs < 100) return `${km.toFixed(1)} Km`;
  return `${km.toFixed(0)} Km`;
}

export function roundByMagnitude(n: number) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.max(magnitude, n - (n % (magnitude * 2)));
}

const testData: {
  latLng: LatLng;
  date: Date;
  time: string;
  totalDist: number;
  diffDist: number;
  totalTime: number;
  diffTime: number;
  address: Address;
}[] = [];

export function saveTest(latLng: LatLng, address: Address) {
  const first = testData[0];
  const last = testData.at(-1);
  const date = new Date();
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  if (!first || !last) {
    testData.push({
      latLng,
      date,
      time,
      totalDist: 0,
      diffDist: 0,
      totalTime: 0,
      diffTime: 0,
      address,
    });
  } else {
    const totalDist = +getDistance(latLng, first.latLng);
    const diffDist = +getDistance(latLng, last.latLng);
    const totalTime = +(
      (date.getTime() - first.date.getTime()) /
      (1000 * 60)
    ).toFixed(2);
    const diffTime = +(
      (date.getTime() - last.date.getTime()) /
      (1000 * 60)
    ).toFixed(2);

    testData.push({
      latLng,
      date,
      time,
      totalDist,
      diffDist,
      totalTime,
      diffTime,
      address,
    });
  }

  // eslint-disable-next-line no-console
  console.log(testData);
}
