<template>
  <v-app>
    <v-container fluid class="pa-0 fill-height" style="width: 100%">
      <v-row class="fill-height" style="padding: 18px; width: 100%">
        <!-- Sidebar Navigation -->
        <v-col cols="2" class="fill-height">
          <v-card flat>
            <div
              v-for="config in configurators"
              :key="config.id"
              class="sidebar-section"
            >
              <div class="sidebar-header">
                {{ config.label }}
              </div>
              <v-list density="compact" class="py-0">
                <v-list-item
                  v-for="subsection in config.subsections"
                  :key="subsection.id"
                  @click="switchTab(subsection.id)"
                  :class="{ 'active-tab': activeTab === subsection.id }"
                  class="mb-1 rounded"
                >
                  <v-list-item-title class="text-body-2">
                    {{ subsection.label }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </v-col>

        <!-- Main Content Area -->
        <v-col cols="10" style="border: 1px solid #e2e8f0" class="fill-height">
          <div class="d-flex align-center text-body-2" style="color: #64748b">
            <span>Configurators</span>
            <v-icon small class="mx-2">mdi-chevron-right</v-icon>
            <span>{{ breadcrumbs[1].title }}</span>
            <v-icon small class="mx-2">mdi-chevron-right</v-icon>
            <span style="color: #0f172a; font-weight: 500">{{
              breadcrumbs[2].title
            }}</span>
          </div>

          <v-container fluid class="flex-grow-1">
            <component
              :is="componentMap[currentComponent]"
              :key="currentComponent"
            />
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import PayrollCategoriesComponent from "@/pages/payroll/policy/salary/salaryPolicyDetails.vue";
import PenaltyPoliciesComponent from "@/pages/payroll/policy/attendance/attendancePolicies/penalityDetails.vue";
import AccessLevelComponent from "@/pages/accesslevel/accessleveldetails.vue";
import DoorDetailsComponent from "@/pages/door/doordetails.vue";
import DeviceDetailsComponent from "@/pages/device/devicedetails.vue";
import TimerZoneComponent from "@/pages/accesslevel/timerzone.vue";

// --- Reactive state ---
const activeTab = ref("doors"); // default active tab
const currentComponent = ref("doors"); // default component
console.log(
  "currentComponent (type):",
  typeof currentComponent.value,
  currentComponent.value
);

// --- Configuration sections ---
const configurators = [
  // {
  //   id: "organization",
  //   label: "Organization Configurator",
  //   subsections: [
  //     { id: "branches", label: "Branches" },
  //     { id: "departments", label: "Departments" },
  //   ],
  // },
  // {
  //   id: "attendance",
  //   label: "Attendance Configurator",
  //   subsections: [
  //     { id: "shifts", label: "Shifts" },
  //     { id: "attendance-cycle", label: "Attendance Cycle" },
  //     { id: "leaves", label: "Leaves" },
  //     { id: "holidays", label: "Holidays" },
  //   ],
  // },
  // {
  //   id: "expense",
  //   label: "Expense Configurator",
  //   subsections: [{ id: "manage-expenses", label: "Manage Expenses" }],
  // },
  {
    id: "payroll",
    label: "Payroll Configurator",
    subsections: [
      { id: "payroll-categories", label: "Payroll Categories" },
      { id: "penalty-policies", label: "Penalty Policies" },
    ],
  },

  {
    id: "doors",
    label: "Doors Configurator",
    subsections: [{ id: "doors", label: "Doors" }],
  },
  {
    id: "access-level",
    label: "Access Level Configurator",
    subsections: [
      { id: "access-level", label: "Access Level" },
      { id: "timer-zone", label: "Timer Zone" },
    ],
  },
  {
    id: "device",
    label: "Device Configurator",
    subsections: [{ id: "devices", label: "Devices" }],
  },
];

const breadcrumbs = computed(() => {
  const subsection = configurators
    .flatMap((c) => c.subsections.map((s) => ({ ...s, parent: c.label })))
    .find((s) => s.id === activeTab.value);

  return [
    { title: "Configurators", disabled: false },
    { title: subsection?.parent || "Payroll Configurator", disabled: false },
    { title: subsection?.label || "Payroll Categories", disabled: true },
  ];
});

// --- Component mapping ---
const componentMap = {
  "payroll-categories": PayrollCategoriesComponent,
  "penalty-policies": PenaltyPoliciesComponent,
  "access-level": AccessLevelComponent,
  "timer-zone": TimerZoneComponent,
  doors: DoorDetailsComponent,
  devices: DeviceDetailsComponent,
};

// --- Tab switch method ---
function switchTab(tabId) {
  activeTab.value = tabId;
  currentComponent.value = componentMap[tabId] || PayrollCategoriesComponent;
}

// --- Watcher (optional, keeps currentComponent synced) ---
watch(activeTab, (newTab) => {
  console.log("Tab changed to:", newTab);
  console.log("Mapped component:", componentMap[newTab]);
  currentComponent.value = newTab;
  // Debug after updating
  console.log("currentComponent after update:", currentComponent.value);
});
</script>

<style scoped>
.sidebar {
  /* width: 240px; */
  background-color: #fafafa;
  border-right: 1px solid #e0e0e0;
  height: 90vh !important;
}

.sidebar-section {
  margin-bottom: 16px;
}

.sidebar-header {
  font-weight: 600;
  font-size: 14px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.active-tab {
  background-color: #77c3ab !important;
  color: black !important;
  font-weight: 500;
}

.breadcrumb-card {
  border-bottom: 1px solid #e0e0e0;
}

.content-area {
  background-color: #fafafa;
  overflow-y: auto;
}

.header-controls {
  border-bottom: 1px solid #e0e0e0;
}

.control-group {
  gap: 16px;
  flex: 1;
}

.search-field {
  max-width: 300px;
}

.year-select {
  max-width: 150px;
}

.footer-pagination {
  border-top: 1px solid #e0e0e0;
  justify-content: space-between;
  padding: 12px 16px;
}

.pagination-controls {
  gap: 8px;
}

.fill-height {
  height: 95vh !important;
}
</style>
