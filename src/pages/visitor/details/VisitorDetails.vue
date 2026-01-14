<template>
  <div class="visitor-details">
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    
    <div v-else-if="visitor">
      <!-- Header -->
      <div class="d-flex align-center mb-6">
        <v-avatar color="primary" size="64" class="mr-4">
          <span class="text-h4 text-white font-weight-bold">
            {{ visitor.personName.charAt(0) }}
          </span>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-bold">{{ visitor.personName }}</h2>
          <div class="d-flex align-center mt-1">
            <v-icon icon="mdi-domain" size="small" class="mr-1 text-grey" />
            <span class="text-body-2 text-grey-darken-1">{{ visitor.company || 'No Company' }}</span>
            <v-divider vertical class="mx-2" />
            <VisitorStatusBadge :status="visitor.status" />
          </div>
        </div>
      </div>

      <v-divider class="mb-6" />

      <v-row>
        <!-- Left Column: Info & Badge -->
        <v-col cols="12" md="7">
          <!-- Basic Info -->
          <v-card variant="outlined" class="mb-6 rounded-lg">
            <v-card-title class="text-subtitle-1 font-weight-bold bg-grey-lighten-5 py-2">
              Visit Information
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="6">
                  <div class="text-caption text-grey">Host</div>
                  <div class="font-weight-medium">{{ visitor.hostName }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Purpose</div>
                  <div class="font-weight-medium">{{ visitor.purpose }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Date</div>
                  <div class="font-weight-medium">{{ formatDate(visitor.visitDate) }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Time</div>
                  <div class="font-weight-medium">{{ visitor.startTime }} - {{ visitor.endTime }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Email</div>
                  <div class="font-weight-medium">{{ visitor.email }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption text-grey">Phone</div>
                  <div class="font-weight-medium">{{ visitor.mobileNumber }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Badge Preview -->
          <v-card variant="outlined" class="rounded-lg">
            <v-card-title class="text-subtitle-1 font-weight-bold bg-grey-lighten-5 py-2">
              Visitor Badge
            </v-card-title>
            <v-card-text class="pa-4 d-flex justify-center bg-grey-lighten-4">
              <!-- Mock Badge Display -->
              <div class="visitor-badge bg-white elevation-2 rounded overflow-hidden" style="width: 280px; height: 400px;">
                <div class="bg-primary pa-4 text-center text-white">
                  <div class="text-h6 font-weight-bold">Acme Corp</div>
                  <div class="text-caption">VISITOR</div>
                </div>
                <div class="pa-6 text-center">
                  <v-avatar size="100" color="grey-lighten-2" class="mb-4">
                    <span class="text-h3">{{ visitor.personName.charAt(0) }}</span>
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold mb-1">{{ visitor.personName }}</h3>
                  <div class="text-body-2 text-grey mb-4">{{ visitor.company }}</div>
                  
                  <div v-if="visitor.qrCode" class="qr-code mb-4">
                    <img :src="visitor.qrCode" style="width: 120px; height: 120px;" />
                  </div>
                  
                  <div class="text-caption text-grey">
                    Valid: {{ formatDate(visitor.visitDate) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column: Timeline & Logs -->
        <v-col cols="12" md="5">
          <v-card variant="outlined" class="rounded-lg h-100">
            <v-card-title class="text-subtitle-1 font-weight-bold bg-grey-lighten-5 py-2">
              Activity Timeline
            </v-card-title>
            <v-card-text class="pa-4">
              <v-timeline density="compact" align="start" side="end">
                <v-timeline-item
                  v-for="(log, index) in logs"
                  :key="index"
                  :dot-color="getLogColor(log.action)"
                  size="small"
                >
                  <div class="d-flex justify-space-between align-center">
                    <div class="font-weight-bold mr-2">{{ formatLogAction(log.action) }}</div>
                    <div class="text-caption text-grey">{{ formatTime(log.timestamp) }}</div>
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ log.details || log.door || 'System' }}
                  </div>
                </v-timeline-item>
              </v-timeline>
              
              <div v-if="logs.length === 0" class="text-center text-grey py-4">
                No activity recorded yet.
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <div v-else class="text-center pa-8 text-grey">
      Visitor not found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { visitorService } from '@/services/visitorService';
import VisitorStatusBadge from '@/components/visitor/VisitorStatusBadge.vue';

const props = defineProps({
  visitorId: {
    type: [String, Number],
    required: true,
  },
});

const loading = ref(true);
const visitor = ref(null);
const logs = ref([]);

const loadVisitorData = async () => {
  loading.value = true;
  try {
    // Fetch visitor details
    // In a real app, we might need a specific getVisitorById method
    // For now, we'll fetch all and find (mock)
    const visitors = await visitorService.getVisitors();
    visitor.value = visitors.find(v => v.id == props.visitorId);
    
    if (visitor.value) {
      // Fetch logs for this visitor
      // Mock logs based on visitor status
      logs.value = generateMockLogs(visitor.value);
    }
  } catch (error) {
    console.error('Error loading visitor details:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadVisitorData();
});

watch(() => props.visitorId, () => {
  loadVisitorData();
});

const generateMockLogs = (visitor) => {
  const logs = [];
  const date = visitor.visitDate;
  
  logs.push({
    action: 'registered',
    timestamp: `${date}T09:00:00`,
    details: 'Online Registration',
  });
  
  if (visitor.status === 'approved' || visitor.status === 'checked-in' || visitor.status === 'checked-out') {
    logs.push({
      action: 'approved',
      timestamp: `${date}T09:30:00`,
      details: 'Approved by Admin',
    });
  }
  
  if (visitor.status === 'checked-in' || visitor.status === 'checked-out') {
    logs.push({
      action: 'check-in',
      timestamp: `${date}T${visitor.startTime}`,
      door: 'Main Entrance',
    });
  }
  
  if (visitor.status === 'checked-out') {
    logs.push({
      action: 'check-out',
      timestamp: `${date}T${visitor.endTime}`,
      door: 'Main Entrance',
    });
  }
  
  return logs.reverse();
};

const getLogColor = (action) => {
  switch (action) {
    case 'registered': return 'info';
    case 'approved': return 'success';
    case 'check-in': return 'primary';
    case 'check-out': return 'warning';
    case 'rejected': return 'error';
    default: return 'grey';
  }
};

const formatLogAction = (action) => {
  return action.charAt(0).toUpperCase() + action.slice(1).replace('-', ' ');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  // Handle simple time strings like "10:00" by appending dummy date
  if (isoString.length === 5) return isoString;
  
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.visitor-details {
  background: white;
}

.visitor-badge {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
}
</style>
