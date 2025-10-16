<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Styled Tabs -->
        <v-tabs
          v-model="activeTab"
          show-arrows
          background-color="transparent"
          class="custom-tabs"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :to="{ name: tab.value }"
            class="custom-tab"
          >
            <v-icon :icon="tab.icon" class="mr-2"></v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <!-- Route-specific content -->
        <v-card class="tab-content-wrapper" elevation="0">
          <router-view />
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = [
  {
    value: "organization-settings",
    title: "Organization Settings",
    icon: "mdi-calendar-clock",
  },
];

const activeTab = ref(null);

onMounted(() => {
  activeTab.value = route.name;
});

watch(activeTab, (newValue) => {
  if (newValue && newValue !== route.name) {
    router.push({ name: newValue });
  }
});

watch(
  () => route.name,
  (newValue) => {
    if (newValue && newValue !== activeTab.value) {
      activeTab.value = newValue;
    }
  },
);
</script>

<style scoped>
/* Container wrapper */
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
  background-color: white;
}

/* Tabs wrapper */
.custom-tabs {
  background-color: #e8edff; /* same as employee tabs */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

/* Individual Tab (inactive) */
.custom-tab {
  border-radius: 10px;
  background-color: white; /* inactive background */
  color: #122f68 !important; /* inactive text */
  margin-right: 8px;
  min-height: 48px;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
  font-family: Lato, sans-serif, Arial;
  transition: background-color 0.3s ease;
}

/* Active Tab Styling */
.v-tab--selected.custom-tab {
  background-color: #122f68 !important; /* active background */
  color: whitesmoke !important; /* active text */
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

/* Icon style */
.custom-tab .v-icon {
  color: #122f68 !important; /* inactive icon */
  opacity: 0.8;
}
.v-tab--selected .v-icon {
  color: white !important; /* active icon */
  opacity: 1;
}

/* Routed content container */
.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
  /* padding: 16px; */
  height: 85vh;
}

/* Optional: improve tab size consistency */
::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>
