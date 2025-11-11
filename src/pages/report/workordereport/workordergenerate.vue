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
        <!-- Header -->
        <v-row dense>
          <!-- Device Report Grid -->
          <v-col cols="12" md="12">
            <v-card elevation="2" class="pa-4">
              <!-- Device Table -->
              <v-data-table
                :headers="deviceHeaders"
                :items="availableDevices"
                :loading="loadingDevices"
                class="elevation-1 mt-4"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title>Available Devices</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      size="small"
                      @click="fetchDevices"
                      :loading="loadingDevices"
                    >
                      <v-icon left>mdi-refresh</v-icon>
                      Refresh
                    </v-btn>
                  </v-toolbar>
                </template>

                <template v-slot:item.actions="{ item }">
                  <BaseButton
                    variant="primary"
                    size="sm"
                    text="Generate Report"
                    :leftIcon="Wrench"
                    :loading="isGenerating && selectedDevice === item.id"
                    :disabled="isGenerating"
                    @click="() => generateDeviceReport(item)"
                  />
                </template>

                <template v-slot:loading>
                  <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
                </template>

                <template v-slot:no-data>
                  <div class="text-center py-4">
                    <v-icon size="48" class="mb-2">mdi-devices-off</v-icon>
                    <p>No devices found</p>
                    <v-btn
                      color="primary"
                      @click="fetchDevices"
                      :loading="loadingDevices"
                    >
                      Retry
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

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
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { Wrench, Check, XCircle } from "lucide-vue-next";
const emit = defineEmits(["closeAddPage"]);
const loading = ref(false);
const showWarning = ref(false);
const warningMessage = ref("");
const form = ref(null);

const isGenerating = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const showSuccess = ref(false);
const successMessage = ref("");

const devices = ref([]);
const loadingDevices = ref(false);
const selectedDevice = ref(null);

// Table headers for devices
const deviceHeaders = ref([
  { title: "Device Name", key: "deviceName", sortable: true },
  { title: "Serial Number", key: "sn", sortable: true },
  { title: "Controller Name", key: "controllerName", sortable: true },
  { title: "Actions", key: "actions", sortable: false, align: "center" },
]);

const availableDevices = computed(() => devices.value);

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

const fetchDevices = async () => {
  loadingDevices.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=controllerName&fields[]=id&fields[]=selectedDoors&fields[]=deviceName&fields[]=sn`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch devices");

    const data = await response.json();
    devices.value = data.data || [];
  } catch (error) {
    console.error("Error fetching devices:", error);
    showErrorToast("Failed to load devices");
  } finally {
    loadingDevices.value = false;
  }
};

const generateDeviceReport = async (device) => {
  selectedDevice.value = device.id;
  isGenerating.value = true;

  try {
    await fetchDeviceData(device);
  } catch (error) {
    console.error("Error generating report:", error);
    showErrorToast("Failed to generate report. Please try again.");
  } finally {
    isGenerating.value = false;
    selectedDevice.value = null;
  }
};

const fetchDeviceData = async (device) => {
  try {
    // Get door details for each selected door
    const doorDetails = [];

    if (device.selectedDoors && device.selectedDoors.length > 0) {
      for (const doorId of device.selectedDoors) {
        const doorResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/doors?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][id][_eq]=${doorId}&fields[]=id&fields[]=doorNumber&fields[]=doorName&fields[]=doorType&fields[]=doorsConfigure&fields[]=tenant.tenantName`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!doorResponse.ok) {
          console.warn(`Failed to fetch details for door ${doorId}`);
          continue;
        }

        const doorData = await doorResponse.json();
        if (doorData.data && doorData.data.length > 0) {
          doorDetails.push(doorData.data[0]);
        }
      }
    }

    // Transform the data for Excel
    transformDeviceData(device, doorDetails);
  } catch (error) {
    console.error("Error fetching device data:", error);
    throw error;
  }
};

// Add transformDeviceData method
const transformDeviceData = (deviceData, doorDetails) => {
  const processedData = [];

  // Add device information - only once at the top
  processedData.push({
    Category: "Device Information",
    Field: "Device Name",
    Value: deviceData.deviceName || "N/A",
  });
  processedData.push({
    Category: "",
    Field: "Controller Name",
    Value: deviceData.controllerName || "N/A",
  });
  processedData.push({
    Category: "",
    Field: "Serial Number",
    Value: deviceData.sn || "N/A",
  });

  // Add separator
  processedData.push({
    Category: "",
    Field: "",
    Value: "",
  });

  // Add door configuration header
  processedData.push({
    Category: "Door Configuration",
    Field: "Total Doors",
    Value: doorDetails.length,
  });

  // Add door information without door type and door number
  if (doorDetails.length > 0) {
    doorDetails.forEach((door, index) => {
      // Add door name only
      processedData.push({
        Category: `Door ${index + 1}Configuration`,
        Field: "Door Name",
        Value: door.doorName || "N/A",
      });

      // Add door configuration details
      if (door.doorsConfigure) {
        const config = door.doorsConfigure;

        // Common configuration fields for all doors
        processedData.push({
          Category: ``,
          Field: "Door Open Timer",
          Value:
            config.doorOpenTimer !== null
              ? `${config.doorOpenTimer} seconds`
              : "N/A",
        });
        processedData.push({
          Category: ``,
          Field: "Delay Timer",
          Value:
            config.delayTimer !== null ? `${config.delayTimer} seconds` : "N/A",
        });
        processedData.push({
          Category: ``,
          Field: "Sensor Mode",
          Value: config.sensorMode ? "Enabled" : "Disabled",
        });
        processedData.push({
          Category: ``,
          Field: "Passive Mode",
          Value: config.passiveMode ? "Enabled" : "Disabled",
        });

        if (config.scheduleTime) {
          processedData.push({
            Category: ``,
            Field: "Entry Time",
            Value: config.scheduleTime.entryTime || "N/A",
          });
          processedData.push({
            Category: ``,
            Field: "Exit Time",
            Value: config.scheduleTime.exitTime || "N/A",
          });
        }
      } else {
        processedData.push({
          Category: `Door ${index + 1} Configuration`,
          Field: "Configuration",
          Value: "No configuration available",
        });
      }

      // Add separator between doors (except after the last door)
      if (index < doorDetails.length - 1) {
        processedData.push({
          Category: "",
          Field: "",
          Value: "",
        });
      }
    });
  } else {
    processedData.push({
      Category: "Door Configuration",
      Field: "Doors",
      Value: "No doors configured",
    });
  }

  downloadExcel(processedData, "Device_Report", deviceData.id);
};

const downloadExcel = (data, reportTitle, deviceId) => {
  try {
    // For device report, we want a different format
    if (reportTitle === "Device_Report") {
      // Create a more structured worksheet for device report
      const worksheet = XLSX.utils.aoa_to_sheet([]);

      // Add headers
      XLSX.utils.sheet_add_aoa(worksheet, [["Category", "Field", "Value"]], {
        origin: "A1",
      });

      // Add data
      if (data.length > 0) {
        XLSX.utils.sheet_add_json(worksheet, data, {
          origin: "A2",
          skipHeader: true,
        });
      }

      // Set column widths
      worksheet["!cols"] = [
        { wch: 25 }, // Category
        { wch: 25 }, // Field
        { wch: 30 }, // Value
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);

      const fileName = `Device_Report_${deviceId}_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }

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
  fetchDevices();
});
</script>

<style scoped>
.app-wrapper {
  max-height: 80vh;
  background-color: white;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw;
  box-sizing: border-box;
  overflow-y: auto;
}

.select-wrapper {
  position: relative;
}

.month-input-wrapper {
  position: relative;
  max-width: 24rem;
}

.date-input-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 24rem;
}
</style>
