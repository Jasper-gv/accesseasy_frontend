<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Parking Dashboard <span v-if="placeName">- {{ placeName }}</span></h1>
      <v-select
        v-model="selectedPlaceId"
        :items="placesList"
        item-title="name"
        item-value="id"
        label="Switch Place"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 250px"
        @update:model-value="switchPlace"
      ></v-select>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card border elevation="0" class="pa-4">
          <div class="text-overline text-grey-darken-1">Total Capacity</div>
          <div class="text-h3 font-weight-bold text-primary mt-2">450</div>
          <div class="text-caption text-grey mt-1">Across 3 Zones</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card border elevation="0" class="pa-4">
          <div class="text-overline text-grey-darken-1">Current Occupancy</div>
          <div class="text-h3 font-weight-bold text-warning mt-2">312</div>
          <v-progress-linear
            model-value="69"
            color="warning"
            height="4"
            rounded
            class="mt-3"
          ></v-progress-linear>
          <div class="text-caption text-grey mt-1">69% Full</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card border elevation="0" class="pa-4">
          <div class="text-overline text-grey-darken-1">Available Slots</div>
          <div class="text-h3 font-weight-bold text-success mt-2">138</div>
          <div class="text-caption text-grey mt-1">Ready for entry</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Hourly Usage Chart Placeholder -->
      <v-col cols="12" md="8">
        <v-card border elevation="0" class="h-100">
          <v-card-title>Hourly Usage Trend</v-card-title>
          <v-card-text class="d-flex align-center justify-center" style="height: 300px;">
            <div class="text-center text-grey">
              <v-icon size="64" color="grey-lighten-2">mdi-chart-bar</v-icon>
              <div class="mt-2">Usage Chart Placeholder</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Alerts -->
      <v-col cols="12" md="4">
        <v-card border elevation="0" class="h-100">
          <v-card-title>Recent Alerts</v-card-title>
          <v-list lines="two">
            <v-list-item
              prepend-icon="mdi-alert-circle"
              title="Zone A Full"
              subtitle="10 mins ago"
              color="error"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-car-off"
              title="Unauthorized Park: B-12"
              subtitle="25 mins ago"
              color="warning"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-boom-gate-alert"
              title="Gate 2 Malfunction"
              subtitle="1 hour ago"
              color="error"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { accessService } from '@/services/accessService';

const route = useRoute();
const router = useRouter();
const placeId = ref(route.params.id);
const placeName = ref('');
const placesList = ref([]);
const selectedPlaceId = ref(null);

const loadPlaceData = async () => {
  if (placeId.value) {
    try {
      const places = await accessService.getPlaces();
      placesList.value = places;
      const place = places.find(p => p.id === parseInt(placeId.value));
      if (place) {
        placeName.value = place.name;
        selectedPlaceId.value = place.id;
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  }
};

const switchPlace = (newId) => {
  if (newId) {
    router.push(`/place/${newId}/parking`);
  }
};

watch(() => route.params.id, (newId) => {
  placeId.value = newId;
  loadPlaceData();
});

onMounted(loadPlaceData);

</script>
