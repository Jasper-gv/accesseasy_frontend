<template>
  <v-container fluid>
    <!-- Styled Tabs -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      class="custom-tabs"
      @update:modelValue="handleTabChange"
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="custom-tab"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Routed Component with Event Emission -->
    <router-view v-slot="{ Component }">
      <component
        :is="Component"
        @showAddPage="handleShowAdd"
        @showEditPage="handleShowEdit"
        @closeAddPage="handleClose"
        @closeEditPage="handleClose"
      />
    </router-view>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const tabs = [
  {
    value: "branch-configuration",
    title: "Branch Configuration",
    icon: "mdi-map-marker",
  },
  {
    value: "department-configuration",
    title: "Department Configuration",
    icon: "mdi-domain",
  },
];

const activeTab = ref("branch-configuration");

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

const handleTabChange = (newValue) => {
  router.push({ name: newValue });
};

const handleShowAdd = () => {
  router.push({ name: `${route.name}-add` });
};

const handleShowEdit = (item) => {
  router.push({ name: `${route.name}-edit`, params: { id: item.id } });
};

const handleClose = () => {
  router.push({ name: route.name });
};
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
  background-color: white;
  color: black !important;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: 8px;
  min-height: 48px;
  transition: background-color 0.3s ease;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
  font-family: Lato, sans-serif, Arial;
}

/* Active tab style */
.v-tab--selected.custom-tab {
  background-color: #122f68 !important;
  color: #ffffff !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

/* Disabled tab style */
.custom-tab.v-tab--disabled {
  color: #ccc !important;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Content below tabs */
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
