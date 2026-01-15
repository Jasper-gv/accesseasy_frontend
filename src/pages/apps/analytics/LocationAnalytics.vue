<template>
  <div class="location-analytics">
    <!-- Header -->
    <div class="analytics-header mb-6">
      <div class="d-flex align-center justify-space-between flex-wrap">
        <div class="mb-3 mb-md-0">
          <h1 class="text-h3 font-weight-bold mb-2">
            <v-icon size="44" color="primary" class="mr-3">mdi-chart-line</v-icon>
            Location Analytics
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">Detailed insights for {{ selectedPlace?.name || 'this location' }}</p>
        </div>
        
        <v-select
          v-model="dateRange"
          :items="dateRangeOptions"
          variant="outlined"
          density="comfortable"
          style="max-width: 200px;"
          prepend-inner-icon="mdi-calendar"
        ></v-select>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" bg-color="transparent" color="primary" class="mb-6">
      <v-tab value="overview" class="text-none px-6">
        <v-icon start>mdi-view-dashboard</v-icon>
        Overview
      </v-tab>
      <v-tab value="visitor" class="text-none px-6">
        <v-icon start>mdi-account-group</v-icon>
        Visitor
      </v-tab>
      <v-tab value="parking" class="text-none px-6">
        <v-icon start>mdi-car-parking</v-icon>
        Parking
      </v-tab>
      <v-tab value="canteen" class="text-none px-6">
        <v-icon start>mdi-food</v-icon>
        Canteen
      </v-tab>
      <v-tab value="access" class="text-none px-6">
        <v-icon start>mdi-key-variant</v-icon>
        Access Levels
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Overview Tab -->
      <v-window-item value="overview">
        <v-row>
          <!-- KPI Cards -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-darken-1 mb-1">Today's Visitors</div>
                    <div class="text-h3 font-weight-bold text-primary">{{ stats.visitors.total }}</div>
                    <div class="text-caption" :class="stats.visitors.change > 0 ? 'text-success' : 'text-error'">
                      <v-icon size="14">{{ stats.visitors.change > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                      {{ Math.abs(stats.visitors.change) }}% vs yesterday
                    </div>
                  </div>
                  <v-avatar color="primary-lighten-5" size="56">
                    <v-icon color="primary" size="28">mdi-account-group</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-darken-1 mb-1">Parking Occupancy</div>
                    <div class="text-h3 font-weight-bold text-indigo">{{ stats.parking.occupied }}/{{ stats.parking.capacity }}</div>
                    <div class="text-caption text-grey">{{ Math.floor((stats.parking.occupied / stats.parking.capacity) * 100) }}% occupied</div>
                  </div>
                  <v-avatar color="indigo-lighten-5" size="56">
                    <v-icon color="indigo" size="28">mdi-car</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-darken-1 mb-1">Canteen Orders</div>
                    <div class="text-h3 font-weight-bold text-orange">{{ stats.canteen.orders }}</div>
                    <div class="text-caption" :class="stats.canteen.change > 0 ? 'text-success' : 'text-error'">
                      <v-icon size="14">{{ stats.canteen.change > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                      {{ Math.abs(stats.canteen.change) }}% vs yesterday
                    </div>
                  </div>
                  <v-avatar color="orange-lighten-5" size="56">
                    <v-icon color="orange" size="28">mdi-food</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card" elevation="2">
              <v-card-text>
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-darken-1 mb-1">Total Revenue</div>
                    <div class="text-h3 font-weight-bold text-success">₹{{ stats.revenue.total.toLocaleString() }}</div>
                    <div class="text-caption text-grey">Across all modules</div>
                  </div>
                  <v-avatar color="success-lighten-5" size="56">
                    <v-icon color="success" size="28">mdi-currency-inr</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Revenue Breakdown Chart -->
          <v-col cols="12" md="8">
            <v-card elevation="3">
              <v-card-title class="pa-6 bg-grey-lighten-5">
                <v-icon class="mr-2" color="primary">mdi-chart-areaspline</v-icon>
                Revenue Breakdown
              </v-card-title>
              <v-card-text class="pa-6">
                <div class="text-center py-8">
                  <v-icon size="80" color="grey-lighten-3">mdi-chart-donut</v-icon>
                  <p class="text-body-2 text-grey mt-4">
                    Parking: ₹{{ stats.revenue.byModule.parking.toLocaleString() }} | 
                    Canteen: ₹{{ stats.revenue.byModule.canteen.toLocaleString() }} | 
                    Memberships: ₹{{ stats.revenue.byModule.memberships.toLocaleString() }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Recent Activity -->
          <v-col cols="12" md="4">
            <v-card elevation="3" class="fill-height">
              <v-card-title class="pa-6 bg-grey-lighten-5">
                <v-icon class="mr-2" color="primary">mdi-timeline-clock</v-icon>
                Recent Activity
              </v-card-title>
              <v-card-text class="pa-0">
                <v-list density="compact">
                  <v-list-item
                    v-for="activity in recentActivity.slice(0, 8)"
                    :key="activity.id"
                    class="px-4"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="activity.color + '-lighten-4'" size="32">
                        <v-icon :color="activity.color" size="18">{{ activity.icon }}</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-body-2">{{ activity.description }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ formatTime(activity.timestamp) }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Visitor Analytics Tab -->
      <v-window-item value="visitor">
        <v-row>
          <!-- Summary Cards -->
          <v-col cols="12" md="3" v-for="metric in visitorMetrics" :key="metric.title">
            <v-card elevation="2">
              <v-card-text>
                <div class="text-caption text-grey-darken-1 mb-1">{{ metric.title }}</div>
                <div class="text-h4 font-weight-bold" :class="`text-${metric.color}`">{{ metric.value }}</div>
                <div v-if="metric.subtitle" class="text-caption text-grey mt-1">{{ metric.subtitle }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Trend Chart Placeholder -->
          <v-col cols="12" md="8">
            <v-card elevation="3">
              <v-card-title class="pa-4">Daily Visitor Trend</v-card-title>
              <v-card-text>
                <div class="chart-placeholder text-center py-8">
                  <v-icon size="64" color="grey-lighten-3">mdi-chart-line</v-icon>
                  <p class="text-caption text-grey mt-2">Line chart: Visitor trend over {{ dateRange }}</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Peak Hours -->
          <v-col cols="12" md="4">
            <v-card elevation="3">
              <v-card-title class="pa-4">Peak Hours</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item v-for="hour in visitorAnalytics.peakHours" :key="hour.hour">
                    <v-list-item-title>{{ hour.hour }}</v-list-item-title>
                    <template v-slot:append>
                      <v-chip size="small" color="primary">{{ hour.count }} visits</v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Access Level Breakdown -->
          <v-col cols="12" md="6">
            <v-card elevation="3">
              <v-card-title class="pa-4">Access Level Distribution</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="level in visitorAnalytics.accessLevelBreakdown" :key="level.level">
                    <v-list-item-title>{{ level.level }}</v-list-item-title>
                    <template v-slot:append>
                      <div class="text-right">
                        <div class="font-weight-bold">{{ level.count }}</div>
                        <div class="text-caption text-grey">{{ level.percentage }}%</div>
                      </div>
                    </template>
                    <v-progress-linear
                      :model-value="level.percentage"
                      color="blue"
                      height="4"
                      class="mt-2"
                    ></v-progress-linear>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Entry Gates -->
          <v-col cols="12" md="6">
            <v-card elevation="3">
              <v-card-title class="pa-4">Entry Gate Usage</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="gate in visitorAnalytics.entryGates" :key="gate.gate">
                    <v-list-item-title>{{ gate.gate }}</v-list-item-title>
                    <template v-slot:append>
                      <div class="text-right">
                        <div class="font-weight-bold">{{ gate.count }}</div>
                        <div class="text-caption text-grey">{{ gate.percentage }}%</div>
                      </div>
                    </template>
                    <v-progress-linear
                      :model-value="gate.percentage"
                      color="indigo"
                      height="4"
                      class="mt-2"
                    ></v-progress-linear>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Parking Analytics Tab -->
      <v-window-item value="parking">
        <v-row>
          <v-col cols="12" md="3" v-for="metric in parkingMetrics" :key="metric.title">
            <v-card elevation="2">
              <v-card-text>
                <div class="text-caption text-grey-darken-1 mb-1">{{ metric.title }}</div>
                <div class="text-h4 font-weight-bold" :class="`text-${metric.color}`">{{ metric.value }}</div>
                <div v-if="metric.subtitle" class="text-caption text-grey mt-1">{{ metric.subtitle }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Slot Usage -->
          <v-col cols="12" md="6">
            <v-card elevation="3">
              <v-card-title class="pa-4">Slot Type Usage</v-card-title>
              <v-card-text>
                <div v-for="slot in parkingAnalytics.slotTypeUsage" :key="slot.type" class="mb-4">
                  <div class="d-flex justify-space-between mb-2">
                    <span class="font-weight-medium">{{ slot.type }}</span>
                    <span class="text-grey">{{ slot.used }}/{{ slot.total }} ({{ slot.percentage }}%)</span>
                  </div>
                  <v-progress-linear
                    :model-value="slot.percentage"
                    :color="slot.type === 'Premium' ? 'purple' : 'indigo'"
                    height="8"
                  ></v-progress-linear>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Revenue by Type -->
          <v-col cols="12" md="6">
            <v-card elevation="3">
              <v-card-title class="pa-4">Revenue by Type</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="rev in parkingAnalytics.revenueByType" :key="rev.type">
                    <v-list-item-title>{{ rev.type }} Slots</v-list-item-title>
                    <template v-slot:append>
                      <div class="text-right">
                        <div class="font-weight-bold">₹{{ rev.revenue.toLocaleString() }}</div>
                        <div class="text-caption text-grey">{{ rev.percentage }}%</div>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Currently Parked -->
          <v-col cols="12">
            <v-card elevation="3">
              <v-card-title class="pa-4">Currently Parked Vehicles</v-card-title>
              <v-data-table
                :headers="parkingHeaders"
                :items="parkingAnalytics.currentlyParked"
                density="comfortable"
              >
                <template v-slot:item.entryTime="{ item }">
                  {{ formatTime(item.entryTime) }}
                </template>
                <template v-slot:item.duration="{ item }">
                  {{ item.duration }} mins
                </template>
                <template v-slot:item.type="{ item }">
                  <v-chip size="small" :color="item.type === 'Premium' ? 'purple' : 'indigo'">
                    {{ item.type }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Canteen Analytics Tab -->
      <v-window-item value="canteen">
        <v-row>
          <v-col cols="12" md="3" v-for="metric in canteenMetrics" :key="metric.title">
            <v-card elevation="2">
              <v-card-text>
                <div class="text-caption text-grey-darken-1 mb-1">{{ metric.title }}</div>
                <div class="text-h4 font-weight-bold" :class="`text-${metric.color}`">{{ metric.value }}</div>
                <div v-if="metric.subtitle" class="text-caption text-grey mt-1">{{ metric.subtitle }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Popular Items -->
          <v-col cols="12" md="8">
            <v-card elevation="3">
              <v-card-title class="pa-4">Top Menu Items</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="item in canteenAnalytics.popularItems" :key="item.item">
                    <template v-slot:prepend>
                      <v-avatar color="orange-lighten-4" size="40">
                        <v-icon color="orange">mdi-food</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-medium">{{ item.item }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.orders }} orders • ₹{{ item.revenue.toLocaleString() }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Payment Methods -->
          <v-col cols="12" md="4">
            <v-card elevation="3">
              <v-card-title class="pa-4">Payment Methods</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item v-for="method in canteenAnalytics.paymentMethods" :key="method.method">
                    <v-list-item-title>{{ method.method }}</v-list-item-title>
                    <template v-slot:append>
                      <div class="text-right">
                        <div class="font-weight-bold">{{ method.percentage }}%</div>
                        <div class="text-caption text-grey">{{ method.count }}</div>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Access Levels Tab -->
      <v-window-item value="access">
        <v-row>
          <v-col cols="12" md="6" v-for="level in accessAnalytics.distribution" :key="level.level">
            <v-card elevation="3">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-3">
                  <div>
                    <h3 class="text-h6 font-weight-bold">{{ level.level }}</h3>
                    <div class="text-caption text-grey">{{ level.count }} active members</div>
                  </div>
                  <v-chip color="success" size="large">
                    ₹{{ level.revenue.toLocaleString() }}/mo
                  </v-chip>
                </div>
                <v-progress-linear
                  :model-value="level.percentage"
                  color="purple"
                  height="6"
                ></v-progress-linear>
                <div class="text-caption text-grey mt-1">{{ level.percentage }}% of total members</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card elevation="3" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-3">mdi-account-group</v-icon>
              <h4 class="text-h6 mt-4">{{ accessAnalytics.totalActiveMembers }} Active Members</h4>
              <p class="text-body-2 text-grey">Generating ₹{{ accessAnalytics.totalMonthlyRevenue.toLocaleString() }}/month</p>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { analyticsService } from '@/services/appLayer/analyticsService';
import { appState } from '@/store/appLayerState';

const activeTab = ref('overview');
const dateRange = ref('Last 30 Days');
const loading = ref(false);

const dateRangeOptions = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

const stats = ref({
  visitors: { total: 0, change: 0, vip: 0 },
  parking: { occupied: 0, capacity: 100, revenue: 0, change: 0 },
  canteen: { orders: 0, revenue: 0, change: 0, walletUsage: 0 },
  revenue: { total: 0, byModule: { parking: 0, canteen: 0, memberships: 0 } }
});

const visitorAnalytics = ref({
  summary: {},
  trendData: [],
  peakHours: [],
  accessLevelBreakdown: [],
  entryGates: [],
  recentCheckIns: []
});

const parkingAnalytics = ref({
  summary: {},
  trendData: [],
  slotTypeUsage: [],
  revenueByType: [],
  averageDuration: {},
  currentlyParked: []
});

const canteenAnalytics = ref({
  summary: {},
  trendData: [],
  popularItems: [],
  paymentMethods: [],
  discountUsage: {},
  recentOrders: []
});

const accessAnalytics = ref({
  distribution: [],
  totalActiveMembers: 0,
  totalMonthlyRevenue: 0
});

const recentActivity = ref([]);

const selectedPlace = computed(() => {
  // Get from app state
  return { name: 'Downtown Gym' };
});

const visitorMetrics = computed(() => [
  { title: 'Total Visits', value: visitorAnalytics.value.summary.totalVisits || 0, color: 'primary' },
  { title: 'Avg Daily', value: visitorAnalytics.value.summary.averageDaily || 0, color: 'blue' },
  { title: 'Peak Day', value: visitorAnalytics.value.summary.peakDay?.visits || 0, color: 'indigo', subtitle: 'Highest' },
  { title: 'VIP %', value: `${visitorAnalytics.value.summary.vipPercentage || 0}%`, color: 'purple' }
]);

const parkingMetrics = computed(() => [
  { title: 'Total Revenue', value: `₹${parkingAnalytics.value.summary.totalRevenue?.toLocaleString() || 0}`, color: 'success' },
  { title: 'Avg Occupancy', value: `${parkingAnalytics.value.summary.averageOccupancy || 0}%`, color: 'indigo' },
  { title: 'Peak Occupancy', value: `${parkingAnalytics.value.summary.peakOccupancy || 0}%`, color: 'orange' },
  { title: 'Avg Duration', value: `${parkingAnalytics.value.averageDuration.overall || 0}m`, color: 'blue' }
]);

const canteenMetrics = computed(() => [
  { title: 'Total Orders', value: canteenAnalytics.value.summary.totalOrders || 0, color: 'orange' },
  { title: 'Total Revenue', value: `₹${canteenAnalytics.value.summary.totalRevenue?.toLocaleString() || 0}`, color: 'success' },
  { title: 'Avg Order', value: `₹${canteenAnalytics.value.summary.averageOrderValue || 0}`, color: 'blue' },
  { title: 'Wallet Usage', value: `${canteenAnalytics.value.summary.walletUsagePercentage || 0}%`, color: 'purple' }
]);

const parkingHeaders = [
  { title: 'Slot', key: 'slot' },
  { title: 'Vehicle', key: 'vehicle' },
  { title: 'Type', key: 'type' },
  { title: 'Entry Time', key: 'entryTime' },
  { title: 'Duration', key: 'duration' }
];

const loadData = async () => {
  loading.value = true;
  try {
    const locationId = appState.selectedPlaceId || 'place-123';
    
    // Load all analytics data
    stats.value = await analyticsService.getLocationStats(locationId);
    visitorAnalytics.value = await analyticsService.getVisitorAnalytics(locationId);
    parkingAnalytics.value = await analyticsService.getParkingAnalytics(locationId);
    canteenAnalytics.value = await analyticsService.getCanteenAnalytics(locationId);
    accessAnalytics.value = await analyticsService.getAccessLevelAnalytics(locationId);
    recentActivity.value = await analyticsService.getRecentActivity(locationId);
  } catch (e) {
    console.error('Failed to load analytics:', e);
  } finally {
    loading.value = false;
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

watch(dateRange, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.location-analytics {
  max-width: 1400px;
  margin: 0 auto;
}

.analytics-header {
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

.chart-placeholder {
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
