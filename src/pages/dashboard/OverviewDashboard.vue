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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MainDashboard from '@/pages/apps/MainDashboard.vue';

const router = useRouter();
const STORAGE_KEY = 'access_easy_selected_modules';

const hasSelectedModules = ref(false);
const selectedModules = ref([]);

const availableModules = [
  {
    id: 'visitor',
    title: 'Visitor Management',
    description: 'Manage visitor entries, exits, and passes.',
    icon: 'mdi-account-clock',
    color: 'blue',
    route: '/apps/visitor',
    image: 'https://cdn.vuetifyjs.com/images/cards/house.jpg', // Placeholder, replace with asset if available
    status: 'Active',
    summary: 'Manage visitor logs and access passes efficiently.'
  },
  {
    id: 'parking',
    title: 'Parking Management',
    description: 'Monitor parking slots and vehicle entries.',
    icon: 'mdi-car',
    color: 'green',
    route: '/apps/parking',
    image: 'https://cdn.vuetifyjs.com/images/cards/road.jpg',
    status: 'Active',
    summary: 'Track vehicle entries and parking slot availability.'
  },
  {
    id: 'canteen',
    title: 'Canteen Management',
    description: 'Handle food ordering and canteen operations.',
    icon: 'mdi-food',
    color: 'orange',
    route: '/apps/canteen',
    image: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
    status: 'Active',
    summary: 'Manage menu items, orders, and canteen flow.'
  },
  {
    id: 'membership',
    title: 'Membership Management',
    description: 'Manage memberships, plans, and renewals.',
    icon: 'mdi-card-account-details',
    color: 'purple',
    route: '/apps/places/membership',
    image: 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg',
    status: 'Active',
    summary: 'Oversee member details and subscription plans.'
  }
];



onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      selectedModules.value = JSON.parse(saved);
      if (selectedModules.value.length > 0) {
        hasSelectedModules.value = true;
      }
    } catch (e) {
      console.error('Failed to parse saved modules', e);
    }
  }
});

const toggleModule = (id) => {
  const index = selectedModules.value.indexOf(id);
  if (index === -1) {
    selectedModules.value.push(id);
  } else {
    selectedModules.value.splice(index, 1);
  }
};

const saveSelection = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedModules.value));
  hasSelectedModules.value = true;
};

const editModules = () => {
  hasSelectedModules.value = false;
};
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
