<template>
  <div class="working-hours-container">
    <v-card flat class="pa-4">
      <v-card-text class="scrollable">
        <div class="days-container">
          <v-card
            v-for="(day, index) in internalWeekDays"
            :key="day.name"
            :class="`day-card mb-4`"
            variant="outlined"
          >
            <v-card-text class="day-card-content">
              <div
                class="d-flex align-center justify-space-between gap-4 flex-wrap"
              >
                <!-- Day Name -->
                <div class="day-cell">{{ day.name }}</div>

                <!-- Status -->
                <div class="status-cell">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="day.isWorking"
                      color="success"
                      inset
                      @change="updateWeekDays"
                      class="custom-switch ma-0 pa-0"
                      hide-details
                    ></v-switch>
                    <span
                      :class="
                        day.isWorking
                          ? 'text-success font-weight-bold'
                          : 'text-grey'
                      "
                      class="status-text ml-2"
                    >
                      {{ day.isWorking ? "Working Day" : "Week Off" }}
                    </span>
                  </div>
                </div>

                <!-- Shifts and Actions -->
                <div class="shifts-actions-cell">
                  <div
                    v-if="day.isWorking"
                    class="d-flex align-center flex-wrap gap-4"
                  >
                    <div class="shift-info-container">
                      <div
                        v-for="shift in day.shifts"
                        :key="shift.id"
                        class="shift-info"
                      >
                        <v-menu
                          :close-on-content-click="false"
                          location="top"
                          offset="10"
                        >
                          <template v-slot:activator="{ props }">
                            <v-chip
                              v-bind="props"
                              :color="getShiftColor(shift.shift)"
                              size="large"
                              label
                              class="mr-2"
                            >
                              {{ shift.shift }}
                            </v-chip>
                          </template>
                          <v-card class="pa-2">
                            <div class="text-body-2">
                              {{ formatTime(shift.entryTime) }} -
                              {{ formatTime(shift.exitTime) }}
                              <div
                                v-if="
                                  shift.breakTypes &&
                                  formatBreakTypes(shift.breakTypes).length > 0
                                "
                                class="break-time mt-1"
                              >
                                <strong>Breaks:</strong><br />
                                <span
                                  v-for="(breakItem, index) in formatBreakTypes(
                                    shift.breakTypes,
                                  )"
                                  :key="index"
                                  class="break-item"
                                >
                                  {{ breakItem }}
                                </span>
                              </div>
                              <div v-else class="break-time mt-1">
                                <strong>Breaks:</strong> No breaks
                              </div>
                            </div>
                          </v-card>
                        </v-menu>
                      </div>
                    </div>
                    <v-btn
                      variant="outlined"
                      color="primary"
                      size="large"
                      class="manage-btn"
                      @click="openManageShifts(day)"
                    >
                      Manage
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Manage Shifts Dialog -->
    <v-dialog v-model="showManageShiftsDialog" width="700" persistent>
      <v-card>
        <v-card-title class="text-h5 pb-2">
          Manage Available Shifts
          <v-btn
            icon
            variant="text"
            size="large"
            @click="closeManageShiftsDialog"
            class="float-right"
          >
            <v-icon size="24px">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-col cols="12">
          <div
            style="display: flex; justify-content: flex-end; margin-top: 16px"
          >
            <div
              style="
                background-color: #e1f5fe;
                padding: 16px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <v-icon color="blue" style="margin-right: 8px"
                >mdi-information</v-icon
              >
              <span style="color: #2196f3">
                If you want to change shifts settings, click the button below:
              </span>
              <v-btn
                color="primary"
                @click="redirectToShifts"
                style="margin-left: 8px"
              >
                Shifts Details
              </v-btn>
            </div>
          </div>
        </v-col>
        <v-card-text class="pt-4" style="max-height: 60vh; overflow-y: auto">
          <div v-if="loadingShifts" class="text-center pa-4">
            <v-progress-circular indeterminate size="48"></v-progress-circular>
          </div>
          <div v-else>
            <v-list>
              <v-list-item
                v-for="shift in allShifts"
                :key="shift.id"
                class="mb-3 shift-list-item"
                :class="{ 'shift-selected': isShiftSelected(shift) }"
              >
                <template v-slot:default>
                  <v-list-item-title
                    class="d-flex align-center justify-content-between py-2 flex-wrap"
                  >
                    <div class="d-flex align-center flex-wrap">
                      <v-chip
                        :color="getShiftColor(shift.shift)"
                        class="mr-3"
                        size="large"
                        label
                      >
                        {{ shift.shift }}
                      </v-chip>
                      <span class="shift-time">
                        {{ formatTime(shift.entryTime) }} -
                        {{ formatTime(shift.exitTime) }}
                        <div
                          v-if="
                            shift.breakTypes &&
                            formatBreakTypes(shift.breakTypes).length > 0
                          "
                          class="break-time ml-2"
                        >
                          <small>
                            <span
                              v-for="(breakItem, bIndex) in formatBreakTypes(
                                shift.breakTypes,
                              )"
                              :key="bIndex"
                              style="display: block"
                            >
                              {{ breakItem }}
                            </span>
                          </small>
                        </div>
                        <div v-else class="break-time ml-2">
                          <small>No breaks</small>
                        </div>
                      </span>
                    </div>
                    <div class="d-flex align-center ml-auto">
                      <v-icon
                        v-if="isShiftSelected(shift)"
                        color="success"
                        size="24px"
                        class="mr-2"
                      >
                        mdi-check-circle
                      </v-icon>
                      <v-btn
                        :color="isShiftSelected(shift) ? 'error' : 'primary'"
                        :variant="isShiftSelected(shift) ? 'tonal' : 'outlined'"
                        size="large"
                        @click="selectShift(shift)"
                      >
                        {{ isShiftSelected(shift) ? "Remove" : "Select" }}
                      </v-btn>
                    </div>
                  </v-list-item-title>
                </template>
              </v-list-item>
            </v-list>
            <v-btn color="black" size="large" class="mt-4" @click="assignToAll">
              Assign to All Days
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter } from "vue-router";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [
      { name: "Monday", key: "mon", shifts: [], isWorking: true },
      { name: "Tuesday", key: "tue", shifts: [], isWorking: true },
      { name: "Wednesday", key: "wed", shifts: [], isWorking: true },
      { name: "Thursday", key: "thu", shifts: [], isWorking: true },
      { name: "Friday", key: "fri", shifts: [], isWorking: true },
      { name: "Saturday", key: "sat", shifts: [], isWorking: true },
      { name: "Sunday", key: "sun", shifts: [], isWorking: false },
    ],
  },
});

const emit = defineEmits(["update:modelValue"]);

const router = useRouter();
const internalWeekDays = ref([]);
const showManageShiftsDialog = ref(false);
const selectedDay = ref(null);
const loadingShifts = ref(false);
const allShifts = ref([]);

const redirectToShifts = () => {
  router.push("/settings/shifts");
};

const formatTime = (time) => {
  if (!time) return "";
  try {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  } catch (e) {
    console.error("Error formatting time:", time, e);
    return time;
  }
};

// Updated formatBreakTypes to return an array of formatted strings
const formatBreakTypes = (breakTypes) => {
  if (!breakTypes || !Array.isArray(breakTypes) || breakTypes.length === 0) {
    return [];
  }

  return breakTypes
    .filter(
      (breakItem) =>
        breakItem.breakType || (breakItem.startTime && breakItem.endTime),
    ) // Filter out completely empty breaks
    .map((breakItem) => {
      const breakName = breakItem.breakType || "Unnamed Break";
      const startTime = formatTime(breakItem.startTime);
      const endTime = formatTime(breakItem.endTime);
      if (startTime === "" || endTime === "") {
        // Check for empty formatted times
        return `${breakName}`; // If times are missing, just show the name
      }
      return `${breakName}: ${startTime} - ${endTime}`;
    });
};

const getShiftColor = (shiftType) => {
  const colors = {
    Morning: "success",
    Evening: "purple",
    Day: "primary",
    Night: "error",
    "Day 1": "orange",
    "Day-Morning": "green",
    morning: "success",
    evening: "purple",
    day: "primary",
    night: "error",
    "Week Off": "green",
  };
  return colors[shiftType] || "indigo";
};

const fetchShifts = async () => {
  loadingShifts.value = true;
  try {
    const token = authService.getToken();
    await currentUserTenant.initialize();
    const tenantId = currentUserTenant.getTenantId();

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/shifts/?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch shifts");

    const data = await response.json();
    allShifts.value = data.data;
  } catch (error) {
    console.error("Error fetching shifts:", error);
  } finally {
    loadingShifts.value = false;
  }
};

const openManageShifts = async (day) => {
  selectedDay.value = day;
  await fetchShifts();
  showManageShiftsDialog.value = true;
};

const closeManageShiftsDialog = () => {
  showManageShiftsDialog.value = false;
  selectedDay.value = null;
  updateWeekDays();
};

const isShiftSelected = (shift) => {
  if (!selectedDay.value) return false;
  return selectedDay.value.shifts.some(
    (selectedShift) => selectedShift.id === shift.id,
  );
};

const selectShift = (shift) => {
  if (!selectedDay.value) return;

  const shiftExists = selectedDay.value.shifts.some(
    (existingShift) => existingShift.id === shift.id,
  );

  if (shiftExists) {
    selectedDay.value.shifts = selectedDay.value.shifts.filter(
      (s) => s.id !== shift.id,
    );
  } else {
    selectedDay.value.shifts.push(shift);
  }
  updateWeekDays();
};

const assignToAll = () => {
  if (!selectedDay.value) return;

  const selectedShiftsToAssign = [...selectedDay.value.shifts];

  for (const day of internalWeekDays.value) {
    if (day.isWorking) {
      day.shifts = selectedShiftsToAssign;
    }
  }
  updateWeekDays();
  closeManageShiftsDialog();
};

const updateWeekDays = () => {
  internalWeekDays.value.forEach((day) => {
    if (!day.isWorking) {
      day.shifts = [];
    }
  });
  emit("update:modelValue", internalWeekDays.value);
};

onMounted(() => {
  internalWeekDays.value = JSON.parse(JSON.stringify(props.modelValue));
});

watch(
  () => props.modelValue,
  (newVal) => {
    internalWeekDays.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true },
);

watch(
  () => props.tenantId,
  (newVal) => {
    if (newVal) {
    }
  },
);
</script>

<style scoped>
.working-hours-container {
  width: 100%;
  height: auto;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: -1.5rem;
}
.days-container {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  height: 100%;
  overflow-y: auto;
}

.day-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  margin-bottom: 16px;
}

.day-card:last-child {
  margin-bottom: 8px;
}

.day-card-content {
  padding: 6px !important;
}

.day-cell {
  font-size: 18px;
  font-weight: bold;
  min-width: 100px;
  margin-left: 2rem;
}

.status-cell {
  min-width: 250px;
}

.status-cell .d-flex {
  gap: 8px;
}

.status-text {
  font-size: 16px;
  line-height: 24px;
}

.shifts-actions-cell {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.shift-info-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-right: auto;
}

.shift-info {
  display: inline-flex;
  align-items: center;
}

.shift-type-chip {
  font-size: 14px !important;
  height: 32px !important;
}

.shift-time {
  font-size: 16px;
  font-weight: 500;
}

.break-time {
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  font-size: 16px;
  height: 40px;
}

:deep(.custom-switch) {
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.v-switch__track) {
  opacity: 1;
}

.manage-btn {
  min-width: 100px;
}

.shift-list-item {
  border-radius: 8px;
  margin: 8px 0;
}

.shift-selected {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.shift-selected .v-list-item__content) {
  opacity: 1;
}

.float-right {
  position: absolute;
  right: 12px;
  top: 12px;
}

.gap-4 {
  gap: 1rem;
}

/* Custom scrollbar styling */
.days-container::-webkit-scrollbar {
  width: 8px;
}

.days-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.days-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.days-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .working-hours-container {
    height: auto;
  }

  .day-card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .day-cell {
    font-size: 16px;
    min-width: auto;
    margin-left: 0;
  }

  .status-cell {
    min-width: auto;
    width: 100%;
    justify-content: flex-start;
  }

  .shifts-actions-cell {
    min-width: auto;
    width: 100%;
    justify-content: flex-start;
  }

  .shift-info-container {
    width: 100%;
    margin-right: 0;
  }

  .manage-btn {
    width: 100%;
  }
}

.break-item {
  display: block;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
}

.break-time small {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.2;
}
</style>
