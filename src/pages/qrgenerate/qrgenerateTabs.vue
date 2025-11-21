<template>
  <div class="qr-generate-tabs">
    <!-- Tabs Navigation -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      @update:modelValue="handleTabChange"
      class="custom-tabs"
    >
      <v-tab
        v-for="tab in availableTabs"
        :key="tab.name"
        :value="tab.value"
        class="custom-tab"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-card class="tab-content-wrapper" elevation="0">
      <v-window v-model="activeTab">
        <v-window-item
          v-for="tab in availableTabs"
          :key="tab.name"
          :value="tab.value"
        >
          <router-view />
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "QRGenerateTabs",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const activeTab = ref(0);

    const tabs = [
      {
        title: "Employee QR Code",
        name: "employee-qr",
        route: "/qr-generate/employee",
        icon: "mdi-account-qrcode",
        value: 0,
        roles: ["Admin", "Manager", "Employee"],
      },
      {
        title: "QR Generate",
        name: "bulk-qr",
        route: "/qr-generate/bulk",
        icon: "mdi-qrcode-scan",
        value: 1,
        roles: ["Admin", "Manager"],
      },
    ];

    const availableTabs = computed(() => {
      // Filter tabs based on user role
      const userRole = "Admin"; // Replace with actual user role from your auth service
      return tabs.filter((tab) => tab.roles.includes(userRole));
    });

    const handleTabChange = (newValue) => {
      const tab = availableTabs.value.find((t) => t.value === newValue);
      if (tab && route.name !== tab.name) {
        router.push(tab.route);
      }
    };

    const updateActiveTabFromRoute = () => {
      const currentRouteName = route.name;
      const tab = availableTabs.value.find(
        (tab) => tab.name === currentRouteName
      );
      if (tab) {
        activeTab.value = tab.value;
      }
    };

    // Update active tab based on current route
    watch(
      () => route.name,
      () => {
        updateActiveTabFromRoute();
      }
    );

    onMounted(() => {
      updateActiveTabFromRoute();
    });

    return {
      activeTab,
      availableTabs,
      handleTabChange,
    };
  },
};
</script>

<style scoped>
.qr-generate-tabs {
  width: 100%;
  padding: 0;
}

.custom-tabs {
  background-color: white;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  border-radius: 10;
  background-color: #ffe7e6;
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
}

/* Active tab style */
.v-tab--selected.custom-tab {
  background-color: rgb(244, 84, 84) !important;
  color: whitesmoke !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.custom-tab:hover {
  background-color: rgb(244, 84, 84) !important;
  color: white !important;
}

.custom-tab:hover .v-icon {
  color: white !important;
  opacity: 1;
}

/* Icon styles */
.custom-tab .v-icon {
  color: #122f68 !important;
  opacity: 0.8;
}

.v-tab--selected .v-icon {
  color: white !important;
  opacity: 1;
}

/* Content below tabs */
.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
  padding: 16px;
}

:deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}

:deep(.v-window) {
  background: transparent;
}
</style>
