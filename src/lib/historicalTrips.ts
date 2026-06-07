import { HISTORICAL_TRIPS, type HistoricalTripLayer } from "@/types";
import { parseFeatureCollection } from "./geojson";

export async function loadHistoricalTrips(fetcher: typeof fetch = fetch): Promise<HistoricalTripLayer[]> {
  return Promise.all(
    HISTORICAL_TRIPS.map(async (trip) => {
      const response = await fetcher(`/${trip.fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${trip.fileName}`);
      }
      const collection = parseFeatureCollection(await response.json());
      return {
        ...trip,
        collection
      };
    })
  );
}
