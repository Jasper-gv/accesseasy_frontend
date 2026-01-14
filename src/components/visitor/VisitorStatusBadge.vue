<template>
  <v-chip
    :color="chipColor"
    :variant="variant"
    size="small"
    class="visitor-status-badge"
  >
    <v-icon :icon="statusIcon" size="14" class="mr-1" />
    {{ statusText }}
  </v-chip>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) =>
      ['pending', 'approved', 'rejected', 'checked-in', 'checked-out', 'expired'].includes(value),
  },
  variant: {
    type: String,
    default: 'tonal',
  },
});

const chipColor = computed(() => {
  const colors = {
    pending: '#f57c00',
    approved: '#4caf50',
    rejected: '#f44336',
    'checked-in': '#2196f3',
    'checked-out': '#757575',
    expired: '#9e9e9e',
  };
  return colors[props.status] || '#757575';
});

const statusIcon = computed(() => {
  const icons = {
    pending: 'mdi-clock-outline',
    approved: 'mdi-check-circle',
    rejected: 'mdi-close-circle',
    'checked-in': 'mdi-login',
    'checked-out': 'mdi-logout',
    expired: 'mdi-timer-off',
  };
  return icons[props.status] || 'mdi-help-circle';
});

const statusText = computed(() => {
  return props.status
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});
</script>

<style scoped>
.visitor-status-badge {
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
