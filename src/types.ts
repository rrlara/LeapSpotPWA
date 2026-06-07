export const CURRENT_TRIP_FILE = "Observations_2026.json" as const;

export const HISTORICAL_TRIPS = [
  {
    id: "sea",
    label: "Southeast Asia",
    fileName: "Observations_SEA.json",
    color: "#0f766e"
  },
  {
    id: "mexico",
    label: "Mexico",
    fileName: "Observations_Mexico.json",
    color: "#c2410c"
  }
] as const;

export type SyncStatus = "pending" | "uploaded" | "error";

export interface ObservationRecord {
  id: string;
  tripFile: typeof CURRENT_TRIP_FILE;
  comment: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  photo?: Blob;
  photoName?: string;
  syncStatus: SyncStatus;
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    timestamp: string;
    comment: string;
  };
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface HistoricalTripLayer {
  id: string;
  label: string;
  fileName: string;
  color: string;
  collection: GeoJsonFeatureCollection;
}
