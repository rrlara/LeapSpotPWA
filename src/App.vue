<template>
  <div class="shell">
    <Toast position="top-center" />

    <header class="app-header">
      <div>
        <p class="eyebrow">LeapSpot</p>
        <h1>{{ title }}</h1>
      </div>
      <div class="status-pill" :class="{ online: isOnline }">{{ isOnline ? "Online" : "Offline" }}</div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <nav class="tabbar" aria-label="Primary">
      <RouterLink to="/" class="tab">Capture</RouterLink>
      <RouterLink to="/observations" class="tab">List</RouterLink>
      <RouterLink to="/map" class="tab">Map</RouterLink>
      <RouterLink to="/sync" class="tab">Sync</RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import Toast from "primevue/toast";

const route = useRoute();
const isOnline = ref(navigator.onLine);

const title = computed(() => {
  if (route.name === "observations") return "Observations";
  if (route.name === "map") return "Travel map";
  if (route.name === "sync") return "Sync";
  return "Capture";
});

function updateNetworkState() {
  isOnline.value = navigator.onLine;
}

onMounted(() => {
  window.addEventListener("online", updateNetworkState);
  window.addEventListener("offline", updateNetworkState);
});

onUnmounted(() => {
  window.removeEventListener("online", updateNetworkState);
  window.removeEventListener("offline", updateNetworkState);
});
</script>
