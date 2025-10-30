<template>
  <div class="flex">
    <!-- Left Panel for Add/Edit Device Details -->
    <div
      v-if="showAddDevicePanel"
      class="w-1/3 p-4 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <AddDeviceDetails
        :tenant-id="tenantId"
        :branches="branches"
        :available-doors="doors"
        :editing-device="editingDevice"
        @save-success="handleSaveSuccess"
        @cancel="closeAddDevicePanel"
      />
    </div>

    <!-- Main Content -->
    <div :class="showAddDevicePanel ? 'w-2/3' : 'w-full'" class="p-4">
      <DataTableWrapper title="Device Details" :showSearch="false">
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            size="md"
            text="Add Device"
            :leftIcon="Plus"
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
          :row-clickable="true"
          @rowClick="handleRowClick"
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
import { Plus, Trash } from "lucide-vue-next";

// Data for loading state
const loading = ref(true);
const showAddDevicePanel = ref(false);
const error = ref(null);
const token = authService.getToken();
const tenantId = ref(null);
const editingDevice = ref(null); // Add this for edit functionality

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
    label: "Controller Status",
    key: "controllerStatus",
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

// Device, branch, and door data
const devices = ref([]);
const branches = ref([]);
const doors = ref([]);

// Format devices for table display
const formattedDevices = computed(() => {
  return devices.value.map((device) => {
    const branch =
      branches.value.find((b) => b.id === device.branchDetails) || {};
    const assignedDoorNames = device.selectedDoors
      ? device.selectedDoors.map((doorId) => {
          const door = doors.value.find((d) => d.id === doorId);
          return door ? door.doorName : "Unknown Door";
        })
      : ["No doors assigned"];
    return {
      deviceType: device.controllerName || "N/A",
      deviceName: device.deviceName || "N/A",
      serialNumber: device.sn || "N/A",
      branch: branch.locdetail?.locationName || "N/A",
      connectionStatus:
        device.status === "approved" ? "Connected" : "Disconnected",
      controllerStatus: device.controllerStatus || "Waiting",
      assignedDoors: assignedDoorNames,
      rawData: device,
      id: device.id, // Make sure ID is included for row click
    };
  });
});

const getDeviceData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    tenantId.value = userDetails?.tenant?.tenantId || userDetails?.tenantId;

    if (!token || !tenantId.value) {
      throw new Error("Authentication required or tenant not found");
    }

    // Fetch devices
    const deviceFields = [
      "controllerName",
      "id",
      "selectedDoors",
      "deviceName",
      "sn",
      "tenant",
      "tenant.tenantId",
      "tenant.tenantName",
      "status",
      "controllerStatus",
      "branchDetails",
    ];

    const deviceUrl = new URL(
      `${import.meta.env.VITE_API_URL}/items/controllers`
    );
    deviceFields.forEach((field) => {
      deviceUrl.searchParams.append("fields[]", field);
    });
    deviceUrl.searchParams.append(
      "filter[tenant][tenantId][_eq]",
      tenantId.value
    );

    const deviceResponse = await fetch(deviceUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!deviceResponse.ok) {
      throw new Error("Failed to fetch devices");
    }

    const deviceData = await deviceResponse.json();
    devices.value = deviceData.data || [];

    // Fetch branches
    const branchFields = ["locdetail", "locType", "date_created", "id"];
    const branchUrl = new URL(
      `${import.meta.env.VITE_API_URL}/items/locationManagement`
    );
    branchFields.forEach((field) => {
      branchUrl.searchParams.append("fields[]", field);
    });
    branchUrl.searchParams.append(
      "filter[_and][0][_and][0][tenant][tenantId][_eq]",
      tenantId.value
    );
    branchUrl.searchParams.append(
      "filter[_and][0][_and][1][locType][_contains]",
      "branch"
    );

    const branchResponse = await fetch(branchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!branchResponse.ok) {
      throw new Error("Failed to fetch branches");
    }

    const branchData = await branchResponse.json();
    branches.value = branchData.data || [];

    // Fetch doors
    const doorFields = ["id", "doorName", "doorsConfigure"];
    const doorUrl = new URL(`${import.meta.env.VITE_API_URL}/items/doors`);
    doorFields.forEach((field) => {
      doorUrl.searchParams.append("fields[]", field);
    });
    doorUrl.searchParams.append(
      "filter[tenant][tenantId][_eq]",
      tenantId.value
    );

    const doorResponse = await fetch(doorUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!doorResponse.ok) {
      throw new Error("Failed to fetch doors");
    }

    const doorData = await doorResponse.json();
    doors.value = doorData.data || [];
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = err.message || "Failed to load data";
    devices.value = [];
    branches.value = [];
    doors.value = [];
    showToast("Failed to load data. Please try again.", "error");
  } finally {
    loading.value = false;
  }
};

// Handle row click for edit
const handleRowClick = (item) => {
  if (item && item.rawData) {
    handleEditDevice(item.rawData);
  } else {
    console.error("Invalid item or item data");
    showToast("Unable to open device details. Please try again.", "error");
  }
};

// Handle edit device
const handleEditDevice = (device) => {
  editingDevice.value = device;
  openAddDevicePanel();
};

// Methods to handle panel
const openAddDevicePanel = () => {
  showAddDevicePanel.value = true;
};

const closeAddDevicePanel = () => {
  showAddDevicePanel.value = false;
  editingDevice.value = null; // Reset editing device when closing panel
};

const handleSaveSuccess = () => {
  getDeviceData();
  closeAddDevicePanel();
  showToast("Device saved successfully!", "success");
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
.w-2\/3 {
  transition: width 0.3s ease;
}
.w-full {
  transition: width 0.3s ease;
}
</style>
