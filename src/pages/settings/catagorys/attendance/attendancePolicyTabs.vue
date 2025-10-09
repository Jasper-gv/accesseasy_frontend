<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- Tabs -->
        <v-tabs v-model="activeTab" color=#68ade1 show-arrows>
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            style="text-transform: none"
            class="tab-text"
          >
            <v-icon :icon="tab.icon" class="mr-2"></v-icon>
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <!-- Tab content -->
        <v-window v-model="activeTab">
          <v-window-item value="penalty-settings">
            <PenaltyOverTime
              v-if="selectedConfig && policyPatchId"
              :config="selectedConfig"
              :policyPatch="policyPatchId"
            />
            <div v-else class="pa-4 text-center text-muted-foreground">
              Please select an attendance policy to configure penalty and
              overtime settings.
            </div>
          </v-window-item>
          <v-window-item value="assign-employee">
            <AssignEmployee
              v-if="selectedConfig"
              :config="selectedConfig"
              gradeName="Default Grade"
              :updateAlteredData="() => {}"
            />
            <div v-else class="pa-4 text-center text-muted-foreground">
              Please select an attendance policy to assign employees.
            </div>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch } from "vue";
import AssignEmployee from "./attendancePolicies/assignToEmployee.vue";
import PenaltyOverTime from "./attendancePolicies/penality&OverTime.vue";

const props = defineProps({
  selectedConfig: {
    type: Object,
    default: null,
  },
  policyPatchId: {
    type: Number,
    default: null,
  },
  showSnackbar: { 
    type: Function,
    default: null,
  },
});

const tabs = [
  {
    title: "Penalty Settings",
    value: "penalty-settings",
    icon: "mdi-alert-circle-outline",
  },
  {
    title: "Assign to Employee",
    value: "assign-employee",
    icon: "mdi-account-cog-outline",
  },
];

const activeTab = ref("penalty-settings");

watch(
  () => props.selectedConfig,
  (newVal) => {
    if (newVal) {
      activeTab.value = "penalty-settings";
    }
  },
);
</script>

<style scoped>
.v-container {
  padding: 16px;
}

.tab-text {
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
  font-family: Lato, sans-serif, Arial;
}

/* Optional: Add responsive styles */
@media (max-width: 600px) {
  .v-tab {
    min-width: unset;
  }
}
</style>
