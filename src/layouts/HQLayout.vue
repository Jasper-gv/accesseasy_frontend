<template>
  <v-app>
    <!-- Global Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      app
      color="grey-lighten-4"
      width="260"
    >
      <div class="pa-4 d-flex align-center">
        <v-avatar color="primary" size="40" class="mr-3">
          <span class="text-h6 text-white">AG</span>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold">Anti-Gravity</div>
          <div class="text-caption text-grey-darken-1">HQ Dashboard</div>
        </div>
      </div>

      <v-divider></v-divider>

      <v-list nav class="mt-2">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          to="/hq/dashboard"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>
        
        <v-list-item
          prepend-icon="mdi-map-marker-multiple-outline"
          title="Places"
          to="/hq/places"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-account-group-outline"
          title="People"
          to="/hq/people"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-card-account-details-outline"
          title="Global Access"
          to="/hq/access-levels"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-cog-outline"
          title="Settings"
          to="/hq/settings"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-divider class="my-2"></v-divider>
  
        <v-list-subheader>VISITOR MANAGEMENT</v-list-subheader>
        
        <v-list-item
          prepend-icon="mdi-cog"
          title="Global Settings"
          to="/hq/visitors/settings"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-file-document-edit-outline"
          title="Global Templates"
          to="/hq/visitors/templates"
          active-class="text-primary bg-blue-lighten-5"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn block variant="outlined" color="grey-darken-1" @click="logout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-5">
      <v-container fluid class="pa-6 h-100">
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Global Entry FAB (Placeholder for now) -->
    <GlobalEntryFab />
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import GlobalEntryFab from '@/components/common/GlobalEntryFab.vue'; // We'll create this next

const drawer = ref(true);
const router = useRouter();

const logout = () => {
  // Implement logout logic
  router.push('/login');
};
</script>

<style scoped>
.v-list-item--active {
  font-weight: 600;
}
</style>
