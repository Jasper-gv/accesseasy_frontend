<template>
  <div class="salary-container">
    <!-- Filter Panel -->
    <div class="filter-panel" v-if="showFilters">
      <div class="filter-content">
        <FilterComponent
          :tenantId="tenantId"
          :initialFilters="initialFilters"
          :initiallyVisible="true"
          :filter-schema="pageFilters"
          @apply-filters="handleApplyFilters"
          @filter-visibility-changed="onFilterVisibilityChanged"
        />
      </div>
    </div>

    <!-- Filter Toggle Button -->
    <button
      class="filter-toggle-static"
      @click="toggleFilters"
      :class="{ active: hasActiveFilters }"
      :title="showFilters ? 'Hide filters' : 'Show filters'"
      aria-label="Toggle filters"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
      </svg>
      <div v-if="hasActiveFilters" class="filter-indicator"></div>
    </button>

    <div class="main-content" :class="{ 'full-width': !showFilters }">
      <DataTableWrapper
        v-model:searchQuery="search"
        :showSearch="true"
        :searchPlaceholder="'Search Employee'"
        :isEmpty="filteredItems.length === 0 && !search"
        :hasError="error"
        @update:searchQuery="debouncedSearch"
      >
        <div v-if="loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="items.length || 10"
            :columns="columns.length"
          />
        </div>

        <div v-else-if="error">
          <ErrorState
            title="Unable to load salary details"
            :message="error"
            @retry="fetchSalaryDetails"
          />
        </div>

        <div v-else-if="filteredItems.length === 0">
          <EmptyState
            title="No Salary Details found"
            message="Try adjusting your filters or search term"
            :primaryAction="{ text: 'Clear Filters', icon: 'X' }"
            @primaryAction="clearFilters"
          />
        </div>

        <div v-else>
          <DataTable
            :items="filteredItems"
            :columns="columns"
            :selectedItems="selected"
            :showSelection="true"
            :sortBy="sortBy[0]?.key || ''"
            :sortDirection="sortBy[0]?.order || 'asc'"
            :itemKey="'id'"
            :rowClickable="true"
            @update:selectedItems="selected = $event"
            @update:sortBy="updateSortBy"
            @update:sortDirection="updateSortDirection"
            @rowClick="handleRowClick"
            @sort="handleSort"
          >
            <!-- Checkbox Column -->
            <template #cell-checkbox="{ item }">
              <input
                type="checkbox"
                class="custom-checkbox"
                :checked="selected.includes(item.id)"
                :disabled="isEmployeeLeft(item)"
                @change="toggleItemSelection(item.id)"
              />
            </template>

            <!-- Profile Column -->
            <template #cell-profile="{ item }">
              <div class="profile-avatar">
                <img
                  v-if="item.avatarImage"
                  :src="item.avatarImage"
                  :alt="item.employee?.assignedUser?.first_name"
                  class="avatar-image"
                  :class="{ grayscale: isEmployeeLeft(item) }"
                />
                <div v-else class="avatar-placeholder">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </template>

            <!-- Employee Name Column -->
            <template #cell-name="{ item }">
              <div class="employee-info">
                <h3 class="employee-name">
                  {{ item.employee?.assignedUser?.first_name || "N/A" }}
                  <span
                    v-if="isEmployeeLeft(item)"
                    class="status-badge status-inactive ml-2"
                  >
                    LEFT
                  </span>
                </h3>
              </div>
            </template>

            <!-- Employee ID Column -->
            <template #cell-employeeId="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ item.employee?.employeeId || "-" }}
              </span>
            </template>

            <!-- Role Column -->
            <template #cell-role="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ item.employee?.assignedUser?.role?.name || "N/A" }}
              </span>
            </template>

            <!-- Annual CTC Column -->
            <template #cell-ctc="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.ctc) }}
              </span>
            </template>

            <!-- Basic Salary Column -->
            <template #cell-basicSalary="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.basicSalary) }}
              </span>
            </template>

            <!-- Total Earnings Column -->
            <template #cell-totalEarnings="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.totalEarnings) }}
              </span>
            </template>

            <!-- Total Deductions Column -->
            <template #cell-totalDeductions="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.totalDeductions) }}
              </span>
            </template>

            <!-- PF Column -->
            <template #cell-pf="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.employeeDeduction?.pf || 0) }}
              </span>
            </template>

            <!-- Bonus Column -->
            <template #cell-bonus="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.earnings?.bonus || 0) }}
              </span>
            </template>

            <!-- Professional Tax Column -->
            <template #cell-professionalTax="{ item }">
              <button
                class="status-badge"
                :class="{ 'status-inactive': isEmployeeLeft(item) }"
                :disabled="isEmployeeLeft(item)"
                @click.stop="showPTDetails(item)"
              >
                {{ formatCurrency(item.professionalTax) }}
              </button>
            </template>

            <!-- Employer PF Column -->
            <template #cell-employerpf="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.employersContribution?.pf || 0) }}
              </span>
            </template>

            <!-- Employer ESI Column -->
            <template #cell-employeresi="{ item }">
              <span :class="{ 'text-muted': isEmployeeLeft(item) }">
                {{ formatCurrency(item.employersContribution?.esi || 0) }}
              </span>
            </template>

            <!-- Date of Leaving Column -->
            <template #cell-dateOfLeaving="{ item }">
              <span :class="{ 'text-red': isEmployeeLeft(item) }">
                {{ item.employee?.assignedUser?.dateOfLeaving || "-" }}
              </span>
            </template>
          </DataTable>
        </div>

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="page"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>

      <!-- LWF and PT Dialogs -->
      <v-dialog v-model="lwfDialog.show" max-width="500">
        <v-card>
          <v-card-title class="dialog-title">
            Labor Welfare Fund Details
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="lwfDialog.show = false"
              class="close-btn"
            ></v-btn>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list>
              <v-list-item>
                <v-list-item-title
                  class="text-subtitle-1 font-weight-medium mb-2"
                >
                  State
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-1">
                  {{ lwfDialog.data?.state || "N/A" }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-4"></v-divider>
              <v-list-item>
                <v-list-item-title
                  class="text-subtitle-1 font-weight-medium mb-3"
                >
                  State Tax Rules
                </v-list-item-title>
                <div
                  v-if="lwfDialog.data?.stateTaxRules"
                  class="tax-rules-container"
                >
                  <v-card
                    v-for="(rule, index) in parseTaxRules(
                      lwfDialog.data.stateTaxRules,
                    )"
                    :key="index"
                    variant="outlined"
                    class="mb-2 tax-rule-card"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex justify-space-between">
                        <div>
                          <div class="text-caption text-grey">Salary Range</div>
                          <div class="text-body-1">₹{{ rule.salaryRange }}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-caption text-grey">Tax Amount</div>
                          <div class="text-body-1 font-weight-medium">
                            ₹{{ rule.tax }}
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
                <div v-else class="text-body-1 text-grey">
                  No tax rules available
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="ptDialog.show" max-width="500">
        <v-card>
          <v-card-title class="dialog-title">
            Professional Tax Details
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="ptDialog.show = false"
              class="close-btn"
            ></v-btn>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list>
              <v-list-item>
                <v-list-item-title
                  class="text-subtitle-1 font-weight-medium mb-2"
                >
                  State
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-1">
                  {{ ptDialog.data?.state || "N/A" }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider class="my-4"></v-divider>
              <v-list-item>
                <v-list-item-title
                  class="text-subtitle-1 font-weight-medium mb-3"
                >
                  State Tax Rules
                </v-list-item-title>
                <div
                  v-if="ptDialog.data?.stateTaxRules"
                  class="tax-rules-container"
                >
                  <v-card
                    v-for="(rule, index) in parseTaxRules(
                      ptDialog.data.stateTaxRules,
                    )"
                    :key="index"
                    variant="outlined"
                    class="mb-2 tax-rule-card"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex justify-space-between">
                        <div>
                          <div class="text-caption text-grey">Salary Range</div>
                          <div class="text-body-1">₹{{ rule.salaryRange }}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-caption text-grey">
                            Professional Tax
                          </div>
                          <div class="text-body-1 font-weight-medium">
                            ₹{{ rule.professionalTax }}
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
                <div v-else class="text-body-1 text-grey">
                  No tax rules available
                </div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Salary Form -->
      <SalaryForm
        v-if="showForm"
        :is-editing="isEditing"
        :employee-data="editedItem"
        :tenant-id="tenantId"
        :first-name="editedItem.employee?.assignedUser?.first_name"
        @save-success="handleSaveSuccess"
        @cancel="showForm = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import debounce from "lodash/debounce";
import SalaryForm from "./salaryForm.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import FilterComponent from "@/components/common/filters/payrollfilter.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { useRouter } from "vue-router";

// State
const loading = ref(false);
const error = ref(null);
const showFilters = ref(true);
const search = ref("");
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref([]);
const items = ref([]);
const selected = ref([]);
const tenantId = currentUserTenant.getTenantId();
const userRole = currentUserTenant.getRole();
const userId = currentUserTenant.getUserId();

// Dialog states
const lwfDialog = reactive({ show: false, data: null });
const ptDialog = reactive({ show: false, data: null });

// Filters
const filters = reactive({
  organization: "",
  branch: "",
  department: "",
  basicPayFrom: "",
  basicPayTo: "",
  employeeStatus: [],
});

// Filter schema for FilterComponent
const pageFilters = [
  { key: "organization", label: "Organization", type: "select", show: true },
  { key: "branch", label: "Branch", type: "select", show: true },
  { key: "department", label: "Department", type: "select", show: true },
];

// Computed Properties
const columns = computed(() => [
  { key: "profile", label: "Profile", sortable: false, width: "60px" },
  { key: "name", label: "Employee Name", sortable: false, width: "150px" },
  { key: "employeeId", label: "Employee ID", sortable: false, width: "120px" },
  { key: "role", label: "Role", sortable: false, width: "120px" },
  { key: "ctc", label: "Annual CTC", sortable: false, width: "150px" },
  {
    key: "basicSalary",
    label: "Basic Salary",
    sortable: false,
    width: "150px",
  },
  {
    key: "totalEarnings",
    label: "Total Earnings",
    sortable: false,
    width: "150px",
  },
  {
    key: "totalDeductions",
    label: "Total Deductions",
    sortable: false,
    width: "200px",
  },
  { key: "pf", label: "PF", sortable: false, width: "120px" },
  { key: "bonus", label: "Bonus", sortable: false, width: "120px" },
  {
    key: "professionalTax",
    label: "Professional Tax",
    sortable: false,
    width: "150px",
  },
  { key: "employerpf", label: "Employer PF", sortable: false, width: "120px" },
  {
    key: "employeresi",
    label: "Employer ESI",
    sortable: false,
    width: "120px",
  },
  {
    key: "dateOfLeaving",
    label: "Date of Leaving",
    sortable: false,
    width: "120px",
  },
]);

const initialFilters = computed(() => ({
  organization: filters.organization,
  branch: filters.branch,
  department: filters.department,
  employeeStatus: filters.employeeStatus,
  basicPayFrom: filters.basicPayFrom,
  basicPayTo: filters.basicPayTo,
}));

const hasActiveFilters = computed(() => {
  return (
    filters.organization.length > 0 ||
    filters.branch.length > 0 ||
    filters.department.length > 0 ||
    filters.basicPayFrom ||
    filters.basicPayTo ||
    filters.employeeStatus.length > 0 ||
    search.value !== ""
  );
});

const filteredItems = computed(() => {
  return items.value;
});

const router = useRouter();
const token = authService.getToken();

// Helper Functions
const isEmployeeLeft = (employee) => {
  if (!employee.employee?.assignedUser?.dateOfLeaving) {
    return false;
  }
  const today = new Date();
  const leavingDate = new Date(employee.employee.assignedUser.dateOfLeaving);
  today.setHours(0, 0, 0, 0);
  leavingDate.setHours(0, 0, 0, 0);
  return leavingDate <= today;
};

const formatCurrency = (value) => {
  return value ? `₹${Number(value).toLocaleString()}` : "₹0";
};

const fetchAuthorizedImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to load image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error loading profile image:", error);
    return null;
  }
};

const parseTaxRules = (rules) => {
  if (typeof rules === "string") {
    try {
      return JSON.parse(rules);
    } catch (e) {
      console.error("Error parsing tax rules:", e);
      return [];
    }
  }
  return Array.isArray(rules) ? rules : [];
};

// API Logic
const fetchSalaryDetails = async (
  currentPage = page.value,
  currentItemsPerPage = itemsPerPage.value,
  searchTerm = search.value,
) => {
  try {
    loading.value = true;
    error.value = null;

    const params = {
      fields: [
        "id",
        "ctc",
        "employee.id",
        "employee.employeeId",
        "employee.assignedUser.id",
        "employee.assignedUser.avatar.id",
        "employee.assignedUser.avatar.type",
        "employee.assignedUser.avatar.title",
        "employee.assignedBranch.branch_id.id",
        "employee.assignedUser.first_name",
        "employee.assignedUser.role.name",
        "employee.assignedUser.dateOfLeaving",
        "employee.assignedDepartment.department_id.departmentName",
        "employee.assignedBranch.branch_id.branchName",
        "basicSalary",
        "totalEarnings",
        "totalDeductions",
        "professionalTax",
        "employeeDeduction",
        "employersContribution",
        "deduction",
        "earnings",
        "status",
        "salaryConfig.LWF",
        "salaryConfig.professionalTax",
      ],
      limit: currentItemsPerPage,
      page: currentPage,
    };

    let filterParams = [];
    if (userRole === "Admin" || userRole === "Dealer") {
      filterParams.push(`filter[tenant][tenantId][_eq]=${tenantId}`);
    } else if (userRole === "Manager") {
      filterParams.push(`filter[tenant][tenantId][_eq]=${tenantId}`);
      filterParams.push(`filter[assignedUser][role][name][_eq]=Employee`);
    } else if (userRole === "Employee") {
      filterParams.push(`filter[employee][assignedUser][id][_eq]=${userId}`);
    }

    if (searchTerm) {
      filterParams.push(
        `filter[_or][0][employee][assignedUser][first_name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][1][employee][assignedUser][role][name][_icontains]=${searchTerm}`,
      );
      filterParams.push(
        `filter[_or][2][employee][employeeId][_eq]=${searchTerm}`,
      );
    }
    if (filters.organization) {
      filterParams.push(
        `filter[employee][assignedUser][organization][id][_eq]=${filters.organization}`,
      );
    }

    if (filters.branch.length) {
      filterParams.push(
        `filter[employee][branchLocation][id][_eq]=${filters.branch}`,
      );
    }
    if (filters.department.length) {
      filterParams.push(
        `filter[employee][department][_eq]=${filters.department}`,
      );
    }
    if (filters.basicPayFrom) {
      filterParams.push(`filter[basicSalary][_gte]=${filters.basicPayFrom}`);
    }
    if (filters.basicPayTo) {
      filterParams.push(`filter[basicSalary][_lte]=${filters.basicPayTo}`);
    }
    if (filters.employeeStatus.length) {
      if (
        filters.employeeStatus.includes("Active") &&
        !filters.employeeStatus.includes("Left")
      ) {
        filterParams.push(
          `filter[employee][assignedUser][dateOfLeaving][_null]=true`,
        );
      } else if (
        filters.employeeStatus.includes("Left") &&
        !filters.employeeStatus.includes("Active")
      ) {
        filterParams.push(
          `filter[employee][assignedUser][dateOfLeaving][_nnull]=true`,
        );
      }
    }

    if (sortBy.value.length > 0) {
      const sortParam = sortBy.value
        .map((sortItem) => {
          const direction = sortItem.order === "desc" ? "-" : "";
          return `${direction}${sortItem.key}`;
        })
        .join(",");
      filterParams.push(`sort=${sortParam}`);
    }

    const queryString = [
      ...params.fields.map((f) => `fields[]=${f}`),
      ...filterParams,
      `limit=${currentItemsPerPage}`,
      `page=${currentPage}`,
    ].join("&");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    items.value = await Promise.all(
      data.data.map(async (item) => {
        if (item.employee?.assignedUser?.avatar?.id) {
          const avatarUrl = `${import.meta.env.VITE_API_URL}/assets/${item.employee.assignedUser.avatar.id}`;
          item.avatarImage = await fetchAuthorizedImage(avatarUrl);
        }
        return item;
      }),
    );

    // Fetch total count
    const countUrl = `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown?${filterParams.join("&")}&aggregate[countDistinct]=id`;
    const countResponse = await fetch(countUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countData = await countResponse.json();
    totalItems.value = parseInt(countData.data[0].countDistinct.id);
  } catch (err) {
    console.error("Error fetching salary details:", err);
    error.value = err.message || "Failed to load salary details";
  } finally {
    loading.value = false;
  }
};

const fetchFilterOptions = async () => {
  try {
    const params = new URLSearchParams({
      "filter[tenant][tenantId][_eq]": tenantId,
    });

    const [branchRes, departmentRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/items/branch?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/items/department?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const [branchData, departmentData] = await Promise.all([
      branchRes.json(),
      departmentRes.json(),
    ]);

    branchOptions.value = branchData.data.map((b) => ({
      title: b.branchName,
      value: b.branchName,
    }));
    departmentOptions.value = departmentData.data.map((d) => ({
      title: d.departmentName,
      value: d.departmentName,
    }));
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
};

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const handleApplyFilters = (newFilters) => {
  Object.assign(filters, newFilters);
  page.value = 1;
  showFilters.value = true;
  fetchSalaryDetails();
};

const onFilterVisibilityChanged = (isVisible) => {
  showFilters.value = isVisible;
};

const clearFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [] : "";
  });
  search.value = "";
  selected.value = [];
  fetchSalaryDetails();
};

const toggleItemSelection = (itemId) => {
  if (selected.value.includes(itemId)) {
    selected.value = selected.value.filter((id) => id !== itemId);
  } else {
    selected.value.push(itemId);
  }
};

const updateSortBy = (newSortBy) => {
  sortBy.value = [{ key: newSortBy, order: sortBy.value[0]?.order || "asc" }];
};

const updateSortDirection = (newSortDirection) => {
  sortBy.value = [{ key: sortBy.value[0]?.key || "", order: newSortDirection }];
};

const handleSort = ({ field, direction }) => {
  sortBy.value = [{ key: field, order: direction }];
  fetchSalaryDetails();
};

const showLWFDetails = (item) => {
  if (isEmployeeLeft(item)) return;
  lwfDialog.data = item.salaryConfig?.LWF;
  lwfDialog.show = true;
};

const showPTDetails = (item) => {
  if (isEmployeeLeft(item)) return;
  ptDialog.data = item.salaryConfig?.professionalTax;
  ptDialog.show = true;
};

const handleRowClick = (item) => {
  if (isEmployeeLeft(item)) {
    console.log("Cannot navigate: Employee has left.");
    return;
  }

  let employeeId = item.employee?.id || item.id || item.employee?.employeeId;
  if (employeeId) {
    router.push(`/employee-details/employee/${employeeId}/payrollmodule`);
  } else {
    console.error("Invalid item or employee ID", item);
    alert("Unable to navigate to employee details. Employee ID not found.");
  }
};

const handleSaveSuccess = () => {
  showForm.value = false;
  fetchSalaryDetails();
};

const handlePageChange = (newPage) => {
  page.value = newPage;
  fetchSalaryDetails(newPage, itemsPerPage.value, search.value);
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  page.value = 1;
  fetchSalaryDetails(1, newItemsPerPage, search.value);
};

const debouncedSearch = debounce(() => {
  fetchSalaryDetails(1, itemsPerPage.value, search.value);
}, 300);

// Lifecycle Hooks
onMounted(async () => {
  await fetchFilterOptions();
  await fetchSalaryDetails();
});

watch(
  [search, filters, sortBy],
  () => {
    debouncedSearch();
  },
  { deep: true },
);
</script>

<style scoped>
.salary-container {
  display: flex;
  height: 100vh;
  position: relative;
}

/* Filter Panel */
.filter-panel {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.filter-content {
  flex: 1;
  overflow-y: auto;
}

/* Filter Toggle Button */
.filter-toggle-static {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #374151;
}

.filter-toggle-static:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-toggle-static.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.filter-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.main-content.full-width {
  margin-left: 0;
}

/* Profile Avatar */
.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #64748b;
}

.grayscale {
  filter: grayscale(100%);
  opacity: 0.6;
}

/* Employee Info */
.employee-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.employee-name {
  font-weight: 500;
  margin: 0;
  font-size: 0.875rem;
  color: #1e293b;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-inactive {
  background: #fee2e2;
  color: #dc2626;
}

/* Checkbox */
.custom-checkbox:disabled {
  background-color: #e2e8f0;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.5;
}

/* Dialog Styles */
.dialog-title {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
  font-size: 1.25rem;
  font-weight: 500;
  position: relative;
}

.v-dialog .v-card-title .v-btn {
  position: absolute;
  right: 8px;
  top: 8px;
}

.v-list-item {
  padding: 12px 0;
}

.v-list-item-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.v-list-item-subtitle {
  color: rgba(0, 0, 0, 0.6);
}

/* Text Styles */
.text-red {
  color: #f44336 !important;
  font-weight: 600;
}

.text-muted {
  color: #757575 !important;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .salary-container {
    flex-direction: column;
  }

  .filter-panel {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    max-height: 50vh;
    position: relative;
    z-index: 100;
  }

  .filter-toggle-static {
    position: static;
    margin: 1rem;
    width: 40px;
    height: 40px;
  }

  .main-content {
    margin-left: 0 !important;
  }
}
</style>
