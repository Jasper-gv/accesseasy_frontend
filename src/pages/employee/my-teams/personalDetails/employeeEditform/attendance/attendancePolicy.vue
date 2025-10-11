<template>
  <v-container fluid class="attendance-settings-editor-container pa-0">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-list-box-outline</v-icon>
        Select Attendance Policy
      </h3>
      <BaseButton
        variant="primary"
        text="Update"
        :disabled="!hasChanges"
        @click="saveChanges"
      />
    </div>

    <v-card flat class="attendance-card">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-select
              v-model="internalSelectedPolicyId"
              :items="attendancePolicies"
              item-title="configName"
              item-value="id"
              label="Choose a Policy"
              variant="outlined"
              density="comfortable"
              placeholder="Select an attendance policy"
              clearable
              class="mb-6"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
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
                To manage attendance policies and settings, click the button
                below:
              </span>
              <v-btn
                color="primary"
                @click="redirectToAttendanceConfig"
                style="margin-left: 8px"
              >
                Go to Attendance policies
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <v-alert
          v-if="loadingPolicies"
          type="info"
          variant="tonal"
          class="mb-4"
          icon="mdi-information-outline"
        >
          Loading attendance policies...
        </v-alert>
        <v-alert
          v-else-if="!attendancePolicies.length"
          type="warning"
          variant="tonal"
          class="mb-4"
          icon="mdi-alert-outline"
        >
          No attendance policies found. Please create one.
        </v-alert>
        <v-alert
          v-else-if="!internalSelectedPolicyId"
          type="info"
          variant="tonal"
          class="mb-4"
          icon="mdi-information-outline"
        >
          Please select an attendance policy from the dropdown above to view its
          details.
        </v-alert>
      </v-card-text>

      <v-divider class="my-6"></v-divider>

      <v-card-title class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-calendar-clock</v-icon>
        Employee Working Hours Configuration
      </v-card-title>
      <v-card-text>
        <WorkingHoursForm
          v-model="internalWorkingHoursData"
          :tenant-id="tenantId"
        />
      </v-card-text>

      <!-- <v-divider class="my-6"></v-divider> -->

      <!-- <v-card-title class="text-h6 font-weight-bold mb-4 d-flex align-center">
        <v-icon class="mr-2" color="black">mdi-calendar-star</v-icon>
        Employee Holiday Settings
      </v-card-title> -->
      <v-card-text>
        <HolidaySettingsForm
          v-model="internalHolidayIds"
          :tenant-id="tenantId"
          :branch-id="employeeData.branch?.id"
        />
      </v-card-text>
    </v-card>
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      class="errormessge"
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useRouter } from "vue-router";
import WorkingHoursForm from "./editWorkingHours.vue";
// import HolidaySettingsForm from "./editHolidaySettings.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const router = useRouter();

const attendancePolicies = ref([]);
const loadingPolicies = ref(true);

const internalSelectedPolicyId = ref(null);
const internalWorkingHoursData = ref([]);
const internalHolidayIds = ref([]);

const initialSelectedPolicyId = ref(null);
const initialWorkingHoursData = ref([]);
const initialHolidayIds = ref([]);

const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const allShifts = ref([]);

const defaultWorkingHours = [
  { name: "Monday", key: "mon", shifts: [], isWorking: true },
  { name: "Tuesday", key: "tue", shifts: [], isWorking: true },
  { name: "Wednesday", key: "wed", shifts: [], isWorking: true },
  { name: "Thursday", key: "thu", shifts: [], isWorking: true },
  { name: "Friday", key: "fri", shifts: [], isWorking: true },
  { name: "Saturday", key: "sat", shifts: [], isWorking: true },
  { name: "Sunday", key: "sun", shifts: [], isWorking: false },
];

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const hasChanges = computed(() => {
  if (internalSelectedPolicyId.value !== initialSelectedPolicyId.value) {
    return true;
  }

  if (
    JSON.stringify(internalWorkingHoursData.value) !==
    JSON.stringify(initialWorkingHoursData.value)
  ) {
    return true;
  }

  if (
    JSON.stringify(internalHolidayIds.value) !==
    JSON.stringify(initialHolidayIds.value)
  ) {
    return true;
  }

  return false;
});

async function fetchShifts() {
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
  }
}

async function fetchAttendancePolicies() {
  if (!props.tenantId) return;
  loadingPolicies.value = true;
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config?filter[tenant][tenantId][_eq]=${props.tenantId}&fields=id,configName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch attendance policies");
    const data = await response.json();
    attendancePolicies.value = data.data.filter((item) => item.configName);
    if (props.employeeData?.config?.id) {
      internalSelectedPolicyId.value = props.employeeData.config.id;
      initialSelectedPolicyId.value = props.employeeData.config.id;
    } else if (attendancePolicies.value.length > 0) {
      internalSelectedPolicyId.value = attendancePolicies.value[0].id;
      initialSelectedPolicyId.value = attendancePolicies.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching attendance policies:", error);
  } finally {
    loadingPolicies.value = false;
  }
}

async function fetchEmployeeAttendanceData() {
  if (!props.id || !props.tenantId) return;
  try {
    const token = authService.getToken();
    const fields = [
      "id",
      "config.id",
      "config.configName",
      "holidaySettingsJ",
      "attendanceSettings.id",
      "attendanceSettings.isMonday",
      "attendanceSettings.isTuesday",
      "attendanceSettings.monJ",
      "attendanceSettings.tueJ",
      "attendanceSettings.isWednesday",
      "attendanceSettings.isThursday",
      "attendanceSettings.isFriday",
      "attendanceSettings.isSaturday",
      "attendanceSettings.isSunday",
      "attendanceSettings.wedJ",
      "attendanceSettings.thuJ",
      "attendanceSettings.friJ",
      "attendanceSettings.satJ",
      "attendanceSettings.sunJ",
      "branch.id",
      "branch.branchName",
    ];
    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
console.log(response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const employee = data.data[0];
      internalSelectedPolicyId.value = employee.config?.id || null;
      if (employee.attendanceSettings) {
        const attendanceSettings = employee.attendanceSettings;
        const daysMapping = {
          mon: "Monday",
          tue: "Tuesday",
          wed: "Wednesday",
          thu: "Thursday",
          fri: "Friday",
          sat: "Saturday",
          sun: "Sunday",
        };
        const newWorkingHoursData = Object.keys(daysMapping).map((key) => {
          const dayName = daysMapping[key];
          const isWorkingKey = `is${dayName}`;
          const shiftsKey = `${key}J`;
          const isWorking = !attendanceSettings[isWorkingKey];
          const shiftIds = attendanceSettings[shiftsKey]?.shifts || [];
          const shifts = shiftIds
            .map((shiftId) =>
              allShifts.value.find((s) => s.id === Number(shiftId)),
            )
            .filter(Boolean);

          return {
            name: dayName,
            key: key,
            shifts: shifts,
            isWorking: isWorking,
          };
        });
        internalWorkingHoursData.value = newWorkingHoursData;
      } else {
        internalWorkingHoursData.value = JSON.parse(
          JSON.stringify(defaultWorkingHours),
        );
      }

      if (employee.holidaySettingsJ?.holidays) {
        internalHolidayIds.value =
          employee.holidaySettingsJ.holidays.map(Number);
      } else {
        internalHolidayIds.value = [];
      }

      initialSelectedPolicyId.value = internalSelectedPolicyId.value;
      initialWorkingHoursData.value = JSON.parse(
        JSON.stringify(internalWorkingHoursData.value),
      );
      initialHolidayIds.value = [...internalHolidayIds.value];
    } else {
      internalWorkingHoursData.value = JSON.parse(
        JSON.stringify(defaultWorkingHours),
      );
      internalHolidayIds.value = [];
      initialSelectedPolicyId.value = null;
      initialWorkingHoursData.value = JSON.parse(
        JSON.stringify(defaultWorkingHours),
      );
      initialHolidayIds.value = [];
    }
  } catch (error) {
    console.error("Error fetching employee attendance data:", error);
    showErrorMessage("Failed to load employee attendance data.");

    internalWorkingHoursData.value = JSON.parse(
      JSON.stringify(defaultWorkingHours),
    );
    internalHolidayIds.value = [];
    initialSelectedPolicyId.value = null;
    initialWorkingHoursData.value = JSON.parse(
      JSON.stringify(defaultWorkingHours),
    );
    initialHolidayIds.value = [];
  }
}

const redirectToAttendanceConfig = () => {
  router.push("/settings/attendancepolicy");
};

const saveChanges = async () => {
  try {
    const token = authService.getToken();

    const transformedAttendanceSettings = {
      id: props.employeeData.attendanceSettings?.id,
    };
    internalWorkingHoursData.value.forEach((day) => {
      const isWorkingKey = `is${day.name}`;
      const shiftsKey = `${day.key}J`;

      transformedAttendanceSettings[isWorkingKey] = !day.isWorking;
      transformedAttendanceSettings[shiftsKey] = {
        shifts: day.shifts.map((s) => s.id.toString()),
      };
    });

    const payload = {
      config: internalSelectedPolicyId.value,
      holidaySettingsJ: {
        holidays: internalHolidayIds.value.map(String),
      },
      attendanceSettings: transformedAttendanceSettings,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update employee attendance settings");
    }

    showSuccessMessage("Attendance settings updated successfully!");

    initialSelectedPolicyId.value = internalSelectedPolicyId.value;
    initialWorkingHoursData.value = JSON.parse(
      JSON.stringify(internalWorkingHoursData.value),
    );
    initialHolidayIds.value = [...internalHolidayIds.value];

    emit("update:employeeData", {
      ...props.employeeData,
      config: { id: internalSelectedPolicyId.value },
      holidaySettingsJ: { holidays: internalHolidayIds.value.map(String) },
      attendanceSettings: transformedAttendanceSettings,
    });
  } catch (error) {
    console.error("Error updating attendance settings:", error);
    showErrorMessage(`Error updating settings: ${error.message}`);
  }
};

onMounted(async () => {
  await fetchShifts();
  await fetchAttendancePolicies();
  await fetchEmployeeAttendanceData();
});

watch(
  () => props.id,
  async () => {
    await fetchShifts();
    await fetchAttendancePolicies();
    await fetchEmployeeAttendanceData();
  },
);

watch(
  () => props.tenantId,
  async (newVal) => {
    if (newVal) {
      await fetchShifts();
      await fetchAttendancePolicies();
      await fetchEmployeeAttendanceData();
    }
  },
);
</script>

<style scoped>
.attendance-settings-editor-container {
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}

.attendance-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.v-select {
  max-width: 400px;
}

.policy-details-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fdfdfd;
}
</style>
