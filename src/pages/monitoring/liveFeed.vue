<template>
  <div class="live-feed-container">
    <div class="header-actions mb-4">
      <h2>Live Camera Feeds</h2>
      <div class="controls">
        <v-select
          v-model="gridSize"
          :items="[1, 2, 3, 4]"
          label="Grid Size"
          density="compact"
          hide-details
          style="width: 120px"
        ></v-select>
      </div>
    </div>

    <v-row>
      <v-col
        v-for="camera in cameras"
        :key="camera.id"
        :cols="12 / gridSize"
        class="camera-col"
      >
        <v-card class="camera-feed-card">
          <v-card-title class="text-subtitle-2 py-1 px-2 d-flex justify-space-between bg-grey-lighten-4">
            <span>{{ camera.name }}</span>
            <v-icon size="small" :color="camera.status === 'online' ? 'success' : 'error'">
              mdi-circle
            </v-icon>
          </v-card-title>
          <div class="feed-placeholder bg-black d-flex align-center justify-center" style="aspect-ratio: 16/9;">
            <div class="text-center">
              <v-icon color="grey-darken-2" size="48">mdi-cctv</v-icon>
              <div class="text-grey text-caption mt-1">Live Feed Unavailable</div>
            </div>
          </div>
          <v-card-actions class="py-1">
            <v-spacer></v-spacer>
            <v-btn size="small" variant="text" icon="mdi-fullscreen"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const gridSize = ref(2);

const cameras = ref([
  { id: 1, name: 'Main Entrance', status: 'online' },
  { id: 2, name: 'Warehouse A', status: 'online' },
  { id: 3, name: 'Parking Lot', status: 'offline' },
  { id: 4, name: 'Lobby', status: 'online' },
]);
</script>

<style scoped>
.live-feed-container {
  padding: 20px;
}
.camera-feed-card {
  border: 1px solid #e0e0e0;
}
</style>
