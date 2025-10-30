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
            :leftIcon="Plus"
            @click="openAddDoorPanel"
          />
        </template>

        <!-- Skeleton Loading -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="5"
          :columns="6"
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
import { Plus, Trash } from "lucide-vue-next";

const loading = ref(true);
const showAddDoorPanel = ref(false);
const isEditing = ref(false);
const currentDoorData = ref(null);
const doors = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

const headers = ref([
  { label: "Door Number", key: "doorNumber", sortable: true, width: "150px" },
  { label: "Door Name", key: "doorName", sortable: true, width: "150px" },
  { label: "Door Type", key: "doorType", sortable: true, width: "150px" },
  { label: "Branch", key: "branch", sortable: true, width: "150px" },
  { label: "Location", key: "location", sortable: true, width: "150px" },
  { label: "Departments", key: "departments", sortable: false, width: "200px" },
]);

const departmentMap = ref(new Map());

const fetchDepartments = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=id&fields[]=departmentName`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch departments");
    }

    const data = await response.json();

    departmentMap.value = new Map(
      data.data.map((dept) => [dept.id, dept.departmentName])
    );

    console.log("Department map created:", departmentMap.value);
    return departmentMap.value;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return new Map();
  }
};

const getDepartmentNamesFromIds = (departmentIds) => {
  if (!departmentIds) return [];

  try {
    let idsArray = [];

    if (typeof departmentIds === "string") {
      idsArray = JSON.parse(departmentIds);
    } else if (Array.isArray(departmentIds)) {
      idsArray = departmentIds;
    } else if (typeof departmentIds === "number") {
      idsArray = [departmentIds];
    }

    const departmentNames = idsArray
      .map((id) => departmentMap.value.get(id) || `Unknown (ID: ${id})`)
      .filter((name) => name);

    return departmentNames;
  } catch (error) {
    console.error("Error parsing departmentIds:", error, departmentIds);
    return [];
  }
};

const fetchDoors = async () => {
  try {
    loading.value = true;
    const userDetails = await currentUserTenant.fetchLoginUserDetails();

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    await fetchDepartments();

    const fields = [
      "id",
      "doorNumber",
      "doorName",
      "uniqueId",
      "doorType",
      "assignedDepts.departmentName",
      "assignedDepts.departmentId",
      "assignedDepts.id",
      "departmentIds",
      "tenant.tenantId",
      "tenant.tenantName",
      "branchLocation.id",
      "branchLocation.locdetail",
      "status",
      "location",
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
      console.log("Processing door:", door);
      console.log("Department IDs:", door.departmentIds);

      let departmentsText = "Not assigned";
      let departmentArray = [];

      // PRIORITY 1: Use departmentIds JSON field (NEW LOGIC)
      if (door.departmentIds) {
        departmentArray = getDepartmentNamesFromIds(door.departmentIds);
        console.log("Department names from departmentIds:", departmentArray);
      }

      // PRIORITY 2: Fallback to assignedDepts (old logic for backward compatibility)
      if (departmentArray.length === 0 && door.assignedDepts) {
        if (Array.isArray(door.assignedDepts)) {
          // Normal case: array of objects
          departmentArray = door.assignedDepts
            .filter((dept) => dept && (dept.departmentName || dept.id))
            .map(
              (dept) =>
                dept.departmentName ||
                departmentMap.value.get(dept.id) ||
                "Unknown"
            );
        } else if (typeof door.assignedDepts === "number") {
          // Handle malformed case: single ID
          const deptName = departmentMap.value.get(door.assignedDepts);
          departmentArray = deptName ? [deptName] : ["Unknown"];
        } else if (door.assignedDepts.departmentName) {
          // Handle malformed object case
          departmentArray = [door.assignedDepts.departmentName];
        }
      }

      departmentsText =
        departmentArray.length > 0
          ? departmentArray.join(", ")
          : "Not assigned";

      return {
        id: door.id,
        doorNumber: door.doorNumber,
        doorName: door.doorName,
        doorType: door.doorType,
        status: door.status || "active",
        branch: door.branchLocation?.locdetail?.locationName || "N/A",
        location: door.location || "N/A", // Add location here
        departments: departmentsText,
        originalData: {
          ...door,
          branchLocation: door.branchLocation,
          departmentIds: door.departmentIds,
          assignedDepts: Array.isArray(door.assignedDepts)
            ? door.assignedDepts
            : typeof door.assignedDepts === "number"
              ? [{ id: door.assignedDepts }]
              : door.assignedDepts
                ? [door.assignedDepts]
                : [],
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

  // Prepare department data for editing
  let departmentIds = [];

  if (door.originalData?.departmentIds) {
    try {
      // Parse departmentIds for editing
      if (typeof door.originalData.departmentIds === "string") {
        departmentIds = JSON.parse(door.originalData.departmentIds);
      } else if (Array.isArray(door.originalData.departmentIds)) {
        departmentIds = [...door.originalData.departmentIds];
      }
    } catch (error) {
      console.error("Error parsing departmentIds for editing:", error);
    }
  }

  // Fallback to assignedDepts if departmentIds is empty
  if (departmentIds.length === 0 && door.originalData?.assignedDepts) {
    departmentIds = Array.isArray(door.originalData.assignedDepts)
      ? door.originalData.assignedDepts.map(
          (dept) => dept.departmentId || dept.id || dept
        )
      : typeof door.originalData.assignedDepts === "number"
        ? [door.originalData.assignedDepts]
        : door.originalData.assignedDepts
          ? [door.originalData.assignedDepts]
          : [];
  }

  currentDoorData.value = {
    ...door.originalData,
    id: door.id,
    doorName: door.doorName,
    doorNumber: door.doorNumber,
    doorType: door.doorType,
    status: door.status,
    branchLocation: door.originalData?.branchLocation,
    location: door.location, // Include location in edit data
    assignedDepts: departmentIds, // This will be used in the multi-select
  };

  console.log("Editing door with data:", currentDoorData.value);
  showAddDoorPanel.value = true;
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
};

// Fetch doors when component mounts
onMounted(() => {
  fetchDoors();
});
</script>
