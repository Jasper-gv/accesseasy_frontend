<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- Main Content -->
      <v-col cols="12">
        <v-card class="pa-4">
          <v-window v-model="activeTab">
            <!-- Antipassback Mode Tab -->
            <v-window-item value="antipassback">
              <!-- Antipassback Configuration Form -->
              <div v-if="showAntipassbackForm">
                <div class="d-flex align-center mb-4">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="mr-2"
                    @click="closeAntipassbackForm"
                  >
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                  <v-card-title class="text-h6 font-weight-bold pa-0">
                    {{
                      isEditingAntipassback
                        ? "Edit Antipassback Rule"
                        : "Add New Antipassback Rule"
                    }}
                  </v-card-title>
                </div>

                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-select
                        label="Select Main Door"
                        :items="[
                          'Main Entrance',
                          'Parking Main Gate',
                          'Server Room Main',
                        ]"
                        variant="outlined"
                        density="compact"
                        v-model="antipassbackForm.mainDoor"
                      ></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        label="Select Sub Doors"
                        :items="[
                          'Side Door A',
                          'Side Door B',
                          'Emergency Exit',
                          'Pedestrian Gate',
                          'Service Gate',
                        ]"
                        multiple
                        variant="outlined"
                        density="compact"
                        v-model="antipassbackForm.subDoors"
                      ></v-select>
                      <!-- <div class="text-caption text-medium-emphasis mt-1">
                        0/3 selected
                      </div> -->
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        label="Do not allow same door for entry/exit"
                        density="compact"
                        v-model="antipassbackForm.preventSameDoor"
                      ></v-checkbox>
                      <div class="text-caption text-medium-emphasis mt-1 ml-8">
                        When enabled, prevents the same door from being used for
                        both entry and exit access
                      </div>
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
                          @click="closeAntipassbackForm"
                        />
                        <BaseButton
                          variant="primary"
                          size="md"
                          text="Save"
                          @click="saveAntipassbackRule"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </div>

              <!-- Antipassback Rules List -->
              <div v-else>
                <div class="d-flex align-center justify-space-between mb-4">
                  <v-card-title class="text-h6 font-weight-bold pa-0">
                    Antipassback Configuration
                  </v-card-title>
                  <BaseButton
                    variant="primary"
                    size="md"
                    text="Add New Rule"
                    :leftIcon="Plus"
                    @click="openAddAntipassbackPanel"
                  />
                </div>

                <v-card-text>
                  <!-- Loading State -->
                  <SkeletonLoader
                    v-if="antipassbackLoading"
                    variant="data-table"
                    :rows="5"
                    :columns="4"
                  />

                  <!-- Antipassback Table -->
                  <DataTableWrapper v-else :showSearch="false">
                    <DataTable
                      :items="antipassbackRules"
                      :columns="[
                        // {
                        //   label: 'Rule Name',
                        //   key: 'ruleName',
                        //   sortable: true,
                        //   width: '150px',
                        // },
                        {
                          label: 'Main Door',
                          key: 'mainDoor',
                          sortable: true,
                          width: '150px',
                        },
                        {
                          label: 'Sub Doors',
                          key: 'subDoors',
                          sortable: false,
                          width: '200px',
                        },
                        // {
                        //   label: 'Created Date',
                        //   key: 'createdDate',
                        //   sortable: true,
                        //   width: '120px',
                        // },
                      ]"
                      :showSelection="false"
                      :expandable="false"
                      show-header
                      :row-clickable="true"
                    >
                      <template #actions="{ item }">
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          text="Edit"
                          @click="handleEditAntipassback(item)"
                        />
                        <BaseButton
                          variant="ghost"
                          size="sm"
                          text="Delete"
                          :leftIcon="Trash"
                          @click="deleteAntipassbackRule(item)"
                        />
                      </template>
                    </DataTable>
                  </DataTableWrapper>
                </v-card-text>
              </div>
            </v-window-item>

            <!-- Interlock Mode Tab -->
            <v-window-item value="interlock">
              <!-- Similar structure can be implemented for Interlock if needed -->
              <v-card-title
                class="text-h6 font-weight-bold d-flex align-center"
              >
                Interlock Configuration
                <v-chip size="small" color="primary" class="ml-3">
                  2 Rules
                </v-chip>
              </v-card-title>

              <v-card-text>
                <!-- Loading State -->
                <SkeletonLoader
                  v-if="interlockLoading"
                  variant="data-table"
                  :rows="5"
                  :columns="4"
                />

                <!-- Interlock Table -->
                <DataTableWrapper
                  v-else
                  title="Interlock Rules"
                  :showSearch="false"
                >
                  <template #toolbar-actions>
                    <BaseButton
                      variant="primary"
                      size="md"
                      text="Add New Rule"
                      :leftIcon="Plus"
                    />
                  </template>

                  <DataTable
                    :items="[
                      {
                        ruleName: 'Interlock 1',
                        doorsInvolved: 'Door A, Door B',
                        status: 'Active',
                        createdDate: '10/19/2025',
                      },
                      {
                        ruleName: 'Interlock 2',
                        doorsInvolved: 'Door C, Door D',
                        status: 'Inactive',
                        createdDate: '10/17/2025',
                      },
                    ]"
                    :columns="[
                      {
                        label: 'Doors Involved',
                        key: 'doorsInvolved',
                        sortable: false,
                        width: '200px',
                      },
                    ]"
                    :showSelection="false"
                    :expandable="false"
                    show-header
                    :row-clickable="true"
                  >
                    <template #actions="{ item }">
                      <BaseButton variant="ghost" size="sm" text="Edit" />
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        text="Delete"
                        :leftIcon="Trash"
                      />
                    </template>
                  </DataTable>
                </DataTableWrapper>
              </v-card-text>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { Plus, Trash } from "lucide-vue-next";

const activeTab = ref("antipassback");
const antipassbackLoading = ref(false);
const interlockLoading = ref(false);
const showAntipassbackForm = ref(false);
const isEditingAntipassback = ref(false);

// Antipassback form data
const antipassbackForm = reactive({
  mainDoor: "",
  subDoors: [],
  preventSameDoor: false,
});

// Antipassback rules data
const antipassbackRules = ref([
  {
    ruleName: "Rule 1",
    mainDoor: "Main Entrance",
    subDoors: "Side Door A, Side Door B",
    createdDate: "10/20/2025",
  },
  {
    ruleName: "Rule 2",
    mainDoor: "Parking Main Gate",
    subDoors: "Pedestrian Gate, Service Gate",
    createdDate: "10/18/2025",
  },
  {
    ruleName: "Rule 3",
    mainDoor: "Server Room Main",
    subDoors: "Server Room Emergency",
    createdDate: "10/15/2025",
  },
]);

// Methods to handle antipassback form
const openAddAntipassbackPanel = () => {
  showAntipassbackForm.value = true;
  isEditingAntipassback.value = false;
  // Reset form
  Object.assign(antipassbackForm, {
    mainDoor: "",
    subDoors: [],
    preventSameDoor: false,
  });
};

const closeAntipassbackForm = () => {
  showAntipassbackForm.value = false;
  isEditingAntipassback.value = false;
};

const handleEditAntipassback = (item) => {
  isEditingAntipassback.value = true;
  showAntipassbackForm.value = true;

  // Populate form with existing data
  antipassbackForm.mainDoor = item.mainDoor;
  antipassbackForm.subDoors = item.subDoors.split(", ");
  // You might need additional logic to set other form fields based on your data structure
};

const saveAntipassbackRule = () => {
  // Handle save logic here
  if (isEditingAntipassback.value) {
    // Update existing rule
    console.log("Updating rule:", antipassbackForm);
  } else {
    // Add new rule
    const newRule = {
      ruleName: `Rule ${antipassbackRules.value.length + 1}`,
      mainDoor: antipassbackForm.mainDoor,
      subDoors: antipassbackForm.subDoors.join(", "),
      createdDate: new Date().toLocaleDateString(),
    };
    antipassbackRules.value.unshift(newRule);
  }

  closeAntipassbackForm();
};

const deleteAntipassbackRule = (item) => {
  // Handle delete logic here
  const index = antipassbackRules.value.findIndex(
    (rule) => rule.ruleName === item.ruleName
  );
  if (index !== -1) {
    antipassbackRules.value.splice(index, 1);
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
