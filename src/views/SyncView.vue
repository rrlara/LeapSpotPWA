<template>
  <section class="stack">
    <div class="panel">
      <div class="file-row">
        <div>
          <h2>Observations_2026.json</h2>
          <p>{{ store.exportedCollection.features.length }} features</p>
        </div>
      </div>
      <pre class="json-preview">{{ preview }}</pre>
    </div>

    <form class="panel stack" @submit.prevent="upload">
      <label class="field">
        <span>Upload URL</span>
        <input v-model="presignedUrl" type="url" autocomplete="off" placeholder="https://..." />
      </label>
      <button class="button secondary" type="submit" :disabled="!presignedUrl || isUploading">
        {{ isUploading ? "Uploading" : "Upload JSON" }}
      </button>
      <button class="button ghost" type="button" @click="store.markUploaded">Mark Uploaded</button>
    </form>

    <p v-if="status" class="toast">{{ status }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useObservationsStore } from "@/stores/observations";
import { serializeFeatureCollection } from "@/lib/geojson";
import { uploadGeoJsonWithPresignedUrl } from "@/lib/sync";
import { useToast } from "primevue/usetoast";

const store = useObservationsStore();
const toast = useToast();
const presignedUrl = ref("");
const isUploading = ref(false);
const status = ref("");

onMounted(() => {
  void store.refresh();
});

const preview = computed(() => serializeFeatureCollection(store.exportedCollection).slice(0, 1400));

async function upload() {
  isUploading.value = true;
  status.value = "";
  try {
    await uploadGeoJsonWithPresignedUrl(store.exportedCollection, presignedUrl.value);
    await store.markUploaded();
    status.value = "Upload complete";
    showSuccess("Upload complete");
  } catch (error) {
    status.value = error instanceof Error ? error.message : "Upload failed";
    showError(status.value);
  } finally {
    isUploading.value = false;
  }
}

function showSuccess(detail: string) {
  toast.add({ severity: "success", summary: "Synced", detail, life: 2600 });
}

function showError(detail: string) {
  toast.add({ severity: "error", summary: "Upload failed", detail, life: 5000 });
}
</script>
