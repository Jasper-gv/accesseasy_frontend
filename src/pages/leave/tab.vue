<template>
  <v-container fluid>
    <!-- Tabs -->
    <v-tabs
      v-model="activeTab"
      show-arrows
      background-color="transparent"
      class="custom-tabs"
      @update:modelValue="handleTabChange"
    >
      <v-tab
        v-for="tab in visibleTabs"
        :key="tab.value"
        :value="tab.value"
        class="custom-tab"
      >
        <v-icon :icon="tab.icon" class="mr-2"></v-icon>
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <!-- Dynamic Component Loading -->
    <v-window v-model="activeTab">
      <v-window-item
        v-for="tab in visibleTabs"
        :key="tab.value"
        :value="tab.value"
      >
        <v-card flat class="tab-content-wrapper">
          <v-card-text>
            <!-- Main Component -->
            <component
              :is="tab.component"
              v-if="!tab.showAdd && !tab.showEdit"
              @showAddPage="() => (tab.showAdd = true)"
              @showEditPage="(item) => handleShowEdit(tab, item)"
            />

            <!-- Add Component -->
            <component
              :is="tab.addComponent"
              v-if="tab.showAdd"
              @closeAddPage="() => (tab.showAdd = false)"
            />
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import LeaveRequest from "./leaveRequest.vue/table.vue";
import AddLeaveRequest from "./leaveRequest.vue/add.vue";
import LeavePermission from "./leavePermission.vue/leavePermissionTable.vue";
import SpecialRequest from "./specialRequest.vue/table.vue";
import AddSpecialRequest from "./specialRequest.vue/add.vue";
import { currentUserTenant } from "@/utils/currentUserTenant";

const userRole = ref(null);
const tenantId = ref(null);

const tabs = ref([
  {
    value: "leavePermission",
    title: "ALL Request",
    icon: "mdi-account-check",
    component: LeavePermission,
    addComponent: null,
    roles: ["Admin", "Manager", "Dealer", "accessManager", "Employee"],
    showAdd: false,
    showEdit: false,
    editedItem: {},
  },
  {
    value: "leaveRequest",
    title: " My Leave Request",
    icon: "mdi-calendar-clock",
    component: LeaveRequest,
    addComponent: AddLeaveRequest,
    roles: ["Manager", "Employee", "Admin"],
    showAdd: false,
    showEdit: false,
    editedItem: {},
  },
  {
    value: "specialRequest",
    title: "My Special Request",
    icon: "mdi-star-circle",
    component: SpecialRequest,
    addComponent: AddSpecialRequest,
    roles: ["Manager", "Employee", "Admin"],
    showAdd: false,
    showEdit: false,
    editedItem: {},
  },
]);

const activeTab = ref("leaveRequest");

const visibleTabs = computed(() => {
  if (!userRole.value) return [];

  return tabs.value.filter((tab) => {
    if (userRole.value === "Employee") {
      return ["leaveRequest", "specialRequest", "leavePermission"].includes(
        tab.value,
      );
    } else if (userRole.value === "Manager") {
      return ["leaveRequest", "leavePermission", "specialRequest"].includes(
        tab.value,
      );
    } else if (userRole.value === "Dealer") {
      return tab.value === "leavePermission";
    } else if (userRole.value === "Admin") {
      return ["leavePermission", "leaveRequest", "specialRequest"].includes(
        tab.value,
      );
    } else if (userRole.value === "accessManager") {
      return ["leavePermission"].includes(tab.value);
    }
    return false;
  });
});

const handleTabChange = () => {
  tabs.value.forEach((tab) => {
    tab.showAdd = false;
    tab.showEdit = false;
    tab.editedItem = {};
  });
};

const handleShowEdit = (tab, item) => {
  tab.editedItem = item;
  tab.showEdit = true;
};

onMounted(async () => {
  try {
    const userData = await currentUserTenant.fetchLoginUserDetails();
    userRole.value = userData.role?.name || "Employee";
    tenantId.value = userData.tenantId;

    if (userRole.value === "Admin" || userRole.value === "Dealer") {
      activeTab.value = "leavePermission";
    } else {
      activeTab.value = "leaveRequest";
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    userRole.value = "Employee";
    activeTab.value = "leaveRequest";
  }
});
</script>

<style scoped>
.v-container {
  width: 100%;
  padding: 0px;
  margin-right: auto;
  margin-left: auto;
}

.custom-tabs {
  background-color: #e8edff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 8px 10px 0;
}

.custom-tab {
  background-color: white;
  color: #122f68 !important;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  margin-right: 8px;
  min-height: 48px;
  transition: background-color 0.3s ease;
  text-transform: capitalize;
  font-weight: 550;
  font-size: 16px;
  font-family: Lato, sans-serif, Arial;
}

.v-tab--selected.custom-tab {
  background-color: #122f68 !important;
  color: whitesmoke !important;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.custom-tab .v-icon {
  color: #122f68 !important;
  opacity: 0.8;
}

.v-tab--selected .v-icon {
  color: white !important;
  opacity: 1;
}

.tab-content-wrapper {
  border-radius: 0 0 12px 12px;
  background: white;
}

::v-deep(.v-tab.v-btn) {
  height: var(--v-tabs-height);
  border-radius: 10px !important;
  min-width: 90px !important;
}
</style>
