<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      permanent
      class="modern-sidebar"
      width="240"
      elevation="0"
    >
      <!-- Header Section -->
      <div class="sidebar-header pa-4">
        <h3 class="text-h6 font-weight-bold text-primary">AccessEasy App</h3>
      </div>

      <v-divider></v-divider>

      <!-- Navigation Menu -->
      <v-list density="compact" nav class="py-2">
        <!-- Platform Administration -->
        <v-list-subheader class="text-uppercase text-caption font-weight-bold">Platform</v-list-subheader>
        
        <v-list-item
          to="/configuration/saas-control-center"
          prepend-icon="mdi-credit-card-settings-outline"
          title="Subscriptions"
          subtitle="Plans & billing"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps"
          prepend-icon="mdi-view-dashboard-outline"
          title="Operations Overview"
          subtitle="Main dashboard"
          active-class="bg-primary-lighten-5 text-primary"
          exact
          class="mb-1"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Configuration -->
        <v-list-subheader class="text-uppercase text-caption font-weight-bold">Configuration</v-list-subheader>
        
        <v-list-item
          to="/apps/places"
          prepend-icon="mdi-domain"
          title="Locations"
          subtitle="Branches & sites"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/configuration/store-configurator"
          prepend-icon="mdi-store-cog"
          title="Storefront Config"
          subtitle="Branding & features"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps/access-levels"
          prepend-icon="mdi-card-account-details-outline"
          title="Memberships"
          subtitle="Plans & permissions"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps/analytics"
          prepend-icon="mdi-chart-line"
          title="Analytics"
          subtitle="Detailed insights"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Operations -->
        <v-list-subheader class="text-uppercase text-caption font-weight-bold">Operations</v-list-subheader>
        
        <v-list-item
          to="/apps/membership"
          prepend-icon="mdi-card-account-details-outline"
          title="Membership Sales"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>
        
        <v-list-item
          title="Visitor Management"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps/parking"
          prepend-icon="mdi-parking"
          title="Parking Management"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps/canteen"
          prepend-icon="mdi-food"
          title="Canteen Management"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Validators/Tools -->
        <v-list-subheader class="text-uppercase text-caption font-weight-bold">Validators & Tools</v-list-subheader>
        
        <v-list-item
          to="/apps/validator"
          prepend-icon="mdi-shield-check"
          title="Security Scanner"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>
        
        <v-list-item
          to="/apps/canteen/validator"
          prepend-icon="mdi-food-fork-drink"
          title="Canteen Scanner"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps/parking"
          prepend-icon="mdi-car-parking"
          title="Parking Management"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps/canteen"
          prepend-icon="mdi-food-outline"
          title="Canteen Management"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Validators -->
        <v-list-subheader class="text-uppercase text-caption font-weight-bold">Validators</v-list-subheader>

        <v-list-item
          to="/apps/validator"
          prepend-icon="mdi-shield-check-outline"
          title="Security Scanner"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>

        <v-list-item
          to="/apps/canteen/validator"
          prepend-icon="mdi-playlist-check"
          title="Canteen Validator"
          active-class="bg-primary-lighten-5 text-primary"
          class="mb-1"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <v-app-bar color="white" elevation="0" class="border-b">
        <v-app-bar-nav-icon @click="drawer = !drawer" v-if="$vuetify.display.mobile"></v-app-bar-nav-icon>
        <v-toolbar-title>{{ currentPageTitle }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- Place Selector -->
        <v-menu v-if="appState">
            <template v-slot:activator="{ props }">
                <v-btn variant="outlined" color="primary" v-bind="props" class="mr-4" prepend-icon="mdi-map-marker">
                    {{ appState.selectedPlaceName }}
                    <v-icon end>mdi-chevron-down</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item @click="selectPlace(null, 'All Places')" title="All Places" value="all"></v-list-item>
                <v-divider></v-divider>
                <v-list-item 
                    v-for="place in places" 
                    :key="place.id" 
                    :title="place.name" 
                    @click="selectPlace(place.id, place.name)"
                ></v-list-item>
            </v-list>
        </v-menu>

        <v-btn icon to="/">
          <v-icon>mdi-home</v-icon>
        </v-btn>
      </v-app-bar>

      <v-container fluid class="pa-6">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { placesService } from '@/services/appLayer/placesService';
import { appState, setPlace } from '@/store/appLayerState';

const drawer = ref(true);
const route = useRoute();
const places = ref([]);

onMounted(async () => {
    try {
        places.value = await placesService.getAll();
    } catch (e) {
        console.error("Failed to load places for selector", e);
    }
});

const selectPlace = (id, name) => {
    setPlace(id, name);
};

const currentPageTitle = computed(() => {
  return route.meta.title || 'App Layer';
});
</script>

<style scoped>
.modern-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64px;
  background: white;
}

/* Enhanced list item styling */
:deep(.v-list-item) {
  border-radius: 8px;
  margin: 0 8px;
  transition: all 0.2s ease;
}

:deep(.v-list-item:hover) {
  transform: translateX(2px);
}

:deep(.v-list-item__prepend > .v-icon) {
  opacity: 0.8;
}

:deep(.v-list-item--active .v-list-item__prepend > .v-icon) {
  opacity: 1;
}

:deep(.v-list-subheader) {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.7rem;
  padding-top: 8px;
}
</style>
