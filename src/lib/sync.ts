import { CURRENT_TRIP_FILE, type GeoJsonFeatureCollection, type ObservationRecord } from "@/types";
import { serializeFeatureCollection } from "./geojson";

export async function uploadGeoJsonWithPresignedUrl(collection: GeoJsonFeatureCollection, presignedUrl: string): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "content-type": "application/geo+json"
    },
    body: serializeFeatureCollection(collection)
  });

  if (!response.ok) {
    throw new Error(`Upload failed with HTTP ${response.status}`);
  }
}

export function imageObjectName(observation: ObservationRecord): string {
  const safeId = observation.id.replace(/[^a-zA-Z0-9-]/g, "");
  return `2026/${safeId}-${observation.photoName || "photo.jpg"}`;
}

export const writableTripFileName = CURRENT_TRIP_FILE;
