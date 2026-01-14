<template>
  <div class="visitor-scanner h-100 d-flex flex-column bg-black">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center pa-4 bg-black text-white">
      <v-btn icon variant="text" color="white" @click="close">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="text-h6">Scan QR Code</div>
      <v-btn icon variant="text" color="white">
        <v-icon>mdi-flash</v-icon>
      </v-btn>
    </div>

    <!-- Scanner Area -->
    <div class="scanner-viewport flex-grow-1 position-relative d-flex align-center justify-center">
      <!-- Camera Feed Placeholder -->
      <div class="camera-feed w-100 h-100 bg-grey-darken-4 d-flex align-center justify-center">
        <div v-if="!scanning" class="text-center">
          <v-icon icon="mdi-camera-off" size="64" color="grey" />
          <div class="mt-4 text-grey">Camera inactive</div>
          <v-btn color="primary" class="mt-4" @click="startScanning">Start Camera</v-btn>
        </div>
        <div v-else class="text-center">
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="mt-4 text-white">Scanning...</div>
          <!-- Simulate Scan Button for Demo -->
          <v-btn color="success" class="mt-8" @click="simulateScan">Simulate Scan</v-btn>
        </div>
      </div>

      <!-- Overlay -->
      <div class="scanner-overlay position-absolute top-0 left-0 w-100 h-100 pointer-events-none">
        <div class="scan-area-border"></div>
      </div>
    </div>

    <!-- Manual Entry Toggle -->
    <div class="bg-black pa-4 text-center">
      <v-btn variant="text" color="white" prepend-icon="mdi-keyboard" @click="toggleManual">
        Enter Code Manually
      </v-btn>
    </div>

    <!-- Validation Result Dialog -->
    <v-dialog v-model="showResult" max-width="400" persistent>
      <v-card v-if="scannedVisitor" class="rounded-lg">
        <div :class="['status-header pa-4 text-center', isValid ? 'bg-success' : 'bg-error']">
          <v-icon :icon="isValid ? 'mdi-check-circle' : 'mdi-alert-circle'" size="64" color="white" />
          <div class="text-h5 font-weight-bold text-white mt-2">{{ isValid ? 'Access Granted' : 'Access Denied' }}</div>
        </div>

        <v-card-text class="pa-6 text-center">
          <v-avatar size="80" color="grey-lighten-2" class="mb-4">
            <span class="text-h4 font-weight-bold">{{ scannedVisitor.personName.charAt(0) }}</span>
          </v-avatar>
          
          <h3 class="text-h6 font-weight-bold">{{ scannedVisitor.personName }}</h3>
          <div class="text-body-2 text-grey mb-4">{{ scannedVisitor.company || 'No Company' }}</div>

          <v-chip :color="isValid ? 'success' : 'error'" variant="tonal" class="mb-4">
            {{ scannedVisitor.status.toUpperCase() }}
          </v-chip>

          <div class="info-grid text-left bg-grey-lighten-4 pa-4 rounded mb-4">
            <div class="mb-2"><span class="text-caption text-grey">Host:</span> <span class="font-weight-medium">{{ scannedVisitor.hostName }}</span></div>
            <div class="mb-2"><span class="text-caption text-grey">Purpose:</span> <span class="font-weight-medium">{{ scannedVisitor.purpose }}</span></div>
            <div><span class="text-caption text-grey">Time:</span> <span class="font-weight-medium">{{ scannedVisitor.startTime }} - {{ scannedVisitor.endTime }}</span></div>
          </div>

          <div v-if="isValid" class="d-flex gap-2">
            <v-btn 
              v-if="!isCheckedIn"
              block 
              color="success" 
              size="large" 
              @click="processCheckIn"
              :loading="processing"
            >
              Check In
            </v-btn>
            <v-btn 
              v-else
              block 
              color="warning" 
              size="large" 
              @click="processCheckOut"
              :loading="processing"
            >
              Check Out
            </v-btn>
          </div>
          <div v-else>
            <div class="text-error text-body-2 mb-4">{{ denialReason }}</div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-btn block variant="text" @click="resetScanner">Scan Next</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { visitorService } from '@/services/visitorService';

const emit = defineEmits(['close']);

const scanning = ref(false);
const showResult = ref(false);
const scannedVisitor = ref(null);
const processing = ref(false);
const isCheckedIn = ref(false);

const isValid = computed(() => {
  return scannedVisitor.value && scannedVisitor.value.status === 'approved';
});

const denialReason = computed(() => {
  if (!scannedVisitor.value) return '';
  if (scannedVisitor.value.status === 'rejected') return 'Visitor request was rejected.';
  if (scannedVisitor.value.status === 'pending') return 'Visitor request is pending approval.';
  return 'Invalid QR Code';
});

const startScanning = () => {
  scanning.value = true;
};

const simulateScan = async () => {
  scanning.value = false;
  // Mock fetching visitor by QR
  try {
    const visitors = await visitorService.getVisitors();
    // Pick a random visitor for demo
    const randomVisitor = visitors[Math.floor(Math.random() * visitors.length)];
    scannedVisitor.value = randomVisitor;
    isCheckedIn.value = false; // Reset for demo
    showResult.value = true;
  } catch (error) {
    console.error('Error scanning:', error);
  }
};

const processCheckIn = async () => {
  processing.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  isCheckedIn.value = true;
  processing.value = false;
  // In real app, call API to update status/log
};

const processCheckOut = async () => {
  processing.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  isCheckedIn.value = false;
  processing.value = false;
  showResult.value = false;
  startScanning();
};

const resetScanner = () => {
  showResult.value = false;
  scannedVisitor.value = null;
  startScanning();
};

const close = () => {
  emit('close');
};

const toggleManual = () => {
  // Switch to manual entry mode (could be a dialog or separate view)
  console.log('Toggle manual entry');
};
</script>

<style scoped>
.scanner-viewport {
  overflow: hidden;
}

.scan-area-border {
  width: 250px;
  height: 250px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.scan-area-border::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #4CAF50;
  border-radius: 20px;
  clip-path: polygon(0% 20%, 0% 0%, 20% 0%, 80% 0%, 100% 0%, 100% 20%, 100% 80%, 100% 100%, 80% 100%, 20% 100%, 0% 100%, 0% 80%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.pointer-events-none {
  pointer-events: none;
}
</style>
