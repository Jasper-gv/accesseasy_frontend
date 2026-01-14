<template>
  <div class="walk-in-reception">
    <v-container fluid class="fill-height pa-0">
      <v-row class="fill-height ma-0">
        <!-- Left Side - QR Code Display -->
        <v-col cols="12" md="7" class="qr-display-section d-flex align-center justify-center">
          <div class="qr-content text-center">
            <div class="welcome-header mb-8">
              <v-icon icon="mdi-account-group" size="64" color="primary" class="mb-4" />
              <h1 class="text-h3 font-weight-bold mb-2">Welcome Visitors!</h1>
              <p class="text-h6 text-grey-darken-1">
                Scan the QR code below to register your visit
              </p>
            </div>

            <!-- Large QR Code -->
            <v-card class="qr-card mx-auto" elevation="8" max-width="450">
              <v-card-text class="pa-8">
                <div class="qr-wrapper">
                  <img
                    v-if="receptionQR"
                    :src="receptionQR"
                    alt="Reception QR Code"
                    class="reception-qr"
                  />
                  <v-progress-circular
                    v-else
                    indeterminate
                    color="primary"
                    size="64"
                  />
                </div>
                
                <v-divider class="my-4" />
                
                <div class="qr-info">
                  <p class="text-body-1 font-weight-medium mb-2">
                    <v-icon icon="mdi-information" size="20" class="mr-2" color="info" />
                    Scan with your mobile camera
                  </p>
                  <p class="text-caption text-grey-darken-1">
                    QR code refreshes every 5 minutes for security
                  </p>
                </div>

                <!-- Refresh Timer -->
                <div class="refresh-timer mt-4">
                  <v-progress-linear
                    :model-value="refreshProgress"
                    color="primary"
                    height="6"
                    rounded
                  />
                  <p class="text-caption text-grey mt-2">
                    <v-icon icon="mdi-refresh" size="14" class="mr-1" />
                    Next refresh in {{ timeUntilRefresh }}
                  </p>
                </div>
              </v-card-text>
            </v-card>

            <!-- Instructions -->
            <div class="instructions mt-8">
              <v-row>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="primary" class="instruction-card">
                    <v-card-text class="text-center">
                      <v-icon icon="mdi-qrcode-scan" size="48" class="mb-2" />
                      <h3 class="text-h6 font-weight-bold mb-2">1. Scan QR</h3>
                      <p class="text-body-2">Use your phone camera to scan</p>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="secondary" class="instruction-card">
                    <v-card-text class="text-center">
                      <v-icon icon="mdi-form-textbox" size="48" class="mb-2" />
                      <h3 class="text-h6 font-weight-bold mb-2">2. Fill Form</h3>
                      <p class="text-body-2">Enter your details</p>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="success" class="instruction-card">
                    <v-card-text class="text-center">
                      <v-icon icon="mdi-check-circle" size="48" class="mb-2" />
                      <h3 class="text-h6 font-weight-bold mb-2">3. Get QR</h3>
                      <p class="text-body-2">Receive your visitor pass</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>

        <!-- Right Side - Statistics & Recent Visitors -->
        <v-col cols="12" md="5" class="stats-section pa-6">
          <div class="stats-content">
            <!-- Today's Stats -->
            <h2 class="text-h5 font-weight-bold mb-4">
              <v-icon icon="mdi-chart-box" class="mr-2" color="primary" />
              Today's Activity
            </h2>

            <v-row class="mb-6">
              <v-col cols="6">
                <v-card color="primary" variant="tonal" class="stat-card">
                  <v-card-text class="text-center">
                    <v-icon icon="mdi-account-multiple" size="40" class="mb-2" />
                    <div class="text-h3 font-weight-bold">{{ todayStats.total }}</div>
                    <div class="text-body-2">Total Visitors</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card color="success" variant="tonal" class="stat-card">
                  <v-card-text class="text-center">
                    <v-icon icon="mdi-login" size="40" class="mb-2" />
                    <div class="text-h3 font-weight-bold">{{ todayStats.checkedIn }}</div>
                    <div class="text-body-2">Checked In</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <!-- Recent Registrations -->
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon icon="mdi-clock-outline" class="mr-2" color="secondary" />
              Recent Registrations
            </h3>

            <v-card variant="outlined" class="recent-list">
              <v-list lines="two">
                <template v-if="recentVisitors.length > 0">
                  <v-list-item
                    v-for="(visitor, index) in recentVisitors"
                    :key="visitor.id"
                  >
                    <template #prepend>
                      <v-avatar color="primary" size="40">
                        <span class="text-white font-weight-bold">
                          {{ visitor.personName.charAt(0) }}
                        </span>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-medium">
                      {{ visitor.personName }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ visitor.purpose }} • {{ formatTime(visitor.createdAt) }}
                    </v-list-item-subtitle>

                    <template #append>
                      <VisitorStatusBadge :status="visitor.status" />
                    </template>

                    <v-divider v-if="index < recentVisitors.length - 1" class="mt-2" />
                  </v-list-item>
                </template>
                <v-list-item v-else>
                  <v-list-item-title class="text-center text-grey">
                    No registrations yet today
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>

            <!-- Auto-refresh indicator -->
            <div class="text-center mt-4">
              <v-chip size="small" color="info" variant="tonal">
                <v-icon icon="mdi-refresh" size="14" class="mr-1" />
                Auto-refreshing every 10 seconds
              </v-chip>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import QRCode from 'qrcode';
import { visitorService } from '@/services/visitorService';
import VisitorStatusBadge from '@/components/visitor/VisitorStatusBadge.vue';

const receptionQR = ref(null);
const recentVisitors = ref([]);
const todayStats = ref({
  total: 0,
  checkedIn: 0,
});

const refreshInterval = 5 * 60 * 1000; // 5 minutes
const lastRefreshTime = ref(Date.now());
const currentTime = ref(Date.now());

let qrRefreshTimer = null;
let statsRefreshTimer = null;
let clockTimer = null;

onMounted(() => {
  generateReceptionQR();
  fetchRecentVisitors();
  fetchTodayStats();

  // Auto-refresh QR every 5 minutes
  qrRefreshTimer = setInterval(generateReceptionQR, refreshInterval);

  // Auto-refresh stats every 10 seconds
  statsRefreshTimer = setInterval(() => {
    fetchRecentVisitors();
    fetchTodayStats();
  }, 10000);

  // Update clock every second
  clockTimer = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (qrRefreshTimer) clearInterval(qrRefreshTimer);
  if (statsRefreshTimer) clearInterval(statsRefreshTimer);
  if (clockTimer) clearInterval(clockTimer);
});

const generateReceptionQR = async () => {
  try {
    // Generate registration URL with timestamp
    const registrationUrl = `${window.location.origin}/visitor-register?type=walk-in&t=${Date.now()}`;
    receptionQR.value = await QRCode.toDataURL(registrationUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    lastRefreshTime.value = Date.now();
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
};

const fetchRecentVisitors = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const visitors = await visitorService.getVisitors({ 
      date: today,
      registrationType: 'walk-in',
    });
    recentVisitors.value = visitors.slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent visitors:', error);
  }
};

const fetchTodayStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const visitors = await visitorService.getVisitors({ date: today });
    
    todayStats.value = {
      total: visitors.length,
      checkedIn: visitors.filter(v => v.status === 'checked-in').length,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

const refreshProgress = computed(() => {
  const elapsed = currentTime.value - lastRefreshTime.value;
  return (elapsed / refreshInterval) * 100;
});

const timeUntilRefresh = computed(() => {
  const remaining = refreshInterval - (currentTime.value - lastRefreshTime.value);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.walk-in-reception {
  height: 100%;
  overflow: hidden;
}

.qr-display-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
}

.qr-content {
  max-width: 600px;
  padding: 40px 20px;
}

.qr-card {
  border-radius: 24px;
  background: white;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 20px;
}

.reception-qr {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  background: white;
  padding: 20px;
}

.instruction-card {
  border-radius: 16px;
  height: 100%;
}

.stats-section {
  background: #f8f9fa;
  overflow-y: auto;
  max-height: 100vh;
}

.stat-card {
  border-radius: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.recent-list {
  border-radius: 12px;
  max-height: 500px;
  overflow-y: auto;
}

@media (max-width: 960px) {
  .qr-display-section {
    min-height: auto;
  }

  .stats-section {
    max-height: none;
  }
}
</style>
