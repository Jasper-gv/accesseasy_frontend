<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Places</h1>
      <v-btn prepend-icon="mdi-plus" color="primary" variant="flat">
        Add New Place
      </v-btn>
    </div>

    <!-- Filters -->
    <div class="d-flex gap-4 mb-6">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search places..."
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 300px"
      ></v-text-field>
      <v-select
        v-model="typeFilter"
        :items="['All', 'Facility', 'Event', 'Residential', 'Parking']"
        label="Filter by Type"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 200px"
      ></v-select>
    </div>

    <!-- Places Grid -->
    <v-row v-if="loading">
      <v-col v-for="n in 3" :key="n" cols="12" md="4">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="place in filteredPlaces" :key="place.id" cols="12" md="4">
        <v-card 
          border 
          elevation="0" 
          class="h-100 cursor-pointer place-card"
          @click="navigateToPlace(place.id)"
        >
          <v-img
            :src="place.image"
            height="160"
            cover
            class="align-end"
          >
            <v-card-title class="text-white bg-black-transparent">
              {{ place.name }}
            </v-card-title>
          </v-img>
          
          <v-card-text class="pt-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <v-chip size="small" color="primary" variant="tonal">{{ place.type }}</v-chip>
              <div class="text-caption text-grey">
                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                {{ place.address }}
              </div>
            </div>
            
            <div class="mt-4">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Occupancy</span>
                <span class="font-weight-bold">{{ place.stats.activeEntries }} / {{ place.stats.totalCapacity }}</span>
              </div>
              <v-progress-linear
                :model-value="(place.stats.activeEntries / place.stats.totalCapacity) * 100"
                color="success"
                height="6"
                rounded
              ></v-progress-linear>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn variant="text" color="primary" block>
              Enter Workspace
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { accessService } from '@/services/accessService';

const router = useRouter();
const loading = ref(true);
const places = ref([]);
const search = ref('');
const typeFilter = ref('All');

onMounted(async () => {
  try {
    places.value = await accessService.getPlaces();
  } catch (error) {
    console.error('Error loading places:', error);
  } finally {
    loading.value = false;
  }
});

const filteredPlaces = computed(() => {
  return places.value.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(search.value.toLowerCase());
    const matchesType = typeFilter.value === 'All' || place.type === typeFilter.value;
    return matchesSearch && matchesType;
  });
});

const navigateToPlace = (id) => {
  router.push(`/place/${id}`);
};
</script>

<style scoped>
.bg-black-transparent {
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0));
}
.place-card:hover {
  border-color: var(--v-primary-base);
  transform: translateY(-2px);
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>
