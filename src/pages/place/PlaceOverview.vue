<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Overview</h1>

    <v-row>
      <!-- Occupancy Card -->
      <v-col cols="12" md="4">
        <v-card border elevation="0" class="pa-4 h-100">
          <div class="text-overline text-grey-darken-1">Occupancy</div>
          <div class="d-flex align-end mt-2">
            <div class="text-h3 font-weight-bold text-primary mr-2">
              {{ place?.stats?.activeEntries || 0 }}
            </div>
            <div class="text-h6 text-grey mb-1">
              / {{ place?.stats?.totalCapacity || 0 }}
            </div>
          </div>
          <v-progress-linear
            :model-value="occupancyPercentage"
            color="primary"
            height="8"
            rounded
            class="mt-4"
          ></v-progress-linear>
          <div class="text-caption text-grey mt-2">
            {{ occupancyPercentage.toFixed(1) }}% Full
          </div>
        </v-card>
      </v-col>

      <!-- Recent Entries -->
      <v-col cols="12" md="8">
        <v-card border elevation="0" class="h-100">
          <v-card-title class="px-4 pt-4 d-flex justify-space-between align-center">
            <span>Recent Entries</span>
            <v-btn variant="text" size="small" color="primary" :to="`/place/${placeId}/entries`">View All</v-btn>
          </v-card-title>
          <v-list lines="one">
            <v-list-item
              v-for="entry in recentEntries"
              :key="entry.id"
              :title="entry.identity?.name || 'Unknown'"
              :subtitle="`${entry.flow?.name} • ${formatTime(entry.entryTime)}`"
            >
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-3" size="32">
                  <span class="text-caption">{{ getInitials(entry.identity?.name) }}</span>
                </v-avatar>
              </template>
              <template v-slot:append>
                <v-chip size="x-small" :color="getStatusColor(entry.status)">{{ entry.status }}</v-chip>
              </template>
            </v-list-item>
            <v-list-item v-if="recentEntries.length === 0">
              <div class="text-center text-grey py-4">No recent entries</div>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { accessService } from '@/services/accessService';

const route = useRoute();
const placeId = route.params.placeId;
const place = ref(null);
const recentEntries = ref([]);

onMounted(async () => {
  try {
    place.value = await accessService.getPlaceById(placeId);
    const entries = await accessService.getPlaceEntries(placeId);
    recentEntries.value = entries.slice(0, 5); // Show last 5
  } catch (error) {
    console.error('Error loading place data:', error);
  }
});

const occupancyPercentage = computed(() => {
  if (!place.value?.stats) return 0;
  return (place.value.stats.activeEntries / place.value.stats.totalCapacity) * 100;
});

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

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
</script>
