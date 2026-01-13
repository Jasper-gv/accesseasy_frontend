<template>
  <v-app>
    <v-container class="app-wrapper" fluid>
      <!-- Filter Section -->
      <v-card class="mb-4 pa-4" elevation="0" border>
        <div class="d-flex flex-wrap gap-4 align-center">
          <!-- Date Selection -->
          <div class="filter-group d-flex gap-2" style="min-width: 300px;">
            <v-text-field
              v-model="startDate"
              type="date"
              label="From Date"
              density="compact"
              variant="outlined"
              hide-details
            ></v-text-field>
            <v-text-field
              v-model="endDate"
              type="date"
              label="To Date"
              density="compact"
              variant="outlined"
              hide-details
            ></v-text-field>
          </div>

          <!-- Attendance Mode Filter -->
          <div class="filter-group" style="min-width: 200px;">
            <v-select
              v-model="selectedModes"
              :items="modeOptions"
              label="Attendance Mode"
              multiple
              chips
              closable-chips
              density="compact"
              variant="outlined"
              hide-details
            ></v-select>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2 ml-auto align-center">
            <BaseButton
              variant="primary"
              size="md"
              text="Generate Report"
              :leftIcon="Search"
              @click="fetchLogs"
              :loading="loading"
            />
            <BaseButton
              variant="success"
              size="md"
              text="Export to Excel"
              :leftIcon="Download"
              @click="exportToExcel"
              :disabled="items.length === 0 || loading"
            />
          </div>
        </div>
      </v-card>

      <!-- Table Section -->
      <DataTableWrapper 
        title="Attendance Logs" 
        :showSearch="true"
        v-model:searchQuery="search"
      >
        <!-- Loading State -->
        <SkeletonLoader
          v-if="loading"
          variant="data-table"
          :rows="10"
          :columns="headers.length"
        />

        <!-- Data Table with Pagination -->
        <div v-else>
          <DataTable
            :items="paginatedItems"
            :columns="headers"
            :showSelection="false"
            :expandable="false"
            show-header
            :row-clickable="false"
          >
            <!-- Custom Slots -->
            <template #cell-timeStamp="{ item }">
              {{ formatTime(item.timeStamp) }}
            </template>
            
            <template #cell-mode="{ item }">
              <v-chip
                :color="getModeColor(item.mode)"
                size="small"
                class="text-capitalize"
                label
              >
                {{ item.mode }}
              </v-chip>
            </template>

            <template #cell-status="{ item }">
               <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                class="text-capitalize"
                label
              >
                {{ item.status || 'Unknown' }}
              </v-chip>
            </template>

            <template #cell-action="{ item }">
              <v-chip
                :color="getActionColor(item.action)"
                size="small"
                class="text-capitalize"
                label
              >
                {{ item.action }}
              </v-chip>
            </template>

            <!-- Empty State Slot -->
            <template #no-data>
              <EmptyState
                title="No Logs Found"
                description="No attendance logs found for the selected criteria. Try adjusting your filters."
                icon="mdi-clipboard-text-off-outline"
              />
            </template>
          </DataTable>

          <!-- Pagination -->
          <CustomPagination
            v-if="filteredItems.length > 0"
            :total-items="filteredItems.length"
            :items-per-page="itemsPerPage"
            :current-page="currentPage"
            @page-change="handlePageChange"
            @items-per-page-change="handleItemsPerPageChange"
            class="mt-4"
          />
        </div>
      </DataTableWrapper>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import * as XLSX from 'xlsx';
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import { Search, Download } from "lucide-vue-next";

// State
const loading = ref(false);
const items = ref([]);
const search = ref("");
const startDate = ref(new Date().toISOString().substr(0, 10));
const endDate = ref(new Date().toISOString().substr(0, 10));
const selectedModes = ref(['rfid', 'face', 'finger', 'qr']);

// Pagination State
const currentPage = ref(1);
const itemsPerPage = ref(10);

const modeOptions = [
  { title: 'RFID', value: 'rfid' },
  { title: 'Face', value: 'face' },
  { title: 'Finger', value: 'finger' },
  { title: 'QR', value: 'qr' }
];

// Headers for Custom DataTable
const headers = [
  { label: 'Date', key: 'date', sortable: true, width: '120px' },
  { label: 'Employee Name', key: 'employeeName', sortable: true, width: '200px' },
  { label: 'In Time', key: 'inTime', sortable: true, width: '100px' },
  { label: 'Out Time', key: 'outTime', sortable: true, width: '100px' },
  { label: 'Mode', key: 'mode', sortable: true, width: '100px', align: 'center' },
  { label: 'Status', key: 'status', sortable: true, width: '100px', align: 'center' },
  { label: 'Action', key: 'action', sortable: true, width: '100px', align: 'center' },
  { label: 'Tenant', key: 'tenantName', sortable: true, width: '150px' },
];

// Tenant Info
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();

// Computed
const filteredItems = computed(() => {
  if (!search.value) return items.value;
  const lowerSearch = search.value.toLowerCase();
  return items.value.filter(item => 
    item.employeeName?.toLowerCase().includes(lowerSearch) ||
    item.employeeId?.toLowerCase().includes(lowerSearch) ||
    item.tenantName?.toLowerCase().includes(lowerSearch)
  );
});

const paginatedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredItems.value.slice(startIndex, endIndex);
});

// Watchers
watch(search, () => {
  currentPage.value = 1;
});

// Methods
const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
};

const getModeColor = (mode) => {
  const colors = {
    rfid: 'blue',
    face: 'purple',
    finger: 'orange',
    qr: 'green'
  };
  return colors[mode?.toLowerCase()] || 'grey';
};

const getActionColor = (action) => {
  return action?.toLowerCase() === 'in' ? 'success' : 'error';
};

const getStatusColor = (status) => {
    return status?.toLowerCase() === 'active' ? 'success' : 'grey';
}

const formatTime = (time) => {
  if (!time) return '-';
  return time; 
};

const fetchLogs = async () => {
  loading.value = true;
  items.value = [];
  currentPage.value = 1; // Reset pagination on new fetch

  try {
    const params = new URLSearchParams();
    
    // Base filters
    params.append('filter[_and][0][_and][0][tenant][tenantId][_eq]', tenantId);
    
    // Date Filter
    params.append('filter[_and][0][_and][1][date][_between]', `${startDate.value},${endDate.value}`);

    // Mode Filter
    if (selectedModes.value.length > 0) {
        params.append('filter[_and][0][_and][2][mode][_in]', selectedModes.value.join(','));
    }

    // Fields
    const fields = [
      'employeeId.assignedUser.first_name',
      'employeeId.employeeId',
      'timeStamp',
      'date',
      'status',
      'mode',
      'action',
      'tenant.tenantName',
      'id'
    ];
    fields.forEach(f => params.append('fields[]', f));

    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/logs?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch logs');

    const data = await response.json();
    
    // Transform data
    items.value = data.data.map(log => {
      const isCheckIn = log.action?.toLowerCase() === 'in';
      return {
        id: log.id,
        date: log.date,
        employeeName: log.employeeId?.assignedUser?.first_name || 'Unknown',
        employeeId: log.employeeId?.employeeId,
        inTime: isCheckIn ? log.timeStamp : '-',
        outTime: !isCheckIn ? log.timeStamp : '-',
        timeStamp: log.timeStamp,
        mode: log.mode,
        status: log.status,
        action: log.action,
        tenantName: log.tenant?.tenantName || '-'
      };
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
  } finally {
    loading.value = false;
  }
};

const exportToExcel = () => {
  const exportData = items.value.map(item => ({
    Date: item.date,
    'Employee Name': item.employeeName,
    'In Time': item.inTime,
    'Out Time': item.outTime,
    Mode: item.mode,
    Status: item.status,
    'Tenant Name': item.tenantName
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
  
  const fileName = `Attendance_Report_${startDate.value}_to_${endDate.value}.xlsx`;
    
  XLSX.writeFile(wb, fileName);
};

// Initial fetch
onMounted(() => {
  // Optional: fetchLogs(); 
});
</script>

<style scoped>
.app-wrapper {
  max-height: 80vh;
  background-color: white;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw;
  box-sizing: border-box;
  overflow-y: auto;
}

.gap-4 {
  gap: 16px;
}

.gap-2 {
  gap: 8px;
}
</style>
