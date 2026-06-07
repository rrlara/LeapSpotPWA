const S3_IMAGE_BASE_URL = "https://s3-us-west-2.amazonaws.com/travels2013";

export function imageUrlForLegacyTimestamp(timestamp: string): string {
  return `${S3_IMAGE_BASE_URL}/${encodeURIComponent(`${timestamp}.jpg`)}`;
}

export function imageUrlForMexicoTimestamp(timestamp: string): string {
  return imageUrlForLegacyTimestamp(timestamp.replace(/\s+\S+$/, " CST"));
}

export function imageUrlCandidatesForLegacyTimestamp(timestamp: string): string[] {
  return imageUrlCandidatesForTimezones(timestamp, ["PST", "PDT"]);
}

export function imageUrlCandidatesForMexicoTimestamp(timestamp: string): string[] {
  return imageUrlCandidatesForTimezones(timestamp, ["CST", "PST", "PDT"]);
}

function imageUrlCandidatesForTimezones(timestamp: string, timezones: string[]): string[] {
  const timezoneUrls = timezones.map((timezone) => imageUrlForLegacyTimestamp(replaceTrailingTimezone(timestamp, timezone)));
  const originalUrl = imageUrlForLegacyTimestamp(timestamp);
  return Array.from(new Set([...timezoneUrls, originalUrl]));
}

function replaceTrailingTimezone(timestamp: string, timezone: string): string {
  return timestamp.replace(/\s+\S+$/, ` ${timezone}`);
}
