import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  addObservation,
  deleteObservation,
  listObservations,
  markAllUploaded,
  updateObservation,
  type NewObservationInput
} from "@/repositories/observationRepository";
import type { HistoricalTripLayer, ObservationRecord } from "@/types";
import { loadHistoricalTrips } from "@/lib/historicalTrips";
import { observationsToFeatureCollection } from "@/lib/geojson";

export const useObservationsStore = defineStore("observations", () => {
  const observations = ref<ObservationRecord[]>([]);
  const historicalLayers = ref<HistoricalTripLayer[]>([]);
  const isLoading = ref(false);
  const message = ref("");

  const pendingCount = computed(() => observations.value.filter((observation) => observation.syncStatus !== "uploaded").length);
  const exportedCollection = computed(() => observationsToFeatureCollection(observations.value));

  async function refresh() {
    observations.value = await listObservations();
  }

  async function create(input: NewObservationInput) {
    await addObservation(input);
    await refresh();
    message.value = "Saved offline";
  }

  async function update(id: string, patch: Pick<ObservationRecord, "comment" | "latitude" | "longitude">) {
    await updateObservation(id, patch);
    await refresh();
    message.value = "Updated";
  }

  async function remove(id: string) {
    await deleteObservation(id);
    await refresh();
    message.value = "Deleted";
  }

  async function loadHistory() {
    if (historicalLayers.value.length > 0) return;
    isLoading.value = true;
    try {
      historicalLayers.value = await loadHistoricalTrips();
    } finally {
      isLoading.value = false;
    }
  }

  async function markUploaded() {
    await markAllUploaded();
    await refresh();
    message.value = "Marked uploaded";
  }

  return {
    observations,
    historicalLayers,
    isLoading,
    message,
    pendingCount,
    exportedCollection,
    refresh,
    create,
    update,
    remove,
    loadHistory,
    markUploaded
  };
});
