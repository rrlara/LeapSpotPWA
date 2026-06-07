import { describe, expect, it } from "vitest";
import { CURRENT_TRIP_FILE, type ObservationRecord } from "@/types";
import { observationToFeature, observationsToFeatureCollection, parseFeatureCollection } from "./geojson";

function record(overrides: Partial<ObservationRecord> = {}): ObservationRecord {
  return {
    id: "obs-1",
    tripFile: CURRENT_TRIP_FILE,
    comment: "A good place",
    latitude: 20.52521,
    longitude: -103.30387,
    timestamp: "2026-06-06T18:00:00.000Z",
    syncStatus: "pending",
    createdAt: "2026-06-06T18:00:00.000Z",
    updatedAt: "2026-06-06T18:00:00.000Z",
    ...overrides
  };
}

describe("geojson export", () => {
  it("exports point coordinates as longitude, latitude", () => {
    const feature = observationToFeature(record());
    expect(feature.geometry.coordinates).toEqual([-103.30387, 20.52521]);
  });

  it("exports a FeatureCollection for Observations_2026.json", () => {
    const collection = observationsToFeatureCollection([record()]);
    expect(collection).toMatchObject({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-103.30387, 20.52521]
          },
          properties: {
            comment: "A good place"
          }
        }
      ]
    });
  });

  it("validates historical FeatureCollections", () => {
    const collection = parseFeatureCollection({
      type: "FeatureCollection",
      features: [observationToFeature(record())]
    });

    expect(collection.features).toHaveLength(1);
  });
});
