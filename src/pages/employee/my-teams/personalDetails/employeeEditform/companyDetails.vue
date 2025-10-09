<template>
  <div class="company-details">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="scroll-container" v-else-if="localEmployeeData">
      <div class="d-flex justify-space-between align-center mb-4">
        <h3>Company Details</h3>
        <BaseButton
          variant="primary"
          :disabled="!hasChanges"
          :title="!hasChanges ? 'No changes to save' : 'Save changes'"
          :loading="isUpdating"
          @click="updateCompanyDetails"
        >
          Update
        </BaseButton>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedOrganization"
            :items="organizationOptions"
            item-title="orgName"
            item-value="id"
            label="Organization"
            variant="outlined"
            density="comfortable"
            @update:model-value="handleOrganizationChange"
            @blur="markFieldAsTouched('organization')"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedDepartment"
            :items="departmentOptions"
            item-title="name"
            item-value="id"
            label="Department"
            variant="outlined"
            density="comfortable"
            @update:model-value="handleDepartmentChange"
            @blur="markFieldAsTouched('department')"
          ></v-select>

          <p
            v-if="departmentOptions.length === 0 && !selectedOrganization"
            class="text-caption text-black mt-1 d-flex align-center"
          >
            <v-icon size="16" color="blue-darken-2" class="mr-1">
              mdi-information
            </v-icon>
            <strong>Note:</strong>&nbsp;Please select an organization before
            selecting the department.
          </p>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedBranchLocation"
            :items="locationOptions"
            item-title="name"
            item-value="id"
            label="Branch Location"
            variant="outlined"
            density="comfortable"
            @update:model-value="handleBranchLocationChange"
            @blur="markFieldAsTouched('branchLocation')"
          ></v-select>

          <p
            v-if="locationOptions.length === 0 && !selectedOrganization"
            class="text-caption text-black mt-1 d-flex align-center"
          >
            <v-icon size="16" color="blue-darken-2" class="mr-1">
              mdi-information
            </v-icon>
            <strong>Note:</strong>&nbsp;Please select an organization before
            selecting the branch location.
          </p>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.designation"
            label="Designation"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.designation')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedCycleType"
            :items="cycleTypeOptions"
            item-title="cycleName"
            item-value="cycleId"
            label="Attendance Cycle Type"
            variant="outlined"
            density="comfortable"
            @update:model-value="handleCycleTypeChange"
            @blur="markFieldAsTouched('cycleType')"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.dateOfJoining"
            label="Date of Joining"
            type="date"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.dateOfJoining')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.dateOfLeaving"
            label="Date of Leaving"
            type="date"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.dateOfLeaving')"
          ></v-text-field>
        </v-col>

        <v-select
          v-model="selectedApprover"
          :items="approverOptions"
          item-title="name"
          item-value="id"
          label="Approver"
          variant="outlined"
          density="comfortable"
          clearable
          @update:model-value="handleApproverChange"
        >
          <template v-slot:prepend-item>
            <div class="d-flex align-center">
              <v-text-field
                v-model="searchApprover"
                label="Search by name"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="flex-grow-1 mr-2"
                @input="debounceFilterApprover"
              ></v-text-field>
              <v-btn
                variant="text"
                density="compact"
                :icon="showApproverFilters ? 'mdi-chevron-up' : 'mdi-filter'"
                @click.stop="showApproverFilters = !showApproverFilters"
              ></v-btn>
            </div>
            <v-expand-transition>
              <v-card
                v-if="showApproverFilters"
                class="filter-dropdown mt-2"
                elevation="4"
              >
                <v-card-text class="pa-2">
                  <v-select
                    v-model="selectedApproverDepartmentFilter"
                    :items="[
                      { id: 'all', name: 'All Departments' },
                      ...departmentOptions,
                    ]"
                    item-title="name"
                    item-value="id"
                    label="Department"
                    density="compact"
                    variant="outlined"
                    hide-details
                    @update:modelValue="filterApprovers"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-expand-transition>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>
        <v-col cols="12">
          <h3>PF and ESI Account</h3>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.ESIAccountNumber"
            type="string"
            label="ESI Account Number"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.ESIAccountNumber')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localEmployeeData.assignedUser.PFAccountNumber"
            type="string"
            label="UAN PF AccountNumber"
            variant="outlined"
            density="comfortable"
            @input="handleInputChange('assignedUser.PFAccountNumber')"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else>
      <v-row>
        <v-col cols="12" class="text-center">
          <p>No employee data found.</p>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>

    <v-snackbar
      class="errormessge"
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { debounce } from "lodash";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData", "has-unsaved-changes"]);

const loading = ref(true);
const error = ref(null);
const departmentOptions = ref([]);
const selectedDepartment = ref(null);
const organizationOptions = ref([]);
const selectedOrganization = ref(null);
const locationOptions = ref([]);
const selectedBranchLocation = ref(null);
const originalData = ref(null);
const changedFields = ref({});
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const localEmployeeData = ref(JSON.parse(JSON.stringify(props.employeeData)));
const validationErrors = ref({});
const touchedFields = ref(new Set());
const cycleTypeOptions = ref([]);
const selectedCycleType = ref(null);
const selectedApprover = ref(null);
const approverOptions = ref([]);
const searchApprover = ref("");
const showApproverFilters = ref(false);
const selectedApproverDepartmentFilter = ref("all");
const debounceFilterApprover = debounce(filterApprovers, 300);

const showAssignOrgNote = computed(() => !selectedOrganization.value);
const assignOrgNoteMessage =
  "Before choosing the department, assign organization";

const handleManagesEmployeesChange = (newValue) => {
  const originalManagesEmployees = originalData.value.managesEmployees
    ? Array.isArray(originalData.value.managesEmployees)
      ? originalData.value.managesEmployees
      : [originalData.value.managesEmployees]
    : [];

  const newManagesEmployees = newValue || [];

  if (
    JSON.stringify(originalManagesEmployees.sort()) !==
    JSON.stringify(newManagesEmployees.sort())
  ) {
    changedFields.value.managesEmployees = newManagesEmployees;
  } else {
    delete changedFields.value.managesEmployees;
  }

  emit("has-unsaved-changes", hasChanges.value);
};

const handleApproverChange = (newValue) => {
  const originalApprover = originalData.value.approver?.id || null;

  if (newValue !== originalApprover) {
    changedFields.value.approver = newValue ? { id: newValue } : null;
  } else {
    delete changedFields.value.approver;
  }

  emit("has-unsaved-changes", hasChanges.value);
};

const getFieldErrorMessage = (fieldName) => {
  return touchedFields.value.has(fieldName)
    ? validationErrors.value[fieldName]
    : "";
};

const markFieldAsTouched = (fieldName) => {
  touchedFields.value.add(fieldName);
  validateField(fieldName);
};

const validateField = (fieldName) => {
  touchedFields.value.add(fieldName);
  validationErrors.value[fieldName] = null;
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const toggleSwitch = (field, value) => {
  localEmployeeData.value[field] = value;
  handleInputChange(field);
};

const handleCycleTypeChange = (newValue) => {
  const currentCycleType = originalData.value.cycleType;
  if (newValue !== currentCycleType) {
    changedFields.value.cycleType = newValue;
  } else {
    delete changedFields.value.cycleType;
  }

  if (newValue) {
    validationErrors.value.cycleType = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};

async function fetchCycleTypes() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance cycles");
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const firstItem = data.data[0];
      const multiAttendanceCycle = firstItem.multi_attendance_cycle;
      if (
        multiAttendanceCycle &&
        multiAttendanceCycle.cycles &&
        Array.isArray(multiAttendanceCycle.cycles)
      ) {
        cycleTypeOptions.value = multiAttendanceCycle.cycles.map((cycle) => ({
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
        }));
      } else {
        console.warn("No cycles found in multi_attendance_cycle");
      }
    } else {
      console.warn("No data found in response");
    }
  } catch (error) {
    console.error("Error fetching attendance cycles:", error);
    showErrorMessage("Failed to load attendance cycle options");
  }
}

async function fetchOrganizations() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch organizations");
    }

    const data = await response.json();
    organizationOptions.value = data.data.map((org) => ({
      id: org.id,
      orgName: `${org.orgName} (${org.orgType})`, // Combine orgName and orgType for display
    }));

    if (
      localEmployeeData.value?.assignedUser?.organization?.orgName &&
      !selectedOrganization.value
    ) {
      matchOrganizationByName(
        localEmployeeData.value.assignedUser.organization.orgName,
      );
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
    organizationOptions.value = [];
    showErrorMessage("Failed to load organization options");
  }
}

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.designation",
      "assignedUser.dateOfLeaving",
      "assignedUser.dateOfJoining",
      "assignedUser.PFAccountNumber",
      "assignedUser.ESIAccountNumber",
      "assignedUser.organization.id",
      "assignedUser.organization.orgName",
      "assignedUser.organization.orgType",
      "department.id",
      "department.departmentName",
      "branchLocation.id",
      "branchLocation.locdetail.locationName",
      "branchLocation.locType",
      "cycleType",
      "approver",
      "approver.id",
      "approver.first_name",
      "assignedUser.role.name",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const employee = data.data[0];
      if (!employee.assignedUser) {
        employee.assignedUser = { id: "", organization: {} };
      } else if (!employee.assignedUser.id) {
        employee.assignedUser.id = employee.user_id || "";
      }
      localEmployeeData.value = JSON.parse(JSON.stringify(employee));
      emit("update:employeeData", employee);
      originalData.value = JSON.parse(JSON.stringify(employee));

      if (employee.cycleType) {
        selectedCycleType.value = Number(
          employee.cycleType.cycleId || employee.cycleType,
        );
      }
      if (employee.reportingManager) {
        selectedReportingManagers.value = Array.isArray(
          employee.reportingManager,
        )
          ? employee.reportingManager
          : [employee.reportingManager]
            ? [employee.reportingManager]
            : [];
      } else {
        selectedReportingManagers.value = [];
      }

      if (employee.managesEmployees) {
        selectedManagesEmployees.value = Array.isArray(
          employee.managesEmployees,
        )
          ? employee.managesEmployees
          : [employee.managesEmployees];
      } else {
        selectedManagesEmployees.value = [];
      }

      if (employee.approver) {
        selectedApprover.value = employee.approver.id;
      } else {
        selectedApprover.value = null;
      }

      if (employee.department) {
        selectedDepartment.value = employee.department.id;
      }

      if (employee.branchLocation) {
        selectedBranchLocation.value = employee.branchLocation.id;
      }

      if (employee.assignedUser.organization) {
        selectedOrganization.value = employee.assignedUser.organization.id;
      }

      if (!selectedDepartment.value && employee.department?.departmentName) {
        matchDepartmentByName(employee.department.departmentName);
      }

      if (
        !selectedBranchLocation.value &&
        employee.branchLocation?.locdetail?.locationName
      ) {
        matchBranchByName(employee.branchLocation.locdetail.locationName);
      }

      if (
        !selectedOrganization.value &&
        employee.assignedUser.organization?.orgName
      ) {
        matchOrganizationByName(employee.assignedUser.organization.orgName);
      }
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const matchDepartmentByName = (departmentName) => {
  if (!departmentName || !departmentOptions.value.length) return;
  const matchedDept = departmentOptions.value.find(
    (dept) => dept.name.toLowerCase() === departmentName.toLowerCase(),
  );
  if (matchedDept) {
    selectedDepartment.value = matchedDept.id;
  }
};

const matchBranchByName = (locationName) => {
  if (!locationName || !locationOptions.value.length) return;
  const matchedLoc = locationOptions.value.find((loc) =>
    loc.name.toLowerCase().includes(locationName.toLowerCase()),
  );
  if (matchedLoc) {
    selectedBranchLocation.value = matchedLoc.id;
  }
};

const matchOrganizationByName = (orgName) => {
  if (!orgName || !organizationOptions.value.length) return;
  const matchedOrg = organizationOptions.value.find((org) =>
    org.orgName.toLowerCase().includes(orgName.toLowerCase()),
  );
  if (matchedOrg) {
    selectedOrganization.value = matchedOrg.id;
  }
};

const fetchDepartments = async (orgId = null) => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    let filterQuery = `filter[tenant][tenantId][_eq]=${tenantId}`;
    if (orgId) {
      filterQuery = `filter[_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][1][orgId][id][_eq]=${orgId}`;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    departmentOptions.value = data.data.map((dept) => ({
      id: dept.id,
      name: dept.departmentName || "Unnamed Department",
    }));
    if (
      localEmployeeData.value?.department?.departmentName &&
      !selectedDepartment.value
    ) {
      matchDepartmentByName(localEmployeeData.value.department.departmentName);
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    departmentOptions.value = [];
  }
};

const fetchLocations = async (orgId = null) => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    let filterQuery = `filter[tenant][tenantId][_eq]=${tenantId}`;
    if (orgId) {
      filterQuery += `&filter[orgLocation][id][_eq]=${orgId}`;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    locationOptions.value = data.data.map((loc) => ({
      id: loc.id,
      name: `${loc.locdetail.locationName} (${loc.locType})`,
    }));
    if (localEmployeeData.value?.branch?.branchName && !selectedBranch.value) {
      matchBranchByName(localEmployeeData.value.branch.branchName);
    }
  } catch (error) {
    console.error("Error fetching branches:", error);
    branchOptions.value = [];
  }
};

const handleReportingManagerChange = (newValue) => {
  const newManagers = Array.isArray(newValue)
    ? newValue
    : newValue
      ? [newValue]
      : [];

  const originalManagers = originalData.value.reportingManager
    ? Array.isArray(originalData.value.reportingManager)
      ? originalData.value.reportingManager
      : [originalData.value.reportingManager]
    : [];

  const originalSorted = [...originalManagers].sort();
  const newSorted = [...newManagers].sort();

  if (JSON.stringify(originalSorted) !== JSON.stringify(newSorted)) {
    changedFields.value.reportingManager = newManagers.length
      ? newManagers
      : null;
  } else {
    delete changedFields.value.reportingManager;
  }

  emit("has-unsaved-changes", hasChanges.value);
};

const BATCH_SIZE = 100;
const MAX_RECORDS = 1000;

async function fetchAllPaginatedData(baseUrl) {
  let allData = [];
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const paginatedUrl = `${baseUrl}&limit=${BATCH_SIZE}&page=${page}`;
      console.log(`📡 Fetching page ${page} from: ${paginatedUrl}`);

      const response = await fetch(paginatedUrl, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      allData = [...allData, ...data.data];

      if (data.data.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        page++;
      }

      if (page > 100 || allData.length >= MAX_RECORDS) {
        console.warn("⚠️ Reached maximum fetch limit");
        break;
      }
    }

    console.log(`✅ Fetched ${allData.length} total records`);
    return allData;
  } catch (error) {
    console.error("❌ Error in fetchAllPaginatedData:", error);
    return [];
  }
}

async function filterReportingManagers() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    console.log(`✅ Tenant ID: ${tenantId}`);

    let filters = [];
    filters.push(`filter[accessOn][_eq]=true`);

    if (selectedBranchFilter.value && selectedBranchFilter.value !== "all") {
      const selectedBranch = branchOptions.value.find(
        (branch) => branch.id === selectedBranchFilter.value,
      );
      if (selectedBranch) {
        filters.push(
          `filter[_and][1][branch][branchName][_contains]=${selectedBranch.name}`,
        );
      }
    }

    if (
      localEmployeeData.value?.branchLocation?.locdetail?.locationName &&
      !selectedBranchLocation.value
    ) {
      matchBranchByName(
        localEmployeeData.value.branchLocation.locdetail.locationName,
      );
    }

    const currentUserRole = authService.getUserRole();
    let roleFilter = "";
    if (currentUserRole === "Admin") {
      roleFilter = `&filter[assignedUser][role][name][_eq]=Manager`;
    } else if (currentUserRole === "Manager") {
      roleFilter = `&filter[_or][0][assignedUser][role][name][_eq]=Employee`;
      roleFilter += `&filter[_or][1][assignedUser][role][name][_eq]=Manager`;
    }

    const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${tenantId}${roleFilter}`;
    const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;

    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.first_name",
      "assignedUser.role.name",
      "branch.id",
      "branch.branchName",
      "department.id",
      "department.departmentName",
      "reportingManager",
      "accessOn",
    ].join(",");

    const baseUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}`;

    const allData = await fetchAllPaginatedData(baseUrl);
    console.log(`✅ API returned ${allData.length} records`);

    const currentEmployeeId =
      localEmployeeData.value?.assignedUser?.id ||
      localEmployeeData.value?.user_id ||
      props.id;

    const reportingManagerIds = new Set();
    const employeesWithReportingManager = new Set();

    allData.forEach((item) => {
      if (item.reportingManager) {
        const managers = Array.isArray(item.reportingManager)
          ? item.reportingManager
          : [item.reportingManager];
        managers.forEach((id) => {
          if (id) reportingManagerIds.add(id);
        });
        const itemUserId = item.assignedUser?.id || item.user_id;
        if (itemUserId) employeesWithReportingManager.add(itemUserId);
      }
    });

    filteredReportingManagers.value = allData
      .filter((item) => {
        const itemUserId = item.assignedUser?.id || item.user_id;
        return (
          itemUserId &&
          itemUserId !== currentEmployeeId &&
          !reportingManagerIds.has(itemUserId) &&
          !employeesWithReportingManager.has(itemUserId) &&
          item.accessOn !== false
        );
      })
      .map((item) => ({
        id: item.assignedUser?.id || item.user_id || "",
        name: item.assignedUser?.first_name?.trim() || "Unnamed User",
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
        branchId: item.branch?.id || null,
        branchName: item.branch?.branchName || "",
      }));

    console.log(
      `🎯 Final reporting managers count: ${filteredReportingManagers.value.length}`,
    );
  } catch (error) {
    console.error("Error fetching locations:", error);
    locationOptions.value = [];
  }
}

async function filterManagesEmployees() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    console.log(`✅ Tenant ID: ${tenantId}`);

    let filters = [];
    filters.push(`filter[accessOn][_eq]=true`);

    if (
      selectedManagesEmployeeBranchFilter.value &&
      selectedManagesEmployeeBranchFilter.value !== "all"
    ) {
      const selectedBranch = branchOptions.value.find(
        (branch) => branch.id === selectedManagesEmployeeBranchFilter.value,
      );
      if (selectedBranch) {
        filters.push(
          `filter[_and][1][branch][branchName][_contains]=${selectedBranch.name}`,
        );
      }
    }

    if (
      selectedManagesEmployeeDepartmentFilter.value &&
      selectedManagesEmployeeDepartmentFilter.value !== "all"
    ) {
      const selectedDept = departmentOptions.value.find(
        (dept) => dept.id === selectedManagesEmployeeDepartmentFilter.value,
      );
      if (selectedDept) {
        filters.push(
          `filter[_and][2][department][departmentName][_contains]=${selectedDept.name}`,
        );
      }
    }

    if (searchManagesEmployee.value) {
      filters.push(
        `filter[_and][3][assignedUser][first_name][_icontains]=${searchManagesEmployee.value}`,
      );
    }

    const currentUserRole = authService.getUserRole();
    let roleFilter = "";
    if (currentUserRole === "Admin") {
      roleFilter = `&filter[_or][0][assignedUser][role][name][_eq]=Manager&filter[_or][1][assignedUser][role][name][_eq]=Employee`;
    } else if (currentUserRole === "Manager") {
      roleFilter = `&filter[assignedUser][role][name][_eq]=Employee`;
    }

    const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${tenantId}${roleFilter}`;
    const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;

    const fields = [
      "id",
      "assignedUser.id",
      "assignedUser.first_name",
      "assignedUser.role.name",
      "branch.id",
      "branch.branchName",
      "department.id",
      "department.departmentName",
      "managesEmployees",
      "accessOn",
    ].join(",");

    const baseUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}`;

    const allData = await fetchAllPaginatedData(baseUrl);
    console.log(`✅ API returned ${allData.length} records`);

    const currentEmployeeId =
      localEmployeeData.value?.assignedUser?.id ||
      localEmployeeData.value?.user_id ||
      props.id;

    const existingManagesEmployees = selectedManagesEmployees.value || [];

    filteredManagesEmployees.value = allData
      .filter((item) => {
        const itemUserId = item.assignedUser?.id || item.user_id;
        return (
          ((itemUserId && itemUserId !== currentEmployeeId) ||
            existingManagesEmployees.includes(itemUserId)) &&
          item.accessOn !== false
        );
      })
      .map((item) => ({
        id: item.assignedUser?.id || item.user_id || "",
        name: item.assignedUser?.first_name?.trim() || "Unnamed User",
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
        branchId: item.branch?.id || null,
        branchName: item.branch?.branchName || "",
      }));

    console.log(
      `🎯 Final manages employees count: ${filteredManagesEmployees.value.length}`,
    );
  } catch (error) {
    console.error("❌ Error filtering manages employees:", error.message);
    filteredManagesEmployees.value = [];
  }
}

async function filterApprovers() {
  try {
    const tenantId = currentUserTenant.getTenantId();
    let allApprovers = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      let filters = [];

      const selectedUserRole =
        localEmployeeData.value?.assignedUser?.role?.name;
      if (selectedUserRole === "Manager") {
        filters.push(
          `filter[_and][0][assignedUser][role][name][_icontains]=Admin`,
        );
      } else if (selectedUserRole === "Employee") {
        filters.push(
          `filter[_and][0][assignedUser][role][name][_icontains]=Admin`,
        );
      } else if (selectedUserRole === "Admin") {
        filters.push(
          `filter[_and][0][assignedUser][role][name][_icontains]=Admin`,
        );
      }

      if (
        selectedApproverDepartmentFilter.value &&
        selectedApproverDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedApproverDepartmentFilter.value,
        );
        if (selectedDept) {
          filters.push(
            `filter[_and][1][department][departmentName][_icontains]=${encodeURIComponent(selectedDept.name)}`,
          );
        }
      }

      if (searchApprover.value) {
        filters.push(
          `filter[_and][2][assignedUser][first_name][_icontains]=${encodeURIComponent(searchApprover.value)}`,
        );
      }

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${tenantId}`;
      const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;
      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "branch.id",
        "branch.branchName",
        "department.id",
        "department.departmentName",
        "role.roleName",
        "accessOn",
      ].join(",");

      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}${pagination}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch approvers: ${response.statusText}`);
      }

      const data = await response.json();
      const currentPageApprovers = data.data || [];
      allApprovers = [...allApprovers, ...currentPageApprovers];

      if (currentPageApprovers.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    approverOptions.value = allApprovers
      .filter(
        (item) =>
          item.assignedUser?.id &&
          item.assignedUser?.first_name &&
          item.accessOn !== false,
      )
      .map((item) => ({
        id: item.assignedUser.id,
        name: item.assignedUser.first_name.trim(),
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
        branchId: item.branch?.id || null,
        branchName: item.branch?.branchName || "",
      }));
  } catch (error) {
    console.error("Error filtering approvers:", error);
    approverOptions.value = [];
    showErrorMessage("Failed to load approvers. Please try again.");
  }
}

const handleInputChange = (field) => {
  if (field.includes(".")) {
    const [parent, child] = field.split(".");
    if (child === "dateOfJoining" || child === "dateOfLeaving") {
      if (localEmployeeData.value[parent][child] === "") {
        localEmployeeData.value[parent][child] = null;
      }
    }

    if (
      localEmployeeData.value[parent][child] !==
      originalData.value[parent][child]
    ) {
      changedFields.value[parent] = changedFields.value[parent] || {};
      changedFields.value[parent][child] =
        localEmployeeData.value[parent][child];
    } else {
      if (changedFields.value[parent]) {
        delete changedFields.value[parent][child];
        if (Object.keys(changedFields.value[parent]).length === 0) {
          delete changedFields.value[parent];
        }
      }
    }
  } else {
    if (localEmployeeData.value[field] !== originalData.value[field]) {
      changedFields.value[field] = localEmployeeData.value[field];
    } else {
      delete changedFields.value[field];
    }
  }
  emit("has-unsaved-changes", hasChanges.value);
};

const handleOrganizationChange = (newValue) => {
  const currentOrgId = originalData.value.assignedUser.organization?.id;
  if (newValue !== currentOrgId) {
    changedFields.value.assignedUser = changedFields.value.assignedUser || {};
    changedFields.value.assignedUser.organization = newValue;
    const selectedOrg = organizationOptions.value.find(
      (o) => o.id === newValue,
    );
    if (selectedOrg) {
      localEmployeeData.value.assignedUser.organization = {
        id: newValue,
        orgName: selectedOrg.orgName.split(" (")[0], // Extract orgName without orgType
        orgType: selectedOrg.orgName.match(/\(([^)]+)\)/)?.[1] || "", // Extract orgType
      };
    }
  } else {
    if (changedFields.value.assignedUser) {
      delete changedFields.value.assignedUser.organization;
      if (Object.keys(changedFields.value.assignedUser).length === 0) {
        delete changedFields.value.assignedUser;
      }
    }
  }
  if (newValue) {
    validationErrors.value.organization = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};

const handleBranchLocationChange = (newValue) => {
  const currentBranchId = originalData.value.branchLocation?.id;
  if (newValue !== currentBranchId) {
    changedFields.value.branchLocation = newValue;
    const selectedLoc = locationOptions.value.find((l) => l.id === newValue);
    if (selectedLoc) {
      localEmployeeData.value.branchLocation = {
        id: newValue,
        locdetail: { locationName: selectedLoc.name.split(" (")[0] },
        locType: selectedLoc.name.match(/\(([^)]+)\)/)?.[1] || "",
      };
    }
  } else {
    delete changedFields.value.branchLocation;
  }
  if (newValue) {
    validationErrors.value.branchLocation = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};

const hasChanges = computed(() => Object.keys(changedFields.value).length > 0);

const updateCompanyDetails = async () => {
  if (!hasChanges.value) {
    showErrorMessage("No changes to update.");
    return;
  }

  const token = authService.getToken();
  const employeeId = props.id;

  try {
    const payload = {};
    let updateAccess = null;

    const originalDateOfLeaving = originalData.value.assignedUser.dateOfLeaving;
    const newDateOfLeaving = localEmployeeData.value.assignedUser.dateOfLeaving;

    if (newDateOfLeaving && !originalDateOfLeaving) {
      updateAccess = false;
    } else if (!newDateOfLeaving && originalDateOfLeaving) {
      updateAccess = true;
    } else if (
      newDateOfLeaving &&
      originalDateOfLeaving &&
      newDateOfLeaving !== originalDateOfLeaving
    ) {
      updateAccess = false;
    }

    Object.keys(changedFields.value).forEach((key) => {
      if (key === "assignedUser") {
        const assignedUserChanges = { ...changedFields.value.assignedUser };
        if (
          "PFAccountNumber" in assignedUserChanges &&
          assignedUserChanges.PFAccountNumber === ""
        ) {
          assignedUserChanges.PFAccountNumber = null;
        }
        if (
          "ESIAccountNumber" in assignedUserChanges &&
          assignedUserChanges.ESIAccountNumber === ""
        ) {
          assignedUserChanges.ESIAccountNumber = null;
        }
        if (
          "dateOfJoining" in assignedUserChanges &&
          assignedUserChanges.dateOfJoining === ""
        ) {
          assignedUserChanges.dateOfJoining = null;
        }
        if (
          "dateOfLeaving" in assignedUserChanges &&
          assignedUserChanges.dateOfLeaving === ""
        ) {
          assignedUserChanges.dateOfLeaving = null;
        }
        if (
          "designation" in assignedUserChanges &&
          assignedUserChanges.designation === ""
        ) {
          assignedUserChanges.designation = null;
        }
        if ("organization" in assignedUserChanges) {
          assignedUserChanges.organization = {
            id: assignedUserChanges.organization,
          };
        }
        payload.assignedUser = {
          id: localEmployeeData.value.assignedUser.id,
          ...assignedUserChanges,
        };
      } else if (key === "department") {
        payload.department = changedFields.value.department;
      } else if (key === "branchLocation") {
        payload.branchLocation = changedFields.value.branchLocation;
      } else if (key === "reportingManager") {
        const newManagers = changedFields.value.reportingManager;
        payload.reportingManager =
          newManagers && newManagers.length ? newManagers : null;
      } else if (key === "managesEmployees") {
        const newManagesEmployees = changedFields.value.managesEmployees;
        payload.managesEmployees =
          newManagesEmployees && newManagesEmployees.length
            ? newManagesEmployees
            : null;
      } else if (key === "approver") {
        payload.approver = changedFields.value.approver;
      } else if (key === "department") {
        payload.department = changedFields.value.department;
      } else if (key === "branch") {
        payload.branch = changedFields.value.branch;
      } else if (key === "cycleType") {
        payload.cycleType = changedFields.value.cycleType;
      } else {
        payload[key] =
          changedFields.value[key] !== "" ? changedFields.value[key] : null;
      }
    });

    if (updateAccess !== null) {
      payload.accessOn = updateAccess;
      if (!payload.assignedUser) {
        payload.assignedUser = { id: localEmployeeData.value.assignedUser.id };
      }
      payload.assignedUser.appAccess = updateAccess;
    }

    console.log("Sending personalModule payload:", payload);

    const personalModuleResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${employeeId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!personalModuleResponse.ok) {
      const errorData = await personalModuleResponse.json();
      throw new Error(
        `Failed to update personal module: ${errorData.errors?.[0]?.message || personalModuleResponse.statusText}`,
      );
    }

    if (changedFields.value.managesEmployees !== undefined) {
      const originalManagesEmployees = originalData.value.managesEmployees
        ? Array.isArray(originalData.value.managesEmployees)
          ? originalData.value.managesEmployees
          : [originalData.value.managesEmployees]
        : [];

      const newManagesEmployees = changedFields.value.managesEmployees || [];

      const addedEmployees = newManagesEmployees.filter(
        (id) => !originalManagesEmployees.includes(id),
      );
      const removedEmployees = originalManagesEmployees.filter(
        (id) => !newManagesEmployees.includes(id),
      );

      for (const userId of addedEmployees) {
        const employeeResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][id][_eq]=${userId}&fields=id,reportingManager`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const employeeData = await employeeResponse.json();
        if (employeeData.data && employeeData.data.length > 0) {
          const employee = employeeData.data[0];
          let currentManagers = employee.reportingManager
            ? Array.isArray(employee.reportingManager)
              ? employee.reportingManager
              : [employee.reportingManager]
            : [];

          if (!currentManagers.includes(currentEmployeeUserId)) {
            currentManagers.push(currentEmployeeUserId);
            await fetch(
              `${import.meta.env.VITE_API_URL}/items/personalModule/${employee.id}`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  reportingManager: currentManagers.length
                    ? currentManagers
                    : null,
                }),
              },
            );
          }
        }
      }

      for (const userId of removedEmployees) {
        const employeeResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[assignedUser][id][_eq]=${userId}&fields=id,reportingManager`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const employeeData = await employeeResponse.json();
        if (employeeData.data && employeeData.data.length > 0) {
          const employee = employeeData.data[0];
          let currentManagers = employee.reportingManager
            ? Array.isArray(employee.reportingManager)
              ? employee.reportingManager
              : [employee.reportingManager]
            : [];

          currentManagers = currentManagers.filter(
            (id) => id !== currentEmployeeUserId,
          );
          await fetch(
            `${import.meta.env.VITE_API_URL}/items/personalModule/${employee.id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                reportingManager: currentManagers.length
                  ? currentManagers
                  : null,
              }),
            },
          );
        }
      }
    }

    if (updateAccess !== null) {
      await updateCardAccess(employeeId, updateAccess);
    }

    await fetchEmployeeData();
    changedFields.value = {};
    emit("has-unsaved-changes", false);
    showSuccessMessage("Company details updated successfully!");
  } catch (error) {
    console.error("Error updating company details:", error);
    showErrorMessage(
      `Failed to update company details. Please try again: ${error.message}`,
    );
  }
};

const updateCardAccess = async (employeeId, enableAccess) => {
  const token = authService.getToken();
  try {
    const cardsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_eq]=${employeeId}&fields=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!cardsResponse.ok) {
      const errorData = await cardsResponse.json();
      throw new Error(
        `Failed to fetch cards: ${errorData.errors?.[0]?.message || cardsResponse.statusText}`,
      );
    }

    const cardsData = await cardsResponse.json();
    const cardsToUpdate = cardsData.data;

    if (cardsToUpdate.length > 0) {
      const bulkUpdatePayload = cardsToUpdate.map((card) => ({
        id: card.id,
        cardAccess: enableAccess,
      }));

      console.log(
        "Sending cardManagement bulk update payload:",
        bulkUpdatePayload,
      );

      const cardPatchResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/cardManagement`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bulkUpdatePayload),
        },
      );

      if (!cardPatchResponse.ok) {
        const errorData = await cardPatchResponse.json();
        throw new Error(
          `Failed to update card access: ${errorData.errors?.[0]?.message || cardPatchResponse.statusText}`,
        );
      }
      console.log("Card access updated successfully.");
    } else {
      console.log("No cards found for this employee to update access.");
    }
  } catch (error) {
    console.error("Error in updateCardAccess:", error);
    throw error;
  }
};

const handleDepartmentChange = (newValue) => {
  const currentDeptId = originalData.value.department?.id;
  if (newValue !== currentDeptId) {
    changedFields.value.department = newValue;
    const selectedDept = departmentOptions.value.find((d) => d.id === newValue);
    if (selectedDept) {
      localEmployeeData.value.department = {
        id: newValue,
        departmentName: selectedDept.name,
      };
    }
  } else {
    delete changedFields.value.department;
  }
  if (newValue) {
    validationErrors.value.department = null;
  }
  emit("has-unsaved-changes", hasChanges.value);
};

watch(selectedOrganization, async (newOrgId) => {
  if (newOrgId) {
    await fetchDepartments(newOrgId);
    await fetchLocations(newOrgId);
    if (selectedDepartment.value) {
      const stillValid = departmentOptions.value.some(
        (d) => d.id === selectedDepartment.value,
      );
      if (!stillValid) {
        selectedDepartment.value = null;
        delete changedFields.value.department;
        localEmployeeData.value.department = null;
      }
    }
    if (selectedBranchLocation.value) {
      const stillValid = locationOptions.value.some(
        (l) => l.id === selectedBranchLocation.value,
      );
      if (!stillValid) {
        selectedBranchLocation.value = null;
        delete changedFields.value.branchLocation;
        localEmployeeData.value.branchLocation = null;
      }
    }
  } else {
    departmentOptions.value = [];
    selectedDepartment.value = null;
    delete changedFields.value.department;
    localEmployeeData.value.department = null;
    locationOptions.value = [];
    selectedBranchLocation.value = null;
    delete changedFields.value.branchLocation;
    localEmployeeData.value.branchLocation = null;
  }
});

onMounted(async () => {
  await Promise.all([fetchCycleTypes(), fetchOrganizations()]);
  await fetchEmployeeData();
  await Promise.all([
    filterReportingManagers(),
    filterManagesEmployees(),
    filterApprovers(),
  ]);
});

watch(
  () => props.employeeData,
  (newVal) => {
    if (newVal) {
      localEmployeeData.value = JSON.parse(JSON.stringify(newVal));
      if (newVal.department?.id) {
        selectedDepartment.value = newVal.department.id;
      } else if (newVal.department?.departmentName) {
        matchDepartmentByName(newVal.department.departmentName);
      }
      if (newVal.branchLocation?.id) {
        selectedBranchLocation.value = newVal.branchLocation.id;
      } else if (newVal.branchLocation?.locdetail?.locationName) {
        matchBranchByName(newVal.branchLocation.locdetail.locationName);
      }
      if (newVal.assignedUser?.organization?.id) {
        selectedOrganization.value = newVal.assignedUser.organization.id;
      } else if (newVal.assignedUser?.organization?.orgName) {
        matchOrganizationByName(newVal.assignedUser.organization.orgName);
      }
      if (newVal.approver) {
        selectedApprover.value = newVal.approver.id;
      } else {
        selectedApprover.value = null;
      }
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => props.id,
  () => {
    fetchEmployeeData();
  },
);

watch(
  () => localEmployeeData.value?.assignedUser?.role?.name,
  (newRole) => {
    if (newRole) {
      selectedApprover.value = null;
      filterApprovers();
    }
  },
  { immediate: true },
);

watch(departmentOptions, (newOptions) => {
  if (
    newOptions.length &&
    localEmployeeData.value?.department?.departmentName &&
    !selectedDepartment.value
  ) {
    matchDepartmentByName(localEmployeeData.value.department.departmentName);
  }
});

watch(locationOptions, (newOptions) => {
  if (
    newOptions.length &&
    localEmployeeData.value?.branchLocation?.locdetail?.locationName &&
    !selectedBranchLocation.value
  ) {
    matchBranchByName(
      localEmployeeData.value.branchLocation.locdetail.locationName,
    );
  }
});

watch(organizationOptions, (newOptions) => {
  if (
    newOptions.length &&
    localEmployeeData.value?.assignedUser?.organization?.orgName &&
    !selectedOrganization.value
  ) {
    matchOrganizationByName(
      localEmployeeData.value.assignedUser.organization.orgName,
    );
  }
});
</script>

<style scoped>
.company-details {
  padding: 20px;
}
.scroll-container {
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}
.v-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
