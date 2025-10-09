<template>
  <div class="card-management-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- Header section with search and filter toggle -->
      <div class="header-section">
        <div class="left-section">
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            class="search-field ml-4"
            hide-details
          ></v-text-field>
        </div>

        <div class="actions-container">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-filter"
            @click="toggleFilters"
            :class="{ 'position-relative': hasActiveFilters }"
          >
            Filters
            <div v-if="hasActiveFilters" class="filter-indicator"></div>
          </v-btn>
        </div>
      </div>

      <!-- Table Content -->
      <v-data-table
        :headers="cardManagementHeaders"
        :items="filteredCardManagementData"
        :items-per-page="-1"
        hide-default-footer
        class="elevation-1 card-management-table"
        height="calc(90vh - 240px)"
        fixed-header
        @click:row="handleRowClick"
      >
        <!-- Custom column for Card Access to show Enable/Disable instead of true/false -->
        <template v-slot:item.cardAccess="{ item }">
          <v-chip
            :color="item.cardAccess ? 'success' : 'error'"
            size="small"
            label
          >
            {{ item.cardAccess ? "Enable" : "Disable" }}
          </v-chip>
        </template>

        <!-- Custom column for Type to show with badge -->
        <template v-slot:item.type="{ item }">
          <v-chip
            :color="getTypeColor(item.type)"
            size="small"
            label
            variant="tonal"
          >
            {{ item.type }}
          </v-chip>
        </template>
      </v-data-table>

      <!-- Custom Pagination -->
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
          <div class="d-flex align-center justify-space-between">
            <h3 class="text-h6 font-weight-medium">Filters</h3>
            <v-btn icon @click="toggleFilters">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <div class="filter-content">
          <!-- Card Type Filter -->
          <div class="mb-4">
            <h4 class="text-subtitle-1 mb-2">Card Type</h4>
            <v-select
              v-model="filters.type"
              :items="cardTypeOptions"
              label="Select Card Type"
              multiple
              chips
              closable-chips
              variant="outlined"
              @update:model-value="applyFilters"
            ></v-select>
          </div>

          <!-- Card Access Filter -->
          <div class="mb-4">
            <h4 class="text-subtitle-1 mb-2">Card Access</h4>
            <v-radio-group v-model="filters.cardAccess" @change="applyFilters">
              <v-radio label="All" value="all"></v-radio>
              <v-radio label="Enable" :value="true"></v-radio>
              <v-radio label="Disable" :value="false"></v-radio>
            </v-radio-group>
          </div>

          <div class="filter-actions">
            <v-btn color="error" variant="text" @click="clearFilters">
              Clear All
            </v-btn>
            <v-btn color="primary" @click="applyFilters" class="ms-2">
              Apply
            </v-btn>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "../../../../utils/pagination/CustomPagination.vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";

// State
const router = useRouter();
const showFilters = ref(false);
const search = ref("");
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

// Card type options
const cardTypeOptions = ref(["rfid", "tag"]);

// Table Headers
const cardManagementHeaders = ref([
  {
    title: "EmpId",
    key: "employeeId.employeeId",
    align: "start",
    sortable: false,
  },
  {
    title: "Name",
    key: "user_created",
    align: "start",
    sortable: false,
  },
  { title: "RFID Card", key: "rfidCard", align: "start", sortable: true },
  { title: "Type", key: "type", align: "start", sortable: true },
  { title: "Card Access", key: "cardAccess", align: "start", sortable: true },
  {
    title: "Access Level",
    key: "accessLevelsId",
    align: "start",
    sortable: false,
  },
]);

// Filters
const filters = reactive({
  type: [],
  cardAccess: "all", // Default to show all
});

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return filters.type.length > 0 || filters.cardAccess !== "all";
});

// Data
const cardManagementData = ref([]);

// Get color for card type
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "rfid":
      return "primary";
    case "tag":
      return "info";
    default:
      return "grey";
  }
};

const handleRowClick = (event, { item }) => {
  // Ensure item and item.id are defined
  if (item && item.id) {
    router.push(`/employee-details/employee/${item.id}/accessmodule`);
  } else {
    console.error("Invalid item or item ID");
  }
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
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${queryString}`,
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
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
  }
};

// Fetch Data
const fetchCardManagementData = async () => {
  await aggregateCount();
  try {
    const params = {
      fields: [
        "id",
        "rfidCard",
        "type",
        "cardAccess",
        "employeeId.employeeId",
        "accessLevelsId",
        "user_created.first_name",
        "user_created.last_name",
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

    // Fetch data
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    cardManagementData.value = data.data;
  } catch (error) {
    console.error("Error fetching card management data:", error);
  }
};

const filterParams = () => {
  const params = {};
  params["filter[tenant][tenantId][_eq]"] = tenantId;

  // Search filter
  if (search.value) {
    if (!isNaN(search.value)) {
      params["filter[_or][0][rfidCard][_eq]"] = search.value;
      params["filter[_or][1][accessLevelsId][_eq]"] = search.value;
    } else {
      params["filter[_or][0][type][_icontains]"] = search.value;
      params["filter[_or][1][user_created][first_name][_icontains]"] =
        search.value;
    }
  }

  // Card Type filter
  if (filters.type.length > 0) {
    params["filter[type][_in]"] = filters.type.join(",");
  }

  // Card Access filter (Enable/Disable)
  if (filters.cardAccess !== "all") {
    params["filter[cardAccess][_eq]"] = filters.cardAccess;
  }

  return params;
};

// Debounced search function
const debouncedSearch = debounce(() => {
  fetchCardManagementData();
}, 300);

// Watch for changes in search
watch(search, () => {
  debouncedSearch();
});

// Computed
const filteredCardManagementData = computed(() => {
  return cardManagementData.value.map((item) => ({
    ...item,
    user_created: `${item.user_created.first_name} ${item.user_created.last_name}`,
  }));
});

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  filters.type = [];
  filters.cardAccess = "all";
  fetchCardManagementData();
};

const applyFilters = () => {
  page.value = 1; // Reset to first page when applying filters
  fetchCardManagementData();
  if (showFilters.value) {
    showFilters.value = false;
  }
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchCardManagementData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1; // Reset to first page when changing items per page
  fetchCardManagementData();
};

// Lifecycle hooks
onMounted(async () => {
  await fetchCardManagementData();
});
</script>

<style scoped>
.card-management-container {
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

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 8px 16px;
  border-radius: 4px;
}

.left-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.actions-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgb(14, 98, 167);
  color: #e0e0e0;
}

.search-field {
  width: 240px;
  max-width: 240px;
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
}

.filter-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.filter-actions {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

/* Filter indicator */
.position-relative {
  position: relative;
}

.filter-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background-color: #ff0000;
  border-radius: 50%;
  border: 1px solid white;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
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

:deep(.v-data-table tbody td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
}

.text-caption {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}
</style>
