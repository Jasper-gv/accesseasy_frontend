<template>
  <div class="flex">
    <!-- Left Panel for Add/Edit Device -->
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

        <!-- Loading -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="5"
          :columns="6"
        />

        <!-- Error -->
        <div v-else-if="error" class="text-center p-8 text-red-500">
          Failed to load devices: {{ error }}
        </div>

        <!-- Table with Pagination -->
        <div v-else>
          <DataTable
            :items="paginatedDevices"
            :columns="headers"
            :showSelection="false"
            :expandable="false"
            show-header
            :row-clickable="true"
            @rowClick="handleRowClick"
          >
            <!-- Assigned Doors Cell -->
            <template #cell-assignedDoors="{ item }">
              <div class="branch-chips">
                <!-- No Doors -->
                <v-chip
                  v-if="!item.assignedDoors || item.assignedDoors.length === 0"
                  size="small"
                  color="grey"
                  variant="tonal"
                  class="mr-1 mb-1"
                >
                  No Doors Assigned
                </v-chip>

                <!-- 1 or More Doors -->
                <template v-else>
                  <!-- First Door -->
                  <v-chip
                    size="small"
                    color="#059367"
                    variant="tonal"
                    class="mr-1 mb-1"
                  >
                    <v-icon icon="mdi-door" size="12" class="mr-1" />
                    {{ item.assignedDoors[0] }}
                  </v-chip>

                  <!-- +N more -->
                  <v-chip
                    v-if="item.assignedDoors.length > 1"
                    size="small"
                    color="grey"
                    variant="tonal"
                    class="mr-1 mb-1 view-more-chip"
                    @click.stop="showDoorsDialog(item)"
                  >
                    +{{ item.assignedDoors.length - 1 }} more
                  </v-chip>
                </template>
              </div>
            </template>
          </DataTable>

          <!-- Pagination -->
          <CustomPagination
            v-if="formattedDevices.length > 0"
            :total-items="formattedDevices.length"
            :items-per-page="itemsPerPage"
            :current-page="currentPage"
            @page-change="handlePageChange"
            @items-per-page-change="handleItemsPerPageChange"
            class="mt-4"
          />
        </div>
      </DataTableWrapper>

      <!-- Dialog: Show All Assigned Doors -->
      <v-dialog v-model="showDoorViewDialog" max-width="400px">
        <v-card>
          <v-card-title class="pa-6 pb-4 dialog-header">
            <div class="d-flex align-center justify-space-between w-100">
              <h3 class="text-h6 font-weight-bold dialog-title">
                Assigned Doors ({{ selectedDeviceDoors?.length || 0 }})
              </h3>
              <v-btn
                icon="mdi-close"
                @click="showDoorViewDialog = false"
                variant="text"
                size="small"
                class="rounded-lg dialog-close-btn"
              />
            </div>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(door, index) in selectedDeviceDoors"
                :key="index"
              >
                <v-list-item-title>
                  <v-icon icon="mdi-door" size="16" class="mr-2" />
                  {{ door }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="pa-6 pt-4 dialog-footer">
            <v-spacer />
            <BaseButton
              text="Close"
              variant="danger"
              color="grey-darken-1"
              size="md"
              @click="showDoorViewDialog = false"
              class="footer-btn"
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
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
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { Plus } from "lucide-vue-next";
import { VIcon } from "vuetify/components";

const loading = ref(true);
const showAddDevicePanel = ref(false);
const error = ref(null);
const token = authService.getToken();
const tenantId = ref(null);
const editingDevice = ref(null);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(25);

// Dialog
const showDoorViewDialog = ref(false);
const selectedDeviceDoors = ref([]);

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
    width: "300px",
  },
]);

// Data
const devices = ref([]);
const branches = ref([]);
const doors = ref([]);

// Format devices
const formattedDevices = computed(() => {
  return devices.value.map((device) => {
    const branch =
      branches.value.find((b) => b.id === device.branchDetails) || {};
    const assignedDoorNames = device.selectedDoors
      ? device.selectedDoors.map((doorId) => {
          const door = doors.value.find((d) => d.id === doorId);
          return door ? door.doorName : "Unknown Door";
        })
      : [];

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
      id: device.id,
    };
  });
});

// Computed property for paginated devices
const paginatedDevices = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return formattedDevices.value.slice(startIndex, endIndex);
});

// Fetch all data
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
      "status",
      "controllerStatus",
      "branchDetails",
    ];
    const deviceUrl = new URL(
      `${import.meta.env.VITE_API_URL}/items/controllers`
    );
    deviceFields.forEach((f) => deviceUrl.searchParams.append("fields[]", f));
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
    if (!deviceResponse.ok) throw new Error("Failed to fetch devices");
    const deviceData = await deviceResponse.json();
    devices.value = deviceData.data || [];

    // Fetch branches
    const branchFields = ["locdetail", "locType", "id"];
    const branchUrl = new URL(
      `${import.meta.env.VITE_API_URL}/items/locationManagement`
    );
    branchFields.forEach((f) => branchUrl.searchParams.append("fields[]", f));
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
    if (!branchResponse.ok) throw new Error("Failed to fetch branches");
    const branchData = await branchResponse.json();
    branches.value = branchData.data || [];

    // Fetch doors
    const doorFields = ["id", "doorName"];
    const doorUrl = new URL(`${import.meta.env.VITE_API_URL}/items/doors`);
    doorFields.forEach((f) => doorUrl.searchParams.append("fields[]", f));
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
    if (!doorResponse.ok) throw new Error("Failed to fetch doors");
    const doorData = await doorResponse.json();
    doors.value = doorData.data || [];

    // Reset to first page when data changes
    currentPage.value = 1;
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = err.message || "Failed to load data";
    showToast("Failed to load data. Please try again.", "error");
  } finally {
    loading.value = false;
  }
};

// Pagination handlers
const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1; // Reset to first page when items per page changes
};

// Row click → Edit
const handleRowClick = (item) => {
  if (item?.rawData) handleEditDevice(item.rawData);
};

const handleEditDevice = (device) => {
  editingDevice.value = device;
  openAddDevicePanel();
};

const openAddDevicePanel = () => {
  showAddDevicePanel.value = true;
};

const closeAddDevicePanel = () => {
  showAddDevicePanel.value = false;
  editingDevice.value = null;
};

const handleSaveSuccess = () => {
  getDeviceData();
  closeAddDevicePanel();
  showToast("Device saved successfully!", "success");
};

// Show dialog
const showDoorsDialog = (item) => {
  selectedDeviceDoors.value = item.assignedDoors;
  showDoorViewDialog.value = true;
};

const showToast = (msg, type = "success") => {
  console.log(`${type.toUpperCase()}: ${msg}`);
};

onMounted(() => {
  getDeviceData();
});
</script>

<style scoped>
.w-2\/3,
.w-full {
  transition: width 0.3s ease;
}

.branch-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.view-more-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-more-chip:hover {
  background-color: #e0e0e0 !important;
}

/* Dialog Styling */
.dialog-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.dialog-close-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.dialog-close-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.dialog-footer {
  background: #f8f9fa;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.footer-btn {
  min-width: 100px;
  border-radius: 12px;
  text-transform: none;
  font-weight: 600;
  height: 38px;
}
</style>
