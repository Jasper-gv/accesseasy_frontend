<template>
  <div class="face-embedding-container">
    <div class="tabs-container">
      <v-tabs
        v-model="activeTab"
        show-arrows
        background-color="transparent"
        class="custom-tabs"
      >
        <v-tab value="ai" class="custom-tab">
          <v-icon start>mdi-robot</v-icon>
          AI Face Embedding
        </v-tab>
        <v-tab value="mobile" class="custom-tab">
          <v-icon start>mdi-cellphone</v-icon>
          Mobile Face Embedding
        </v-tab>
        <v-tab value="finger" class="custom-tab">
          <v-icon start>mdi-fingerprint</v-icon>
          Finger Details
        </v-tab>
      </v-tabs>
    </div>

    <div class="tab-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const activeTab = ref("ai");

// Watch for route changes to update active tab
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes("mobile-face-embedding")) {
      activeTab.value = "mobile";
    } else if (newPath.includes("ai-face-embedding")) {
      activeTab.value = "ai";
    } else if (newPath.includes("finger-data")) {
      activeTab.value = "finger";
    }
  },
  { immediate: true }
);

// Watch for tab changes to navigate
watch(activeTab, (newTab) => {
  if (newTab === "mobile") {
    router.push("/face-embedding/mobile-face-embedding");
  } else if (newTab === "ai") {
    router.push("/face-embedding/ai-face-embedding");
  } else if (newTab === "finger") {
    router.push("/face-embedding/finger-data");
  }
});
</script>

<style scoped>
.face-embedding-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.tabs-container {
  border-bottom: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  /* Remove flex: 1 if it exists */
  flex: none; /* Add this to ensure it doesn't grow */
}

.custom-tabs {
  background-color: white;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  border-radius: 10;
  background-color: #ecfdf5;
  color: #122f68 !important;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: 8px;
  min-height: 48px;
  transition: background-color 0.3s ease;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
  font-family: Lato, sans-serif, Arial;
  min-width: 200px;
}

/* Active tab style */
:deep(.v-tab--selected.custom-tab) {
  background-color: #059367 !important;
  color: whitesmoke !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

/* Icon styles */
:deep(.custom-tab .v-icon) {
  color: #122f68 !important;
  opacity: 0.8;
}

:deep(.v-tab--selected .v-icon) {
  color: white !important;
  opacity: 1;
}

.tab-content {
  /* Remove flex: 1 to prevent pushing content to bottom */
  flex: 1;
  overflow: auto; /* Change to auto for better scrolling */
  border-radius: 0 0 12px 12px;
  background: white;
  padding: 16px;
  /* Ensure content starts from top */
  display: flex;
  flex-direction: column;
}

/* Tab button styles */
:deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}

/* Remove old tab styles */
:deep(.v-tab) {
  color: #666 !important;
}

:deep(.v-tab--selected) {
  color: black !important;
}

:deep(.v-tabs-slider) {
  background-color: #000000 !important;
}

/* Ensure router-view content starts from top */
:deep(.tab-content > *) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
