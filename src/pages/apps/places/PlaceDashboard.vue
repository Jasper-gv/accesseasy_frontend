<template>
  <div class="place-dashboard">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap">
        <div class="d-flex align-center mb-3 mb-md-0">
          <v-avatar color="primary-lighten-5" size="64" class="mr-4">
            <v-icon color="primary" size="36">mdi-office-building</v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h3 font-weight-bold mb-1">{{ placeName }}</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              <v-chip size="small" color="success" variant="flat" class="mr-2">
                <v-icon start size="14">mdi-check-circle</v-icon>
                Active
              </v-chip>
              Central hub for all operations
            </p>
          </div>
        </div>
        <div class="d-flex gap-2">
          <v-btn variant="outlined" color="primary" to="/configuration/store-configurator" prepend-icon="mdi-cog">
            Settings
          </v-btn>
          <v-btn color="primary" to="/apps/analytics" prepend-icon="mdi-chart-line">
            Analytics
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="stat in quickStats" :key="stat.title">
        <v-card class="stat-card" elevation="2" hover>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">{{ stat.title }}</div>
                <div class="text-h3 font-weight-bold" :class="`text-${stat.color}`">{{ stat.value }}</div>
                <div class="text-caption text-grey mt-1">{{ stat.subtitle }}</div>
              </div>
              <v-avatar :color="stat.color + '-lighten-5'" size="56">
                <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Recent Activity Feed -->
      <v-col cols="12" md="8">
        <v-card elevation="3" class="mb-4">
          <v-card-title class="pa-6 bg-grey-lighten-5 d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-timeline-clock</v-icon>
              <span class="text-h6 font-weight-bold">Recent Activity</span>
            </div>
            <v-btn size="small" variant="text" color="primary" @click="loadActivity">
              <v-icon start>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-card-title>
          
          <v-list v-if="recentActivity.length > 0">
            <template v-for="(activity, index) in recentActivity" :key="activity.id">
              <v-list-item class="pa-4">
                <template v-slot:prepend>
                  <v-avatar :color="activity.color + '-lighten-4'" size="48">
                    <v-icon :color="activity.color" size="24">{{ activity.icon }}</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium mb-1">
                  {{ activity.description }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatTime(activity.timestamp) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip size="small" :color="activity.color" variant="tonal">
                    {{ activity.type.replace('_', ' ') }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-divider v-if="index < recentActivity.length - 1"></v-divider>
            </template>
          </v-list>

          <div v-else class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-3">mdi-clock-outline</v-icon>
            <p class="text-grey mt-4">No recent activity</p>
          </div>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" to="/apps/analytics">
              View Full History
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" md="4">
        <v-card elevation="3" class="mb-4">
          <v-card-title class="pa-6 bg-grey-lighten-5">
            <v-icon class="mr-2" color="primary">mdi-flash</v-icon>
            <span class="text-h6 font-weight-bold">Quick Actions</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-btn
              v-for="action in quickActions"
              :key="action.title"
              block
              size="large"
              :color="action.color"
              variant="outlined"
              :to="action.to"
              :prepend-icon="action.icon"
              class="mb-2 text-none"
            >
              {{ action.title }}
            </v-btn>
          </v-card-text>
        </v-card>



        <!-- Configuration Status -->
        <v-card elevation="3" class="mb-4">
          <v-card-title class="pa-6 bg-grey-lighten-5">
            <v-icon class="mr-2" color="teal">mdi-cog-box</v-icon>
            <span class="text-h6 font-weight-bold">Config Status</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list density="compact">
              <v-list-item>
                <div class="d-flex justify-space-between align-center w-100">
                  <div class="d-flex align-center">
                    <v-icon size="20" color="blue" class="mr-2">mdi-account-cog</v-icon>
                    <span class="text-body-2">Visitor Access</span>
                  </div>
                  <v-btn size="x-small" variant="text" color="blue" to="/configuration/store-configurator?tab=visitor-settings">Configure</v-btn>
                </div>
                <div class="text-caption text-grey ml-7">Pre-approval: Disabled</div>
              </v-list-item>
              
              <v-divider class="my-2"></v-divider>

              <v-list-item>
                 <div class="d-flex justify-space-between align-center w-100">
                  <div class="d-flex align-center">
                    <v-icon size="20" color="indigo" class="mr-2">mdi-car-cog</v-icon>
                    <span class="text-body-2">Parking Rules</span>
                  </div>
                  <v-btn size="x-small" variant="text" color="indigo" to="/configuration/store-configurator?tab=parking-settings">Configure</v-btn>
                </div>
                <div class="text-caption text-grey ml-7">100 Slots (20 Premium)</div>
              </v-list-item>

              <v-divider class="my-2"></v-divider>

              <v-list-item>
                 <div class="d-flex justify-space-between align-center w-100">
                  <div class="d-flex align-center">
                    <v-icon size="20" color="red" class="mr-2">mdi-shield-check</v-icon>
                    <span class="text-body-2">Validators</span>
                  </div>
                  <v-btn size="x-small" variant="text" color="red" to="/configuration/store-configurator?tab=validators">View Links</v-btn>
                </div>
                <div class="text-caption text-grey ml-7">Security & Canteen Active</div>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Place Info -->
        <v-card elevation="3">
          <v-card-title class="pa-6 bg-grey-lighten-5">
            <v-icon class="mr-2" color="info">mdi-information</v-icon>
            <span class="text-h6 font-weight-bold">Place Details</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list density="compact">
              <v-list-item prepend-icon="mdi-map-marker">
                <v-list-item-title>Address</v-list-item-title>
                <v-list-item-subtitle>123 Main St, New York, NY</v-list-item-subtitle>
              </v-list-item>
              <v-list-item prepend-icon="mdi-phone">
                <v-list-item-title>Contact</v-list-item-title>
                <v-list-item-subtitle>+1 (555) 123-4567</v-list-item-subtitle>
              </v-list-item>
              <v-list-item prepend-icon="mdi-account-tie">
                <v-list-item-title>Manager</v-list-item-title>
                <v-list-item-subtitle>John Doe</v-list-item-subtitle>
              </v-list-item>
              <v-list-item prepend-icon="mdi-clock-outline">
                <v-list-item-title>Operating Hours</v-list-item-title>
                <v-list-item-subtitle>6:00 AM - 10:00 PM</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Module Overview Cards -->
    <v-row class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">
          <v-icon class="mr-2" color="primary">mdi-view-module</v-icon>
          Modules
        </h2>
      </v-col>

      <v-col cols="12" md="4" v-for="module in modules" :key="module.title">
        <v-card
          class="module-card"
          elevation="3"
          hover
          :to="module.to"
        >
          <v-card-text class="pa-6">
            <div class="d-flex align-center mb-4">
              <v-avatar :color="module.color + '-lighten-5'" size="56" class="mr-3">
                <v-icon :color="module.color" size="32">{{ module.icon }}</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-h6 font-weight-bold">{{ module.title }}</h3>
                <p class="text-caption text-grey mb-0">{{ module.description }}</p>
              </div>
            </div>

            <v-divider class="my-3"></v-divider>

            <div class="d-flex justify-space-between">
              <div v-for="metric in module.metrics" :key="metric.label" class="text-center">
                <div class="text-h6 font-weight-bold" :class="`text-${module.color}`">{{ metric.value }}</div>
                <div class="text-caption text-grey">{{ metric.label }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { analyticsService } from '@/services/appLayer/analyticsService';

const route = useRoute();
const placeId = computed(() => route.params.id || 'place-123');
const placeName = ref('Downtown Gym');

const quickStats = ref([
  { title: "Today's Visitors", value: 45, subtitle: '+12% vs yesterday', icon: 'mdi-account-group', color: 'primary' },
  { title: 'Cars Parked', value: 30, subtitle: '67/100 occupied', icon: 'mdi-car', color: 'indigo' },
  { title: 'Canteen Orders', value: 12, subtitle: '₹5,600 revenue', icon: 'mdi-food', color: 'orange' },
  { title: 'Revenue Today', value: '₹15.4K', subtitle: 'All modules', icon: 'mdi-currency-inr', color: 'success' }
]);

const recentActivity = ref([]);

const quickActions = [
  { title: 'Add Visitor', icon: 'mdi-account-plus', to: '/apps/visitor', color: 'blue' },
  { title: 'View Parking Status', icon: 'mdi-car-parking', to: '/apps/parking', color: 'indigo' },
  { title: 'Canteen Orders', icon: 'mdi-food', to: '/apps/canteen', color: 'orange' },
  { title: 'Sell Membership', icon: 'mdi-card-account-details', to: '/apps/membership', color: 'purple' },
  { title: 'View Analytics', icon: 'mdi-chart-line', to: '/apps/analytics', color: 'success' },
  { title: 'Configure Place', icon: 'mdi-cog', to: '/configuration/store-configurator', color: 'grey' }
];

const modules = [
  {
    title: 'Visitor Management',
    description: 'Check-in, badges, approvals',
    icon: 'mdi-account-group',
    color: 'blue',
    to: '/apps/visitor',
    metrics: [
      { label: 'Today', value: 45 },
      { label: 'This Month', value: 1240 },
      { label: 'VIP', value: 18 }
    ]
  },
  {
    title: 'Parking Management',
    description: 'Slots, rates, occupancy',
    icon: 'mdi-car-parking',
    color: 'indigo',
    to: '/apps/parking',
    metrics: [
      { label: 'Occupied', value: '67/100' },
      { label: 'Premium', value: '15/20' },
      { label: 'Revenue', value: '₹3.4K' }
    ]
  },
  {
    title: 'Canteen Management',
    description: 'Orders, menu, wallet',
    icon: 'mdi-food-fork-drink',
    color: 'orange',
    to: '/apps/canteen',
    metrics: [
      { label: 'Orders', value: 24 },
      { label: 'Revenue', value: '₹5.6K' },
      { label: 'Wallet', value: '58%' }
    ]
  }
];

const loadActivity = async () => {
  try {
    recentActivity.value = await analyticsService.getRecentActivity(placeId.value, 10);
  } catch (e) {
    console.error('Failed to load activity:', e);
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / 60000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};

onMounted(() => {
  loadActivity();
});
</script>

<style scoped>
.place-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1.5rem;
}

.stat-card {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.module-card {
  border-radius: 16px !important;
  transition: all 0.3s ease;
  cursor: pointer;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}
</style>
