<template>
  <div>
    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="search"
          label="Search"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          @input="fetchEmployees"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedBranch"
          :items="branchesWithAllOption"
          item-title="branchName"
          item-value="id"
          label="Branch"
          variant="outlined"
          @update:modelValue="fetchEmployees"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="selectedDepartment"
          :items="departmentsWithAllOption"
          item-title="departmentName"
          item-value="id"
          label="Department"
          variant="outlined"
          @update:modelValue="fetchEmployees"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Rest of your template remains the same -->
    <v-tabs v-model="activeTab" @update:modelValue="handleTabChange">
      <v-tab color="primary" value="unassigned" style="text-transform: none">
        Unassigned Employees
      </v-tab>
      <v-tab color="primary" value="assigned" style="text-transform: none">
        Assigned Employees
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="assigned">
        <EmployeeList
          :employees="assignedEmployees"
          :loading="loading"
          :is-assigned="true"
          @toggle-access="toggleAssignment"
        />
      </v-window-item>
      <v-window-item value="unassigned">
        <EmployeeList
          :employees="unassignedEmployees"
          :loading="loading"
          :is-assigned="false"
          @toggle-access="toggleAssignment"
        />
        <v-btn color="primary" @click="assignToAllEmployees" class="mt-4">
          Assign to All Employees
        </v-btn>
      </v-window-item>
    </v-window>

    <v-snackbar
      v-model="snackbar"
      color="green"
      timeout="3000"
      bottom
      elevation="1"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import { convertToCardAccessHex } from "@/utils/helpers/convertToCardAccessHex"; // Import the helper function
import EmployeeList from "./EmployeeList.vue";

const props = defineProps({
  accessLevelId: {
    type: Number,
    required: true,
  },
});

const activeTab = ref("unassigned");
const search = ref("");
const selectedBranch = ref(null);
const selectedDepartment = ref(null);
const assignedEmployees = ref([]);
const unassignedEmployees = ref([]);
const branches = ref([]);
const departments = ref([]);
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");

const branchesWithAllOption = computed(() => [
  { id: null, branchName: "All Branches" },
  ...branches.value,
]);

const departmentsWithAllOption = computed(() => [
  { id: null, departmentName: "All Departments" },
  ...departments.value,
]);

onMounted(async () => {
  await fetchBranches();
  await fetchDepartments();
  if (props.accessLevelId) {
    await fetchEmployees();
  } else {
    console.warn("accessLevelId is undefined, skipping fetchEmployees on mount");
    snackbarMessage.value = "Access level ID is not available. Waiting for data...";
    snackbar.value = true;
  }
});
const fetchBranches = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }/items/branch?filter[tenant][tenantId][_eq]=${tenantId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  branches.value = data.data || []; // Fallback to empty array
};
const fetchDepartments = async () => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();
  const response = await fetch(
    `${
      import.meta.env.VITE_API_URL
    }/items/department?filter[tenant][tenantId][_eq]=${tenantId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  departments.value = data.data || []; // Fallback to empty array
};

// Helper function to fetch and update cards for an employee
const updateEmployeeCards = async (employeeId, accessLevelId, accessOn) => {
  const token = authService.getToken();
  let accessLevelNumber;

  // Fetch accessLevelNumber using accessLevelId
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels/${accessLevelId}?fields=accessLevelNumber`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch access level number");
    }
    const data = await response.json();
    accessLevelNumber = data.data.accessLevelNumber;
  } catch (error) {
    console.error("Error fetching access level number:", error);
    snackbarMessage.value = `Error fetching access level details: ${error.message}`;
    snackbar.value = true;
    return; // Exit if we can't fetch the access level number
  }

  try {
    // Fetch existing cards for the employee
    const cardsResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_eq]=${employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!cardsResponse.ok) {
      throw new Error("Failed to fetch cards for employee");
    }

    const cardsData = await cardsResponse.json();
    const cards = (cardsData.data || []).map((card) => ({
      id: card.id,
      rfidCard: card.rfidCard,
      type: card.type,
      enabled: card.cardAccess,
      originalId: card.id,
    }));

    // Update each card
    for (const card of cards) {
      const cardPayload = {
        rfidCard: card.rfidCard,
        type: card.type.toLowerCase(),
        enabled: accessOn,
        cardAccess: accessOn,
        accessLevelsId: accessLevelNumber,
        cardAccessLevelArray: `${card.rfidCard}:${accessOn ? 1 : 0}:${accessLevelNumber}`,
        cardAccessLevelHex: convertToCardAccessHex(
          card.rfidCard,
          accessOn,
          accessLevelNumber,
        ),
        employeeId: employeeId,
      };

      await fetch(
        `${import.meta.env.VITE_API_URL}/items/cardManagement/${card.originalId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cardPayload),
        },
      );
    }
  } catch (error) {
    console.error("Error updating cards for employee:", error);
    snackbarMessage.value = `Error updating cards for employee: ${error.message}`;
    snackbar.value = true;
  }
};

const fetchEmployees = async () => {
  if (activeTab.value === "assigned" && !props.accessLevelId) {
    console.warn("accessLevelId is undefined for assigned tab, skipping fetch");
    assignedEmployees.value = [];
    snackbarMessage.value = "Cannot fetch assigned employees: Access level ID is missing.";
    snackbar.value = true;
    loading.value = false;
    return;
  }

  loading.value = true;
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  const params = {
    'fields[]': [
      "id",
      "employeeId",
      "assignedUser.first_name",
      "assignedUser.tenant",
      "department.id",
      "department.departmentName",
      "branch.id",
      "branch.branchName",
      "assignedAccessLevel.accessLevelName",
      "assignedAccessLevel.id",
      "assignedAccessLevel.accessLevelNumber",
      "assignedUser.tenant.tenantId",
      "assignedUser.tenant.tenantName",
      "assignedUser.role.name",
      "assignedUser.role.id",
      "assignedAccessLevel.accessLevelName"
    ],
    'filter[assignedUser][tenant][tenantId][_eq]': tenantId,
    'sort': 'date_created',
    
  };

  if (search.value) {
    params['filter[_or][0][assignedUser][first_name][_contains]'] = search.value;
    params['filter[_or][1][employeeId][_contains]'] = search.value;
  }

  if (selectedBranch.value !== null) {
    params['filter[branch][id][_eq]'] = selectedBranch.value;
  }

  if (selectedDepartment.value !== null) {
    params['filter[department][id][_eq]'] = selectedDepartment.value;
  }

  if (activeTab.value === "assigned") {
    params['filter[assignedAccessLevel][id][_eq]'] = props.accessLevelId;
  } else {
    params['filter[assignedAccessLevel][id][_null]'] = 'true';
  }

  const queryString = Object.entries(params)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${key}=${encodeURIComponent(v)}`);
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Unexpected API response:', data);
      assignedEmployees.value = [];
      unassignedEmployees.value = [];
      snackbarMessage.value = 'Failed to fetch employees. Please try again.';
      snackbar.value = true;
      return;
    }

    if (activeTab.value === 'assigned') {
      assignedEmployees.value = data.data.map((employee) => ({
        ...employee,
        assigned: true,
      }));
    } else {
      unassignedEmployees.value = data.data.map((employee) => ({
        ...employee,
        assigned: false,
      }));
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    assignedEmployees.value = [];
    unassignedEmployees.value = [];
    snackbarMessage.value = 'Error fetching employees. Please try again.';
    snackbar.value = true;
  } finally {
    loading.value = false;
  }
};

const toggleAssignment = async (employee, isAssigned) => {
  console.log("🔄 toggleAssignment called with:", { employee, isAssigned });

  if (!props.accessLevelId) {
    console.warn("⚠️ accessLevelId is undefined, cannot toggle assignment");
    snackbarMessage.value = "Cannot toggle assignment: Access level ID is missing.";
    snackbar.value = true;
    return;
  }

  const token = authService.getToken();
  const payload = {
    assignedAccessLevel: isAssigned ? null : props.accessLevelId,
    accessOn: isAssigned ? false : true, // Enable access when assigning, disable when unassigning
  };

  console.log("📦 Payload to be sent:", payload);

  try {
    const url = `${import.meta.env.VITE_API_URL}/items/personalModule/${employee.id}`;
    console.log("🌐 Sending PATCH request to:", url);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("📥 Response status:", response.status);

    if (response.ok) {
      const responseData = await response.json();
      console.log("📄 Response data:", responseData);
      
      const updatedEmployee = responseData.data;
      const actuallyAssigned = updatedEmployee.assignedAccessLevel !== null;

      // Update cards based on assignment status
      await updateEmployeeCards(
        employee.id,
        props.accessLevelId,
        !isAssigned // Enable cards when assigning, disable when unassigning
      );

      if (!isAssigned && actuallyAssigned) {
        console.log("✅ Successfully assigned access level");
        unassignedEmployees.value = unassignedEmployees.value.filter(
          (emp) => emp.id !== employee.id,
        );
        assignedEmployees.value.push({ 
          ...employee, 
          assigned: true,
          assignedAccessLevel: updatedEmployee.assignedAccessLevel 
        });
        snackbarMessage.value = "Successfully assigned access level to employee and updated cards.";
      } else if (isAssigned && !actuallyAssigned) {
        console.log("🚫 Successfully unassigned access level");
        assignedEmployees.value = assignedEmployees.value.filter(
          (emp) => emp.id !== employee.id,
        );
        unassignedEmployees.value.push({ 
          ...employee, 
          assigned: false,
          assignedAccessLevel: null 
        });
        snackbarMessage.value = "Successfully unassigned access level from employee and updated cards.";
      } else {
        console.warn("⚠️ API response doesn't match expected assignment state");
        snackbarMessage.value = "Assignment may not have completed as expected. Please refresh to see current state.";
        await fetchEmployees();
      }

      console.log("🔔 Showing snackbar:", snackbarMessage.value);
      snackbar.value = true;
    } else {
      const errorData = await response.json();
      console.error("❌ Failed to update access level. Response error:", errorData);
      snackbarMessage.value = "Failed to update access level. Please try again.";
      snackbar.value = true;
    }
  } catch (error) {
    console.error("🔥 Exception caught during access level update:", error);
    snackbarMessage.value = "Error updating access level. Please try again.";
    snackbar.value = true;
  }
};

const assignToAllEmployees = async () => {
  if (!props.accessLevelId) {
    console.warn("accessLevelId is undefined, cannot assign to all employees");
    snackbarMessage.value = "Cannot assign to all employees: Access level ID is missing.";
    snackbar.value = true;
    return;
  }

  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  const payload = {
    keys: unassignedEmployees.value.map((emp) => emp.id),
    data: {
      assignedAccessLevel: props.accessLevelId,
      accessOn: true, // Enable access for all assigned employees
    },
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (response.ok) {
      // Update cards for each employee
      for (const employee of unassignedEmployees.value) {
        await updateEmployeeCards(employee.id, props.accessLevelId, true);
      }

      assignedEmployees.value = [
        ...assignedEmployees.value,
        ...unassignedEmployees.value.map((emp) => ({ ...emp, assigned: true, assignedAccessLevel: { id: props.accessLevelId } })),
      ];
      unassignedEmployees.value = [];
      snackbarMessage.value = "Successfully assigned access level to all employees and updated cards.";
      snackbar.value = true;
    } else {
      const errorData = await response.json();
      console.error("Failed to assign access level to all employees:", errorData);
      snackbarMessage.value = "Failed to assign access level to all employees. Please try again.";
      snackbar.value = true;
    }
  } catch (error) {
    console.error("Error assigning access level to all employees:", error);
    snackbarMessage.value = "Error assigning access level to all employees. Please try again.";
    snackbar.value = true;
  }
};

watch(
  () => props.accessLevelId,
  (newId) => {
    if (newId) {
      fetchEmployees();
    }
  },
);

watch(activeTab, () => {
  if (props.accessLevelId) {
    fetchEmployees();
  } else {
    console.warn("accessLevelId is undefined, skipping fetchEmployees");
    snackbarMessage.value = "Access level ID is not available. Please try again.";
    snackbar.value = true;
  }
});

const handleTabChange = () => {
  if (props.accessLevelId) {
    fetchEmployees();
  } else {
    console.warn("accessLevelId is undefined, skipping fetchEmployees");
    snackbarMessage.value = "Access level ID is not available. Please try again.";
    snackbar.value = true;
  }
};
</script>

<style>
@media (min-width: 600px) {
  .v-col-sm-4 {
    flex: 0 0 33.3333333333%;
    max-width: 33.3333333333%;
    margin-top: 0.2rem;
  }
}
</style>
