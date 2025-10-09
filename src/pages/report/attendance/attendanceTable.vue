<template>
  <div class="generate-report-container">
    <v-toolbar flat class="header-toolbar px-4" height="64">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium">Generate Report</span>
      </div>
      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              color="white"
              style="background-color: black !important"
              prepend-icon="mdi-download"
              v-bind="props"
              elevation="0"
            >
              Export
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="exportReport('csv')">
              <v-list-item-title>Export to CSV</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportReport('excel')">
              <v-list-item-title>Export to Excel</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportReport('pdf')">
              <v-list-item-title>Export to PDF</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-toolbar>

    <div class="d-flex layout-container">
      <div class="content-area pa-8">
        <v-form ref="form">
          <div class="form-header mb-6">
            <h2 class="text-h6 font-weight-medium">Report Details</h2>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <v-select
                v-model="reportType"
                label="Report Type"
                :items="['AbsentReport', 'PresentReport', 'LeaveReport']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'Report Type is required']"
                hide-details="auto"
              >
              </v-select>
            </div>

            <!-- <div class="form-group">
              <v-select
                v-model="selectedBranch"
                :items="branchOptions"
                label="Select Branch"
                variant="outlined"
                hide-details="auto"
                item-title="title"
                item-value="value"
                return-object
                density="comfortable"
                class="mb-4"
                :loading="loadingBranches"
                :rules="[(v) => !!v || 'Branch is required']"
              ></v-select>
            </div> -->

            <div class="form-group">
              <v-select
                v-model="selectedDepartment"
                :items="departmentOptions"
                label="Select Department"
                variant="outlined"
                hide-details="auto"
                item-title="title"
                item-value="value"
                return-object
                density="comfortable"
                class="mb-4"
                :loading="loadingDepartments"
                :rules="[(v) => !!v || 'Department is required']"
              ></v-select>
            </div>
            <div class="date-fields">
              <v-text-field
                v-model="startDate"
                label="Start Date"
                type="date"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'Start Date is required']"
                hide-details="auto"
              >
              </v-text-field>

              <v-text-field
                v-model="endDate"
                label="End Date"
                type="date"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                :rules="[(v) => !!v || 'End Date is required']"
                hide-details="auto"
              >
              </v-text-field>
            </div>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const emit = defineEmits(["closeAddPage"]);
const form = ref(null);
const branchOptions = ref();
const loadingBranches = ref(false);
const departmentOptions = ref();
const selectedBranch = ref([]);
const selectedDepartment = ref(null);
const branch = ref();
const startDate = ref();
const endDate = ref();
const reportType = ref();
const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();

const fetchBranches = async () => {
  loadingBranches.value = true;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/branch?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id,branchName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch branch data");
    }

    const data = await response.json();

    branchOptions.value = [
      { title: "All Branches", value: "__all__" },
      ...data.data.map((branch) => ({
        title: branch.branchName,
        value: branch.id,
      })),
    ];
    selectedBranch.value = { title: "All Branches", value: "__all__" };
  } catch (error) {
    console.error("Error fetching branches:", error);
  } finally {
    loadingBranches.value = false;
  }
};

const fetchDepartments = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}&fields[]=id,departmentName`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch department data");
    }

    const data = await response.json();

    departmentOptions.value = [
      { title: "All Departments", value: "__all__" },
      ...data.data.map((department) => ({
        title: department.departmentName,
        value: department.id,
      })),
    ];
    selectedDepartment.value = { title: "All Departments", value: "__all__" };
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};

const attendance = () => {
  if (reportType.value === "AbsentReport") {
    return "absent";
  }
  if (reportType.value === "PresentReport") {
    return "present";
  }
  if (reportType.value === "LeaveReport") { // Added LeaveReport
    return ["paidLeave", "unPaidLeave"];
  }
};

const fetchAttendanceData = async () => {
  const attendanceType = attendance();
  try {
    // Base filter parameters
    const filterParams = {
      "filter[_and][0][date][_between][0]": startDate.value,
      "filter[_and][0][date][_between][1]": endDate.value,
      "filter[_and][1][tenant][tenantId][_eq]": tenantId,
    };

    // Add branch filter if not "All Branches"
    if (selectedBranch.value?.value !== "__all__") {
      filterParams["filter[_and][2][employeeId][branch][id][_eq]"] = selectedBranch.value?.value;
    }

    // Add department filter if not "All Departments"
    if (selectedDepartment?.value?.value !== "__all__") {
      filterParams["filter[_and][3][employeeId][department][id][_eq]"] = selectedDepartment?.value?.value;
    }

    // Handle attendance type filter
    if (Array.isArray(attendanceType)) {
      // For LeaveReport (array of types)
      attendanceType.forEach((type, index) => {
        filterParams[`filter[_and][4][_or][${index}][attendance][_eq]`] = type;
      });
    } else {
      // For single type (PresentReport or AbsentReport)
      filterParams["filter[_and][4][attendance][_eq]"] = attendanceType;
    }

    // Fields to include in the response
    const fields = [
      "employeeId.employeeId",
      "employeeId.assignedUser.first_name",
      "employeeId.assignedUser.designation",
      "employeeId.assignedUser.role.name",
      "employeeId.branch.branchName",
      "employeeId.department.departmentName",
      "attendance",
      "date",
    ];

    // Build the query parameters
    const queryParams = new URLSearchParams();
    
    // Add filter parameters
    Object.entries(filterParams).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    // Add fields
    fields.forEach(field => {
      queryParams.append("fields[]", field);
    });

    // Add limit
    queryParams.append("limit", "-1");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendance?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch attendance data");

    const { data } = await response.json();

    if (!data || data.length === 0) {
      alert("No attendance data available for the selected duration.");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return null;
  }
};

const exportReport = async (format) => {
  const data = await fetchAttendanceData();
  if (!data) return;

  const filename = `Attendance_${startDate.value}_to_${endDate.value}`;
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (format === 'excel') {
    downloadAttendanceAsExcel(sortedData, filename);
  } else if (format === 'csv') {
    downloadAttendanceAsCSV(sortedData, filename);
  } else if (format === 'pdf') {
    downloadAttendanceAsPDF(sortedData, filename);
  }
};

const downloadAttendanceAsExcel = async (data, filename) => {
  if (!data || data.length === 0) return;

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Data');

    // Define columns
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Role', key: 'role', width: 20 },

      { header: 'Department', key: 'department', width: 20 },
      { header: 'Attendance', key: 'attendance', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }
      };
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center' 
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    data.forEach(item => {
      worksheet.addRow({
        date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
        employeeId: item.employeeId?.employeeId || "N/A",
        name: item.employeeId?.assignedUser?.first_name || "N/A",
        role: item.employeeId?.assignedUser?.role?.name || "N/A",

        department: item.employeeId?.department?.departmentName || "N/A",
        attendance: item.attendance ? item.attendance.charAt(0).toUpperCase() + item.attendance.slice(1) : "N/A"
      });
    });

    // Style data rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: 'left' 
          };
        });
      }
    });

    // Generate and download the file
    const today = new Date().toISOString().split("T")[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${today}.xlsx`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    alert('Failed to export Excel file. Please try again.');
  }
};

const downloadAttendanceAsCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = [
    'Date',
    'Employee ID',
    'Name',
    'Role',

    'Department',
    'Attendance'
  ];

  const rows = data.map(item => [
    item.date ? new Date(item.date).toLocaleDateString() : "N/A",
    item.employeeId?.employeeId || "N/A",
    item.employeeId?.assignedUser?.first_name || "N/A",
    item.employeeId?.assignedUser?.role?.name || "N/A",

    item.employeeId?.department?.departmentName || "N/A",
    item.attendance ? item.attendance.charAt(0).toUpperCase() + item.attendance.slice(1) : "N/A"
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const today = new Date().toISOString().split("T")[0];
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${today}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const downloadAttendanceAsPDF = (data, filename) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  const headers = [
    'Date',
    'Employee ID',
    'Name',
    'Role',
    'Department',
    'Attendance'
  ];

  const rows = data.map(item => [
    item.date ? new Date(item.date).toLocaleDateString() : "N/A",
    item.employeeId?.employeeId || "N/A",
    item.employeeId?.assignedUser?.first_name || "N/A",
    item.employeeId?.assignedUser?.role?.name || "N/A",

    item.employeeId?.department?.departmentName || "N/A",
    item.attendance ? item.attendance.charAt(0).toUpperCase() + item.attendance.slice(1) : "N/A"
  ]);

  doc.setFontSize(12);
  doc.text('Attendance Report', 14, 20);
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    theme: 'grid',
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 2,
      fontSize: 10
    }
  });

  const today = new Date().toISOString().split("T")[0];
  doc.save(`${filename}_${today}.pdf`);
};

onMounted(() => {
  fetchBranches();
  fetchDepartments();
});

const availableBranches = computed(() => branches.value);
</script>

<style scoped>
.generate-report-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.header-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: white;
}

.layout-container {
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background-color: white;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 900px;
}
.department-with-dates {
  grid-column: span 2;
  display: flex;
  gap: 24px;
}

.department-with-dates .v-select {
  flex: 1;
}

.date-fields {
  flex: 1;
  display: flex;
  gap: 24px;
}

.date-fields .v-text-field {
  flex: 1;
}
/* Modern Form Styling */
:deep(.v-field) {
  border-radius: 8px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

:deep(.v-field__input) {
  min-height: 44px !important;
  padding: 0 12px !important;
}

:deep(.v-label) {
  font-size: 0.875rem;
  opacity: 0.8;
}

:deep(.v-messages) {
  min-height: 18px;
  font-size: 12px;
  color: rgb(var(--v-theme-error));
}

/* Responsive Design */
@media (max-width: 960px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .department-with-dates {
    flex-direction: column;
    grid-column: span 1;
  }
  
  .date-fields {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .content-area {
    padding: 16px;
  }
}
</style>
