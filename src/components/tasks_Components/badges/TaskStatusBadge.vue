<template>
  <span 
    class="status-badge" 
    :class="`status-${status}`"
  >
    <component :is="statusIcon" :size="16" v-if="statusIcon" />
    {{ formatStatus(status) }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { Clock, Hourglass, CheckCircle, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  status: {
    type: String,
    default: 'pending'
  }
});

const statusIcon = computed(() => {
  switch (props.status?.toLowerCase()) {
    case 'pending':
      return Clock;
    case 'inprogress':
      return Hourglass;
    case 'completed':
      return CheckCircle;
    case 'overdue':
      return AlertCircle;
    default:
      return null;
  }
});

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  switch (status.toLowerCase()) {
    case 'inprogress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'overdue':
      return 'OverDue';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};
</script>

<style scoped>
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-inprogress {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-overdue {
  background: #fee2e2;
  color: #dc2626;
}
</style>
