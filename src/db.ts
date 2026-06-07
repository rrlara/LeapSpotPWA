import Dexie, { type Table } from "dexie";
import type { ObservationRecord } from "./types";

export class LeapSpotDatabase extends Dexie {
  observations!: Table<ObservationRecord, string>;

  constructor() {
    super("leapspot-pwa");
    this.version(1).stores({
      observations: "id, tripFile, timestamp, syncStatus, updatedAt"
    });
  }
}

export const db = new LeapSpotDatabase();
