<template>
  <div class="canteen-dashboard">
    <!-- Header with Tabs -->
    <div class="dashboard-header mb-6">
      <h1 class="text-h3 font-weight-bold mb-4">
        <v-icon size="44" color="orange" class="mr-3">mdi-food-fork-drink</v-icon>
        Canteen Management
      </h1>

      <v-tabs v-model="activeTab" bg-color="transparent" color="orange" class="mb-0">
        <v-tab value="orders" class="text-none">
          <v-icon start>mdi-clipboard-list</v-icon>
          Active Orders
          <v-chip v-if="activeOrders.length > 0" size="small" color="warning" class="ml-2">
            {{ activeOrders.length }}
          </v-chip>
        </v-tab>
        <v-tab value="menu" class="text-none">
          <v-icon start>mdi-food</v-icon>
          Menu Management
        </v-tab>
        <v-tab value="wallet" class="text-none">
          <v-icon start>mdi-wallet</v-icon>
          Wallet Configuration
        </v-tab>
        <v-tab value="analytics" class="text-none">
          <v-icon start>mdi-chart-line</v-icon>
          Analytics
        </v-tab>
      </v-tabs>
    </div>

    <v-window v-model="activeTab">
      <!-- Orders Tab -->
      <v-window-item value="orders">
        <v-row>
          <v-col cols="12" md="8">
            <v-card elevation="3">
              <v-card-title class="d-flex align-center justify-space-between pa-6 bg-grey-lighten-5">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="orange">mdi-food-variant</v-icon>
                  <span class="text-h6 font-weight-bold">Live Orders</span>
                </div>
                <v-btn icon="mdi-refresh" variant="text" @click="loadOrders" :loading="loadingOrders"></v-btn>
              </v-card-title>

              <v-list v-if="orders.length > 0">
                <template v-for="(order, index) in orders" :key="order.id">
                  <v-list-item class="order-item pa-4">
                    <template v-slot:prepend>
                      <v-avatar :color="getStatusColor(order.status) + '-lighten-4'" size="56">
                        <v-icon :color="getStatusColor(order.status)" size="28">
                          {{ getStatusIcon(order.status) }}
                        </v-icon>
                      </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-bold mb-1">
                      Order #{{ order.id }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption mb-2">
                      {{ new Date(order.createdAt).toLocaleTimeString() }}
                    </v-list-item-subtitle>

                    <div class="mt-2 mb-3">
                      <v-chip
                        v-for="item in order.items"
                        :key="item.id"
                        size="small"
                        class="mr-1 mb-1"
                        variant="outlined"
                      >
                        {{ item.quantity }}x {{ item.name }}
                      </v-chip>
                    </div>

                    <template v-slot:append>
                      <div class="d-flex flex-column align-end">
                        <div class="text-h6 font-weight-bold text-orange mb-2">
                          ₹{{ order.total }}
                        </div>
                        <v-chip
                          :color="getStatusColor(order.status)"
                          size="small"
                          variant="flat"
                          class="mb-2"
                        >
                          {{ order.status }}
                        </v-chip>
                        <div class="d-flex gap-1">
                          <v-btn
                            v-if="order.status === 'Pending'"
                            color="primary"
                            size="small"
                            @click="updateStatus(order.id, 'Preparing')"
                          >
                            Start
                          </v-btn>
                          <v-btn
                            v-if="order.status === 'Preparing'"
                            color="info"
                            size="small"
                            @click="updateStatus(order.id, 'Ready')"
                          >
                            Mark Ready
                          </v-btn>
                          <v-btn
                            v-if="order.status === 'Ready'"
                            color="success"
                            size="small"
                            @click="updateStatus(order.id, 'Completed')"
                          >
                            Complete
                          </v-btn>
                        </div>
                      </div>
                    </template>
                  </v-list-item>
                  <v-divider v-if="index < orders.length - 1"></v-divider>
                </template>
              </v-list>

              <div v-else class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-3">mdi-food-off</v-icon>
                <p class="text-grey mt-4">No active orders</p>
              </div>
            </v-card>
          </v-col>

          <!-- Quick Stats -->
          <v-col cols="12" md="4">
            <v-row>
              <v-col cols="12">
                <v-card class="stat-card" elevation="2">
                  <v-card-text>
                    <div class="text-caption text-grey-darken-1 mb-1">Today's Orders</div>
                    <div class="text-h3 font-weight-bold text-primary">{{ stats.todayOrders }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-card class="stat-card" elevation="2">
                  <v-card-text>
                    <div class="text-caption text-grey-darken-1 mb-1">Today's Revenue</div>
                    <div class="text-h3 font-weight-bold text-success">₹{{ stats.todayRevenue }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-card class="stat-card" elevation="2">
                  <v-card-text>
                    <div class="text-caption text-grey-darken-1 mb-1">Active Users</div>
                    <div class="text-h3 font-weight-bold text-info">{{ stats.activeUsers }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Menu Tab -->
      <v-window-item value="menu">
        <v-row>
          <v-col cols="12" md="8">
            <v-card elevation="3">
              <v-card-title class="pa-6 bg-grey-lighten-5">
                <v-icon class="mr-2" color="orange">mdi-food</v-icon>
                <span class="text-h6 font-weight-bold">Menu Items</span>
              </v-card-title>

              <v-list>
                <v-list-item
                  v-for="item in menu"
                  :key="item.id"
                  class="pa-4"
                >
                  <template v-slot:prepend>
                    <v-avatar color="orange-lighten-4" size="48">
                      <v-icon color="orange">mdi-food-variant</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip size="x-small" class="mr-1">{{ item.category }}</v-chip>
                    <span class="text-h6 font-weight-bold text-orange">₹{{ item.price }}</span>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="d-flex align-center gap-2">
                      <v-chip
                        :color="item.available ? 'success' : 'grey'"
                        size="small"
                        variant="flat"
                      >
                        {{ item.available ? 'Available' : 'Out of Stock' }}
                      </v-chip>
                      <v-switch
                        v-model="item.available"
                        color="success"
                        density="compact"
                        hide-details
                        inset
                        @update:modelValue="toggleAvailability(item.id)"
                      ></v-switch>
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>
              <v-card-actions class="pa-4">
                <v-btn block color="orange" variant="outlined" prepend-icon="mdi-plus" size="large">
                  Add New Menu Item
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Wallet Configuration Tab -->
      <v-window-item value="wallet">
        <v-row>
          <v-col cols="12" md="8">
            <v-card elevation="3">
              <v-card-title class="pa-6 bg-purple-lighten-5">
                <v-icon class="mr-2" color="purple">mdi-wallet-giftcard</v-icon>
                <span class="text-h6 font-weight-bold">User Wallet Configuration</span>
              </v-card-title>

              <v-card-text class="pa-6">
                <v-alert color="purple-lighten-5" class="mb-6" border="start" border-color="purple">
                  <div class="text-body-2 text-purple-darken-2">
                    Configure wallet rules for canteen credit. These settings work in conjunction with Access Level permissions.
                  </div>
                </v-alert>

                <h3 class="text-h6 mb-4">Monthly Credit Allowance</h3>

                <v-radio-group v-model="walletConfig.allowanceType" class="mb-4">
                  <v-radio value="none" color="purple">
                    <template v-slot:label>
                      <div>
                        <div class="font-weight-medium">No Automatic Allowance</div>
                        <div class="text-caption text-grey">Credits managed via Access Levels only</div>
                      </div>
                    </template>
                  </v-radio>
                  <v-radio value="fixed" color="purple">
                    <template v-slot:label>
                      <div>
                        <div class="font-weight-medium">Fixed Monthly Allowance</div>
                        <div class="text-caption text-grey">Same amount for all users each month</div>
                      </div>
                    </template>
                  </v-radio>
                  <v-radio value="tier" color="purple">
                    <template v-slot:label>
                      <div>
                        <div class="font-weight-medium">Access Level Based</div>
                        <div class="text-caption text-grey">Credit limits defined in each access level</div>
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>

                <v-expand-transition>
                  <v-card v-if="walletConfig.allowanceType === 'fixed'" variant="outlined" class="pa-4 mb-4">
                    <v-text-field
                      v-model.number="walletConfig.monthlyAllowance"
                      label="Monthly Allowance per User"
                      prefix="₹"
                      type="number"
                      variant="outlined"
                      hint="This amount will be credited to all users monthly"
                      persistent-hint
                    ></v-text-field>
                  </v-card>
                </v-expand-transition>

                <v-divider class="my-6"></v-divider>

                <h3 class="text-h6 mb-4">Carry Forward & Expiry</h3>

                <v-checkbox
                  v-model="walletConfig.carryForward"
                  label="Allow unused balance to carry forward to next month"
                  color="purple"
                  hide-details
                  class="mb-4"
                ></v-checkbox>

                <v-expand-transition>
                  <v-card v-if="walletConfig.carryForward" variant="outlined" class="pa-4 mb-4">
                    <v-text-field
                      v-model.number="walletConfig.maxBalance"
                      label="Maximum Balance Cap"
                      prefix="₹"
                      type="number"
                      variant="outlined"
                      hint="Safety limit to prevent excessive accumulation"
                      persistent-hint
                    ></v-text-field>
                  </v-card>
                </v-expand-transition>

                <v-checkbox
                  v-if="!walletConfig.carryForward"
                  v-model="walletConfig.resetMonthly"
                  label="Reset unused balance to zero on 1st of each month"
                  color="purple"
                  hide-details
                  class="mb-4"
                ></v-checkbox>

                <v-divider class="my-6"></v-divider>

                <h3 class="text-h6 mb-4">Discounts & Offers</h3>

                <v-text-field
                  v-model.number="walletConfig.defaultDiscount"
                  label="Default Discount for All Users"
                  suffix="%"
                  type="number"
                  variant="outlined"
                  hint="Base discount before access level bonuses"
                  persistent-hint
                  class="mb-4"
                ></v-text-field>

                <v-alert type="info" variant="tonal" density="compact">
                  Additional discounts can be defined per Access Level in the Access Level Manager
                </v-alert>
              </v-card-text>

              <v-divider></v-divider>
              <v-card-actions class="pa-6">
                <v-spacer></v-spacer>
                <v-btn color="purple" variant="flat" size="large" @click="saveWalletConfig" :loading="saving">
                  <v-icon start>mdi-content-save</v-icon>
                  Save Configuration
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="text-body-1 pa-4">
                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                How It Works
              </v-card-title>
              <v-card-text class="text-body-2">
                <ol class="pl-4">
                  <li class="mb-2">Users are assigned Access Levels with credit limits</li>
                  <li class="mb-2">Monthly allowances are auto-credited on 1st</li>
                  <li class="mb-2">Discounts stack: Base + Access Level bonus</li>
                  <li class="mb-2">Balance tracked per user in real-time</li>
                </ol>
              </v-card-text>
            </v-card>

            <v-card elevation="2">
              <v-card-title class="text-body-1 pa-4">
                <v-icon class="mr-2" color="success">mdi-link</v-icon>
                Quick Links
              </v-card-title>
              <v-card-text>
                <v-btn block variant="outlined" to="/apps/access-levels" class="mb-2" color="purple">
                  <v-icon start>mdi-key-variant</v-icon>
                  Manage Access Levels
                </v-btn>
                <v-btn block variant="outlined" to="/go/canteen" target="_blank" color="orange">
                  <v-icon start>mdi-launch</v-icon>
                  View Client App
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Analytics Tab -->
      <v-window-item value="analytics">
        <v-row>
          <v-col cols="12" md="8">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="pa-4">Revenue Trend (7 Days)</v-card-title>
              <v-card-text>
                <div class="d-flex align-end justify-space-between px-4 pb-2" style="height: 200px;">
                  <div v-for="n in 7" :key="n" class="d-flex flex-column align-center" style="width: 10%;">
                    <div class="bg-orange rounded-t-lg mb-2" :style="{ width: '80%', height: Math.floor(Math.random() * 80 + 20) + '%' }"></div>
                    <div class="text-caption text-grey">Day {{ n }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
            
            <v-row>
                 <v-col cols="12" md="6">
                    <v-card elevation="2" title="Popular Items">
                        <v-list density="compact">
                            <v-list-item title="Veg Thali" subtitle="142 Orders">
                                <template v-slot:append><div class="text-h6 font-weight-bold">₹11,360</div></template>
                            </v-list-item>
                            <v-list-item title="Coffee" subtitle="89 Orders">
                                <template v-slot:append><div class="text-h6 font-weight-bold">₹2,670</div></template>
                            </v-list-item>
                            <v-list-item title="Chicken Biryani" subtitle="56 Orders">
                                <template v-slot:append><div class="text-h6 font-weight-bold">₹8,400</div></template>
                            </v-list-item>
                        </v-list>
                    </v-card>
                 </v-col>
                 <v-col cols="12" md="6">
                     <v-card elevation="2" title="Peak Hours">
                         <div class="pa-4">
                             <div class="d-flex justify-space-between mb-2">
                                 <span>12:00 PM - 2:00 PM</span>
                                 <v-chip color="red" size="small">Highest</v-chip>
                             </div>
                             <v-progress-linear model-value="90" color="red" height="8" rounded></v-progress-linear>
                             
                             <div class="d-flex justify-space-between mb-2 mt-4">
                                 <span>8:00 AM - 10:00 AM</span>
                                 <v-chip color="orange" size="small">Medium</v-chip>
                             </div>
                             <v-progress-linear model-value="60" color="orange" height="8" rounded></v-progress-linear>
                         </div>
                     </v-card>
                 </v-col>
            </v-row>
          </v-col>
          
          <v-col cols="12" md="4">
              <v-card elevation="2" class="mb-4 bg-orange-lighten-5">
                  <v-card-text class="text-center pa-6">
                      <div class="text-caption text-grey-darken-1 mb-1">Total Revenue (This Month)</div>
                      <div class="text-h3 font-weight-bold text-orange">₹45,200</div>
                      <div class="d-flex align-center justify-center mt-2">
                          <v-icon color="success" size="small">mdi-arrow-up</v-icon>
                          <span class="text-success text-body-2 font-weight-bold ml-1">12.5%</span>
                          <span class="text-caption text-grey ml-1">vs last month</span>
                      </div>
                  </v-card-text>
              </v-card>
              
              <v-card elevation="2">
                  <v-card-title>Category Split</v-card-title>
                  <v-card-text>
                      <div class="d-flex align-center justify-space-between mb-2">
                          <span>Meals</span>
                          <span>60%</span>
                      </div>
                      <v-progress-linear model-value="60" color="primary" height="6" class="mb-4" rounded></v-progress-linear>
                      
                      <div class="d-flex align-center justify-space-between mb-2">
                          <span>Beverages</span>
                          <span>25%</span>
                      </div>
                      <v-progress-linear model-value="25" color="info" height="6" class="mb-4" rounded></v-progress-linear>
                      
                      <div class="d-flex align-center justify-space-between mb-2">
                          <span>Snacks</span>
                          <span>15%</span>
                      </div>
                      <v-progress-linear model-value="15" color="success" height="6" class="mb-2" rounded></v-progress-linear>
                  </v-card-text>
              </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { canteenService } from '@/services/appLayer/canteenService';

const activeTab = ref('orders');
const orders = ref([]);
const menu = ref([]);
const loadingOrders = ref(false);
const saving = ref(false);

const walletConfig = ref({
  allowanceType: 'tier',
  monthlyAllowance: 2000,
  carryForward: true,
  maxBalance: 5000,
  resetMonthly: false,
  defaultDiscount: 0
});

const stats = ref({
  todayOrders: 24,
  todayRevenue: 5600,
  activeUsers: 45
});

const activeOrders = computed(() => orders.value.filter(o => o.status !== 'Completed'));

const loadOrders = async () => {
  loadingOrders.value = true;
  try {
    const allOrders = await canteenService.getOrders();
    orders.value = allOrders.slice(0, 20);
  } catch (e) {
    console.error(e);
  } finally {
    loadingOrders.value = false;
  }
};

const loadMenu = async () => {
  try {
    menu.value = await canteenService.getMenu();
  } catch (e) {
    console.error(e);
  }
};

const toggleAvailability = async (id) => {
  await canteenService.toggleAvailability(id);
};

const updateStatus = async (id, status) => {
  try {
    await canteenService.updateOrderStatus(id, status);
    await loadOrders();
  } catch (e) {
    console.error(e);
  }
};

const saveWalletConfig = async () => {
  saving.value = true;
  // Save to storefront config or global settings
  setTimeout(() => {
    saving.value = false;
    alert('Wallet configuration saved!');
  }, 1000);
};

const getStatusColor = (status) => {
  const colors = {
    Pending: 'warning',
    Preparing: 'info',
    Ready: 'success',
    Completed: 'grey'
  };
  return colors[status] || 'grey';
};

const getStatusIcon = (status) => {
  const icons = {
    Pending: 'mdi-clock-outline',
    Preparing: 'mdi-chef-hat',
    Ready: 'mdi-check-circle',
    Completed: 'mdi-checkbox-marked-circle'
  };
  return icons[status] || 'mdi-help-circle';
};

onMounted(() => {
  loadOrders();
  loadMenu();
  setInterval(loadOrders, 10000);
});
</script>

<style scoped>
.canteen-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1rem;
}

.order-item {
  transition: background-color 0.2s ease;
}

.order-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.stat-card {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}
</style>
