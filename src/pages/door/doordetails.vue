<template>
  <div class="flex">
    <!-- Left Panel for Add Door Details -->
    <div
      v-if="showAddDoorPanel"
      class="w-1/3 p-4 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <AddDoorDetails
        :is-editing="isEditing"
        :door-data="currentDoorData"
        :tenant-id="tenantId"
        @save-success="handleSaveSuccess"
        @cancel="closeAddDoorPanel"
      />
    </div>

    <!-- Main Content -->
    <div :class="showAddDoorPanel ? 'w-2/3' : 'w-full'" class="p-4">
      <DataTableWrapper title="Door Configuration" :showSearch="false">
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            size="md"
            text="Add New Door"
            :leftIcon="PlusIcon"
            @click="openAddDoorPanel"
          />
        </template>

        <!-- Skeleton Loading -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="5"
          :columns="5"
        />

        <!-- Table Section -->
        <DataTable
          v-else
          :items="doors"
          :columns="headers"
          :showSelection="false"
          :expandable="false"
          show-header
          :row-clickable="true"
          @rowClick="handleRowClick"
        >
          <!-- Add action column for editing -->
          <template #actions="{ item }">
            <BaseButton
              variant="ghost"
              size="sm"
              text="Edit"
              @click="handleEditDoor(item)"
            />
          </template>
        </DataTable>
      </DataTableWrapper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import AddDoorDetails from "@/pages/door/adddoordetails.vue";

const loading = ref(true);
const showAddDoorPanel = ref(false);
const isEditing = ref(false);
const currentDoorData = ref(null);
const doors = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

// Updated headers to include actions
const headers = ref([
  { label: "Door Number", key: "doorNumber", sortable: true, width: "150px" },
  { label: "Door Name", key: "doorName", sortable: true, width: "150px" },
  { label: "Door Type", key: "doorType", sortable: true, width: "150px" },
  { label: "Branch", key: "branch", sortable: true, width: "150px" },
  { label: "Departments", key: "departments", sortable: false, width: "150px" },
]);

const fetchDoors = async () => {
  try {
    loading.value = true;
    const userDetails = await currentUserTenant.fetchLoginUserDetails();

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "doorNumber",
      "doorName",
      "uniqueId",
      "doorType",
      "assignedDepts.departmentName",
      "assignedDepts.departmentId",
      "tenant.tenantId",
      "tenant.tenantName",
      "branchLocation.id",
      "branchLocation.locdetail",
      "status",
    ];

    const url = new URL(`${import.meta.env.VITE_API_URL}/items/doors`);
    fields.forEach((field) => {
      url.searchParams.append("fields[]", field);
    });
    url.searchParams.append("filter[status][_neq]", "archived");
    url.searchParams.append("filter[tenant][_eq]", tenantId);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch doors");
    }

    const data = await response.json();

    doors.value = (data.data || []).map((door) => {
      let departmentsText = "Not assigned";

      if (door.assignedDepts && Array.isArray(door.assignedDepts)) {
        const departmentNames = door.assignedDepts
          .filter((dept) => dept.departmentName)
          .map((dept) => dept.departmentName);

        departmentsText =
          departmentNames.length > 0
            ? departmentNames.join(", ")
            : "Not assigned";
      } else if (door.assignedDepts && door.assignedDepts.departmentName) {
        departmentsText = door.assignedDepts.departmentName;
      }

      return {
        id: door.id,
        doorNumber: door.doorNumber,
        doorName: door.doorName,
        doorType: door.doorType,
        status: door.status || "active",
        branch: door.branchLocation?.locdetail?.locationName || "N/A",
        departments: departmentsText,
        originalData: {
          ...door,
          branchLocation: door.branchLocation,
          assignedDepts: door.assignedDepts || [],
        },
      };
    });
  } catch (error) {
    console.error("Error fetching doors:", error);
    showToast("Failed to load doors. Please try again.", "error");
  } finally {
    loading.value = false;
  }
};

// Handle row click to open door details
const handleRowClick = (item) => {
  if (item && item.id) {
    handleEditDoor(item);
  } else {
    console.error("Invalid item or item ID");
    showToast("Unable to open door details. Please try again.", "error");
  }
};

const openAddDoorPanel = () => {
  isEditing.value = false;
  currentDoorData.value = null;
  showAddDoorPanel.value = true;
};

const closeAddDoorPanel = () => {
  showAddDoorPanel.value = false;
  isEditing.value = false;
  currentDoorData.value = null;
};

const handleEditDoor = (door) => {
  isEditing.value = true;
  // Make sure we're passing the complete door data with all necessary fields
  currentDoorData.value = {
    ...door.originalData,
    id: door.id,
    doorName: door.doorName,
    doorNumber: door.doorNumber,
    doorType: door.doorType,
    status: door.status,
    branchLocation: door.originalData?.branchLocation,
    assignedDepts: door.originalData?.assignedDepts || [],
  };
  showAddDoorPanel.value = true;

  // Optional: Show a toast message
  showToast(`Editing door: ${door.doorName}`, "info");
};

const handleSaveSuccess = () => {
  // Refresh the doors list after successful creation/update
  fetchDoors();
  closeAddDoorPanel();
  showToast("Door saved successfully!", "success");
};

// Toast function
const showToast = (message, type = "success") => {
  console.log(`${type.toUpperCase()}: ${message}`);
  // Replace with your actual toast implementation
  // Example: this.$toast[type](message);
};

// Fetch doors when component mounts
onMounted(() => {
  fetchDoors();
});
</script>
