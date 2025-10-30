<template>
  <div class="flex">
    <div
      v-if="showAddPanel"
      class="w-1/3 p-4 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto"
    >
      <AccessLevelAdd
        :is-editing="isEditing"
        :access-level-data="currentAccessLevelData"
        :tenant-id="tenantId"
        @save-success="handleSaveSuccess"
        @cancel="closeAddPanel"
      />
    </div>

    <!-- Main Content -->
    <div :class="showAddPanel ? 'w-2/3' : 'w-full'" class="p-4">
      <DataTableWrapper title="Access Level Configuration" :showSearch="false">
        <template #toolbar-actions>
          <BaseButton
            variant="primary"
            size="md"
            text="Add New Access Level"
            :leftIcon="Plus"
            @click="openAddPanel"
          />
        </template>

        <!-- Skeleton Loading -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="5"
          :columns="3"
        />

        <!-- Table Section -->
        <DataTable
          v-else
          :items="accessLevels"
          :columns="headers"
          :showSelection="false"
          :expandable="false"
          show-header
          :row-clickable="true"
          @rowClick="handleRowClick"
        >
          <!-- Custom Switch Cell -->
          <template #cell-type="{ item }">
            <v-switch
              v-model="item.type"
              color="primary"
              inset
              hide-details
              density="compact"
              @change="onToggleAccessType(item)"
            ></v-switch>
          </template>
          <!-- Action Column for Editing -->
          <template #actions="{ item }">
            <BaseButton
              variant="ghost"
              size="sm"
              text="Edit"
              @click="handleEditAccessLevel(item)"
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
import AccessLevelAdd from "@/pages/accesslevel/acessleveladd.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import { Plus, Trash } from "lucide-vue-next";

const loading = ref(true);
const showAddPanel = ref(false);
const isEditing = ref(false);
const currentAccessLevelData = ref(null);
const accessLevels = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

const headers = ref([
  {
    label: "Access Level Number",
    key: "accessLevelNumber",
    sortable: true,
    width: "200px",
  },
  { label: "Access Level Name", key: "name", sortable: true, width: "200px" },
  {
    label: "Status",
    key: "type",
    sortable: true,
    width: "200px",
    type: "switch",
  },
]);

// Fetch access levels from API
const fetchAccessLevels = async () => {
  try {
    loading.value = true;
    console.log("⏳ Loading started...");

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "accessLevelNumber",
      "accessLevelName",
      "accessType",
      "tenant.tenantId",
      "assignDoorsGroup",
      "_24hrs",
      "timeZone",
      "maxWorkHours",
    ];

    // Construct URL with query parameters
    const url = new URL(`${import.meta.env.VITE_API_URL}/items/accesslevels`);
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

    console.log("📥 Raw Response:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Parsed Response JSON:", data);

    if (!data || !data.data) {
      throw new Error("Unexpected response structure");
    }

    accessLevels.value = data.data.map((item) => {
      console.log("🧩 Mapping item:", item);
      return {
        id: item.id,
        name: item.accessLevelName,
        type: item.accessType,
        accessLevelNumber: item.accessLevelNumber,
        originalData: { ...item },
      };
    });

    console.log("✅ Final Access Levels:", accessLevels.value);
  } catch (error) {
    console.error("🚨 Failed to fetch access levels:", error);
    showToast("Failed to load access levels. Please try again.", "error");
  } finally {
    loading.value = false;
    console.log("✅ Loading finished.");
  }
};

// Button actions
const openAddPanel = () => {
  isEditing.value = false;
  currentAccessLevelData.value = null;
  showAddPanel.value = true;
};

const closeAddPanel = () => {
  showAddPanel.value = false;
  isEditing.value = false;
  currentAccessLevelData.value = null;
};

const handleRowClick = (item) => {
  if (item && item.id) {
    handleEditAccessLevel(item);
  } else {
    console.error("Invalid item or item ID");
    showToast(
      "Unable to open access level details. Please try again.",
      "error"
    );
  }
};

const handleEditAccessLevel = (accessLevel) => {
  isEditing.value = true;
  currentAccessLevelData.value = {
    ...accessLevel.originalData,
    id: accessLevel.id,
    accessLevelName: accessLevel.name,
    accessType: accessLevel.type,
    accessLevelNumber: accessLevel.accessLevelNumber,
  };
  showAddPanel.value = true;
  showToast(`Editing access level: ${accessLevel.name}`, "info");
};

const handleSaveSuccess = () => {
  fetchAccessLevels();
  closeAddPanel();
  showToast("Access level saved successfully!", "success");
};

// Switch handler
const onToggleAccessType = (item) => {
  console.log("Switched:", item.name, "→", item.type);
  showToast(`Access type updated for ${item.name}`, "info");
};

// Toast function
const showToast = (message, type = "success") => {
  console.log(`${type.toUpperCase()}: ${message}`);
};

// Fetch data on component mount
onMounted(() => {
  fetchAccessLevels();
});
</script>

<style scoped>
/* Optional styling for spacing and layout */
</style>
