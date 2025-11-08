<template>
  <div class="mobile-face-embedding-container">
    <div class="main-content">
      <!-- Header section with search and delete button -->
      <div class="header-section">
        <div class="left-section">
          <v-text-field
            v-model="search"
            label="Search by Employee ID or Name"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            class="search-field ml-4"
            hide-details
          ></v-text-field>
        </div>

        <div class="actions-container">
          <v-btn
            v-if="selected.length > 0"
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete"
            @click="deleteSelectedItems"
            :disabled="deleting"
            :loading="deleting"
            class="delete-btn"
          >
            Delete Selected ({{ selected.length }})
          </v-btn>
        </div>
      </div>

      <!-- Table Content -->
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
        :items-per-page="-1"
        hide-default-footer
        class="elevation-1 mobile-face-table"
        height="calc(95vh - 240px)"
        fixed-header
        :loading="loading"
        show-select
        item-value="id"
        return-object
        @update:model-value="logSelectedItems"
        v-model:sort-by="sortBy"
      >
        <template v-slot:item.assignedTo="{ item }">
          <div class="employee-info-compact">
            <div class="employee-name-small">{{ getEmployeeName(item) }}</div>
            <div class="employee-id-small">
              {{ item.assignedTo?.employeeId || "N/A" }}
            </div>
          </div>
        </template>

        <template v-slot:item.facialData="{ item }">
          <div class="data-compact">
            <v-chip size="x-small" color="primary" v-if="item.facialData">
              {{ truncateText(item.facialData, 15) }}
            </v-chip>
            <span v-else class="null-value-small">No Data</span>
          </div>
        </template>

        <template v-slot:item.faceEmbedding="{ item }">
          <div class="face-embedding-data">
            <v-chip size="small" color="secondary" v-if="item.faceEmbedding">
              {{ truncateText(item.faceEmbedding, 30) }}
            </v-chip>
            <span v-else class="null-value-small">No Data</span>
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" label>
            {{ item.status || "Unknown" }}
          </v-chip>
        </template>

        <template v-slot:item.date_created="{ item }">
          <div class="compact-date">
            {{ formatDate(item.date_created) }}
          </div>
        </template>

        <template v-slot:item.date_updated="{ item }">
          <div class="compact-date">
            {{ formatDate(item.date_updated) }}
          </div>
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

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="error" class="mr-2">mdi-delete-alert</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete {{ selected.length }} selected mobile
          face embedding record(s)? <br /><br />
          <strong>This action cannot be undone.</strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            @click="confirmDelete"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { debounce } from "lodash";

// State
const items = ref([]);
const loading = ref(false);
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const selected = ref([]);
const deleteDialog = ref(false);
const deleting = ref(false);
const sortBy = ref([]);

// Snackbar state
const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
  icon: "mdi-check-circle",
});

// Table Headers
const headers = ref([
  {
    title: "Employee",
    key: "assignedTo.assignedUser.first_name",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Face Embedding",
    key: "faceEmbedding",
    align: "start",
    sortable: true,
    width: "120px",
  },
  {
    title: "Status",
    key: "status",
    align: "start",
    sortable: true,
    width: "100px",
  },
  {
    title: "Date Created",
    key: "date_created",
    align: "start",
    sortable: true,
    width: "150px",
  },
  {
    title: "Date Updated",
    key: "date_updated",
    align: "start",
    sortable: true,
    width: "150px",
  },
]);

const showSnackbar = (
  message,
  color = "success",
  icon = "mdi-check-circle"
) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.icon = icon;
  snackbar.show = true;
};

const getEmployeeName = (item) => {
  if (!item?.assignedTo?.assignedUser) return "Unknown";
  return item.assignedTo.assignedUser.first_name || "Unknown";
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "error";
    case "pending":
      return "warning";
    default:
      return "grey";
  }
};

const truncateText = (text, maxLength = 15) => {
  if (!text) return "";

  // Convert array to string if needed
  const textStr = Array.isArray(text) ? text.join(", ") : String(text);

  return textStr.length > maxLength
    ? textStr.substring(0, maxLength) + "..."
    : textStr;
};

const formatDate = (dateString) => {
  if (!dateString) return "-- / --";
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const params = {
      "aggregate[count]": "id",
      "filter[tenant][tenantId][_eq]": tenantId,
      ...filterParams(),
    };

    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/aiFaceId?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!countResponse.ok) {
      throw new Error(`HTTP error! status: ${countResponse.status}`);
    }

    const countData = await countResponse.json();
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

const fetchMobileFaceData = async () => {
  await aggregateCount();

  if (!token) {
    showSnackbar(
      "Authentication required. Please login again.",
      "error",
      "mdi-alert-circle"
    );
    return;
  }

  loading.value = true;
  try {
    const params = {
      fields: [
        "facialData",
        "status",
        "date_created",
        "date_updated",
        "faceEmbedding",
        "assignedTo.assignedUser.id",
        "assignedTo.assignedUser.first_name",
        "assignedTo.assignedUser.last_name",
        "assignedTo.employeeId",
        "assignedTo.id",
        "tenant.tenantName",
        "tenant.tenantId",
        "id",
      ],
      ...filterParams(),
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
      `${import.meta.env.VITE_API_URL}/items/faceId?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    items.value = (result.data || []).map((item) => ({
      id: item.id,
      facialData: item.facialData,
      faceEmbedding: item.faceEmbedding,
      status: item.status,
      date_created: item.date_created,
      date_updated: item.date_updated,
      assignedTo: {
        id: item.assignedTo?.id,
        employeeId: item.assignedTo?.employeeId,
        assignedUser: {
          first_name: item.assignedTo?.assignedUser?.first_name,
          last_name: item.assignedTo?.assignedUser?.last_name,
        },
      },
      tenant: {
        tenantId: item.tenant?.tenantId,
        tenantName: item.tenant?.tenantName,
      },
    }));
  } catch (error) {
    console.error("Error fetching mobile face data:", error);
    showSnackbar(
      error.message || "Failed to fetch mobile face data. Please try again.",
      "error",
      "mdi-alert-circle"
    );
  } finally {
    loading.value = false;
  }
};

const filterParams = () => {
  const params = {
    "filter[tenant][tenantId][_eq]": tenantId,
  };

  if (search.value) {
    params["filter[_or][0][assignedTo][employeeId][_icontains]"] = search.value;
    params["filter[_or][1][assignedTo][assignedUser][first_name][_icontains]"] =
      search.value;
    params["filter[_or][2][assignedTo][assignedUser][last_name][_icontains]"] =
      search.value;
  }

  if (sortBy.value.length > 0) {
    const sortParam = sortBy.value
      .map((sortItem) => {
        const direction = sortItem.order === "desc" ? "-" : "";
        return `${direction}${sortItem.key}`;
      })
      .join(",");
    params["sort"] = sortParam;
  } else {
    params["sort"] = "-date_created";
  }

  return params;
};

const logSelectedItems = (selectedItems) => {
  const itemsWithIds = selectedItems.map((item) => {
    if (typeof item === "number" || typeof item === "string") {
      return items.value.find((i) => i.id == item);
    }
    return item;
  });
};

const deleteSelectedItems = () => {
  if (selected.value.length === 0) return;
  const idsToDelete = selected.value.map((item) => {
    if (typeof item === "object" && item !== null) {
      return item.id;
    }
    return item;
  });
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (selected.value.length === 0) return;

  deleting.value = true;
  try {
    const ids = selected.value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return item.id;
        }
        return item;
      })
      .filter((id) => id !== undefined);

    if (ids.length === 0) {
      throw new Error("No valid IDs found for deletion");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/faceId`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message ||
          `HTTP error! Status: ${response.status}`
      );
    }
    showSnackbar(
      `${ids.length} records deleted successfully`,
      "success",
      "mdi-check-circle"
    );

    selected.value = [];
    await fetchMobileFaceData();
  } catch (error) {
    console.error("Error deleting records:", error);
    showSnackbar(
      error.message || "Failed to delete records",
      "error",
      "mdi-alert-circle"
    );
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
  }
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchMobileFaceData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchMobileFaceData();
};

const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchMobileFaceData();
}, 300);

watch(
  [search, sortBy],
  () => {
    page.value = 1;
    fetchMobileFaceData();
  },
  { deep: true }
);

onMounted(() => {
  fetchMobileFaceData();
});
</script>

<style scoped>
.mobile-face-embedding-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-radius: 4px;
}

.left-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.search-field {
  width: 300px;
  max-width: 300px;
}

.actions-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-info-compact {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.employee-name-small {
  font-weight: 600;
  color: #1976d2;
  font-size: 0.875rem;
}

.employee-id-small {
  font-size: 0.75rem;
  color: #666;
}

.data-compact {
  font-family: monospace;
  font-size: 0.75rem;
}

.null-value-small {
  color: #999;
  font-style: italic;
  font-size: 0.75rem;
}

:deep(.v-data-table tbody td) {
  padding: 8px 12px !important;
  height: 48px;
}

:deep(.v-data-table thead th) {
  padding: 8px 12px !important;
  font-size: 0.875rem;
}

:deep(.v-data-table) {
  background: white;
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

.delete-btn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.face-embedding-data {
  font-family: monospace;
  font-size: 0.875rem;
}

.compact-date {
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
