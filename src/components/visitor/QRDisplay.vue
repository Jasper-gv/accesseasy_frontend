<template>
  <div class="qr-display-container">
    <v-card class="qr-card" elevation="2">
      <v-card-text class="text-center pa-6">
        <!-- QR Code Image -->
        <div class="qr-image-wrapper">
          <img
            v-if="qrCode"
            :src="qrCode"
            alt="Visitor QR Code"
            class="qr-image"
          />
          <div v-else class="qr-placeholder">
            <v-icon icon="mdi-qrcode" size="80" color="grey" />
            <p class="text-grey mt-2">QR Code will appear here</p>
          </div>
        </div>

        <!-- Visitor Details -->
        <div v-if="visitorData" class="visitor-details mt-4">
          <h3 class="text-h6 font-weight-bold mb-2">{{ visitorData.personName }}</h3>
          <p class="text-body-2 text-grey-darken-1 mb-1">
            <v-icon icon="mdi-phone" size="16" class="mr-1" />
            {{ visitorData.mobileNumber }}
          </p>
          <p class="text-body-2 text-grey-darken-1 mb-1">
            <v-icon icon="mdi-email" size="16" class="mr-1" />
            {{ visitorData.email }}
          </p>
          <p class="text-body-2 text-grey-darken-1 mb-1">
            <v-icon icon="mdi-briefcase" size="16" class="mr-1" />
            {{ visitorData.purpose }}
          </p>
        </div>

        <!-- Validity Info -->
        <div v-if="showValidity && validFrom && validUntil" class="validity-info mt-4">
          <v-divider class="mb-3" />
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-caption text-grey-darken-1">Valid From:</span>
            <span class="text-caption font-weight-bold">{{ formatDateTime(validFrom) }}</span>
          </div>
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-caption text-grey-darken-1">Valid Until:</span>
            <span class="text-caption font-weight-bold">{{ formatDateTime(validUntil) }}</span>
          </div>

          <!-- Countdown Timer -->
          <div v-if="showCountdown && timeRemaining" class="countdown-timer mt-3">
            <v-progress-linear
              :model-value="progressPercentage"
              :color="progressColor"
              height="8"
              rounded
              class="mb-2"
            />
            <p class="text-caption" :class="`text-${progressColor}`">
              <v-icon :icon="timerIcon" size="14" class="mr-1" />
              {{ timeRemaining }}
            </p>
          </div>
        </div>

        <!-- Status Badge -->
        <div v-if="status" class="mt-4">
          <VisitorStatusBadge :status="status" />
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="qr-actions mt-4">
          <v-btn
            v-if="qrCode"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-download"
            @click="downloadQR"
            class="mr-2"
          >
            Download
          </v-btn>
          <v-btn
            v-if="qrCode && showShare"
            color="secondary"
            variant="tonal"
            prepend-icon="mdi-share-variant"
            @click="shareQR"
          >
            Share
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VisitorStatusBadge from './VisitorStatusBadge.vue';

const props = defineProps({
  qrCode: {
    type: String,
    default: null,
  },
  visitorData: {
    type: Object,
    default: null,
  },
  validFrom: {
    type: String,
    default: null,
  },
  validUntil: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    default: null,
  },
  showValidity: {
    type: Boolean,
    default: true,
  },
  showCountdown: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showShare: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['download', 'share']);

const currentTime = ref(new Date());
let intervalId = null;

onMounted(() => {
  if (props.showCountdown) {
    intervalId = setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
  }
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const timeRemaining = computed(() => {
  if (!props.validUntil) return null;

  const until = new Date(props.validUntil);
  const diff = until - currentTime.value;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
});

const progressPercentage = computed(() => {
  if (!props.validFrom || !props.validUntil) return 0;

  const from = new Date(props.validFrom);
  const until = new Date(props.validUntil);
  const total = until - from;
  const elapsed = currentTime.value - from;

  return Math.max(0, Math.min(100, (elapsed / total) * 100));
});

const progressColor = computed(() => {
  const percentage = progressPercentage.value;
  if (percentage >= 90) return 'error';
  if (percentage >= 70) return 'warning';
  return 'success';
});

const timerIcon = computed(() => {
  const percentage = progressPercentage.value;
  if (percentage >= 90) return 'mdi-timer-alert';
  if (percentage >= 70) return 'mdi-timer-sand';
  return 'mdi-timer';
});

const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const downloadQR = () => {
  if (!props.qrCode) return;

  const link = document.createElement('a');
  link.href = props.qrCode;
  link.download = `visitor-qr-${props.visitorData?.personName || 'code'}.png`;
  link.click();

  emit('download');
};

const shareQR = () => {
  emit('share');
};
</script>

<style scoped>
.qr-display-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.qr-card {
  border-radius: 16px;
  overflow: hidden;
}

.qr-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 20px;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  background: white;
  padding: 10px;
}

.qr-placeholder {
  text-align: center;
}

.visitor-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.validity-info {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}

.countdown-timer {
  background: #f0f4f8;
  border-radius: 8px;
  padding: 12px;
}

.qr-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .qr-display-container {
    max-width: 100%;
  }

  .qr-image-wrapper {
    min-height: 200px;
  }
}
</style>
