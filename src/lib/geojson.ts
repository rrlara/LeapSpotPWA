import { CURRENT_TRIP_FILE, type GeoJsonFeature, type GeoJsonFeatureCollection, type ObservationRecord } from "@/types";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short"
});

function partMap(date: Date) {
  return Object.fromEntries(timestampFormatter.formatToParts(date).map((part) => [part.type, part.value]));
}

export function formatGeoJsonTimestamp(isoTimestamp: string): string {
  const parts = partMap(new Date(isoTimestamp));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} ${parts.timeZoneName}`;
}

export function observationToFeature(observation: ObservationRecord): GeoJsonFeature {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [observation.longitude, observation.latitude]
    },
    properties: {
      timestamp: formatGeoJsonTimestamp(observation.timestamp),
      comment: observation.comment
    }
  };
}

export function observationsToFeatureCollection(observations: ObservationRecord[]): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: observations
      .filter((observation) => observation.tripFile === CURRENT_TRIP_FILE)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .map(observationToFeature)
  };
}

export function serializeFeatureCollection(collection: GeoJsonFeatureCollection): string {
  return `${JSON.stringify(collection, null, 2)}\n`;
}

export function parseFeatureCollection(input: unknown): GeoJsonFeatureCollection {
  if (!input || typeof input !== "object") {
    throw new Error("GeoJSON must be an object");
  }

  const collection = input as GeoJsonFeatureCollection;
  if (collection.type !== "FeatureCollection" || !Array.isArray(collection.features)) {
    throw new Error("GeoJSON must be a FeatureCollection");
  }

  for (const feature of collection.features) {
    if (feature.type !== "Feature" || feature.geometry?.type !== "Point" || !Array.isArray(feature.geometry.coordinates)) {
      throw new Error("Only point FeatureCollections are supported");
    }
  }

  return collection;
}

export function downloadGeoJson(collection: GeoJsonFeatureCollection, fileName = CURRENT_TRIP_FILE): void {
  const blob = new Blob([serializeFeatureCollection(collection)], { type: "application/geo+json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
