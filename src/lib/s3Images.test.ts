import { describe, expect, it } from "vitest";
import {
  imageUrlCandidatesForLegacyTimestamp,
  imageUrlCandidatesForMexicoTimestamp,
  imageUrlForLegacyTimestamp,
  imageUrlForMexicoTimestamp
} from "./s3Images";

describe("legacy S3 image URLs", () => {
  it("builds an encoded image URL from the old timestamp-based object name", () => {
    expect(imageUrlForLegacyTimestamp("2014-02-01 13:39:48 PST")).toBe(
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-02-01%2013%3A39%3A48%20PST.jpg"
    );
  });

  it("builds Mexico URLs with CST in the image object name", () => {
    expect(imageUrlForMexicoTimestamp("2014-01-02 10:12:31 PST")).toBe(
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-01-02%2010%3A12%3A31%20CST.jpg"
    );
  });

  it("returns Mexico image candidates with CST first and the original timezone second", () => {
    expect(imageUrlCandidatesForMexicoTimestamp("2014-01-02 10:12:31 PST")).toEqual([
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-01-02%2010%3A12%3A31%20CST.jpg",
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-01-02%2010%3A12%3A31%20PST.jpg",
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-01-02%2010%3A12%3A31%20PDT.jpg"
    ]);
  });

  it("dedupes Mexico candidates when the original timestamp already uses CST", () => {
    expect(imageUrlCandidatesForMexicoTimestamp("2014-01-02 10:12:31 CST")).toEqual([
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-01-02%2010%3A12%3A31%20CST.jpg",
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-01-02%2010%3A12%3A31%20PST.jpg",
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-01-02%2010%3A12%3A31%20PDT.jpg"
    ]);
  });

  it("returns SEA/legacy candidates with PST and PDT", () => {
    expect(imageUrlCandidatesForLegacyTimestamp("2014-02-01 13:39:48 PST")).toEqual([
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-02-01%2013%3A39%3A48%20PST.jpg",
      "https://s3-us-west-2.amazonaws.com/travels2013/2014-02-01%2013%3A39%3A48%20PDT.jpg"
    ]);
  });
});
