import { createRouter, createWebHistory } from "vue-router";
import CaptureView from "./views/CaptureView.vue";
import MapView from "./views/MapView.vue";
import ObservationsView from "./views/ObservationsView.vue";
import SyncView from "./views/SyncView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "capture", component: CaptureView },
    { path: "/observations", name: "observations", component: ObservationsView },
    { path: "/map", name: "map", component: MapView },
    { path: "/sync", name: "sync", component: SyncView }
  ]
});

export default router;
