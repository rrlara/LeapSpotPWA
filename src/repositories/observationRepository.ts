import { db } from "@/db";
import { CURRENT_TRIP_FILE, type ObservationRecord } from "@/types";
import { createId } from "@/lib/id";

export interface NewObservationInput {
  comment: string;
  latitude: number;
  longitude: number;
  photo?: Blob;
  photoName?: string;
}

export function createObservationRecord(input: NewObservationInput, now = new Date()): ObservationRecord {
  const timestamp = now.toISOString();
  return {
    id: createId(),
    tripFile: CURRENT_TRIP_FILE,
    comment: input.comment.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    photo: input.photo,
    photoName: input.photoName,
    timestamp,
    syncStatus: "pending",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function addObservation(input: NewObservationInput): Promise<ObservationRecord> {
  const observation = createObservationRecord(input);
  await db.observations.put(observation);
  return observation;
}

export async function listObservations(): Promise<ObservationRecord[]> {
  return db.observations.where("tripFile").equals(CURRENT_TRIP_FILE).reverse().sortBy("timestamp");
}

export async function updateObservation(id: string, patch: Pick<ObservationRecord, "comment" | "latitude" | "longitude">): Promise<void> {
  await db.observations.update(id, {
    ...patch,
    syncStatus: "pending",
    syncError: undefined,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteObservation(id: string): Promise<void> {
  await db.observations.delete(id);
}

export async function markAllUploaded(): Promise<void> {
  const observations = await listObservations();
  await db.transaction("rw", db.observations, async () => {
    await Promise.all(
      observations.map((observation) =>
        db.observations.update(observation.id, {
          syncStatus: "uploaded",
          syncError: undefined,
          updatedAt: new Date().toISOString()
        })
      )
    );
  });
}

export async function clearObservations(): Promise<void> {
  await db.observations.clear();
}
