<template>
  <div class="leave-policy">
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
    <v-container v-else class="pa-4">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3>Leave Details</h3>
        <BaseButton
          variant="primary"
          text="Update"
          :disabled="!hasChanges"
          @click="updateLeavePolicy"
        />
      </div>
      <br />
      <v-table density="compact">
        <thead
          class="leave-table-header"
          style="background: #f9fafb; color: #0f3b82"
        >
          <tr>
            <th>Leave Type</th>
            <th>Days</th>
            <th>Month Limit</th>
            <th>Carry Forward</th>
            <th>Balance</th>
            <th>Taken</th>
            <th>Enable the leave</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(leave, index) in enabledLeaves"
            :key="index"
            :class="{ 'disabled-row': !leave.isAssigned }"
          >
            <td>
              <v-icon
                :color="getLeaveColor(leave.leaveName)"
                size="18"
                class="mr-2"
              >
                {{ getLeaveIcon(leave.leaveName).icon }}
              </v-icon>
              {{ formatLeaveType(leave.leaveName) }}
            </td>
            <td>
              <v-text-field
                v-if="leave.isEditing"
                v-model.number="leave.leaveConfig.days"
                type="number"
                min="0"
                density="compact"
                variant="outlined"
                hide-details
                style="max-width: 80px"
                @blur="finishEditing(leave)"
                :disabled="!leave.isAssigned"
              />
              <span v-else>{{ leave.leaveConfig?.days || 0 }}</span>
            </td>
            <td>{{ leave.leaveConfig?.monthLimit || 0 }}</td>
            <td>{{ leave.leaveConfig?.limit || 0 }}</td>
            <td>{{ leave.leaveBalance || 0 }}</td>
            <td>{{ leave.leaveTaken || 0 }}</td>
            <td>
              <v-switch
                v-model="leave.isAssigned"
                color="primary"
                inset
                hide-details
                @change="handleLeaveToggle(leave)"
              />
            </td>
            <td>
              <v-btn
                v-if="!leave.isEditing"
                icon
                size="x-small"
                @click="startEditing(leave)"
                :disabled="!leave.isAssigned"
              >
                <v-icon size="16">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                v-else
                icon
                size="x-small"
                color="red"
                @click="cancelEditing(leave)"
              >
                <v-icon size="16">mdi-close</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
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
});

const emit = defineEmits(["update:employeeData"]);
const hasLoaded = ref(false);
const loading = ref(true);
const enabledLeaves = ref([]);
const originalLeaves = ref([]);
const hasChanges = ref(false);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const getLeaveColor = (leaveName) => {
  return leaveName === "Annual" ? "blue" : "green";
};

const getLeaveIcon = (leaveName) => {
  return { icon: leaveName === "Annual" ? "mdi-calendar" : "mdi-medical-bag" };
};

const formatLeaveType = (leaveName) => {
  return leaveName.replace(/([A-Z])/g, " $1").trim();
};

const handleLeaveToggle = (leave) => {
  if (!leave.isAssigned && leave.isEditing) {
    leave.isEditing = false;
  }
  markAsChanged();
};

const startEditing = (leave) => {
  if (leave.isAssigned) {
    leave.isEditing = true;
  }
};

const cancelEditing = (leave) => {
  const original = originalLeaves.value.find(
    (l) => l.leaveName === leave.leaveName,
  );
  if (original) {
    leave.leaveConfig.days = original.leaveConfig.days;
  }
  leave.isEditing = false;
};

const finishEditing = (leave) => {
  if (typeof leave.leaveConfig.days === "string") {
    leave.leaveConfig.days = parseInt(leave.leaveConfig.days) || 0;
  }
  leave.isEditing = false;
  markAsChanged();
};

const markAsChanged = () => {
  hasChanges.value = true;
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const fetchLeavePolicies = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const currentYear = new Date().getFullYear();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][year(yearOfPolicy)][_eq]=${currentYear}&fields=id,leaveName,leaveConfig`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch leave policies");
    }
    const data = await response.json();
    // Initialize enabledLeaves with default leave policies
    enabledLeaves.value = data.data
      .filter((leave) => leave.leaveConfig?.isEnabled)
      .map((leave) => ({
        ...leave,
        isAssigned: false, // Default to false until employee-specific data is loaded
        isEditing: false,
        leaveConfig: {
          ...leave.leaveConfig,
          days: Number(leave.leaveConfig?.days) || 0,
          limit: Number(leave.leaveConfig?.limit) || 0,
          monthLimit: Number(leave.leaveConfig?.monthLimit) || 0,
        },
        leaveBalance: 0,
        leaveTaken: 0,
      }));
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    enabledLeaves.value = [];
    showErrorMessage("Failed to fetch leave policies");
  }
};

let leaveId = null;

const getLeavePolicy = async () => {
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=leaves.id&fields[]=leaves.leaveBalance&fields[]=leaves.leaveTaken&fields[]=leaves.assignedLeave&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[id][_eq]=${props.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to fetch leave policy",
      );
    }
    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].leaves) {
      const leavesData = data.data[0].leaves;
      leaveId = leavesData.id;
      // Update enabledLeaves with employee-specific data
      enabledLeaves.value = enabledLeaves.value.map((leave) => {
        const normalizedLeaveName = leave.leaveName
          .toLowerCase()
          .replace(/\s+/g, "");
        const balanceKey = Object.keys(leavesData.leaveBalance || {}).find(
          (key) =>
            key.toLowerCase().replace(/\s+/g, "") === normalizedLeaveName,
        );
        const takenKey = Object.keys(leavesData.leaveTaken || {}).find(
          (key) =>
            key.toLowerCase().replace("t", "").replace(/\s+/g, "") ===
            normalizedLeaveName,
        );
        const isAssigned = leavesData.assignedLeave
          ? leavesData.assignedLeave.includes(leave.leaveName)
          : false;
        return {
          ...leave,
          isAssigned,
          leaveBalance: balanceKey
            ? Number(leavesData.leaveBalance[balanceKey]) || 0
            : 0,
          leaveTaken: takenKey
            ? Number(leavesData.leaveTaken[takenKey]) || 0
            : 0,
          leaveConfig: {
            ...leave.leaveConfig,
            days: balanceKey
              ? Number(leavesData.leaveBalance[balanceKey]) || 0
              : Number(leave.leaveConfig.days) || 0,
            limit: Number(leave.leaveConfig.limit) || 0,
            monthLimit: Number(leave.leaveConfig.monthLimit) || 0,
          },
        };
      });
      originalLeaves.value = JSON.parse(JSON.stringify(enabledLeaves.value));
      hasChanges.value = false;
      // Do NOT emit update here to prevent overwriting employeeData
    } else {
      throw new Error("Leaves data not found in response");
    }
  } catch (error) {
    console.error("Error fetching leave policy:", error);
    showErrorMessage("Failed to fetch leave policy. Please try again.");
    throw error;
  } finally {
    loading.value = false;
    hasLoaded.value = true;
  }
};

const constructLeavesPayload = () => {
  const leavesPayload = {
    leaveBalance: {},
    CarryForwardleave: {},
    leaveTaken: {},
    monthLimit: {},
    assignedLeave: [],
  };
  enabledLeaves.value.forEach((leave) => {
    const leaveType = leave.leaveName.toLowerCase().replace(/\s+/g, "");
    leavesPayload.leaveBalance[leaveType] =
      Number(leave.leaveConfig?.days) || 0;
    leavesPayload.CarryForwardleave[leaveType] =
      Number(leave.leaveConfig?.limit) || 0;
    leavesPayload.monthLimit[leaveType] =
      Number(leave.leaveConfig?.monthLimit) || 0;
    leavesPayload.leaveTaken[`t${leaveType}`] =
      leavesPayload.leaveTaken[`t${leaveType}`] || 0;
    if (leave.isAssigned) {
      leavesPayload.assignedLeave.push(leave.leaveName);
    }
  });
  return leavesPayload;
};

const updateLeavePolicy = async () => {
  try {
    const token = authService.getToken();
    const leavesPayload = constructLeavesPayload();
    if (!leaveId) {
      throw new Error("Leave ID not found. Please fetch leave policy first.");
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leave/${leaveId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leavesPayload),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update leave policy",
      );
    }
    originalLeaves.value = JSON.parse(JSON.stringify(enabledLeaves.value));
    hasChanges.value = false;
    // Only emit update when the user explicitly saves changes
    emit("update:employeeData", {
      ...props.employeeData,
      leaves: leavesPayload,
    });
    showSuccessMessage("Leave policy updated successfully!");
  } catch (error) {
    console.error("Error in updateLeavePolicy:", error);
    showErrorMessage("Failed to update leave policy. Please try again.");
  }
};

const hasChangesComputed = computed(() => {
  return (
    JSON.stringify(enabledLeaves.value) !== JSON.stringify(originalLeaves.value)
  );
});

onMounted(async () => {
  await fetchLeavePolicies();
  await getLeavePolicy();
  // Watch enabledLeaves but don't emit updates automatically
  watch(
    enabledLeaves,
    () => {
      hasChanges.value = hasChangesComputed.value;
      // Do NOT emit update here to prevent overwriting employeeData
    },
    { deep: true },
  );
});
</script>

<style scoped>
.leave-policy {
  border-radius: 8px;
}
.days-input {
  max-width: 100px;
}
.disabled-row {
  background-color: #ececec !important;
  color: #666;
}
.leave-table-header th {
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif !important;
  font-weight: 700 !important;
  font-size: 14px;
  padding: 12px 8px;
  color: inherit;
}
</style>
