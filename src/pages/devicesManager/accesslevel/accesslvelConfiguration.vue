<template>
  <div>
    <v-form ref="form" v-model="valid" @submit.prevent="handleSave">
      <!-- Loading overlay for the entire form -->
      <v-overlay v-model="isSaving">
        <div class="mt-4 text-center">
          <div v-if="saveError" class="text-error mb-2">
            {{ saveError }}
          </div>
          <div v-else class="text-body-2">Saving access level...</div>
        </div>
      </v-overlay>

      <v-toolbar density="compact" color="grey-lighten-4">
        <div class="d-flex align-center">
          <span class="text-h7">Edit Access Level</span>
          <div class="access-level-name ml-2">
            <v-icon size="medium" color="black">mdi-account-lock</v-icon>
            <span class="ml-1">{{ formData.accessLevelName }}</span>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          class="mr-2"
          :disabled="isSaving"
          @click="$emit('close')"
        >
          CANCEL
        </v-btn>
        <v-btn
          v-if="selectedTab === 'basic'"
          :loading="isSaving"
          :disabled="isSaving || !formIsValid"
          style="background-color: black"
          color="white"
          @click="handleSave"
        >
          SAVE
        </v-btn>
      </v-toolbar>

      <!-- Success/Error Message -->
      <v-snackbar
        v-model="showMessage"
        :color="messageType"
        :timeout="messageTimeout"
        rounded="pill"
        multi-line
        location="top"
        class="mt-4"
      >
        {{ messageText }}
        <template v-slot:actions>
          <v-btn color="white" variant="text" @click="showMessage = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>

      <div class="d-flex content-wrapper">
        <div class="side-nav pa-4">
          <v-list density="compact" nav>
            <v-list-item
              v-for="(item, i) in menuItems"
              :key="i"
              :value="item"
              :active="selectedTab === item.value"
              @click="selectedTab = item.value"
              color="black"
              rounded
              :class="{ 'has-error': tabHasError(item.value) && !isSaving }"
              :disabled="isSaving"
            >
              <template v-slot:prepend>
                <v-icon
                  :icon="item.icon"
                  :color="tabHasError(item.value) ? 'error' : 'default'"
                ></v-icon>
              </template>
              <v-list-item-title>
                {{ item.title }}
                <v-icon
                  v-if="tabHasError(item.value)"
                  color="error"
                  size="small"
                  class="ms-2"
                >
                  mdi-alert-circle
                </v-icon>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Content Area -->
        <div class="content-area pa-4">
          <v-card flat>
            <v-window v-model="selectedTab">
              <v-window-item value="basic">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.accessType"
                      label="Access Type"
                      color="success"
                      hide-details
                      inset
                      readonly
                      class="mr-6"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="time-section">
                      <div class="time-label">Valid Hours</div>

                      <!-- Toggle button for Valid Hours -->
                      <v-switch
                        v-model="formData.isValidHoursEnabled"
                        label="Enable Valid Hours"
                        color="success"
                        hide-details
                        inset
                        class="mr-6 mb-4"
                        @update:model-value="handleValidHoursToggle"
                      ></v-switch>

                      <!-- Time options - only show when valid hours is enabled -->
                      <div
                        v-if="
                          formData.isValidHoursEnabled && !formData.holidays
                        "
                      >
                        <div class="time-inputs">
                          <v-text-field
                            v-model="formData.validHoursValue"
                            label="Time Range"
                            variant="outlined"
                            density="compact"
                            class="time-display-field"
                            readonly
                            hide-details
                            prepend-inner-icon="mdi-clock-outline"
                          ></v-text-field>

                          <v-btn
                            v-if="formData.validHoursValue === '24'"
                            size="small"
                            variant="text"
                            color="primary"
                            class="ml-2"
                            @click="switchToCustomTime"
                          >
                            Custom Time
                          </v-btn>

                          <v-btn
                            v-if="formData.validHoursValue !== '24'"
                            size="small"
                            variant="text"
                            color="primary"
                            class="ml-2"
                            @click="switchToFullDay"
                          >
                            Full Day
                          </v-btn>
                        </div>

                        <!-- Custom time inputs (only show when not full day) -->
                        <div
                          v-if="
                            formData.isValidHoursEnabled &&
                            !formData.holidays &&
                            formData.validHoursValue !== '24'
                          "
                          class="custom-time-inputs mt-4"
                        >
                          <div class="time-input-group">
                            <v-text-field
                              v-model.number="formData.timeStartHour"
                              label="Start Hour"
                              type="number"
                              :min="1"
                              :max="12"
                              variant="outlined"
                              density="compact"
                              class="time-field mr-2"
                              hide-details
                              @input="updateTimeRange"
                              @blur="validateTimeInput('start')"
                              :rules="[
                                (v) =>
                                  v !== null && v !== undefined && v !== ''
                                    ? true
                                    : 'Start hour is required',
                                (v) =>
                                  v >= 1 && v <= 12
                                    ? true
                                    : 'Start hour must be between 1 and 12',
                              ]"
                            ></v-text-field>
                            <v-select
                              v-model="formData.timeStartPeriod"
                              :items="['AM', 'PM']"
                              label="Period"
                              variant="outlined"
                              density="compact"
                              class="time-period-field"
                              hide-details
                              @update:modelValue="updateTimeRange"
                            ></v-select>
                          </div>
                          <div class="time-input-group">
                            <v-text-field
                              v-model.number="formData.timeEndHour"
                              label="End Hour"
                              type="number"
                              :min="1"
                              :max="12"
                              variant="outlined"
                              density="compact"
                              class="time-field mr-2"
                              hide-details
                              @input="updateTimeRange"
                              @blur="validateTimeInput('end')"
                              :rules="[
                                (v) =>
                                  v !== null && v !== undefined && v !== ''
                                    ? true
                                    : 'End hour is required',
                                (v) =>
                                  v >= 1 && v <= 12
                                    ? true
                                    : 'End hour must be between 1 and 12',
                              ]"
                            ></v-text-field>
                            <v-select
                              v-model="formData.timeEndPeriod"
                              :items="['AM', 'PM']"
                              label="Period"
                              variant="outlined"
                              density="compact"
                              class="time-period-field"
                              hide-details
                              @update:modelValue="updateTimeRange"
                            ></v-select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.workingHours"
                      label="Working Hours"
                      color="success"
                      hide-details
                      inset
                      class="mr-6"
                      @update:model-value="handleWorkingHoursChange"
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="formData.holidays"
                      label="Holidays"
                      color="success"
                      hide-details
                      inset
                      class="mr-6"
                      @update:model-value="handleHolidaysChange"
                    ></v-switch>
                  </v-col>
                </v-row>

                <v-row v-if="formData.workingHours">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="formData.maxWorkHours"
                      label="Max Work Hours"
                      type="number"
                      variant="outlined"
                      :rules="[maxWorkHoursRule]"
                      min="0"
                      max="99"
                      :error-messages="maxWorkHoursError"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <!-- Group Type and Assignment in same row -->
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="group-type-section">
                      <div class="section-title font-weight-bold mb-2">
                        Device Group Type
                      </div>
                      <v-radio-group v-model="formData.groupType" inline>
                        <v-radio
                          label="4 Door Devices"
                          value="doors"
                          color="black"
                        ></v-radio>
                        <v-radio
                          label="AI FaceDevices"
                          value="devices"
                          color="black"
                        ></v-radio>
                      </v-radio-group>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <div class="group-assignment-section">
                      <v-autocomplete
                        v-if="formData.groupType === 'doors'"
                        v-model="formData.assignedDoors"
                        label="Assigned Doors"
                        :items="availableDoors"
                        item-title="doorDisplay"
                        item-value="id"
                        return-object
                        variant="outlined"
                        multiple
                        chips
                        closable-chips
                        :loading="loadingDoors"
                        :error-messages="getFieldErrorMessage('assignedDoors')"
                        required
                      >
                        <template v-slot:prepend-item>
                          <v-select
                            v-model="doorGroupFilter"
                            :items="doorGroup"
                            placeholder="Filter by group"
                            density="compact"
                            variant="outlined"
                            class="mx-4 mt-2"
                            clearable
                            @update:modelValue="fetchDoors"
                          />
                        </template>
                      </v-autocomplete>

                      <v-autocomplete
                        v-else
                        v-model="formData.assignedDevices"
                        label="Assigned Devices"
                        :items="availableDevices"
                        item-title="deviceDisplay"
                        item-value="id"
                        return-object
                        variant="outlined"
                        multiple
                        chips
                        closable-chips
                        :loading="loadingDevices"
                        :error-messages="
                          getFieldErrorMessage('assignedDevices')
                        "
                        required
                      >
                        <template v-slot:prepend-item>
                          <v-select
                            v-model="deviceGroupFilter"
                            :items="deviceGroups"
                            placeholder="Filter by device group"
                            density="compact"
                            variant="outlined"
                            class="mx-4 mt-2"
                            clearable
                            @update:modelValue="handleDeviceGroupChange"
                          />
                        </template>
                      </v-autocomplete>
                    </div>
                  </v-col>
                </v-row>
              </v-window-item>
              <v-window-item value="assignEmployee">
                <AssignToEmployee
                  v-if="formData.id"
                  :accessLevelId="formData.id"
                  :disabled="isSaving"
                />
                <div v-else class="pa-4">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    class="mr-2"
                  />
                  Loading access level data...
                </div>
              </v-window-item>
            </v-window>
          </v-card>
        </div>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import AssignToEmployee from "@/pages/devicesManager/accesslevel/assignToEmployee.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const form = ref(null);
const selectedTab = ref("basic");
const doors = ref([]);
const branches = ref([]);
const loadingDoors = ref(false);
const loadingBranches = ref(false);
const tenantId = currentUserTenant.getTenantId();
const valid = ref(false);
const formSubmitAttempted = ref(false);
const formErrors = ref({});
const touchedFields = ref({});
const originalForm = ref(null);
const maxWorkHoursError = ref("");

// Loading and message states
const isSaving = ref(false);
const saveError = ref("");
const showMessage = ref(false);
const messageText = ref("");
const messageType = ref("success");
const messageTimeout = ref(3000);

// Door and device group refs
const doorGroups = ref([]);
const deviceGroups = ref([]);
const loadingDoorGroups = ref(false);
const loadingDeviceGroups = ref(false);

// Computed property to check if form is valid
const formIsValid = computed(() => {
  return validateForm();
});

const formData = ref({
  accessLevelName: "",
  maxWorkHours: 0,
  accessType: 0,
  holidays: 0,
  isValidHoursEnabled: true,
  _24hrs: true,
  workingHours: 0,
  wrkHrs: [],
  timeStartHour: null,
  timeEndHour: null,
  timeStartPeriod: "AM",
  timeEndPeriod: "PM",
  validHoursValue: "24",
  assignedBranches: [],
  groupType: "doors",
  assignDoorsGroup: [],
  assignDevicesGroup: [],
  assignedDevices: [],
  assignedDoors: [],
  id: null,
});

const showSaveMessage = (type, text, timeout = 3000) => {
  messageType.value = type;
  messageText.value = text;
  showMessage.value = true;
  messageTimeout.value = timeout;
};

const showErrorMessage = (text, timeout = 5000) => {
  saveError.value = text;
  showSaveMessage("error", text, timeout);
};

const showSuccessMessage = (text, timeout = 3000) => {
  showSaveMessage("success", text, timeout);
};

// Handle Valid Hours toggle
const handleValidHoursToggle = (value) => {
  if (isSaving.value) return;

  formData.value.isValidHoursEnabled = value;
  formData.value._24hrs = value;

  if (value) {
    formData.value.workingHours = 0;
    formData.value.holidays = 0;
    formData.value.validHoursValue = "24";
    formData.value.timeStartHour = null;
    formData.value.timeEndHour = null;
    formData.value.timeStartPeriod = "AM";
    formData.value.timeEndPeriod = "PM";
  } else {
    formData.value.validHoursValue = "";
    formData.value.timeStartHour = null;
    formData.value.timeEndHour = null;
    formData.value.timeStartPeriod = "AM";
    formData.value.timeEndPeriod = "PM";
  }
};

// Handle Working Hours toggle
const handleWorkingHoursChange = (value) => {
  if (isSaving.value) return;

  formData.value.workingHours = value;
  if (value) {
    formData.value.isValidHoursEnabled = false;
    formData.value._24hrs = false;
    formData.value.holidays = 0;
    formData.value.validHoursValue = "";
    formData.value.timeStartHour = null;
    formData.value.timeEndHour = null;
    formData.value.timeStartPeriod = "AM";
    formData.value.timeEndPeriod = "PM";
  }
};

// Handle Holidays toggle
const handleHolidaysChange = (value) => {
  if (isSaving.value) return;

  formData.value.holidays = value;
  if (value) {
    formData.value.isValidHoursEnabled = false;
    formData.value._24hrs = false;
    formData.value.workingHours = 0;
    formData.value.validHoursValue = "";
    formData.value.timeStartHour = null;
    formData.value.timeEndHour = null;
    formData.value.timeStartPeriod = "AM";
    formData.value.timeEndPeriod = "PM";
  }
};

const switchToFullDay = () => {
  formData.value._24hrs = true;
  formData.value.isValidHoursEnabled = true;
  formData.value.validHoursValue = "24";
  formData.value.timeStartHour = null;
  formData.value.timeEndHour = null;
  formData.value.timeStartPeriod = "AM";
  formData.value.timeEndPeriod = "PM";
  formData.value.workingHours = 0;
  formData.value.holidays = 0;
};

const switchToCustomTime = () => {
  formData.value._24hrs = true;
  formData.value.isValidHoursEnabled = true;
  formData.value.validHoursValue = "12 AM-9 PM";
  formData.value.timeStartHour = 12;
  formData.value.timeEndHour = 9;
  formData.value.timeStartPeriod = "AM";
  formData.value.timeEndPeriod = "PM";
  formData.value.workingHours = 0;
  formData.value.holidays = 0;
};

const updateTimeRange = () => {
  const startHourRaw = formData.value.timeStartHour;
  const endHourRaw = formData.value.timeEndHour;
  const startPeriod = formData.value.timeStartPeriod;
  const endPeriod = formData.value.timeEndPeriod;

  let startHour = null;
  let endHour = null;

  if (
    startHourRaw !== null &&
    startHourRaw !== undefined &&
    startHourRaw !== ""
  ) {
    startHour = Math.max(1, Math.min(12, Number(startHourRaw)));
  }

  if (endHourRaw !== null && endHourRaw !== undefined && endHourRaw !== "") {
    endHour = Math.max(1, Math.min(12, Number(endHourRaw)));
  }

  if (startHour !== null && endHour !== null && startPeriod && endPeriod) {
    formData.value.validHoursValue = `${startHour} ${startPeriod}-${endHour} ${endPeriod}`;
    formData.value._24hrs = true;
    formData.value.workingHours = 0;
    formData.value.holidays = 0;
  } else if (startHour !== null && startPeriod) {
    formData.value.validHoursValue = `${startHour} ${startPeriod}-`;
    formData.value._24hrs = true;
    formData.value.workingHours = 0;
    formData.value.holidays = 0;
  } else if (endHour !== null && endPeriod) {
    formData.value.validHoursValue = `-${endHour} ${endPeriod}`;
    formData.value._24hrs = true;
    formData.value.workingHours = 0;
    formData.value.holidays = 0;
  } else {
    formData.value.validHoursValue = "24";
    formData.value._24hrs = true;
    formData.value.timeStartHour = null;
    formData.value.timeEndHour = null;
    formData.value.timeStartPeriod = "AM";
    formData.value.timeEndPeriod = "PM";
    formData.value.workingHours = 0;
    formData.value.holidays = 0;
  }

  formData.value.timeStartHour = startHour;
  formData.value.timeEndHour = endHour;
};

const validateTimeInput = (type) => {
  if (type === "start") {
    const value = formData.value.timeStartHour;
    if (value !== null && value !== undefined && value !== "") {
      if (value > 12) {
        formData.value.timeStartHour = 12;
      } else if (value < 1) {
        formData.value.timeStartHour = 1;
      }
    }
  } else if (type === "end") {
    const value = formData.value.timeEndHour;
    if (value !== null && value !== undefined && value !== "") {
      if (value > 12) {
        formData.value.timeEndHour = 12;
      } else if (value < 1) {
        formData.value.timeEndHour = 1;
      }
    }
  }
  updateTimeRange();
};

const timeRangeRule = (value) => {
  if (!value) return "Time range is required";

  if (value === "24") return true;

  const match = value.match(/^(\d{1,2})\s*(AM|PM)?-?(\d{1,2})?\s*(AM|PM)?$/);
  if (!match) return "Please enter time in HH AM/PM-HH AM/PM format";

  const [, startHourStr, startPeriod, endHourStr, endPeriod] = match;

  if (!startHourStr && !endHourStr) {
    return "Please enter at least one time value";
  }

  if (startHourStr) {
    const startHour = Number(startHourStr);
    if (startHour < 1 || startHour > 12) return "Start hour must be 1-12";
    if (!startPeriod) return "Start period (AM/PM) is required";
  }

  if (endHourStr) {
    const endHour = Number(endHourStr);
    if (endHour < 1 || endHour > 12) return "End hour must be 1-12";
    if (!endPeriod) return "End period (AM/PM) is required";
  }

  return true;
};

const tabRequiredFields = {
  basic: [],
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const fetchDoors = async (group = null) => {
  loadingDoors.value = true;
  const token = getToken();
  try {
    let url = `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][tenantId][_eq]=${tenantId}`;
    if (group) {
      url += `&filter[doorGroup][_eq]=${encodeURIComponent(group)}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch doors");
    const data = await response.json();
    doors.value = data.data || [];
  } catch (error) {
    console.error("Error fetching doors:", error);
    showErrorMessage("Failed to load doors. Please try again.");
  } finally {
    loadingDoors.value = false;
  }
};

const doorGroup = computed(() => {
  const groups = doors.value.map((d) => d.doorGroup).filter((g) => g);
  return [...new Set(groups)];
});

const doorGroupFilter = ref(null);

const availableDoors = computed(() =>
  (doors.value || []).map((door) => ({
    ...door,
    doorDisplay: `${door.doorName} - ${door.doorNumber || ""}`,
  })),
);

const fetchDoorGroups = async () => {
  loadingDoorGroups.value = true;
  const token = getToken();
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/doors?filter[tenant][tenantId][_eq]=${tenantId}&fields=doorGroup`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch door groups");
    const data = await response.json();

    const uniqueGroups = [
      ...new Set(
        data.data
          .map((item) => item.doorGroup)
          .filter((group) => group && group.trim() !== ""),
      ),
    ];

    doorGroups.value = uniqueGroups.map((group) => group);
  } catch (error) {
    console.error("Error fetching door groups:", error);
    showErrorMessage("Failed to load door groups. Please try again.");
  } finally {
    loadingDoorGroups.value = false;
  }
};

const availableDevices = ref([]);
const deviceGroupFilter = ref(null);
const loadingDevices = ref(false);

const handleDeviceGroupChange = (group) => {
  deviceGroupFilter.value = group;
  fetchDeviceGroups(group);
};

const fetchDeviceGroups = async (group = null) => {
  loadingDeviceGroups.value = true;
  loadingDevices.value = true;
  const token = getToken();
  try {
    let url = `${import.meta.env.VITE_API_URL}/items/controllers?filter[tenant][tenantId][_eq]=${tenantId}`;
    if (group) {
      url += `&filter[deviceGroup][_eq]=${group}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch device groups");
    const data = await response.json();

    const devicesWithDisplay = (data.data || []).map((item) => ({
      ...item,
      deviceDisplay: `${item.deviceName || ""} - ${item.controllerName || ""} - ${item.id || ""}`,
    }));

    const uniqueGroups = [
      ...new Set(
        data.data
          .map((item) => item.deviceGroup)
          .filter((group) => group && group.trim() !== ""),
      ),
    ];

    availableDevices.value = devicesWithDisplay;
    deviceGroups.value = uniqueGroups.map((group) => group);
  } catch (error) {
    console.error("Error fetching device groups:", error);
    showErrorMessage("Failed to load devices. Please try again.");
  } finally {
    loadingDeviceGroups.value = false;
    loadingDevices.value = false;
  }
};

const removeDoorGroup = (group) => {
  formData.value.assignDoorsGroup = formData.value.assignDoorsGroup.filter(
    (g) => g !== group,
  );
};

const removeDeviceGroup = (group) => {
  formData.value.assignDevicesGroup = formData.value.assignDevicesGroup.filter(
    (g) => g !== group,
  );
};

const selectedState = ref(null);
const selectedDoorBranch = ref(null);

const availableBranches = computed(() => {
  return branches.value.filter(
    (branch) =>
      (!selectedState.value || branch.state === selectedState.value) &&
      !formData.value.assignedBranches.some(
        (assignedBranch) => assignedBranch.branchId === branch.branchId,
      ),
  );
});

const accessLevels = ref([]);
const loadingAccessLevels = ref(false);

const fetchAccessLevels = async () => {
  loadingAccessLevels.value = true;
  const token = getToken();
  try {
    const url = `${import.meta.env.VITE_API_URL}/items/accesslevels/${props.category.id}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch access levels");
    const data = await response.json();

    console.log("fetchAccessLevels response:", data);
    accessLevels.value = data.data;

    const selectedAccessLevel = accessLevels.value;
    if (selectedAccessLevel) {
      let isValidHoursEnabled = true;
      let _24hrsValue = true;
      let validHoursValue = "24";
      let startHour = null;
      let endHour = null;
      let startPeriod = "AM";
      let endPeriod = "PM";

      if (typeof selectedAccessLevel.Valid_hours !== "undefined") {
        const validHoursStr = selectedAccessLevel.Valid_hours;

        if (validHoursStr && validHoursStr !== "") {
          isValidHoursEnabled = true;
          _24hrsValue = true;

          if (validHoursStr === "24") {
            validHoursValue = "24";
            startHour = null;
            endHour = null;
            startPeriod = "AM";
            endPeriod = "PM";
          } else {
            const match = validHoursStr.match(
              /^(\d{1,2})\s*(AM|PM)?-?(\d{1,2})?\s*(AM|PM)?$/,
            );
            if (match) {
              startHour = parseInt(match[1]) || null;
              startPeriod = match[2] || "AM";
              endHour = parseInt(match[3]) || null;
              endPeriod = match[4] || "PM";
              validHoursValue = `${startHour} ${startPeriod}-${endHour} ${endPeriod}`;
            } else {
              const oldMatch = validHoursStr.match(/^(\d{1,2})-(\d{1,2})$/);
              if (oldMatch) {
                startHour = parseInt(oldMatch[1]) || null;
                endHour = parseInt(oldMatch[2]) || null;
                startPeriod = startHour >= 12 ? "PM" : "AM";
                endPeriod = endHour >= 12 ? "PM" : "AM";
                startHour = startHour > 12 ? startHour - 12 : startHour;
                endHour = endHour > 12 ? endHour - 12 : endHour;
                validHoursValue = `${startHour} ${startPeriod}-${endHour} ${endPeriod}`;
              } else {
                validHoursValue = "24";
                startPeriod = "AM";
                endPeriod = "PM";
              }
            }
          }
        } else {
          isValidHoursEnabled = false;
          _24hrsValue = false;
          validHoursValue = "";
          startHour = null;
          endHour = null;
          startPeriod = "AM";
          endPeriod = "PM";
        }
      } else {
        if (typeof selectedAccessLevel._24hrs === "string") {
          if (selectedAccessLevel._24hrs === "24") {
            _24hrsValue = true;
            validHoursValue = "24";
            startPeriod = "AM";
            endPeriod = "PM";
          } else {
            const match = selectedAccessLevel._24hrs.match(
              /^(\d{1,2})\s*(AM|PM)?-?(\d{1,2})?\s*(AM|PM)?$/,
            );
            if (match) {
              startHour = parseInt(match[1]) || null;
              startPeriod = match[2] || "AM";
              endHour = parseInt(match[3]) || null;
              endPeriod = match[4] || "PM";
              validHoursValue = `${startHour} ${startPeriod}-${endHour} ${endPeriod}`;
            } else {
              const oldMatch = selectedAccessLevel._24hrs.match(
                /^(\d{1,2})-(\d{1,2})$/,
              );
              if (oldMatch) {
                startHour = parseInt(oldMatch[1]) || null;
                endHour = parseInt(oldMatch[2]) || null;
                startPeriod = startHour >= 12 ? "PM" : "AM";
                endPeriod = endHour >= 12 ? "PM" : "AM";
                startHour = startHour > 12 ? startHour - 12 : startHour;
                endHour = endHour > 12 ? endHour - 12 : endHour;
                validHoursValue = `${startHour} ${startPeriod}-${endHour} ${endPeriod}`;
              }
            }
            _24hrsValue = true;
          }
        } else {
          _24hrsValue = Boolean(selectedAccessLevel._24hrs);
          if (_24hrsValue) {
            validHoursValue = "24";
            startPeriod = "AM";
            endPeriod = "PM";
          } else {
            validHoursValue = "12 AM-9 PM";
            startHour = 12;
            endHour = 9;
            startPeriod = "AM";
            endPeriod = "PM";
          }
        }
        isValidHoursEnabled = _24hrsValue;
      }

      if (startHour !== null) {
        startHour = Math.max(1, Math.min(12, startHour));
      }
      if (endHour !== null) {
        endHour = Math.max(1, Math.min(12, endHour));
      }

      formData.value = {
        accessLevelName: selectedAccessLevel.accessLevelName || "",
        assignedDoors: availableDoors.value.filter((door) => {
          const match = selectedAccessLevel.assignDoorsGroup?.includes(
            Number(door.id),
          );
          return match;
        }),
        assignedDevices: availableDevices.value.filter((device) => {
          const match = selectedAccessLevel.assignDevicesGroup?.includes(
            String(device.id),
          );
          return match;
        }),
        assignedBranches: availableBranches.value.filter((branch) =>
          selectedAccessLevel.assignedBranches?.some((b) => b.id === branch.id),
        ),
        accessType: Number(selectedAccessLevel.accessType) || 0,
        holidays: Number(selectedAccessLevel.holidays) || 0,
        isValidHoursEnabled: isValidHoursEnabled,
        _24hrs: _24hrsValue,
        workingHours: Number(selectedAccessLevel.workingHours) || 0,
        groupType: selectedAccessLevel.groupType || "doors",
        assignDoorsGroup: availableDoors.value.filter((door) =>
          selectedAccessLevel.assignDoorsGroup?.includes(door.id),
        ),
        assignDevicesGroup: availableDevices.value.filter((device) =>
          selectedAccessLevel.assignDevicesGroup?.includes(device.id),
        ),
        timeStartHour: startHour,
        timeEndHour: endHour,
        timeStartPeriod: startPeriod,
        timeEndPeriod: endPeriod,
        validHoursValue: validHoursValue,
        id: selectedAccessLevel.id,
      };

      console.log("formData.id after fetchAccessLevels:", formData.value.id);
      console.log(
        "Parsed Valid_hours value:",
        formData.value.isValidHoursEnabled,
      );
      console.log("Parsed _24hrs value:", formData.value._24hrs);
      console.log("Parsed validHoursValue:", formData.value.validHoursValue);
      originalForm.value = { ...formData.value };
    } else {
      console.warn("No access level data found for id:", props.category.id);
      showErrorMessage("Access level data not found.");
    }
  } catch (error) {
    console.error("Error fetching access levels:", error);
    showErrorMessage("Failed to load access level data. Please try again.");
  } finally {
    loadingAccessLevels.value = false;
  }
};

onMounted(async () => {
  await fetchDoors();
  await fetchDoorGroups();
  await fetchDeviceGroups();
  await fetchAccessLevels();
});

const transformPayload = (form, originalForm = {}) => {
  console.log("Selected Devices:", formData.value.assignedDevices);

  const payload = {
    accessType: form.accessType,
  };

  originalForm = originalForm || {};
  originalForm.assignedDoors = originalForm.assignedDoors || [];
  originalForm.assignedBranches = originalForm.assignedBranches || [];

  if (form.accessLevelName !== originalForm.accessLevelName) {
    payload.accessLevelName = form.accessLevelName;
  }

  if (form._24hrs !== originalForm._24hrs) {
    payload._24hrs = form._24hrs;
  }

  if (
    form.isValidHoursEnabled !== originalForm.isValidHoursEnabled ||
    form.validHoursValue !== (originalForm.validHoursValue || "")
  ) {
    if (form.isValidHoursEnabled) {
      payload.Valid_hours = form.validHoursValue;
    } else {
      payload.Valid_hours = form.validHoursValue;
    }
  }

  if (form.maxWorkHours !== originalForm.maxWorkHours) {
    payload.maxWorkHours = form.maxWorkHours || 0;
  }
  if (form.workingHours !== originalForm.workingHours) {
    payload.workingHours = form.workingHours;
  }
  if (form.holidays !== originalForm.holidays) {
    payload.holidays = form.holidays;
  }

  if (form.groupType !== originalForm.groupType) {
    payload.groupType = form.groupType;
  }

  if (form.groupType === "doors" && formData.value.assignedDoors?.length) {
    payload.assignDoorsGroup = formData.value.assignedDoors.map((d) => d.id);
    payload.assignDevicesGroup = [];
  }

  if (form.groupType === "devices" && formData.value.assignedDevices?.length) {
    payload.assignDevicesGroup = formData.value.assignedDevices.map(
      (d) => d.id,
    );
    payload.assignDoorsGroup = [];
  }

  const assignedDoorsChanges = {
    create: [],
    delete: originalForm.assignedDoors
      .filter(
        (origDoor) =>
          !form.assignedDoors.some(
            (door) =>
              (door.id || door.doors_id?.id) ===
              (origDoor.id || origDoor.doors_id?.id),
          ),
      )
      .map((door) => door.id || door.doors_id?.id)
      .filter(Boolean),
  };

  form.assignedDoors.forEach((door) => {
    const doorId = door.id || door.doors_id?.id;
    if (
      doorId &&
      !originalForm.assignedDoors.some(
        (origDoor) => (origDoor.id || origDoor.doors_id?.id) === doorId,
      )
    ) {
      assignedDoorsChanges.create.push({
        accesslevels_id: "+",
        doors_id: { id: doorId },
      });
    }
  });

  if (
    assignedDoorsChanges.create.length > 0 ||
    assignedDoorsChanges.delete.length > 0
  ) {
    payload.assignedDoors = assignedDoorsChanges;
  }

  const assignedBranchesChanges = {
    create: [],
    delete: originalForm.assignedBranches
      .filter(
        (origBranch) =>
          !form.assignedBranches.some(
            (branch) =>
              (branch.branchId || branch.branch_id?.branchId) ===
              (origBranch.branchId || origBranch.branch_id?.branchId),
          ),
      )
      .map((branch) => branch.id || branch.branch_id?.id)
      .filter(Boolean),
  };

  if (
    assignedBranchesChanges.create.length > 0 ||
    assignedBranchesChanges.delete.length > 0
  ) {
    payload.assignedBranches = assignedBranchesChanges;
  }

  return payload;
};

const handleSave = async () => {
  saveError.value = "";

  if (!formIsValid.value) {
    formSubmitAttempted.value = true;
    showErrorMessage("Please fix the form errors before saving.", 4000);
    return;
  }

  isSaving.value = true;

  try {
    const payload = transformPayload(formData.value, originalForm.value);
    const token = getToken();

    console.log("Saving with payload:", payload);
    console.log("Valid_hours value being saved:", payload.Valid_hours);
    console.log("_24hrs value being saved:", payload._24hrs);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels/${props.category.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || errorData.error || "Failed to update access level";
      throw new Error(errorMessage);
    }

    try {
      const userResponse = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][assignedAccessLevel][accessLevelName][_contains]=${props.category.name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch users for update");
      }

      const userData = await userResponse.json();

      if (userData.data && userData.data.length > 0) {
        const updatePromises = userData.data.map(async (user) => {
          try {
            const updateResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/items/personalModule/${user.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  accessOn: payload.accessType,
                }),
              },
            );

            if (!updateResponse.ok) {
              throw new Error(`Failed to update user ${user.id}`);
            }
            return updateResponse;
          } catch (error) {
            console.error(`Error updating user ${user.id}:`, error);
            return null;
          }
        });

        const results = await Promise.allSettled(updatePromises);
        const failedUpdates = results.filter(
          (r) => r.status === "rejected",
        ).length;

        if (failedUpdates > 0) {
          console.warn(`Failed to update ${failedUpdates} users`);
        }
      }
    } catch (userError) {
      console.error("Error updating users:", userError);
    }

    originalForm.value = { ...formData.value };
    showSuccessMessage("Access level saved successfully!", 2000);

    await nextTick();
    setTimeout(() => {
      router.push("/deviceManager/accesslevelCatagory");
      emit("close");
    }, 1000);
  } catch (error) {
    console.error("Error in handleSave:", error);
    const errorMessage =
      error.message || "An unexpected error occurred while saving.";
    showErrorMessage(errorMessage);
    isSaving.value = false;
  } finally {
    if (!saveError.value) {
      setTimeout(() => {
        isSaving.value = false;
      }, 1500);
    }
  }
};

const menuItems = [
  {
    title: "Basic Details",
    icon: "mdi-card-text-outline",
    value: "basic",
  },
  {
    title: "Assign to Employee",
    icon: "mdi-account-multiple-plus",
    value: "assignEmployee",
  },
];

const tabHasError = (tabId) => {
  if (!formSubmitAttempted.value || isSaving.value) return false;

  const requiredFields = tabRequiredFields[tabId];
  const hasError = requiredFields.some((field) => !formData.value[field]);

  console.log(`[tabHasError] Tab: ${tabId}`, {
    requiredFields,
    formData: formData.value,
    hasError,
  });

  return hasError;
};

const getFieldErrorMessage = (field) => {
  if (formData.value[field]) {
    formErrors.value[field] = "";
    return "";
  }
  if (formErrors.value[field] && touchedFields.value[field]) {
    return formErrors.value[field];
  }
  return "";
};

const markFieldAsTouched = (field) => {
  touchedFields.value[field] = true;
  if (
    !formData.value[field] &&
    tabRequiredFields[selectedTab.value].includes(field)
  ) {
    formErrors.value[field] = "This field is required";
  }
};

const validateForm = () => {
  let isValid = true;
  Object.keys(tabRequiredFields).forEach((tab) => {
    tabRequiredFields[tab].forEach((field) => {
      if (!formData.value[field]) {
        formErrors.value[field] = "This field is required";
        touchedFields.value[field] = true;
        isValid = false;
      }
    });
  });
  return isValid;
};

const maxWorkHoursRule = (value) => {
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < 0) {
    return "Max working hours must be a positive number";
  }
  return numValue <= 99 || "Max working hours cannot exceed 99";
};

// Watch for maxWorkHours changes
watch(
  () => formData.value.maxWorkHours,
  (newValue) => {
    const numValue = Number(newValue);
    if (!isNaN(numValue) && numValue > 99) {
      maxWorkHoursError.value = "Max working hours cannot exceed 99";
    } else {
      maxWorkHoursError.value = "";
    }
  },
);

// Watch for groupType changes
watch(
  () => formData.value.groupType,
  (newType) => {
    if (newType === "doors" && doorGroups.value.length === 0) {
      fetchDoorGroups();
    } else if (newType === "devices" && deviceGroups.value.length === 0) {
      fetchDeviceGroups();
    }
  },
);

// Watch for formData changes to clear errors
watch(
  formData,
  (newVal) => {
    Object.keys(newVal).forEach((field) => {
      if (newVal[field] && formErrors.value[field]) {
        formErrors.value[field] = "";
      }
    });
  },
  { deep: true },
);

// Watch for tab changes to validate required fields
watch(selectedTab, (newTab, oldTab) => {
  if (oldTab && tabRequiredFields[oldTab]) {
    const mandatoryFields = tabRequiredFields[oldTab];
    mandatoryFields.forEach((field) => {
      if (!formData.value[field]) {
        touchedFields.value[field] = true;
        formErrors.value[field] = "This field is required";
      }
    });
  }
});
</script>

<style scoped>
.content-wrapper {
  display: flex;
  flex-direction: row;
}
.side-nav {
  width: 250px;
  margin-left: 1rem;
  border-right: 1px solid #e0e0e0;
}
.content-area {
  flex: 1;
}
.has-error {
  color: rgb(var(--v-theme-error));
}
.v-row {
  margin-top: 1rem;
}
.v-toolbar_content {
  background-color: white;
}
.access-level-name {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #c2d9ec;
  color: black;
  border-radius: 4px;
  font-size: 14px;
}
.text-h7 {
  margin-left: 1rem;
}

.group-type-section,
.group-assignment-section {
  padding: 16px;
  height: 100%;
}

.section-title {
  font-size: 1rem;
  margin-bottom: 12px;
}

.v-radio-group {
  margin-top: 0;
}

/* Time section styles */
.time-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.time-field {
  max-width: 100px;
}

.time-display-field {
  flex: 1;
  min-width: 150px;
}

.custom-time-inputs {
  display: flex;
  gap: 8px;
  align-items: end;
  flex-wrap: wrap;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-period-field {
  max-width: 100px;
}

/* Loading overlay styles */
.v-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 600px) {
  .group-type-section,
  .group-assignment-section {
    padding: 12px 0;
  }

  .time-inputs,
  .custom-time-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .time-field {
    max-width: none;
  }

  .time-display-field {
    min-width: auto;
  }

  .time-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .time-period-field {
    max-width: none;
  }
}
</style>
