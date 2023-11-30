import { type LatLng } from "react-native-maps";

export type GeocodeResponse = {
  results: {
    types: string[];
    formatted_address: string;
    adress_components: string[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    location_type: string;
    viewport: {
      northeast: LatLng;
      southwest: LatLng;
    };
    plus_code: {
      compound_code: string;
      global_code: string;
    };
    place_id: string;
  }[];
  status:
    | "OK"
    | "ZERO_RESULTS"
    | "OVER_DAILY_LIMIT"
    | "OVER_QUERY_LIMIT"
    | "REQUEST_DENIED"
    | "INVALID_REQUEST"
    | "UNKNOWN_ERROR";
};
