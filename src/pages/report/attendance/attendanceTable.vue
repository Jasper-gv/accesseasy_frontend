<template>
  <v-app>
    <v-container class="app-wrapper" fluid>
      <div v-if="loading" class="d-flex justify-center align-center pa-6">
        <v-progress-circular
          indeterminate
          color="#68ade1"
          size="48"
          width="5"
        ></v-progress-circular>
      </div>
      <div v-else>
        <!-- Access Levels Table -->
        <v-card class="mt-6" elevation="2">
          <v-card-title class="text-h6">Access Levels</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Access Level Number</th>
                  <th class="text-left">Access Level Name</th>
                  <th class="text-left">Access Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="level in accessLevels" :key="level.id">
                  <td>{{ level.accessLevelNumber }}</td>
                  <td>{{ level.accessLevelName }}</td>
                  <td>{{ level.accessType ? "True" : "False" }}</td>

                  <td>
                    <BaseButton
                      variant="primary"
                      size="sm"
                      text="Generate Report"
                      :leftIcon="Shield"
                      @click="generateAccessLevelReport(level.id)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- Dialog for Report Configuration -->
        <v-dialog v-model="dialog" max-width="600px" persistent>
          <v-card>
            <v-card-title class="text-h6">
              {{
                dialogType === "AccessLevel"
                  ? "Access Level Report Configuration"
                  : ""
              }}
            </v-card-title>
            <v-card-text>
              <v-form ref="form" @submit.prevent="generateReport">
                <!-- Access Level Selection -->
                <div v-if="dialogType === 'AccessLevel'" class="select-wrapper">
                  <v-select
                    v-model="selectedAccessLevel"
                    :items="availableAccessLevels"
                    item-title="accessLevelName"
                    item-value="id"
                    label="Access Level *"
                    :loading="loadingAccessLevels"
                    :disabled="loadingAccessLevels"
                    variant="outlined"
                    dense
                    required
                  >
                    <template v-slot:prepend-inner>
                      <v-icon v-if="!loadingAccessLevels"
                        >mdi-shield-account</v-icon
                      >
                      <v-progress-circular
                        v-else
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      ></v-progress-circular>
                    </template>
                  </v-select>
                </div>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <BaseButton
                variant="danger"
                size="md"
                text="Cancel"
                :leftIcon="XCircle"
                @click="dialog = false"
              />

              <BaseButton
                variant="primary"
                size="md"
                :text="isGenerating ? 'Generating...' : 'Generate Report'"
                :leftIcon="isGenerating ? null : Check"
                :loading="isGenerating"
                :disabled="isGenerating"
                @click="generateReport"
              />
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Error Snackbar -->
        <v-snackbar v-model="showError" color="error" :timeout="5000">
          {{ errorMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showError = false">Close</v-btn>
          </template>
        </v-snackbar>

        <!-- Success Snackbar -->
        <v-snackbar v-model="showSuccess" color="success" :timeout="3000">
          {{ successMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showSuccess = false"
              >Close</v-btn
            >
          </template>
        </v-snackbar>
        <!-- Warning Snackbar (Yellow) -->
        <v-snackbar v-model="showWarning" color="warning" :timeout="4000">
          {{ warningMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showWarning = false"
              >Close</v-btn
            >
          </template>
        </v-snackbar>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import * as XLSX from "xlsx";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { XCircle, Check, Shield } from "lucide-vue-next";

const emit = defineEmits(["closeAddPage"]);
const loading = ref(false);
const showWarning = ref(false);
const warningMessage = ref("");
const form = ref(null);
const dialog = ref(false);
const dialogType = ref("");
const isGenerating = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const showSuccess = ref(false);
const successMessage = ref("");
const accessLevels = ref([]);
const loadingAccessLevels = ref(false);
const selectedAccessLevel = ref(null);
const doors = ref([]);
const loadingDoors = ref(false);
const availableAccessLevels = computed(() => accessLevels.value);

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const showErrorToast = (message) => {
  errorMessage.value = message;
  showError.value = true;
};

const showSuccessToast = (message) => {
  successMessage.value = message;
  showSuccess.value = true;
};

const showWarningToast = (message) => {
  warningMessage.value = message;
  showWarning.value = true;
};

const openDialog = (type) => {
  dialogType.value = type;
  dialog.value = true;

  if (type === "AccessLevel") {
    selectedAccessLevel.value = null;
  }
};

const fetchAccessLevels = async () => {
  loadingAccessLevels.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=accessLevelNumber&fields[]=accessLevelName&fields[]=accessType&fields[]=_24hrs&fields[]=workingHours&fields[]=maxWorkHours&fields[]=assignDoorsGroup&fields[]=Valid_hours`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch access levels");
    const data = await response.json();
    accessLevels.value = data.data || [];
  } catch (error) {
    console.error("Error fetching access levels:", error);
    showErrorToast("Failed to load access levels");
  } finally {
    loadingAccessLevels.value = false;
  }
};

const fetchDoorDetails = async (doorIds) => {
  if (!doorIds || doorIds.length === 0) return [];

  loadingDoors.value = true;
  try {
    const doorPromises = doorIds.map(async (doorId) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/doors?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][id][_eq]=${doorId}&fields[]=id&fields[]=doorNumber&fields[]=doorName&fields[]=doorType&fields[]=doorsConfigure`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Failed to fetch door ${doorId}`);
      const data = await response.json();
      return data.data[0] || null;
    });

    const doorResults = await Promise.all(doorPromises);
    return doorResults.filter((door) => door !== null);
  } catch (error) {
    console.error("Error fetching door details:", error);
    showErrorToast("Failed to load door details");
    return [];
  } finally {
    loadingDoors.value = false;
  }
};

const generateReport = async () => {
  if (dialogType.value === "AccessLevel" && !selectedAccessLevel.value) {
    showErrorToast("Please select an access level");
    return;
  }

  isGenerating.value = true;
  try {
    if (dialogType.value === "AccessLevel") {
      await fetchAccessLevelData();
    }
    dialog.value = false;
  } catch (error) {
    console.error("Error generating report:", error);
    showErrorToast("Failed to generate report. Please try again.");
  } finally {
    isGenerating.value = false;
  }
};

const generateAccessLevelReport = async (accessLevelId) => {
  selectedAccessLevel.value = accessLevelId;
  isGenerating.value = true;
  try {
    await fetchAccessLevelData();
  } catch (error) {
    console.error("Error generating access level report:", error);
    showErrorToast("Failed to generate report. Please try again.");
  } finally {
    isGenerating.value = false;
  }
};

const fetchAccessLevelData = async () => {
  try {
    // Find the selected access level
    const selectedAccessLevelData = accessLevels.value.find(
      (level) => level.id === selectedAccessLevel.value
    );

    if (!selectedAccessLevelData) {
      throw new Error("Selected access level not found");
    }

    // Fetch door details for assigned doors
    const assignedDoors = selectedAccessLevelData.assignDoorsGroup || [];
    const doorDetails = await fetchDoorDetails(assignedDoors);

    // Transform data for Excel
    const processedData = await transformAccessLevelData(
      selectedAccessLevelData,
      doorDetails
    );

    if (processedData.length === 0) {
      showErrorToast("No access level data available");
      return;
    }

    downloadAccessLevelExcel(processedData, "Access_Level_Report");
  } catch (error) {
    console.error("Error fetching access level data:", error);
    throw error;
  }
};

const transformAccessLevelData = async (accessLevelData, doorDetails) => {
  const processedData = [];

  // SECTION 1: ACCESS LEVEL BASIC INFORMATION
  processedData.push({
    SECTION: "ACCESS LEVEL BASIC INFORMATION",
  });

  processedData.push({
    "Access Level Number": accessLevelData.accessLevelNumber,
    "Access Level Name": accessLevelData.accessLevelName,
    "Access Type": accessLevelData.accessType ? "True" : "False",
    "24 Hours Access": accessLevelData._24hrs ? "True" : "False",
    "Working Hours": accessLevelData.workingHours ? "True" : "False",
    "Max Work Hours": accessLevelData.maxWorkHours || "Not Set",
    "Valid Hours": accessLevelData.Valid_hours || "Not Set",
  });

  // SECTION 2: DOOR ASSIGNMENT SUMMARY
  processedData.push({}); // Empty row for spacing
  processedData.push({
    SECTION: "DOOR ASSIGNMENT SUMMARY",
  });

  processedData.push({
    "Total Assigned Doors": doorDetails.length,
  });

  // SECTION 3: ASSIGNED DOORS DETAILS
  if (doorDetails.length > 0) {
    processedData.push({}); // Empty row for spacing
    processedData.push({
      SECTION: "ASSIGNED DOORS DETAILS",
    });

    // Headers for door details
    processedData.push({
      "Door Number": "DOOR NUMBER",
      "Door Name": "DOOR NAME",
      "Door Type": "DOOR TYPE",
      "Device ID": "DEVICE ID",
      "Door Open Timer": "DOOR OPEN TIMER (sec)",
      "Delay Timer": "DELAY TIMER",
      "Sensor Mode": "SENSOR MODE",
      "Passive Mode": "PASSIVE MODE",
      "Entry Time": "SCHEDULE ENTRY TIME",
      "Exit Time": "SCHEDULE EXIT TIME",
    });

    // Add each door's details
    doorDetails.forEach((door) => {
      processedData.push({
        "Door Number": door.doorNumber,
        "Door Name": door.doorName,
        "Door Type": door.doorType,
        "Device ID": door.doorsConfigure?.deviceId || "Not Set",
        "Door Open Timer": door.doorsConfigure?.doorOpenTimer || "Not Set",
        "Delay Timer": door.doorsConfigure?.delayTimer || "Not Set",
        "Sensor Mode": door.doorsConfigure?.sensorMode ? "Enabled" : "Disabled",
        "Passive Mode": door.doorsConfigure?.passiveMode
          ? "Enabled"
          : "Disabled",
        "Entry Time": door.doorsConfigure?.scheduleTime?.entryTime || "Not Set",
        "Exit Time": door.doorsConfigure?.scheduleTime?.exitTime || "Not Set",
      });
    });
  } else {
    processedData.push({}); // Empty row for spacing
    processedData.push({
      SECTION: "ASSIGNED DOORS DETAILS",
    });
    processedData.push({
      Status: "No doors assigned to this access level",
    });
  }

  return processedData;
};

const downloadAccessLevelExcel = (data, reportTitle) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const colWidths = Object.keys(data[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || "").length)
      );
      return { wch: Math.min(maxLength + 2, 30) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);

    // Fix: Get the access level name from the data or find it in accessLevels array
    const selectedAccessLevelData = accessLevels.value.find(
      (level) => level.id === selectedAccessLevel.value
    );
    const accessLevelName =
      selectedAccessLevelData?.accessLevelName || "AccessLevel";

    const fileName = `${reportTitle}_${accessLevelName.replace(/\s+/g, "_")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    showSuccessToast(
      `${reportTitle.replace(/_/g, " ")} downloaded successfully!`
    );
    emit("closeAddPage");
  } catch (error) {
    console.error("Error downloading Excel file:", error);
    throw error;
  }
};

onMounted(() => {
  fetchAccessLevels();
});
</script>

<style scoped>
.app-wrapper {
  height: 80vh;
  background-color: white;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw;
  box-sizing: border-box;
  overflow-y: auto;
}

.select-wrapper {
  position: relative;
  max-width: 24rem;
}
</style>
