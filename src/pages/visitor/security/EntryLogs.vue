<template>
  <div class="entry-logs pa-6">
    <v-container fluid>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">
            <v-icon icon="mdi-format-list-bulleted" class="mr-2" color="primary" />
            Entry & Exit Logs
          </h1>
          <p class="text-body-1 text-grey-darken-1 mt-2">
            Track all visitor check-ins and check-outs
          </p>
        </div>
        
        <v-btn
          color="primary"
          prepend-icon="mdi-download"
          @click="exportLogs"
        >
          Export CSV
        </v-btn>
      </div>

      <!-- Filters -->
      <v-card class="filter-card mb-6" elevation="2">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.date"
                label="Date"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                density="comfortable"
                type="date"
                clearable
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.action"
                :items="actionOptions"
                label="Action"
                prepend-inner-icon="mdi-filter"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="filters.search"
                label="Search by visitor or guard"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-btn
                color="primary"
                block
                size="large"
                @click="applyFilters"
              >
                Apply
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Logs Table -->
      <v-card elevation="2">
        <v-card-text class="pa-0">
          <v-data-table
            :headers="headers"
            :items="logs"
            :loading="loading"
            class="logs-table"
          >
            <!-- Timestamp Column -->
            <template #item.timestamp="{ item }">
              <div>
                <div class="font-weight-medium">{{ formatDate(item.timestamp) }}</div>
                <div class="text-caption text-grey-darken-1">
                  {{ formatTime(item.timestamp) }}
                </div>
              </div>
            </template>

            <!-- Visitor Column -->
            <template #item.visitorName="{ item }">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="32" class="mr-2">
                  <span class="text-white text-caption font-weight-bold">
                    {{ item.visitorName.charAt(0) }}
                  </span>
                </v-avatar>
                <span class="font-weight-medium">{{ item.visitorName }}</span>
              </div>
            </template>

            <!-- Action Column -->
            <template #item.action="{ item }">
              <v-chip
                :color="item.action === 'check-in' ? 'success' : 'info'"
                size="small"
                variant="tonal"
              >
                <v-icon
                  :icon="item.action === 'check-in' ? 'mdi-login' : 'mdi-logout'"
                  size="14"
                  class="mr-1"
                />
                {{ item.action === 'check-in' ? 'Check-in' : 'Check-out' }}
              </v-chip>
            </template>

            <!-- Security Guard Column -->
            <template #item.securityGuard="{ item }">
              <v-chip size="small" variant="outlined">
                <v-icon icon="mdi-shield-account" size="14" class="mr-1" />
                {{ item.securityGuard }}
              </v-chip>
            </template>

            <!-- Door Column -->
            <template #item.door="{ item }">
              <v-chip size="small" color="grey-darken-1" variant="tonal">
                <v-icon icon="mdi-door" size="14" class="mr-1" />
                {{ item.door }}
              </v-chip>
            </template>

            <!-- QR Valid Column -->
            <template #item.qrValid="{ item }">
              <v-icon
                :icon="item.qrValid ? 'mdi-check-circle' : 'mdi-close-circle'"
                :color="item.qrValid ? 'success' : 'error'"
                size="20"
              />
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- Statistics Summary -->
      <v-row class="mt-6">
        <v-col cols="12" md="4">
          <v-card color="success" variant="tonal">
            <v-card-text class="text-center">
              <v-icon icon="mdi-login" size="40" class="mb-2" />
              <div class="text-h4 font-weight-bold">{{ stats.checkIns }}</div>
              <div class="text-body-2">Total Check-ins</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card color="info" variant="tonal">
            <v-card-text class="text-center">
              <v-icon icon="mdi-logout" size="40" class="mb-2" />
              <div class="text-h4 font-weight-bold">{{ stats.checkOuts }}</div>
              <div class="text-body-2">Total Check-outs</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card color="warning" variant="tonal">
            <v-card-text class="text-center">
              <v-icon icon="mdi-account-clock" size="40" class="mb-2" />
              <div class="text-h4 font-weight-bold">{{ stats.stillInside }}</div>
              <div class="text-body-2">Still Inside</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { visitorService } from '@/services/visitorService';

const loading = ref(false);
const logs = ref([]);

const filters = ref({
  date: null,
  action: null,
  search: '',
});

const headers = [
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Visitor Name', key: 'visitorName', sortable: true },
  { title: 'Action', key: 'action', sortable: true },
  { title: 'Security Guard', key: 'securityGuard', sortable: false },
  { title: 'Door/Gate', key: 'door', sortable: false },
  { title: 'QR Valid', key: 'qrValid', sortable: false, align: 'center' },
];

const actionOptions = [
  { title: 'All', value: null },
  { title: 'Check-in', value: 'check-in' },
  { title: 'Check-out', value: 'check-out' },
];

onMounted(() => {
  fetchLogs();
});

const fetchLogs = async () => {
  loading.value = true;
  try {
    logs.value = await visitorService.getEntryLogs(filters.value);
  } catch (error) {
    console.error('Error fetching logs:', error);
  } finally {
    loading.value = false;
  }
};

const stats = computed(() => {
  const checkIns = logs.value.filter(l => l.action === 'check-in').length;
  const checkOuts = logs.value.filter(l => l.action === 'check-out').length;
  return {
    checkIns,
    checkOuts,
    stillInside: checkIns - checkOuts,
  };
});

const applyFilters = () => {
  fetchLogs();
};

const exportLogs = () => {
  // Simple CSV export
  const csvContent = [
    ['Timestamp', 'Visitor Name', 'Action', 'Security Guard', 'Door', 'QR Valid'].join(','),
    ...logs.value.map(log => [
      log.timestamp,
      log.visitorName,
      log.action,
      log.securityGuard,
      log.door,
      log.qrValid ? 'Yes' : 'No',
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `visitor-logs-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.entry-logs {
  background: #f5f7fa;
  min-height: 100vh;
}

.filter-card {
  border-radius: 16px;
}

.logs-table {
  border-radius: 16px;
}
</style>
