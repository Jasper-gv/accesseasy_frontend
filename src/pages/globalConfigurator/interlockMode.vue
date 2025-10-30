<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- Main Content -->
      <v-col cols="12">
        <v-card class="pa-4">
          <v-window v-model="activeTab">
            <!-- Antipassback Mode Tab -->
            <v-window-item value="antipassback">
              <!-- Your existing antipassback code -->
            </v-window-item>

            <!-- Interlock Mode Tab -->
            <v-window-item value="interlock">
              <!-- Interlock Configuration Form -->
              <div v-if="showInterlockForm">
                <div class="d-flex align-center mb-4">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="mr-2"
                    @click="closeInterlockForm"
                  >
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                  <v-card-title class="text-h6 font-weight-bold pa-0">
                    {{
                      isEditingInterlock
                        ? "Edit Interlock Rule"
                        : "Add New Interlock Rule"
                    }}
                  </v-card-title>
                </div>

                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <div class="text-subtitle-1 font-weight-medium mb-2">
                        Select up to 4 doors for interlock control (excludes
                        doors from antipassback)
                      </div>

                      <!-- Doors Selection -->
                      <v-card class="mb-4">
                        <v-card-text>
                          <div class="mb-3">
                            <div class="text-caption text-medium-emphasis mb-2">
                              Select interlock doors
                            </div>
                            <v-select
                              label="Select Doors"
                              :items="availableDoors"
                              multiple
                              variant="outlined"
                              density="compact"
                              v-model="interlockForm.selectedDoors"
                              :rules="doorSelectionRules"
                              :error="hasDoorSelectionError"
                              :error-messages="doorSelectionErrorMessages"
                            ></v-select>
                          </div>

                          <!-- Validation Message -->
                          <div v-if="hasDoorSelectionError" class="mt-2">
                            <div class="text-caption text-error">
                              {{ doorSelectionErrorMessages }}
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12">
                      <div
                        class="d-flex align-center justify-end gap-2"
                        style="max-width: 100%"
                      >
                        <BaseButton
                          variant="ghost"
                          size="md"
                          text="Cancel"
                          @click="closeInterlockForm"
                        />
                        <BaseButton
                          variant="primary"
                          size="md"
                          text="Save Configuration"
                          @click="saveInterlockRule"
                          :disabled="!isFormValid"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </div>

              <!-- Interlock Rules List -->
              <div v-else>
                <div class="d-flex align-center justify-space-between mb-4">
                  <v-card-title class="text-h6 font-weight-bold pa-0">
                    Interlock Configuration
                    <v-chip size="small" color="primary" class="ml-3">
                      {{ interlockRules.length }} Rules
                    </v-chip>
                  </v-card-title>
                  <BaseButton
                    variant="primary"
                    size="md"
                    text="Add New Rule"
                    :leftIcon="Plus"
                    @click="openAddInterlockPanel"
                  />
                </div>

                <v-card-text>
                  <!-- Loading State -->
                  <SkeletonLoader
                    v-if="interlockLoading"
                    variant="data-table"
                    :rows="5"
                    :columns="4"
                  />

                  <!-- Interlock Table -->
                  <DataTableWrapper v-else :showSearch="false">
                    <DataTable
                      :items="interlockRules"
                      :columns="[
                        {
                          label: 'Doors Involved',
                          key: 'doorsInvolved',
                          sortable: true,
                          width: '250px',
                        },
                      ]"
                      :showSelection="false"
                      :expandable="false"
                      show-header
                      :row-clickable="true"
                    >
                      <template #status="{ item }">
                        <v-chip
                          :color="item.status === 'Active' ? 'success' : 'grey'"
                          size="small"
                        >
                          {{ item.status }}
                        </v-chip>
                      </template>

                      <template #actions="{ item }">
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          text="Edit"
                          @click="handleEditInterlock(item)"
                        />
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          text="Delete"
                          :leftIcon="Trash"
                          @click="deleteInterlockRule(item)"
                        />
                      </template>
                    </DataTable>
                  </DataTableWrapper>
                </v-card-text>
              </div>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { Plus, Trash } from "lucide-vue-next";

const activeTab = ref("interlock");
const interlockLoading = ref(false);
const showInterlockForm = ref(false);
const isEditingInterlock = ref(false);
const editingInterlockId = ref(null);

// All available doors (excluding those already in antipassback)
const allDoors = ref([
  "Airlock Door A",
  "Airlock Door B",
  "Mantrap Entry",
  "Mantrap Exit",
  "Emergency Override",
  "Loading Door 1",
  "Loading Door 2",
  "Clean Room Door A",
  "Clean Room Door B",
  "Main Entrance",
  "Side Door A",
  "Side Door B",
  "Parking Main Gate",
  "Pedestrian Gate",
  "Service Gate",
  "Server Room Main",
  "Server Room Emergency",
]);

// Doors that are excluded (already in antipassback)
const excludedDoors = ref([
  "Main Entrance",
  "Parking Main Gate",
  "Server Room Main",
]);

// Available doors for interlock (all doors excluding antipassback doors)
const availableDoors = computed(() => {
  return allDoors.value.filter((door) => !excludedDoors.value.includes(door));
});

// Interlock form data
const interlockForm = reactive({
  selectedDoors: [],
  isActive: true,
});

// Computed properties for validation
const hasDoorSelectionError = computed(() => {
  return interlockForm.selectedDoors.length > 4;
});

const doorSelectionErrorMessages = computed(() => {
  if (interlockForm.selectedDoors.length > 4) {
    return "Maximum 4 doors only allowed for interlock configuration";
  }
  return "";
});

const isFormValid = computed(() => {
  return (
    interlockForm.selectedDoors.length >= 1 &&
    interlockForm.selectedDoors.length <= 4
  );
});

// Validation rules
const doorSelectionRules = [
  (value) => !!value.length || "At least one door is required",
  (value) => value.length <= 4 || "Maximum 4 doors only allowed",
];

// Interlock rules data
const interlockRules = ref([
  {
    id: 1,
    ruleName: "Airlock Interlock",
    doorsInvolved: "Airlock Door A, Airlock Door B",
    selectedDoors: ["Airlock Door A", "Airlock Door B"],
    status: "Active",
    createdDate: "10/20/2025",
    isActive: true,
  },
  {
    id: 2,
    ruleName: "Mantrap Interlock",
    doorsInvolved: "Mantrap Entry, Mantrap Exit, Emergency Override",
    selectedDoors: ["Mantrap Entry", "Mantrap Exit", "Emergency Override"],
    status: "Active",
    createdDate: "10/18/2025",
    isActive: true,
  },
  {
    id: 3,
    ruleName: "Loading Bay Interlock",
    doorsInvolved: "Loading Door 1, Loading Door 2",
    selectedDoors: ["Loading Door 1", "Loading Door 2"],
    status: "Active",
    createdDate: "10/15/2025",
    isActive: true,
  },
  {
    id: 4,
    ruleName: "Clean Room Interlock",
    doorsInvolved: "Clean Room Door A, Clean Room Door B",
    selectedDoors: ["Clean Room Door A", "Clean Room Door B"],
    status: "Inactive",
    createdDate: "10/12/2025",
    isActive: false,
  },
]);

// Methods to handle interlock form
const openAddInterlockPanel = () => {
  showInterlockForm.value = true;
  isEditingInterlock.value = false;
  editingInterlockId.value = null;
  // Reset form
  Object.assign(interlockForm, {
    selectedDoors: [],
    isActive: true,
  });
};

const closeInterlockForm = () => {
  showInterlockForm.value = false;
  isEditingInterlock.value = false;
  editingInterlockId.value = null;
};

const handleEditInterlock = (item) => {
  isEditingInterlock.value = true;
  showInterlockForm.value = true;
  editingInterlockId.value = item.id;

  // Populate form with existing data
  interlockForm.selectedDoors = [...item.selectedDoors];
  interlockForm.isActive = item.isActive;
};

const saveInterlockRule = () => {
  // Double check validation before saving
  if (!isFormValid.value) {
    return;
  }

  if (isEditingInterlock.value && editingInterlockId.value) {
    // Update existing rule
    const index = interlockRules.value.findIndex(
      (rule) => rule.id === editingInterlockId.value
    );
    if (index !== -1) {
      interlockRules.value[index] = {
        ...interlockRules.value[index],
        doorsInvolved: interlockForm.selectedDoors.join(", "),
        selectedDoors: [...interlockForm.selectedDoors],
        status: interlockForm.isActive ? "Active" : "Inactive",
        isActive: interlockForm.isActive,
      };
    }
  } else {
    // Add new rule
    const newRule = {
      id: Date.now(), // Simple ID generation
      ruleName: `Interlock ${interlockRules.value.length + 1}`,
      doorsInvolved: interlockForm.selectedDoors.join(", "),
      selectedDoors: [...interlockForm.selectedDoors],
      status: interlockForm.isActive ? "Active" : "Inactive",
      createdDate: new Date().toLocaleDateString(),
      isActive: interlockForm.isActive,
    };
    interlockRules.value.unshift(newRule);
  }

  closeInterlockForm();
};

const deleteInterlockRule = (item) => {
  const index = interlockRules.value.findIndex((rule) => rule.id === item.id);
  if (index !== -1) {
    interlockRules.value.splice(index, 1);
  }
};
</script>

<style scoped>
.v-container {
  max-width: 100%;
}
.gap-2 {
  gap: 8px;
}
.v-card-text {
  flex: 1 1 auto;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.0178571429em;
  opacity: var(--v-card-text-opacity, 1);
  text-transform: none;
}
</style>
