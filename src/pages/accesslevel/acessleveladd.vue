<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">Add Access Level</span>
    </v-card-title>

    <v-card-text>
      <!-- Access Level Name Field (Always Visible) -->
      <v-row dense class="mb-4">
        <v-col cols="12" sm="6">
          <v-text-field
            label="Access Level Name"
            placeholder="e.g. 'Staff Access'"
            variant="outlined"
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row dense>
        <!-- Left Sidebar for Tabs -->
        <v-col cols="3">
          <v-list nav density="compact">
            <v-list-item
              @click="currentTab = 'timing'"
              :active="currentTab === 'timing'"
              rounded="xl"
              value="timing"
            >
              <v-list-item-title>Access Timing</v-list-item-title>
            </v-list-item>
            <v-list-item
              @click="currentTab = 'doors'"
              :active="currentTab === 'doors'"
              rounded="xl"
              value="doors"
            >
              <v-list-item-title>Doors</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <!-- Right Content Area -->
        <v-col cols="9">
          <v-window v-model="currentTab">
            <!-- Access Timing Tab -->
            <v-window-item value="timing">
              <v-card variant="flat" class="mt-2">
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-row align="center" no-gutters>
                        <v-col>
                          <span>24 Hours Access</span>
                        </v-col>
                        <v-col cols="auto">
                          <v-switch
                            v-model="access24Hours"
                            :disabled="
                              accessTiming || maxWorkHours || holidayAccess
                            "
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-row align="center" no-gutters>
                        <v-col>
                          <span>Limit Access Time</span>
                        </v-col>
                        <v-col cols="auto">
                          <v-switch
                            v-model="accessTiming"
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" sm="4" v-if="accessTiming">
                      <v-select
                        label="Select Time Range"
                        :items="timeOptions"
                        variant="outlined"
                        dense
                        class="small-select"
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-row align="center" no-gutters>
                        <v-col>
                          <span>Max Work Hours</span>
                        </v-col>
                        <v-col cols="auto">
                          <v-switch
                            v-model="maxWorkHours"
                            :disabled="accessTiming"
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-col>
                    <v-col cols="12" sm="4" v-if="maxWorkHours">
                      <v-text-field
                        label="Max Hours"
                        placeholder="hh:mm"
                        variant="outlined"
                        dense
                        class="small-field"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-row align="center" no-gutters>
                        <v-col>
                          <span>Holiday Access</span>
                        </v-col>
                        <v-col cols="auto">
                          <v-switch
                            v-model="holidayAccess"
                            :disabled="accessTiming"
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-window-item>

            <!-- Doors Tab -->
            <v-window-item value="doors">
              <v-card variant="flat" class="mt-2">
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12">
                      <v-select
                        v-model="selectedDoors"
                        label="Door List"
                        :items="filteredDoorOptions"
                        variant="outlined"
                        multiple
                        chips
                        dense
                        return-object
                      >
                        <!-- Custom search input slot -->
                        <template v-slot:prepend-item>
                          <v-text-field
                            v-model="doorSearch"
                            label="Search Doors"
                            variant="outlined"
                            dense
                            class="ma-2"
                            @input="filterDoors"
                          ></v-text-field>
                          <v-divider></v-divider>
                        </template>
                        <!-- Display selected doors as chips -->
                        <template v-slot:selection="{ item, index }">
                          <v-chip
                            v-if="index < 3"
                            color="primary"
                            small
                            class="ma-1"
                          >
                            {{ item }}
                          </v-chip>
                          <span
                            v-if="index === 3"
                            class="text-grey text-caption"
                          >
                            (+{{ selectedDoors.length - 3 }} more)
                          </span>
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-window-item>
          </v-window>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <BaseButton
        variant="ghost"
        text="Cancel"
        @click="$emit('close')"
      ></BaseButton>
      <BaseButton
        variant="primary"
        text="Save"
        :loading="isSaving"
        @click="handleSave"
      ></BaseButton>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const currentTab = ref("timing");
const access24Hours = ref(false);
const accessTiming = ref(false);
const maxWorkHours = ref(false);
const holidayAccess = ref(false);
const selectedDoors = ref([]);
const doorSearch = ref("");
const isSaving = ref(false);

// Door options
const doorOptions = ref([
  "Main Entrance",
  "Back Door",
  "Server Room",
  "Office Area",
  "Parking Gate",
]);

// Time options
const timeOptions = ref(["09:00 - 17:00", "08:00 - 16:00", "10:00 - 18:00"]);

// Filtered door options based on search
const filteredDoorOptions = computed(() => {
  if (!doorSearch.value) return doorOptions.value;
  return doorOptions.value.filter((door) =>
    door.toLowerCase().includes(doorSearch.value.toLowerCase())
  );
});

// Filter doors based on search input
const filterDoors = () => {
  // The computed property handles the filtering
};

// Handle Save button click
const handleSave = () => {
  isSaving.value = true;
  // Simulate async save operation
  setTimeout(() => {
    isSaving.value = false;
    // Perform save logic here
  }, 1500);
};
</script>

<style scoped>
.small-select,
.small-field {
  max-width: 200px;
  font-size: 14px;
}
.small-select :deep(.v-field),
.small-field :deep(.v-field) {
  min-height: 40px;
  padding: 4px 8px;
}
.small-select :deep(.v-select__selection-text),
.small-field :deep(.v-input__control) {
  font-size: 14px;
}
</style>
