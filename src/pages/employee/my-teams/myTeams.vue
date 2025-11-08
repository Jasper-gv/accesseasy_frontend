<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Tabs: show only when not on Add/Edit -->
        <v-tabs
          v-if="!isFormRoute"
          v-model="activeTab"
          show-arrows
          background-color="transparent"
          @update:modelValue="handleTabChange"
          class="custom-tabs"
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

        <!-- Tab Content (always rendered) -->
        <v-card
          :class="[
            'tab-content-wrapper',
            { 'full-width-no-tabs': isFormRoute },
          ]"
          elevation="0"
        >
          <router-view></router-view>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { currentUserTenant } from "@/utils/currentUserTenant";

const router = useRouter();
const route = useRoute();

const userRole = ref("");
const tabs = ref([]);
const activeTab = ref("employee");

// names of routes that should hide tabs
const FORM_ROUTE_NAMES = ["AddEmployeeForm", "EmployeeForm"];

// computed boolean: true when current route is a form (add/edit)
const isFormRoute = computed(() => {
  // route.name may be undefined briefly — coerce to string
  const rname = String(route.name || "");
  return FORM_ROUTE_NAMES.includes(rname);
});

// (optional) debug: uncomment to see the route names in console when navigating
// watch(() => route.name, (n) => console.log('route.name =>', n));

const handleTabChange = (newValue) => {
  router.push(`/employee-details/${newValue}`);
};

const updateActiveTabFromRoute = () => {
  const currentPath = route.path;
  const pathSegments = currentPath.split("/");
  const tabValue = pathSegments[pathSegments.length - 1];
  const currentTab = tabs.value.find((tab) => tab.value === tabValue);
  activeTab.value = currentTab ? currentTab.value : "employee";
};

const fetchrole = async () => {
  const userData = await currentUserTenant.fetchLoginUserDetails();
  userRole.value = userData.role.name;

  tabs.value = [
    { value: "employee", title: "All Employees", icon: "mdi-account-details" },
    { value: "leave", title: "Leave Balance", icon: "mdi-calendar-check" },
    {
      value: "attendance",
      title: "Shift Details",
      icon: "mdi-calendar-clock",
    },
    {
      value: "card",
      title: "Card Management",
      icon: "mdi-card-account-details",
    },
    // {
    //   value: "otherDetails",
    //   title: "Employee Other Details",
    //   icon: "mdi-card-account-details-outline",
    // },
  ];
};

watch(
  () => route.path,
  () => {
    updateActiveTabFromRoute();
  }
);

onMounted(async () => {
  await fetchrole();
  updateActiveTabFromRoute();
});
</script>

<style scoped>
/* tab design */

.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}
.full-width-no-tabs {
  padding-top: 8px; /* reduce space reserved for tabs if needed */
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
}

/* Active tab style */
.v-tab--selected.custom-tab {
  background-color: #059367 !important;
  color: whitesmoke !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
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
::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>
