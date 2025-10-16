<template>
  <div class="flex">
    <!-- Left Panel for Add Device Details -->
    <div
      v-if="showAddDevicePanel"
      class="w-1/3 p-4 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <AddDeviceDetails @close="closeAddDevicePanel" @save="saveNewDevice" />
    </div>

    <!-- Main Content -->
    <div :class="showAddDevicePanel ? 'w-2/3' : 'w-full'" class="p-4">
      <DataTableWrapper title="Device Details" :showSearch="false">
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            size="md"
            text="Add Device"
            :leftIcon="PlusIcon"
            @click="openAddDevicePanel"
          />
        </template>

        <!-- Skeleton Loading -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="5"
          :columns="6"
        />

        <!-- Error State -->
        <div v-else-if="error" class="text-center p-8 text-red-500">
          Failed to load devices: {{ error }}
        </div>

        <!-- Table Section -->
        <DataTable
          v-else
          :items="formattedDevices"
          :columns="headers"
          :showSelection="false"
          :expandable="false"
          show-header
        />
      </DataTableWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import AddDeviceDetails from "@/pages/device/adddevicedetails.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

// Data for loading state
const loading = ref(true);
const showAddDevicePanel = ref(false);
const error = ref(null);
const token = authService.getToken();

// Table headers
const headers = ref([
  { label: "Device Type", key: "deviceType", sortable: true, width: "150px" },
  { label: "Device Name", key: "deviceName", sortable: true, width: "150px" },
  {
    label: "Serial Number",
    key: "serialNumber",
    sortable: true,
    width: "150px",
  },
  { label: "Branch", key: "branch", sortable: true, width: "150px" },
  {
    label: "Connection Status",
    key: "connectionStatus",
    sortable: true,
    width: "150px",
  },
  {
    label: "Assigned Doors",
    key: "assignedDoors",
    sortable: false,
    width: "150px",
  },
]);

// Device data from API
const devices = ref([]);

// Format devices for table display
const formattedDevices = computed(() => {
  return devices.value.map((device) => ({
    deviceType: getDeviceTypeName(device.controllerType),
    deviceName: device.deviceName || "N/A",
    serialNumber: device.sn || "N/A",
    branch: "Main Branch",
    connectionStatus:
      device.status === "approved" ? "Connected" : "Disconnected",
    assignedDoors: device.selectedDoors
      ? device.selectedDoors.map((door) => `Door ${door}`)
      : ["No doors assigned"],
    rawData: device,
  }));
});

const getDeviceTypeName = (controllerType) => {
  const typeMap = {
    1: "Fingerprint Device",
    2: "2 Door Device",
    4: "4 Door Device",
    8: "8 Door Device",
  };
  return typeMap[controllerType] || `Unknown (${controllerType})`;
};

const getDeviceData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    const tenantId = userDetails?.tenant?.tenantId || userDetails?.tenantId;

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "controllerName",
      "id",
      "selectedDoors",
      "deviceName",
      "controllerType",
      "sn",
      "tenant",
      "tenant.tenantId",
      "tenant.tenantName",
    ];

    const url = new URL(`${import.meta.env.VITE_API_URL}/items/controllers`);

    // Add fields as array parameters
    fields.forEach((field) => {
      url.searchParams.append("fields[]", field);
    });

    url.searchParams.append("filter[tenant][tenantId][_eq]", tenantId);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch devices");
    }

    const data = await response.json();

    if (data.data) {
      devices.value = data.data;
    } else {
      devices.value = [];
    }
  } catch (err) {
    console.error("Error fetching device data:", err);
    error.value = err.message || "Failed to load devices";
    devices.value = [];
    showToast("Failed to load devices. Please try again.", "error");
  } finally {
    loading.value = false;
  }
};

// Methods to handle panel
const openAddDevicePanel = () => {
  showAddDevicePanel.value = true;
};

const closeAddDevicePanel = () => {
  showAddDevicePanel.value = false;
};

const saveNewDevice = (newDevice) => {
  // Add the new device to the list
  devices.value.push({
    controllerName: newDevice.deviceType,
    id: Date.now().toString(), // Temporary ID
    status: "approved",
    selectedDoors: newDevice.assignedDoors || [],
    deviceName: newDevice.deviceName,
    controllerType: getControllerTypeFromName(newDevice.deviceType),
    sn:
      newDevice.serialNumber ||
      `SN${String(devices.value.length + 1).padStart(6, "0")}`,
  });
  closeAddDevicePanel();
  showToast("Device added successfully!", "success");
};

// Helper function to get controller type from device type name
const getControllerTypeFromName = (deviceType) => {
  const typeMap = {
    "Fingerprint Device": 1,
    "2 Door Device": 2,
    "4 Door Device": 4,
    "8 Door Device": 8,
  };
  return typeMap[deviceType] || 1;
};

// Toast function
const showToast = (message, type = "success") => {
  console.log(`${type.toUpperCase()}: ${message}`);
};

onMounted(() => {
  getDeviceData();
});
</script>

<style scoped>
/* Ensure smooth transition for panel */
.w-2\/3 {
  transition: width 0.3s ease;
}
.w-full {
  transition: width 0.3s ease;
}
</style>
