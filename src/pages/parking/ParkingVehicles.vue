<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Vehicles</h1>
      <div class="d-flex gap-2">
        <v-text-field
          prepend-inner-icon="mdi-magnify"
          label="Search plate or owner..."
          variant="outlined"
          density="compact"
          hide-details
          style="width: 300px"
        ></v-text-field>
        <v-btn prepend-icon="mdi-plus" color="primary" variant="flat">
          Register Vehicle
        </v-btn>
      </div>
    </div>

    <v-card border elevation="0">
      <v-data-table
        :headers="headers"
        :items="vehicles"
        hover
      >
        <template v-slot:item.status="{ item }">
          <v-chip size="small" :color="item.status === 'Active' ? 'success' : 'grey'">
            {{ item.status }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions>
          <v-btn icon variant="text" size="small" color="grey">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const headers = [
  { title: 'License Plate', key: 'plate' },
  { title: 'Owner Name', key: 'owner' },
  { title: 'Vehicle Model', key: 'model' },
  { title: 'Type', key: 'type' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const vehicles = ref([
  { plate: 'ABC-1234', owner: 'Alice Smith', model: 'Toyota Camry', type: 'Sedan', status: 'Active' },
  { plate: 'XYZ-9876', owner: 'Bob Jones', model: 'Honda CR-V', type: 'SUV', status: 'Active' },
  { plate: 'VIP-001', owner: 'Charlie CEO', model: 'Tesla Model S', type: 'Electric', status: 'Active' },
  { plate: 'DLV-555', owner: 'Fast Delivery Co.', model: 'Ford Transit', type: 'Van', status: 'Active' },
  { plate: 'GST-202', owner: 'Guest User', model: 'Hyundai i20', type: 'Hatchback', status: 'Inactive' },
]);
</script>
