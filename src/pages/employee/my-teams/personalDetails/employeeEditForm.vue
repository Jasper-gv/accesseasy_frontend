<!-- emploeeEditForm.vue -->
<template>
  <div class="employee-form-container">
    <!-- Header -->
    <div class="form-header">
      <div class="header-left">
        <v-btn
          v-if="!isDialog"
          icon
          variant="text"
          @click="$router.push('/employee-details')"
          class="back-button"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="employee-name-container">
          <v-icon left color="primary">mdi-account</v-icon>
          <span class="employee-name">{{
            employeeData.assignedUser?.first_name || "New Employee"
          }}</span>
        </div>
      </div>

      <div class="header-center">
        <h2 class="form-title">
          {{ isEditing ? "Edit Employee" : "Add Employee" }}
        </h2>
      </div>

      <div class="header-right">
        <v-btn color="error" variant="text" @click="cancelForm"> CANCEL </v-btn>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="form-content-wrapper">
      <!-- Left Sidebar with Tabs -->
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="tab in filteredTabs"
            :key="tab.path"
            :to="getTabRoute(tab.path)"
            :class="{
              'has-error': tabHasError(tab.id),
              'v-list-item--active': currentModule === tab.path,
            }"
            :style="{
              minHeight: '54px !important',
              borderRight: '1px solid #e0e0e0',
            }"
          >
            <template v-slot:prepend>
              <!-- Always show icon -->
              <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-bind="props"
                    :color="tabHasError(tab.id) ? 'error' : 'default'"
                    class="sidebar-icon"
                  >
                    {{ tab.icon }}
                  </v-icon>
                </template>
                <span>{{ tab.title }}</span>
              </v-tooltip>
            </template>

            <!-- Show text only on desktop -->
            <v-list-item-title class="sidebar-title">
              {{ tab.title }}
              <v-icon
                v-if="tabHasError(tab.id)"
                color="error"
                size="small"
                class="ms-2"
              >
                mdi-alert-circle
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Right Content Area -->
      <div class="form-content">
        <component
          :is="currentTabComponent"
          :employee-data="currentTabData"
          :id="id"
          @update:employee-data="updateTempData"
          :tenant-id="tenantId"
          ref="currentTabRef"
        ></component>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import PersonalDetails from "@/pages/employee/my-teams/personalDetails/employeeEditform/personalDetails.vue";
import CompanyDetails from "@/pages/employee/my-teams/personalDetails/employeeEditform/companyDetails.vue";
import GovernmentIds from "@/pages/employee/my-teams/personalDetails/employeeEditform/governmentIDs.vue";
import AttendancePolicy from "@/pages/employee/my-teams/personalDetails/employeeEditform/attendance/attendancePolicy.vue";
//import PayrollCategory from "@/pages/employee/my-teams/personalDetails/employeeEditform/payrollCategory.vue";
import AccessManagement from "@/pages/employee/my-teams/personalDetails/employeeEditform/accessManagement.vue";
import PastExperience from "@/pages/employee/my-teams/personalDetails/employeeEditform/pastExperience.vue";
import BackgroundVerification from "@/pages/employee/my-teams/personalDetails/employeeEditform/backgroundVerification.vue";
//import BankDetails from "@/pages/employee/my-teams/personalDetails/employeeEditform/bankForm.vue";
// import EmployeeAddress from "@/pages/employee/my-teams/personalDetails/employeeEditform/employeeAddress.vue";
import EmergencyContact from "@/pages/employee/my-teams/personalDetails/employeeEditform/emergencyContact.vue";
import LeavePolicy from "@/pages/employee/my-teams/personalDetails/employeeEditform/leavePolicy.vue";
import Appaccess from "./employeeEditform/appaccess.vue";

const props = defineProps({
  isDialog: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save-success"]);

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);
const currentModule = computed(() => route.params.module || "personalmodule");
const employeeData = ref({});
const modifiedEmployeeData = ref({});
const hasChanges = ref(false);
const isEditing = computed(() => !!id.value);
const userRole = ref("");
const isInitialized = ref(false);
const errorTabs = ref({});
const tenantId = ref(null); // Added tenantId ref
const currentTabRef = ref(null); // Ref to the currently active tab component
const showErrorIcon = ref(false);

const tabs = [
  {
    id: "personal",
    title: "Personal Details",
    icon: "mdi-account",
    path: "personalmodule",
    component: PersonalDetails,
    roles: ["Admin", "Manager", "accessManager", "Dealer"],
  },
  {
    id: "company",
    title: "Company Details",
    icon: "mdi-domain",
    path: "companymodule",
    component: CompanyDetails,
    roles: ["Admin", "Manager", "accessManager", "Dealer"],
  },
  {
    id: "government",
    title: "Government IDs",
    icon: "mdi-card-account-details",
    path: "governmentmodule",
    component: GovernmentIds,
    roles: ["Admin", "Manager", "accessManager", "Employee", "Dealer"],
  },
  {
    id: "attendance",
    title: "Attendance Settings",
    icon: "mdi-calendar-check",
    path: "attendancemodule",
    component: AttendancePolicy,
    roles: ["Admin", "Dealer", "Manager", "accessManager"],
  },
  {
    id: "LeavePolicy",
    title: "Leave Policy",
    icon: "mdi-calendar-account",
    path: "leavePolicy",
    component: LeavePolicy,
    roles: ["Admin", "Manager", "accessManager", "Dealers"],
  },

  // {
  //   id: "access",
  //   title: "Access Management",
  //   icon: "mdi-key",
  //   path: "accessmodule",
  //   component: AccessManagement,
  //   roles: ["Admin", "Dealer", "Manager",'accessManager'],
  // },
  {
    id: "experience",
    title: "Past Experience",
    icon: "mdi-history",
    path: "experiencemodule",
    component: PastExperience,
    roles: ["Admin", "Manager", "accessManager", "Dealer"],
  },

  {
    id: "Emergency Contact Details",
    title: "Emergency Contact Details",
    icon: "mdi-phone-in-talk",
    path: "emergencyContact",
    component: EmergencyContact,
    roles: ["Admin", "Manager", "accessManager", "Dealer"],
  },
  // {
  //   id: "Employee Address",
  //   title: "Employee Address",
  //   icon: "mdi-map-marker",
  //   path: "employeeAddress",
  //   component: EmployeeAddress,
  //   roles: ["Admin", "Manager",'accessManager', "Employee", "Dealer"],
  // },
  {
    id: "Appaccess",
    title: "App Access Settings",
    icon: "mdi-shield-check",
    path: "appacess",
    component: Appaccess,
    roles: ["Admin", "Manager", "accessManager", "Employee", "Dealer"],
  },
];

// Filter tabs based on user role
const filteredTabs = computed(() => {
  const filtered = tabs.filter((tab) =>
    tab.roles.includes(userRole.value || "Employee"),
  );
  return filtered;
});

const currentTabComponent = computed(() => {
  const tab = tabs.find((tab) => tab.path === currentModule.value);
  return tab ? tab.component : PersonalDetails;
});

const currentTabData = computed(() => {
  return {
    ...employeeData.value,
    ...modifiedEmployeeData.value[currentModule.value],
  };
});

const getTabRoute = (tabPath) => {
  if (props.isDialog) {
    return { name: "AddEmployeeForm", params: { module: tabPath } };
  }
  return `/employee-details/employee/${id.value}/${tabPath}`;
};

const tabHasError = (tabId) => {
  return !!errorTabs.value[tabId];
};

const updateTempData = (newData) => {
  const tabName = currentModule.value;
  modifiedEmployeeData.value[tabName] = {
    ...modifiedEmployeeData.value[tabName],
    ...newData,
  };
  hasChanges.value = true;
};

const mergeChanges = () => {
  Object.keys(modifiedEmployeeData.value).forEach((tabName) => {
    if (modifiedEmployeeData.value[tabName]) {
      employeeData.value = {
        ...employeeData.value,
        ...modifiedEmployeeData.value[tabName],
      };
    }
  });
};

async function fetchEmployeeDetails(employeeId) {
  const token = authService.getToken();
  try {
    await currentUserTenant.initialize();
    const tenantIdVal = currentUserTenant.getTenantId();
    if (!token || !tenantIdVal) {
      throw new Error("Authentication required or tenant not found");
    }
    tenantId.value = tenantIdVal;
    const fields = ["id", "assignedUser.first_name"];

    const queryString = fields
      .map((field) => `fields[]=${encodeURIComponent(field)}`)
      .join("&");
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule/${employeeId}?${queryString}`;

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
    return data.data;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
}

// Updated getUserRole function to use currentUserTenant
const getUserRole = async () => {
  try {
    await currentUserTenant.initialize();

    const role = await currentUserTenant.getRoleAsync();

    if (role) {
      userRole.value = role;
    } else {
      console.warn("No role found, defaulting to Employee");
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    userRole.value = "Employee";
  }
};

const fetchUserProfile = async () => {
  const token = authService.getToken();
  try {
    const phone = localStorage.getItem("userPhone");
    const formattedPhone = phone?.startsWith("+91") ? phone : `+91${phone}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          fields: ["assignedUser.role.name"],
          filter: {
            _and: [{ assignedUser: { phone: { _contains: formattedPhone } } }],
          },
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return { role: data.data[0].assignedUser.role?.name || "Employee" };
    }
    return { role: "Employee" };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { role: "Employee" };
  }
};

const cancelForm = () => {
  if (props.isDialog) {
    emit("close");
  } else {
    router.push("/employee-details/employee");
  }
};

// Removed the saveForm function as requested.
// Each tab component will handle its own update logic.

const validateAndRedirectIfNeeded = () => {
  if (!isInitialized.value) return;

  const currentModuleValue = currentModule.value;
  const isValidModule = filteredTabs.value.some(
    (tab) => tab.path === currentModuleValue,
  );

  if (
    userRole.value === "Employee" &&
    currentModuleValue !== "governmentmodule"
  ) {
    if (props.isDialog) {
      router.replace({
        name: "AddEmployeeForm",
        params: { module: "governmentmodule" },
      });
    } else {
      router.replace(`/employee-details/employee/${id.value}/governmentmodule`);
    }
  } else if (!isValidModule && currentModuleValue !== "personalmodule") {
    if (props.isDialog) {
      router.replace({
        name: "AddEmployeeForm",
        params: { module: "personalmodule" },
      });
    } else {
      router.replace(`/employee-details/employee/${id.value}/personalmodule`);
    }
  }
};

onMounted(async () => {
  // Get user role first
  await getUserRole();

  if (id.value) {
    try {
      const data = await fetchEmployeeDetails(id.value);
      employeeData.value = data;
    } catch (error) {
      console.error("Error fetching employee data:", error);
      alert("Failed to load employee data. Please try again.");
    }
  }

  // Mark as initialized after everything is loaded
  await nextTick();
  isInitialized.value = true;

  // Only validate after initialization
  validateAndRedirectIfNeeded();
});

// Watch for route changes, but only validate if initialized
watch(
  () => route.params.module,
  (newModule) => {
    if (isInitialized.value) {
      validateAndRedirectIfNeeded();
    }
  },
);

// Watch for role changes
watch(
  () => userRole.value,
  (newRole) => {
    if (isInitialized.value) {
      validateAndRedirectIfNeeded();
    }
  },
);
</script>

<style scoped>
.employee-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  max-width: 100%;
}

/* Improved Header Styles */
.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.employee-name-container {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: #f5f8ff;
  border: 1px solid #e0e0e0;
}

.employee-name {
  font-weight: 600;
  color: #1976d2;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Rest of the styles remain the same */
.form-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

:deep(.v-list-item--active) {
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}

.has-error {
  color: rgb(var(--v-theme-error));
}

:deep(.v-list-item.has-error:not(.v-list-item--active)) {
  background-color: rgb(var(--v-theme-error), 0.1);
}

.sidebar-title {
  font-weight: 400;
  font-family: sans-serif;
}
@media (max-width: 768px) {
  .sidebar-title {
    display: none;
  }

  .sidebar {
    width: 80px;
  }

  .sidebar-icon {
    margin: auto;
  }
}
</style>
