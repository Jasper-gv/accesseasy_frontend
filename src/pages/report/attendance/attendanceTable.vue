<template>
  <v-app>
    <v-container class="app-wrapper" fluid>
      <div v-if="loading" class="d-flex justify-center align-center pa-6">
        <v-progress-circular
          indeterminate
          color="#68ade1"
          size="48"
          width="5"
        ></v-progress-circular>
      </div>
      <div v-else>
        <v-row dense>
          <!-- Attendance Report Grid -->
          <v-col cols="12" md="4">
            <v-card elevation="2" class="pa-4">
              <v-card-title class="text-h6">Attendance Report</v-card-title>
              <v-card-text>
                <p class="text-body-2">
                  Generate attendance reports including absent, present, or
                  leave data for employees.
                </p>
              </v-card-text>
              <v-card-actions>
                <BaseButton
                  variant="primary"
                  size="md"
                  text="Generate Attendance Report"
                  :leftIcon="CalendarCheck"
                  @click="() => openDialog('Attendance')"
                />
              </v-card-actions>
            </v-card>
          </v-col>
          <!-- Monthly Attendance Report Grid -->
          <v-col cols="12" md="4">
            <v-card elevation="2" class="pa-4">
              <v-card-title class="text-h6"
                >Monthly Attendance Report</v-card-title
              >
              <v-card-text>
                <p class="text-body-2">
                  Generate monthly attendance reports including absent, present,
                  or leave data for employees.
                </p>
              </v-card-text>
              <v-card-actions>
                <BaseButton
                  variant="primary"
                  size="md"
                  text="Generate Monthly Attendance Report"
                  :leftIcon="CalendarDays"
                  @click="() => openDialog('MonthlyAttendance')"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Dialog for Report Configuration -->
        <v-dialog v-model="dialog" max-width="600px" persistent>
          <v-card>
            <v-card-title class="text-h6">
              {{
                dialogType === "TaskReport"
                  ? "WorkOrders Report Configuration"
                  : dialogType === "Reimbursement"
                    ? "Reimbursement Report Configuration"
                    : dialogType === "Attendance"
                      ? "Attendance Report Configuration"
                      : dialogType === "MonthlyAttendance"
                        ? "Monthly Attendance Report Configuration"
                        : dialogType === "QRGenerate"
                          ? "QR Generate Configuration"
                          : ""
              }}
            </v-card-title>
            <v-card-text>
              <v-form ref="form" @submit.prevent="generateReport">
                <!-- Organization Selection (for Task, Reimbursement, and Monthly Attendance Reports) -->
                <div
                  v-if="
                    dialogType === 'TaskReport' ||
                    dialogType === 'Reimbursement' ||
                    dialogType === 'MonthlyAttendance'
                  "
                  class="select-wrapper"
                >
                  <v-select
                    v-model="selectedOrganization"
                    :items="availableOrganizations"
                    item-title="orgName"
                    item-value="id"
                    label="Organization *"
                    :loading="loadingOrganizations"
                    :disabled="loadingOrganizations"
                    variant="outlined"
                    dense
                    required
                    @update:modelValue="fetchEmployees"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon v-if="!loadingOrganizations"
                        >mdi-office-building</v-icon
                      >
                      <v-progress-circular
                        v-else
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      ></v-progress-circular>
                    </template>
                  </v-select>
                </div>

                <!-- Department Selection (for Attendance and Monthly Attendance Reports) -->
                <div v-if="dialogType === 'Attendance'" class="select-wrapper">
                  <v-select
                    v-model="selectedDepartment"
                    :items="availableDepartments"
                    item-title="title"
                    item-value="value"
                    label="Department (Optional)"
                    :loading="loadingDepartments"
                    :disabled="loadingDepartments"
                    variant="outlined"
                    dense
                  >
                    <template v-slot:prepend-inner>
                      <v-icon v-if="!loadingDepartments"
                        >mdi-account-group</v-icon
                      >
                      <v-progress-circular
                        v-else
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      ></v-progress-circular>
                    </template>
                  </v-select>
                </div>

                <!-- Employee Selection (for Task and Monthly Attendance Reports) -->
                <div
                  v-if="
                    dialogType === 'TaskReport' ||
                    dialogType === 'MonthlyAttendance'
                  "
                  class="select-wrapper"
                >
                  <v-select
                    v-model="selectedEmployee"
                    :items="availableEmployees"
                    :item-title="employeeDisplayName"
                    item-value="id"
                    label="Employee (Optional)"
                    :loading="loadingEmployees"
                    :disabled="loadingEmployees || !selectedOrganization"
                    variant="outlined"
                    dense
                  >
                    <template v-slot:prepend-inner>
                      <v-icon v-if="!loadingEmployees">mdi-account</v-icon>
                      <v-progress-circular
                        v-else
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      ></v-progress-circular>
                    </template>
                  </v-select>
                </div>

                <!-- Month Selection (for Task, Reimbursement, and Monthly Attendance Reports) -->
                <div
                  v-if="
                    dialogType === 'TaskReport' ||
                    dialogType === 'Reimbursement' ||
                    dialogType === 'MonthlyAttendance'
                  "
                  class="month-input-wrapper"
                >
                  <v-text-field
                    v-model="selectedMonthYear"
                    type="month"
                    label="Report Month *"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                    dense
                    required
                  ></v-text-field>
                </div>

                <!-- Date Range Selection (for Attendance Report) -->
                <div
                  v-if="dialogType === 'Attendance'"
                  class="date-input-wrapper"
                >
                  <v-text-field
                    v-model="startDate"
                    type="date"
                    label="Start Date *"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                    dense
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="endDate"
                    type="date"
                    label="End Date *"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                    dense
                    required
                  ></v-text-field>
                </div>

                <!-- Report Type Selection (for Attendance and Monthly Attendance Reports) -->
                <div v-if="dialogType === 'Attendance'" class="select-wrapper">
                  <v-select
                    v-model="attendanceReportType"
                    :items="['AbsentReport', 'PresentReport', 'LeaveReport']"
                    label="Report Type *"
                    variant="outlined"
                    dense
                    required
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-file-chart</v-icon>
                    </template>
                  </v-select>
                </div>

                <!-- Location Selection for QR Generate -->
                <div v-if="dialogType === 'QRGenerate'" class="select-wrapper">
                  <v-select
                    v-model="selectedLocation"
                    :items="availableLocations"
                    item-title="locationName"
                    item-value="id"
                    label="Branch Location *"
                    :loading="loadingLocations"
                    :disabled="loadingLocations"
                    variant="outlined"
                    dense
                    required
                  >
                    <template v-slot:prepend-inner>
                      <v-icon v-if="!loadingLocations">mdi-map-marker</v-icon>
                      <v-progress-circular
                        v-else
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                      ></v-progress-circular>
                    </template>

                    <!-- Optional: Custom item template to show address too -->
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <!-- <v-list-item-title>{{
                        item.raw.locationName
                      }}</v-list-item-title> -->
                        <v-list-item-subtitle v-if="item.raw.address">
                          {{ item.raw.address }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-select>
                </div>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <BaseButton
                variant="danger"
                size="md"
                text="Cancel"
                :leftIcon="XCircle"
                @click="dialog = false"
              />

              <BaseButton
                variant="primary"
                size="md"
                :text="isGenerating ? 'Generating...' : 'Generate Report'"
                :leftIcon="isGenerating ? null : Check"
                :loading="isGenerating"
                :disabled="isGenerating"
                @click="generateReport"
              />
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Error Snackbar -->
        <v-snackbar v-model="showError" color="error" :timeout="5000">
          {{ errorMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showError = false">Close</v-btn>
          </template>
        </v-snackbar>

        <!-- Success Snackbar -->
        <v-snackbar v-model="showSuccess" color="success" :timeout="3000">
          {{ successMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showSuccess = false"
              >Close</v-btn
            >
          </template>
        </v-snackbar>
        <!-- Warning Snackbar (Yellow) -->
        <v-snackbar v-model="showWarning" color="warning" :timeout="4000">
          {{ warningMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="showWarning = false"
              >Close</v-btn
            >
          </template>
        </v-snackbar>
      </div>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { CalendarCheck, CalendarDays, XCircle, Check } from "lucide-vue-next";

const emit = defineEmits(["closeAddPage"]);
const loading = ref(false);
const showWarning = ref(false);
const warningMessage = ref("");
const form = ref(null);
const dialog = ref(false);
const dialogType = ref("");
const reportTypeOptions = [
  { title: "Task Report", value: "TaskReport" },
  { title: "Reimbursement", value: "Reimbursement" },
  { title: "Attendance", value: "Attendance" },
  { title: "Monthly Attendance", value: "MonthlyAttendance" },
];

const taskTypeOptions = ["site_visit", "collection", "installation", "Service"];
const showUnderDevelopment = () => {
  showWarningToast(
    "Trip Report functionality is currently limited. Available in v2.0: Route optimization, odometer tracking, and real-time GPS integration",
  );
};
const organizations = ref([]);
const loadingOrganizations = ref(false);
const selectedOrganization = ref(null);
const departments = ref([]);
const loadingDepartments = ref(false);
const selectedDepartment = ref(null);
const employees = ref([]);
const loadingEmployees = ref(false);
const selectedEmployee = ref(null);
const locations = ref([]);
const loadingLocations = ref(false);
const selectedLocation = ref(null);
const reportType = ref("");
const attendanceReportType = ref("");
const taskTypes = ref([]);
const isGenerating = ref(false);
const showError = ref(false);
const errorMessage = ref("");
const showSuccess = ref(false);
const successMessage = ref("");

const selectedMonthYear = ref("");
const startDate = ref("");
const endDate = ref("");

const currentDate = new Date();
const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
const currentYear = currentDate.getFullYear();
selectedMonthYear.value = `${currentYear}-${currentMonth}`;

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const availableOrganizations = computed(() => [
  { orgName: "All Organizations", id: "all" },
  ...organizations.value,
]);
const availableDepartments = computed(() => departments.value);
const availableEmployees = computed(() => employees.value);
const availableLocations = computed(() => {
  const mainTenantOrgIds = organizations.value
    .filter((org) => org.orgType === "main tenant")
    .map((org) => org.id);

  return locations.value

    .filter((loc) => loc.locdetail && loc.locdetail.locationName) // Add null check
    .map((loc) => ({
      id: loc.id,
      locationName: loc.locdetail.locationName,
      address: loc.locdetail.address || "",
      qrDetails: loc.qrDetails,
    }));
});

const employeeDisplayName = (item) =>
  `${item.id} - ${item.assignedUser?.first_name || ""} ${item.assignedUser?.last_name || ""}`.trim();

const formatSelectedMonth = () => {
  if (!selectedMonthYear.value) return "";
  const [year, month] = selectedMonthYear.value.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const showErrorToast = (message) => {
  errorMessage.value = message;
  showError.value = true;
};

const showSuccessToast = (message) => {
  successMessage.value = message;
  showSuccess.value = true;
};
const showWarningToast = (message) => {
  warningMessage.value = message;
  showWarning.value = true;
};
const openDialog = (type) => {
  dialogType.value = type;
  reportType.value = type;
  dialog.value = true;

  taskTypes.value = [];

  // Reset only if not already selected
  if (!selectedEmployee.value) {
    selectedEmployee.value = null;
  }

  if (!selectedDepartment.value) {
    selectedDepartment.value = null;
  }

  if (!attendanceReportType.value) {
    attendanceReportType.value = "";
  }

  if (!startDate.value) {
    startDate.value = "";
  }

  if (!endDate.value) {
    endDate.value = "";
  }
  if (type === "Attendance" || type === "MonthlyAttendance") {
    if (!selectedDepartment.value || !selectedDepartment.value.value) {
      selectedDepartment.value = availableDepartments.value[0] || null;
    }
  }

  if (type === "QRGenerate") {
    selectedLocation.value = null;
  }

  // Organization / Department defaults
  if (
    type === "TaskReport" ||
    type === "Reimbursement" ||
    type === "MonthlyAttendance"
  ) {
    setDefaultOrganization();
  } else {
    setDefaultDepartment();
  }
};

const fetchOrganizations = async () => {
  loading.value = true;
  loadingOrganizations.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch organizations");
    const data = await response.json();
    organizations.value = data.data || [];
    setDefaultOrganization();
  } catch (error) {
    console.error("Error fetching organizations:", error);
    showErrorToast("Failed to load organizations");
  } finally {
    loadingOrganizations.value = false;
    loading.value = false;
  }
};

const fetchDepartments = async () => {
  loadingDepartments.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id,departmentName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch departments");
    const data = await response.json();

    // Ensure we always have an "All Departments" option
    departments.value = [
      { title: "All Departments", value: "__all__" },
      ...(data.data || []).map((department) => ({
        title: department.departmentName,
        value: department.id,
      })),
    ];

    setDefaultDepartment();
  } catch (error) {
    console.error("Error fetching departments:", error);
    showErrorToast("Failed to load departments");
  } finally {
    loadingDepartments.value = false;
  }
};

const fetchEmployees = async () => {
  loadingEmployees.value = true;
  try {
    const baseUrl = `${import.meta.env.VITE_API_URL}/items/personalModule`;
    const filters = [
      `filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}`,
    ];
    if (selectedOrganization.value && selectedOrganization.value !== "all") {
      filters.push(
        `filter[_and][1][assignedUser][organization][id][_eq]=${selectedOrganization.value}`,
      );
    }
    const fields = [
      "id",
      "employeeId",
      "assignedUser.first_name",
      "assignedUser.last_name",
    ]
      .map((field) => `fields[]=${field}`)
      .join("&");

    const url = `${baseUrl}?${filters.join("&")}&${fields}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch employees");

    const data = await response.json();
    employees.value = data.data || [];
    selectedEmployee.value = null;
  } catch (error) {
    console.error("Error fetching employees:", error);
    showErrorToast("Failed to load employees");
  } finally {
    loadingEmployees.value = false;
  }
};

const fetchLocations = async () => {
  loadingLocations.value = true;
  const tenantId = currentUserTenant.getTenantId();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&filter[_and][0][_and][1][locType][_eq]=branch&fields=id,locdetail,qrDetails`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch locations");
    const data = await response.json();
    locations.value = data.data || [];
    location.value = locations.value[0] || null;
    console.log(location.value);
  } catch (error) {
    console.error("Error fetching locations:", error);
    showErrorToast("Failed to load locations");
  } finally {
    loadingLocations.value = false;
  }
};

const setDefaultOrganization = () => {
  const mainTenant = organizations.value.find(
    (org) => org.orgType === "main tenant",
  );
  if (mainTenant) {
    selectedOrganization.value = mainTenant.id;
  } else if (organizations.value.length > 0) {
    selectedOrganization.value = organizations.value[0].id;
  } else {
    selectedOrganization.value = "all";
  }
  fetchEmployees();
};

const setDefaultDepartment = () => {
  selectedDepartment.value = { title: "All Departments", value: "__all__" };
};

const generateReport = async () => {
  if (
    ((dialogType.value === "TaskReport" ||
      dialogType.value === "Reimbursement" ||
      dialogType.value === "MonthlyAttendance") &&
      (!reportType.value ||
        !selectedOrganization.value ||
        !selectedMonthYear.value)) ||
    (dialogType.value === "Attendance" &&
      (!attendanceReportType.value || !startDate.value || !endDate.value)) ||
    (dialogType.value === "QRGenerate" && !selectedLocation.value)
  ) {
    showErrorToast("Please fill in all required fields");
    return;
  }

  isGenerating.value = true;
  try {
    if (reportType.value === "TaskReport") {
      await fetchTaskData();
    } else if (reportType.value === "Reimbursement") {
      await fetchReimbursementData();
    } else if (
      reportType.value === "Attendance" ||
      reportType.value === "MonthlyAttendance"
    ) {
      await fetchAttendanceData();
    } else if (dialogType.value === "QRGenerate") {
      await generateQR();
    }
    dialog.value = false;
  } catch (error) {
    console.error("Error generating report:", error);
    showErrorToast("Failed to generate report. Please try again.");
  } finally {
    isGenerating.value = false;
  }
};

const generateQR = async () => {
  const loc = locations.value.find((l) => l.id === selectedLocation.value);
  if (!loc) {
    showErrorToast("Location not found");
    return;
  }

  const locationName = loc.locdetail?.locationName || "Unknown Location";

  // Use existing qrDetails if available, otherwise create new one
  let qrContent = loc.qrDetails;
  console.log("Existing QR Content:", qrContent);
  if (!qrContent) {
    // If qrDetails doesn't exist, create it from coordinates
    const longitude = loc.locmark?.coordinates?.[0] || "";
    const latitude = loc.locmark?.coordinates?.[1] || "";
    // qrContent = `${tenantId}|${longitude}|${latitude}`;

    // Update the database with the new qrDetails
    try {
      const updateResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/locationManagement/${loc.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrDetails: qrContent }),
        },
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update QR details");
      }
    } catch (error) {
      console.error("Error updating QR details:", error);
      showWarningToast("Failed to save QR details to database");
    }
  }

  try {
    // Create a container for QR with styling
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      background: white;
      padding: 40px;
      border-radius: 8px;
    `;
    document.body.appendChild(container);

    // Create canvas for QR
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    // Generate QR code from qrDetails content
    await QRCode.toCanvas(canvas, qrContent, {
      errorCorrectionLevel: "H",
      width: 512,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Convert canvas to blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          document.body.removeChild(container);
          showErrorToast("Failed to generate QR code image");
          return;
        }

        // Download the QR code
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${locationName.replace(/\s+/g, "_")}_QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Cleanup
        document.body.removeChild(container);
        showSuccessToast("QR code downloaded successfully!");
      },
      "image/png",
      1.0,
    );
  } catch (error) {
    console.error("Error generating QR code:", error);
    showErrorToast("Failed to generate QR code. Please try again.");
  }
};
const buildDateFilters = (isReimbursement = false) => {
  const filters = [];
  if (!selectedMonthYear.value) {
    throw new Error("Month selection is required");
  }
  const [year, month] = selectedMonthYear.value.split("-");
  filters.push(`filter[_and][0][_and][0][month(date_created)][_eq]=${month}`);
  filters.push(`filter[_and][0][_and][1][year(date_created)][_eq]=${year}`);
  if (selectedOrganization.value !== "all") {
    if (isReimbursement) {
      filters.push(
        `filter[_and][0][_and][2][orgId][id][_eq]=${selectedOrganization.value}`,
      );
    } else {
      filters.push(
        `filter[_and][0][_and][2][orgId][id][_eq]=${selectedOrganization.value}`,
      );
      if (selectedEmployee.value) {
        filters.push(
          `filter[_and][0][_and][3][employeeId][id][_eq]=${selectedEmployee.value}`,
        );
      }
    }
  }
  return filters;
};

const fetchTaskData = async () => {
  try {
    const filters = buildDateFilters(false);
    if (taskTypes.value && taskTypes.value.length > 0) {
      taskTypes.value.forEach((taskType, index) => {
        filters.push(`filter[_and][_or][${index}][taskType][_eq]=${taskType}`);
      });
    }

    const fields = [
      "id",
      "title",
      "description",
      "lat",
      "lng",
      "radiusInMeters",
      "taskType",
      "employeeId.employeeId",
      "employeeId.assignedUser.first_name",
      "employeeId.assignedUser.last_name",
      "from",
      "amountExpected",
      "amountCollected",
      "referenceNumber",
      "paymentMode",
      "deviceType",
      "snNumber",
      "demo",
      "currentLat",
      "currentLng",
      "eAmountCollected",
      "prodName",
      "date_created",
      "orgId",
      "orgId.orgName",
    ];

    const fieldParams = fields.map((field) => `fields[]=${field}`).join("&");
    const queryString = `${filters.join("&")}&${fieldParams}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tasks?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch task data");
    }

    const data = await response.json();
    if (data.data.length === 0) {
      showErrorToast("No task reports available for the selected criteria");
      return;
    }

    transformTaskData(data);
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

const fetchReimbursementData = async () => {
  try {
    const filters = buildDateFilters(true);
    const fields = [
      "id",
      "taskExpense",
      "distanceKm",
      "ModeOfTransport.transportName",
      "taskID.taskType",
      "reimbBy.assignedUser.first_name",
      "reimbBy.assignedUser.last_name",
      "orgId",
      "orgId.orgName",
      "date_created",
    ];

    const fieldParams = fields.map((field) => `fields[]=${field}`).join("&");
    const queryString = `${filters.join("&")}&${fieldParams}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/expenseReimbursement?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reimbursement data");
    }

    const data = await response.json();
    if (data.data.length === 0) {
      showErrorToast(
        "No reimbursement reports available for the selected criteria",
      );
      return;
    }

    transformReimbursementData(data);
  } catch (error) {
    console.error("Error fetching reimbursement data:", error);
    throw error;
  }
};

const fetchAttendanceData = async () => {
  try {
    const filterParams = {};

    if (reportType.value === "MonthlyAttendance") {
      if (!selectedMonthYear.value) {
        throw new Error("Month selection is required");
      }
      const [year, month] = selectedMonthYear.value.split("-");
      const start = `${year}-${month}-01`;
      const end = new Date(year, month, 0).toISOString().split("T")[0];
      filterParams["filter[_and][0][date][_between][0]"] = start;
      filterParams["filter[_and][0][date][_between][1]"] = end;
    } else {
      filterParams["filter[_and][0][date][_between][0]"] = startDate.value;
      filterParams["filter[_and][0][date][_between][1]"] = endDate.value;
    }

    filterParams["filter[_and][1][tenant][tenantId][_eq]"] = tenantId;

    let filterIndex = 2;
    if (selectedDepartment.value) {
      let departmentId;

      // Handle different ways the department value might be stored
      if (
        typeof selectedDepartment.value === "object" &&
        selectedDepartment.value !== null
      ) {
        // It's an object with a value property
        departmentId = selectedDepartment.value.value;
      } else {
        // It's a primitive value (number, string, etc.)
        departmentId = selectedDepartment.value;
      }

      console.log("Department ID to filter by:", departmentId);

      // Only add department filter if it's not "All Departments"
      if (departmentId && departmentId !== "__all__") {
        // Use the correct filter format for department
        filterParams[
          `filter[_and][${filterIndex}][employeeId][department][id][_eq]`
        ] = departmentId;
        filterIndex++;
      }
    }
    if (reportType.value === "MonthlyAttendance" && selectedEmployee.value) {
      filterParams[`filter[_and][${filterIndex}][employeeId][id][_eq]`] =
        selectedEmployee.value;
      filterIndex++;
    }

    let attendanceType = [];
    if (attendanceReportType.value === "LeaveReport") {
      attendanceType = ["paidLeave", "unPaidLeave"];
    } else if (attendanceReportType.value === "PresentReport") {
      attendanceType = ["present"];
    } else if (attendanceReportType.value === "AbsentReport") {
      attendanceType = ["absent"];
    }
    if (attendanceType.length > 0) {
      attendanceType.forEach((type, index) => {
        filterParams[
          `filter[_and][${filterIndex}][_or][${index}][attendance][_eq]`
        ] = type;
      });
    }

    const fields = [
      "employeeId.employeeId",
      "employeeId.assignedUser.first_name",
      "employeeId.assignedUser.designation",
      "employeeId.assignedUser.role.name",
      "employeeId.department.departmentName",
      "attendance",
      "date",
    ];

    const queryParams = new URLSearchParams();
    Object.entries(filterParams).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    fields.forEach((field) => {
      queryParams.append("fields[]", field);
    });
    queryParams.append("limit", "-1");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance data");
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      showErrorToast(
        "No attendance reports available for the selected criteria",
      );
      return;
    }

    transformAttendanceData(data);
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};

const transformTaskData = (data) => {
  const processedData = data.data.map((item) => ({
    Title: item.title,
    Description: item.description,
    TaskType: item.taskType,
    EmployeeID: item.employeeId?.employeeId,
    EmployeeName:
      `${item.employeeId?.assignedUser?.first_name || ""} ${item.employeeId?.assignedUser?.last_name || ""}`.trim(),
    Organization: item.orgId?.orgName,
    Latitude: item.lat,
    Longitude: item.lng,
    RadiusInMeters: item.radiusInMeters,
    ScheduledFrom: item.from ? new Date(item.from).toLocaleString() : "",
    AmountExpected: item.amountExpected,
    AmountCollected: item.amountCollected,
    ReferenceNumber: item.referenceNumber,
    PaymentMode: item.paymentMode,
    DeviceType: item.deviceType,
    SerialNumber: item.snNumber,
    Demo: item.demo,
    CurrentLatitude: item.currentLat,
    CurrentLongitude: item.currentLng,
    EAmountCollected: item.eAmountCollected,
    ProductName: item.prodName,
    CreatedDate: item.date_created
      ? new Date(item.date_created).toLocaleString()
      : "",
  }));

  downloadExcel(processedData, "Task_Report");
};

const transformReimbursementData = (data) => {
  const processedData = data.data.map((item) => ({
    EmployeeName:
      `${item.reimbBy?.assignedUser?.first_name || ""} ${item.reimbBy?.assignedUser?.last_name || ""}`.trim(),
    TaskType: item.taskID?.taskType,
    Organization: item.orgId?.orgName,
    TravelExpense: JSON.stringify(item.taskExpense || {}),
    TransportMode: item.ModeOfTransport?.transportName,
    Distance: item.distanceKm,
    Date: item.date_created
      ? new Date(item.date_created).toLocaleDateString()
      : "",
  }));

  downloadExcel(processedData, "Reimbursement_Report");
};

const transformAttendanceData = (data) => {
  const isMonthly = reportType.value === "MonthlyAttendance";

  const processedData = data.data.map((item) => {
    const row = {
      Date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
      EmployeeID: item.employeeId?.employeeId || "N/A",
      EmployeeName: item.employeeId?.assignedUser?.first_name || "N/A",
      Role: item.employeeId?.assignedUser?.role?.name || "N/A",
      Attendance: item.attendance
        ? item.attendance.charAt(0).toUpperCase() + item.attendance.slice(1)
        : "N/A",
    };

    // Only add Department if not monthly
    if (!isMonthly) {
      row.Department = item.employeeId?.department?.departmentName || "N/A";
    }

    return row;
  });

  downloadExcel(
    processedData,
    isMonthly ? "Monthly_Attendance_Report" : "Attendance_Report",
  );
};

const downloadExcel = (data, reportTitle) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const colWidths = Object.keys(data[0]).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || "").length),
      );
      return { wch: Math.min(maxLength + 2, 30) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle);

    let fileName;
    if (
      reportType.value === "Attendance" ||
      reportType.value === "MonthlyAttendance"
    ) {
      const deptName =
        selectedDepartment.value?.value === "__all__"
          ? "All_Departments"
          : departments.value.find(
              (dept) => dept.value === selectedDepartment.value.value,
            )?.title || "Unknown";
      const empName = selectedEmployee.value
        ? employees.value.find((emp) => emp.id === selectedEmployee.value)
            ?.assignedUser?.first_name || "Unknown"
        : "All_Employees";
      if (reportType.value === "MonthlyAttendance") {
        const [year, month] = selectedMonthYear.value.split("-");
        const monthName = new Date(year, month - 1).toLocaleString("default", {
          month: "long",
        });
        fileName = `${reportTitle}_${deptName}_${empName}_${monthName}_${year}.xlsx`;
      } else {
        fileName = `${reportTitle}_${deptName}_${empName}_${startDate.value}_to_${endDate.value}.xlsx`;
      }
    } else {
      const [year, month] = selectedMonthYear.value.split("-");
      const monthName = new Date(year, month - 1).toLocaleString("default", {
        month: "long",
      });
      const orgName =
        selectedOrganization.value === "all"
          ? "All_Organizations"
          : organizations.value.find(
              (org) => org.id === selectedOrganization.value,
            )?.orgName || "Unknown";
      const empName = selectedEmployee.value
        ? employees.value.find((emp) => emp.id === selectedEmployee.value)
            ?.assignedUser?.first_name || "Unknown"
        : "All_Employees";
      fileName = `${reportTitle}_${orgName}_${empName}_${monthName}_${year}.xlsx`;
    }

    XLSX.writeFile(workbook, fileName);
    showSuccessToast(
      `${reportTitle.replace("_", " ")} downloaded successfully!`,
    );
    emit("closeAddPage");
  } catch (error) {
    console.error("Error downloading Excel file:", error);
    throw error;
  }
};

onMounted(() => {
  fetchOrganizations();
  fetchDepartments();
  fetchLocations();
});
</script>

<style scoped>
.app-wrapper {
  height: 80vh;
  background-color: white;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw;

  box-sizing: border-box;
  overflow-y: auto;
}

.select-wrapper {
  position: relative;
}

.month-input-wrapper {
  position: relative;
  max-width: 24rem;
}

.date-input-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  max-width: 24rem;
}
</style>
