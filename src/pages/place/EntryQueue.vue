<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Entries</h1>
      <div class="d-flex gap-2">
        <v-btn variant="outlined" prepend-icon="mdi-filter-variant">Filter</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-export">Export</v-btn>
      </div>
    </div>

    <v-card border elevation="0">
      <v-data-table
        :headers="headers"
        :items="entries"
        :loading="loading"
        hover
      >
        <!-- Identity Column -->
        <template v-slot:item.identity="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="grey-lighten-3" size="32" class="mr-3">
              <span class="text-caption">{{ getInitials(item.identity?.name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.identity?.name || 'Unknown' }}</div>
              <div class="text-caption text-grey">{{ item.identity?.phone }}</div>
            </div>
          </div>
        </template>

        <!-- Flow Column -->
        <template v-slot:item.flow="{ item }">
          <v-chip size="small" variant="outlined">{{ item.flow?.name }}</v-chip>
        </template>

        <!-- Vehicle Column -->
        <template v-slot:item.vehicle="{ item }">
          <div v-if="item.vehicle">
            <div class="font-weight-medium">{{ item.vehicle.plate }}</div>
            <div class="text-caption text-grey">{{ item.vehicle.model }}</div>
          </div>
          <span v-else class="text-grey text-caption">No Vehicle</span>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip size="small" :color="getStatusColor(item.status)" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Time Column -->
        <template v-slot:item.entryTime="{ item }">
          {{ formatDateTime(item.entryTime) }}
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon variant="text" size="small" color="grey">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { accessService } from '@/services/accessService';

const route = useRoute();
const placeId = route.params.placeId;
const loading = ref(true);
const entries = ref([]);

const headers = [
  { title: 'Identity', key: 'identity', sortable: false },
  { title: 'Flow', key: 'flow' },
  { title: 'Vehicle', key: 'vehicle' },
  { title: 'Status', key: 'status' },
  { title: 'Entry Time', key: 'entryTime' },
  { title: '', key: 'actions', sortable: false, align: 'end' },
];

onMounted(async () => {
  try {
    entries.value = await accessService.getPlaceEntries(placeId);
  } catch (error) {
    console.error('Error loading entries:', error);
  } finally {
    loading.value = false;
  }
});

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Pending': return 'warning';
    case 'Checked In': return 'info';
    default: return 'grey';
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString();
};
</script>
