import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db";
import { CURRENT_TRIP_FILE } from "@/types";
import { addObservation, clearObservations, deleteObservation, listObservations, updateObservation } from "./observationRepository";
import { observationsToFeatureCollection } from "@/lib/geojson";

describe("offline observations", () => {
  beforeEach(async () => {
    await clearObservations();
  });

  it("saves observations offline for Observations_2026.json", async () => {
    const saved = await addObservation({
      comment: "Saved offline",
      latitude: 47.66882,
      longitude: -122.38483
    });

    const observations = await listObservations();
    expect(observations).toHaveLength(1);
    expect(saved.tripFile).toBe(CURRENT_TRIP_FILE);
    expect(saved.syncStatus).toBe("pending");
  });

  it("edits and deletes offline observations", async () => {
    const saved = await addObservation({
      comment: "Original",
      latitude: 47,
      longitude: -122
    });

    await updateObservation(saved.id, {
      comment: "Updated",
      latitude: 48,
      longitude: -123
    });

    let observations = await listObservations();
    expect(observations[0].comment).toBe("Updated");
    expect(observations[0].syncStatus).toBe("pending");

    await deleteObservation(saved.id);
    observations = await listObservations();
    expect(observations).toHaveLength(0);
  });

  it("exports only current 2026 observations", async () => {
    await db.observations.put({
      id: "old-trip",
      tripFile: "Observations_SEA.json" as typeof CURRENT_TRIP_FILE,
      comment: "Should not export",
      latitude: 1,
      longitude: 2,
      timestamp: "2014-01-01T00:00:00.000Z",
      syncStatus: "uploaded",
      createdAt: "2014-01-01T00:00:00.000Z",
      updatedAt: "2014-01-01T00:00:00.000Z"
    });

    await addObservation({
      comment: "2026",
      latitude: 3,
      longitude: 4
    });

    const collection = observationsToFeatureCollection(await listObservations());
    expect(collection.features).toHaveLength(1);
    expect(collection.features[0].properties.comment).toBe("2026");
  });
});
