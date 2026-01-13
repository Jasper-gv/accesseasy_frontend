<template>
  <div class="visitor-overview pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-1">Visitor Management Overview</h1>
        <div class="text-subtitle-1 text-medium-emphasis">
          Welcome to the Visitor Management System. Here's what's happening today.
        </div>
      </div>
      <!-- <div class="d-flex gap-2">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="$emit('navigate', 'request')"
        >
          New Visit Request
        </v-btn>
      </div> -->
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4" lg="2" v-for="(stat, index) in stats" :key="index">
        <v-card elevation="0" border class="h-100 stat-card">
          <v-card-text class="d-flex flex-column align-center justify-center text-center py-6">
            <v-avatar
              :color="stat.color"
              variant="tonal"
              size="48"
              class="mb-3"
            >
              <v-icon :icon="stat.icon" size="24" />
            </v-avatar>
            <div class="text-h4 font-weight-bold mb-1">{{ stat.value }}</div>
            <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium">
              {{ stat.label }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <div class="mb-6">
      <h2 class="text-h6 font-weight-bold mb-4">Quick Actions</h2>
      <v-row>
        <v-col cols="12" sm="6" md="4" lg="2.4" v-for="(action, index) in quickActions" :key="index">
          <v-card
            elevation="0"
            border
            class="h-100 action-card cursor-pointer"
            @click="handleQuickAction(action)"
            v-ripple
          >
            <v-card-text class="d-flex flex-column align-center text-center py-6">
              <v-icon
                :icon="action.icon"
                :color="action.color"
                size="32"
                class="mb-3"
              />
              <div class="text-subtitle-1 font-weight-bold mb-1">{{ action.title }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ action.description }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Recent Activity / Info Section (Placeholder for future) -->
    <!-- <v-alert
      color="info"
      variant="tonal"
      icon="mdi-information"
      border="start"
      class="mb-6"
    >
      <div class="text-subtitle-1 font-weight-bold">Did you know?</div>
      <div class="text-body-2">
        You can customize visitor badges and check-in forms directly from the Templates tab.
        Use the "Create Visitor Template" quick action above to get started.
      </div>
    </v-alert> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['navigate']);

const stats = ref([
  { label: 'Total Branches', value: '12', icon: 'mdi-domain', color: 'primary' },
  { label: 'Total Visitors', value: '1,248', icon: 'mdi-account-group', color: 'success' },
  { label: "Today's Visits", value: '45', icon: 'mdi-calendar-today', color: 'info' },
  { label: 'Upcoming Events', value: '3', icon: 'mdi-calendar-clock', color: 'warning' },
  { label: 'Active Templates', value: '8', icon: 'mdi-file-document-check', color: 'purple' },
  { label: 'Pending Approvals', value: '5', icon: 'mdi-clock-alert', color: 'error' },
]);

const quickActions = ref([
  {
    title: 'Create Template',
    description: 'Design new visitor flows',
    icon: 'mdi-file-document-plus',
    color: 'primary',
    action: 'create-template'
  },
  {
    title: 'Access Levels',
    description: 'Manage entry permissions',
    icon: 'mdi-shield-key',
    color: 'warning',
    action: 'configure-access-level'
  },
  {
    title: 'Branch Add',
    description: 'Manage branches',
    icon: 'mdi-domain-plus',
    color: 'grey-darken-1',
    action: 'configure-branch'
  }
]);

const handleQuickAction = (action) => {
  emit('navigate', action.action);
};
</script>

<style scoped>
.visitor-overview {
  max-width: 1600px;
  margin: 0 auto;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.action-card {
  transition: all 0.2s;
}

.action-card:hover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-primary), 0.02);
  transform: translateY(-2px);
}
</style>
