<template>
  <div class="ai-face-embedding-container">
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
        <div class="right-section">
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
        class="elevation-1 ai-face-table"
        height="calc(95vh - 240px)"
        fixed-header
        :loading="loading"
        show-select
        item-value="id"
        @update:model-value="logSelectedItems"
        v-model:sort-by="sortBy"
      >
        <template v-slot:item.assignedTo="{ item }">
          <div class="employee-info">
            <div class="employee-name">{{ getEmployeeName(item) }}</div>
            <div class="employee-id">
              {{ item.assignedTo?.employeeId || "N/A" }}
            </div>
          </div>
        </template>

        <template v-slot:item.base64Data="{ item }">
          <div class="base64-data">
            <v-chip size="small" color="info" v-if="item.base64Data">
              {{ truncateText(item.base64Data, 30) }}
            </v-chip>
            <span v-else class="null-value">No Data</span>
          </div>
        </template>

        <template v-slot:item.date_created="{ item }">
          {{ formatDate(item.date_created) }}
        </template>

        <template v-slot:item.date_updated="{ item }">
          {{ formatDate(item.date_updated) }}
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
          Are you sure you want to delete {{ selected.length }} selected AI face
          embedding record(s)? <br /><br />
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
    title: "Employee Info",
    key: "assignedTo.assignedUser.first_name",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Base64 Data",
    key: "base64Data",
    align: "start",
    sortable: false,
    width: "200px",
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
  const firstName = item.assignedTo.assignedUser.first_name || "";
  return firstName || "Unknown";
};

const truncateText = (text, maxLength = 30) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
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
      // "filter[assignedTo][assignedUser][role][name][_in]": "Employee,Manager",
      ...(search.value && {
        "filter[_or][0][assignedTo][employeeId][_icontains]": search.value,
        "filter[_or][1][assignedTo][assignedUser][first_name][_icontains]":
          search.value,
        "filter[_or][2][assignedTo][assignedUser][last_name][_icontains]":
          search.value,
      }),
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
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
  }
};

const fetchAiFaceData = async () => {
  console.log("Starting fetchAiFaceData");

  // Fetch aggregate count
  await aggregateCount();
  console.log("Aggregate count fetched, totalItems:", totalItems.value);

  // Check for token
  if (!token) {
    console.log("No token found, showing error snackbar");
    showSnackbar(
      "Authentication required. Please login again.",
      "error",
      "mdi-alert-circle"
    );
    return;
  }

  // Set loading state
  loading.value = true;
  console.log("Loading set to true");

  try {
    // Build query parameters
    const params = {
      fields: [
        "id",
        "assignedTo.id",
        "assignedTo.employeeId",
        "assignedTo.assignedUser.id",
        "assignedTo.assignedUser.first_name",
        "assignedTo.assignedUser.last_name",
        "base64Data",
        "date_created",
        "date_updated",
        "tenant.tenantId",
      ],
      ...filterParams(),
      sort: "-date_updated",
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
    console.log("Query string constructed:", queryString);

    // Make API request
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/aiFaceId?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse response data
    const result = await response.json();
    const rawData = result.data || [];
    console.log("Full rawData response:", JSON.stringify(rawData, null, 2));

    // Transform data without filtering
    items.value = rawData.map((item) => {
      const transformedItem = {
        id: item.id,
        base64Data: item.base64Data,
        date_created: item.date_created,
        date_updated: item.date_updated,
        assignedTo: item.assignedTo
          ? {
              id: item.assignedTo.id,
              employeeId: item.assignedTo.employeeId,
              assignedUser: {
                first_name: item.assignedTo.assignedUser?.first_name,
                last_name: item.assignedTo.assignedUser?.last_name,
              },
            }
          : null,
        tenant: {
          tenantId: item.tenant?.tenantId,
        },
      };
      console.log("Transformed item:", transformedItem);
      return transformedItem;
    });

    // Update totalItems
    console.log("Final transformed items:", items.value);
  } catch (error) {
    console.error("Error fetching AI face data:", error);
    showSnackbar(
      error.message || "Failed to fetch AI face data. Please try again.",
      "error",
      "mdi-alert-circle"
    );
  } finally {
    loading.value = false;
    console.log("Loading set to false, fetchAiFaceData complete");
  }
};

const filterParams = () => {
  const params = {};

  // Filter by tenant
  params["filter[tenant][tenantId][_eq]"] = tenantId;

  // Search filter
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
  }

  return params;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchAiFaceData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchAiFaceData();
};

const logSelectedItems = (selectedItems) => {
  const itemsWithIds = selectedItems.map((item) => {
    if (typeof item === "number" || typeof item === "string") {
      return items.value.find((i) => i.id == item);
    }
    return item;
  });
};

// Your existing methods remain the same until deleteSelectedItems
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

    // Step 1: For each aiFaceId, find and update the personalModule record
    for (const aiFaceId of ids) {
      try {
        // Find personalModule record with this assignedFaceEmbed
        const personalModuleResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][assignedFaceEmbed][_eq]=${aiFaceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (personalModuleResponse.ok) {
          const personalModuleData = await personalModuleResponse.json();

          // If personalModule record found, update it to remove the relationship
          if (personalModuleData.data && personalModuleData.data.length > 0) {
            const personalModuleId = personalModuleData.data[0].id;

            // Update personalModule to remove assignedFaceEmbed relationship
            const updateResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/items/personalModule/${personalModuleId}`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  assignedFaceEmbed: null,
                }),
              }
            );

            if (!updateResponse.ok) {
              console.warn(
                `Failed to update personalModule ${personalModuleId} for aiFaceId ${aiFaceId}`
              );
            }
          }
        }
      } catch (error) {
        console.warn(
          `Error updating personalModule for aiFaceId ${aiFaceId}:`,
          error
        );
        // Continue with other deletions even if one fails
      }
    }

    // Step 2: Delete from aiFaceId collection
    const deleteResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/aiFaceId`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      }
    );

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(
        errorData.errors?.[0]?.message ||
          `HTTP error! Status: ${deleteResponse.status}`
      );
    }

    showSnackbar(
      `Successfully deleted ${ids.length} AI face embedding(s)`,
      "success",
      "mdi-check-circle"
    );

    // Refresh the data
    await fetchAiFaceData();
    selected.value = [];
  } catch (error) {
    console.error("Error deleting AI face data:", error);
    showSnackbar(
      error.message || "Failed to delete AI face data. Please try again.",
      "error",
      "mdi-alert-circle"
    );
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
  }
};

const debouncedSearch = debounce(() => {
  page.value = 1;
  fetchAiFaceData();
}, 300);

watch(search, () => {
  debouncedSearch();
});
watch(
  [search, sortBy], // Add sortBy to watched properties
  async () => {
    await fetchAiFaceData();
  },
  { deep: true }
);

// Lifecycle hooks
onMounted(async () => {
  await fetchAiFaceData();
});
</script>

<style scoped>
.ai-face-embedding-container {
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

.right-section {
  display: flex;
  align-items: center;
}

.search-field {
  width: 300px;
  max-width: 300px;
}

.delete-btn {
  animation: fadeIn 0.3s ease-in-out;
  margin-right: 16px;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 600;
  color: #1976d2;
}

.employee-id {
  font-size: 0.875rem;
  color: #666;
}

.base64-data {
  font-family: monospace;
  font-size: 0.875rem;
}

.null-value {
  color: #999;
  font-style: italic;
}

.ai-face-table {
  margin-top: 16px;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
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

:deep(.v-data-table tbody td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 16px;
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

:deep(.v-data-table tbody tr) {
  cursor: default;
}

:deep(.v-data-table tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
