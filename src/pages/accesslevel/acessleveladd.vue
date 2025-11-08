<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <span class="text-h5">{{ isEditing ? "Edit" : "Add" }} Access Level</span>
      <v-spacer></v-spacer>

      <!-- Access Type Toggle -->
      <div class="d-flex align-center">
        <span class="mr-2">Access Type:</span>
        <v-switch
          v-model="accessType"
          :label="accessType ? 'Active' : 'Inactive'"
          color="primary"
          hide-details
          inset
          density="compact"
        ></v-switch>
      </div>
    </v-card-title>

    <v-card-text>
      <!-- Access Level Name Field with Save/Cancel Buttons -->
      <v-row dense class="mb-6 align-center">
        <v-col cols="12" sm="6">
          <v-text-field
            label="Access Level Name"
            placeholder="e.g. 'Staff Access'"
            variant="outlined"
            dense
            v-model="accessLevelName"
            :rules="[requiredRule]"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" class="d-flex justify-end">
          <div class="d-flex align-center">
            <BaseButton
              variant="ghost"
              text="Cancel"
              @click="$emit('cancel')"
              class="mr-2"
            ></BaseButton>
            <BaseButton
              variant="primary"
              text="Save"
              :loading="isSaving"
              @click="handleSave"
            ></BaseButton>
          </div>
        </v-col>
      </v-row>

      <!-- Access Timing Section -->
      <div class="section-title mb-4">
        <h3 class="text-h6">Access Timing</h3>
      </div>

      <v-card class="mb-6" variant="flat">
        <v-card-text class="pa-4">
          <!-- Current Active Option Message -->
          <v-alert
            v-if="
              access24Hours || accessTiming || maxWorkHours || holidayAccess
            "
            class="mb-4"
            density="compact"
            type="info"
            variant="tonal"
          >
            Current active option:
            <strong class="ml-1">
              {{ access24Hours ? "24 Hours Access" : "" }}
              {{ accessTiming ? "Time Zone" : "" }}
              {{ maxWorkHours ? "Maximum Work Hours" : "" }}
              {{ holidayAccess ? "Holiday Access" : "" }}
            </strong>
          </v-alert>

          <!-- 24 Hours Access -->
          <v-row dense class="mb-4 align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <span>24 Hours Access</span>
                  <v-chip
                    v-if="access24Hours"
                    size="small"
                    color="green"
                    class="ml-2"
                  >
                    ACTIVE
                  </v-chip>
                  <v-chip v-else size="small" color="grey" class="ml-2">
                    INACTIVE
                  </v-chip>
                </v-col>
                <v-col cols="auto" class="ml-3">
                  <v-switch
                    v-model="access24Hours"
                    :disabled="isAnyOtherTimingOptionActive('24Hours')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handle24HoursToggle"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Time Zone -->
          <v-row dense class="mb-4 align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <span>Time Zone</span>
                  <v-chip
                    v-if="accessTiming"
                    size="small"
                    color="green"
                    class="ml-2"
                  >
                    ACTIVE
                  </v-chip>
                  <v-chip v-else size="small" color="grey" class="ml-2">
                    INACTIVE
                  </v-chip>
                </v-col>
                <v-col cols="auto" class="ml-3">
                  <v-switch
                    v-model="accessTiming"
                    :disabled="isAnyOtherTimingOptionActive('timeZone')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handleAccessTimingToggle"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="4" v-if="accessTiming">
              <v-select
                label="Select Time Zone"
                :items="timeOptions"
                :loading="loadingTimeSchedules"
                variant="outlined"
                dense
                v-model="selectedTimeSchedule"
                class="small-select"
                :rules="accessTiming ? [requiredRule] : []"
              ></v-select>
            </v-col>
          </v-row>

          <!-- Max Work Hours -->
          <v-row dense class="mb-4 align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <span>Max Work Hours</span>
                  <v-chip
                    v-if="maxWorkHours"
                    size="small"
                    color="green"
                    class="ml-2"
                  >
                    ACTIVE
                  </v-chip>
                  <v-chip v-else size="small" color="grey" class="ml-2">
                    INACTIVE
                  </v-chip>
                </v-col>
                <v-col cols="auto">
                  <v-switch
                    v-model="maxWorkHours"
                    :disabled="isAnyOtherTimingOptionActive('maxWorkHours')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handleMaxWorkHoursToggle"
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
                v-model="maxWorkHoursValue"
                class="small-field"
                :rules="maxWorkHours ? [requiredRule, timeFormatRule] : []"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Holiday Access -->
          <v-row dense class="align-center">
            <v-col cols="12" sm="5">
              <v-row align="center" no-gutters>
                <v-col>
                  <span>Holiday Access</span>
                  <v-chip
                    v-if="holidayAccess"
                    size="small"
                    color="green"
                    class="ml-2"
                  >
                    ACTIVE
                  </v-chip>
                  <v-chip v-else size="small" color="grey" class="ml-2">
                    INACTIVE
                  </v-chip>
                </v-col>
                <v-col cols="auto">
                  <v-switch
                    v-model="holidayAccess"
                    :disabled="isAnyOtherTimingOptionActive('holidayAccess')"
                    hide-details
                    color="primary"
                    inset
                    density="compact"
                    @change="handleHolidayAccessToggle"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Doors Section -->
      <div class="section-title mb-4">
        <h3 class="text-h6">Doors</h3>
      </div>

      <v-card variant="flat">
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="selectedDoors"
                label="Door List"
                :items="filteredDoorOptions"
                item-title="doorName"
                item-value="id"
                variant="outlined"
                multiple
                chips
                dense
                return-object
                :loading="loadingDoors"
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
                  <v-chip v-if="index < 3" color="primary" small class="ma-1">
                    {{ item.title || item.doorName }}
                  </v-chip>
                  <span v-if="index === 3" class="text-grey text-caption">
                    (+{{ selectedDoors.length - 3 }} more)
                  </span>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { authService } from "@/services/authService";

const props = defineProps({
  tenantId: {
    type: String,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  accessLevelData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["cancel", "saved"]);

const accessLevelName = ref("");
const accessType = ref(true); // Default value is true
const access24Hours = ref(false);
const accessTiming = ref(false);
const maxWorkHours = ref(false);
const holidayAccess = ref(false);
const selectedDoors = ref([]);
const doorSearch = ref("");
const isSaving = ref(false);
const loadingTimeSchedules = ref(false);
const timeSchedules = ref([]);
const selectedTimeSchedule = ref(null);
const maxWorkHoursValue = ref("");
const accessLevelNumber = ref("");

// Door options
const doorOptions = ref([]);
const loadingDoors = ref(false);

// Validation rules
const requiredRule = (value) => !!value || "This field is required";
const timeFormatRule = (value) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value) || "Please use hh:mm format";
};

// Time options (will be populated from API)
const timeOptions = computed(() => {
  return timeSchedules.value.map((schedule) => ({
    title: schedule.displayText,
    value: schedule.displayText, // CHANGED: Use displayText (entry - exit) instead of id, so Valid_hours gets the times
    raw: schedule,
  }));
});

// Filtered door options based on search
const filteredDoorOptions = computed(() => {
  if (!doorSearch.value) return doorOptions.value;
  return doorOptions.value.filter((door) =>
    door.doorName.toLowerCase().includes(doorSearch.value.toLowerCase())
  );
});

// Check if any other timing option is active (mutual exclusion)
const isAnyOtherTimingOptionActive = (currentOption) => {
  const activeOptions = [
    { name: "24Hours", value: access24Hours.value },
    { name: "timeZone", value: accessTiming.value },
    { name: "maxWorkHours", value: maxWorkHours.value },
    { name: "holidayAccess", value: holidayAccess.value },
  ];

  return activeOptions.some(
    (option) => option.name !== currentOption && option.value === true
  );
};

// Watch for accessTiming changes to fetch time schedules
watch(accessTiming, (newVal) => {
  if (newVal && timeSchedules.value.length === 0) {
    fetchTimeSchedules();
  }
});

onMounted(async () => {
  await fetchDoors();

  if (!props.isEditing) {
    accessLevelNumber.value = await generateSequentialAccessLevelId();
  }

  if (props.isEditing && props.accessLevelData) {
    setTimeout(() => {
      initializeFormData();
    }, 100);
  }
});

const fetchDoors = async () => {
  if (!props.tenantId) {
    console.warn("No tenant ID available for loading doors");
    return;
  }

  loadingDoors.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?fields[]=id&fields[]=doorNumber&fields[]=tenant&fields[]=tenant.tenantName&fields[]=doorName&fields[]=doorType&filter[_and][0][_and][0][tenant][tenantId][_eq]=${props.tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load doors: ${response.statusText}`);
    }

    const data = await response.json();
    doorOptions.value = data.data.map((door) => ({
      id: door.id,
      doorName: door.doorName,
      doorNumber: door.doorNumber,
      doorType: door.doorType,
      tenantName: door.tenant?.tenantName || "Unknown",
    }));

    console.log("Loaded doors:", doorOptions.value);
  } catch (error) {
    console.error("Error loading doors:", error);
  } finally {
    loadingDoors.value = false;
  }
};

const initializeFormData = () => {
  const data = props.accessLevelData;
  console.log("Editing access level data:", data);

  accessLevelName.value = data.accessLevelName || "";
  accessType.value = data.accessType !== undefined ? data.accessType : true;
  accessLevelNumber.value = data.accessLevelNumber || "";

  // Initialize selected doors
  if (data.assignDoorsGroup && Array.isArray(data.assignDoorsGroup)) {
    selectedDoors.value = doorOptions.value.filter((door) =>
      data.assignDoorsGroup.includes(door.id)
    );
  } else if (data.doors && Array.isArray(data.doors)) {
    selectedDoors.value = doorOptions.value.filter((door) =>
      data.doors.includes(door.id)
    );
  }

  // Initialize timing options based on available fields
  if (data._24hrs) {
    access24Hours.value = true;
  } else if (data.Valid_hours) {
    accessTiming.value = true;
    selectedTimeSchedule.value = data.Valid_hours; // CHANGED: This now matches the time string directly
    // Fetch time schedules if needed for timing tab
    if (timeSchedules.value.length === 0) {
      fetchTimeSchedules();
    }
  } else if (data.workingHours && data.maxWorkHours) {
    maxWorkHours.value = true;
    maxWorkHoursValue.value = data.maxWorkHours;
  } else if (data.holidays) {
    holidayAccess.value = true;
  }

  console.log("Form initialized:", {
    accessLevelName: accessLevelName.value,
    accessType: accessType.value,
    selectedDoors: selectedDoors.value,
    access24Hours: access24Hours.value,
    accessTiming: accessTiming.value,
    maxWorkHours: maxWorkHours.value,
    holidayAccess: holidayAccess.value,
  });
};

// Toggle handlers to ensure only one option is active
const handle24HoursToggle = (value) => {
  if (value) {
    accessTiming.value = false;
    maxWorkHours.value = false;
    holidayAccess.value = false;
    selectedTimeSchedule.value = null;
    maxWorkHoursValue.value = "";
  }
};

const handleAccessTimingToggle = (value) => {
  if (value) {
    access24Hours.value = false;
    maxWorkHours.value = false;
    holidayAccess.value = false;
    maxWorkHoursValue.value = "";
  } else {
    selectedTimeSchedule.value = null;
  }
};

const handleMaxWorkHoursToggle = (value) => {
  if (value) {
    access24Hours.value = false;
    accessTiming.value = false;
    holidayAccess.value = false;
    selectedTimeSchedule.value = null;
  } else {
    maxWorkHoursValue.value = "";
  }
};

const handleHolidayAccessToggle = (value) => {
  if (value) {
    access24Hours.value = false;
    accessTiming.value = false;
    maxWorkHours.value = false;
    selectedTimeSchedule.value = null;
    maxWorkHoursValue.value = "";
  }
};

// Fetch time schedules from API
const fetchTimeSchedules = async () => {
  if (!props.tenantId) {
    console.warn("No tenant ID available for loading time schedules");
    return;
  }

  loadingTimeSchedules.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/time?filter[_and][0][_and][0][tenant][tenantId][_eq]=${props.tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load time schedules: ${response.statusText}`);
    }

    const data = await response.json();
    timeSchedules.value = data.data.map((slot) => ({
      id: slot.id,
      displayText: `${slot.entryTime} - ${slot.exitTime}`,
      entryTime: slot.entryTime,
      exitTime: slot.exitTime,
      tenantName: slot.tenant?.tenantName || "Unknown",
    }));

    console.log("Loaded time schedules:", timeSchedules.value);
  } catch (error) {
    console.error("Error loading time schedules:", error);
  } finally {
    loadingTimeSchedules.value = false;
  }
};

const filterDoors = () => {
  // This is handled by the computed property filteredDoorOptions
};

const handleSave = async () => {
  if (!accessLevelName.value.trim()) {
    alert("Please enter an access level name");
    return;
  }

  // For new records, ensure we have a generated access level number
  if (!props.isEditing && !accessLevelNumber.value) {
    alert("Error: Could not generate access level number");
    return;
  }

  // Validate timing options
  if (accessTiming.value && !selectedTimeSchedule.value) {
    alert("Please select a time schedule when 'Time Zone' is enabled");
    return;
  }

  if (maxWorkHours.value && !maxWorkHoursValue.value) {
    alert("Please enter max work hours when 'Max Work Hours' is enabled");
    return;
  }

  if (maxWorkHours.value && !timeFormatRule(maxWorkHoursValue.value)) {
    alert("Please enter max work hours in valid hh:mm format");
    return;
  }

  isSaving.value = true;
  try {
    const payload = buildPayload();
    console.log("Saving payload:", payload);

    const url = props.isEditing
      ? `${import.meta.env.VITE_API_URL}/items/accesslevels/${props.accessLevelData.id}`
      : `${import.meta.env.VITE_API_URL}/items/accesslevels`;

    const method = props.isEditing ? "PATCH" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to ${props.isEditing ? "update" : "create"} access level: ${response.statusText}. ${errorText}`
      );
    }

    const result = await response.json();
    console.log(
      `${props.isEditing ? "Updated" : "Created"} access level:`,
      result
    );

    emit("saved", result.data);
  } catch (error) {
    console.error("Error saving access level:", error);
    alert(`Failed to save access level: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

async function generateSequentialAccessLevelId() {
  try {
    const tenantId = props.tenantId;
    const url =
      `${import.meta.env.VITE_API_URL}/items/accesslevels` +
      `?filter[tenant][tenantId][_eq]=${tenantId}` +
      `&sort[]=-accessLevelNumber&limit=1`;

    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) throw new Error(resp.statusText);

    const { data } = await resp.json();

    if (!data?.length) return "1";

    const last = parseInt(data[0].accessLevelNumber, 10);
    return (isNaN(last) ? 1 : last + 1).toString();
  } catch (e) {
    console.error("Error generating access level ID:", e);
    return "1";
  }
}

const buildPayload = () => {
  const payload = {
    accessLevelName: accessLevelName.value.trim(),
    accessType: accessType.value,
    tenant: props.tenantId,
  };

  // Include accessLevelNumber for NEW records only
  if (!props.isEditing) {
    payload.accessLevelNumber = accessLevelNumber.value;
  }

  // Doors
  if (selectedDoors.value.length) {
    payload.assignDoorsGroup = selectedDoors.value.map((d) => d.id);
  }

  // Timing (only one active)
  if (access24Hours.value) {
    payload._24hrs = true;
    payload.Valid_hours = "24_hours";
  } else if (accessTiming.value && selectedTimeSchedule.value) {
    payload.Valid_hours = selectedTimeSchedule.value;
  } else if (maxWorkHours.value && maxWorkHoursValue.value) {
    payload.workingHours = true;
    payload.maxWorkHours = maxWorkHoursValue.value;
  } else if (holidayAccess.value) {
    payload.holidays = true;
  }

  return payload;
};

watch(
  () => props.isEditing,
  async (isEdit) => {
    if (!isEdit) {
      accessLevelNumber.value = await generateSequentialAccessLevelId();
    }
  },
  { immediate: true }
);
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

.section-title {
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}
</style>
