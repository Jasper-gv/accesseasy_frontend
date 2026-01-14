<template>
  <v-card class="visitor-badge-card mx-auto" max-width="360" elevation="4">
    <!-- Header / Status -->
    <div :class="['status-header pa-4 text-center text-white', statusColor]">
      <div class="text-h6 font-weight-bold text-uppercase">{{ status }}</div>
      <div class="text-caption">{{ statusMessage }}</div>
    </div>

    <!-- Badge Content -->
    <div class="badge-content pa-6 text-center bg-white">
      <!-- Avatar/Photo -->
      <v-avatar size="100" color="grey-lighten-2" class="mb-4 elevation-2">
        <v-img v-if="visitor.photo" :src="visitor.photo" cover />
        <v-icon v-else icon="mdi-account" size="60" color="grey-darken-1" />
      </v-avatar>

      <!-- Main Info -->
      <div class="text-h5 font-weight-bold mb-1">{{ visitor.personName }}</div>
      <div class="text-subtitle-1 text-grey-darken-1 mb-4">{{ templateName }}</div>

      <v-divider class="mb-4" />

      <!-- QR Code (Only if Approved) -->
      <div v-if="status === 'approved' && qrCode" class="mb-4">
        <img :src="qrCode" alt="Access QR" style="width: 180px; height: 180px;" class="border rounded pa-2" />
        <div class="text-caption text-grey mt-1">Scan at entry</div>
      </div>

      <!-- Dynamic Badge Fields -->
      <div class="text-left">
        <div v-for="(field, index) in badgeFields" :key="index" class="mb-2">
          <div class="text-caption text-grey-darken-1 font-weight-bold">{{ field.label }}</div>
          <div class="text-body-2">{{ getFieldValue(field) }}</div>
        </div>
        
        <!-- Default Fields -->
        <div class="mb-2" v-if="showField('Visit Date')">
          <div class="text-caption text-grey-darken-1 font-weight-bold">Date</div>
          <div class="text-body-2">{{ formatDate(visitor.visitDate) }}</div>
        </div>
        <div class="mb-2" v-if="showField('Host Name') && visitor.hostName">
          <div class="text-caption text-grey-darken-1 font-weight-bold">Host</div>
          <div class="text-body-2">{{ visitor.hostName }}</div>
        </div>
      </div>

    </div>
    
    <!-- Footer -->
    <div class="bg-grey-lighten-4 pa-3 text-center text-caption text-grey">
      Powered by AccessEasy
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  visitor: {
    type: Object,
    required: true,
  },
  templateName: {
    type: String,
    default: 'Visitor',
  },
  status: {
    type: String, // 'approved', 'pending', 'rejected'
    default: 'pending',
  },
  qrCode: {
    type: String,
    default: null,
  },
  badgeFields: {
    type: Array,
    default: () => [],
  },
  selectedBadgeFields: {
    type: Array,
    default: () => [],
  }
});

const statusColor = computed(() => {
  switch (props.status) {
    case 'approved': return 'bg-success';
    case 'rejected': return 'bg-error';
    case 'pending': return 'bg-warning';
    default: return 'bg-grey';
  }
});

const statusMessage = computed(() => {
  switch (props.status) {
    case 'approved': return 'Access Granted';
    case 'rejected': return 'Access Denied';
    case 'pending': return 'Waiting for Approval';
    default: return 'Unknown Status';
  }
});

const showField = (fieldName) => {
  return props.selectedBadgeFields.includes(fieldName);
};

const getFieldValue = (field) => {
  // Try to find the value in visitor object based on label mapping or custom fields
  // This is a simplification; in real app, keys would be mapped better
  const key = field.label.toLowerCase().replace(/\s+/g, '');
  return props.visitor[key] || props.visitor.customFields?.[field.label] || '-';
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.visitor-badge-card {
  overflow: hidden;
  border-radius: 16px;
}
</style>
