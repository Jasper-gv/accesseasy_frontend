<template>
  <v-container fluid>
    <v-row>
      <!-- Left Side: Tabs -->
      <v-col cols="3">
        <v-tabs
          v-model="activeTab"
          direction="vertical"
          color="primary"
          class="tabs"
        >
          <v-tab value="basic">Basic Details</v-tab>
          <v-tab
            v-for="doorTab in doorTabs"
            :key="doorTab.value"
            :value="doorTab.value"
          >
            {{ doorTab.label }}
          </v-tab>
        </v-tabs>
      </v-col>

      <!-- Right Side: Tab Content -->
      <v-col cols="9">
        <v-window v-model="activeTab">
          <!-- Basic Details Tab -->
          <v-window-item value="basic">
            <v-card>
              <v-card-title>Basic Details</v-card-title>
              <v-card-text>
                <v-form ref="formRef" @submit.prevent="handleSave">
                  <v-select
                    v-model="form.controllerName"
                    label="Device Type"
                    :items="deviceTypes"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    :rules="[(v) => !!v || 'Device type is required']"
                    required
                    @update:model-value="handleDeviceTypeChange"
                  ></v-select>
                  <v-text-field
                    v-model="form.deviceName"
                    label="Device Name"
                    variant="outlined"
                    :rules="[(v) => !!v || 'Device name is required']"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="form.serialNumber"
                    label="Serial Number"
                    required
                    variant="outlined"
                    :rules="[(v) => !!v || 'Serial number is required']"
                  ></v-text-field>
                  <v-select
                    v-model="form.branch"
                    label="Branch"
                    :items="props.branches"
                    item-title="locdetail.locationName"
                    item-value="id"
                    variant="outlined"
                    :loading="loadingBranches"
                    :rules="[(v) => !!v || 'Branch is required']"
                    required
                  ></v-select>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Dynamic Door Tabs -->
          <v-window-item
            v-for="doorTab in doorTabs"
            :key="doorTab.value"
            :value="doorTab.value"
          >
            <v-card>
              <v-card-title>{{ doorTab.label }}</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="saveDoor(doorTab.value)">
                  <v-select
                    v-model="form.doors[doorTab.value].selectedDoor"
                    label="Select Door"
                    :items="getAvailableDoorsForTab(doorTab.value)"
                    item-title="doorName"
                    item-value="id"
                    variant="outlined"
                    clearable
                    :rules="[
                      // Only validate if a door is selected
                      (v) => !v || !!v || 'Please select a valid door',
                    ]"
                    @update:model-value="onDoorSelectionChange(doorTab.value)"
                  ></v-select>

                  <!-- Configuration options (only show if door is selected) -->
                  <div v-if="form.doors[doorTab.value].selectedDoor">
                    <!-- Split cards in one row -->
                    <v-row>
                      <!-- Door Open Duration Card -->
                      <v-col cols="6">
                        <v-card outlined class="mb-4">
                          <v-card-text>
                            <v-row dense>
                              <v-col cols="12">
                                <div>
                                  <span class="font-weight-medium"
                                    >Door open duration</span
                                  ><br />
                                </div>
                              </v-col>
                              <v-col cols="12">
                                <v-text-field
                                  v-model.number="
                                    form.doors[doorTab.value].dotlDuration
                                  "
                                  label="Duration (seconds)"
                                  type="number"
                                  variant="outlined"
                                  dense
                                  class="small-field"
                                  :min="1"
                                  :max="99"
                                  :rules="[
                                    (v) => !!v || 'Duration is required',
                                  ]"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>

                      <!-- DOTL Alarm Delay Card -->
                      <v-col cols="6">
                        <v-card outlined class="mb-4">
                          <v-card-text>
                            <v-row dense>
                              <v-col cols="12">
                                <div>
                                  <span class="font-weight-medium"
                                    >DOTL Alarm Delay</span
                                  ><br />
                                </div>
                              </v-col>
                              <v-col cols="12">
                                <v-row dense align="center">
                                  <v-col cols="8">
                                    <v-text-field
                                      v-model.number="
                                        form.doors[doorTab.value].dotlDelay
                                      "
                                      label="Delay (seconds)"
                                      type="number"
                                      variant="outlined"
                                      dense
                                      class="small-field"
                                      :min="1"
                                      :max="99"
                                      :disabled="
                                        !form.doors[doorTab.value].alarmEnabled
                                      "
                                      :rules="[
                                        (v) =>
                                          !form.doors[doorTab.value]
                                            .alarmEnabled ||
                                          !!v ||
                                          'Delay is required when alarm is enabled',
                                      ]"
                                    ></v-text-field>
                                  </v-col>
                                  <v-col cols="4" class="text-right">
                                    <v-switch
                                      v-model="
                                        form.doors[doorTab.value].alarmEnabled
                                      "
                                      label="Alarm"
                                      color="primary"
                                      inset
                                      hide-details
                                    ></v-switch>
                                  </v-col>
                                </v-row>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-card outlined class="mb-4">
                      <v-card-text>
                        <v-row dense align="center">
                          <v-col cols="12" sm="6">
                            <div>
                              <span class="font-weight-medium"
                                >Unauthorised when the door is open</span
                              ><br />
                            </div>
                          </v-col>
                          <v-col cols="12" sm="6" class="d-flex justify-end">
                            <v-switch
                              v-model="form.doors[doorTab.value].sensorStatus"
                              color="primary"
                              inset
                              hide-details
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>

                    <v-card outlined class="mb-4">
                      <v-card-text>
                        <v-row dense align="center">
                          <v-col cols="12" sm="6">
                            <div>
                              <span class="font-weight-medium"
                                >Schedule door opening</span
                              ><br />
                            </div>
                          </v-col>
                          <v-col cols="12" sm="6" class="d-flex justify-end">
                            <v-switch
                              v-model="form.doors[doorTab.value].passageStatus"
                              color="primary"
                              inset
                              hide-details
                              @update:model-value="
                                onPassageStatusChange(doorTab.value)
                              "
                            ></v-switch>
                          </v-col>
                          <v-col
                            cols="12"
                            v-if="form.doors[doorTab.value].passageStatus"
                          >
                            <v-radio-group
                              v-model="form.doors[doorTab.value].passageMode"
                              inline
                              @update:model-value="
                                onPassageModeChange(doorTab.value)
                              "
                            >
                              <v-radio
                                label="24 Hours Access"
                                value="24hours"
                              ></v-radio>
                              <v-radio
                                label="Limit Time"
                                value="limittime"
                              ></v-radio>
                            </v-radio-group>

                            <!-- Time Slot Dropdown for Limit Time -->
                            <v-select
                              v-if="
                                form.doors[doorTab.value].passageMode ===
                                'limittime'
                              "
                              v-model="form.doors[doorTab.value].scheduleTime"
                              label="Select Schedule Time"
                              :items="timeSlots"
                              item-title="displayText"
                              item-value="id"
                              variant="outlined"
                              :loading="loadingTimeSlots"
                              :rules="[
                                (v) =>
                                  form.doors[doorTab.value].passageMode !==
                                    'limittime' ||
                                  !!v ||
                                  'Schedule time is required for Limit Time mode',
                              ]"
                              clearable
                            ></v-select>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Message when no door is selected -->
                  <div v-else class="text-center text-grey py-4">
                    <v-icon size="48" color="grey lighten-1" class="mb-2">
                      mdi-door
                    </v-icon>
                    <div>No door selected for this slot</div>
                    <div class="text-caption">
                      Select a door above to configure settings
                    </div>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>

        <!-- Common Action Buttons -->
        <v-row class="mt-4">
          <v-col class="d-flex justify-end">
            <BaseButton
              variant="ghost"
              text="Cancel"
              @click="handleCancel"
              class="mr-2"
            ></BaseButton>
            <BaseButton
              variant="primary"
              text="Save"
              :loading="isSaving"
              @click="handleSave"
            ></BaseButton>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Snackbar for Toasts -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.type" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  defineProps,
  defineEmits,
  computed,
  watch,
} from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { authService } from "@/services/authService";

const props = defineProps({
  tenantId: String,
  branches: Array,
  availableDoors: Array,
  editingDevice: Object,
});

const emit = defineEmits(["save-success", "cancel"]);

const activeTab = ref("basic");
const isSaving = ref(false);
const formRef = ref(null);
const snackbar = ref({ show: false, message: "", type: "success" });
const loadingBranches = ref(false);
const loadingTimeSlots = ref(false);
const timeSlots = ref([]);

// Device type options
const deviceTypes = [
  { label: "4 Door Device", value: "4 Door Device" },
  { label: "Finger Print", value: "Finger Print" },
  { label: "AI", value: "AI" },
];

// Dynamic door tabs based on device type
const doorTabs = computed(() => {
  if (form.controllerName === "4 Door Device") {
    return [
      { label: "DOOR1", value: "door1" },
      { label: "DOOR2", value: "door2" },
      { label: "DOOR3", value: "door3" },
      { label: "DOOR4", value: "door4" },
    ];
  } else if (
    form.controllerName === "Finger Print" ||
    form.controllerName === "AI"
  ) {
    return [{ label: "DOOR1", value: "door1" }];
  }
  return [];
});

// Get assigned door IDs across all tabs
const allAssignedDoorIds = computed(() => {
  const assigned = new Set();

  // Add doors already assigned to other devices from props
  if (props.availableDoors) {
    props.availableDoors.forEach((door) => {
      // Assuming doors that have deviceId in doorsConfigure are already assigned
      if (door.doorsConfigure && door.doorsConfigure.deviceId) {
        assigned.add(door.id);
      }
    });
  }

  // Add doors currently being selected in this form
  Object.values(form.doors).forEach((door) => {
    if (door.selectedDoor) {
      assigned.add(door.selectedDoor);
    }
  });

  return assigned;
});

// Get available doors for a specific tab (excluding already assigned doors in other tabs)
const getAvailableDoorsForTab = (currentTab) => {
  if (!props.availableDoors) return [];

  return props.availableDoors.filter((door) => {
    const isAssigned = allAssignedDoorIds.value.has(door.id);
    const isAssignedToCurrentTab =
      form.doors[currentTab]?.selectedDoor === door.id;

    return !isAssigned || isAssignedToCurrentTab;
  });
};

// Get selected doors count
const selectedDoorsCount = computed(() => {
  return Object.values(form.doors).filter((door) => door.selectedDoor).length;
});

// Initialize form with empty values
const form = reactive({
  controllerName: "",
  deviceName: "",
  serialNumber: "",
  branch: "",
  connectionStatus: "Disconnected",
  controllerStatus: "Waiting",
  doors: {
    door1: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "24hours",
      scheduleTime: null, // Changed from selectedTimeSlot to scheduleTime
    },
    door2: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "24hours",
      scheduleTime: null, // Changed from selectedTimeSlot to scheduleTime
    },
    door3: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "24hours",
      scheduleTime: null, // Changed from selectedTimeSlot to scheduleTime
    },
    door4: {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "24hours",
      scheduleTime: null, // Changed from selectedTimeSlot to scheduleTime
    },
  },
});

// Watch for tenant changes to load time slots
watch(
  () => props.tenantId,
  (newTenantId) => {
    if (newTenantId) {
      loadTimeSlots();
    }
  }
);

// Handle device type change
const handleDeviceTypeChange = (newDeviceType) => {
  activeTab.value = "basic";
  resetDoorConfigurations(newDeviceType);
};

// Reset door configurations based on device type
const resetDoorConfigurations = (deviceType) => {
  const defaultDoorConfig = {
    selectedDoor: "",
    dotlDuration: "",
    sensorStatus: false,
    dotlDelay: "",
    alarmEnabled: false,
    passageStatus: false,
    passageMode: "24hours",
    scheduleTime: null, // Changed from selectedTimeSlot to scheduleTime
  };

  Object.keys(form.doors).forEach((key) => {
    form.doors[key] = { ...defaultDoorConfig };
  });
};

// Load time slots from API
const loadTimeSlots = async () => {
  if (!props.tenantId) {
    console.warn("No tenant ID available for loading time slots");
    return;
  }

  loadingTimeSlots.value = true;
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
      throw new Error(`Failed to load time slots: ${response.statusText}`);
    }

    const data = await response.json();
    timeSlots.value = data.data.map((slot) => ({
      id: slot.id,
      displayText: `${slot.entryTime} - ${slot.exitTime}`,
      entryTime: slot.entryTime,
      exitTime: slot.exitTime,
      tenantName: slot.tenant?.tenantName || "Unknown",
    }));

    console.log("Loaded time slots:", timeSlots.value);
  } catch (error) {
    console.error("Error loading time slots:", error);
    showToast("Failed to load time slots", "error");
  } finally {
    loadingTimeSlots.value = false;
  }
};

// Handle door selection change
const onDoorSelectionChange = (doorKey) => {
  console.log(`Door ${doorKey} selected:`, form.doors[doorKey].selectedDoor);

  // If door selection is cleared, reset the configuration
  if (!form.doors[doorKey].selectedDoor) {
    form.doors[doorKey] = {
      selectedDoor: "",
      dotlDuration: "",
      sensorStatus: false,
      dotlDelay: "",
      alarmEnabled: false,
      passageStatus: false,
      passageMode: "24hours",
      scheduleTime: null, // Changed from selectedTimeSlot to scheduleTime
    };
  }
};

// Handle passage status change
const onPassageStatusChange = (doorKey) => {
  const doorConfig = form.doors[doorKey];
  if (doorConfig.passageStatus && doorConfig.passageMode === "limittime") {
    if (timeSlots.value.length === 0 && props.tenantId) {
      loadTimeSlots();
    }
  }
};

// Handle passage mode change
const onPassageModeChange = (doorKey) => {
  const doorConfig = form.doors[doorKey];
  if (doorConfig.passageMode === "limittime" && doorConfig.passageStatus) {
    if (timeSlots.value.length === 0 && props.tenantId) {
      loadTimeSlots();
    }
  } else if (doorConfig.passageMode === "24hours") {
    doorConfig.scheduleTime = null; // Changed from selectedTimeSlot to scheduleTime
  }
};

// Check if device serial number already exists
const checkDeviceExists = async (serialNumber) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[sn][_eq]=${encodeURIComponent(
        serialNumber
      )}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check device: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.length > 0;
  } catch (error) {
    console.error("Error checking device:", error);
    return false;
  }
};

// Map door configuration to backend fields
const mapDoorConfigToBackend = (doorConfig, deviceId) => {
  let scheduleTimeValue = null;

  if (doorConfig.passageStatus) {
    if (doorConfig.passageMode === "24hours") {
      // 24-hour access → send full-day range as object
      scheduleTimeValue = {
        entryTime: "00:00:00",
        exitTime: "23:59:59",
      };
    } else if (
      doorConfig.passageMode === "limittime" &&
      doorConfig.scheduleTime
    ) {
      // For limit time mode, find the selected time slot and extract entry/exit times
      const selectedTimeSlot = timeSlots.value.find(
        (slot) => slot.id === doorConfig.scheduleTime
      );
      if (selectedTimeSlot) {
        scheduleTimeValue = {
          entryTime: selectedTimeSlot.entryTime,
          exitTime: selectedTimeSlot.exitTime,
        };
      }
    }
  }

  return {
    deviceId: deviceId,
    doorOpenTimer: doorConfig.dotlDuration || null,
    delayTimer: doorConfig.alarmEnabled ? doorConfig.dotlDelay || null : null,
    sensorMode: doorConfig.sensorStatus,
    passiveMode: doorConfig.passageStatus,
    scheduleTime: scheduleTimeValue, // ← Now this is always an object with entryTime/exitTime or null
  };
};

// Validate door configuration for a specific door
const validateDoorConfiguration = (doorKey) => {
  const doorConfig = form.doors[doorKey];

  // If no door is selected, no validation needed
  if (!doorConfig.selectedDoor) {
    return true;
  }

  // Validate duration
  if (!doorConfig.dotlDuration) {
    showToast(
      `Please enter door open duration for ${doorKey.toUpperCase()}`,
      "error"
    );
    return false;
  }

  if (doorConfig.alarmEnabled && !doorConfig.dotlDelay) {
    showToast(`Please enter alarm delay for ${doorKey.toUpperCase()}`, "error");
    return false;
  }

  if (
    doorConfig.passageStatus &&
    doorConfig.passageMode === "limittime" &&
    !doorConfig.scheduleTime
  ) {
    showToast(
      `Please select a schedule time for ${doorKey.toUpperCase()}`,
      "error"
    );
    return false;
  }

  return true;
};

// Save device by making API call
const saveDevice = async () => {
  if (!formRef.value) {
    showToast("Form reference not available.", "error");
    return;
  }

  const { valid } = await formRef.value.validate();
  if (!valid) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  if (selectedDoorsCount.value === 0) {
    showToast("Please select at least one door for the device.", "error");
    activeTab.value = "door1";
    return;
  }

  for (const doorTab of doorTabs.value) {
    const doorConfig = form.doors[doorTab.value];
    if (doorConfig.selectedDoor && !validateDoorConfiguration(doorTab.value)) {
      activeTab.value = doorTab.value;
      return;
    }
  }

  if (!props.editingDevice && (await checkDeviceExists(form.serialNumber))) {
    showToast("Device with this serial number already exists.", "error");
    return;
  }

  isSaving.value = true;
  try {
    const selectedDoors = doorTabs.value
      .map((tab) => form.doors[tab.value].selectedDoor)
      .filter(Boolean);

    const devicePayload = {
      branchDetails: form.branch,
      controllerName: form.controllerName,
      deviceName: form.deviceName || form.controllerName,
      sn: form.serialNumber,
      tenant: props.tenantId,
      connectionStatus: form.connectionStatus,
      controllerStatus: form.controllerStatus,
      selectedDoors: selectedDoors,
    };

    let deviceResponse;
    let deviceId;

    if (props.editingDevice) {
      deviceResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/controllers/${props.editingDevice.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(devicePayload),
        }
      );
      deviceId = props.editingDevice.id;
    } else {
      // Create new device
      devicePayload.id = form.serialNumber;

      deviceResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/controllers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authService.getToken()}`,
          },
          body: JSON.stringify(devicePayload),
        }
      );
    }

    if (!deviceResponse.ok) {
      const errorData = await deviceResponse.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `API call failed with status: ${deviceResponse.status}`
      );
    }

    const deviceResult = await deviceResponse.json();
    if (!props.editingDevice) {
      deviceId = deviceResult.data.id;
    }

    // ==================== UPDATED DOOR UPDATE LOGIC ====================
    const doorUpdatePromises = doorTabs.value
      .map((doorTab) => {
        const doorConfig = form.doors[doorTab.value];

        // Skip tabs with no door selected
        if (!doorConfig.selectedDoor) return null;

        const doorsConfigure = mapDoorConfigToBackend(doorConfig, deviceId);
        const payload = {
          id: doorConfig.selectedDoor,
          doorsConfigure: doorsConfigure,
        };

        console.log(
          `Updating door ${doorTab.value} configuration: ${JSON.stringify(payload)}`
        );

        return fetch(
          `${import.meta.env.VITE_API_URL}/items/doors/${doorConfig.selectedDoor}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(payload),
          }
        );
      })
      .filter(Boolean); // Remove null entries (unselected doors)

    // Only run door updates if there are any
    if (doorUpdatePromises.length > 0) {
      const doorResponses = await Promise.all(doorUpdatePromises);

      // Only count actual failed HTTP responses
      const failedDoors = doorResponses.filter((response) => !response.ok);
      if (failedDoors.length > 0) {
        throw new Error(`Failed to update ${failedDoors.length} door(s)`);
      }
    }
    // =====================================================================

    // Emit success event
    emit("save-success", {
      device: props.editingDevice
        ? { ...props.editingDevice, ...devicePayload }
        : deviceResult.data,
      doors: doorTabs.value
        .map((tab) => ({
          doorId: form.doors[tab.value].selectedDoor,
          configuration: form.doors[tab.value],
        }))
        .filter((door) => door.doorId),
      isEdit: !!props.editingDevice,
    });

    showToast(
      `Device ${props.editingDevice ? "updated" : "saved"} successfully!`,
      "success"
    );
  } catch (error) {
    console.error("Error saving device and doors:", error);
    showToast(
      error.message ||
        `Failed to ${props.editingDevice ? "update" : "save"} device. Please try again.`,
      "error"
    );
  } finally {
    isSaving.value = false;
  }
};

// Handle save based on active tab
const handleSave = () => {
  saveDevice();
};

// Handle cancel based on active tab
const handleCancel = () => {
  emit("cancel");
};

// Show toast notification
const showToast = (message, type = "success") => {
  snackbar.value = { show: true, message, type };
};

// Initialize form
const initializeForm = () => {
  if (props.editingDevice) {
    // Populate form with existing device data for editing
    form.controllerName = props.editingDevice.controllerName || "";
    form.deviceName = props.editingDevice.deviceName || "";
    form.serialNumber = props.editingDevice.sn || "";
    form.branch = props.editingDevice.branchDetails || "";
    form.connectionStatus =
      props.editingDevice.status === "approved" ? "Connected" : "Disconnected";
    form.controllerStatus = props.editingDevice.controllerStatus || "Waiting";

    // Reset door configurations first
    resetDoorConfigurations(form.controllerName);

    // Then populate door configurations if available
    if (
      props.editingDevice.selectedDoors &&
      props.editingDevice.selectedDoors.length > 0
    ) {
      // Load door configurations for each selected door
      loadDoorConfigurations(props.editingDevice.selectedDoors);
    }
  } else {
    // New device - initialize empty form
    form.controllerName = "";
    form.deviceName = "";
    form.serialNumber = "";
    form.branch = "";
    form.connectionStatus = "Disconnected";
    form.controllerStatus = "Waiting";
    resetDoorConfigurations("");
  }
};

const loadDoorConfigurations = async (selectedDoorIds) => {
  try {
    // For each door tab, try to find and populate the configuration
    doorTabs.value.forEach((tab, index) => {
      if (index < selectedDoorIds.length) {
        const doorId = selectedDoorIds[index];
        const door = props.availableDoors.find((d) => d.id === doorId);

        if (door) {
          form.doors[tab.value].selectedDoor = doorId;

          // Populate door configuration if available
          if (door.doorsConfigure) {
            const config = door.doorsConfigure;
            form.doors[tab.value].dotlDuration = config.doorOpenTimer || "";
            form.doors[tab.value].sensorStatus = config.sensorMode || false;
            form.doors[tab.value].dotlDelay = config.delayTimer || "";
            form.doors[tab.value].alarmEnabled = !!config.delayTimer;
            form.doors[tab.value].passageStatus = config.passiveMode || false;

            // Handle scheduleTime - it should be an object with entryTime/exitTime
            if (
              config.scheduleTime &&
              typeof config.scheduleTime === "object"
            ) {
              const scheduleTime = config.scheduleTime;

              // Check if it's 24-hour access
              if (
                scheduleTime.entryTime === "00:00:00" &&
                scheduleTime.exitTime === "23:59:59"
              ) {
                form.doors[tab.value].passageMode = "24hours";
                form.doors[tab.value].scheduleTime = null;
              } else {
                // It's limit time - find matching time slot
                form.doors[tab.value].passageMode = "limittime";
                const matchingSlot = timeSlots.value.find(
                  (slot) =>
                    slot.entryTime === scheduleTime.entryTime &&
                    slot.exitTime === scheduleTime.exitTime
                );
                form.doors[tab.value].scheduleTime = matchingSlot
                  ? matchingSlot.id
                  : null;
              }
            } else {
              form.doors[tab.value].passageMode = "24hours";
              form.doors[tab.value].scheduleTime = null;
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error loading door configurations:", error);
  }
};

// Load initial data
onMounted(async () => {
  console.log("Branches received:", props.branches);
  console.log("Doors received:", props.availableDoors);
  console.log("Tenant ID:", props.tenantId);

  if (props.availableDoors && props.availableDoors.length > 0) {
    console.log(
      "Available door names:",
      props.availableDoors.map((door) => door.doorName)
    );
  }

  if (props.tenantId) {
    loadTimeSlots();
  }

  initializeForm();
});
</script>

<style scoped>
.tabs {
  border-right: 1px solid #ddd;
  height: 100%;
}
.v-card {
  padding: 16px;
}
.small-field {
  max-width: 150px;
}
</style>
