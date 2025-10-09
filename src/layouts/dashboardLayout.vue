<template>
  <v-alert
    v-if="planStatus.show"
    :type="planStatus.type"
    prominent
    class="plan-alert"
    dismissible
  >
    {{ planStatus.message }}
    <template v-slot:append>
      <v-btn color="white" @click="goToPlans">Renew Plan</v-btn>
    </template>
  </v-alert>

  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="computedRail"
      permanent
      class="modern-sidebar"
      width="240"
      rail-width="72"
      elevation="0"
    >
      <!-- Header Section - Logo with Image -->
      <div class="sidebar-header" v-if="!isSettingsPage">
        <div class="header-content" @click="toggleSidebarState">
          <div class="logo-section">
            <!-- <div class="logo-container">
              <v-img
                src="/images/sa.png"
                alt="Logo"
                width="28"
                height="28"
                class="logo-image"
              />
            </div> -->
            <span v-if="!computedRail && !isSettingsPage" class="app-name"
              >Fieldseasy</span
            >
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="nav-content">
        <v-list class="nav-list" density="compact">
          <!-- Settings Page Menu -->
          <template v-if="isSettingsPage">
            <!-- HOME BUTTON IN SETTINGS -->
            <v-list-item
              @click="goToDashboard"
              class="nav-item main-item home-item"
            >
              <template v-slot:prepend>
                <v-tooltip :disabled="!computedRail" location="right">
                  <template v-slot:activator="{ props }">
                    <div class="icon-wrapper">
                      <v-icon class="nav-icon" v-bind="props" size="24">
                        mdi-home-outline
                      </v-icon>
                    </div>
                  </template>
                  <span>Home</span>
                </v-tooltip>
              </template>
              <v-list-item-title v-if="!computedRail" class="nav-title">
                Home
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              :to="'/settings'"
              class="nav-item main-item"
              :class="{ active: $route.path === '/settings' }"
              @click="handleItemClick('/settings')"
            >
              <template v-slot:prepend>
                <v-tooltip :disabled="!computedRail" location="right">
                  <template v-slot:activator="{ props }">
                    <div class="icon-wrapper">
                      <v-icon
                        class="nav-icon"
                        v-bind="props"
                        size="24"
                        @click.stop="handleIconClick('/settings')"
                      >
                        mdi-cog-outline
                      </v-icon>
                    </div>
                  </template>
                  <span>Settings</span>
                </v-tooltip>
              </template>
              <v-list-item-title v-if="!computedRail" class="nav-title">
                Settings
              </v-list-item-title>
            </v-list-item>

            <!-- Settings Sub Items -->
            <div class="sub-menu-section" v-if="!computedRail">
              <template
                v-for="item in filteredSettingsMenuItems"
                :key="item.title"
              >
                <!-- Settings items without nested sub-items -->
                <v-list-item
                  v-if="!item.subItems || item.subItems.length === 0"
                  :to="item.to"
                  class="nav-item main-item"
                  :class="{ active: $route.path === item.to }"
                  @click="handleItemClick(item.to)"
                  exact
                >
                  <template v-slot:prepend>
                    <v-tooltip
                      :disabled="!computedRail"
                      location="right"
                      open-delay="500"
                    >
                      <template v-slot:activator="{ props }">
                        <div class="icon-wrapper">
                          <v-icon
                            class="nav-icon"
                            v-bind="props"
                            size="24"
                            @click.stop="handleIconClick(item.to)"
                          >
                            {{ item.icon }}
                          </v-icon>
                          <!-- Add lock icon for premium features -->
                          <v-icon
                            v-if="
                              item.requiredFeature &&
                              !availableFeatures.includes(item.requiredFeature)
                            "
                            class="lock-icon"
                            size="16"
                            color="grey"
                          >
                            mdi-lock
                          </v-icon>
                        </div>
                      </template>
                      <span>{{ item.title }}</span>
                    </v-tooltip>
                  </template>
                  <v-list-item-title v-if="!computedRail" class="nav-title">
                    {{ item.title }}
                  </v-list-item-title>
                </v-list-item>

                <!-- Settings items with nested sub-items -->
                <div v-else class="nested-menu-group">
                  <v-list-item
                    class="nav-item sub-item expandable"
                    :class="{
                      active: isSubMenuActive(item),
                      expanded: expandedMenus[item.title] && !computedRail,
                    }"
                    @click="toggleSubMenu(item.title)"
                  >
                    <v-list-item-title class="sub-title">
                      {{ item.title }}
                    </v-list-item-title>
                    <template v-slot:append>
                      <v-icon
                        class="expand-icon"
                        :class="{ rotated: expandedMenus[item.title] }"
                        size="20"
                      >
                        mdi-chevron-right-thick
                      </v-icon>
                    </template>
                  </v-list-item>

                  <!-- Nested Sub Menu Items -->
                  <v-expand-transition>
                    <div
                      v-if="expandedMenus[item.title]"
                      class="nested-sub-menu-section"
                    >
                      <v-list-item
                        v-for="nestedItem in item.subItems"
                        :key="nestedItem.title"
                        :to="nestedItem.to"
                        class="nav-item nested-sub-item"
                        :class="{ active: $route.path === nestedItem.to }"
                        @click="handleSubItemClick(nestedItem)"
                      >
                        <v-list-item-title class="nested-title">
                          {{ nestedItem.title }}
                        </v-list-item-title>
                      </v-list-item>
                    </div>
                  </v-expand-transition>
                </div>
              </template>
            </div>
          </template>

          <!-- Main Menu -->
          <template v-else>
            <template
              v-for="(item, index) in filteredMenuItems"
              :key="item.title"
            >
              <!-- Simple Menu Item (No Sub Items) -->
              <v-list-item
                v-if="!item.subItems || item.subItems.length === 0"
                :to="item.to"
                class="nav-item main-item"
                :class="{ active: $route.path === item.to }"
                @click="handleItemClick(item.to)"
                exact
              >
                <template v-slot:prepend>
                  <v-tooltip
                    :disabled="!computedRail"
                    location="right"
                    open-delay="500"
                  >
                    <template v-slot:activator="{ props }">
                      <div class="icon-wrapper">
                        <v-icon
                          class="nav-icon"
                          v-bind="props"
                          size="24"
                          @click.stop="
                            handleIconClick(item.to, item, null, index)
                          "
                        >
                          {{ item.icon }}
                        </v-icon>
                      </div>
                    </template>
                    <span>{{ item.title }}</span>
                  </v-tooltip>
                </template>
                <v-list-item-title v-if="!computedRail" class="nav-title">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>

              <!-- Menu Item with Sub Items -->
              <div v-else class="menu-group">
                <v-list-item
                  class="nav-item main-item expandable"
                  :class="{
                    expanded: expandedMenus[item.title] && !computedRail,
                  }"
                  @click="handleMainMenuClick(item.title)"
                >
                  <template v-slot:prepend>
                    <v-tooltip
                      :disabled="!computedRail"
                      location="right"
                      open-delay="500"
                    >
                      <template v-slot:activator="{ props }">
                        <div class="icon-wrapper">
                          <v-icon
                            class="nav-icon"
                            v-bind="props"
                            size="24"
                            @click.stop="
                              handleIconClick(null, item, null, index)
                            "
                          >
                            {{ item.icon }}
                          </v-icon>
                        </div>
                      </template>
                      <span>{{ item.title }}</span>
                    </v-tooltip>
                  </template>
                  <v-list-item-title v-if="!computedRail" class="nav-title">
                    {{ item.title }}
                  </v-list-item-title>
                  <template v-slot:append v-if="!computedRail">
                    <v-icon
                      class="expand-icon"
                      :class="{ rotated: expandedMenus[item.title] }"
                      size="16"
                    >
                      mdi-chevron-right
                    </v-icon>
                  </template>
                </v-list-item>

                <!-- Sub Menu Items -->
                <v-expand-transition>
                  <div
                    v-if="expandedMenus[item.title] && !computedRail"
                    class="sub-menu-section"
                  >
                    <v-list-item
                      v-for="subItem in item.subItems"
                      :key="subItem.title"
                      :to="subItem.to"
                      class="nav-item sub-item"
                      :class="{ active: $route.path === subItem.to }"
                      @click="handleSubItemClick(subItem)"
                    >
                      <v-list-item-title class="sub-title">
                        {{ subItem.title }}
                      </v-list-item-title>
                    </v-list-item>
                  </div>
                </v-expand-transition>
              </div>
            </template>
          </template>
        </v-list>
      </div>

      <!-- Bottom Section -->
      <div class="sidebar-bottom">
        <!-- User Profile Section (when expanded) -->
        <div class="user-profile" v-if="!computedRail">
          <div class="profile-content">
            <v-avatar size="40" class="profile-avatar">
              <v-img
                v-if="profileImage"
                :src="profileImage"
                :loading="isLoadingImage"
                alt="Profile"
              />
              <v-icon v-else size="46" color="primary"
                >mdi-account-circle</v-icon
              >
            </v-avatar>
            <div class="profile-info">
              <div class="profile-name">{{ userFullName }}</div>
              <div class="profile-email">
                {{ tenantName || "No organization" }}
              </div>
            </div>
            <v-menu v-model="profileMenu" offset-y>
              <template v-slot:activator="{ props }">
                <v-btn variant="text" size="small" icon v-bind="props">
                  <v-icon size="16">mdi-dots-horizontal</v-icon>
                </v-btn>
              </template>
              <v-card min-width="160" class="profile-menu">
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-account-outline"
                    title="Profile"
                    @click="$router.push('/profile')"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-logout"
                    title="Logout"
                    @click="handleLogout"
                    class="logout-menu-item"
                  />
                </v-list>
              </v-card>
            </v-menu>
          </div>
        </div>

        <!-- Settings and Logout - ONLY SHOW FOR ADMIN ROLE -->
        <v-list
          density="compact"
          class="bottom-nav"
          v-if="!isSettingsPage && showSettingsForRole"
        >
          <v-list-item class="nav-item bottom-item" @click="goToSettings">
            <template v-slot:prepend>
              <v-tooltip
                :disabled="!computedRail"
                location="right"
                open-delay="500"
              >
                <template v-slot:activator="{ props }">
                  <div class="icon-wrapper">
                    <v-icon class="nav-icon" v-bind="props" size="24">
                      mdi-cog-outline
                    </v-icon>
                  </div>
                </template>
                <span>Settings</span>
              </v-tooltip>
            </template>
            <v-list-item-title v-if="!computedRail" class="nav-title">
              Settings
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <!-- Logout Button - Always show -->
        <v-list density="compact" class="bottom-nav" v-if="!isSettingsPage">
          <v-list-item
            class="nav-item bottom-item logout-item"
            @click="handleLogout"
          >
            <template v-slot:prepend>
              <v-tooltip
                :disabled="!computedRail"
                location="right"
                open-delay="500"
              >
                <template v-slot:activator="{ props }">
                  <div class="icon-wrapper">
                    <v-icon
                      class="nav-icon logout-icon"
                      v-bind="props"
                      size="24"
                    >
                      mdi-logout
                    </v-icon>
                  </div>
                </template>
                <span>Logout</span>
              </v-tooltip>
            </template>
            <v-list-item-title v-if="!computedRail" class="nav-title">
              Logout
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-navigation-drawer>

    <!-- Rail Mode Submenu Overlay - HIGHEST Z-INDEX -->
    <v-card
      v-if="computedRail && railSubmenuOpen && currentRailSubmenu"
      class="rail-submenu-overlay"
      :style="railSubmenuStyle"
      elevation="24"
    >
      <v-list density="compact" class="rail-submenu-list">
        <v-list-subheader class="rail-submenu-header">
          {{ currentRailSubmenu.title }}
        </v-list-subheader>
        <v-list-item
          v-for="subItem in currentRailSubmenu.subItems"
          :key="subItem.title"
          class="rail-submenu-item"
          :class="{ active: $route.path === subItem.to }"
          @click="handleRailSubmenuClick(subItem)"
        >
          <v-list-item-title class="rail-submenu-title">
            {{ subItem.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Main Content -->
    <v-main class="main-content">
      <!-- Plan Reminder/Expiration Alert -->

      <!-- Top App Bar - Simplified -->
      <v-app-bar color="white" elevation="0" class="top-bar" height="64">
        <!-- Back or Menu Button -->
        <v-btn
          v-if="isSettingsPage"
          icon
          variant="text"
          @click="goToDashboard"
          class="back-btn"
          size="small"
        >
          <v-icon size="20">mdi-arrow-left</v-icon>
        </v-btn>
        <v-btn
          v-if="isMobile && !isSettingsPage"
          icon
          variant="text"
          @click="toggleSidebarState"
          class="mobile-menu-btn"
          size="small"
        >
          <v-icon size="20">mdi-menu</v-icon>
        </v-btn>

        <!-- Page Title -->
        <v-toolbar-title class="page-title">
          {{ getCurrentPageTitle }}
        </v-toolbar-title>

        <!-- Spacer -->
        <v-spacer />

        <!-- Only Tenant Name Chip -->
        <v-chip
          class="tenant-chip"
          variant="outlined"
          size="small"
          prepend-icon="mdi-office-building"
        >
          {{ tenantName || "No organization" }}
        </v-chip>

        <!-- User Status Chip -->
        <v-chip
          :color="userStatus.color"
          size="small"
          variant="flat"
          class="status-chip"
        >
          {{ userStatus.text }}
        </v-chip>
      </v-app-bar>

      <!-- Page Content -->
      <v-container fluid class="page-container">
        <PremiumOverlay v-if="isLocked" @upgrade="goToPlans" />
        <router-view v-else />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import PremiumOverlay from "@/components/common/upgrade/PremiumUpgrade.vue";

export default {
  name: "CompleteSidebar",
  components: {
    PremiumOverlay,
  },
  setup() {
    const router = useRouter();
    const drawer = ref(true);
    const rail = ref(false);
    const isMobile = ref(false);
    const profileMenu = ref(false);
    const profileImage = ref(null);
    const userFullName = ref("");
    const isLoadingImage = ref(false);
    const userRole = ref("");
    const userStatus = ref({ color: "grey", text: "Unknown" });
    const expandedMenus = ref({});
    const tenantName = ref("");
    const tenantplan = ref(null); // Changed to ref to store API data

    // Rail submenu state
    const railSubmenuOpen = ref(false);
    const currentRailSubmenu = ref(null);
    const railSubmenuStyle = ref({});

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 960;
      if (isMobile.value) {
        rail.value = true;
      } else {
        rail.value = false;
      }
    };

    // Settings menu items - ONLY FOR ADMIN AND DEALER
    const settingsMenuItems = [
      {
        title: "Organization Settings",
        icon: "mdi-domain",
        to: "/settings/organization",
        roles: ["Admin", "Administrator", "Dealer"],
      },
      {
        title: " Configuration",
        icon: "mdi-domain",
        to: "/settings/configuration",
        roles: ["Admin", "Dealer", "Manager"],
      },
      {
        title: "Attendance Policy",
        icon: "mdi-clock-outline",
        to: "/settings/attendancepolicy",
        roles: ["Admin", "Administrator", "Dealer", "Manager"],
      },
      {
        title: "Leave Types",
        icon: "mdi-account-clock",
        to: "/settings/leave-types",
        roles: ["Admin", "Dealer", "Manager"],
      },
      {
        title: "Shifts",
        icon: "mdi-clock-outline",
        to: "/settings/shifts",
        roles: ["Admin", "Dealer", "Manager"],
      },
      {
        title: "Holidays",
        icon: "mdi-calendar-star",
        to: "/settings/holidays",
        roles: ["Admin", "Dealer", "Manager"],
      },

      {
        title: "Payroll Category",
        icon: "mdi-cash-multiple",
        to: "/settings/payrollCatagory",
        roles: ["Admin", "Dealer"],
      },
      {
        title: "Role Configuration",
        icon: "mdi-account-cog",
        to: "/settings/roleConfigurator/roleconfig",
        roles: ["Admin", "Dealer"],
      },
      {
        title: "Subscription & Plans",
        icon: "mdi-credit-card-outline",
        to: "/settings/plans/plans",
        roles: ["Admin"],
      },
    ];

    // Updated menu items - REMOVED Dashboard as main tab, Overview is first
    const menuItems = [
      {
        title: "Overview",
        icon: "mdi-format-list-checkbox",
        to: "/taskManagement/taskcomponents",
        roles: ["Admin"],
        subItems: [],
      },
      {
        title: "Users",
        icon: "mdi-account-group-outline",
        to: "/employee-details/employee",
        roles: ["Admin", "Employee", "Manager", "esslAdmin"],
      },

      {
        title: "Attendance",
        icon: "mdi-calendar-clock-outline",
        roles: ["Admin", "Employee", "Manager"],
        subItems: [
          {
            title: "Live Attendance",
            icon: "mdi-calendar-today",
            to: "/attendanceDeatils/live",
            roles: ["Admin", "Manager"],
          },
          {
            title: "Daily Attendance",
            to: "/attendanceDeatils/daily",
            roles: ["Admin", "Dealer", "Employee", "Manager", "accessManager"],
          },

          {
            title: "Monthly Attendance",
            to: "/attendanceDeatils/dashboard",
            roles: ["Admin", "Dealer", "Manager", "Employee"],
          },
          {
            title: "Regularisation",
            icon: "mdi-calendar-check",
            to: "/regularisation",
            roles: ["Admin", "Employee", "Manager"],
            requiredFeature: "pro",
          },
          {
            title: "All Check In-Outs",
            icon: "mdi-book-open-page-variant-outline",
            to: "/attendanceLog",
            roles: ["Admin", "Employee", "Manager", "Employee"],
          },
        ],
      },

      {
        title: "FieldPro",
        icon: "mdi-clipboard-text-outline",
        to: "/taskManagement/taskcomponents/workorder",
        roles: ["Admin", "Manager", "Employee"],
        requiredFeature: "fieldpro",
      },
      {
        title: "Locate",
        icon: "mdi-file-table-box-outline",
        to: "/locate",
        roles: ["Admin", "Manager"],
      },
      {
        title: "Smart Forms",
        icon: "mdi-form-textbox",
        to: "/taskManagement/taskcomponents/workflow",
        roles: ["Admin"],
      },
      {
        title: "Clients&Orgs",
        icon: "mdi-office-building-outline",
        to: "/organization/locationtab",
        roles: ["Admin"],
      },
      {
        title: "Leaves",
        icon: "mdi-calendar-remove",
        to: "/leave",
        roles: ["Admin", "Employee", "Manager"],
      },
      {
        title: "Expenses",
        icon: "mdi-cash-multiple",
        to: "/reimbursement/reimbursementtab",
        roles: ["Admin", "Employee", "Manager"],
      },

      {
        title: "Payroll",
        icon: "mdi-cash-multiple",
        to: "/payroll",
        roles: ["Admin", "Dealer"],
        requiredFeature: "payrollpro",
        subItems: [
          {
            title: "Run Payroll",
            to: "/payroll/management",
            roles: ["Admin", "Dealer"],
          },
          {
            title: "Additional Pay",
            to: "/payroll/adhoc-payments",
            roles: ["Admin", "Dealer"],
          },
          {
            title: "Advance ",
            to: "/payroll/advance",
            roles: ["Admin", "Dealer"],
          },
          {
            title: "Loan",
            to: "/payroll/loan",
            roles: ["Admin", "Dealer"],
          },
          // {
          //   title: "TDS",
          //   to: "/payroll/tds",
          //   roles: ["Admin", "Dealer", "Employee"],
          // },
        ],
      },

      {
        title: "Reports",
        icon: "mdi-file-table-box-outline",
        to: "/reports",
        roles: ["Admin", "Manager"],
      },

      {
        title: "Import",
        icon: "mdi-file-table-box-outline",
        to: "/import",
        roles: ["Admin", "Manager"],
      },

      {
        title: "Connectors",
        icon: "mdi-source-branch",
        to: "/connectors/connector",
        roles: ["Admin", "Manager"],
        requiredFeature: "crm",
      },
    ];

    const filteredMenuItems = computed(() => {
      const role = userRole.value || "Employee";
      return menuItems
        .map((item) => {
          // Skip items that don't match the user's role
          if (!item.roles.includes(role)) {
            return null;
          }

          // If the item has subItems, filter them based on role
          if (item.subItems && item.subItems.length > 0) {
            const filteredSubItems = item.subItems.filter((subItem) =>
              subItem.roles.includes(role),
            );
            // Return the item with filtered sub-items (even if empty)
            return {
              ...item,
              subItems: filteredSubItems,
            };
          }

          // Return the item as is (no feature filtering)
          return item;
        })
        .filter(Boolean);
    });

    // Filter settings menu items based on role
    const filteredSettingsMenuItems = computed(() => {
      const role = userRole.value || "Employee";
      return settingsMenuItems.filter((item) => item.roles.includes(role));
    });

    // Check if settings should be shown for current role
    const showSettingsForRole = computed(() => {
      const role = userRole.value || "Employee";
      return ["Admin", "Administrator", "Dealer", "Manager"].includes(role);
    });

    const isSettingsPage = computed(() => {
      return router.currentRoute.value.path.startsWith("/settings");
    });

    const computedRail = computed(() => {
      return isSettingsPage.value ? false : rail.value;
    });

    // Updated to use tenantplan from API response
    const availableFeatures = computed(() => {
      return tenantplan.value?.features?.map((f) => f.key.toLowerCase()) || [];
    });

    const currentRoute = computed(() => router.currentRoute.value.path);

    const requiresFeature = (path) => {
      const premiumRoutes = {
        // payrollpro: [
        //   "/payroll",
        //   "/payroll/management",
        //   "/payroll/adhoc-payments",
        //   "/payroll/advance",
        //   "/payroll/tds",
        // ],
        fieldpro: [
          "/taskManagement/taskcomponents/workorder",
          "/taskManagement/taskcomponents/workflow",
        ],
        crm: ["/connectors/connector"],
        // pro: ["/regularisation"],
      };
      for (const [feature, paths] of Object.entries(premiumRoutes)) {
        if (paths.some((p) => path.startsWith(p))) {
          return feature;
        }
      }
      return null;
    };

    const daysLeft = computed(() => {
      if (!tenantplan.value || !tenantplan.value.end_date) return Infinity;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(tenantplan.value.end_date);
      end.setHours(0, 0, 0, 0);
      return Math.floor((end - today) / (1000 * 60 * 60 * 24));
    });

    const planStatus = computed(() => {
      const dl = daysLeft.value;
      if (dl === Infinity) return { show: false };
      if (dl < 0) {
        return {
          show: true,
          type: "error",
          message:
            "Your version is completed. Please buy the plan to continue the service.",
        };
      } else if (dl <= 3) {
        return {
          show: true,
          type: "warning",
          message: `Your plan is expiring in ${dl} day${dl > 1 ? "s" : ""} on ${tenantplan.value.end_date}. Please renew to continue the service.`,
        };
      }
      return { show: false };
    });

    const isLocked = computed(() => {
      if (daysLeft.value < 0) return true;
      if (!tenantplan.value?.features) return false; // don't lock until features are loaded
      const req = requiresFeature(currentRoute.value);
      return req && !availableFeatures.value.includes(req);
    });

    const goToPlans = () => {
      router.push("/settings/plans/plans");
    };

    const isMenuActive = (item) => {
      const currentPath = router.currentRoute.value.path;
      if (item.to && currentPath === item.to) return true;
      if (item.subItems) {
        return item.subItems.some((subItem) => currentPath === subItem.to);
      }
      return false;
    };

    const isSubMenuActive = (item) => {
      const currentPath = router.currentRoute.value.path;
      if (item.to && currentPath === item.to) return true;
      if (item.subItems) {
        return item.subItems.some((subItem) => currentPath === subItem.to);
      }
      return false;
    };

    // Enhanced icon click handler for rail mode
    const handleIconClick = (route, item, action, index) => {
      if (computedRail.value) {
        if (action === "logout") {
          handleLogout();
        } else if (route) {
          router.push(route);
        } else if (item && item.subItems && item.subItems.length > 0) {
          // Show submenu overlay for rail mode
          showRailSubmenu(item, index);
        }
      }
    };

    // Show rail submenu with proper positioning
    const showRailSubmenu = (item, index) => {
      currentRailSubmenu.value = item;
      railSubmenuOpen.value = true;

      // Calculate position based on item index
      const itemHeight = 56; // Height of each nav item in rail mode
      const headerHeight = 80; // Approximate header height
      const topPosition = headerHeight + index * itemHeight + 8;

      // Position the submenu next to the sidebar
      railSubmenuStyle.value = {
        position: "fixed",
        left: "72px",
        top: `${topPosition}px`,
        zIndex: 9999, // MAXIMUM Z-INDEX
        minWidth: "200px",
      };
    };

    // Handle rail submenu click - NAVIGATE WITHOUT OPENING SIDEBAR
    const handleRailSubmenuClick = (subItem) => {
      if (subItem.to) {
        // Close the submenu first
        railSubmenuOpen.value = false;
        currentRailSubmenu.value = null;
        router.push(subItem.to);
      }
    };

    // Close rail submenu when clicking outside
    const closeRailSubmenu = () => {
      railSubmenuOpen.value = false;
      currentRailSubmenu.value = null;
    };

    const handleItemClick = (route) => {
      if (route) {
        router.push(route);
      }
      closeRailSubmenu();
    };

    const handleSubItemClick = (subItem) => {
      if (subItem.to) {
        router.push(subItem.to);
      }
      closeRailSubmenu();
    };

    // MODIFIED: Only toggle sidebar when clicking logo, not menu items
    const handleMainMenuClick = (menuTitle) => {
      if (!computedRail.value) {
        // Normal expanded mode - toggle submenu
        const wasOpen = expandedMenus.value[menuTitle];
        expandedMenus.value = {};
        expandedMenus.value[menuTitle] = !wasOpen;
      }
      // DON'T open sidebar in rail mode - only show popup
    };

    const getCurrentPageTitle = computed(() => {
      const currentRoute = router.currentRoute.value;
      const path = currentRoute.path;

      const routeTitleMap = {
        "/taskManagement/taskcomponents": "Dashboard",
        "/settings": "Settings",
        "/settings/organization": "Settings",
        "/settings/attendancepolicy": "Settings",
        "/settings/payrollCatagory": "Settings",

        "/settings/configuration": "Settings",
        "/settings/holidays": "Settings",
        "/settings/shifts": "Settings",
        "/settings/leave-types": "Settings",
        "/settings/roleConfigurator/roleconfig": "Settings",
        "/taskManagement/taskcomponents/workOrder": "Work Orders",
        "/taskManagement/taskcomponents/workflow": "Workflow",
        "/taskManagement/Map/livetracking": "Live Tracking",
        "/taskManagement/productviews": "Assets",
        "/taskManagement/productviews/deviceManagementScreen": "Asset Types",
        "/organization/orgmainui": "Organizations",
        "/organization/org_location": "Locations",
        "/employee-details/employee": "Employee Details",
        "/leave": "Leave Management",
        "/taskManagement/kpi": "KPI View",
        "taskManagement-overviewtab/livetracking": "Live Tracking",
        "/attendanceDeatils/live": "Live Attendance",
        "/attendanceLog/attendance": "Logs",
        "/attendanceDeatils/daily": "Daily Attendance",
        "/attendanceDeatils/dashboard": "Attendance Dashboard",
        "/attendanceDeatils/roster": "Company Roster",
        "/reimbursement/reimbursement_card": "Reimbursement",
        "/import/importDetails": "Import",
        "/connectors/connector": "Connectors",
        "/attendanceLog/general": "Attendance Logs",
        "/profile": "Profile",
        "/reports/workordergenerate": "Reports",
      };

      if (routeTitleMap[path]) {
        return routeTitleMap[path];
      }

      if (path.startsWith("/settings/")) {
        return "Settings";
      }
      if (path.startsWith("/taskManagement/")) {
        return "Work order";
      }
      if (path.startsWith("/organization/")) {
        return "Organization";
      }
      if (path.startsWith("/employee-details/")) {
        return "Users Details";
      }
      if (path.startsWith("/attendanceDeatils/")) {
        return "Attendance";
      }
      if (path.startsWith("/reimbursement/")) {
        return "Reimbursement";
      }

      const findTitleInMenuItems = (items) => {
        for (const item of items) {
          if (item.to === path) {
            return item.title;
          }
          if (item.subItems) {
            const subTitle = findTitleInMenuItems(item.subItems);
            if (subTitle) return subTitle;
          }
        }
        return null;
      };

      const menuTitle = findTitleInMenuItems([
        ...menuItems,
        ...settingsMenuItems,
      ]);

      if (menuTitle) {
        return menuTitle;
      }

      return "Dashboard";
    });

    // MODIFIED: Only toggle sidebar when clicking logo
    const toggleSidebarState = () => {
      if (isMobile.value) {
        drawer.value = !drawer.value;
      } else {
        if (!isSettingsPage.value) {
          rail.value = !rail.value;
          // Close rail submenu when toggling sidebar
          closeRailSubmenu();
        }
        if (!rail.value) {
          drawer.value = true;
        }
      }
    };

    const toggleMainMenu = (menuTitle) => {
      if (!computedRail.value) {
        const wasOpen = expandedMenus.value[menuTitle];
        expandedMenus.value = {};
        expandedMenus.value[menuTitle] = !wasOpen;
      } else if (isMobile.value) {
        drawer.value = true;
        expandedMenus.value = {};
        expandedMenus.value[menuTitle] = true;
      }
    };

    const toggleSubMenu = (menuTitle) => {
      if (!computedRail.value) {
        expandedMenus.value[menuTitle] = !expandedMenus.value[menuTitle];
      } else if (isMobile.value) {
        drawer.value = true;
        expandedMenus.value[menuTitle] = true;
      }
    };

    const goToDashboard = () => {
      router.push("/taskManagement/taskcomponents");
    };

    const goToSettings = () => {
      router.push("/settings");
    };

    const fetchUserProfile = async () => {
      try {
        const api = axios.create({
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
        });

        const phone = localStorage.getItem("userPhone");
        const formattedPhone = phone?.startsWith("+91") ? phone : `+91${phone}`;

        const response = await api.get("/items/personalModule", {
          params: {
            fields: [
              "assignedUser.first_name",
              "assignedUser.last_name",
              "assignedUser.avatar.id",
              "assignedUser.role.name",
              "assignedUser.tenant.tenantName",
              "assignedUser.tenant.plan", // This is the plan data we need
              "status",
            ],
            filter: {
              assignedUser: {
                _and: [
                  { phone: { _contains: formattedPhone } },
                  { userApp: { _eq: "fieldeasy" } },
                ],
              },
            },
          },
        });

        if (response.data.data?.length) {
          const userData = response.data.data[0];
          userFullName.value = `${userData.assignedUser.first_name} ${
            userData.assignedUser.last_name || ""
          }`;
          userRole.value = userData.assignedUser.role?.name || "";
          userStatus.value = getUserStatus(userData.status);
          tenantName.value =
            userData.assignedUser.tenant?.tenantName ||
            "No organization assigned";

          // Store the tenant plan data from API response
          tenantplan.value = userData.assignedUser.tenant?.plan || null;

          if (userData.assignedUser.avatar?.id) {
            await fetchAuthorizedImage(
              `${import.meta.env.VITE_API_URL}/assets/${userData.assignedUser.avatar.id}`,
            );
          }
        } else {
          userFullName.value = "Guest";
          userRole.value = "Employee";
          userStatus.value = getUserStatus("inactive");
          tenantplan.value = null;
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        userFullName.value = "Guest";
        userRole.value = "Employee";
        userStatus.value = getUserStatus("inactive");
        tenantplan.value = null;
      }
    };

    const fetchAuthorizedImage = async (imageUrl) => {
      isLoadingImage.value = true;
      try {
        const response = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load image");
        const blob = await response.blob();
        profileImage.value = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error loading profile image:", error);
        profileImage.value = null;
      } finally {
        isLoadingImage.value = false;
      }
    };

    const getUserStatus = (status) => {
      switch (status) {
        case "active":
          return { color: "success", text: "Active" };
        case "inactive":
          return { color: "error", text: "Inactive" };
        default:
          return { color: "grey", text: "Unknown" };
      }
    };

    // const handleLogout = () => {
    //   authService.logout();
    //   const phone = localStorage.getItem("userPhone");
    //   if (phone) {
    //     router.push(`/login`);
    //   } else {
    //     router.push("/pin-verification");
    //   }
    // };

    const handleLogout = () => {
      authService.logout();
      router.push("/login");
    };
    const contactAdmin = () => {
      console.log("Contacting admin for role assignment");
    };

    const askLater = () => {
      // Placeholder for ask later functionality
    };

    onMounted(() => {
      fetchUserProfile();
      checkMobile();
      window.addEventListener("resize", checkMobile);

      // Close rail submenu when clicking outside
      document.addEventListener("click", (e) => {
        if (
          railSubmenuOpen.value &&
          !e.target.closest(".rail-submenu-overlay") &&
          !e.target.closest(".nav-item")
        ) {
          closeRailSubmenu();
        }
      });
    });

    onUnmounted(() => {
      window.removeEventListener("resize", checkMobile);
    });

    watch(
      () => router.currentRoute.value,
      () => {
        if (isMobile.value) {
          rail.value = true;
        } else {
          rail.value = false;
        }
        closeRailSubmenu();
      },
      { immediate: true },
    );

    return {
      drawer,
      rail,
      isMobile,
      profileMenu,
      profileImage,
      userFullName,
      isLoadingImage,
      userStatus,
      filteredMenuItems,
      filteredSettingsMenuItems,
      showSettingsForRole,
      getCurrentPageTitle,
      handleLogout,
      expandedMenus,
      toggleSubMenu,
      toggleMainMenu,
      toggleSidebarState,
      isSettingsPage,
      isMenuActive,
      isSubMenuActive,
      goToDashboard,
      goToSettings,
      contactAdmin,
      askLater,
      tenantName,
      handleSubItemClick,
      handleIconClick,
      handleItemClick,
      computedRail,
      railSubmenuOpen,
      currentRailSubmenu,
      railSubmenuStyle,
      handleRailSubmenuClick,
      closeRailSubmenu,
      handleMainMenuClick,
      isLocked,
      goToPlans,
      planStatus,
    };
  },
};
</script>

<style scoped>
.modern-sidebar {
  border-right: 1px solid #e5e7eb !important;
  background: #10192e !important;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
}

.modern-sidebar :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Header Section */
.sidebar-header {
  padding: 16px;
  background: #10192e;
  border-bottom: 1px solid #35486d;
}

.header-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  background: rgb(16, 25, 46);
  color: white;
  transition: background-color 0.2s;
  justify-content: flex-start;
}

.header-content:hover {
  background: rgb(16, 25, 46);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-container {
  width: 36px;
  height: 30px;
  background: rgb(255, 255, 255);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  border-radius: 4px;
}

.app-name {
  font-size: 30px;
  font-weight: 600;
  color: #6b85ba;
  letter-spacing: -0.025em;
  font-style: italic;
}

/* Navigation Content */
.nav-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.nav-list {
  padding: 0;
}

/* Navigation Items - BIGGER ICONS AND BETTER SPACING */
.modern-sidebar :deep(.v-list-item) {
  margin: 3px 0 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  position: relative !important;
  min-height: 48px !important;
  padding: 0 12px !important;
}

/* Icon Wrapper - BIGGER AND BETTER CENTERED */
.icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.modern-sidebar.v-navigation-drawer--rail .icon-wrapper {
  margin-right: 0;
  width: 100%;
  justify-content: center;
  padding: 8px;
}

.modern-sidebar.v-navigation-drawer--rail .icon-wrapper:hover {
  background-color: #dbeafe;
}

.modern-sidebar.v-navigation-drawer--rail :deep(.v-list-item) {
  justify-content: center !important;
  padding: 8px !important;
  min-height: 56px !important;
}

.modern-sidebar.v-navigation-drawer--rail :deep(.v-list-item__prepend) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin: 0 !important;
}

/* Main Item Styles - NO BLUE FOR MAIN TABS */
.modern-sidebar :deep(.main-item) {
  font-weight: 500 !important;
  color: rgb(255, 255, 255) !important;
}

.modern-sidebar :deep(.main-item:hover) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

/* REMOVED: No blue color for main items */
.modern-sidebar :deep(.main-item.active) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.modern-sidebar :deep(.main-item.active .nav-icon) {
  color: #f0f2f6 !important;
}

/* HOME ITEM STYLING */
.modern-sidebar :deep(.home-item) {
  color: #68ade1 !important;
}

.modern-sidebar :deep(.home-item:hover) {
  background-color: #dbeafe !important;
  color: #68ade1 !important;
}

.modern-sidebar :deep(.home-item .nav-icon) {
  color: #68ade1 !important;
}

/* Icon Styles - BLUE ICONS ALWAYS */
.modern-sidebar :deep(.nav-icon) {
  color: #fafbfc;
  transition: all 0.2s ease !important;
}

.modern-sidebar :deep(.main-item:hover .nav-icon) {
  color: #68ade1 !important;
}

/* Title Styles */
.modern-sidebar :deep(.nav-title) {
  font-size: 14px !important;
  line-height: 1.4 !important;
  white-space: nowrap !important;
  text-overflow: ellipsis !important;
  overflow: hidden !important;
  font-weight: 500 !important;
}

/* Sub Menu Styles - BLUE COLORS ONLY FOR SUB ITEMS */
.sub-menu-section {
  margin-left: 32px !important;
  border-left: 1px solid #e5e7eb !important;
  padding-left: 12px !important;
  margin-top: 4px !important;
  margin-bottom: 4px !important;
}

.modern-sidebar :deep(.sub-item) {
  min-height: 40px !important;
  font-weight: 400 !important;
  color: #ffffff !important;
  margin: 1px 0 !important;
  padding-left: 8px !important;
}

.modern-sidebar :deep(.sub-item:hover) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

/* BLUE COLORS ONLY FOR SUB ITEMS WHEN ACTIVE */
.modern-sidebar :deep(.sub-item.active) {
  color: rgb(76, 162, 211) !important;
}

.modern-sidebar :deep(.sub-title) {
  font-size: 13px !important;
  font-weight: 400 !important;
}

/* Nested Sub Menu Styles - BLUE COLORS ONLY */
.nested-sub-menu-section {
  margin-left: 16px !important;
  border-left: 1px solid #f3f4f6 !important;
  padding-left: 8px !important;
  margin-top: 2px !important;
}

.modern-sidebar :deep(.nested-sub-item) {
  min-height: 36px !important;
  font-weight: 400 !important;
  color: #9ca3af !important;
  margin: 1px 0 !important;
  padding-left: 4px !important;
}

.modern-sidebar :deep(.nested-sub-item:hover) {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
}

.modern-sidebar :deep(.nested-sub-item.active) {
  background-color: #dbeafe !important;
  color: #237abd !important;
}

.modern-sidebar :deep(.nested-title) {
  font-size: 12px !important;
  font-weight: 400 !important;
}

/* Expandable Items */
.modern-sidebar :deep(.expandable) {
  cursor: pointer !important;
}

.modern-sidebar :deep(.expand-icon) {
  color: white !important;
  font-weight: bold !important;
  transform: scale(1.1); /* Slightly larger appearance */
  text-shadow:
    0 0 1px white,
    0 0 1px white;
  transition: transform 0.2s ease !important;
}

.modern-sidebar :deep(.expand-icon.rotated) {
  transform: rotate(90deg) !important;
}

/* Rail Submenu Overlay - MAXIMUM Z-INDEX */
.rail-submenu-overlay {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  z-index: 9999 !important;
  min-width: 200px;
}

.rail-submenu-list {
  padding: 8px 0;
}

.rail-submenu-header {
  font-size: 12px;
  font-weight: 600;
  color: rgb(3, 25, 59);
  padding: 8px 16px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rail-submenu-item {
  margin: 1px 8px;
  border-radius: 6px;
  min-height: 36px;
  color: #6b7280;
  cursor: pointer;
}

.rail-submenu-item:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.rail-submenu-item.active {
  background-color: #dbeafe;
  color: #1d4ed8 !important;
}

.rail-submenu-title {
  font-size: 13px;
  font-weight: 400;
}

/* Bottom Section */
.sidebar-bottom {
  padding: 16px;
  background: #10192e;
  border-top: 1px solid #35486d;
}

/* User Profile Section - BIGGER AVATAR */
.user-profile {
  background: #10192e;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-avatar {
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
  color: rgb(255, 255, 255);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-email {
  font-size: 12px;
  color: rgb(255, 255, 255);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-nav {
  padding: 0;
}

.modern-sidebar :deep(.bottom-item) {
  color: rgb(255, 255, 255) !important;
  border-radius: 8px !important;
  min-height: 48px !important;
  margin: 2px 0 !important;
}

.modern-sidebar :deep(.bottom-item:hover) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.modern-sidebar :deep(.logout-item) {
  color: #dc2626 !important;
}

.modern-sidebar :deep(.logout-item:hover) {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
}

.modern-sidebar :deep(.logout-icon) {
  color: #dc2626 !important;
}

/* Rail Mode Adjustments */
.modern-sidebar.v-navigation-drawer--rail :deep(.nav-item) {
  justify-content: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.modern-sidebar.v-navigation-drawer--rail :deep(.sub-menu-section),
.modern-sidebar.v-navigation-drawer--rail :deep(.nested-sub-menu-section) {
  display: none !important;
}

.modern-sidebar.v-navigation-drawer--rail .sidebar-bottom {
  padding: 8px;
}

.modern-sidebar.v-navigation-drawer--rail .user-profile {
  display: none;
}

/* Main Content Styles */
.main-content {
  background-color: #f9fafb;
}

.top-bar {
  padding: 0 24px !important;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e5e7eb !important;
}

.back-btn,
.mobile-menu-btn {
  margin-right: 12px;
}

.page-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #111827 !important;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Header Elements - SIMPLIFIED */
.tenant-chip {
  font-size: 12px !important;
  height: 32px !important;
  border-color: #e5e7eb !important;
  margin-right: 8px !important;
}

.status-chip {
  font-size: 11px !important;
  height: 20px !important;
}

.page-container {
  height: calc(100vh - 64px);
  overflow: hidden;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .page-title {
    font-size: 16px !important;
    max-width: 120px;
  }
  .page-container {
    padding: 16px !important;
  }
}

/* Scrollbar Styling */
.nav-content::-webkit-scrollbar {
  width: 4px;
}

.nav-content::-webkit-scrollbar-track {
  background: transparent;
}

.nav-content::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.nav-content::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

/* Tooltip Styling - SLOWER TOOLTIP */
:deep(.v-tooltip .v-overlay__content) {
  background-color: rgba(0, 0, 0, 0.9) !important;
  color: white !important;
  padding: 6px 8px !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
}

.profile-menu {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #e5e7eb !important;
}

.logout-menu-item {
  color: #dc2626 !important;
}
</style>
