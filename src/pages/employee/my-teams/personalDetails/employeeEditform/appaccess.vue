<template>
  <div class="personal-details">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    <v-container
      v-else-if="employeeData && employeeData.assignedUser"
      class="pa-6"
    >
      <!-- App Access Toggle -->
      <v-card class="mb-6 pa-4" elevation="2">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h2 class="text-h5 mb-1">App Access</h2>
            <p class="text-body-2 text-grey">
              Enable or disable application access for this employee
            </p>
          </div>
          <v-switch
            v-model="employeeData.assignedUser.appAccess"
            color="primary"
            hide-details
            inset
            class="custom-switch"
            @update:modelValue="handleAppAccessChange"
          >
            <template v-slot:label>
              <span class="text-body-1 font-weight-medium">
                {{
                  employeeData.assignedUser.appAccess ? "Enabled" : "Disabled"
                }}
              </span>
            </template>
          </v-switch>
        </div>
      </v-card>

      <!-- Attendance Mode Toggles -->
      <v-card class="pa-4" elevation="2">
        <div class="mb-4">
          <h2 class="text-h5 mb-1">Attendance Mode</h2>
          <p class="text-body-2 text-grey">
            Select the attendance tracking methods for this employee
          </p>
        </div>

        <v-row>
          <v-col cols="12" md="6" lg="3">
            <v-card
              class="pa-4 attendance-card"
              :class="{ active: employeeData.GeoAttendance }"
              elevation="1"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="40"
                  :color="employeeData.GeoAttendance ? 'primary' : 'grey'"
                  class="mb-3"
                >
                  mdi-map-marker
                </v-icon>
                <v-switch
                  v-model="employeeData.GeoAttendance"
                  color="primary"
                  hide-details
                  inset
                  class="custom-switch"
                  @update:modelValue="handleAttendanceModeChange"
                >
                  <template v-slot:label>
                    <span class="text-body-1 font-weight-medium"
                      >Geo Attendance</span
                    >
                  </template>
                </v-switch>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" lg="3">
            <v-card
              class="pa-4 attendance-card"
              :class="{ active: employeeData.faceAttendance }"
              elevation="1"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="40"
                  :color="employeeData.faceAttendance ? 'primary' : 'grey'"
                  class="mb-3"
                >
                  mdi-face-recognition
                </v-icon>
                <v-switch
                  v-model="employeeData.faceAttendance"
                  color="primary"
                  hide-details
                  inset
                  class="custom-switch"
                  @update:modelValue="handleAttendanceModeChange"
                >
                  <template v-slot:label>
                    <span class="text-body-1 font-weight-medium"
                      >Face Attendance</span
                    >
                  </template>
                </v-switch>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" lg="3">
            <v-card
              class="pa-4 attendance-card"
              :class="{ active: employeeData.selfieAttendance }"
              elevation="1"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="40"
                  :color="employeeData.selfieAttendance ? 'primary' : 'grey'"
                  class="mb-3"
                >
                  mdi-camera
                </v-icon>
                <v-switch
                  v-model="employeeData.selfieAttendance"
                  color="primary"
                  hide-details
                  inset
                  class="custom-switch"
                  @update:modelValue="handleAttendanceModeChange"
                >
                  <template v-slot:label>
                    <span class="text-body-1 font-weight-medium"
                      >Selfie Attendance</span
                    >
                  </template>
                </v-switch>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" lg="3">
            <v-card
              class="pa-4 attendance-card"
              :class="{ active: employeeData.QrAttendance }"
              elevation="1"
            >
              <div class="d-flex flex-column align-center">
                <v-icon
                  size="40"
                  :color="employeeData.QrAttendance ? 'primary' : 'grey'"
                  class="mb-3"
                >
                  mdi-qrcode
                </v-icon>
                <v-switch
                  v-model="employeeData.QrAttendance"
                  color="primary"
                  hide-details
                  inset
                  class="custom-switch"
                  @update:modelValue="handleAttendanceModeChange"
                >
                  <template v-slot:label>
                    <span class="text-body-1 font-weight-medium"
                      >QR Attendance</span
                    >
                  </template>
                </v-switch>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>

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
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, onMounted } from "vue";
import { authService } from "@/services/authService";

const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const loading = ref(true);
const originalEmployeeData = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.appAccess",
      "GeoAttendance",
      "faceAttendance",
      "selfieAttendance",
      "QrAttendance",
    ];
    const queryString = `fields[]=${fields.join("&fields[]=")}`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.data) {
      originalEmployeeData.value = JSON.parse(JSON.stringify(data.data));
      emit("update:employeeData", data.data);
    } else {
      throw new Error("No employee data found");
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
    showErrorMessage(`Error fetching employee data: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const handleAppAccessChange = async (newValue) => {
  const previousValue = !newValue;

  console.log("🔹 handleAppAccessChange triggered");
  console.log("🆔 Employee ID:", props.id);
  console.log("🟦 New Value:", newValue);
  console.log("🟧 Previous Value:", previousValue);

  try {
    const token = authService.getToken();

    const url = `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`;
    const body = {
      assignedUser: {
        appAccess: newValue,
      },
    };

    console.log("🌐 API URL:", url);
    console.log("📦 Request Body:", JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("📨 Response Status:", response.status);

    // Try to log response body (even if not OK)
    let responseData = null;
    try {
      responseData = await response.json();
      console.log("✅ Raw Response JSON:", responseData);
    } catch (parseErr) {
      console.warn("⚠️ Could not parse response JSON:", parseErr);
    }

    if (!response.ok) {
      console.error("❌ Server Error Response:", responseData);
      throw new Error(
        responseData?.errors?.[0]?.message || "Failed to update app access",
      );
    }

    showSuccessMessage("App access updated successfully");

    console.log("🔁 Refetching updated employee data...");
    await fetchEmployeeData();
  } catch (error) {
    console.error("🚨 Error updating app access:", error);

    // Show in UI
    showErrorMessage(`Error updating app access: ${error.message}`);

    // Revert toggle safely
    if (
      props.employeeData.assignedUser &&
      typeof props.employeeData.assignedUser === "object"
    ) {
      props.employeeData.assignedUser.appAccess = previousValue;
      console.log("↩️ Reverted appAccess to previous value:", previousValue);
    }
  }
};

const handleAttendanceModeChange = async () => {
  try {
    const token = authService.getToken();

    // Only send the required attendance fields
    const updatedData = {
      GeoAttendance: props.employeeData.GeoAttendance,
      faceAttendance: props.employeeData.faceAttendance,
      selfieAttendance: props.employeeData.selfieAttendance,
      QrAttendance: props.employeeData.QrAttendance,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      },
    );

    if (!response.ok) throw new Error("Failed to update attendance modes");

    const result = await response.json();
    originalEmployeeData.value = JSON.parse(JSON.stringify(result.data));
    emit("update:employeeData", result.data);
    showSuccessMessage("Attendance modes updated successfully");
  } catch (error) {
    console.error("Error updating attendance modes:", error);
    showErrorMessage(`Error updating attendance modes: ${error.message}`);
  }
};

onMounted(fetchEmployeeData);
</script>

<style scoped>
.personal-details {
  width: 100%;
}

/* Custom switch styling for bigger, neater appearance */
.custom-switch :deep(.v-switch__track) {
  width: 60px;
  height: 28px;
  border-radius: 14px;
}

.custom-switch :deep(.v-switch__thumb) {
  width: 24px;
  height: 24px;
}

.custom-switch :deep(.v-selection-control) {
  min-height: 48px;
}

.custom-switch :deep(.v-label) {
  font-size: 1rem;
  opacity: 1;
}

/* Attendance card styling */
.attendance-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.attendance-card.active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.attendance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>
