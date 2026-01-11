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
                <div class="text-h2 font-weight-bold text-white">{{ activeVisitors.length }}</div>
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
                <div class="text-h2 font-weight-bold text-white">{{ expectedVisitors.length }}</div>
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
            height="100"
            color="primary"
            class="action-btn"
            @click="openScanner"
          >
            <div class="d-flex flex-column align-center">
              <v-icon icon="mdi-qrcode-scan" size="40" class="mb-2" />
              <span class="text-h6">Scan QR Code</span>
            </div>
          </v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn
            block
            height="100"
            color="secondary"
            variant="tonal"
            class="action-btn"
            @click="refreshData"
          >
            <div class="d-flex flex-column align-center">
              <v-icon icon="mdi-refresh" size="40" class="mb-2" />
              <span class="text-h6">Refresh Data</span>
            </div>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <!-- Expected Visitors (Approved) -->
        <v-col cols="12" lg="6">
          <v-card elevation="2" class="rounded-lg h-100">
            <v-card-title class="pa-4 d-flex justify-space-between align-center border-b bg-grey-lighten-5">
              <span class="font-weight-bold text-info">
                <v-icon icon="mdi-clock-outline" class="mr-2" />
                Expected Visitors
              </span>
              <v-chip size="small" color="info">{{ expectedVisitors.length }}</v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <div v-if="expectedVisitors.length === 0" class="text-center pa-8 text-grey">
                No expected visitors at the moment.
              </div>
              <v-list v-else lines="two">
                <v-list-item
                  v-for="visitor in expectedVisitors"
                  :key="visitor.id"
                  class="border-b"
                >
                  <template v-slot:prepend>
                    <v-avatar color="info" variant="tonal">
                      <span class="text-h6">{{ visitor.personName.charAt(0) }}</span>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="font-weight-bold">
                    {{ visitor.personName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ visitor.company || visitor.purpose }} • {{ visitor.startTime }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn
                      color="success"
                      size="small"
                      prepend-icon="mdi-login"
                      @click="checkIn(visitor)"
                      :loading="processingId === visitor.id"
                    >
                      Check-in
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Active Visitors (Checked In) -->
        <v-col cols="12" lg="6">
          <v-card elevation="2" class="rounded-lg h-100">
            <v-card-title class="pa-4 d-flex justify-space-between align-center border-b bg-grey-lighten-5">
              <span class="font-weight-bold text-success">
                <v-icon icon="mdi-account-check" class="mr-2" />
                Active Visitors
              </span>
              <v-chip size="small" color="success">{{ activeVisitors.length }}</v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <div v-if="activeVisitors.length === 0" class="text-center pa-8 text-grey">
                No visitors currently inside.
              </div>
              <v-list v-else lines="two">
                <v-list-item
                  v-for="visitor in activeVisitors"
                  :key="visitor.id"
                  class="border-b"
                >
                  <template v-slot:prepend>
                    <v-avatar color="success" variant="tonal">
                      <span class="text-h6">{{ visitor.personName.charAt(0) }}</span>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="font-weight-bold">
                    {{ visitor.personName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    In: {{ formatTime(visitor.checkInTime) }} • {{ visitor.purpose }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn
                      color="warning"
                      size="small"
                      prepend-icon="mdi-logout"
                      @click="checkOut(visitor)"
                      :loading="processingId === visitor.id"
                    >
                      Check-out
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      <v-icon :icon="snackbarIcon" class="mr-2" />
      {{ snackbarMessage }}
    </v-snackbar>
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

const expectedVisitors = ref([]);
const activeVisitors = ref([]);
const processingId = ref(null);

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

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
    const allVisitors = await visitorService.getVisitors();
    
    // Filter for Expected (Approved or Pending, but for security usually Approved)
    // For demo, let's assume 'approved' are expected, and 'checked-in' are active
    expectedVisitors.value = allVisitors.filter(v => v.status === 'approved');
    activeVisitors.value = allVisitors.filter(v => v.status === 'checked-in');
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showNotification('Error loading data', 'error');
  }
};

const refreshData = async () => {
  await loadDashboardData();
  showNotification('Dashboard updated', 'success');
};

const checkIn = async (visitor) => {
  processingId.value = visitor.id;
  try {
    // Update status to checked-in
    await visitorService.updateVisitorStatus(visitor.id, 'checked-in');
    
    // Create entry log
    await visitorService.createEntryLog({
      visitorId: visitor.id,
      visitorName: visitor.personName,
      entryTime: new Date().toISOString(),
      action: 'check-in',
      gate: 'Main Entrance'
    });
    
    // Update local state immediately for responsiveness
    // In real app, we might reload data
    visitor.checkInTime = new Date().toISOString();
    visitor.status = 'checked-in';
    
    expectedVisitors.value = expectedVisitors.value.filter(v => v.id !== visitor.id);
    activeVisitors.value.push(visitor);
    
    showNotification(`${visitor.personName} checked in successfully`, 'success');
  } catch (error) {
    console.error('Error checking in:', error);
    showNotification('Error checking in visitor', 'error');
  } finally {
    processingId.value = null;
  }
};

const checkOut = async (visitor) => {
  processingId.value = visitor.id;
  try {
    // Update status to checked-out
    await visitorService.updateVisitorStatus(visitor.id, 'checked-out');
    
    // Create entry log
    await visitorService.createEntryLog({
      visitorId: visitor.id,
      visitorName: visitor.personName,
      entryTime: new Date().toISOString(), // Using entryTime field for timestamp
      action: 'check-out',
      gate: 'Main Entrance'
    });
    
    // Update local state
    activeVisitors.value = activeVisitors.value.filter(v => v.id !== visitor.id);
    
    showNotification(`${visitor.personName} checked out successfully`, 'success');
  } catch (error) {
    console.error('Error checking out:', error);
    showNotification('Error checking out visitor', 'error');
  } finally {
    processingId.value = null;
  }
};

const openScanner = () => {
  emit('change-view', 'scanner');
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const showNotification = (message, type = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = type;
  snackbarIcon.value = type === 'success' ? 'mdi-check-circle' : 
                       type === 'error' ? 'mdi-alert-circle' : 'mdi-information';
  showSnackbar.value = true;
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
