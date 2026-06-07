<template>
  <section class="stack">
    <form class="panel capture-grid" @submit.prevent="save">
      <label class="field wide">
        <span>Comment</span>
        <textarea v-model="comment" rows="4" placeholder="What happened here?" required />
      </label>

      <div class="field">
        <span>Latitude</span>
        <input v-model.number="latitude" inputmode="decimal" required />
      </div>

      <div class="field">
        <span>Longitude</span>
        <input v-model.number="longitude" inputmode="decimal" required />
      </div>

      <button type="button" class="button secondary wide" @click="useCurrentLocation" :disabled="isLocating">
        {{ isLocating ? "Locating" : "Current Location" }}
      </button>

      <label class="field wide">
        <span>Photo</span>
        <input type="file" accept="image/*" capture="environment" @change="selectPhoto" />
      </label>

      <img v-if="photoPreview" class="photo-preview wide" :src="photoPreview" alt="Selected observation" />

      <button class="button primary wide" type="submit">Save Offline</button>
    </form>

    <p v-if="status" class="toast">{{ status }}</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useObservationsStore } from "@/stores/observations";
import { useToast } from "primevue/usetoast";

const store = useObservationsStore();
const toast = useToast();
const comment = ref("");
const latitude = ref<number | null>(47.60621);
const longitude = ref<number | null>(-122.33207);
const photo = ref<File | undefined>();
const photoPreview = ref("");
const isLocating = ref(false);
const status = ref("");

onMounted(() => {
  void store.refresh();
});

onUnmounted(() => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
});

function useCurrentLocation() {
  if (!navigator.geolocation) {
    status.value = "Location unavailable";
    return;
  }

  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = Number(position.coords.latitude.toFixed(5));
      longitude.value = Number(position.coords.longitude.toFixed(5));
      status.value = "Location set";
      isLocating.value = false;
    },
    () => {
      status.value = "Location failed";
      isLocating.value = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 12000
    }
  );
}

function selectPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  photo.value = file;

  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photoPreview.value = file ? URL.createObjectURL(file) : "";
}

async function save() {
  if (latitude.value === null || longitude.value === null) {
    status.value = "Location required";
    showError(status.value);
    return;
  }

  try {
    await store.create({
      comment: comment.value,
      latitude: latitude.value,
      longitude: longitude.value,
      photo: photo.value,
      photoName: photo.value?.name
    });
  } catch (error) {
    status.value = error instanceof Error ? error.message : "Save failed";
    showError(status.value);
    return;
  }

  comment.value = "";
  photo.value = undefined;
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photoPreview.value = "";
  status.value = store.message;
  showSuccess("Observation saved offline");
}

function showSuccess(detail: string) {
  toast.add({ severity: "success", summary: "Saved", detail, life: 2600 });
}

function showError(detail: string) {
  toast.add({ severity: "error", summary: "Action failed", detail, life: 4200 });
}
</script>
