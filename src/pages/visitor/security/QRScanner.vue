<template>
  <div class="qr-scanner">
    <v-container fluid class="fill-height pa-0">
      <v-row class="fill-height ma-0">
        <!-- Scanner Section -->
        <v-col cols="12" md="6" class="scanner-section pa-6">
          <div class="scanner-content">
            <h1 class="text-h4 font-weight-bold mb-4">
              <v-icon icon="mdi-qrcode-scan" class="mr-2" color="primary" />
              QR Code Scanner
            </h1>

            <!-- Scanner Card -->
            <v-card class="scanner-card" elevation="4">
              <v-card-text class="pa-6">
                <div class="scanner-placeholder">
                  <v-icon icon="mdi-qrcode-scan" size="120" color="grey-lighten-1" />
                  <p class="text-h6 mt-4 text-grey-darken-1">
                    Camera scanner would appear here
                  </p>
                  <p class="text-caption text-grey">
                    In production, integrate html5-qrcode library
                  </p>
                </div>
              </v-card-text>
            </v-card>

            <!-- Manual Input -->
            <v-card class="mt-4" elevation="2">
              <v-card-text>
                <h3 class="text-h6 font-weight-bold mb-3">Manual QR Input</h3>
                <v-textarea
                  v-model="manualQRInput"
                  label="Paste QR Code Data"
                  prepend-inner-icon="mdi-text-box"
                  variant="outlined"
                  rows="3"
                  hint="For testing: paste QR data JSON"
                  persistent-hint
                />
                <v-btn
                  color="primary"
                  block
                  size="large"
                  class="mt-3"
                  prepend-icon="mdi-check"
                  @click="validateManualQR"
                  :loading="validating"
                >
                  Validate QR
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Quick Test Buttons -->
            <v-card class="mt-4" color="grey-lighten-4" variant="tonal">
              <v-card-text>
                <h3 class="text-subtitle-1 font-weight-bold mb-3">Quick Test</h3>
                <div class="d-flex flex-wrap gap-2">
                  <v-btn
                    color="success"
                    size="small"
                    @click="simulateScan('valid')"
                  >
                    Simulate Valid QR
                  </v-btn>
                  <v-btn
                    color="error"
                    size="small"
                    @click="simulateScan('expired')"
                  >
                    Simulate Expired QR
                  </v-btn>
                  <v-btn
                    color="warning"
                    size="small"
                    @click="simulateScan('invalid')"
                  >
                    Simulate Invalid QR
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <!-- Validation Result Section -->
        <v-col cols="12" md="6" class="result-section pa-6">
          <div v-if="!validationResult" class="empty-state text-center">
            <v-icon icon="mdi-qrcode" size="100" color="grey-lighten-2" />
            <h2 class="text-h5 font-weight-bold mt-4 text-grey-darken-1">
              Scan a QR Code
            </h2>
            <p class="text-body-1 text-grey">
              Validation result will appear here
            </p>
          </div>

          <!-- Valid Result -->
          <div v-else-if="validationResult.valid" class="validation-result valid-result">
            <v-card color="success" variant="tonal" class="result-card" elevation="8">
              <v-card-text class="text-center pa-8">
                <v-icon icon="mdi-check-circle" size="120" color="success" class="mb-4" />
                <h2 class="text-h3 font-weight-bold mb-2">ENTRY ALLOWED</h2>
                <p class="text-h6 mb-6">Valid Visitor Pass</p>

                <v-divider class="my-4" />

                <!-- Visitor Info -->
                <div class="visitor-info mt-6">
                  <v-avatar color="success" size="80" class="mb-4">
                    <span class="text-h3 text-white font-weight-bold">
                      {{ validationResult.visitor?.personName?.charAt(0) || 'V' }}
                    </span>
                  </v-avatar>

                  <h3 class="text-h5 font-weight-bold mb-4">
                    {{ validationResult.visitor?.personName || 'Visitor' }}
                  </h3>

                  <v-list bg-color="transparent">
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-briefcase" color="success" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        {{ validationResult.visitor?.purpose || 'N/A' }}
                      </v-list-item-title>
                      <v-list-item-subtitle>Purpose</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-account-tie" color="success" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        {{ validationResult.visitor?.hostName || 'N/A' }}
                      </v-list-item-title>
                      <v-list-item-subtitle>Host</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-clock" color="success" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        {{ formatTime(validationResult.data?.validFrom) }} - 
                        {{ formatTime(validationResult.data?.validUntil) }}
                      </v-list-item-title>
                      <v-list-item-subtitle>Valid Time</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>

                <v-btn
                  color="success"
                  size="x-large"
                  block
                  class="mt-6"
                  prepend-icon="mdi-login"
                  @click="logEntry"
                  :loading="logging"
                >
                  Log Entry
                </v-btn>
              </v-card-text>
            </v-card>
          </div>

          <!-- Invalid/Expired Result -->
          <div v-else class="validation-result invalid-result">
            <v-card 
              :color="validationResult.status === 'expired' ? 'warning' : 'error'"
              variant="tonal"
              class="result-card"
              elevation="8"
            >
              <v-card-text class="text-center pa-8">
                <v-icon
                  :icon="validationResult.status === 'expired' ? 'mdi-timer-off' : 'mdi-close-circle'"
                  size="120"
                  :color="validationResult.status === 'expired' ? 'warning' : 'error'"
                  class="mb-4"
                />
                <h2 class="text-h3 font-weight-bold mb-2">ACCESS DENIED</h2>
                <p class="text-h6 mb-6">{{ validationResult.reason }}</p>

                <v-alert
                  :type="validationResult.status === 'expired' ? 'warning' : 'error'"
                  variant="outlined"
                  prominent
                  class="mt-4"
                >
                  <template #title>
                    <span class="font-weight-bold">
                      {{ validationResult.status === 'expired' ? 'QR Code Expired' : 'Invalid QR Code' }}
                    </span>
                  </template>
                  Please contact reception for assistance
                </v-alert>

                <v-btn
                  :color="validationResult.status === 'expired' ? 'warning' : 'error'"
                  variant="outlined"
                  size="large"
                  block
                  class="mt-6"
                  @click="clearResult"
                >
                  Scan Another
                </v-btn>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Recent Scans -->
    <v-container fluid class="pa-6">
      <h2 class="text-h5 font-weight-bold mb-4">
        <v-icon icon="mdi-history" class="mr-2" color="info" />
        Recent Scans
      </h2>
      <v-card elevation="2">
        <v-list>
          <v-list-item
            v-for="(scan, index) in recentScans"
            :key="index"
          >
            <template #prepend>
              <v-avatar :color="scan.valid ? 'success' : 'error'" size="40">
                <v-icon
                  :icon="scan.valid ? 'mdi-check' : 'mdi-close'"
                  color="white"
                />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ scan.visitorName }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ scan.timestamp }} • {{ scan.status }}
            </v-list-item-subtitle>

            <template #append>
              <v-chip
                :color="scan.valid ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                {{ scan.valid ? 'Allowed' : 'Denied' }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
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
import { ref } from 'vue';
import { visitorService } from '@/services/visitorService';

const manualQRInput = ref('');
const validating = ref(false);
const logging = ref(false);
const validationResult = ref(null);
const recentScans = ref([]);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const validateManualQR = async () => {
  if (!manualQRInput.value.trim()) {
    showNotification('Please enter QR code data', 'warning');
    return;
  }

  validating.value = true;
  try {
    const result = await visitorService.validateQR(manualQRInput.value);
    validationResult.value = result;
    addToRecentScans(result);
    
    // Play sound/vibration feedback
    if (result.valid) {
      showNotification('Valid QR Code!', 'success');
    } else {
      showNotification('Invalid QR Code', 'error');
    }
  } catch (error) {
    console.error('Error validating QR:', error);
    showNotification('Error validating QR code', 'error');
  } finally {
    validating.value = false;
  }
};

const simulateScan = async (type) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  let qrData;
  
  if (type === 'valid') {
    qrData = {
      visitorId: 1,
      name: 'John Doe',
      phone: '+1234567890',
      validFrom: now.toISOString(),
      validUntil: tomorrow.toISOString(),
      accessLevel: 1,
    };
  } else if (type === 'expired') {
    qrData = {
      visitorId: 2,
      name: 'Jane Smith',
      phone: '+1234567891',
      validFrom: yesterday.toISOString(),
      validUntil: now.toISOString(),
      accessLevel: 1,
    };
  } else {
    qrData = {
      visitorId: 999,
      name: 'Invalid User',
      phone: '+0000000000',
      validFrom: now.toISOString(),
      validUntil: tomorrow.toISOString(),
      accessLevel: 1,
    };
  }

  manualQRInput.value = JSON.stringify(qrData);
  await validateManualQR();
};

const logEntry = async () => {
  if (!validationResult.value?.visitor) return;

  logging.value = true;
  try {
    await visitorService.createEntryLog({
      visitorId: validationResult.value.visitor.id,
      visitorName: validationResult.value.visitor.personName,
      action: 'check-in',
      securityGuard: 'Current Guard',
      door: 'Main Entrance',
      qrValid: true,
    });

    showNotification('Entry logged successfully!', 'success');
    clearResult();
  } catch (error) {
    console.error('Error logging entry:', error);
    showNotification('Error logging entry', 'error');
  } finally {
    logging.value = false;
  }
};

const clearResult = () => {
  validationResult.value = null;
  manualQRInput.value = '';
};

const addToRecentScans = (result) => {
  const scan = {
    visitorName: result.visitor?.personName || result.data?.name || 'Unknown',
    timestamp: new Date().toLocaleTimeString(),
    status: result.reason,
    valid: result.valid,
  };
  
  recentScans.value.unshift(scan);
  if (recentScans.value.length > 20) {
    recentScans.value.pop();
  }
};

const formatTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const showNotification = (message, type = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = type;
  snackbarIcon.value =
    type === 'success'
      ? 'mdi-check-circle'
      : type === 'error'
        ? 'mdi-alert-circle'
        : 'mdi-information';
  showSnackbar.value = true;
};
</script>

<style scoped>
.qr-scanner {
  background: #f5f7fa;
  min-height: 100vh;
}

.scanner-section {
  background: white;
}

.result-section {
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-card {
  border-radius: 16px;
}

.scanner-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
}

.validation-result {
  width: 100%;
  max-width: 500px;
}

.result-card {
  border-radius: 24px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.visitor-info {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 24px;
}

.gap-2 {
  gap: 8px;
}

@media (max-width: 960px) {
  .result-section {
    min-height: auto;
  }
}
</style>
