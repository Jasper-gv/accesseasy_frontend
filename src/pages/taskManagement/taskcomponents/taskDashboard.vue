<template>
  <div class="dashboard">
    <!-- Main Content -->
    <div class="main-content">
      <!-- Side by Side Section: Work Orders & Employee Metrics -->
      <div class="content-gri">
        <div class="left-column">
          <!-- Attendance Overview Card -->
          <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <i class="fas fa-calendar-check card-header-icon"></i>
                <h2 class="card-title">Attendance Overview</h2>
              </div>
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
                  <div class="metric-content-compact">
                    <div class="metric-number-compact total">
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
                  :aria-label="`${attendanceCounts.present} Presents`"
                >
                  <div class="metric-content-compact">
                    <div class="metric-number-compact present">
                      {{ attendanceCounts.present }}
                    </div>
                    <div class="metric-label-compact">Presents</div>
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
                  :aria-label="`${attendanceCounts.absent} Absents`"
                >
                  <div class="metric-content-compact">
                    <div class="metric-number-compact absent">
                      {{ attendanceCounts.absent }}
                    </div>
                    <div class="metric-label-compact">Absents</div>
                  </div>
                </div>
              </div>
              <div
                class="card-subtitle"
                style="
                  font-size: 14px;
                  color: #000000;
                  margin-bottom: 15px;
                  padding: 0 1.5rem;
                "
              >
                Today's Attendance {{ formatShortDate(currentDate) }}
              </div>
            </div>
          </div>

          <!-- Quick Creators Card -->
          <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <i class="fas fa-plus-circle card-header-icon"></i>
                <h2 class="card-title">Quick Creators</h2>
              </div>
            </div>
            <div class="card-content">
              <div class="quick-creators">
                <div
                  class="quick-creator"
                  @click="navigateTo('/employee-details/employee/add/personal')"
                  @keydown.enter="
                    navigateTo('/employee-details/employee/add/personal')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="quick-icon green">
                    <i class="fas fa-users" aria-hidden="true"></i>
                  </div>
                  <span>Create Employee</span>
                </div>
                <div
                  class="quick-creator"
                  @click="navigateTo('/configuration/device-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/device-configurator')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="quick-icon green">
                    <i class="fas fa-microchip" aria-hidden="true"></i>
                  </div>
                  <span>Create Device</span>
                </div>
                <div
                  class="quick-creator"
                  @click="navigateTo('/configuration/door-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/door-configurator')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="quick-icon green">
                    <i class="fas fa-door-open" aria-hidden="true"></i>
                  </div>
                  <span>Create Door</span>
                </div>
                <!-- Create Access Level -->
                <div
                  class="quick-creator"
                  @click="navigateTo('/configuration/accesslevel-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/accesslevel-configurator')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="quick-icon green">
                    <i class="fas fa-key" aria-hidden="true"></i>
                  </div>
                  <span>Create Access Level</span>
                </div>

                <!-- <div
                  class="quick-creator"
                  @click="
                    navigateTo('/taskManagement/taskcomponents/workorder')
                  "
                  @keydown.enter="
                    navigateTo('/taskManagement/taskcomponents/workorder')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="quick-icon white">
                    <i class="fas fa-file-alt" aria-hidden="true"></i>
                  </div>
                  <span>Create Workorder</span>
                </div> -->
                <!-- <div
                  class="quick-creator"
                  @click="navigateTo('/organization/orgmainui')"
                  @keydown.enter="navigateTo('/organization/orgmainui')"
                  tabindex="0"
                  role="button"
                >
                  <div class="quick-icon light-blue">
                    <i class="fas fa-handshake" aria-hidden="true"></i>
                  </div>
                  <span>Create Clients</span>
                </div> -->
              </div>
            </div>
          </div>

          <!-- Configurators Card -->
          <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <i class="fas fa-cogs card-header-icon"></i>
                <h2 class="card-title">Configurators</h2>
              </div>
            </div>
            <div class="card-content">
              <div class="configurators">
                <div
                  class="config-item"
                  @click="navigateTo('/configuration/configuration')"
                  @keydown.enter="navigateTo('/configuration/configuration')"
                  tabindex="0"
                  role="button"
                >
                  <div class="config-icon green">
                    <i class="fas fa-sitemap" aria-hidden="true"></i>
                  </div>
                  <span>Organization<br />Configurator</span>
                </div>
                <div
                  class="config-item"
                  @click="navigateToWithName('ShiftSettings')"
                  @keydown.enter="navigateToWithName('ShiftSettings')"
                  tabindex="0"
                  role="button"
                >
                  <div class="config-icon green">
                    <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                  </div>
                  <span>Attendance<br />Configurator</span>
                </div>
                <!-- Device Configurator -->
                <div
                  class="config-item"
                  @click="navigateTo('/configuration/device-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/device-configurator')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="config-icon green">
                    <i class="fas fa-microchip" aria-hidden="true"></i>
                  </div>
                  <span>Device<br />Configurator</span>
                </div>
                <!-- Door Configurator -->
                <div
                  class="config-item"
                  @click="navigateTo('/configuration/door-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/door-configurator')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="config-icon green">
                    <i class="fas fa-door-open" aria-hidden="true"></i>
                  </div>
                  <span>Door<br />Configurator</span>
                </div>

                <!-- Access Level Configurator -->
                <div
                  class="config-item"
                  @click="navigateTo('/configuration/accesslevel-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/accesslevel-configurator')
                  "
                  tabindex="0"
                  role="button"
                >
                  <div class="config-icon green">
                    <i class="fas fa-key" aria-hidden="true"></i>
                  </div>
                  <span>Access Level<br />Configurator</span>
                </div>
                <!-- <div
                  class="config-item"
                  @click="navigateToWithName('expense')"
                  @keydown.enter="navigateToWithName('expense')"
                  tabindex="0"
                  role="button"
                >
                  <div class="config-icon green">
                    <i class="fas fa-wallet" aria-hidden="true"></i>
                  </div>
                  <span>Expense<br />Configurator</span>
                </div> -->
                <!-- <div
                  class="config-item"
                  @click="navigateTo('/payroll-config')"
                  @keydown.enter="navigateTo('/payroll-config')"
                  tabindex="0"
                  role="button"
                >
                  <div class="config-icon green">
                    <i class="fas fa-dollar-sign" aria-hidden="true"></i>
                  </div>
                  <span>Payroll<br />Configurator</span>
                </div> -->
              </div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <!-- Access Level Overview Card -->
          <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <i class="fas fa-key card-header-icon"></i>
                <h2 class="card-title">Access Level Overview</h2>
              </div>
            </div>
            <div class="card-content">
              <div class="workorders-grid">
                <!-- Total Access Levels -->
                <div
                  class="workorder-metric"
                  @click="navigateTo('/configuration/accesslevel-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/accesslevel-configurator')
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${accessLevelCounts.total} Total Access Levels`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number total">
                      {{ accessLevelCounts.total }}
                    </div>
                    <div class="workorder-label">Total Access Levels</div>
                  </div>
                </div>

                <!-- Active Access Levels -->
                <div
                  class="workorder-metric"
                  @click="
                    navigateTo(
                      '/configuration/accesslevel-configurator?status=active'
                    )
                  "
                  @keydown.enter="
                    navigateTo(
                      '/configuration/accesslevel-configurator?status=active'
                    )
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${accessLevelCounts.active} Active Access Levels`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number completed">
                      {{ accessLevelCounts.active }}
                    </div>
                    <div class="workorder-label">Active</div>
                  </div>
                </div>

                <!-- Inactive Access Levels -->
                <div
                  class="workorder-metric"
                  @click="
                    navigateTo(
                      '/configuration/accesslevel-configurator?status=inactive'
                    )
                  "
                  @keydown.enter="
                    navigateTo(
                      '/configuration/accesslevel-configurator?status=inactive'
                    )
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${accessLevelCounts.inactive} Inactive Access Levels`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number absent">
                      {{ accessLevelCounts.inactive }}
                    </div>
                    <div class="workorder-label">Inactive</div>
                  </div>
                </div>
              </div>
              <div
                class="card-subtitle"
                style="
                  font-size: 14px;
                  color: #000000;
                  margin-bottom: 15px;
                  padding: 0 1.5rem;
                "
              >
                Access Levels Status {{ formatShortDate(currentDate) }}
              </div>
            </div>
          </div>
          <!-- Doors Overview Card -->
          <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <i class="fas fa-door-open card-header-icon"></i>
                <h2 class="card-title">Doors Overview</h2>
              </div>
            </div>

            <div class="card-content">
              <div class="workorders-grid">
                <!-- Total Doors -->
                <div
                  class="workorder-metric"
                  @click="navigateTo('/configuration/door-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/door-configurator')
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${doorCounts.total} Total Doors`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number total">
                      {{ doorCounts.total }}
                    </div>
                    <div class="workorder-label">Total Doors</div>
                  </div>
                </div>

                <!-- Assigned Doors -->
                <div
                  class="workorder-metric"
                  @click="
                    navigateTo('/configuration/door-configurator?assigned=true')
                  "
                  @keydown.enter="
                    navigateTo('/configuration/door-configurator?assigned=true')
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${doorCounts.assigned} Assigned Doors`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number completed">
                      {{ doorCounts.assigned }}
                    </div>
                    <div class="workorder-label">Assigned</div>
                  </div>
                </div>

                <!-- Un-assigned Doors -->
                <div
                  class="workorder-metric"
                  @click="
                    navigateTo(
                      '/configuration/door-configurator?assigned=false'
                    )
                  "
                  @keydown.enter="
                    navigateTo(
                      '/configuration/door-configurator?assigned=false'
                    )
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${doorCounts.unassigned} Un-assigned Doors`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number absent">
                      {{ doorCounts.unassigned }}
                    </div>
                    <div class="workorder-label">Un-assigned</div>
                  </div>
                </div>
              </div>

              <div
                class="card-subtitle"
                style="
                  font-size: 14px;
                  color: #000000;
                  margin-bottom: 15px;
                  padding: 0 1.5rem;
                "
              >
                Doors Status {{ formatShortDate(currentDate) }}
              </div>
            </div>
          </div>
          <!-- Controller Overview Card -->
          <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <i class="fas fa-microchip card-header-icon"></i>
                <h2 class="card-title">Controller Overview</h2>
              </div>
            </div>

            <div class="card-content">
              <div class="workorders-grid">
                <!-- Total Controllers -->
                <div
                  class="workorder-metric"
                  @click="navigateTo('/configuration/controller-configurator')"
                  @keydown.enter="
                    navigateTo('/configuration/controller-configurator')
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${controllerCounts.total} Total Controllers`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number total">
                      {{ controllerCounts.total }}
                    </div>
                    <div class="workorder-label">Total Controllers</div>
                  </div>
                </div>

                <!-- Connected Controllers -->
                <div
                  class="workorder-metric"
                  @click="
                    navigateTo(
                      '/configuration/controller-configurator?status=connected'
                    )
                  "
                  @keydown.enter="
                    navigateTo(
                      '/configuration/controller-configurator?status=connected'
                    )
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${controllerCounts.connected} Connected Controllers`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number completed">
                      {{ controllerCounts.connected }}
                    </div>
                    <div class="workorder-label">Connected</div>
                  </div>
                </div>

                <!-- Waiting Controllers -->
                <div
                  class="workorder-metric"
                  @click="
                    navigateTo(
                      '/configuration/controller-configurator?status=waiting'
                    )
                  "
                  @keydown.enter="
                    navigateTo(
                      '/configuration/controller-configurator?status=waiting'
                    )
                  "
                  tabindex="0"
                  role="button"
                  :aria-label="`${controllerCounts.waiting} Waiting Controllers`"
                >
                  <div class="workorder-content">
                    <div class="workorder-number absent">
                      {{ controllerCounts.waiting }}
                    </div>
                    <div class="workorder-label">Waiting</div>
                  </div>
                </div>
              </div>

              <div
                class="card-subtitle"
                style="
                  font-size: 14px;
                  color: #000000;
                  margin-bottom: 15px;
                  padding: 0 1.5rem;
                "
              >
                Controllers Status {{ formatShortDate(currentDate) }}
              </div>
            </div>
          </div>

          <!-- Today's Overview Card - Commented Out -->
          <!--
          <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <h2 class="card-title">Today's Overview</h2>
              </div>
              <BaseButton
                variant="primary"
                @click="navigateToTabView"
                :text="`View all ${activeTab === 'leave' ? 'leaves' : 'Expense'}`"
                size="sm"
              />
            </div>
            <div class="card-content">
              <div class="tab-navigation">
                <button
                  class="tab-button"
                  :class="{ active: activeTab === 'leave' }"
                  @click="switchTab('leave')"
                  @keydown.enter="switchTab('leave')"
                  tabindex="0"
                  role="button"
                >
                  Leave Requests
                  <span class="tab-count">{{ leaveRequests.length }}</span>
                </button>
                <button
                  class="tab-button"
                  :class="{ active: activeTab === 'reimbursement' }"
                  @click="switchTab('reimbursement')"
                  @keydown.enter="switchTab('reimbursement')"
                  tabindex="0"
                  role="button"
                >
                  Expense
                  <span class="tab-count">{{ reimbursements.length }}</span>
                </button>
              </div>

              <div v-if="loadingOverview" class="loading-state">
                <div class="skeleton-table">
                  <div class="skeleton-row">
                    <div class="skeleton-cell wide"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                  </div>
                  <div class="skeleton-row">
                    <div class="skeleton-cell wide"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                  </div>
                </div>
              </div>

              <div v-else>
                <div v-if="activeTab === 'leave'">
                  <div v-if="leaveRequests.length > 0" class="requests-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Emp Name</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="request in leaveRequests.slice(0, 3)"
                          :key="request.id"
                        >
                          <td>
                            <span class="status-dot pending"></span>
                          </td>
                          <td>{{ formatShortDate(new Date(request.date)) }}</td>
                          <td>{{ request.empName }}</td>
                          <td>{{ request.type }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="table-navigation">
                      <span>&laquo;&laquo;</span>
                      <span>&raquo;&raquo;</span>
                    </div>
                  </div>

                  <div v-else class="empty-state">
                    <div class="empty-icon">
                      <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                    </div>
                    <h3 class="empty-title">No Leave Requests</h3>
                    <p class="empty-description">
                      All caught up! No pending leave requests.
                    </p>
                  </div>
                </div>

                <div v-if="activeTab === 'reimbursement'">
                  <div v-if="reimbursements.length > 0" class="requests-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Emp Name</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="request in reimbursements.slice(0, 3)"
                          :key="request.id"
                        >
                          <td>
                            <span class="status-dot pending"></span>
                          </td>
                          <td>{{ formatShortDate(new Date(request.date)) }}</td>
                          <td>{{ request.empName }}</td>
                          <td>{{ request.type }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="table-navigation">
                      <span>&laquo;&laquo;</span>
                      <span>&raquo;&raquo;</span>
                    </div>
                  </div>

                  <div v-else class="empty-state">
                    <div class="empty-icon">
                      <i class="fas fa-wallet" aria-hidden="true"></i>
                    </div>
                    <h3 class="empty-title">No Reimbursements</h3>
                    <p class="empty-description">
                      All caught up! No pending reimbursements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          -->

          <!-- <div class="content-card">
            <div class="card-header">
              <div class="card-header-left">
                <h2 class="card-title">Employee KPI</h2>
              </div>
              <div class="kpi-period">{{ formatMonthYear(currentDate) }}</div>
            </div>
            <div class="card-content">
              <div v-if="loadingKPI" class="kpi-loading">
                <div class="skeleton-table">
                  <div class="skeleton-row" v-for="n in 5" :key="n">
                    <div class="skeleton-cell wide"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                    <div class="skeleton-cell"></div>
                  </div>
                </div>
              </div>

              <div
                v-else-if="employeeKPIs.length > 0"
                class="kpi-table-container"
              >
                <table class="kpi-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Workdone</th>
                      <th>No. of Presents</th>
                      <th>Absents</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="emp in employeeKPIs.slice(0, 3)" :key="emp.id">
                      <td>{{ emp.name }}</td>
                      <td>{{ emp.workDone }}</td>
                      <td>{{ emp.presents }}</td>
                      <td>{{ emp.absents }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-chart-line" aria-hidden="true"></i>
                </div>
                <h3 class="empty-title">No Employee Data</h3>
                <p class="empty-description">
                  No KPI data available for {{ formatMonthYear(currentDate) }}.
                </p>
              </div>

              <button class="view-all-btn" @click="viewAllKPI">
                View All KPI Reports
                <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          </div> -->
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
import { onMounted } from "vue";

export default {
  name: "Dashboard",
  components: { BaseButton },
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      config: {
        apiBaseUrl: import.meta.env.VITE_API_URL,
        tenantId: null,
        authToken: null,
      },
      taskCounts: {
        total: 0,
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
        contact: 0,
      },
      locationCounts: {
        total: 0,
        branch: 0,
        serviceable_area: 0,
        site: 0,
      },
      accessLevelCounts: {
        total: 0,
        active: 0,
        inactive: 0,
      },
      doorCounts: {
        total: 0,
        assigned: 0,
        unassigned: 0,
      },
      controllerCounts: {
        total: 0,
        connected: 0,
        waiting: 0,
      },
      leaveRequests: [],
      reimbursements: [],

      loadingOverview: true,
      currentDate: new Date(),
      employees: [],
      employeeKPIs: [],
      loadingEmployees: true,
      loadingKPI: false,
      activeTab: "leave",
    };
  },
  async created() {
    try {
      this.config.tenantId = await currentUserTenant.getTenantIdAsync();
      this.config.authToken = authService.getToken();
      await this.fetchEmployees();
      if (!this.config.authToken) {
        this.router.push("/login");
        return;
      }
      await this.fetchDashboardData();
      await this.fetchEmployeeKPIs();
    } catch (error) {
      console.error("Initialization error:", error);
      this.router.push("/login");
    }
  },
  methods: {
    switchTab(tabName) {
      this.activeTab = tabName;
      // Optional: You can also navigate immediately when tab is clicked
      // this.navigateToTabView();
    },

    navigateToTabView() {
      if (this.activeTab === "leave") {
        this.navigateTo("/leave/leavePermission");
      } else if (this.activeTab === "reimbursement") {
        this.navigateTo("/reimbursement/reimbursementtab/reimbursement_card"); // Make sure this route exists
      }
    },
    async viewAllKPI() {
      const logId = Math.random().toString(36).substr(2, 9);
      console.log(`viewAllKPI called [${logId}]:`, {
        employees: this.employees,
      });
      this.router.push("/taskManagement/kpi");
    },
    formatDate(date) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatShortDate(date) {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
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
    navigateToWithName(routeName) {
      this.router.push({ name: routeName });
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
        this.fetchOrganizationCounts(),
        this.fetchLocationCounts(),
        this.fetchLeaveRequests(),
        this.fetchReimbursements(),
        this.fetchAccessLevelCounts(),
        this.fetchDoorCounts(),
        this.fetchControllerCounts(),
      ]);
      this.loadingOverview = false;
    },
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
        this.attendanceCounts.total = data.data ? data.data.length : 0;

        this.loadingEmployees = false;
      } catch (error) {
        console.error("Error fetching employees:", error);
        this.loadingEmployees = false;
      }
    },
    async fetchEmployeeKPIs() {
      if (this.employees.length === 0) return;

      try {
        this.loadingKPI = true;

        const currentMonth = this.currentDate.getMonth() + 1;
        const currentYear = this.currentDate.getFullYear();

        // Fetch all tasks for the month
        const tasksUrl = `${this.config.apiBaseUrl}/items/tasks?fields[]=id,status,employeeId.id&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][month(from)][_eq]=${currentMonth}&filter[_and][2][year(from)][_eq]=${currentYear}&limit=-1`;
        const tasksResponse = await fetch(tasksUrl, {
          headers: this.getApiHeaders(),
        });
        const tasksData = await tasksResponse.json();
        const tasks = tasksData.data || [];

        // Group tasks by employee
        const taskMap = {};
        tasks.forEach((task) => {
          const empId = task.employeeId?.id;
          if (!taskMap[empId]) {
            taskMap[empId] = { total: 0, completed: 0, pending: 0, overdue: 0 };
          }
          taskMap[empId].total++;
          if (task.status === "completed") taskMap[empId].completed++;
          else if (task.status === "pending" || task.status === "inprogress")
            taskMap[empId].pending++;
          else if (task.status === "overdue") taskMap[empId].overdue++;
        });

        // Fetch all attendance for the month
        const attendanceUrl = `${this.config.apiBaseUrl}/items/attendance?fields[]=employeeId,attendance&filter[_and][0][employeeId][assignedUser][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][month(date)][_eq]=${currentMonth}&filter[_and][2][year(date)][_eq]=${currentYear}&limit=-1`;
        const attendanceResponse = await fetch(attendanceUrl, {
          headers: this.getApiHeaders(),
        });
        const attendanceData = await attendanceResponse.json();
        const attendanceRecords = attendanceData.data || [];

        // Group attendance by employee
        const attendanceMap = {};
        attendanceRecords.forEach((record) => {
          const empId = record.employeeId;
          if (!attendanceMap[empId]) {
            attendanceMap[empId] = { present: 0, absent: 0 };
          }
          if (record.attendance === "present") attendanceMap[empId].present++;
          else if (record.attendance === "absent")
            attendanceMap[empId].absent++;
        });

        // Combine for each employee
        this.employeeKPIs = this.employees.map((emp) => {
          const taskData = taskMap[emp.id] || { total: 0 };
          const attData = attendanceMap[emp.id] || { present: 0, absent: 0 };
          return {
            id: emp.id,
            name: emp.name,
            workDone: taskData.total,
            presents: attData.present,
            absents: attData.absent,
          };
        });

        this.loadingKPI = false;
      } catch (error) {
        console.error("Error fetching employee KPIs:", error);
        this.loadingKPI = false;
      }
    },
    async fetchTaskCounts() {
      try {
        const { day, month, year } = this.getCurrentDateParams();
        const totalUrl = `${this.config.apiBaseUrl}/items/tasks?fields[]=id,title,taskType&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][day(from)][_eq]=${day}&filter[_and][2][month(from)][_eq]=${month}&filter[_and][3][year(from)][_eq]=${year}&limit=-1`;
        const totalResponse = await fetch(totalUrl, {
          headers: this.getApiHeaders(),
        });
        const totalData = await totalResponse.json();
        this.taskCounts.total = totalData.data ? totalData.data.length : 0;

        const statuses = ["overdue", "completed", "inprogress", "pending"];
        for (const status of statuses) {
          const url = `${this.config.apiBaseUrl}/items/tasks?fields[]=id,title,taskType&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][day(from)][_eq]=${day}&filter[_and][2][month(from)][_eq]=${month}&filter[_and][3][year(from)][_eq]=${year}&filter[_and][4][status][_eq]=${status}&limit=-1`;
          const response = await fetch(url, { headers: this.getApiHeaders() });
          const data = await response.json();
          this.taskCounts[status] = data.data ? data.data.length : 0;
        }
      } catch (error) {
        console.error("Error fetching task counts:", error);
      }
    },
    async fetchAccessLevelCounts() {
      try {
        const baseUrl = `${this.config.apiBaseUrl}/items/accesslevels`;
        const tenantFilter = `filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}`;

        // Total Access Levels
        const totalUrl = `${baseUrl}?${tenantFilter}&limit=-1`;
        const totalResponse = await fetch(totalUrl, {
          headers: this.getApiHeaders(),
        });
        const totalData = await totalResponse.json();
        this.accessLevelCounts.total = totalData.data
          ? totalData.data.length
          : 0;

        // Active Access Levels (accessType === true)
        const activeUrl = `${baseUrl}?${tenantFilter}&filter[_and][1][accessType][_eq]=true&limit=-1`;
        const activeResponse = await fetch(activeUrl, {
          headers: this.getApiHeaders(),
        });
        const activeData = await activeResponse.json();
        this.accessLevelCounts.active = activeData.data
          ? activeData.data.length
          : 0;

        // Inactive Access Levels (accessType === false or null)
        const inactiveUrl = `${baseUrl}?${tenantFilter}&filter[_and][1][accessType][_null]=true&limit=-1`;
        const inactiveResponse = await fetch(inactiveUrl, {
          headers: this.getApiHeaders(),
        });
        const inactiveData = await inactiveResponse.json();
        const nullCount = inactiveData.data ? inactiveData.data.length : 0;

        const falseUrl = `${baseUrl}?${tenantFilter}&filter[_and][1][accessType][_eq]=false&limit=-1`;
        const falseResponse = await fetch(falseUrl, {
          headers: this.getApiHeaders(),
        });
        const falseData = await falseResponse.json();
        const falseCount = falseData.data ? falseData.data.length : 0;

        this.accessLevelCounts.inactive = nullCount + falseCount;
      } catch (error) {
        console.error("Error fetching access level counts:", error);
        this.accessLevelCounts.total = 0;
        this.accessLevelCounts.active = 0;
        this.accessLevelCounts.inactive = 0;
      }
    },
    async fetchDoorCounts() {
      try {
        const tenantId = this.config.tenantId;
        const base = `${this.config.apiBaseUrl}/items/doors`;
        const filter = `filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;

        // 1. Total doors
        const totalResp = await fetch(`${base}?${filter}&limit=-1`, {
          headers: this.getApiHeaders(),
        });
        const totalData = await totalResp.json();
        const doors = totalData.data || [];

        this.doorCounts.total = doors.length;

        // 2. Assigned = doorsConfigure !== null
        //    Unassigned = the rest
        const assigned = doors.filter((d) => d.doorsConfigure !== null);
        this.doorCounts.assigned = assigned.length;
        this.doorCounts.unassigned =
          this.doorCounts.total - this.doorCounts.assigned;
      } catch (err) {
        console.error("Error fetching door counts:", err);
        this.doorCounts.total =
          this.doorCounts.assigned =
          this.doorCounts.unassigned =
            0;
      }
    },
    async fetchControllerCounts() {
      try {
        const tenantId = this.config.tenantId;
        const base = `${this.config.apiBaseUrl}/items/controllers`;
        const filter = `filter[_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id,controllerStatus`;

        const resp = await fetch(`${base}?${filter}&limit=-1`, {
          headers: this.getApiHeaders(),
        });
        const { data = [] } = await resp.json();

        this.controllerCounts.total = data.length;

        const waiting = data.filter((c) => c.controllerStatus === "waiting");
        this.controllerCounts.waiting = waiting.length;
        this.controllerCounts.connected =
          this.controllerCounts.total - this.controllerCounts.waiting;
      } catch (err) {
        console.error("Error fetching controller counts:", err);
        this.controllerCounts.total =
          this.controllerCounts.connected =
          this.controllerCounts.waiting =
            0;
      }
    },
    async fetchAttendanceCounts() {
      try {
        const { day, month, year } = this.getCurrentDateParams();
        const presentUrl = `${this.config.apiBaseUrl}/items/attendance?filter[_and][0][employeeId][assignedUser][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][day(date)][_eq]=${day}&filter[_and][2][month(date)][_eq]=${month}&filter[_and][3][year(date)][_eq]=${year}&filter[_and][4][attendance][_eq]=present`;
        const presentResponse = await fetch(presentUrl, {
          headers: this.getApiHeaders(),
        });
        const presentData = await presentResponse.json();
        this.attendanceCounts.present = presentData.data
          ? presentData.data.length
          : 0;
        this.attendanceCounts.absent = Math.max(
          0,
          this.attendanceCounts.total - this.attendanceCounts.present
        );
      } catch (error) {
        console.error("Error fetching attendance counts:", error);
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
          (org) => org.orgType.toLowerCase() === "tenantorg"
        ).length;
        this.organizationCounts.distributororg = organizations.filter(
          (org) => org.orgType.toLowerCase() === "distributororg"
        ).length;
        this.organizationCounts.clientorg = organizations.filter(
          (org) => org.orgType.toLowerCase() === "clientorg"
        ).length;
        this.organizationCounts.contact = organizations.filter(
          (org) => org.orgType.toLowerCase() === "contact"
        ).length;
      } catch (error) {
        console.error("Error fetching organization counts:", error);
        this.organizationCounts.total = 0;
        this.organizationCounts.tenantorg = 0;
        this.organizationCounts.distributororg = 0;
        this.organizationCounts.clientorg = 0;
        this.organizationCounts.contact = 0;
      }
    },
    async fetchLocationCounts() {
      try {
        // Fetch counts for each type in separate API calls (or combine if your API supports it)
        const baseUrl = `${this.config.apiBaseUrl}/items/locationManagement?filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}`;

        // Total count (already filtered by tenant)
        const totalResponse = await fetch(baseUrl, {
          headers: this.getApiHeaders(),
        });
        const totalData = await totalResponse.json();
        this.locationCounts.total = totalData.data?.length || 0;

        // Branch count (filter by tenant and locType)
        const branchResponse = await fetch(
          `${baseUrl}&filter[_and][1][locType][_eq]=branch`,
          { headers: this.getApiHeaders() }
        );
        const branchData = await branchResponse.json();
        this.locationCounts.branch = branchData.data?.length || 0;

        // Serviceable area count
        const serviceableAreaResponse = await fetch(
          `${baseUrl}&filter[_and][1][locType][_eq]=serviceable_area`,
          { headers: this.getApiHeaders() }
        );
        const serviceableAreaData = await serviceableAreaResponse.json();
        this.locationCounts.serviceable_area =
          serviceableAreaData.data?.length || 0;

        // Site count
        const siteResponse = await fetch(
          `${baseUrl}&filter[_and][1][locType][_null]=true`,
          { headers: this.getApiHeaders() }
        );
        const siteData = await siteResponse.json();
        this.locationCounts.site = siteData.data?.length || 0;
      } catch (error) {
        console.error("Error fetching location counts:", error);
        this.locationCounts.total = 0;
        this.locationCounts.branch = 0;
        this.locationCounts.serviceable_area = 0;
        this.locationCounts.site = 0;
      }
    },
    async fetchLeaveRequests() {
      try {
        const url = `${this.config.apiBaseUrl}/items/leaveRequest?fields[]=id,fromDate,leaveType,status,requestedBy.assignedUser.first_name,requestedBy.assignedUser.last_name&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][status][_eq]=pending&limit=10`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const data = await response.json();
        this.leaveRequests = (data.data || []).map((r) => ({
          id: r.id,
          date: r.fromDate,
          type: r.leaveType || "Unknown",
          status: r.status,
          empName:
            `${r.requestedBy?.assignedUser?.first_name || ""} ${r.requestedBy?.assignedUser?.last_name || ""}`.trim() ||
            "Unknown",
        }));
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    },
    async fetchReimbursements() {
      try {
        const url = `${this.config.apiBaseUrl}/items/expenseReimbursement?fields[]=id,fromDate,status,reimbBy.assignedUser.first_name,taskID.title&filter[_and][0][tenant][tenantId][_eq]=${this.config.tenantId}&filter[_and][1][status][_eq]=submitted&limit=10`;
        const response = await fetch(url, { headers: this.getApiHeaders() });
        const data = await response.json();
        this.reimbursements = (data.data || []).map((r) => ({
          id: r.id,
          date: r.fromDate,
          type: r.reimbType || r.taskID?.title || "Unknown",
          status: r.status,
          empName:
            `${r.reimbBy?.assignedUser?.first_name || ""} ${r.reimbBy?.assignedUser?.last_name || ""}`.trim() ||
            "Unknown",
        }));
      } catch (error) {
        console.error("Error fetching reimbursements:", error);
      }
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
  mounted() {
    this.fetchDashboardData();
  },
};
</script>

<style scoped>
/* Global Styles */
.quick-icon.green {
  background-color: #f443368a;
  color: #f44336;
  border: 1px solid #f44336;
}
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
.content-gri {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Card Styles - Green Accents */
.content-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.content-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #10b981;
}

.card-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  background: white;
  border-bottom: 5px solid #f4433647;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* Minimal gap for tight icon-title pairing */
}

.card-header-icon {
  font-size: 1.25rem;
  color: #f54437; /* Green color to match theme */
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
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
  /* text-transform: uppercase; */
  letter-spacing: 0.05em;
  text-align: left;
}

.card-content {
  padding: 0.4rem;
  position: relative;
  z-index: 1;
  background: white;
}

.card-footer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  text-align: center;
}

.kpi-period {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-table-container {
  overflow-x: auto;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kpi-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #059367;
  border-radius: 8px;
  overflow: hidden;
}

.kpi-table th,
.kpi-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.kpi-table th {
  background-color: #c6e4dc;
  font-weight: 600;
  /* text-transform: uppercase; */
  font-size: 12px;
  letter-spacing: 0.05em;
  border-top: 1px solid #059367;
  border-bottom: 1px solid #059367;
}

.kpi-table th:first-child {
  border-left: 1px solid #059367;
  border-top-left-radius: 8px;
}

.kpi-table th:last-child {
  border-right: 1px solid #059367;
  border-top-right-radius: 8px;
}

.kpi-table td {
  color: #4a5568;
  font-weight: 500;
  background-color: white;
  border-right: 1px solid #e2e8f0;
}

.kpi-table td:last-child {
  border-right: none;
}

.kpi-table tr:hover td {
  background-color: #f7fafc;
}

.kpi-table tr:last-child td {
  border-bottom: none;
}

.kpi-table tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.kpi-table tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

/* Empty state styling */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f7fafc;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 15px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #718096;
  max-width: 300px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Loading skeleton */
.kpi-loading {
  padding: 20px;
}

.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-row {
  display: flex;
  gap: 15px;
  align-items: center;
}

.skeleton-cell {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: loading 1.5s infinite;
}

.skeleton-cell.wide {
  flex: 2;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
/* View All button */
.view-all-btn {
  width: 100%;
  padding: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4caf50;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-all-btn:hover {
  background-color: #c6e4dc;
  color: white;
  border-color: #4caf50;
}
/* Quick Creators */
.quick-creators {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
}

.quick-creator {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 1rem; */
  /* border: 1px solid #e2e8f0; */
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.quick-creator:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.quick-creator:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.quick-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-size: 20px;
}

.quick-icon.pink {
  background-color: #fce7f3;
  color: #be185d;
}

.quick-icon.white {
  background-color: rgb(198, 193, 193);
  color: #374151;
  border: 1px solid #d1d5db;
}

.quick-icon.light-blue {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.quick-creator span {
  font-size: 0.75rem;
  color: #000000;
  text-align: center;
  font-weight: 500;
}

/* Configurators */
.configurators {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
}

.config-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  /* border: 1px solid #e2e8f0; */
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.config-item:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.config-item:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.config-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-bottom: 0.5rem;
}

.config-icon.green {
  background-color: #f4433680;
  color: #f44336;
  border-color: #f44336;
}

.config-item span {
  font-size: 0.75rem;
  color: #000000;
  text-align: center;
  font-weight: 500;
  line-height: 1.2;
}

/* Today's Counts */
.todays-counts {
  display: flex;
  justify-content: space-around;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.count-badge {
  text-align: center;
  flex: 1;
}

.badge-number {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  display: block;
}

.badge-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  display: block;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  background: white;
  gap: 0;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
}

.tab-button.active {
  color: #10b981;
  border-bottom-color: #10b981;
  background-color: #f8fafc;
}

.tab-button:hover {
  color: #374151;
  background-color: #f8fafc;
}

.tab-count {
  background-color: #10b981;
  color: white;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.tab-button.active .tab-count {
  background-color: #059367;
}

.requests-table {
  width: 100%;
  overflow-x: auto;
}

.requests-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #059367;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.requests-table th,
.requests-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.requests-table th {
  background-color: #c6e4dc;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  /* text-transform: uppercase; */
  letter-spacing: 0.05em;
  border-bottom: 1px solid #059367;
}

.requests-table th:first-child {
  border-left: none;
}

.requests-table th:last-child {
  border-right: none;
}

.requests-table td {
  font-size: 0.875rem;
  color: #1e293b;
  border-left: none;
  border-right: none;
}

.requests-table tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.requests-table tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

.requests-table tr:hover {
  background-color: #f8fafc;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.status-dot.pending {
  background-color: #10b981;
}

.table-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.table-navigation span {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.table-navigation span:hover {
  background-color: #e5e7eb;
}

/* Employee Metrics */
.metrics-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.metric-card-compact {
  background: white;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center; /* Center content horizontally */
  text-align: center; /* Center text */
  min-height: 100px; /* Ensure consistent height */
}

.metric-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-card-compact:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.metric-content-compact {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content */
  justify-content: center; /* Center content vertically */
  width: 100%;
}

.metric-number-compact {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  width: 100%;
  margin-bottom: 0.5rem;
}

/* Color for Present */
.metric-number-compact.present {
  color: #3f51b5; /* Green color for present */
}

/* Color for Absent */
.metric-number-compact.absent {
  color: #dc2626; /* Red color for absent */
}

/* Color for Total (optional - keep original or set specific color) */
.metric-number-compact.total {
  color: #000000; /* Blue color for total (optional) */
}

.metric-label-compact {
  font-size: 17px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  width: 100%;
}
/* Work Orders */
.workorders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.workorder-metric {
  background: white;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center; /* Center content horizontally */
  text-align: center; /* Center text */
  min-height: 100px; /* Ensure consistent height */
}

.workorder-metric:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.workorder-metric:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.workorder-content {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content */
  justify-content: center; /* Center content vertically */
  width: 100%;
}

.workorder-number {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  width: 100%;
  margin-bottom: 0.5rem;
}

/* Color for Completed */
.workorder-number.completed {
  color: #3f51b5; /* Green color for completed */
}

/* Color for Overdue */
.workorder-number.overdue {
  color: #dc2626; /* Red color for overdue */
}

/* Color for Total */
.workorder-number.total {
  color: #000000; /* Blue color for total */
}

.workorder-label {
  font-size: 17px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  width: 100%;
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
  justify-content: center;
  width: 100%;
  margin-top: 1rem;
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .content-gri {
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

  .quick-creators,
  .configurators {
    flex-direction: column;
    gap: 0.5rem;
  }

  .quick-creator,
  .config-item {
    flex-direction: row;
    justify-content: center;
  }

  .todays-counts {
    flex-direction: column;
    gap: 1rem;
  }

  .requests-table th,
  .requests-table td,
  .kpi-table th,
  .kpi-table td {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .tab-navigation {
    flex-direction: column;
  }

  .tab-button {
    border-bottom: none;
    border-right: 1px solid #e2e8f0;
  }

  .tab-button:last-child {
    border-right: none;
  }

  .card-header-left {
    gap: 0.125rem; /* Slightly tighter gap on mobile for better fit */
  }

  .card-header-icon {
    font-size: 1.125rem; /* Slightly smaller icon on mobile */
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

  .badge-number {
    font-size: 1.25rem;
  }

  .card-header {
    padding: 1rem 1rem 0 1rem;
  }

  .card-header-left {
    gap: 0.125rem;
  }
}
</style>
