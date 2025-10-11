<template>
  <div class="door-container">
    <div
      v-if="!showForm"
      class="main-content"
      :class="{ 'with-filter': showFilters }"
    >
      <v-data-table
        v-model="selected"
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="-1"
        class="elevation-1 door-table"
        height="calc(90vh - 190px)"
        fixed-header
        show-select
        v-model:sort-by="sortBy"
        @click:row="
          (event, { item }) => {
            if (
              userRole == 'Administrator' ||
              userRole == 'esslAdmin' ||
              userRole == 'Dealer' ||
              userRole == 'Admin' ||
              userRole == 'accessManager' ||
              userRole == 'Manager' // testing manager
            ) {
              editItem(item);
            }
          }
        "
      >
        <template v-slot:top>
          <div class="d-flex align-center py-2 px-4">
            <v-text-field
              v-model="search"
              label="Search Door"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              class="search-field"
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <div class="position-relative">
              <v-btn color="primary" @click="toggleFilters" class="ms-2">
                <v-icon start>mdi-filter</v-icon>
                Filters</v-btn
              >
              <span v-if="hasActiveFilters" class="filter-indicator"></span>
            </div>
            <!-- <v-btn color="black" class="ms-2" @click="showAddDoorForm">
              <v-icon start>mdi-plus</v-icon>
              Add Door</v-btn> -->
          </div>
        </template>

        <!-- Custom slot for timerMode -->
        <template v-slot:item.timerMode="{ item }">
          <v-chip
            :color="
              item.timerMode && item.timerMode !== '0' ? 'primary' : 'grey'
            "
            size="small"
            label
          >
            {{ item.timerMode || "N/A" }}s
          </v-chip>
        </template>

        <!-- Custom slot for buzzerMode -->
        <template v-slot:item.buzzerMode="{ item }">
          <v-chip
            :color="item.buzzerMode ? 'success' : 'error'"
            size="small"
            label
          >
            {{ item.buzzerMode ? "ON" : "OFF" }}
          </v-chip>
        </template>
      </v-data-table>
      <CustomPagination
        :page="page"
        :itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">Advanced Filters</h3>
            <v-btn icon @click="toggleFilters"
              ><v-icon>mdi-close</v-icon></v-btn
            >
          </div>
        </div>
        <div class="filter-content">
          <v-select
            v-model="filters.branch"
            :items="branchOptions"
            label="Branch"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
            persistent-placeholder
            ><template v-slot:selection="{ item }">
              {{ item.title }}</template
            ></v-select
          >
          <v-select
            v-model="filters.department"
            :items="departmentOptions"
            label="Department"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
            persistent-placeholder
            ><template v-slot:selection="{ item }">
              {{ item.title }}</template
            ></v-select
          >
          <div class="filter-actions">
            <v-btn color="error" variant="text" @click="clearFilters">
              Clear</v-btn
            >
            <v-btn color="primary" @click="applyFilters" class="ms-2">
              Apply</v-btn
            >
          </div>
        </div>
      </div>
    </transition>
    <doorManagementForm
      v-if="showForm"
      :is-editing="isEditing"
      :door-data="editedItem"
      :tenant-id="tenantId"
      @save-success="handleSaveSuccess"
      @cancel="showForm = false"
    />
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { computed, onMounted, reactive, ref, watch } from "vue";
import doorManagementForm from "./doorForm.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";

// State management
const showFilters = ref(false);
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const selected = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const items = ref([]);
const loading = ref(false);
const branchOptions = ref([]);
const departmentOptions = ref([]);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const sortBy = ref([]);
var userRole;

const filters = reactive({
  branch: [],
  doorName: "",
  department: [],
});

const headers = ref([
  {
    title: "Door Number",
    key: "doorNumber",
    align: "start",
    sortable: true,
    width: "160px",
  },
  {
    title: "Door Name",
    key: "doorName",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Door Type",
    key: "doorType",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "RA6M3 Devices Group",
    key: "doorGroup",
    align: "start",
    sortable: true,
    width: "250px",
  },
  {
    title: "Timer Mode",
    key: "timerMode",
    align: "center",
    sortable: true,
    width: "160px",
  },
  {
    title: "Buzzer Mode",
    key: "buzzerMode",
    align: "center",
    sortable: true,
    width: "160px",
  },
  {
    title: "Assigned Department",
    key: "assignedDepts.departmentName",
    align: "start",
    sortable: true,
    width: "250px",
  },
  {
    title: "Access Levels",
    key: "accessLevels",
    align: "start",
    sortable: true,
    width: "200px",
    value: (item) => {
      return item.accesslevels?.[0]?.accesslevels_id?.accessLevelName || "";
    },
  },
  {
    title: "Branch Name",
    key: "branch.branchName",
    align: "start",
    sortable: true,
    width: "200px",
  },
]);

const hasActiveFilters = computed(() => {
  return (
    filters.branch.length > 0 ||
    filters.doorName ||
    filters.department.length > 0
  );
});

const handleFilterChange = () => {
  page.value = 1;
  fetchDoorData();
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }
    const countData = await countResponse.json();
    const countValue = countData?.data?.[0]?.count?.id;
    totalItems.value = countValue ? Number(countValue) : 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};

const fetchDoorData = async () => {
  await aggregateCount();
  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    userRole = userDetails.role?.name;
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    loading.value = true;
    const params = {
      fields: [
        "id",
        "doorNumber",
        "doorName",
        "assignedDepts",
        "status",
        "doorType",
        "doorGroup",
        "timerMode", // Ensure this is fetched
        "buzzerMode", // Ensure this is fetched
        "accesslevels.accesslevels_id.id",
        "assignedDepts.departmentName",
        "assignedDepts.id",
        "assignedDepartment.departmentId",
        "accesslevels.accesslevels_id.accessLevelName",
        "assignedAccessLevels.id",
        "tenant.tenantId",
        "tenant.tenantName",
        "branch.branchName",
        "branch.branchId",
        "branch.id",
      ],
      ...filterParams(),
      sort: "date_created",
      page: page.value,
      limit: itemsPerPage.value,
    };
    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Map buzzerMode to boolean for easier use in template
    items.value = data.data.map((item) => ({
      ...item,
      buzzerMode: item.buzzerMode === 1, // Convert 1 to true, 0 to false
    }));
  } catch (error) {
    console.error("Error fetching door data:", error);
  } finally {
    loading.value = false;
  }
};

const fetchFilterOptions = async () => {
  try {
    const branchResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=branchName&fields[]=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (branchResponse.ok) {
      const branchData = await branchResponse.json();
      branchOptions.value = branchData.data.map((branch) => ({
        title: branch.branchName,
        value: branch.id,
      }));
    }

    const deptResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=departmentName&fields[]=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (deptResponse.ok) {
      const deptData = await deptResponse.json();
      departmentOptions.value = deptData.data.map((dept) => ({
        title: dept.departmentName,
        value: dept.id,
      }));
    }
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
};

const filterParams = () => {
  const params = {
    "filter[tenant][tenantId][_eq]": tenantId,
  };
  if (search.value) {
    params["filter[doorName][_icontains]"] = search.value;
  }
  if (filters.doorName) {
    params["filter[doorName][_icontains]"] = filters.doorName;
  }
  if (filters.branch && filters.branch.length > 0) {
    params["filter[branch][id][_in]"] = filters.branch.join(",");
  }
  if (filters.department && filters.department.length > 0) {
    params["filter[assignedDepts][id][_in]"] = filters.department.join(",");
  }
  if (sortBy.value.length > 0) {
    const sortParam = sortBy.value
      .map((sortItem) => {
        const direction = sortItem.order === "desc" ? "-" : "";
        return `${direction}${sortItem.key}`;
      })
      .join(",");
    params["sort"] = sortParam;
  }
  return params;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchDoorData(newPage);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  fetchDoorData(newItemsPerPage);
};

const showAddDoorForm = () => {
  isEditing.value = false;
  editedItem.value = {};
  showForm.value = true;
};

const editItem = (item) => {
  isEditing.value = true;
  editedItem.value = item;
  showForm.value = true;
};

const handleSaveSuccess = () => {
  showForm.value = false;
  fetchDoorData();
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
};

const applyFilters = () => {
  showFilters.value = false;
};

const deleteSelected = async () => {
  if (!selected.value.length) {
    alert("Please select items to delete");
    return;
  }
  if (confirm(`Delete ${selected.value.length} selected door(s)?`)) {
    try {
      const deletePromises = selected.value.map((item) =>
        fetch(`${import.meta.env.VITE_API_URL}/items/doors/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }),
      );
      await Promise.all(deletePromises);
      items.value = items.value.filter(
        (door) => !selected.value.some((item) => item.id === door.id),
      );
      selected.value = [];
      alert("Selected doors deleted successfully");
    } catch (error) {
      console.error("Error deleting doors:", error);
      alert("Error deleting doors");
    }
  }
};

watch(
  [search, sortBy], // Add sortBy to watch
  () => {
    page.value = 1;
    fetchDoorData();
  },
  { debounce: 500 },
);

onMounted(async () => {
  await fetchDoorData();
  await fetchFilterOptions();
});
</script>

<style scoped>
.door-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}
.main-content {
  flex: 1;
  overflow: auto;
  transition: margin-right 0.3s ease;
}
.main-content.with-filter {
  margin-right: 300px;
}
.search-field {
  max-width: 300px;
}
::v-deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background: #ebeaea !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: black !important;
  text-align: start;
  z-index: 1;
}
:deep(.v-data-table) {
  background: white;
}
:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}
.filter-panel {
  width: 300px;
  background: white;
  border-left: 1px solid #e0e0e0;
  position: fixed;
  right: 0;
  top: 64px;
  height: calc(100vh - 64px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}
.filter-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  top: 0;
}
.filter-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
  position: sticky;
  bottom: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
