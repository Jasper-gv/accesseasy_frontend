<template>
  <div class="device-container">
    <div
      v-if="!showForm"
      class="main-content"
      :class="{ 'with-filter': showFilters }"
    >
      <v-data-table
        v-model="selected"
        :headers="headers"
        hide-default-footer
        :loading="loading"
        :items="items"
        :items-per-page="-1"
        class="elevation-1 device-table"
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
            toggleFiltersfalse();
          }
        "
      >
        <template v-slot:item.controllerImage="{ item }">
          <v-avatar size="40" v-if="item.controllerImage?.id">
            <v-img
              v-if="item.controllerImage?.id && item.controllerImage.url"
              :src="item.controllerImage.url"
              :alt="item.controllerName"
            ></v-img>
          </v-avatar>
          <v-avatar size="40" v-else>
            <v-img
              v-if="item.controllerName"
              :src="getDefaultImageForController(item.controllerName)"
              :alt="item.controllerName"
            ></v-img>
            <v-avatar v-else color="grey" class="text-uppercase">
              {{ item.controllerName?.charAt(0) }}</v-avatar
            >
          </v-avatar>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status === 'approved' ? 'success' : 'error'"
            :text-color="item.status === 'approved' ? 'white' : 'white'"
            size="small"
          >
            <v-icon
              start
              small
              :icon="
                item.status === 'approved'
                  ? 'mdi-check-circle'
                  : 'mdi-clock-alert'
              "
            ></v-icon>
            {{ item.status }}</v-chip
          >
        </template>
        <template v-slot:item.controllerStatus="{ item }">
          <v-chip
            :color="getControllerStatusColor(item.controllerStatus)"
            :text-color="'white'"
            size="small"
          >
            <v-icon
              start
              small
              :icon="getControllerStatusIcon(item.controllerStatus)"
            ></v-icon>
            {{ item.controllerStatus }}</v-chip
          >
        </template>
        <template v-slot:item.connectionStatus="{ item }">
          <v-chip
            :color="
              getConnectionStatus(item.last_communicated_time).status ===
              'online'
                ? 'success'
                : 'error'
            "
            :text-color="'white'"
            size="small"
          >
            <v-icon
              start
              small
              :icon="
                getConnectionStatus(item.last_communicated_time).status ===
                'online'
                  ? 'mdi-check-circle'
                  : 'mdi-alert-circle'
              "
            ></v-icon>
            {{ getConnectionStatus(item.last_communicated_time).text }}</v-chip
          >
        </template>
        <template v-slot:item.lastOnline="{ item }">
          {{
            item.last_communicated_time
              ? formatDateTime(item.last_communicated_time)
              : "Never"
          }}</template
        >

        <!-- New slot for Assigned Doors List -->
        <template v-slot:item.assignedDoorsList="{ item }">
          <div v-if="item.doorDetails && item.doorDetails.length > 0">
            <v-btn
              icon
              size="small"
              variant="text"
              color="primary"
              @click.stop="showDoorsPopup(item.doorDetails)"
              title="View Assigned Doors"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <span class="ml-1 text-caption text-grey-darken-1"
              >({{ item.doorDetails.length }})</span
            >
          </div>
          <span v-else class="text-caption text-grey-darken-1"></span>
        </template>

        <template v-slot:top>
          <div class="d-flex align-center py-2 px-4">
            <!-- Left side tabs -->
            <div class="left-tabs">
              <button
                @click="activeTab = 'all'"
                :class="{ active: activeTab === 'all' }"
              >
                <v-icon
                  small
                  class="mr-1"
                  :color="activeTab === 'all' ? 'white' : '#1e88e5'"
                >
                  mdi-format-list-bulleted</v-icon
                >
                All
              </button>
              <button
                @click="activeTab = 'fingerPrint'"
                :class="{ active: activeTab === 'fingerPrint' }"
              >
                <v-avatar size="24" class="mr-1">
                  <v-img :src="getTabIcon('fingerPrint')"></v-img>
                </v-avatar>
                Finger Print
              </button>
              <button
                @click="activeTab = 'fourDoorDevice'"
                :class="{ active: activeTab === 'fourDoorDevice' }"
              >
                <v-avatar size="24" class="mr-1">
                  <v-img :src="getTabIcon('fourDoorDevice')"></v-img>
                </v-avatar>
                4 Door Device
              </button>
              <button
                @click="activeTab = 'aiFace'"
                :class="{ active: activeTab === 'aiFace' }"
              >
                <v-avatar size="24" class="mr-1">
                  <v-img :src="getTabIcon('aiFace')"></v-img>
                </v-avatar>
                AI Face
              </button>
            </div>
            <v-spacer></v-spacer>
            <!-- Search field moved to right side -->
            <v-text-field
              v-model="search"
              label="Search Device"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              class="search-field"
              hide-details
            ></v-text-field>
            <div class="position-relative">
              <v-btn color="primary" @click="toggleFilters" class="ms-2">
                <v-icon start>mdi-filter</v-icon>
                Filters</v-btn
              >
              <span v-if="hasActiveFilters" class="filter-indicator"></span>
            </div>

            <!-- <template v-if="selected.length > 0">
              <v-btn color="error" @click="deleteSelected" class="ms-2">
                <v-icon start>mdi-delete</v-icon>
                Delete ({{ selected.length }})
              </v-btn>
            </template> -->
            <v-btn color="black" class="ms-2" @click="showAddDeviceForm">
              <v-icon start>mdi-plus</v-icon>
              Add Device</v-btn
            >
          </div>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-center">
            <v-icon
              size="small"
              class="me-2"
              @click.stop="editItem(item)"
              title="Edit"
            >
              mdi-pencil</v-icon
            >
          </div>
        </template>
      </v-data-table>
      <CustomPagination
        v-model:page="page"
        v-model:itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>

    <!-- Right Filter Panel -->
    <transition name="slide">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-header">
          <div class="d-flex align-center justify-space-between px-4">
            <h3 class="text-h6 font-weight-medium">Advanced Filters</h3>
            <v-btn icon @click="toggleFilters">
              <v-icon>mdi-close</v-icon>
            </v-btn>
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
          >
            <template v-slot:selection="{ item }"> {{ item.title }}</template>
          </v-select>
          <v-select
            v-model="filters.controllerType"
            :items="['1', '2', '3', '4']"
            label="Controller Type"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
          ></v-select>
          <v-select
            v-model="filters.deviceName"
            :items="deviceOptions"
            label="Device Name"
            multiple
            chips
            closable-chips
            variant="outlined"
            class="mb-4"
            @update:model-value="handleFilterChange"
            persistent-placeholder
          >
            <template v-slot:selection="{ item }"> {{ item.value }}</template>
          </v-select>
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

    <UnApprovedDevicesForm
      v-if="showForm"
      :is-editing="isEditing"
      :device-data="editedItem"
      :tenant-id="tenantId"
      @save-success="handleSaveSuccess"
      @cancel="showForm = false"
    />

    <!-- Assigned Doors Dialog -->
    <v-dialog v-model="showDoorsDialog" max-width="500px">
      <v-card>
        <v-toolbar density="compact" color="grey-lighten-4">
          <v-toolbar-title class="ml-4">Assigned Doors</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="showDoorsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-4">
          <v-list dense>
            <v-list-item
              v-for="(door, index) in doorsToShow"
              :key="index"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-icon color="primary">mdi-door</v-icon>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ door.doorNumber }} - {{ door.doorName }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <div
            v-if="!doorsToShow.length"
            class="text-center text-grey-darken-1"
          >
            No doors assigned.
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { computed, onMounted, reactive, ref, watch } from "vue";
import UnApprovedDevicesForm from "./unApprovedForm.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";

const headers = ref([
  {
    title: "Image",
    key: "controllerImage",
    align: "start",
    sortable: false,
    width: "80px",
  },
  {
    title: "Device Type",
    key: "controllerName",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Device Name", // Add this new header
    key: "deviceName",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Serial Number",
    key: "sn",
    align: "start",
    sortable: true,
    width: "200px",
  },
  // {
  //   title: "Device Status",
  //   key: "status",
  //   align: "start",
  //   sortable: true,
  //   width: "200px",
  // },
  // {
  //   title: "Conectivity Status",
  //   key: "controllerStatus",
  //   align: "start",
  //   sortable: true,
  //   width: "200px",
  // },
  {
    title: "Connection Status",
    key: "connectionStatus",
    align: "start",
    sortable: true,
    width: "200px",
  },
  // {
  //   title: "Last Online",
  //   key: "lastOnline",
  //   align: "start",
  //   sortable: true,
  //   width: "200px",
  // },
  {
    title: "Door Type",
    key: "controllerType",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Assigned Doors", // Changed title
    key: "assignedDoorsList", // New key for custom slot
    align: "start",
    sortable: false, // Set to false as it's a custom display
    width: "150px",
  },
  {
    title: "Door Mode",
    key: "doorMode",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Timer Mode",
    key: "timerMode",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Interlock Mode",
    key: "interlockMode",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Attendance Mode",
    key: "attendanceMode",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Branch",
    key: "branch.branchName",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "AI FaceDevice Group",
    key: "deviceGroup",
    align: "start",
    sortable: true,
    width: "200px",
  },
  // {
  //   title: "Company",
  //   key: "tenant.tenantName",
  //   align: "start",
  //   sortable: true,
  //   width: "150px",
  // },
]);

const showFilters = ref(false);
const search = ref("");
const selected = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const items = ref([]);
const loading = ref(false);
const branchOptions = ref([]);
const activeTab = ref("all");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
var userRole;
const sortBy = ref([]);
const deviceOptions = ref([]);

// New refs for the Assigned Doors Dialog
const showDoorsDialog = ref(false);
const doorsToShow = ref([]);

const filters = reactive({
  branch: [],
  controllerStatus: [],
  controllerType: [],
  deviceName: [],
  dateFrom: "",
  dateTo: "",
});

const selectedStatus = ref(""); // Declare selectedStatus variable

const aggregateCount = async (tabStatus) => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    const params = {
      "aggregate[count]": "id",
      ...filterParams(tabStatus),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?${queryString}`,
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

const getConnectionStatus = (lastCommunicatedTime) => {
  if (!lastCommunicatedTime)
    return { status: "offline", text: "Never Connected" };
  const lastSeen = new Date(lastCommunicatedTime);
  const now = new Date();
  const minutesDiff = Math.floor((now - lastSeen) / (1000 * 60));
  if (minutesDiff <= 1) {
    return { status: "online", text: "Online" };
  } else {
    return {
      status: "offline",
      text: `Offline (${formatTimeDifference(lastSeen)})`,
    };
  }
};

const formatTimeDifference = (lastSeen) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - lastSeen) / 1000);
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fetchDeviceData = async (tabStatus = "") => {
  await aggregateCount(tabStatus);
  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    userRole = userDetails.role?.name;
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }
    loading.value = true;
    const params = {
      fields: [
        "assignedDoor.doors_id.doorNumber",
        "assignedDoor.doors_id.doorName",
        "assignedDoor.doors_id.id",
        "assignedDoor.doors_id.senzrMode",
        "assignedDoor.doors_id.buzzerTimer",
        "assignedDoor.doors_id.buzzerMode",
        "assignedDoor.doors_id.timerMode",
        "id",
        "controllerIP",
        "serverIp",
        "controllerStatus",
        "controllerName",
        "controllerImage.id",
        "controllerImage.type",
        "controllerImage.title",
        "deviceName",
        "passiveMode",
        "quality_threshold",
        "comparison_threshold ",
        "liveness_threshold",
        "status",
        "controllerType",
        "assignedDoor.id",
        "doorMode",
        "timerMode",
        "interlockMode",
        "time_difference",
        "interval",
        "parkingMode",
        "attendanceMode",
        "sn",
        "antiPassbackMode",
        "tenant.tenantId",
        "tenant.tenantName",
        "branch.branchName",
        "branch.id",
        "deviceGroup",
        "date_created",
        "last_communicated_time",
        "identification_Intervel",
        "identification_distance",
        "selectedDoors",
      ],
      ...filterParams(tabStatus),
      sort: "-date_created",
      limit: itemsPerPage.value,
      page: page.value,
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
      `${import.meta.env.VITE_API_URL}/items/controllers?${queryString}`,
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
    const itemsWithImages = await Promise.all(
      data.data.map(async (item) => {
        if (item.controllerImage?.id) {
          item.controllerImage.url = await getImageUrl(item.controllerImage.id);
        }

        return item;
      }),
    );
    const allDoorIds = itemsWithImages.flatMap(
      (item) => item.selectedDoors || [],
    );
    const doorDetailsMap =
      allDoorIds.length > 0 ? await fetchDoorDetails(allDoorIds) : {};

    items.value = itemsWithImages.map((item) => {
      if (item.selectedDoors && item.selectedDoors.length > 0) {
        item.doorDetails = item.selectedDoors
          .map((id) => doorDetailsMap[id])
          .filter((door) => door !== undefined);
      } else {
        item.doorDetails = [];
      }
      return item;
    });

    items.value = itemsWithImages;
  } catch (error) {
    console.error("Error fetching device data:", error);
  } finally {
    loading.value = false;
  }
};
const fetchDoorDetails = async (doorIds) => {
  try {
    const token = authService.getToken();
    const params = new URLSearchParams({
      "filter[id][_in]": doorIds.join(","),
      fields: "id,doorName,doorNumber",
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?${params}`,
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

    return data.data.reduce((map, door) => {
      map[door.id] = door;
      return map;
    }, {});
  } catch (error) {
    console.error("Error fetching door details:", error);
    return {};
  }
};

const filterParams = (tabStatus) => {
  const params = { "filter[tenant][tenantId][_eq]": tenantId };

  // Add controller name filter based on active tab
  if (activeTab.value !== "all") {
    let controllerNameFilter = "";
    switch (activeTab.value) {
      case "fourDoorDevice":
        controllerNameFilter = "4 door device";
        break;
      case "fingerPrint":
        controllerNameFilter = "finger print";
        break;
      case "aiFace":
        controllerNameFilter = "AI face";
        break;
    }
    params["filter[controllerName][_contains]"] = controllerNameFilter;
  }

  if (filters.branch.length) {
    params["filter[branch][branchName][_in]"] = filters.branch;
  }
  if (filters.controllerType.length) {
    params["filter[controllerType][_eq]"] = filters.controllerType;
  }

  if (filters.deviceName.length) {
    params["filter[deviceName][_in]"] = filters.deviceName.join(",");
  }

  if (search.value) {
    params["filter[_or][0][controllerName][_contains]"] = search.value;
    params["filter[_or][1][branch][branchName][_icontains]"] = search.value;
    params["filter[_or][2][sn][_icontains]"] = search.value;
    params["filter[_or][3][id][_icontains]"] = search.value;
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
  fetchDeviceData(activeTab.value === "all" ? "" : activeTab.value); // Pass current activeTab
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  fetchDeviceData(activeTab.value === "all" ? "" : activeTab.value); // Pass current activeTab
};

const getStatusCount = (status) => {
  if (!hasActiveFilters.value && selectedStatus.value === "all") {
    return 0;
  }
};

const hasActiveFilters = computed(() => {
  return (
    filters.branch.length > 0 ||
    filters.controllerType.length > 0 ||
    filters.deviceName.length > 0
  );
});

const getControllerStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "successfull":
      return "purple";
    case "failed":
      return "error";
    case "waiting":
      return "warning";
    default:
      return "grey";
  }
};

const getControllerStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "successfull":
      return "mdi-check-circle-outline";
    case "failed":
      return "mdi-close-circle-outline";
    case "waiting":
      return "mdi-timer-sand";
    default:
      return "mdi-help-circle";
  }
};

const getImageUrl = async (imageId) => {
  const token = authService.getToken();
  if (!token) {
    console.error("Authentication token is missing.");
    return null;
  }
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assets/${imageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const toggleFiltersfalse = () => {
  showFilters.value = false;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
};

const applyFilters = () => {
  showFilters.value = false;
  fetchDeviceData(activeTab.value === "all" ? "" : activeTab.value); // Re-fetch data with applied filters
};

const showAddDeviceForm = () => {
  isEditing.value = false;
  editedItem.value = {};
  showForm.value = true;
};

const editItem = (item) => {
  isEditing.value = true;
  editedItem.value = JSON.parse(JSON.stringify(item));
  showForm.value = true;
};

const handleSaveSuccess = () => {
  showForm.value = false;
  fetchDeviceData(activeTab.value === "all" ? "" : activeTab.value); // Re-fetch data after save
};

const deleteItem = async (item) => {
  if (confirm("Are you sure you want to delete this device?")) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/controllers/${item.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete device");
      }
      const index = items.value.findIndex((dev) => dev.id === item.id); // Changed from deviceData.value
      if (index !== -1) {
        items.value.splice(index, 1); // Changed from deviceData.value
      }
      alert("Device deleted successfully");
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("An error occurred while deleting the device");
    }
  }
};

const deleteSelected = async () => {
  if (!selected.value.length) {
    alert("Please select items to delete");
    return;
  }
  const itemsToDelete = selected.value
    .map((item) => {
      return typeof item === "number" ? item.id : item;
    })
    .filter((id) => id !== undefined);

  if (
    confirm(
      `Are you sure you want to delete ${itemsToDelete.length} selected device(s)?`,
    )
  ) {
    try {
      const deletePromises = itemsToDelete.map((id) =>
        fetch(`${import.meta.env.VITE_API_URL}/items/controllers/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }),
      );
      const responses = await Promise.all(deletePromises);
      const allSuccessful = responses.every((response) => response.ok);
      if (allSuccessful) {
        items.value = items.value.filter(
          (dev) => !itemsToDelete.includes(dev.id),
        ); // Changed from deviceData.value
        selected.value = [];
        alert("Selected devices deleted successfully");
      } else {
        throw new Error("Some devices could not be deleted");
      }
    } catch (error) {
      console.error("Error deleting selected devices:", error);
      alert("An error occurred while deleting the selected devices");
    }
  }
};
const fetchDeviceNames = async () => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?fields[]=deviceName&filter[tenant][tenantId][_eq]=${tenantId}`,
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
    // Extract unique device names
    const names = [
      ...new Set(data.data.map((item) => item.deviceName).filter(Boolean)),
    ];
    deviceOptions.value = names;
  } catch (error) {
    console.error("Error fetching device names:", error);
  }
};
const fetchBranchOptions = async () => {
  const token = authService.getToken();
  const tenantId = await currentUserTenant.getTenantId();
  if (!token || !tenantId) {
    console.error("Authentication required or tenant not found");
    return;
  }
  try {
    const params = new URLSearchParams({
      "filter[tenant][tenantId][_eq]": tenantId,
    });
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch branch options");
    }
    const data = await response.json();
    branchOptions.value = data.data.map((b) => b.branchName);
  } catch (error) {
    console.error("Error fetching branch options:", error);
  }
};

// New method to show the doors popup
const showDoorsPopup = (doors) => {
  doorsToShow.value = doors;
  showDoorsDialog.value = true;
};

watch(
  [search, filters, sortBy, activeTab], // Add sortBy to watch
  () => {
    page.value = 1; // Reset page when search, filters, or sort changes
    fetchDeviceData(activeTab.value === "all" ? "" : activeTab.value);
  },
  {
    deep: true,
  },
);

watch(activeTab, (newTab) => {
  page.value = 1; // Reset page when tab changes
  fetchDeviceData(newTab === "all" ? "" : newTab);
});

onMounted(async () => {
  fetchDeviceData(activeTab.value === "all" ? "" : activeTab.value);
  fetchBranchOptions();
  fetchDeviceNames();
});
const getTabIcon = (tabName) => {
  switch (tabName) {
    case "aiFace":
      return "/deviceImages/Aiface.jpg";
    case "fingerPrint":
      return "/deviceImages/FingerPrint.jpg";
    case "fourDoorDevice":
      return "/deviceImages/DoorDevice.jpg";
    default:
      return null;
  }
};
const getDefaultImageForController = (controllerName) => {
  switch (controllerName) {
    case "AI face":
      return "/deviceImages/Aiface.jpg";
    case "finger print":
      return "/deviceImages/FingerPrint.jpg";
    case "4 door device":
      return "/deviceImages/DoorDevice.jpg";
    default:
      return null;
  }
};

const statuses = [
  { value: "all", text: "All", color: "grey" },
  { value: "approved", text: "Approved", color: "success" },
  { value: "unApproved", text: "Unapproved", color: "error" },
];
</script>

<style scoped>
.device-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}
.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  transition: margin-right 0.3s ease;
}
.main-content.with-filter {
  margin-right: 300px;
}
.search-field {
  max-width: 300px;
}
:deep(.v-data-table) {
  background: white;
  table-layout: fixed;
  width: 100%;
}
:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}
:deep(.v-data-table__wrapper table) {
  width: 100%;
}
:deep(.v-data-table th),
:deep(.v-data-table td) {
  width: auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.v-data-table th:nth-child(1)),
:deep(.v-data-table td:nth-child(1)) {
  width: 80px;
}
:deep(.v-data-table th:nth-child(2)),
:deep(.v-data-table td:nth-child(2)) {
  width: 150px;
}
:deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background: #ebeaea !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: black !important;
  text-align: start;
  z-index: 1;
}
.v-chip--size-small {
  height: 24px;
  font-size: 12px;
}
.v-chip--success {
  background-color: #4caf50 !important;
}
.v-chip--error {
  background-color: #f44336 !important;
}
.left-tabs {
  display: flex;
  gap: 8px;
}
.left-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f0f0f0;
  color: #666;
}
.left-tabs button.active {
  background-color: black;
  color: white;
}
.v-avatar .v-img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
.v-chip {
  font-weight: 600;
}
.position-relative {
  position: relative;
}
.filter-indicator {
  position: absolute;
  top: 2px;
  right: 3px;
  width: 14px;
  height: 14px;
  background-color: #ff0000;
  border-radius: 50%;
  border: 2px solid white;
  pointer-events: none;
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
:deep(.v-data-table__wrapper::-webkit-scrollbar) {
  height: 8px;
  width: 8px;
}
:deep(.v-data-table__wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
}
:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background: #888;
  border-radius: 4px;
}
:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background: #555;
}
.filter-content::-webkit-scrollbar {
  width: 8px;
}
.filter-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.filter-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
.filter-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
