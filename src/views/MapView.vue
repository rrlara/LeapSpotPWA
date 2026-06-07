<template>
  <section class="stack">
    <fieldset class="layer-controls" aria-label="Map layer">
      <label v-for="layer in layerOptions" :key="layer.id" class="toggle">
        <input v-model="activeLayerId" type="radio" name="map-layer" :value="layer.id" />
        <span :style="{ '--layer-color': layer.color }">{{ layer.label }}</span>
      </label>
    </fieldset>

    <div ref="mapElement" class="leaflet-map" aria-label="Observation map"></div>

    <div class="summary-row">
      <div v-for="layer in layerOptions" :key="layer.id" class="metric" :class="{ active: activeLayerId === layer.id }">
        <strong>{{ layer.count }}</strong>
        <span>{{ layer.label }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import L, { type CircleMarker, type LatLngBoundsExpression, type Map } from "leaflet";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useObservationsStore } from "@/stores/observations";
import { observationToFeature } from "@/lib/geojson";
import { imageUrlCandidatesForLegacyTimestamp, imageUrlCandidatesForMexicoTimestamp } from "@/lib/s3Images";
import type { GeoJsonFeature } from "@/types";

const store = useObservationsStore();
const activeLayerId = ref("current");
const mapElement = ref<HTMLElement | null>(null);
let map: Map | undefined;
let markers: CircleMarker[] = [];
let popupPhotoUrls: string[] = [];

const currentLayer = computed(() => ({
  id: "current",
  label: "2026",
  color: "#2563eb",
  features: store.observations.map(observationToFeature)
}));

const allLayers = computed(() => [
  ...store.historicalLayers.map((layer) => ({
    id: layer.id,
    label: layer.label,
    color: layer.color,
    features: layer.collection.features
  })),
  currentLayer.value
]);

const layerOptions = computed(() =>
  allLayers.value.map((layer) => ({
    id: layer.id,
    label: layer.label,
    color: layer.color,
    count: layer.features.length
  }))
);

const selectedLayer = computed(() => allLayers.value.find((layer) => layer.id === activeLayerId.value) ?? currentLayer.value);

onMounted(async () => {
  await Promise.all([store.refresh(), store.loadHistory()]);
  await nextTick();
  initializeMap();
  renderMarkers();
});

onUnmounted(() => {
  markers.forEach((marker) => marker.remove());
  clearPopupPhotoUrls();
  map?.remove();
});

watch([selectedLayer, () => store.observations.length], () => renderMarkers(), { deep: true });

function initializeMap() {
  if (!mapElement.value || map) return;

  map = L.map(mapElement.value, {
    zoomControl: true,
    attributionControl: true
  }).setView([47.60621, -122.33207], 11);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
}

function renderMarkers() {
  if (!map) return;

  markers.forEach((marker) => marker.remove());
  clearPopupPhotoUrls();
  markers = [];

  const layer = selectedLayer.value;
  const bounds: [number, number][] = [];

  if (layer.id === "current") {
    store.observations.forEach((observation) => {
      const feature = observationToFeature(observation);
      const photoUrl = observation.photo ? URL.createObjectURL(observation.photo) : "";
      if (photoUrl) popupPhotoUrls.push(photoUrl);
      const marker = createMarker(feature, layer.color, photoUrl ? [photoUrl] : []);
      marker.addTo(map!);
      markers.push(marker);
      bounds.push([observation.latitude, observation.longitude]);
    });
  } else {
    layer.features.forEach((feature) => {
      const marker = createMarker(feature, layer.color, imageUrlsForHistoricalFeature(layer.id, feature));
      marker.addTo(map!);
      markers.push(marker);
      const [longitude, latitude] = feature.geometry.coordinates;
      bounds.push([latitude, longitude]);
    });
  }

  if (bounds.length > 0) {
    map.fitBounds(bounds as LatLngBoundsExpression, {
      padding: [28, 28],
      maxZoom: 13
    });
  } else {
    map.setView([47.60621, -122.33207], 11);
  }
}

function imageUrlsForHistoricalFeature(layerId: string, feature: GeoJsonFeature): string[] {
  if (layerId === "sea") return imageUrlCandidatesForLegacyTimestamp(feature.properties.timestamp);
  if (layerId === "mexico") return imageUrlCandidatesForMexicoTimestamp(feature.properties.timestamp);
  return [];
}

function createMarker(feature: GeoJsonFeature, color: string, photoUrls: string[] = []): CircleMarker {
  const [longitude, latitude] = feature.geometry.coordinates;
  return L.circleMarker([latitude, longitude], {
    radius: activeLayerId.value === "current" ? 7 : 5,
    color,
    fillColor: color,
    fillOpacity: 0.86,
    weight: 2
  }).bindPopup(popupContent(feature, photoUrls));
}

function popupContent(feature: GeoJsonFeature, photoUrls: string[]): HTMLElement {
  const container = document.createElement("div");

  if (photoUrls.length > 0) {
    const image = document.createElement("img");
    image.className = "popup-photo";
    image.alt = "Observation photo";
    image.src = photoUrls[0];

    let nextImageIndex = 1;
    image.addEventListener("error", () => {
      const nextUrl = photoUrls[nextImageIndex];
      nextImageIndex += 1;
      if (nextUrl) {
        image.src = nextUrl;
      } else {
        image.remove();
      }
    });

    container.appendChild(image);
  }

  const title = document.createElement("strong");
  title.textContent = feature.properties.comment || "Observation";
  container.appendChild(title);
  container.appendChild(document.createElement("br"));
  container.appendChild(document.createTextNode(feature.properties.timestamp));

  return container;
}

function clearPopupPhotoUrls() {
  popupPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
  popupPhotoUrls = [];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return replacements[character];
  });
}
</script>
