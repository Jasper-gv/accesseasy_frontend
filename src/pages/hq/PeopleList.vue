<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">People</h1>
      <v-btn prepend-icon="mdi-plus" color="primary" variant="flat">
        Add Person
      </v-btn>
    </div>

    <!-- Filters -->
    <div class="d-flex gap-4 mb-6">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search people..."
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 300px"
      ></v-text-field>
    </div>

    <v-card border elevation="0">
      <v-data-table
        :headers="headers"
        :items="filteredPeople"
        :loading="loading"
        hover
      >
        <!-- Name Column -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="grey-lighten-3" size="32" class="mr-3">
              <span class="text-caption">{{ getInitials(item.name) }}</span>
            </v-avatar>
            <div class="font-weight-medium">{{ item.name }}</div>
          </div>
        </template>

        <!-- Contact Column -->
        <template v-slot:item.contact="{ item }">
          <div>
            <div class="text-body-2">{{ item.email }}</div>
            <div class="text-caption text-grey">{{ item.phone }}</div>
          </div>
        </template>

        <!-- Vehicles Column -->
        <template v-slot:item.vehicles="{ item }">
          <div v-if="getVehiclesForPerson(item.id).length > 0">
            <v-chip 
              v-for="vehicle in getVehiclesForPerson(item.id)" 
              :key="vehicle.id"
              size="small" 
              variant="outlined" 
              class="mr-1 mb-1"
            >
              {{ vehicle.plate }}
            </v-chip>
          </div>
          <span v-else class="text-grey text-caption">No vehicles</span>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon variant="text" size="small" color="grey">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { accessService } from '@/services/accessService';

const loading = ref(true);
const people = ref([]);
const vehicles = ref([]);
const search = ref('');

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Contact', key: 'contact', sortable: false },
  { title: 'Vehicles', key: 'vehicles', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

onMounted(async () => {
  try {
    const [peopleData, vehiclesData] = await Promise.all([
      accessService.getIdentities(),
      accessService.getVehicles()
    ]);
    people.value = peopleData;
    vehicles.value = vehiclesData;
  } catch (error) {
    console.error('Error loading people:', error);
  } finally {
    loading.value = false;
  }
});

const filteredPeople = computed(() => {
  if (!search.value) return people.value;
  const term = search.value.toLowerCase();
  return people.value.filter(p => 
    p.name.toLowerCase().includes(term) || 
    p.email.toLowerCase().includes(term) || 
    p.phone.includes(term)
  );
});

const getVehiclesForPerson = (personId) => {
  return vehicles.value.filter(v => v.identityId === personId);
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>
