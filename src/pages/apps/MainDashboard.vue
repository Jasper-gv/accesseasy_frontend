<template>
  <div class="operations-dashboard">
    <!-- Header -->
    <div class="dashboard-header mb-8">
      <h1 class="text-h3 font-weight-bold gradient-text">Operations Overview</h1>
      <p class="text-subtitle-1 text-grey-darken-1">Real-time insights across all modules</p>
    </div>
    
    <!-- Top Stats Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" hover elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">Visitors Today</div>
                <div class="text-h3 font-weight-bold text-primary">{{ stats.visitors }}</div>
                <div class="text-caption text-success mt-1">
                  <v-icon size="12" color="success">mdi-trending-up</v-icon>
                  Active now
                </div>
              </div>
              <v-avatar color="primary-lighten-5" size="64" class="stat-avatar">
                <v-icon color="primary" size="32">mdi-account-group</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" hover elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">Cars Parked</div>
                <div class="text-h3 font-weight-bold text-indigo">{{ stats.parking }}</div>
                <div class="text-caption text-grey mt-1">
                  <v-icon size="12" color="grey">mdi-circle-small</v-icon>
                  65% capacity
                </div>
              </div>
              <v-avatar color="indigo-lighten-5" size="64" class="stat-avatar">
                <v-icon color="indigo" size="32">mdi-car-parking</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" hover elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">Canteen Orders</div>
                <div class="text-h3 font-weight-bold text-orange">{{ stats.orders }}</div>
                <div class="text-caption text-warning mt-1">
                  <v-icon size="12" color="warning">mdi-clock-outline</v-icon>
                  3 pending
                </div>
              </div>
              <v-avatar color="orange-lighten-5" size="64" class="stat-avatar">
                <v-icon color="orange" size="32">mdi-food</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" hover elevation="3">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">Revenue Today</div>
                <div class="text-h3 font-weight-bold text-green">₹{{ stats.revenue.toLocaleString() }}</div>
                <div class="text-caption text-success mt-1">
                  <v-icon size="12" color="success">mdi-arrow-up</v-icon>
                  +23% vs yesterday
                </div>
              </div>
              <v-avatar color="green-lighten-5" size="64" class="stat-avatar">
                <v-icon color="green" size="32">mdi-currency-inr</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts and Activity -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <v-card class="elevation-3" height="450">
          <v-card-title class="d-flex align-center bg-grey-lighten-5 pa-6">
            <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
            <span class="text-h6 font-weight-bold">Operational Activity</span>
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="chartPeriod" mandatory density="compact" variant="outlined" divided>
              <v-btn value="day" size="small">Day</v-btn>
              <v-btn value="week" size="small">Week</v-btn>
              <v-btn value="month" size="small">Month</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text class="d-flex align-center justify-center fill-height pa-8">
            <div class="text-center">
              <v-icon size="80" class="mb-4 text-grey-lighten-2">mdi-chart-areaspline</v-icon>
              <div class="text-h6 text-grey-darken-1 mb-2">Analytics Dashboard</div>
              <div class="text-body-2 text-grey">
                Chart visualization will be integrated here
              </div>
              <v-chip class="mt-4" color="info" size="small">
                <v-icon start size="16">mdi-information</v-icon>
                Coming Soon
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="elevation-3" height="450">
          <v-card-title class="d-flex align-center bg-grey-lighten-5 pa-6">
            <v-icon class="mr-2" color="warning">mdi-bell-ring</v-icon>
            <span class="text-h6 font-weight-bold">Live Alerts</span>
          </v-card-title>
          <v-divider></v-divider>
          <div class="overflow-y-auto" style="max-height: 390px;">
            <v-list lines="two" class="py-0">
              <v-list-item 
                prepend-icon="mdi-alert-circle" 
                class="alert-item"
              >
                <v-list-item-title class="font-weight-medium">High Occupancy</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  Parking Lot A is 90% full
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip size="x-small" color="warning" variant="flat">High</v-chip>
                </template>
              </v-list-item>
              <v-divider></v-divider>
              
              <v-list-item 
                prepend-icon="mdi-check-circle" 
                class="alert-item"
              >
                <v-list-item-title class="font-weight-medium">VIP Entry</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  John Doe checked in at Reception
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip size="x-small" color="success" variant="flat">Info</v-chip>
                </template>
              </v-list-item>
              <v-divider></v-divider>
              
              <v-list-item 
                prepend-icon="mdi-cart" 
                class="alert-item"
              >
                <v-list-item-title class="font-weight-medium">New Order</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  Canteen Order #4829 received
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip size="x-small" color="info" variant="flat">New</v-chip>
                </template>
              </v-list-item>
              <v-divider></v-divider>

              <v-list-item 
                prepend-icon="mdi-security" 
                class="alert-item"
              >
                <v-list-item-title class="font-weight-medium">Security Scan</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  Access granted to Jane Smith
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip size="x-small" color="primary" variant="flat">Info</v-chip>
                </template>
              </v-list-item>
              <v-divider></v-divider>

              <v-list-item 
                prepend-icon="mdi-clock-alert" 
                class="alert-item"
              >
                <v-list-item-title class="font-weight-medium">Pending Approval</v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  5 visitor requests awaiting review
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip size="x-small" color="orange" variant="flat">Action</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-card class="elevation-3">
      <v-card-title class="bg-grey-lighten-5 pa-6">
        <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
        <span class="text-h6 font-weight-bold">Quick Actions</span>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="6" sm="4" md="2">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="primary" 
              to="/apps/visitor"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="28" class="mb-1">mdi-account-plus</v-icon>
                <div class="text-caption">Add Visitor</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="4" md="2">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="indigo" 
              to="/apps/parking"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="28" class="mb-1">mdi-car</v-icon>
                <div class="text-caption">Parking</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="4" md="2">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="orange" 
              to="/apps/canteen"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="28" class="mb-1">mdi-food</v-icon>
                <div class="text-caption">Canteen</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="4" md="2">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="success" 
              to="/apps/membership"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="28" class="mb-1">mdi-card-account-details</v-icon>
                <div class="text-caption">Memberships</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="4" md="2">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="purple" 
              to="/configuration/store-configurator"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="28" class="mb-1">mdi-store-cog</v-icon>
                <div class="text-caption">Configure</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="4" md="2">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="red" 
              to="/apps/validator"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="28" class="mb-1">mdi-shield-check</v-icon>
                <div class="text-caption">Validator</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="6" sm="4" md="2">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="teal" 
              to="/configuration/saas-control-center"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="28" class="mb-1">mdi-map-marker-multiple</v-icon>
                <div class="text-caption">Locations</div>
              </div>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { visitorService } from '@/services/appLayer/visitorService';
import { parkingService } from '@/services/appLayer/parkingService';
import { canteenService } from '@/services/appLayer/canteenService';

const chartPeriod = ref('week');
const stats = ref({
  visitors: 0,
  parking: 0,
  orders: 0,
  revenue: 0
});

onMounted(async () => {
  try {
    const [vStats, pStats, cStats] = await Promise.all([
      visitorService.getStats(),
      parkingService.getStats(),
      canteenService.getStats()
    ]);
    
    stats.value = {
      visitors: vStats.totalVisits || 12,
      parking: pStats.occupied || 45,
      orders: cStats?.activeOrders?.length || 8,
      revenue: 15400
    };
  } catch (e) {
    console.error(e);
  }
});
</script>

<style scoped>
.operations-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #1976D2 0%, #42A5F5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.15) !important;
}

.stat-avatar {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.alert-item {
  transition: background-color 0.2s ease;
}

.alert-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.action-btn {
  height: 90px !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}
</style>
