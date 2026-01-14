<template>
  <div class="visitor-badge-view d-flex flex-column align-center justify-center h-100 bg-grey-lighten-4 pa-4">
    <div v-if="loading" class="text-center">
      <v-progress-circular indeterminate color="primary" size="64" />
      <div class="mt-4 text-grey">Loading badge...</div>
    </div>

    <div v-else-if="error" class="text-center text-error">
      <v-icon icon="mdi-alert-circle" size="64" class="mb-4" />
      <div class="text-h6">{{ error }}</div>
    </div>

    <v-card v-else class="badge-card elevation-8 rounded-xl overflow-hidden" width="100%" max-width="360">
      <!-- Badge Header -->
      <div class="bg-primary pa-6 text-center relative">
        <div class="text-h5 font-weight-bold text-white mb-1">{{ visitor.templateName || 'Visitor Badge' }}</div>
        <div class="text-subtitle-2 text-white opacity-80">{{ visitor.company || 'Acme Corp' }}</div>
        
        <!-- Status Chip -->
        <v-chip
          class="status-chip"
          :color="getStatusColor(visitor.status)"
          variant="flat"
          size="small"
        >
          {{ visitor.status }}
        </v-chip>
      </div>

      <v-card-text class="pa-0">
        <div class="d-flex flex-column align-center pt-8 pb-6 px-6">
          <!-- Photo or Avatar -->
          <v-avatar size="100" class="mb-4 elevation-4 border-2 border-white">
            <v-img v-if="visitor.photo" :src="visitor.photo" cover />
            <v-icon v-else icon="mdi-account" size="60" color="grey-darken-1" class="bg-grey-lighten-3" />
          </v-avatar>

          <!-- Visitor Name -->
          <h2 class="text-h4 font-weight-bold text-center mb-1">{{ visitor.personName }}</h2>
          <div class="text-body-1 text-grey-darken-1 mb-6">{{ visitor.company }}</div>

          <!-- QR Code -->
          <div class="qr-container bg-white pa-2 rounded border mb-6">
            <img :src="qrCodeUrl" alt="Access QR" style="width: 180px; height: 180px;" v-if="qrCodeUrl" />
            <v-skeleton-loader type="image" width="180" height="180" v-else />
          </div>

          <!-- Badge Fields (Configurable) -->
          <div class="w-100">
            <div v-for="(value, label) in badgeFields" :key="label" class="d-flex justify-space-between align-center py-2 border-b">
              <span class="text-caption text-grey-darken-1 font-weight-medium text-uppercase">{{ label }}</span>
              <span class="text-body-2 font-weight-bold text-right">{{ value }}</span>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Footer -->
      <div class="bg-grey-lighten-4 pa-4 text-center text-caption text-grey">
        <v-icon icon="mdi-security" size="small" class="mr-1" />
        Show this badge at security check
      </div>
    </v-card>

    <div class="mt-6 d-flex gap-2">
      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-download"
        @click="downloadBadge"
      >
        Download
      </v-btn>
      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-share-variant"
        @click="shareBadge"
      >
        Share
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import QRCode from 'qrcode';

const loading = ref(true);
const error = ref(null);
const visitor = ref({});
const qrCodeUrl = ref('');

// Mock Data
const mockVisitor = {
  id: 123,
  personName: 'John Doe',
  company: 'Tech Solutions Inc.',
  templateName: 'Office Visit',
  status: 'Approved',
  hostName: 'Sarah Smith',
  visitDate: new Date().toISOString(),
  accessLevelName: 'Level 1 - General',
  validUntil: '18:00',
  qrCodeValue: 'VIS-123-456'
};

const badgeFields = computed(() => {
  if (!visitor.value) return {};
  
  const fields = {};
  if (visitor.value.hostName) fields['Host'] = visitor.value.hostName;
  if (visitor.value.visitDate) fields['Date'] = formatDate(visitor.value.visitDate);
  if (visitor.value.accessLevelName) fields['Access'] = visitor.value.accessLevelName;
  if (visitor.value.validUntil) fields['Valid Until'] = visitor.value.validUntil;
  
  return fields;
});

onMounted(async () => {
  await loadVisitor();
});

const loadVisitor = async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    visitor.value = mockVisitor;
    
    // Generate QR
    if (mockVisitor.qrCodeValue) {
      qrCodeUrl.value = await QRCode.toDataURL(mockVisitor.qrCodeValue, { width: 200, margin: 1 });
    }
  } catch (err) {
    console.error('Error loading visitor:', err);
    error.value = 'Failed to load badge details';
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    case 'checked-in': return 'info';
    case 'checked-out': return 'grey';
    default: return 'grey';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

const downloadBadge = () => {
  console.log('Download badge');
};

const shareBadge = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Visitor Badge',
      text: `Badge for ${visitor.value.personName}`,
      url: window.location.href,
    }).catch(console.error);
  }
};
</script>

<style scoped>
.visitor-badge-view {
  min-height: 100vh;
}

.badge-card {
  position: relative;
}

.status-chip {
  position: absolute;
  top: 16px;
  right: 16px;
}

.border-2 {
  border: 4px solid white !important;
}

.gap-2 {
  gap: 12px;
}
</style>
