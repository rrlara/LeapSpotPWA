import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Aura from "@primeuix/themes/aura";
import App from "./App.vue";
import router from "./router";
import "./styles.css";
import { useRegisterSW } from "virtual:pwa-register/vue";

if (import.meta.env.DEV) {
  void navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => void registration.unregister());
  });
  void globalThis.caches?.keys().then((keys) => {
    keys.forEach((key) => void globalThis.caches?.delete(key));
  });
} else {
  useRegisterSW({
    immediate: true
  });
}

createApp(App)
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: false
      }
    }
  })
  .use(ToastService)
  .mount("#app");
