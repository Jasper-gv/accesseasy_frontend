<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Global Access Levels</h1>
      <v-btn prepend-icon="mdi-plus" color="primary" variant="flat">
        Create Access Level
      </v-btn>
    </div>

    <v-row>
      <v-col v-for="level in accessLevels" :key="level.id" cols="12" md="4">
        <v-card border elevation="0" class="h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="secondary" variant="tonal" class="mr-2">
                <v-icon>mdi-card-account-details</v-icon>
              </v-avatar>
            </template>
            <v-card-title>{{ level.name }}</v-card-title>
          </v-card-item>

          <v-card-text>
            <div class="text-body-2 text-grey-darken-1 mb-4">
              {{ level.description }}
            </div>
            
            <v-divider class="mb-3"></v-divider>
            
            <div class="d-flex justify-space-between align-center">
              <span class="text-caption text-grey">ID: {{ level.id }}</span>
              <v-btn variant="text" size="small" color="primary">Edit</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { accessService } from '@/services/accessService';

const loading = ref(true);
const accessLevels = ref([]);

onMounted(async () => {
  try {
    accessLevels.value = await accessService.getGlobalAccessLevels();
  } catch (error) {
    console.error('Error loading access levels:', error);
  } finally {
    loading.value = false;
  }
});
</script>
