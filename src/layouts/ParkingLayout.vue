<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      color="grey-lighten-4"
      width="260"
    >
      <div class="pa-4 bg-primary text-white">
        <div class="d-flex align-center mb-2">
          <v-btn icon="mdi-arrow-left" variant="text" density="compact" color="white" to="/hq/dashboard"></v-btn>
          <span class="text-caption font-weight-bold ml-1">BACK TO HQ</span>
        </div>
        <div class="text-h6 font-weight-bold">Parking Management</div>
        <div class="text-caption opacity-80">Module</div>
      </div>

      <v-divider></v-divider>

      <v-list nav class="mt-2">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          to="/parking/dashboard"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-cctv"
          title="Live View"
          to="/parking/live-view"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-map-marker-path"
          title="Zones"
          to="/parking/zones"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-car"
          title="Vehicles"
          to="/parking/vehicles"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-currency-usd"
          title="Pricing"
          to="/parking/pricing"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-6 h-100">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const drawer = ref(true);
</script>

<style scoped>
.v-list-item--active {
  font-weight: 600;
}
</style>
