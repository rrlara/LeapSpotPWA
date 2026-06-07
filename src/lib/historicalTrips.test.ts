import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parseFeatureCollection } from "./geojson";

describe("historical trip files", () => {
  it.each([
    ["public/Observations_SEA.json", 169],
    ["public/Observations_Mexico.json", 144]
  ])("loads %s as read-only GeoJSON", (fileName, expectedCount) => {
    const json = JSON.parse(readFileSync(fileName, "utf8"));
    const collection = parseFeatureCollection(json);

    expect(collection.type).toBe("FeatureCollection");
    expect(collection.features).toHaveLength(expectedCount);
  });
});
