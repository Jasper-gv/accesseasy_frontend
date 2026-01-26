<template>
  <v-container fluid class="fill-height bg-grey-lighten-4 pa-0">
    <!-- Module Selection Screen -->
    <v-row v-if="!hasSelectedModules" justify="center" align="center" class="fill-height ma-0">
      <v-col cols="12" md="8" lg="6">
        <v-card class="elevation-4 rounded-lg">
          <v-card-title class="text-h5 font-weight-bold text-center py-6 text-primary">
            Welcome! Which modules do you want to use?
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <p class="text-body-1 text-center mb-6 text-medium-emphasis">
              Select one or more modules to customize your dashboard. You can change this later.
            </p>
            
            <v-row>
              <v-col v-for="module in availableModules" :key="module.id" cols="12" sm="6">
                <v-card
                  variant="outlined"
                  :class="{'bg-primary-lighten-5 border-primary': selectedModules.includes(module.id)}"
                  class="cursor-pointer h-100 transition-swing"
                  @click="toggleModule(module.id)"
                >
                  <v-card-text class="d-flex align-center pa-4">
                    <v-checkbox-btn
                      :model-value="selectedModules.includes(module.id)"
                      color="primary"
                      class="mr-4"
                      density="compact"
                    ></v-checkbox-btn>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold">{{ module.title }}</div>
                      <div class="text-caption text-medium-emphasis">{{ module.description }}</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="pa-4 justify-center">
            <v-btn
              color="primary"
              size="large"
              variant="elevated"
              :disabled="selectedModules.length === 0"
              @click="saveSelection"
              class="px-8"
            >
              Get Started
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dashboard View -->
    <v-container v-else fluid class="pa-0 h-100 overflow-y-auto">
      <div class="d-flex justify-end pa-4 bg-grey-lighten-5">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-cog"
          @click="editModules"
          size="small"
        >
          Customize Modules
        </v-btn>
      </div>
      <MainDashboard />
    </v-container>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MainDashboard from '@/pages/apps/MainDashboard.vue';
import { useModules } from '@/composables/useModules';

const router = useRouter();
const { 
  availableModules, 
  selectedModules, 
  hasSelectedModules, 
  toggleModule, 
  saveSelection, 
  editModules 
} = useModules();

</script>

<style scoped>

.bg-primary-lighten-5 {
  background-color: #e3f2fd !important;
}
.border-primary {
  border-color: #1976D2 !important;
  border-width: 2px !important;
}
</style>
