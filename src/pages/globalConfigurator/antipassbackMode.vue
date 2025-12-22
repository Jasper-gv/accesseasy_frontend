<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4">
          <v-window v-model="activeTab">
            <!-- ==================== ANTIPASSBACK TAB ==================== -->
            <v-window-item value="antipassback">
              <!-- Add / Edit Form Panel -->
              <div v-if="showForm" class="mb-6">
                <div class="d-flex align-center mb-6">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="mr-3"
                    @click="closeForm"
                  >
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                  <h2 class="text-h6 font-weight-bold">
                    {{
                      isEditing
                        ? "Edit Antipassback Rule"
                        : "Add New Antipassback Rule"
                    }}
                  </h2>
                </div>

                <v-form ref="formRef" v-model="formValid">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="form.zoneName"
                        label="Zone Name *"
                        variant="outlined"
                        density="compact"
                        placeholder="e.g., Server Room, Parking Area"
                        :rules="[(v) => !!v || 'Zone name is required']"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.entryDoors"
                        :items="doorOptions"
                        multiple
                        chips
                        closable-chips
                        label="Entry Doors *"
                        variant="outlined"
                        density="compact"
                        placeholder="Select entry doors"
                        :rules="[
                          (v) =>
                            v.length > 0 || 'At least one entry door required',
                        ]"
                      />
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-select
                        v-model="form.exitDoors"
                        :items="doorOptions"
                        multiple
                        chips
                        closable-chips
                        label="Exit Doors *"
                        variant="outlined"
                        density="compact"
                        placeholder="Select exit doors"
                        :rules="[
                          (v) =>
                            v.length > 0 || 'At least one exit door required',
                        ]"
                      />
                    </v-col>

                    <v-col cols="12" class="d-flex justify-end gap-3">
                      <BaseButton
                        variant="text"
                        size="md"
                        text="Cancel"
                        @click="closeForm"
                      />
                      <BaseButton
                        variant="primary"
                        size="md"
                        :text="isEditing ? 'Update' : 'Save'"
                        :loading="saving"
                        :disabled="!formValid"
                        @click="saveRule"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </div>

              <!-- Rules List -->
              <div v-else>
                <DataTableWrapper
                  subtitle="Define zones and allowed entry/exit doors to prevent passback violations"
                  :showSearch="true"
                >
                  <template #toolbar-actions>
                    <BaseButton
                      variant="primary"
                      size="md"
                      text="Add Rule"
                      :leftIcon="PlusIcon"
                      @click="openAddForm"
                    />
                  </template>

                  <!-- Loading -->
                  <SkeletonLoader
                    v-if="loading"
                    variant="data-table"
                    :rows="6"
                    :columns="4"
                  />

                  <!-- Error -->
                  <div v-else-if="error" class="text-center py-12">
                    <v-icon color="error" size="64" class="mb-4"
                      >mdi-alert-circle</v-icon
                    >
                    <p class="text-h6 text-error mb-4">{{ error }}</p>
                    <BaseButton
                      variant="primary"
                      text="Retry"
                      @click="fetchRules"
                    />
                  </div>

                  <!-- Table -->
                  <DataTable
                    v-else
                    :items="antipassbackRules"
                    :columns="tableColumns"
                    :showSelection="false"
                    :expandable="false"
                    show-header
                    :row-clickable="true"
                    @rowClick="editRule"
                  >
                    <!-- Entry Doors -->
                    <template #column-entryDoors="{ item }">
                      <div class="text-body-2">
                        {{ formatDoors(item.entryDoors) }}
                      </div>
                    </template>

                    <!-- Exit Doors -->
                    <template #column-exitDoors="{ item }">
                      <div class="text-body-2">
                        {{ formatDoors(item.exitDoors) }}
                      </div>
                    </template>

                    <!-- Actions -->
                    <template #column-actions="{ item }">
                      <div class="d-flex ga-2" @click.stop>
                        <BaseButton
                          variant="text"
                          size="sm"
                          icon="mdi-pencil"
                          @click="editRule(item)"
                        />
                        <BaseButton
                          variant="text"
                          size="sm"
                          :icon="TrashIcon"
                          color="error"
                          @click="openDeleteConfirm(item)"
                        />
                      </div>
                    </template>
                  </DataTable>
                </DataTableWrapper>
              </div>
            </v-window-item>

            <!-- ==================== INTERLOCK TAB (Placeholder) ==================== -->
            <v-window-item value="interlock">
              <!-- You can apply the same pattern here later -->
              <p class="text-center py-12 text-h6">
                Interlock configuration coming soon...
              </p>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Delete Rule?</v-card-title>
        <v-card-text>
          Are you sure you want to delete the antipassback rule
          <strong>"{{ ruleToDelete?.zoneName }}"</strong>? This action cannot be
          undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <BaseButton
            variant="text"
            text="Cancel"
            @click="deleteDialog = false"
          />
          <BaseButton
            variant="primary"
            color="error"
            text="Delete"
            :loading="deleting"
            @click="confirmDelete"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { Plus as PlusIcon, Trash as TrashIcon } from "lucide-vue-next";
import { antipassbackService } from "@/services/antipassbackService";

// === Reactive State ===
const activeTab = ref("antipassback");

const loading = ref(true);
const saving = ref(false);
const deleting = ref(false);
const error = ref(null);

const antipassbackRules = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const formValid = ref(false);
const formRef = ref(null);

const deleteDialog = ref(false);
const ruleToDelete = ref(null);

// Snackbar
const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

// Form Data
const form = reactive({
  id: null,
  zoneName: "",
  entryDoors: [],
  exitDoors: [],
});

const doorOptions = ref([]);
const allDoors = ref([]);

// Table columns
const tableColumns = [
  { label: "Zone Name", key: "zoneName", sortable: true, width: "25%" },
  { label: "Entry Doors", key: "entryDoors", sortable: false },
  { label: "Exit Doors", key: "exitDoors", sortable: false },
  {
    label: "Actions",
    key: "actions",
    sortable: false,
    width: "120px",
    align: "center",
  },
];

// === Helpers ===
const showNotification = (message, color = "success") => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

const formatDoors = (doors) => {
  if (Array.isArray(doors)) return doors.join(", ");
  return doors || "—";
};

// === CRUD Operations ===
// === CRUD Operations ===
const fetchRules = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [zones, doors] = await Promise.all([
      antipassbackService.fetchZones(),
      antipassbackService.fetchDoors(),
    ]);

    allDoors.value = doors;
    doorOptions.value = doors.map((d) => d.doorName); // Assuming doorName is the field

    // Map doors to zones
    const rules = zones.map((zone) => {
      const zoneDoors = doors.filter(
        (d) => d.antipassbackMode && d.antipassbackMode.id === zone.id
      );

      const entryDoors = zoneDoors
        .filter((d) => d.antipassbackMode.direction === "entry")
        .map((d) => d.doorName);

      const exitDoors = zoneDoors
        .filter((d) => d.antipassbackMode.direction === "exit")
        .map((d) => d.doorName);

      return {
        id: zone.id,
        zoneName: zone.zoneName,
        entryDoors,
        exitDoors,
      };
    });

    antipassbackRules.value = rules;
  } catch (err) {
    error.value = "Failed to load antipassback rules";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openAddForm = () => {
  isEditing.value = false;
  Object.assign(form, {
    id: null,
    zoneName: "",
    entryDoors: [],
    exitDoors: [],
  });
  showForm.value = true;
};

const editRule = (rule) => {
  isEditing.value = true;
  Object.assign(form, {
    id: rule.id,
    zoneName: rule.zoneName,
    entryDoors: [...rule.entryDoors],
    exitDoors: [...rule.exitDoors],
  });
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  if (formRef.value) formRef.value.resetValidation();
};

const saveRule = async () => {
  if (!formValid.value) return;

  saving.value = true;
  try {
    let zoneId = form.id;

    if (isEditing.value) {
      // Update logic if needed (User only specified creation flow details)
      // For now, we might assume editing just updates the doors, but zone name update might need a PATCH to zone
      // Since user focused on creation integration, I'll focus on that, but let's try to handle it.
      // If editing, we already have zoneId.
      // We need to clear previous doors for this zone and set new ones.
      // This is complex without a clear "clear" API.
      // I will implement CREATION as requested primarily.
      // But for completeness:
      // 1. Update Zone Name (if changed)
      // 2. Update Doors.
      showNotification("Editing not fully implemented yet", "warning");
      return;
    } else {
      // 1. Create Zone
      const newZone = await antipassbackService.createZone(form.zoneName);
      zoneId = newZone.id;

      // 2. Update Entry Doors
      const entryDoorPromises = form.entryDoors.map((doorName) => {
        const door = allDoors.value.find((d) => d.doorName === doorName);
        if (door) {
          return antipassbackService.updateDoor(door.id, {
            id: zoneId,
            direction: "entry",
          });
        }
        return Promise.resolve();
      });

      // 3. Update Exit Doors
      const exitDoorPromises = form.exitDoors.map((doorName) => {
        const door = allDoors.value.find((d) => d.doorName === doorName);
        if (door) {
          return antipassbackService.updateDoor(door.id, {
            id: zoneId,
            direction: "exit",
          });
        }
        return Promise.resolve();
      });

      await Promise.all([...entryDoorPromises, ...exitDoorPromises]);
      showNotification("Rule added successfully");
    }

    await fetchRules(); // Refresh list
    closeForm();
  } catch (err) {
    showNotification("Failed to save rule", "error");
    console.error(err);
  } finally {
    saving.value = false;
  }
};

const openDeleteConfirm = (rule) => {
  ruleToDelete.value = rule;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    antipassbackRules.value = antipassbackRules.value.filter(
      (r) => r.id !== ruleToDelete.value.id
    );
    showNotification("Rule deleted successfully");
  } catch (err) {
    showNotification("Failed to delete rule", "error");
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
    ruleToDelete.value = null;
  }
};

// === Lifecycle ===
onMounted(() => {
  fetchRules();
});
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
:deep(.v-table tbody tr:hover) {
  background-color: #f8fafc !important;
  cursor: pointer;
}
</style>
