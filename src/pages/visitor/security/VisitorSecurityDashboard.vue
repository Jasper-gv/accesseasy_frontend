<template>
  <div class="visitor-security-dashboard pa-6">
    <v-container fluid>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">
            <v-icon icon="mdi-shield-account" class="mr-2" color="primary" />
            Security Panel
          </h1>
          <p class="text-body-1 text-grey-darken-1 mt-2">
            Monitor and control visitor access
          </p>
        </div>
        <div class="text-right">
          <div class="text-h6 font-weight-bold">{{ currentTime }}</div>
          <div class="text-caption text-grey">{{ currentDate }}</div>
        </div>
      </div>

      <!-- Live Counters -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card color="primary" variant="flat" class="security-stat-card">
            <v-card-text class="d-flex align-center justify-space-between pa-6">
              <div>
                <div class="text-h2 font-weight-bold text-white">{{ stats.activeCount }}</div>
                <div class="text-h6 text-white opacity-90 mt-1">Visitors Inside</div>
              </div>
              <v-icon icon="mdi-account-group" size="80" color="white" class="opacity-20" />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card color="info" variant="flat" class="security-stat-card">
            <v-card-text class="d-flex align-center justify-space-between pa-6">
              <div>
                <div class="text-h2 font-weight-bold text-white">{{ stats.expectedCount }}</div>
                <div class="text-h6 text-white opacity-90 mt-1">Expected Today</div>
              </div>
              <v-icon icon="mdi-calendar-clock" size="80" color="white" class="opacity-20" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row class="mb-8">
        <v-col cols="12" md="6">
          <v-btn
            block
            height="120"
            color="primary"
            class="action-btn"
            @click="openScanner"
          >
            <div class="d-flex flex-column align-center">
              <v-icon icon="mdi-qrcode-scan" size="48" class="mb-2" />
              <span class="text-h6">Scan QR Code</span>
              <span class="text-caption opacity-80">Check-in / Check-out</span>
            </div>
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn
            block
            height="120"
            color="secondary"
            variant="tonal"
            class="action-btn"
            @click="openManualEntry"
          >
            <div class="d-flex flex-column align-center">
              <v-icon icon="mdi-keyboard" size="48" class="mb-2" />
              <span class="text-h6">Manual Entry</span>
              <span class="text-caption opacity-80">Search by name or ID</span>
            </div>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Recent Logs -->
      <v-card elevation="2" class="rounded-lg">
        <v-card-title class="pa-4 d-flex justify-space-between align-center border-b">
          <span class="font-weight-bold">
            <v-icon icon="mdi-history" class="mr-2" />
            Recent Activity
          </span>
          <v-btn variant="text" size="small" color="primary" @click="viewAllLogs">
            View All Logs
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Visitor</th>
                <th>Action</th>
                <th>Gate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in recentLogs" :key="log.id">
                <td class="text-caption">{{ formatTime(log.timestamp) }}</td>
                <td>
                  <div class="font-weight-medium">{{ log.visitorName }}</div>
                  <div class="text-caption text-grey">{{ log.company }}</div>
                </td>
                <td>
                  <v-chip
                    size="small"
                    :color="log.action === 'check-in' ? 'success' : 'warning'"
                    variant="tonal"
                  >
                    {{ log.action === 'check-in' ? 'Check-in' : 'Check-out' }}
                  </v-chip>
                </td>
                <td class="text-caption text-grey">{{ log.gate }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { visitorService } from '@/services/visitorService';

const emit = defineEmits(['change-view']);
const router = useRouter();

const currentTime = ref('');
const currentDate = ref('');
const timer = ref(null);

const stats = ref({
  activeCount: 0,
  expectedCount: 0,
});

const recentLogs = ref([]);

onMounted(async () => {
  updateTime();
  timer.value = setInterval(updateTime, 1000);
  await loadDashboardData();
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  currentDate.value = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

const loadDashboardData = async () => {
  try {
    const data = await visitorService.getVisitorStats();
    stats.value = {
      activeCount: data.activeCount,
      expectedCount: data.todayCount, // Approximation for demo
    };
    
    // Mock recent logs
    recentLogs.value = [
      { id: 1, timestamp: new Date().toISOString(), visitorName: 'John Doe', company: 'Tech Corp', action: 'check-in', gate: 'Main Entrance' },
      { id: 2, timestamp: new Date(Date.now() - 15*60000).toISOString(), visitorName: 'Jane Smith', company: 'Design Co', action: 'check-out', gate: 'Main Entrance' },
      { id: 3, timestamp: new Date(Date.now() - 45*60000).toISOString(), visitorName: 'Mike Johnson', company: 'Consulting Ltd', action: 'check-in', gate: 'Rear Entrance' },
    ];
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
};

const openScanner = () => {
  emit('change-view', 'scanner');
};

const openManualEntry = () => {
  emit('change-view', 'manual-entry'); // Or reuse scanner view with manual tab active
};

const viewAllLogs = () => {
  emit('change-view', 'logs');
};

const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.visitor-security-dashboard {
  background: #f5f7fa;
  min-height: 100vh;
}

.security-stat-card {
  border-radius: 16px;
  overflow: hidden;
}

.action-btn {
  border-radius: 16px;
  text-transform: none;
  letter-spacing: normal;
}
</style>
