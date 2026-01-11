<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Organization Overview</h1>

    <!-- Key Metrics -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card elevation="0" border class="pa-4">
          <div class="text-overline text-grey-darken-1">Total Active Entries</div>
          <div class="text-h3 font-weight-bold text-primary mt-2">{{ stats.totalEntries }}</div>
          <div class="d-flex align-center mt-2 text-caption text-success">
            <v-icon icon="mdi-arrow-up" size="small" class="mr-1"></v-icon>
            <span>Live across all places</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="0" border class="pa-4">
          <div class="text-overline text-grey-darken-1">Active Places</div>
          <div class="text-h3 font-weight-bold text-grey-darken-3 mt-2">{{ stats.activePlaces }}</div>
          <div class="d-flex align-center mt-2 text-caption text-grey">
            <span>Managed locations</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="0" border class="pa-4">
          <div class="text-overline text-grey-darken-1">Total People</div>
          <div class="text-h3 font-weight-bold text-grey-darken-3 mt-2">{{ stats.totalPeople }}</div>
          <div class="d-flex align-center mt-2 text-caption text-success">
            <v-icon icon="mdi-account-plus" size="small" class="mr-1"></v-icon>
            <span>Registered identities</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card elevation="0" border class="pa-4">
          <div class="text-overline text-grey-darken-1">Alerts</div>
          <div class="text-h3 font-weight-bold text-error mt-2">2</div>
          <div class="d-flex align-center mt-2 text-caption text-error">
            <span>Requires attention</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity & Quick Actions -->
    <v-row class="mt-6">
      <v-col cols="12" md="8">
        <v-card border elevation="0">
          <v-card-title class="px-4 pt-4">Recent Activity</v-card-title>
          <v-list lines="two">
            <v-list-item
              prepend-icon="mdi-account-check"
              title="Alice Smith checked in at Tech Expo 2026"
              subtitle="2 minutes ago • Attendee Entry"
            ></v-list-item>
            <v-divider inset></v-divider>
            <v-list-item
              prepend-icon="mdi-car"
              title="Vehicle ABC-1234 entered Downtown Gym"
              subtitle="15 minutes ago • Member Entry"
            ></v-list-item>
            <v-divider inset></v-divider>
            <v-list-item
              prepend-icon="mdi-alert-circle"
              title="Gate 3 Offline at Public Parking Lot A"
              subtitle="1 hour ago • Device Alert"
              class="text-error"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card border elevation="0" class="h-100">
          <v-card-title class="px-4 pt-4">Quick Navigation</v-card-title>
          <v-card-text>
            <v-btn block variant="tonal" color="primary" class="mb-3 justify-start" to="/hq/places">
              <v-icon start>mdi-map-marker-multiple</v-icon>
              Manage Places
            </v-btn>
            <v-btn block variant="tonal" color="secondary" class="mb-3 justify-start" to="/hq/people">
              <v-icon start>mdi-account-group</v-icon>
              Manage People
            </v-btn>
            <v-btn block variant="tonal" color="info" class="mb-3 justify-start" to="/hq/access-levels">
              <v-icon start>mdi-card-account-details</v-icon>
              Global Access Levels
            </v-btn>
            <v-btn block variant="tonal" color="success" class="mb-3 justify-start" to="/visitor-management">
              <v-icon start>mdi-account-check</v-icon>
              Visitor Management
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { accessService } from '@/services/accessService';

const stats = ref({
  totalEntries: 0,
  activePlaces: 0,
  totalPeople: 0
});

const recentActivity = ref([]);

onMounted(async () => {
  try {
    // Fetch real mock data
    const places = await accessService.getPlaces();
    const people = await accessService.getIdentities();
    
    // Calculate stats
    stats.value.activePlaces = places.length;
    stats.value.totalPeople = people.length;
    stats.value.totalEntries = places.reduce((acc, p) => acc + (p.stats?.activeEntries || 0), 0);

    // Mock recent activity based on entries (since we don't have a global entry log endpoint yet)
    // In a real app, we'd call accessService.getGlobalActivity()
    recentActivity.value = [
      {
        id: 1,
        title: 'Alice Smith checked in at Tech Expo 2026',
        subtitle: '2 minutes ago • Attendee Entry',
        icon: 'mdi-account-check',
        color: 'success'
      },
      {
        id: 2,
        title: 'Vehicle ABC-1234 entered Downtown Gym',
        subtitle: '15 minutes ago • Member Entry',
        icon: 'mdi-car',
        color: 'primary'
      }
    ];

  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
});
</script>
