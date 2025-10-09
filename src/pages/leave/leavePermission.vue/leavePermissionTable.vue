<template>
  <div class="employee-container">
    <div class="main-content" :class="{ 'with-filter': showFilters }">
      <!-- New Tab Navigation -->
      <div class="d-flex align-center py-2 px-4">
        <div class="left-tabs">
          <button
            @click="switchTab('activity')"
            :class="{ active: activeLeftTab === 'activity' }"
          >
            <i class="fas fa-clock"></i>
            Recent Activity
          </button>
          <button
            @click="switchTab('history')"
            :class="{ active: activeLeftTab === 'history' }"
          >
            <i class="fas fa-history"></i>
            History
          </button>
        </div>
        <v-spacer></v-spacer>
      </div>

      <div v-if="tabLoading" class="d-flex justify-center align-center py-2">
        <v-progress-linear indeterminate color="black"></v-progress-linear>
      </div>

      <!-- Table Container with specific class for width/height issues -->
      <div class="table-container-large">
        <DataTable
          :items="items"
          :columns="columns"
          :sort-by="sortBy[0]?.key || ''"
          :sort-direction="sortBy[0]?.order || 'asc'"
          :selected-items="selected"
          show-selection
          :row-clickable="false"
          item-key="id"
          @update:selected-items="selected = $event"
          @update:sort-by="handleSortByUpdate"
          @update:sort-direction="handleSortDirectionUpdate"
          @sort="handleSort"
        >
          <!-- Custom cell for employee name -->
          <template #cell-employeeName="{ item }">
            {{ item.requestedBy?.assignedUser?.first_name || "N/A" }}
          </template>

          <!-- Custom cell for date_created -->
          <template #cell-date_created="{ item }">
            {{ formatDate(item.date_created) }}
          </template>

          <!-- Custom cell for status -->
          <template #cell-status="{ item }">
            <div class="d-flex align-center">
              <span
                v-if="item.status !== 'pending'"
                :class="getStatusClass(item.status)"
                class="status-chip compact"
              >
                <v-icon
                  size="small"
                  class="me-1"
                  :color="getIconColor(item.status)"
                >
                  {{ getStatusIcon(item.status) }}
                </v-icon>
                {{ formatStatus(item.status) }}
              </span>
              <div v-else class="d-flex align-center">
                <span class="status-chip status-requested compact">
                  <v-icon size="small" class="me-1" color="amber-darken-3">
                    mdi-clock-outline
                  </v-icon>
                  Requested
                </span>
                <div class="d-flex ms-2">
                  <v-btn
                    size="x-small"
                    color="success"
                    class="me-2 status-btn compact"
                    @click.stop="updateStatus(item.id, 'approved')"
                  >
                    <v-icon size="x-small" start>mdi-check</v-icon>
                    Accept
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="error"
                    class="status-btn compact"
                    @click.stop="updateStatus(item.id, 'declined')"
                  >
                    <v-icon size="x-small" start>mdi-close</v-icon>
                    Reject
                  </v-btn>
                </div>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <template #empty-state>
            <div class="empty-content">
              <div class="empty-icon">📋</div>
              <h3>No leave requests found</h3>
              <p>There are no leave requests to display.</p>
            </div>
          </template>
        </DataTable>
      </div>

      <CustomPagination
        v-model:page="page"
        v-model:itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { authService } from "@/services/authService";
import DataTable from "@/components/common/table/DataTable.vue";

const emit = defineEmits(["showEditPage"]);

const selected = ref([]);
const items = ref([]);
const loading = ref(false);
const search = ref("");
const showFilters = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const activeLeftTab = ref("activity");
const tabLoading = ref(false);
const attendanceConflicts = ref({});
const sortBy = ref([]); // Keep as array to match v-data-table behavior

// Define columns for DataTable - FIXED: Use simple key and custom template
const columns = ref([
  {
    key: "employeeName", // Changed to simple key
    label: "Employee Name",
    width: "150px",
  },
  { key: "date_created", label: "Applied On", width: "150px" },
  { key: "leaveType", label: "Leave Type", width: "120px" },
  { key: "fromDate", label: "Leave From", width: "120px" },
  { key: "toDate", label: "Leave To", width: "120px" },
  { key: "reason", label: "Reason", width: "200px" },
  { key: "status", label: "Status", width: "250px" },
]);

// ALTERNATIVE SOLUTION: Transform data to flatten nested properties
const processItems = (rawItems) => {
  return rawItems.map((item) => ({
    ...item,
    employeeName: item.requestedBy?.assignedUser?.first_name || "N/A",
  }));
};

// Formatting and status handling functions (unchanged)
const formatDate = (date) => {
  if (!date) return "";
  const newDate = new Date(date);
  return newDate.toISOString().split("T")[0];
};

const getStatusIcon = (status) => {
  const iconMap = {
    pending: "mdi-clock-outline",
    approved: "mdi-check-circle",
    declined: "mdi-close-circle",
    accept: "mdi-check-circle",
    reject: "mdi-circle-outline",
  };
  return iconMap[status] || "mdi-help-circle";
};

const getIconColor = (status) => {
  const colorMap = {
    pending: "amber-darken-3",
    approved: "green-darken-2",
    declined: "red-darken-2",
    accept: "mdi-check-circle",
    reject: "mdi-circle-outline",
  };
  return colorMap[status] || "grey";
};

const formatStatus = (status) => {
  const statusMap = {
    pending: "Requested",
    approved: "Approved",
    declined: "Rejected",
    accept: "mdi-check-circle",
    reject: "mdi-circle-outline",
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const statusClassMap = {
    pending: "status-requested",
    approved: "status-approved",
    declined: "status-rejected",
    accept: "mdi-check-circle",
    reject: "mdi-circle-outline",
  };
  return statusClassMap[status] || "";
};

// Handle sort events from DataTable
const handleSortByUpdate = (newSortBy) => {
  sortBy.value = newSortBy
    ? [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }]
    : [];
};

const handleSortDirectionUpdate = (newSortDirection) => {
  if (sortBy.value.length > 0) {
    sortBy.value = [{ key: sortBy.value[0].key, order: newSortDirection }];
  }
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchData();
};

// Rest of your existing methods (unchanged)
const switchTab = async (tab) => {
  if (activeLeftTab.value === tab || tabLoading.value) return;

  tabLoading.value = true;
  activeLeftTab.value = tab;

  try {
    await fetchData();
  } finally {
    setTimeout(() => {
      tabLoading.value = false;
    }, 500);
  }
};

const checkAttendanceConflicts = async () => {
  try {
    const token = getToken();
    const conflictsMap = {};
    for (const item of items.value) {
      const fromDate = new Date(item.fromDate);
      const today = new Date();

      if (
        fromDate < today &&
        (item.status === "pending" || item.status === "approved")
      ) {
        const params = new URLSearchParams({
          "filter[_and][0][date][_between][0]": item.fromDate,
          "filter[_and][0][date][_between][1]": item.fromDate,
          "filter[_and][1][employeeId][_eq]": item.requestedBy,
          "filter[_and][2][attendance][_eq]": "present",
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to check attendance conflicts");
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          conflictsMap[item.id] = data.data;
        }
      }
    }

    attendanceConflicts.value = conflictsMap;
  } catch (error) {
    console.error("Error checking attendance conflicts:", error);
  }
};

const calculateDays = (fromDate, toDate, isHalfDay) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isHalfDay ? diffDays * 0.5 : diffDays;
};

const updateStatus = async (id, newStatus) => {
  const hasConflict = hasAttendanceConflict(id);
  if (hasConflict && newStatus === "approved") {
    console.error("Attendance conflict exists for this leave request");
    return;
  }
  try {
    const token = getToken();

    const leaveRequestResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!leaveRequestResponse.ok) {
      throw new Error("Failed to fetch leave request details");
    }

    const leaveRequestData = await leaveRequestResponse.json();
    const { requestedBy, leaveType, fromDate, toDate, halfDay } =
      leaveRequestData.data;

    if (newStatus === "declined") {
      const numberOfDays = calculateDays(fromDate, toDate, halfDay);

      const personalModuleResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=leaves.id&fields[]=leaves.leaveBalance&fields[]=leaves.leaveTaken&fields[]=id&filter[_and][0][id][_eq]=${requestedBy}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!personalModuleResponse.ok) {
        throw new Error(`HTTP error! Status: ${personalModuleResponse.status}`);
      }

      const personalModuleData = await personalModuleResponse.json();
      const personalModuleInfo = personalModuleData.data?.[0];

      if (!personalModuleInfo || !personalModuleInfo.leaves) {
        throw new Error("Personal module or leave data not found");
      }

      const personalLeaveData = personalModuleInfo.leaves;
      const normalizedLeaveType = leaveType.toLowerCase().replace(/\s+/g, "");
      const balanceKey = normalizedLeaveType;
      const takenKey = `t${normalizedLeaveType}`;

      const updatedLeaveTaken = { ...personalLeaveData.leaveTaken };
      updatedLeaveTaken[takenKey] = Math.max(
        0,
        (updatedLeaveTaken[takenKey] || 0) - numberOfDays,
      );

      const updatedLeaveBalance = { ...personalLeaveData.leaveBalance };
      updatedLeaveBalance[balanceKey] =
        (updatedLeaveBalance[balanceKey] || 0) + numberOfDays;

      const updateResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/leave/${personalLeaveData.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leaveTaken: updatedLeaveTaken,
            // leaveBalance: updatedLeaveBalance,
          }),
        },
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update leave balance and taken data");
      }
    }

    if (newStatus === "approved") {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const dateArray = [];

      let currentDate = new Date(start);
      while (currentDate <= end) {
        dateArray.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const attendancePayload = dateArray.map((date) => {
        return {
          date: date.toISOString().split("T")[0],
          attendance: leaveType === "unpaid" ? "unPaidLeave" : "paidLeave",
          employeeId: requestedBy,
          tenant: tenantId,
          leaveType: leaveType,
        };
      });

      try {
        const attendanceResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(attendancePayload),
          },
        );

        if (!attendanceResponse.ok) {
          console.error("Failed to update attendance records");
        }
      } catch (error) {
        console.error("Error updating attendance records:", error);
      }
    }

    const statusResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      },
    );

    if (!statusResponse.ok) {
      throw new Error(`Failed to ${newStatus} request`);
    }

    items.value = items.value.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );
  } catch (error) {
    console.error("Error updating status:", error);
    showError.value = true;
    errorMessage.value = `Failed to ${newStatus} request and update leave data.`;
  }
};

const cancelRequest = async (id) => {
  try {
    const token = getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Failed to cancel request");

    items.value = items.value.filter((item) => item.id !== id);
  } catch (error) {
    console.error("Error cancelling request:", error);
  }
};

const getToken = () => {
  return localStorage.getItem("userToken");
};

const fetchReportingUsers = async () => {
  try {
    const token = getToken();
    if (!token || !userId) {
      console.warn("No token or userId, returning empty reporting users.");
      return [];
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?fields[]=id,assignedUser.first_name,approver&filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Personal Module Data:", data.data);

    const reportingUsers = data.data.filter(
      (item) => item.approver && item.approver === userId,
    );

    const reportingUserIds = reportingUsers.map((item) => item.id);
    console.log("Filtered Reporting User IDs:", reportingUserIds);
    return reportingUserIds;
  } catch (error) {
    console.error("Error fetching reporting users:", error);
    return [];
  }
};

const aggregateCount = async () => {
  try {
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const reportingUserIds = await fetchReportingUsers();
    console.log("Aggregate Count Reporting User IDs:", reportingUserIds);

    const params = {
      "aggregate[count]": "id",
      ...filterParams(),
    };

    if (reportingUserIds.length > 0) {
      params["filter[requestedBy][id][_in]"] = reportingUserIds.join(",");
    } else {
      console.warn("No reporting users for count, using tenant filter.");
      params["filter[tenant][tenantId][_eq]"] = tenantId;
    }

    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    console.log("Count Query String:", queryString);

    const countResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?${queryString}&limit=-1`,
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
    console.log("Count Data:", countData);
    totalItems.value = countData?.data?.[0]?.count?.id || 0;
  } catch (error) {
    console.error("Error fetching aggregate count:", error);
    totalItems.value = 0;
  }
};

const fetchData = async () => {
  await aggregateCount();

  if (!token) {
    showError.value = true;
    errorMessage.value = "Authentication required. Please login again.";
    return;
  }

  loading.value = true;
  try {
    const reportingUserIds = await fetchReportingUsers();
    console.log("Reporting User IDs:", reportingUserIds);

    const params = {
      fields: [
        "id",
        "requestedBy.assignedUser.first_name",
        "requestedBy.id",
        "requestedBy.assignedUser.role.name",
        "requestedBy",
        "leaveType",
        "date_created",
        "fromDate",
        "toDate",
        "reason",
        "status",
        "tenant.tenantId",
        "tenant.tenantName",
      ],
      ...filterParams(),
      limit: itemsPerPage.value,
      page: page.value,
    };

    params["filter[tenant][tenantId][_eq]"] = tenantId;

    const queryString = Object.keys(params)
      .map((key) => {
        if (key === "fields") {
          return params[key].map((field) => `fields[]=${field}`).join("&");
        }
        return `${key}=${params[key]}`;
      })
      .join("&");
    console.log("Fetch Query String:", queryString);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveRequest?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched Data:", data.data);

    // OPTION 1: Use the data as-is and rely on custom template
    items.value = Array.isArray(data.data) ? data.data : [];

    // OPTION 2: Process items to flatten nested properties
    // items.value = Array.isArray(data.data) ? processItems(data.data) : [];

    // await checkAttendanceConflicts();
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    showError.value = true;
    errorMessage.value =
      error.message || "Failed to fetch leave requests. Please try again.";
    items.value = [];
  } finally {
    loading.value = false;
  }
};

const filterParams = () => {
  const params = {};

  if (activeLeftTab.value === "activity") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split("T")[0];
    params["filter[date_created][_gte]"] = formattedDate;
  }

  if (activeLeftTab.value === "history") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedDate = thirtyDaysAgo.toISOString().split("T")[0];
    params["filter[date_created][_gte]"] = formattedDate;
    params["filter[_or][0][status][_eq]"] = "approved";
    params["filter[_or][1][status][_eq]"] = "declined";
  }

  if (userRole !== "Admin" && userRole !== "Dealer") {
    params["filter[requestedBy][approver][id][_eq]"] = userId;
  }

  if (search.value) {
    params["filter[requestedBy][assignedUser][first_name][_icontains]"] =
      search.value;
  }

  // Add sorting parameters from sortBy
  if (sortBy.value.length > 0) {
    const sortParam = sortBy.value
      .map((sortItem) => {
        const direction = sortItem.order === "desc" ? "-" : "";
        // Handle sorting for employee name
        const sortKey =
          sortItem.key === "employeeName"
            ? "requestedBy.assignedUser.first_name"
            : sortItem.key;
        return `${direction}${sortKey}`;
      })
      .join(",");
    params["sort"] = sortParam;
  }

  return params;
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchData();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchData();
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const clearFilters = () => {
  filters.value = {
    status: [],
    leaveType: [],
    dateFrom: "",
    dateTo: "",
  };
};

const applyFilters = () => {
  console.log("Applying filters", filters.value);
  fetchData();
};

const hasAttendanceConflict = (leaveId) => {
  return (
    attendanceConflicts.value[leaveId] &&
    attendanceConflicts.value[leaveId].length > 0
  );
};

watch(
  [search, sortBy],
  async () => {
    page.value = 1;
    await fetchData();
  },
  { deep: true },
);

onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
/* Existing styles */
.employee-container {
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow: auto;
  transition: margin-right 0.3s ease;
}

.search-field {
  max-width: 300px;
}

/* NEW: Specific table container class for width/height issues */
.table-container-large {
  width: 100%;

  max-height: calc(90vh - 100px);
  overflow: auto;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

/* Adjust column widths for better spacing */
.table-container-large :deep(.table-body > div > div) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status column specific adjustments */

/* DataTable styles */
.data-table {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-scroll-container {
  overflow: auto;
  position: relative;
}

.table-body {
  min-height: 0;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.empty-content p {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.table-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
}

.table-body {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.table-body > div {
  display: table-row;
}

.table-body > div > div {
  display: table-cell;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .table-container-large {
    max-height: calc(100vh - 180px);
  }

  .table-container-large :deep(.table-body) {
    min-width: 800px;
  }

  .data-table {
    font-size: 0.75rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }
}

/* Existing status and button styles */
.status-chip {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  text-transform: capitalize;
}

.status-chip.compact {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.status-requested {
  background-color: #fff8e1;
  color: #f57f17;
}

.status-approved {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-rejected {
  background-color: #ffebee;
  color: #c62828;
}

.status-btn {
  min-width: 90px !important;
  text-transform: none !important;
}

.status-btn.compact {
  min-width: 60px !important;
}

.status-btn:hover {
  opacity: 0.9;
}

.status-chip:hover {
  opacity: 0.9;
  cursor: default;
}

.left-tabs button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  background: #68ade1;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.left-tabs button.active {
  background-color: rgb(21, 66, 124);
  color: white;
}

.left-tabs {
  display: flex;
  gap: 12px;
}
</style>
