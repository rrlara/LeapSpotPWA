<template>
  <section class="stack">
    <div class="summary-row">
      <div class="metric">
        <strong>{{ store.observations.length }}</strong>
        <span>2026 saved</span>
      </div>
      <div class="metric">
        <strong>{{ store.pendingCount }}</strong>
        <span>pending</span>
      </div>
    </div>

    <article v-for="observation in store.observations" :key="observation.id" class="observation-card">
      <template v-if="editingId === observation.id">
        <label class="field">
          <span>Comment</span>
          <textarea v-model="editComment" rows="3" />
        </label>
        <div class="inline-grid">
          <label class="field">
            <span>Latitude</span>
            <input v-model.number="editLatitude" inputmode="decimal" />
          </label>
          <label class="field">
            <span>Longitude</span>
            <input v-model.number="editLongitude" inputmode="decimal" />
          </label>
        </div>
        <div class="actions">
          <button class="button primary" @click="saveEdit(observation.id)">Save</button>
          <button class="button ghost" @click="editingId = ''">Cancel</button>
        </div>
      </template>
      <template v-else>
        <div class="card-head">
          <div>
            <h2>{{ observation.comment || "Untitled" }}</h2>
            <p>{{ formatDate(observation.timestamp) }}</p>
          </div>
          <span class="sync-badge" :class="observation.syncStatus">{{ observation.syncStatus }}</span>
        </div>
        <img v-if="photoUrlFor(observation)" class="observation-photo" :src="photoUrlFor(observation)" alt="Observation photo" />
        <p class="coordinates">{{ observation.latitude.toFixed(5) }}, {{ observation.longitude.toFixed(5) }}</p>
        <p v-if="observation.photoName" class="photo-name">{{ observation.photoName }}</p>
        <div class="actions">
          <button class="button secondary" @click="startEdit(observation)">Edit</button>
          <button class="button danger" @click="removeObservation(observation.id)">Delete</button>
        </div>
      </template>
    </article>

    <div v-if="store.observations.length === 0" class="empty-state">No 2026 observations yet.</div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useObservationsStore } from "@/stores/observations";
import type { ObservationRecord } from "@/types";
import { useToast } from "primevue/usetoast";

const store = useObservationsStore();
const toast = useToast();
const editingId = ref("");
const editComment = ref("");
const editLatitude = ref(0);
const editLongitude = ref(0);
const photoUrls = new Map<string, string>();

onMounted(() => {
  void store.refresh();
});

onUnmounted(() => {
  clearPhotoUrls();
});

watch(
  () => store.observations.map((observation) => `${observation.id}:${observation.updatedAt}`).join("|"),
  () => {
    clearPhotoUrls();
  }
);

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}

function startEdit(observation: ObservationRecord) {
  editingId.value = observation.id;
  editComment.value = observation.comment;
  editLatitude.value = observation.latitude;
  editLongitude.value = observation.longitude;
}

async function saveEdit(id: string) {
  try {
    await store.update(id, {
      comment: editComment.value,
      latitude: editLatitude.value,
      longitude: editLongitude.value
    });
    editingId.value = "";
    showSuccess("Observation updated");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Update failed");
  }
}

async function removeObservation(id: string) {
  try {
    await store.remove(id);
    showSuccess("Observation deleted");
  } catch (error) {
    showError(error instanceof Error ? error.message : "Delete failed");
  }
}

function photoUrlFor(observation: ObservationRecord): string {
  if (!observation.photo) return "";

  const existingUrl = photoUrls.get(observation.id);
  if (existingUrl) return existingUrl;

  const url = URL.createObjectURL(observation.photo);
  photoUrls.set(observation.id, url);
  return url;
}

function clearPhotoUrls() {
  photoUrls.forEach((url) => URL.revokeObjectURL(url));
  photoUrls.clear();
}

function showSuccess(detail: string) {
  toast.add({ severity: "success", summary: "Done", detail, life: 2400 });
}

function showError(detail: string) {
  toast.add({ severity: "error", summary: "Action failed", detail, life: 4200 });
}
</script>
