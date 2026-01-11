<template>
  <v-app>
    <!-- Place Context Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      app
      color="grey-lighten-4"
      width="260"
    >
      <!-- Place Header in Sidebar -->
      <div class="pa-4 bg-primary text-white">
        <div class="d-flex align-center mb-2">
          <v-btn icon="mdi-arrow-left" variant="text" density="compact" color="white" @click="backToHQ"></v-btn>
          <span class="text-caption font-weight-bold ml-1">BACK TO HQ</span>
        </div>
        <div class="text-h6 font-weight-bold text-truncate">{{ currentPlace?.name || 'Loading...' }}</div>
        <div class="text-caption opacity-80">{{ currentPlace?.type }}</div>
      </div>

      <v-divider></v-divider>

      <v-list nav class="mt-2">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Overview"
          :to="`/place/${placeId}/overview`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-turnstile"
          title="Entries"
          :to="`/place/${placeId}/entries`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-source-branch"
          title="Flows"
          :to="`/place/${placeId}/flows`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-parking"
          title="Parking"
          :to="`/place/${placeId}/parking`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-devices"
          title="Devices"
          :to="`/place/${placeId}/devices`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-subheader>VISITOR MANAGEMENT</v-list-subheader>

        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          :to="`/place/${placeId}/visitors/dashboard`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-shield-account"
          title="Operations"
          :to="`/place/${placeId}/visitors/operations`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          :to="`/place/${placeId}/visitors/settings`"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-6 h-100">
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Global Entry FAB -->
    <GlobalEntryFab />
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { accessService } from '@/services/accessService';
import GlobalEntryFab from '@/components/common/GlobalEntryFab.vue';

const drawer = ref(true);
const router = useRouter();
const route = useRoute();
const placeId = ref(route.params.placeId);
const currentPlace = ref(null);

const loadPlace = async () => {
  if (placeId.value) {
    try {
      currentPlace.value = await accessService.getPlaceById(placeId.value);
    } catch (error) {
      console.error('Error loading place:', error);
    }
  }
};

onMounted(loadPlace);

watch(() => route.params.placeId, (newId) => {
  placeId.value = newId;
  loadPlace();
});

const backToHQ = () => {
  router.push('/hq/places');
};
</script>

<style scoped>
.v-list-item--active {
  font-weight: 600;
}
</style>
