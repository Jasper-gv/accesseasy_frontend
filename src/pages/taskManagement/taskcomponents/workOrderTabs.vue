<!-- src/page/taskmanagmnet/task/workOrderTabs.vue -->
<template>
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
        :value="tab.value"
        class="custom-tab"
        @click="handleTabClick(tab.value)"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Routed View -->
    <v-card class="tab-content-wrapper" elevation="0">
      <router-view />
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = [
  {
    value: "workorder",
    title: "Work Tasks",
    icon: "mdi-clipboard-check-outline",
  },
  {
    value: "fieldtrip",
    title: "Field Trips",
    icon: "mdi-map-marker-radius-outline",
  },
];

const activeTab = ref("workorder");

const determineActiveTab = () => {
  const currentPath = route.path.toLowerCase();
  if (currentPath.includes("fieldtrip")) {
    return "fieldtrip";
  } else {
    return "workorder";
  }
};

const handleTabClick = (tabValue) => {
  console.log("[v0] Tab clicked:", tabValue);
  activeTab.value = tabValue;

  if (tabValue === "fieldtrip") {
    router.push({ name: "WorkOrderFieldTrip" });
  } else {
    router.push({ name: "WorkOrderTasks" });
  }
};

onMounted(() => {
  activeTab.value = determineActiveTab();
  console.log("[v0] Initial active tab set to:", activeTab.value);
});

watch(
  () => route.path,
  (newPath) => {
    const newActiveTab = determineActiveTab();
    if (activeTab.value !== newActiveTab) {
      activeTab.value = newActiveTab;
      console.log("[v0] Route changed, active tab updated to:", newActiveTab);
    }
  },
  { immediate: true },
);

watch(activeTab, (newValue, oldValue) => {
  console.log("[v0] Active tab changed from", oldValue, "to", newValue);
});
</script>

<style scoped>
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}

.custom-tabs {
  background-color: #dee8f1;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  border-radius: 10px;
  background-color: #122f68;
  color: white !important;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: 8px;
  min-height: 48px;
  transition: background-color 0.3s ease;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
  font-family: Lato, sans-serif, Arial;
  cursor: pointer;
}

.v-tab--selected.custom-tab {
  background-color: white !important;
  color: #68ade1 !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.custom-tab .v-icon {
  color: white !important;
  opacity: 0.8;
}
.v-tab--selected .v-icon {
  color: #68ade1 !important;
  opacity: 1;
}

.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
  padding: 16px;
}

::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>
