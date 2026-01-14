<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Live View</h1>
      <v-select
        v-model="selectedZone"
        :items="['Basement 1', 'Basement 2', 'Visitor Lot']"
        label="Select Zone"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 200px"
      ></v-select>
    </div>

    <v-card border elevation="0" class="pa-4">
      <div class="d-flex gap-4 mb-4">
        <div class="d-flex align-center">
          <v-sheet color="success" width="16" height="16" rounded class="mr-2"></v-sheet>
          <span class="text-caption">Available</span>
        </div>
        <div class="d-flex align-center">
          <v-sheet color="error" width="16" height="16" rounded class="mr-2"></v-sheet>
          <span class="text-caption">Occupied</span>
        </div>
        <div class="d-flex align-center">
          <v-sheet color="info" width="16" height="16" rounded class="mr-2"></v-sheet>
          <span class="text-caption">Reserved</span>
        </div>
      </div>

      <div class="parking-grid">
        <v-sheet
          v-for="slot in slots"
          :key="slot.id"
          :color="getSlotColor(slot.status)"
          class="d-flex align-center justify-center rounded cursor-pointer slot-item"
          height="80"
          border
        >
          <div class="text-center">
            <div class="font-weight-bold" :class="{'text-white': slot.status !== 'free'}">{{ slot.id }}</div>
            <div v-if="slot.status === 'occupied'" class="text-caption text-white opacity-80">{{ slot.plate }}</div>
          </div>
        </v-sheet>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedZone = ref('Basement 1');

// Mock Data Generator
const generateSlots = (count) => {
  return Array.from({ length: count }, (_, i) => {
    const id = `A-${i + 1}`;
    const rand = Math.random();
    let status = 'free';
    let plate = '';

    if (rand > 0.6) {
      status = 'occupied';
      plate = `ABC-${1000 + i}`;
    } else if (rand > 0.9) {
      status = 'reserved';
    }

    return { id, status, plate };
  });
};

const slots = ref(generateSlots(48));

const getSlotColor = (status) => {
  switch (status) {
    case 'free': return 'grey-lighten-4';
    case 'occupied': return 'error';
    case 'reserved': return 'info';
    default: return 'grey';
  }
};
</script>

<style scoped>
.parking-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 16px;
}
.slot-item:hover {
  transform: scale(1.05);
  transition: transform 0.2s;
}
</style>
