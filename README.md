# LeapSpotPWA

Offline-first Vue 3 PWA for recording travel observations and viewing historical LeapSpot GeoJSON layers.

## Features

- Save 2026 observations offline with comment, location, and optional photo.
- View Southeast Asia, Mexico, and 2026 observations on a Leaflet map with CARTO basemap tiles.
- Show historical S3 images in map popups with timezone fallback candidates.
- Preview `Observations_2026.json` for future S3 upload wiring.

## Development

```sh
pnpm install
pnpm dev
```

For phone testing on the same network:

```sh
pnpm exec vite --host 0.0.0.0 --port 5173
```

## Verification

```sh
pnpm test
pnpm build
```

## Notes

AWS upload wiring is intentionally not connected yet. Do not put AWS access keys in browser code; use Cognito/Amplify or a backend that issues presigned upload URLs.
