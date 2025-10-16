import { createRouter, createWebHistory } from "vue-router";
import { authService } from "@/services/authService";

// Import authentication and layout components
import Login from "@/components/loginAuthentication/login.vue";
import Verification from "@/components/loginAuthentication/verification.vue";
import PinVerification from "@/components/loginAuthentication/pinVerification.vue";
import Register from "@/components/loginAuthentication/register.vue";
import DashboardLayout from "@/layouts/dashboardLayout.vue";

// Import device manager components
import DeviceManagementTabs from "../pages/devicesManager/deviceManagerTabs.vue";
import UnapprovedDevices from "@/pages/devicesManager/unApprovedDevice/unApprovedDetails.vue";
import DoorManagement from "@/pages/devicesManager/doors/doorDetails.vue";
import Accesslevel from "@/pages/devicesManager/accesslevel/accesslevelCatagory.vue";

// Import attendance components
import AttendanceDeatils from "../pages/attendanceDetails/attendanceTabs.vue";
import LiveAttendance from "@/pages/attendanceDetails/liveAttendance/liveAttendanceDetails.vue";
import DailyAttendance from "@/pages/attendanceDetails/dailyAttendance/dailyAttendanceDetails.vue";
import AttendanceDashboard from "@/pages/attendanceDetails/attendanceDashboard/attendanceDashboardDetails.vue";
import roosteremployeelist from "@/pages/attendanceDetails/companyRoaster/roosterEmployees.vue";
import Profile from "@/pages/profile/profile.vue";

// payroll managemnet
import Payroll from "@/pages/payroll/payrolltab.vue";
import AttendanceVerification from "@/pages/payroll/payrollManagement/finalizePayroll/attendanceVerification.vue";
import SalaryVerification from "@/pages/payroll/payrollManagement/finalizePayroll/salaryVerification.vue";

// benifits
import Benifits from "@/pages/payroll/benifits/benifitsDetails.vue";

// Import employee components
import EmployeeDetails from "@/pages/employee/my-teams/myTeams.vue";
import EmployeeEditForm from "@/pages/employee/my-teams/personalDetails/employeeEditForm.vue";
import EmployeeAddForm from "@/pages/employee/my-teams/personalDetails/employeeForm.vue";
import LeaveManagement from "@/pages/leave/tab.vue";

// Import regularisation components
import RegularisationManagement from "@/pages/regularisation/tab.vue";
import RegularisationRequest from "@/pages/regularisation/regularisationRequest.vue/table.vue";
import RegularisationPermission from "@/pages/regularisation/regularisationPermission.vue/table.vue";
import MyRequest from "@/pages/regularisation/myRequest.vue/table.vue";
import AddRegularisationRequest from "@/pages/regularisation/regularisationRequest.vue/add.vue";

// logs
import Attendance from "../pages/logs/logTab.vue";
import LogsTable from "@/pages/logs/log/logTable.vue";

//imports
import Import from "@/pages/Imports/importsTabs.vue";
import importDetals from "@/pages/Imports/import/importTable.vue";

// Import report components
import Reports from "@/pages/report/reportTab.vue";
import CompanyReport from "@/pages/report/companyReport/company-reports.vue";
import AttendanceDetails from "@/pages/report/attendance/attendanceTable.vue";

// Import visitor flow
import VisitorFlow from "@/pages/flow/visitorFlow.vue";

// Import settings components
import SettingsTabs from "@/pages/settings/settingsTabs.vue";
import OrganizationSettingsTabs from "@/pages/settings/organizationSettings/organizationTabs.vue";
import OrganizationSettings from "@/pages/settings/organizationSettings/organizationSettings.vue";
import AttendanceCycle from "@/pages/settings/organizationSettings/attendanceCycle.vue";
import HolidaySettings from "@/pages/settings/holidays/holidayManagmnet.vue";
import ShiftSettings from "@/pages/settings/shifts/shiftsManagmnet.vue";
import LeaveSettings from "@/pages/settings/leaves/leaveManagmnet.vue";

// Import company settings components
import ConfigurationTabs from "@/pages/settings/configuration/configurationTab.vue";
import Branch from "@/pages/settings/configuration/branch/branchConfiguration.vue";
import AddBranch from "@/pages/settings/configuration/branch/branchAddForm.vue";
import EditBranch from "@/pages/settings/configuration/branch/branchEditForm.vue";
import Department from "@/pages/settings/configuration/department/departmentConfiguration.vue";
import AddDepartment from "@/pages/settings/configuration/department/departmentAddForm.vue";
import EditDepartment from "@/pages/settings/configuration/department/departmentEditForm.vue";

// Import category components
// import PayrollCatagory from "@/pages/settings/catagorys/salary/payrollCatagory.vue";

// Import payroll settings components
// import SalaryConfiguration from "@/pages/settings/catagorys/salary/salaryConfiguration.vue";
// import SalaryStructure from "@/pages/settings/catagorys/salary/salarySettings/salaryStructure.vue";
// import Contribution from "@/pages/settings/catagorys/salary/salarySettings/contribution.vue";
// import Deduction from "@/pages/settings/catagorys/salary/salarySettings/deduction.vue";
// import AssignEmployee from "@/pages/settings/catagorys/salary/salarySettings/assignEmployee.vue";
// import PolicySalaryStructure from "@/pages/settings/catagorys/salary/salaryPolicy/policySalaryStructure.vue";
// import PolicyDeduction from "@/pages/settings/catagorys/salary/salaryPolicy/policyDeduction.vue";
// import Bonus from "@/pages/settings/catagorys/salary/salaryPolicy/bonus.vue";
// import SalarySettings from "@/pages/settings/catagorys/salary/salarySettings/salaryStructure.vue";
// import SalaryPolicies from "@/pages/settings/catagorys/salary/salaryPolicy/policySalaryStructure.vue";

// Import product management components
import TaskDashboard from "@/pages/taskManagement/taskcomponents/taskDashboard.vue"; // Correct casing
import CompleteWorkOrderForm from "@/pages/taskManagement/taskcomponents/formTemplate/submitTaskForm/completeTaskForm.vue";
import ProductManagementScreen from "@/pages/taskManagement/productviews/ProductManagementScreen.vue";
import ProductDetailScreen from "@/pages/taskManagement/productviews/ProductDetailScreen.vue";
import ProductEditScreen from "@/pages/taskManagement/productviews/ProductEditScreen.vue";
import ManualEntryScreen from "@/pages/taskManagement/productviews/ManualEntryScreen.vue";
import BulkUploadScreen from "@/pages/taskManagement/productviews/BulkUploadScreen.vue";
import DeviceListScreen from "@/pages/taskManagement/productviews/devicelist.vue";
import Livetracking from "@/pages/taskManagement/Map/livetracking.vue";
import DeviceManagementScreen from "@/pages/taskManagement/productviews/deviceManagementScreen.vue";
import Reimbursement_card from "@/pages/reimbursement/reimbursement_card.vue";
// import AttendancePolicy from "@/pages/settings/catagorys/attendance/attendancePolicy.vue";

import Workordergenerate from "@/pages/report/workordereport/workordergenerate.vue";
import Orgmainui from "@/pages/organization/orgmainui.vue";
import Org_location from "@/pages/organization/org_location.vue";
import Org_addlocation from "@/pages/organization/org_addlocation.vue";
import Org_editlocation from "@/pages/organization/org_editlocation.vue";
import Workflow from "@/pages/taskManagement/taskcomponents/workflow.vue";
import Connector from "@/pages/connectors/connector.vue";
import Roleconfig from "@/pages/settings/roleConfigurator/roleconfig.vue";
import Manualdevice from "@/pages/taskManagement/productviews/manualdevice.vue";

import Overviewmaintab from "@/pages/taskManagement/overviewtab/overviewmaintab.vue";
import Kpi from "@/pages/taskManagement/overviewtab/kpi.vue";
import Reimbursementtab from "@/pages/reimbursement/reimbursementtab.vue";
import Reimbursement_settings from "@/pages/reimbursement/reimbursement_settings.vue";
import Reimbursementemp from "@/pages/reimbursement/reimbursementemp.vue";
import Tripview from "@/pages/reimbursement/tripview.vue";
// import Advance from "@/pages/payroll/advance/advance.vue";
// import Incentive from "@/pages/settings/catagorys/salary/salaryPolicy/incentive.vue";
import Locationtab from "@/pages/organization/locationtab.vue";
import Payrollsumary from "@/pages/payroll/payrollsumary.vue";

// Import work order tabs component
import TasksPage from "@/pages/taskManagement/taskcomponents/TasksPage.vue";
import WorkOrderTabs from "@/pages/taskManagement/taskcomponents/workOrderTabs.vue";
import FieldTrip from "@/pages/taskManagement/taskcomponents/fieldtrip.vue";
import Addreimbursement from "@/pages/reimbursement/addreimbursement.vue";
import Plans from "@/pages/settings/plans/plans.vue";

//locate logs
import locateTable from "@/pages/locate/locateTable.vue";
import MonthUserAttendance from "@/pages/attendanceDetails/attendanceDashboard/monthUserAttendance.vue";
import Clientsadd from "@/pages/organization/clientsadd.vue";
import Clientsedit from "@/pages/organization/clientsedit.vue";

import Attendanceconfigtab from "@/pages/settings/attendanceconfigtab.vue";

const routes = [
  {
    path: "/",
    redirect: (to) => {
      return authService.isAuthenticated()
        ? "/employee-details/employee"
        : "/login";
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: (to, from, next) => {
      if (authService.isAuthenticated()) {
        next("/employee-details/employee");
      } else {
        next();
      }
    },
  },
  {
    path: "/alternate-login",
    name: "AlternateLogin",
    component: () =>
      import("@/components/loginAuthentication/alternateLogin.vue"),
    requiresAuth: false,
    title: "Login with Another Account",
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/verification/:phoneNumber",
    name: "Verification",
    component: Verification,
    props: true,
  },
  {
    path: "/verify-email/:email?",
    name: "EmailVerification",
    component: () =>
      import("@/components/loginAuthentication/emailVerification.vue"),
  },
  {
    path: "/pin-verification/:phoneNumber?/:email?",
    name: "PinVerification",
    component: PinVerification,
  },
  {
    path: "/taskManagement/taskcomponents",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "/profile",
        name: "Profile",
        component: Profile,
        meta: { roles: ["Admin", "Manager", "Employee", "esslAdmin"] },
      },
      {
        path: "/leave",
        name: "LeaveManagement",
        component: LeaveManagement,
        meta: { roles: ["Admin", "Manager", "Employee"] },
      },
      {
        path: "/regularisation",
        name: "RegularisationManagement",
        component: RegularisationManagement,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          // {
          //   path: "", // Default route for /regularisation
          //   redirect: { name: "RegularisationRequest" },
          // },
          {
            path: "regularisationRequest",
            name: "RegularisationRequest",
            component: RegularisationRequest,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "regularisationPermission",
            name: "RegularisationPermission",
            component: RegularisationPermission,
            meta: {
              roles: [
                "Admin",
                "Manager",
                "Dealer",
                "accessManager",
                "Employee",
              ],
            },
          },
          {
            path: "requestFile",
            name: "RequestFile",
            component: MyRequest,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "regularisationRequest/add",
            name: "AddRegularisationRequest",
            component: AddRegularisationRequest,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          // Add more routes for edit functionality if needed
        ],
      },
      {
        path: "/settings/attendanceconfigtab",
        name: "attendanceconfigtab",
        component: Attendanceconfigtab,
        meta: { roles: ["Admin", "Dealer", "Manager"] },
        children: [
          {
            path: "attendanceCycle",
            name: "attendance-cycle",
            component: AttendanceCycle,
            meta: { roles: ["Admin", "Dealer"] },
          },
          {
            path: "holidays",
            name: "HolidaySettings",
            component: HolidaySettings,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "shifts",
            name: "ShiftSettings",
            component: ShiftSettings,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
        ],
      },
      {
        path: "/attendanceLog",
        name: "Attendance Logs",
        component: Attendance,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          {
            path: "",
            name: "attendance-logs-default",
            redirect: { name: "general-logs" },
          },
          // {
          //   path: "attendance",
          //   name: "attendance-logs",
          //   component: AttendanceTable,
          //   meta: { roles: ["Admin", "Manager", "Employee"] },
          // },
          {
            path: "general",
            name: "general-logs",
            component: LogsTable,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
        ],
      },

      {
        path: "/organization/locationtab",
        name: "LocationTabs",
        component: Locationtab, // Your tabs container
        meta: { roles: ["Admin", "Manager", "Employee"] },
        redirect: "/organization/orgmainui",
        children: [
          {
            path: "/organization/orgmainui",
            name: "orgmainui",
            component: Orgmainui,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "/organization/clientsadd",
            name: "AddClient",
            component: Clientsadd,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "organization/clientsedit/:id",
            name: "EditClient",
            component: Clientsedit,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },

          {
            path: "/organization/org_location",
            name: "org_location",
            component: Org_location, // From organization/ folder
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "/organization/org_addlocation",
            name: "org_location-add",
            component: Org_addlocation,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "/organization/org_editlocation/:id",
            name: "org_location-edit",
            component: Org_editlocation,
            props: true,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },
          {
            path: "livetracking",
            name: "livetrack",
            component: Livetracking, // From taskManagement/Map/ folder
            meta: { roles: ["Admin", "Manager"] },
          },
        ],
      },

      {
        path: "/attendanceDeatils",
        name: "AttendanceDeatils",
        component: AttendanceDeatils,
        meta: { roles: ["Admin", "Employee", "Manager"] },
        children: [
          {
            path: "",
            name: "attendance-details-default",
            redirect: "/attendanceDeatils/dashboard",
          },
          {
            path: "live",
            name: "LiveAttendance",
            component: LiveAttendance,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "daily",
            name: "DailyAttendance",
            component: () =>
              import(
                "@/pages/attendanceDetails/dailyAttendance/dailyAttendanceDetails.vue"
              ),
            meta: { roles: ["Admin", "Employee", "Manager"] },
          },
          {
            path: "dashboard",
            name: "Attendance Dashboard",
            component: AttendanceDashboard,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "roster",
            name: "CompanyRoster",
            component: roosteremployeelist,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "monthlyUserAttendance",
            name: "monthlyUserAttendance",
            component: MonthUserAttendance,
            props: true,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
        ],
      },
      {
        path: "/locate",
        name: "Locate",
        component: locateTable,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/deviceManager",
        component: DeviceManagementTabs,
        meta: { roles: ["Admin", "esslAdmin"] },
        children: [
          {
            path: "",
            redirect: { name: "unapproved-devices" },
          },
          {
            path: "unapproved",
            name: "unapproved-devices",
            component: UnapprovedDevices,
            meta: { roles: ["Admin", "esslAdmin"] },
          },
          {
            path: "doors",
            name: "door-management",
            component: DoorManagement,
            meta: { roles: ["Admin"] },
          },
          {
            path: "accesslevelCatagory",
            name: "accessLvl-category",
            component: Accesslevel,
            meta: { roles: ["Admin"] },
          },
        ],
      },
      // user
      {
        path: "/employee-details",
        name: "EmployeeDetails",
        component: EmployeeDetails,
        meta: { roles: ["Admin", "Employee", "Manager", "esslAdmin"] },
        children: [
          {
            path: "",
            name: "employee-details-default",
            redirect: "/employee-details/employee",
          },
          {
            path: "employee",
            name: "EmployeeDetailsTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/personalDetails/employeeDetails.vue"
              ),
            children: [
              {
                path: "add/:module",
                name: "AddEmployeeForm",
                component: EmployeeAddForm,
                props: true,
                meta: { roles: ["Admin", "Manager", "esslAdmin"] },
              },
              {
                path: ":id/:module",
                name: "EmployeeForm",
                component: EmployeeEditForm,
                props: true,
                meta: { roles: ["Admin", "Manager", "Employee", "esslAdmin"] },
              },
            ],
          },

          {
            path: "leave",
            name: "LeaveBalanceTab",
            component: () =>
              import("@/pages/employee/my-teams/leaveDeatils/leaveDetails.vue"),
          },
          {
            path: "attendance",
            name: "AttendanceDetailsTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/attendanceDetails/attendanceDetails.vue"
              ),
          },
          {
            path: "card",
            name: "CardManagementTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/cardManagement/cardManagementDetails.vue"
              ),
          },
          {
            path: "otherDetails",
            name: "OtherDetailsTab",
            component: () =>
              import(
                "@/pages/employee/my-teams/otherDetails/otherEmployeeDetails.vue"
              ),
          },
        ],
      },
      // payroll
      {
        path: "/payroll",
        component: Payroll,
        meta: { roles: ["Admin"] },
        children: [
          {
            path: "employee-salary",
            name: "EmployeeSalary",
            component: () =>
              import("@/pages/payroll/employeeSalary/employeeSalaryTab.vue"),
            meta: { roles: ["Admin"] },
            children: [
              {
                path: "salary-details",
                name: "SalaryDetailsTab",
                component: () =>
                  import(
                    "@/pages/payroll/employeeSalary/salaryDetails/salaryDetails.vue"
                  ),
                children: [
                  {
                    path: ":id/salary-detailsedit",
                    name: "SalaryDetailsEdit",
                    component: () =>
                      import(
                        "@/pages/payroll/employeeSalary/salaryDetails/salaryEditTab.vue"
                      ),
                    props: true,
                  },
                ],
              },
              {
                path: "bank-details",
                name: "BankDetailsTab",
                component: () =>
                  import(
                    "@/pages/payroll/employeeSalary/bankDetails/bankDetails.vue"
                  ),
                children: [
                  {
                    path: ":id/bank-detailsedit",
                    name: "bank-detailsEdit",
                    component: () =>
                      import(
                        "@/pages/payroll/employeeSalary/bankDetails/bankEditTabs.vue"
                      ),
                    props: true,
                  },
                ],
              },
              {
                path: "policyDetails",
                name: "PolicyTab",
                component: () =>
                  import(
                    "@/pages/payroll/employeeSalary/policyConfig/policyDetails.vue"
                  ),
                children: [
                  {
                    path: ":id/policy-edit",
                    name: "PolicyEdit",
                    component: () =>
                      import(
                        "@/pages/payroll/employeeSalary/policyConfig/policyEditTab.vue"
                      ),
                    props: true,
                  },
                ],
              },
            ],
          },
          {
            path: "policy",
            name: "policy",
            component: () => import("@/pages/payroll/policy/policyTab.vue"),
            meta: { roles: ["Admin"] },
            children: [
              {
                path: "payroll-policy",
                name: "Payroll policy",
                component: () =>
                  import(
                    "@/pages/payroll/policy/salary/salaryPolicyDetails.vue"
                  ),
                meta: { roles: ["Admin", "Dealer", "Manager"] },
                children: [
                  {
                    path: "salary-template",
                    name: "salary-template",
                    component: () =>
                      import(
                        "@/pages/payroll/policy/salary/salaryTemplate.vue"
                      ),
                  },
                  {
                    path: "salary-templateEdit/:categoryData",
                    name: "salary-templateEdit",
                    component: () =>
                      import(
                        "@/pages/payroll/policy/salary/salaryTemplateEdit.vue"
                      ),
                  },
                ],
              },
              {
                path: "penalty-policy",
                name: "Penality policy",
                component: () =>
                  import(
                    "@/pages/payroll/policy/attendance/attendancePolicy.vue"
                  ),
              },
            ],
          },
          {
            path: "adhoc-payments",
            name: "adhoc-payments",
            component: Benifits,
          },
          {
            path: "adhoc-paymentsEdit",
            name: "adhoc-paymentsEdit",
            component: () =>
              import("@/pages/payroll/benifits/benifitsEditTabs.vue"),
          },

          {
            path: "advance-Loans",
            name: "Advance And Loans",
            component: () =>
              import("@/pages/payroll/advanceLoan/advanceLoanTab.vue"),
            meta: { roles: ["Admin"] },
            children: [
              {
                path: "Advance",
                name: "Advance",
                component: () =>
                  import("@/pages/payroll/advanceLoan/advance/advance.vue"),
              },
              {
                path: "Loan",
                name: "Loan",
                component: () =>
                  import("@/pages/payroll/advanceLoan/loan/loan.vue"),
              },
            ],
          },

          {
            path: "",
            name: "PayrollList",
            component: () =>
              import(
                "@/pages/payroll/payrollManagement/payrollManagementDetails.vue"
              ),
          },
          {
            path: "/payroll/payrollsumary",
            name: "summary",
            component: Payrollsumary,
          },
          // {
          //   path: "ctc/:id",
          //   name: "PayrollCTC",
          //   component: PayrollCTC,
          //   props: true,
          // },
        ],
      },

      {
        path: "/configuration",
        name: "configuration",
        component: () => import("@/pages/configurator/configuratorTab.vue"),
      },
      // {
      //   path: "/payroll-verification/:employeeId",
      //   name: "payroll-verification",
      //   component: PayrollVerification,
      //   props: true,
      // },
      {
        path: "/attendance-verification",
        name: "attendance-verification",
        component: AttendanceVerification,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/salary-verification/:date?",
        name: "salary-verification",
        component: SalaryVerification,
        props: true,
        meta: { roles: ["Admin"] },
      },

      {
        path: "/import",
        name: "import",
        component: Import,
        meta: {
          roles: ["Admin", "Dealer"],
        },
        children: [
          {
            path: "",
            name: "imports",
            redirect: { name: "importDetails" },
          },
          {
            path: "importDetails",
            name: "importDetails",
            component: importDetals,
            meta: {
              roles: ["Admin", "Administrator", "Dealer"],
            },
          },
        ],
      },
      {
        path: "/reports",
        component: Reports,
        meta: { roles: ["Admin", "Manager"] },
        children: [
          {
            path: "",
            redirect: { name: "workordergenerate" },
          },
          {
            path: "workordergenerate",
            name: "workordergenerate",
            component: Workordergenerate,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "attendance",
            name: "attendance",
            component: AttendanceDetails,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "workordergenerate",
            name: "workordergenerate",
            component: Workordergenerate,
            meta: { roles: ["Admin", "Manager"] },
          },
          {
            path: "/import",
            name: "CompanyReport",
            component: CompanyReport,
            meta: { roles: ["Admin", "Manager"] },
          },
        ],
      },
      {
        path: "/visitor",
        name: "Visitor",
        component: VisitorFlow,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/connectors/connector",
        name: "connector",
        component: Connector,
        meta: { roles: ["Admin", "Manager", "Employee"] },
      },

      {
        path: "/reimbursement/reimbursementtab",
        name: "reimbursementtab",
        component: Reimbursementtab,
        children: [
          {
            path: "reimbursement_card", // Relative path for nested route
            name: "reimbursement_card",
            component: Reimbursement_card,
          },
          {
            path: "reimbursement_settings", // Relative path for nested route
            name: "reimbursement_settings",
            component: Reimbursement_settings,
          },
          {
            path: "reimbursementemp", // Relative path for nested route
            name: "reimbursementemp",
            component: Reimbursementemp,
          },
          {
            path: "addreimbursement",
            name: "addreimbursement",
            component: Addreimbursement,
          },
        ],
      },
      {
        path: "/reimbursement/tripview/:employeeId",
        name: "tripview",
        component: Tripview,
      },

      {
        path: "/settings",
        name: "Settings",
        component: SettingsTabs,
        meta: { roles: ["Admin", "Administrator", "Dealer", "Manager"] },
        children: [
          {
            path: "",
            name: "settings",
            redirect: "/settings/organization",
          },

          {
            path: "/settings/plans/plans",
            name: "plan",
            component: Plans,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
          },

          {
            path: "/settings",
            component: OrganizationSettingsTabs,
            meta: { roles: ["Admin", "Administrator", "Dealer"] },
            children: [],
          },
          {
            path: "/payroll",
            component: Payroll,
            meta: { roles: ["Admin", "Dealer", "Employee"] },
            children: [
              {
                path: "",
                redirect: { name: "PayrollManagement" },
              },
              {
                path: "management",
                name: "PayrollManagement",
                component: () =>
                  import(
                    "@/pages/payroll/payrollManagement/payrollManagementDetails.vue"
                  ),
                meta: { roles: ["Admin", "Dealer", "Manager"] },
              },
              {
                path: "attendance-verification",
                name: "attendance-verification",
                component: AttendanceVerification,
                meta: { roles: ["Admin", "Dealer", "Manager"] },
              },
              {
                path: "salary-verification/:date?",
                name: "salary-verification",
                component: SalaryVerification,
                props: true,
                meta: { roles: ["Admin", "Dealer"] },
              },
              {
                path: "review",
                name: "review",
                component: () =>
                  import(
                    "@/pages/payroll/payrollManagement/finalizePayroll/review.vue"
                  ),
                props: true,
                meta: { roles: ["Admin", "Dealer"] },
              },
              {
                path: "tds",
                name: "tds",
                component: () => import("@/pages/payroll/tds/tdsDetails.vue"),
                children: [
                  {
                    path: "deduction",
                    component: () =>
                      import(
                        "@/pages/payroll/tds/taxDeduction/taxDeductionDetails.vue"
                      ),
                    meta: {
                      roles: [
                        "Admin",
                        "Dealer",
                        "Employee",
                        "Manager",
                        "accessManager",
                      ],
                    },
                    children: [
                      {
                        path: "",
                        name: "TdsDeductionRoot",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/taxDeductionDetails.vue"
                          ),
                      },
                      {
                        path: ":id",
                        name: "TdsDeductionDefault",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/taxDeductionRules.vue"
                          ),
                      },
                      {
                        path: ":id/hraRent",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/hraRent.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/hraLoan",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/homeLoan.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/travelAllowence",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/leaveTravel.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/deduction",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/sectionDeduction.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/pastTds",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/pastTds.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: "regime",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxDeduction/pastTds.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                    ],
                  },
                  {
                    path: "approval",
                    component: () =>
                      import(
                        "@/pages/payroll/tds/taxApproval/taxApprovalDetails.vue"
                      ),
                    meta: { roles: ["Admin", "Dealer"] },
                    children: [
                      {
                        path: "",
                        name: "TdsApprovalRoot",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxApproval/taxApprovalDetails.vue"
                          ),
                      },
                      {
                        path: ":id",
                        name: "TdsDefault",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxApproval/taxApprovalRules.vue"
                          ),
                        children: [
                          {
                            path: "tds-summary",
                            name: "Tds",
                            component: () =>
                              import(
                                "@/pages/payroll/tds/taxApproval/tdsSummary/tdsSummaryUi.vue"
                              ),
                          },
                          {
                            path: "declare",
                            name: "declare",
                            component: () =>
                              import(
                                "@/pages/payroll/tds/taxApproval/tdsDeclare/tdsDeclareUi.vue"
                              ),
                          },
                        ],
                      },
                      // {
                      //   path: "/tds-summary",
                      //   name: "Tds",
                      //   component: () =>
                      //     import(
                      //       "@/pages/payroll/tds/taxApproval/tdsSummary/tdsSummaryUi.vue"
                      //     ),
                      // },
                      // {
                      //   path: "/declare",
                      //   name: "declare",
                      //   component: () =>
                      //     import(
                      //       "@/pages/payroll/tds/taxApproval/tdsDeclare/tdsDeclareUi.vue"
                      //     ),
                      // },
                      {
                        path: ":id/hraRent",
                        component: () =>
                          import("@/pages/payroll/tds/taxApproval/hraRent.vue"),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/pastTds",
                        component: () =>
                          import("@/pages/payroll/tds/taxApproval/pastTds.vue"),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/hraLoan",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxApproval/homeLoan.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/travelAllowence",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxApproval/travelAllowence.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                      {
                        path: ":id/deduction",
                        component: () =>
                          import(
                            "@/pages/payroll/tds/taxApproval/deduction.vue"
                          ),
                        meta: {
                          roles: [
                            "Admin",
                            "Dealer",
                            "Employee",
                            "Manager",
                            "accessManager",
                          ],
                        },
                      },
                    ],
                  },
                  {
                    path: "taxSetting",
                    component: () =>
                      import("@/pages/payroll/tds/taxSettings/taxSettings.vue"),
                    meta: {
                      roles: [
                        "Admin",
                        "Dealer",
                        "Employee",
                        "Manager",
                        "accessManager",
                      ],
                    },
                  },
                ],
              },
            ],
          },
          {
            path: "/settings",
            component: ConfigurationTabs,
            meta: { roles: ["Admin", "Dealer", "Manager"] },
            children: [
              // {
              //   path: "",
              //   redirect: "/settings/configuration",
              // },
              {
                path: "organization",
                name: "organization-settings",
                component: OrganizationSettings,
                meta: { roles: ["Admin", "Administrator", "Dealer"] },
              },
              {
                path: "configuration",
                name: "branch-configuration",
                component: Branch,
                meta: { roles: ["Admin", "Dealer", "Manager"] },
              },
              {
                path: "branch/add",
                name: "branch-configuration-add",
                component: AddBranch,
                meta: { roles: ["Admin", "Dealer", "Manager"] },
              },
              {
                path: "branch/edit/:id",
                name: "branch-configuration-edit",
                component: EditBranch,
                props: true,
                meta: { roles: ["Admin", "Dealer", "Manager"] },
              },
              {
                path: "departement-configuration", // ✅ this becomes /settings/configuration
                name: "department-configuration",
                component: Department,
                meta: { roles: ["Admin", "Dealer", "Manager"] },
              },
            ],
          },

          // {
          //   path: "/settings/leave-types",
          //   name: "LeaveSettings",
          //   component: LeaveSettings,
          //   meta: { roles: ["Admin", "Dealer", "Manager"] },
          // },
          {
            path: "/settings/roleConfigurator/roleconfig",
            name: "RoleConfigurator",
            component: Roleconfig,
          },
        ],
      },

      { path: "/taskManagement/kpi", name: "kpi", component: Kpi },

      // Updated Product Management Routes
      {
        path: "/taskManagement/productviews",
        name: "TaskManagement",
        component: ProductManagementScreen,
        meta: { roles: ["Admin"] },
        props: (route) => ({
          tenantId: "e988162f-6731-4b30-9c4f-f0790fdeb1e8" || "default-tenant",
        }),
      },
      {
        path: "/taskManagement/productviews/deviceManagementScreen",
        name: "deviceManagementScreen",
        component: DeviceManagementScreen,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/taskManagement/productviews/ProductDetailScreen:id",
        name: "ProductDetail",
        component: ProductDetailScreen,
        meta: { roles: ["Admin"] },
        props: true,
      },
      {
        path: "/taskManagement/productviews/edit/:id",
        name: "ProductEdit",
        component: ProductEditScreen,
        meta: { roles: ["Admin"] },
        props: (route) => ({
          tenantId: "e988162f-6731-4b30-9c4f-f0790fdeb1e8" || "default-tenant",
          userId: route.query.userId || "current-user",
          id: route.params.id,
        }),
      },
      {
        path: "/taskManagement/productviews/add",
        name: "ManualEntry",
        component: ManualEntryScreen,
        meta: { roles: ["Admin"] },
      },
      {
        path: "/taskManagement/productviews/devicelist/:productId",
        name: "DeviceList",
        component: DeviceListScreen,
        props: (route) => ({
          productId: route.params.productId,
          productName: route.query.productName,
          initialDevices: JSON.parse(
            decodeURIComponent(route.query.devices || "[]"),
          ),
          status: route.query.status,
        }),
      },
      {
        path: "/taskManagement/productviews/bulk-upload",
        name: "BulkUpload",
        component: BulkUploadScreen,
      },
      {
        path: "/taskManagement/productviews/manualdevice/:productId",
        name: "AddAssetManual",
        component: Manualdevice,
        props: true,
      },
      {
        path: "/taskManagement/taskcomponents",
        name: "Dashboard",
        component: TaskDashboard,
      },

      {
        path: "/taskManagement/taskcomponents/complete-work-order/:taskId/:assignFormId",
        name: "CompleteWorkOrder",
        component: CompleteWorkOrderForm,
        props: true,
        meta: { roles: ["Admin", "Employee", "Manager"] },
      },

      {
        path: "/taskManagement/taskcomponents",
        name: "WorkOrderTabs",
        component: WorkOrderTabs,
        meta: { roles: ["Admin", "Manager", "Employee"] },
        children: [
          {
            path: "",
            name: "WorkOrderTabsDefault",
            redirect: { name: "WorkOrderTasks" },
          },
          {
            path: "workorder",
            name: "WorkOrderTasks",
            component: TasksPage,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },
          {
            path: "fieldtrip",
            name: "WorkOrderFieldTrip",
            component: FieldTrip,
            meta: { roles: ["Admin", "Manager", "Employee"] },
          },

          {
            path: "workflow",
            name: "workflow",
            component: Workflow,
            meta: { roles: ["Admin", "Manager"] },
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const getRoleLandingPage = (role) => {
  switch (role) {
    case "Admin":
      return "/taskManagement/taskcomponents";
    case "Manager":
      return "/employee-details";
    case "Employee":
      return "/employee-details";
    case "esslAdmin":
      return "/employee-details";
    default:
      return "/login";
  }
};

router.beforeEach(async (to, from, next) => {
  console.log("Navigating to:", to.fullPath, "Route name:", to.name);
  // Update last activity for all routes except login
  if (typeof localStorage !== "undefined" && to.path !== "/login") {
    localStorage.setItem("lastActivityTime", Date.now().toString());
  }

  // Check for inactivity timeout
  const lastActivity = Number.parseInt(
    localStorage.getItem("lastActivityTime") || "0",
  );
  const currentTime = Date.now();
  const inactiveTime = currentTime - lastActivity;
  const inactivityTimeout = 3600000; // 1 hour

  if (
    inactiveTime > inactivityTimeout &&
    to.path !== "/login" &&
    to.path !== "/pin-verification"
  ) {
    console.log("Inactive for 1hr, redirecting to login");
    localStorage.setItem("inactivityRedirect", "true");
    return next({
      path: "/login",
      query: { timeout: true },
    });
  }

  // Allow access to auth pages without checks
  if (
    to.path === "/login" ||
    to.path === "/register" ||
    to.path === "/verify" ||
    to.path.startsWith("/pin-verification")
  ) {
    return next();
  }

  // Check authentication for protected routes
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authService.isAuthenticated()) {
      return next({ path: "/login" });
    }

    try {
      const phone = localStorage.getItem("userPhone");
      const email = localStorage.getItem("email");
      let user;
      if (email) {
        user = await authService.getUserByEmail(email);
      } else if (phone) {
        user = await authService.getUserByPhone("+91" + phone);
      } else {
        return next({ path: "/login" });
      }

      // PIN verification logic
      if (user && user.userPin) {
        const pinVerified =
          localStorage.getItem("pinVerifiedInSession") === "true";
        if (!pinVerified && !to.path.startsWith("/pin-verification")) {
          console.log(
            "Redirecting to PIN verification - PIN not verified in this session",
          );
          const redirectPath = email
            ? `/pin-verification//${email}`
            : `/pin-verification/${phone}`;
          return next({ path: redirectPath });
        }
      } else if (user && !user.userPin) {
        const fromOtp =
          localStorage.getItem("fromOtp") === "true" ||
          localStorage.getItem("fromEmailOtp") === "true";
        if (!fromOtp) {
          return next({ path: "/login" });
        }
      }

      // Check for session timeout
      const lastActivity = Number.parseInt(
        localStorage.getItem("lastActivityTime") || "0",
      );
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity;
      if (inactiveTime > inactivityTimeout) {
        localStorage.removeItem("pinVerifiedInSession");
        return next({
          path: "/login",
          query: { timeout: true },
        });
      }

      // Role-based access control
      if (
        user &&
        user.role &&
        to.meta.roles &&
        !to.meta.roles.includes(user.role.name)
      ) {
        const landingPage = getRoleLandingPage(user.role.name);
        return next(landingPage);
      }

      return next();
    } catch (error) {
      console.error("Error in navigation guard:", error);
      return next("/login");
    }
  }

  next();
});

export default router;
