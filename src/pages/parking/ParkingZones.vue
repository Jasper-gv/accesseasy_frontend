<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Zones</h1>
      <v-btn prepend-icon="mdi-plus" color="primary" variant="flat">
        Add New Zone
      </v-btn>
    </div>

    <v-row>
      <v-col v-for="zone in zones" :key="zone.id" cols="12" md="4">
        <v-card border elevation="0">
          <v-card-item>
            <v-card-title>{{ zone.name }}</v-card-title>
            <v-card-subtitle>{{ zone.type }}</v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-grey">Capacity</span>
              <span class="font-weight-bold">{{ zone.capacity }} Slots</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-grey">Occupied</span>
              <span class="font-weight-bold">{{ zone.occupied }} Slots</span>
            </div>
             <v-progress-linear
              :model-value="(zone.occupied / zone.capacity) * 100"
              color="primary"
              height="6"
              rounded
              class="mt-2"
            ></v-progress-linear>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn variant="text" color="primary">Edit Configuration</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const zones = ref([
  { id: 1, name: 'Basement 1', type: 'General Parking', capacity: 200, occupied: 150 },
  { id: 2, name: 'Basement 2', type: 'Staff Only', capacity: 150, occupied: 140 },
  { id: 3, name: 'Visitor Lot', type: 'Public Access', capacity: 100, occupied: 22 },
]);
</script>
