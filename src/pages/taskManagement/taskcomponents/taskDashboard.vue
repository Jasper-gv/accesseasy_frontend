<template>
  <div class="dashboard">
    <!-- Main Content -->
    <div class="main-content">
      <!-- Side by Side Section: Work Orders & Employee Metrics -->
      <div class="content-grid">
        <!-- First Card: Employee Metrics -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Employee Overview</h2>
            <BaseButton
              color="primary"
              @click="navigateTo('/employee-details/employee/add/personal')"
              :text="` Add User`"
              :left-icon="User2Icon"
              size="md"
            />
          </div>

          <div class="card-content">
            <div class="metrics-grid-compact">
              <!-- Total Employees -->
              <div
                class="metric-card-compact"
                @click="navigateTo('/employee-details')"
                @keydown.enter="navigateTo('/employee-details')"
                tabindex="0"
                role="button"
                :aria-label="`${attendanceCounts.total} Total Employees`"
              >
                <div class="metric-icon-compact metric-icon-blue">
                  <i class="fas fa-users" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ attendanceCounts.total }}
                  </div>
                  <div class="metric-label-compact">Total Employees</div>
                </div>
              </div>

              <!-- Present Employees -->
              <div
                class="metric-card-compact"
                @click="navigateTo('/attendanceDeatils/daily?status=present')"
                @keydown.enter="
                  navigateTo('/attendanceDeatils/daily?status=present')
                "
                tabindex="0"
                role="button"
                :aria-label="`${attendanceCounts.present} Present Employees`"
              >
                <div class="metric-icon-compact metric-icon-teal">
                  <i class="fas fa-users" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ attendanceCounts.present }}
                  </div>
                  <div class="metric-label-compact">Present</div>
                </div>
              </div>

              <!-- Absent Employees -->
              <div
                class="metric-card-compact"
                @click="navigateTo('/attendanceDeatils/daily?status=absent')"
                @keydown.enter="
                  navigateTo('/attendanceDeatils/daily?status=absent')
                "
                tabindex="0"
                role="button"
                :aria-label="`${attendanceCounts.absent} Absent Employees`"
              >
                <div class="metric-icon-compact metric-icon-red">
                  <i class="fas fa-user-times" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ absentCount }}
                  </div>
                  <div class="metric-label-compact">Absent</div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="card-subtitle"
            style="font-size: 14px; color: #666; margin-bottom: 15px"
          >
            Attendance for {{ formatDate(currentDate) }}
          </div>
        </div>

        <!-- Second Card: Work Orders (Front and Center) -->
        <div class="content-card featured-card">
          <div class="card-header-workorders">
            <h2 class="card-title">Work Orders</h2>
            <div class="workorder-subtitle">{{ formatMonth(currentDate) }}</div>
            <BaseButton
              color="primary"
              @click="navigateTo('/taskManagement/taskcomponents/workorder')"
              :text="`Add Work Order`"
              size="md"
            />
          </div>
          <div class="card-content">
            <div class="workorders-grid">
              <!-- Active Work Orders -->
              <div
                class="workorder-metric"
                @click="
                  navigateTo(
                    '/taskManagement/taskcomponents/TasksPage?status=inprogress',
                  )
                "
                @keydown.enter="
                  navigateTo(
                    '/taskManagement/taskcomponents/TasksPage?status=inprogress',
                  )
                "
                tabindex="0"
                role="button"
              >
                <div class="workorder-icon workorder-icon-blue">
                  <i class="fas fa-clipboard-list" aria-hidden="true"></i>
                </div>
                <div class="workorder-content">
                  <div class="workorder-number">{{ taskCounts.total }}</div>
                  <div class="workorder-label">Active</div>
                </div>
              </div>

              <!-- Completed Work Orders -->
              <div
                class="workorder-metric"
                @click="
                  navigateTo(
                    '/taskManagement/taskcomponents/TasksPage?status=completed',
                  )
                "
                @keydown.enter="
                  navigateTo(
                    '/taskManagement/taskcomponents/TasksPage?status=completed',
                  )
                "
                tabindex="0"
                role="button"
              >
                <div class="workorder-icon workorder-icon-green">
                  <i class="fas fa-check-circle" aria-hidden="true"></i>
                </div>
                <div class="workorder-content">
                  <div class="workorder-number">{{ taskCounts.completed }}</div>
                  <div class="workorder-label">Completed</div>
                </div>
              </div>

              <!-- Overdue Tasks -->
              <div
                class="workorder-metric"
                @click="
                  navigateTo(
                    '/taskManagement/taskcomponents/TasksPage?status=overdue',
                  )
                "
                @keydown.enter="
                  navigateTo(
                    '/taskManagement/taskcomponents/TasksPage?status=overdue',
                  )
                "
                tabindex="0"
                role="button"
              >
                <div class="workorder-icon workorder-icon-orange">
                  <i class="fas fa-clock" aria-hidden="true"></i>
                </div>
                <div class="workorder-content">
                  <div class="workorder-number">{{ taskCounts.overdue }}</div>
                  <div class="workorder-label">Overdue</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Third Card: Organization Metrics -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Clients&Sites Overview</h2>
            <BaseButton
              color="primary"
              @click="navigateTo('/organization/orgmainui')"
              :text="`Add Clients`"
            />
          </div>
          <div class="card-content">
            <div class="metrics-grid-compact">
              <!-- Total Organizations -->
              <!-- <div
                class="metric-card-compact"
                @click="navigateTo('/organization/orgmainui')"
                @keydown.enter="navigateTo('/organization/orgmainui')"
                tabindex="0"
                role="button"
                :aria-label="`${organizationCounts.total} Total Organizations`"
              >
                <div class="metric-icon-compact metric-icon-blue">
                  <i class="fas fa-building" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ organizationCounts.total }}
                  </div>
                  <div class="metric-label-compact">Total Organizations</div>
                </div>
              </div> -->

              <!-- Tenant Organizations -->
              <!-- <div
                class="metric-card-compact"
                @click="navigateTo('/organization/orgmainui?type=tenantorg')"
                @keydown.enter="
                  navigateTo('/organization/orgmainui?type=tenantorg')
                "
                tabindex="0"
                role="button"
                :aria-label="`${organizationCounts.tenantorg} Tenant Organizations`"
              >
                <div class="metric-icon-compact metric-icon-teal">
                  <i class="fas fa-home" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ organizationCounts.tenantorg }}
                  </div>
                  <div class="metric-label-compact">Tenant Orgs</div>
                </div>
              </div> -->

              <!-- Distributor Organizations -->
              <!-- <div
                class="metric-card-compact"
                @click="
                  navigateTo('/organization/orgmainui?type=distributororg')
                "
                @keydown.enter="
                  navigateTo('/organization/orgmainui?type=distributororg')
                "
                tabindex="0"
                role="button"
                :aria-label="`${organizationCounts.distributororg} Distributor Organizations`"
              >
                <div class="metric-icon-compact metric-icon-orange">
                  <i class="fas fa-truck" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ organizationCounts.distributororg }}
                  </div>
                  <div class="metric-label-compact">Distributor Orgs</div>
                </div>
              </div> -->

              <!-- Client Organizations -->
              <div
                class="metric-card-compact"
                @click="navigateTo('/organization/orgmainui?type=clientorg')"
                @keydown.enter="
                  navigateTo('/organization/orgmainui?type=clientorg')
                "
                tabindex="0"
                role="button"
                :aria-label="`${organizationCounts.clientorg} Client Organizations`"
              >
                <div class="metric-icon-compact metric-icon-green">
                  <i class="fas fa-users" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ organizationCounts.clientorg }}
                  </div>
                  <div class="metric-label-compact">Client Orgs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fourth Card: Location Metrics -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Branch&Department Overview</h2>
            <BaseButton
              color="primary"
              @click="navigateTo('/organization/org_addlocation')"
              :text="` Add Branch & Department`"
            />
          </div>
          <div class="card-content">
            <div class="metrics-grid-compact">
              <!-- Total Locations -->
              <div
                class="metric-card-compact"
                @click="navigateTo('/locationManagement')"
                @keydown.enter="navigateTo('/locationManagement')"
                tabindex="0"
                role="button"
                :aria-label="`${locationCounts.total} Total Locations`"
              >
                <div class="metric-icon-compact metric-icon-blue">
                  <i class="fas fa-map-marked-alt" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ locationCounts.total }}
                  </div>
                  <div class="metric-label-compact">Total Locations</div>
                </div>
              </div>

              <!-- Branch Locations -->
              <div
                class="metric-card-compact"
                @click="navigateTo('/locationManagement?type=branch')"
                @keydown.enter="navigateTo('/locationManagement?type=branch')"
                tabindex="0"
                role="button"
                :aria-label="`${locationCounts.branch} Branch Locations`"
              >
                <div class="metric-icon-compact metric-icon-teal">
                  <i class="fas fa-building" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ locationCounts.branch }}
                  </div>
                  <div class="metric-label-compact">Branch Locations</div>
                </div>
              </div>

              <!-- Serviceable Area Locations -->
              <div
                class="metric-card-compact"
                @click="navigateTo('/locationManagement?type=serviceable_area')"
                @keydown.enter="
                  navigateTo('/locationManagement?type=serviceable_area')
                "
                tabindex="0"
                role="button"
                :aria-label="`${locationCounts.serviceable_area} Serviceable Area Locations`"
              >
                <div class="metric-icon-compact metric-icon-orange">
                  <i class="fas fa-map" aria-hidden="true"></i>
                </div>
                <div class="metric-content-compact">
                  <div class="metric-number-compact">
                    {{ locationCounts.serviceable_area }}
                  </div>
                  <div class="metric-label-compact">Serviceable Areas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Requests Section -->
        <div class="content-card">
          <div class="tab-header">
            <button
              class="tab-btn"
              :class="{ 'tab-btn-active': activeTab === 'leave-requests' }"
              @click="switchTab('leave-requests')"
              :aria-pressed="activeTab === 'leave-requests'"
            >
              Leave Requests
              <span class="tab-count" v-if="leaveRequests.length > 0">
                {{ leaveRequests.length }}
              </span>
            </button>
            <button
              class="tab-btn"
              :class="{ 'tab-btn-active': activeTab === 'reimbursements' }"
              @click="switchTab('reimbursements')"
              :aria-pressed="activeTab === 'reimbursements'"
            >
              Reimbursements
              <span class="tab-count" v-if="reimbursements.length > 0">
                {{ reimbursements.length }}
              </span>
            </button>
          </div>

          <div class="card-content">
            <!-- Leave Requests Tab -->
            <div v-if="activeTab === 'leave-requests'">
              <div class="requests-summary">
                <div class="summary-stat">
                  <span class="stat-number">{{ leaveRequests.length }}</span>
                  <span class="stat-label">Total Requests</span>
                </div>
                <span class="pending-count" v-if="pendingLeaveCount > 0">
                  {{ pendingLeaveCount }} Pending
                </span>
              </div>

              <!-- Loading State -->
              <div v-if="loadingLeaveRequests" class="loading-state">
                <div class="skeleton-item" v-for="i in 3" :key="i">
                  <div class="skeleton-icon"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-line skeleton-line-title"></div>
                    <div class="skeleton-line skeleton-line-subtitle"></div>
                  </div>
                  <div class="skeleton-badge"></div>
                </div>
              </div>

              <!-- Requests List -->
              <div v-else-if="leaveRequests.length > 0" class="items-list">
                <div
                  class="list-item"
                  v-for="request in leaveRequests"
                  :key="request.id"
                  tabindex="0"
                  role="button"
                  :aria-label="`Leave request from ${request.requestedBy?.assignedUser?.first_name || 'Unknown'}`"
                >
                  <div class="item-indicator status-indicator-pending"></div>
                  <div class="item-icon item-icon-blue">
                    <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                  </div>
                  <div class="item-content">
                    <h3 class="item-title">
                      {{
                        request.requestedBy?.assignedUser?.first_name ||
                        "Unknown"
                      }}
                    </h3>
                    <p class="item-subtitle">Leave Request</p>
                  </div>
                  <span
                    class="status-badge"
                    :class="getStatusClass(request.status)"
                  >
                    {{ formatStatus(request.status) }}
                  </span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                </div>
                <h3 class="empty-title">No Leave Requests</h3>
                <p class="empty-description">
                  All caught up! No pending leave requests.
                </p>
              </div>

              <div class="card-footer">
                <button class="view-all-btn" @click="viewAllKPI">
                  View All KPI Reports
                  <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <!-- Reimbursements Tab -->
            <div v-if="activeTab === 'reimbursements'">
              <div class="requests-summary">
                <div class="summary-stat">
                  <span class="stat-number">{{ reimbursements.length }}</span>
                  <span class="stat-label">Total Reimbursements</span>
                </div>
                <span class="pending-count" v-if="reimbursements.length > 0">
                  {{ reimbursements.length }} Submitted
                </span>
              </div>

              <!-- Loading State -->
              <div v-if="loadingReimbursements" class="loading-state">
                <div class="skeleton-item" v-for="i in 3" :key="i">
                  <div class="skeleton-icon"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-line skeleton-line-title"></div>
                    <div class="skeleton-line skeleton-line-subtitle"></div>
                  </div>
                  <div class="skeleton-badge"></div>
                </div>
              </div>

              <!-- Reimbursements List -->
              <div v-else-if="reimbursements.length > 0" class="items-list">
                <div
                  class="list-item"
                  v-for="reimbursement in reimbursements"
                  :key="reimbursement.id"
                  tabindex="0"
                  role="button"
                  :aria-label="`Reimbursement from ${reimbursement.reimbBy?.assignedUser?.first_name || 'Unknown'}`"
                >
                  <div class="item-indicator status-indicator-pending"></div>
                  <div class="item-icon item-icon-green">
                    <i class="fas fa-receipt" aria-hidden="true"></i>
                  </div>
                  <div class="item-content">
                    <h3 class="item-title">
                      {{
                        reimbursement.reimbBy?.assignedUser?.first_name ||
                        "Unknown"
                      }}
                    </h3>
                    <p class="item-subtitle">
                      {{ reimbursement.taskID?.title || "No Title" }} • ${{
                        reimbursement.taskExpense || 0
                      }}
                    </p>
                  </div>
                  <span class="status-badge status-pending">Submitted</span>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-receipt" aria-hidden="true"></i>
                </div>
                <h3 class="empty-title">No Reimbursements</h3>
                <p class="empty-description">
                  No reimbursement requests at the moment.
                </p>
              </div>

              <div class="card-footer">
                <button
                  class="view-all-btn"
                  @click="navigateTo('/reimbursement/reimbursement_card')"
                >
                  View All
                  <i class="fas fa-arrow-right" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- employee kpi sixth card -->
        <div class="content-card">
          <div class="card-header">
            <h2 class="card-title">Employee KPI</h2>
            <div class="kpi-period">
              {{ formatMonthYear(currentDate) }}
            </div>
          </div>
          <div class="card-content">
            <!-- Employee Selection Dropdown -->
            <div class="kpi-selector">
              <label for="employee-select" class="selector-label"
                >Select Employee:</label
              >
              <select
                id="employee-select"
                v-model="selectedEmployeeId"
                class="employee-dropdown"
                @change="fetchEmployeeKPI"
              >
                <option value="" disabled>Select an employee</option>
                <option
                  v-for="employee in employees"
                  :key="employee.id"
                  :value="employee.id"
                >
                  {{ employee.name }} ({{ employee.employeeId }})
                </option>
              </select>
            </div>

            <!-- KPI Metrics -->
            <div
              v-if="selectedEmployeeId && employeeKPI"
              class="kpi-metrics-simple"
            >
              <!-- Task Metrics -->
              <div class="kpi-section">
                <h3 class="kpi-section-title">Task Performance</h3>

                <div class="kpi-row">
                  <div class="kpi-item">
                    <div class="kpi-count kpi-count-completed">
                      {{ employeeKPI.tasks.completed }}
                    </div>
                    <div class="kpi-label">Completed</div>
                  </div>

                  <div class="kpi-item">
                    <div class="kpi-count kpi-count-pending">
                      {{ employeeKPI.tasks.pending }}
                    </div>
                    <div class="kpi-label">Pending</div>
                  </div>

                  <div class="kpi-item">
                    <div class="kpi-count kpi-count-overdue">
                      {{ employeeKPI.tasks.overdue }}
                    </div>
                    <div class="kpi-label">Overdue</div>
                  </div>
                </div>
              </div>

              <!-- Attendance Metrics -->
              <div class="kpi-section">
                <h3 class="kpi-section-title">Attendance</h3>

                <div class="kpi-row">
                  <div class="kpi-item">
                    <div class="kpi-count kpi-count-present">
                      {{ employeeKPI.attendance.present }}
                    </div>
                    <div class="kpi-label">Present</div>
                  </div>

                  <div class="kpi-item">
                    <div class="kpi-count kpi-count-absent">
                      {{ employeeKPI.attendance.absent }}
                    </div>
                    <div class="kpi-label">Absent</div>
                  </div>

                  <div class="kpi-item">
                    <div class="kpi-count kpi-count-total">
                      {{ employeeKPI.attendance.totalDays }}
                    </div>
                    <div class="kpi-label">Total Days</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="!selectedEmployeeId" class="kpi-empty">
              <div class="empty-icon">
                <i class="fas fa-chart-line" aria-hidden="true"></i>
              </div>
              <h3 class="empty-title">Select an Employee</h3>
              <p class="empty-description">
                Choose an employee from the dropdown to view their KPI metrics
                for {{ formatMonthYear(currentDate) }}.
              </p>
            </div>

            <!-- Loading State -->
            <div v-else class="kpi-loading">
              <div class="skeleton-item" v-for="i in 5" :key="i">
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-line-title"></div>
                  <div class="skeleton-line skeleton-line-subtitle"></div>
                </div>
              </div>
            </div>

            <!-- View All Button -->
            <button class="view-all-btn" @click="viewAllKPI">
              View All KPI Reports
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { User, User2Icon } from "lucide-vue-next";

export default {
  name: "Dashboard",
  components: { BaseButton },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      // Configuration
      config: {
        apiBaseUrl: import.meta.env.VITE_API_URL,
        tenantId: null,
        authToken: null,
      },
      // UI State
      activeTab: "leave-requests",
      // Data
      taskCounts: {
        total: 0, // Added for total tasks
        inprogress: 0,
        completed: 0,
        overdue: 0,
        pending: 0,
      },
      attendanceCounts: {
        total: 0,
        present: 0,
        absent: 0,
      },
      organizationCounts: {
        total: 0,
        tenantorg: 0,
        distributororg: 0,
        clientorg: 0,
      },
      locationCounts: {
        total: 0,
        branch: 0,
        serviceable_area: 0,
      },
      leaveRequests: [],
      reimbursements: [],
      // Loading States
      loadingLeaveRequests: true,
      loadingReimbursements: true,
      // Date
      currentDate: new Date(),
      //employee kpi
      employees: [],
      selectedEmployeeId: "",
      employeeKPI: null,
      loadingEmployees: true,
      loadingKPI: false,
    };
  },
  computed: {
    pendingLeaveCount() {
      return this.leaveRequests.filter(
        (request) => request.status === "pending",
      ).length;
    },

    absentCount() {
      // <-- new
      return Math.max(
        0,
        this.attendanceCounts.total - this.attendanceCounts.present,
      );
    },
  },
  async created() {
    try {
      // Step 1: Fetch tenant ID
      this.config.tenantId = await currentUserTenant.getTenantIdAsync();
      // Step 2: Fetch auth token
      this.config.authToken = await authService.getToken();
      await this.fetchEmployees();
      // Step 3: If token is invalid, redirect
      if (!this.config.authToken) {
        this.router.push("/login");
        return;
      }
      // Step 4: Call dashboard data fetch
      await this.fetchDashboardData();
    } catch (error) {
      console.error("Initialization error:", error);
      this.router.push("/login");
    }
  },
  methods: {
    // In methods section of dashboard component
    async viewAllKPI() {
      const logId = Math.random().toString(36).substr(2, 9); // Unique ID for each call
      console.log(`viewAllKPI called [${logId}]:`, {
        employeeId: this.selectedEmployeeId,
        employees: this.employees,
      });
      if (this.selectedEmployeeId) {
        this.router.push({
          path: "/taskManagement/kpi",
          query: { employeeId: this.selectedEmployeeId },
        });
      } else {
        this.router.push("/taskManagement/kpi");
      }
    },
    formatDate(date) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatMonth(date) {
      return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    formatMonthYear(date) {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    navigateTo(route) {
      this.router.push(route);
    },
    getApiHeaders() {
      return {
        Authorization: `Bearer ${this.config.authToken}`,
        "Content-Type": "application/json",
      };
    },
    getCurrentDateParams() {
      const today = this.currentDate;
      return {
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      };
    },
    async fetchDashboardData() {
      await Promise.all([
        this.fetchTaskCounts(),
        this.fetchAttendanceCounts(),
        this.fetchTotalEmployees(),
        this.fetchOrganizationCounts(),
        this.fetchLocationCounts(), // New method
        this.fetchLeaveRequests(),
        this.fetchReimbursements(),
      ]);
    },
    //employee kpi
    async fetchEmployees() {
      try {
        this.loadingEmployees = true;
        const url = `${this.config.apiBaseUrl}/items/personalModule?fields[]=id,employeeId,assignedUser.first_name,assignedUser.last_name&filter[_and][0][assignedUser][tenant][tenantId][_eq]=${this.config.tenantId}&limit=-1`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const data = await response.json();

        this.employees = data.data
          ? data.data.map((employee) => ({
              id: employee.id,
              employeeId: employee.employeeId,
              name: `${employee.assignedUser?.first_name || ""} ${employee.assignedUser?.last_name || ""}`.trim(),
            }))
          : [];

        this.loadingEmployees = false;
      } catch (error) {
        console.error("Error fetching employees:", error);
        this.loadingEmployees = false;
      }
    },

    async fetchEmployeeKPI() {
      console.log(
        "Selected employeeId in fetchEmployeeKPI:",
        this.selectedEmployeeId,
      );
      if (!this.selectedEmployeeId) return;

      try {
        this.loadingKPI = true;

        // Get current month and year
        const currentMonth = this.currentDate.getMonth() + 1;
        const currentYear = this.currentDate.getFullYear();

        // Fetch tasks data for the selected employee and current month/year
        const tasksUrl = `${this.config.apiBaseUrl}/items/tasks?filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][employeeId][id][_eq]=${this.selectedEmployeeId}&filter[_and][0][_and][1][month(from)][_eq]=${currentMonth}&filter[_and][2][year(from)][_eq]=${currentYear}`;
        const tasksResponse = await fetch(tasksUrl, {
          headers: this.getApiHeaders(),
        });
        const tasksData = await tasksResponse.json();
        const tasks = tasksData.data || [];

        // Calculate task metrics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(
          (task) => task.status === "completed",
        ).length;
        const pendingTasks = tasks.filter(
          (task) => task.status === "pending" || task.status === "inprogress",
        ).length;
        const overdueTasks = tasks.filter(
          (task) => task.status === "overdue",
        ).length;

        const completedPercentage =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const pendingPercentage =
          totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
        const overduePercentage =
          totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

        // Fetch attendance data for the selected employee and current month/year
        const attendanceUrl = `${this.config.apiBaseUrl}/items/attendance?filter[_and][0][employeeId][_eq]=${this.selectedEmployeeId}&filter[_and][1][month(date)][_eq]=${currentMonth}&filter[_and][2][year(date)][_eq]=${currentYear}`;
        const attendanceResponse = await fetch(attendanceUrl, {
          headers: this.getApiHeaders(),
        });
        const attendanceData = await attendanceResponse.json();
        const attendanceRecords = attendanceData.data || [];

        // Aggregate attendance for the selected employee
        const attendanceAggregate = {
          present: 0,
          absent: 0,
          other: 0, // for any other statuses
          total: attendanceRecords.length,
        };

        attendanceRecords.forEach((record) => {
          if (record.attendance === "present") {
            attendanceAggregate.present++;
          } else if (record.attendance === "absent") {
            attendanceAggregate.absent++;
          } else {
            attendanceAggregate.other++;
          }
        });

        console.log("Aggregated Attendance for Employee:", {
          employeeId: this.selectedEmployeeId,
          aggregate: attendanceAggregate,
          rawRecords: attendanceRecords,
        });

        const totalDays = new Date(currentYear, currentMonth, 0).getDate();
        const presentDays = attendanceAggregate.present;
        const absentDays = attendanceAggregate.absent;

        const presentPercentage =
          totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        const absentPercentage =
          totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0;

        // Set the KPI data
        this.employeeKPI = {
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
            overdue: overdueTasks,
            completedPercentage,
            pendingPercentage,
            overduePercentage,
          },
          attendance: {
            totalDays,
            present: presentDays,
            absent: absentDays,
            presentPercentage,
            absentPercentage,
            totalRecords: attendanceAggregate.total, // total attendance records found
            otherStatus: attendanceAggregate.other, // any non-present/absent records
          },
        };

        this.loadingKPI = false;
      } catch (error) {
        console.error("Error fetching employee KPI:", error);
        this.loadingKPI = false;
      }
    },

    async fetchTaskCounts() {
      try {
        const { day, month, year } = this.getCurrentDateParams();
        // Fetch total tasks (no status filter)
        const totalUrl = `${this.config.apiBaseUrl}/items/tasks?fields[]=id,title,taskType&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][0][_and][1][month(from)][_eq]=${month}&filter[_and][0][_and][2][year(from)][_eq]=${year}&limit=-1`;
        const totalResponse = await fetch(totalUrl, {
          headers: this.getApiHeaders(),
        });
        const totalData = await totalResponse.json();
        this.taskCounts.total = totalData.data ? totalData.data.length : 0;

        // Fetch tasks by status
        const statuses = ["overdue", "completed", "inprogress", "pending"];
        for (const status of statuses) {
          const url = `${this.config.apiBaseUrl}/items/tasks?fields[]=id,title,taskType&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][0][_and][1][month(from)][_eq]=${month}&filter[_and][0][_and][2][year(from)][_eq]=${year}&filter[_and][3][status][_eq]=${status}&limit=-1`;
          const response = await fetch(url, { headers: this.getApiHeaders() });
          const data = await response.json();
          this.taskCounts[status] = data.data ? data.data.length : 0;
        }
      } catch (error) {
        console.error("Error fetching task counts:", error);
      }
    },
    async fetchAttendanceCounts() {
      try {
        const { day, month, year } = this.getCurrentDateParams();
        const presentUrl = `${this.config.apiBaseUrl}/items/attendance?filter[_and][0][employeeId][assignedUser][tenant][_eq]=${this.config.tenantId}&filter[_and][1][day(date)][_eq]=${day}&filter[_and][2][month(date)][_eq]=${month}&filter[_and][3][year(date)][_eq]=${year}&filter[_and][4][attendance][_eq]=present`;
        const presentResponse = await fetch(presentUrl, {
          headers: this.getApiHeaders(),
        });
        const presentData = await presentResponse.json();
        this.attendanceCounts.present = presentData.data
          ? presentData.data.length
          : 0;

        const absentUrl = `${this.config.apiBaseUrl}/items/attendance?filter[_and][0][employeeId][assignedUser][tenant][_eq]=${this.config.tenantId}&filter[_and][1][day(date)][_eq]=${day}&filter[_and][2][month(date)][_eq]=${month}&filter[_and][3][year(date)][_eq]=${year}&filter[_and][4][attendance][_eq]=absent`;
        const absentResponse = await fetch(absentUrl, {
          headers: this.getApiHeaders(),
        });
        const absentData = await absentResponse.json();
        this.attendanceCounts.absent = absentData.data
          ? presentData.data.length
          : 0;
      } catch (error) {
        console.error("Error fetching attendance counts:", error);
      }
    },
    async fetchTotalEmployees() {
      try {
        const url = `${this.config.apiBaseUrl}/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${this.config.tenantId}&limit=-1`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const data = await response.json();
        this.attendanceCounts.total = data.data ? data.data.length : 0;
      } catch (error) {
        console.error("Error fetching total employees:", error);
      }
    },
    async fetchOrganizationCounts() {
      try {
        const url = `${this.config.apiBaseUrl}/items/organization?filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const orgData = await response.json();
        const organizations = orgData.data || [];
        this.organizationCounts.total = organizations.length;
        this.organizationCounts.tenantorg = organizations.filter(
          (org) => org.orgType.toLowerCase() === "tenantorg",
        ).length;
        this.organizationCounts.distributororg = organizations.filter(
          (org) => org.orgType.toLowerCase() === "distributororg",
        ).length;
        this.organizationCounts.clientorg = organizations.filter(
          (org) => org.orgType.toLowerCase() === "clientorg",
        ).length;
      } catch (error) {
        console.error("Error fetching organization counts:", error);
        this.organizationCounts.total = 0;
        this.organizationCounts.tenantorg = 0;
        this.organizationCounts.distributororg = 0;
        this.organizationCounts.clientorg = 0;
      }
    },
    async fetchLocationCounts() {
      try {
        const url = `${this.config.apiBaseUrl}/items/locationManagement?filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const locData = await response.json();
        const locations = locData.data || [];
        this.locationCounts.total = locations.length;
        this.locationCounts.branch = locations.filter((loc) =>
          loc.locType.toLowerCase().includes("branch"),
        ).length;
        this.locationCounts.serviceable_area = locations.filter((loc) =>
          loc.locType.toLowerCase().includes("serviceable_area"),
        ).length;
      } catch (error) {
        console.error("Error fetching location counts:", error);
        this.locationCounts.total = 0;
        this.locationCounts.branch = 0;
        this.locationCounts.serviceable_area = 0;
      }
    },
    async fetchLeaveRequests() {
      try {
        const { day, month, year } = this.getCurrentDateParams();
        const url = `${this.config.apiBaseUrl}/items/leaveRequest?fields[]=requestedBy.assignedUser.first_name,status&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][status][_eq]=pending&filter[_and][2][day(date_created)][_eq]=${day}&filter[_and][3][year(date_created)][_eq]=${year}&filter[_and][4][month(date_created)][_eq]=${month}&filter[_and][5][requestedBy][assignedUser][organization][_nnull]=true`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const data = await response.json();
        this.leaveRequests = data.data || [];
        this.loadingLeaveRequests = false;
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        this.loadingLeaveRequests = false;
      }
    },
    async fetchReimbursements() {
      try {
        const { day, month, year } = this.getCurrentDateParams();
        const url = `${this.config.apiBaseUrl}/items/expenseReimbursement?fields[]=taskExpense&fields[]=reimbBy.assignedUser.first_name&fields[]=taskID.title&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][day(date_created)][_eq]=${day}&filter[_and][2][month(date_created)][_eq]=${month}&filter[_and][3][year(date_created)][_eq]=${year}&filter[_and][4][status][_eq]=submitted`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const data = await response.json();
        this.reimbursements = data.data || [];
        this.loadingReimbursements = false;
      } catch (error) {
        console.error("Error fetching reimbursements:", error);
        this.loadingReimbursements = false;
      }
    },
    switchTab(tab) {
      this.activeTab = tab;
    },
    getStatusClass(status) {
      const statusMap = {
        completed: "status-completed",
        inprogress: "status-in-progress",
        overdue: "status-overdue",
        pending: "status-pending",
        approved: "status-approved",
      };
      return statusMap[status?.toLowerCase()] || "status-pending";
    },
    getStatusIndicatorClass(status) {
      const statusMap = {
        completed: "status-indicator-completed",
        inprogress: "status-indicator-in-progress",
        overdue: "status-indicator-overdue",
        pending: "status-indicator-pending",
        approved: "status-indicator-approved",
      };
      return statusMap[status?.toLowerCase()] || "status-indicator-pending";
    },
    formatStatus(status) {
      if (!status) return "Unknown";
      return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
    },
  },
};
</script>

<style scoped>
/* Global Styles */
.dashboard {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: #1e293b;
}

/* Main Content */
.main-content {
  padding: 2rem;
  max-width: 100%;
  margin: 0 auto;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 80px);
  box-sizing: border-box;
}

/* Section Styles */
.section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}
/* employee kpi  */
.kpi-period {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-selector {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.selector-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
  font-size: 0.875rem;
}

.employee-dropdown {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #fff;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.employee-dropdown:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.kpi-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.kpi-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.kpi-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.kpi-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 15px;
}

.kpi-metric {
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  position: relative;
}

.kpi-metric:hover {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
}

.kpi-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.kpi-progress {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.kpi-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.kpi-progress-completed {
  background-color: #16a34a; /* Green for completed */
}

.kpi-progress-pending {
  background-color: #f59e0b; /* Amber for pending */
}

.kpi-progress-overdue {
  background-color: #dc2626; /* Red for overdue */
}

.kpi-progress-present {
  background-color: #16a34a; /* Green for present */
}

.kpi-progress-absent {
  background-color: #dc2626; /* Red for absent */
}

.kpi-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  text-align: right;
}

.kpi-empty,
.kpi-loading {
  padding: 40px 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.kpi-empty .empty-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 16px;
}

.kpi-empty .empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.kpi-empty .empty-description {
  font-size: 0.875rem;
  color: #6b7280;
  max-width: 300px;
  margin: 0 auto;
  line-height: 1.5;
}

.kpi-loading {
  gap: 16px;
}

.kpi-loading .skeleton-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  width: 100%;
}

.kpi-loading .skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kpi-loading .skeleton-line {
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.kpi-loading .skeleton-line-title {
  width: 60%;
}

.kpi-loading .skeleton-line-subtitle {
  width: 40%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .kpi-metrics {
    gap: 12px;
  }

  .kpi-metric {
    padding: 12px;
  }

  .kpi-value {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .kpi-metric {
    padding: 10px;
  }

  .kpi-value {
    font-size: 1rem;
  }
}
/* Content Card */
.content-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-workorders {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: right;
}
.workorder-subtitle {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: auto;
  margin-left: 15px;
}
.card-header-workorders {
  display: flex;
  align-items: center;
}
.card-content {
  padding: 1.5rem;
}

.card-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  text-align: center;
}

/* Employee Metrics */
.metrics-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.metric-card-compact {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.metric-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-card-compact:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.metric-icon-compact {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.metric-icon-teal {
  background-color: #ccfbf1;
  color: #0d9488;
}

.metric-icon-red {
  background-color: #fecaca;
  color: #dc2626;
}

.metric-icon-blue {
  background-color: #dbeafe;
  color: #2563eb;
}

.metric-icon-orange {
  background-color: #fed7aa;
  color: #ea580c;
}

.metric-icon-green {
  background-color: #dcfce7;
  color: #16a34a;
}

.metric-number-compact {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.metric-label-compact {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* Add User Button */
.add-user-btn {
  background: #28c457;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.add-user-btn:hover {
  background-color: #122f68;
}

/* Work Orders */
.workorders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.workorder-metric {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.workorder-metric:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

silly.workorder-metric:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.workorder-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.workorder-icon-blue {
  background-color: #dbeafe;
  color: #122f68;
}

.workorder-icon-green {
  background-color: #dcfce7;
  color: #16a34a;
}

.workorder-icon-orange {
  background-color: #fed7aa;
  color: #ea580c;
}

.workorder-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.workorder-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.add-workorder-btn {
  background: #28c457;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-workorder-btn:hover {
  background-color: #122f68;
}

/* Tab Header */
.tab-header {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1.5rem;
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn-active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-count {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.tab-btn-active .tab-count {
  background-color: #dbeafe;
  color: #2563eb;
}

/* Requests Summary */
.requests-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.summary-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.pending-count {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-item:hover {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
}

.list-item:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.item-indicator {
  width: 3px;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 0 2px 2px 0;
}

.status-indicator-pending {
  background-color: #ea580c;
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.item-icon-blue {
  background-color: #dbeafe;
  color: #2563eb;
}

.item-icon-green {
  background-color: #dcfce7;
  color: #16a34a;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid;
}

.status-pending {
  background-color: #fed7aa;
  color: #9a3412;
  border-color: #fdba74;
}

.status-approved {
  background-color: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

/* View All Button */
.view-all-btn {
  background: none;
  border: 1px solid #e2e8f0;
  color: #2563eb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  min-height: 200px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background-color: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 1rem auto;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.skeleton-icon {
  width: 36px;
  height: 36px;
  background-color: #e2e8f0;
  border-radius: 8px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-line-title {
  width: 60%;
}

.skeleton-line-subtitle {
  width: 40%;
}

.skeleton-badge {
  width: 60px;
  height: 24px;
  background-color: #e2e8f0;
  border-radius: 12px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .card-header,
  .card-header-workorders {
    padding: 1rem 1rem 0 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .card-footer {
    padding: 0 1rem 1rem 1rem;
  }

  .tab-header {
    padding: 0 1rem;
  }

  .tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }

  .list-item {
    padding: 0.75rem;
  }

  .item-title {
    font-size: 0.8125rem;
  }

  .item-subtitle {
    font-size: 0.6875rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }

  .metric-card-compact,
  .workorder-metric {
    padding: 0.75rem;
  }

  .metric-number-compact,
  .workorder-number {
    font-size: 1.25rem;
  }

  .empty-state {
    padding: 2rem 0.5rem;
  }
}
</style>
