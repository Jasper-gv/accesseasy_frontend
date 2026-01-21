<template>
  <div class="saas-dashboard">
    <!-- Header & Actions -->
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <div class="mb-6">
            <h1 class="text-h3 font-weight-bold mb-2 gradient-text">Platform Subscriptions</h1>
            <p class="text-subtitle-1 text-grey-darken-1">Manage billing, plans, and global settings for your locations.</p>
          </div>

          <!-- Quick Actions Flow Banner -->
          <v-alert
              color="primary"
              variant="tonal"
              icon="mdi-information"
              class="mb-6"
              closable
          >
              <strong>Setup Flow:</strong> 
              <span class="mx-2">1. Overview (Here)</span>
              <v-icon size="small">mdi-arrow-right</v-icon>
              <span class="mx-2">2. Create Branch</span>
              <v-icon size="small">mdi-arrow-right</v-icon>
              <span class="mx-2">3. Configure Settings</span>
          </v-alert>

          <!-- Info Alert -->

        </div>
        <div class="d-flex gap-2">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            height="44"
            class="text-none font-weight-medium px-6"
            @click="showCreateDialog = true"
          >
            Add New Location
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <!-- KPI Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card 
          class="stat-card elevation-3" 
          :style="{ borderLeft: '4px solid #3B82F6' }"
          hover
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">Total Locations</div>
                <div class="text-h3 font-weight-bold text-primary">{{ tenants.length }}</div>
                <div class="text-caption text-success mt-1">
                  <v-icon size="14" color="success">mdi-arrow-up</v-icon>
                  +12% this month
                </div>
              </div>
              <v-avatar color="primary-lighten-5" size="56">
                <v-icon color="primary" size="28">mdi-domain</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card 
          class="stat-card elevation-3" 
          :style="{ borderLeft: '4px solid #10B981' }"
          hover
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">Active Subscriptions</div>
                <div class="text-h3 font-weight-bold text-success">{{ tenants.filter(t => t.status === 'Active').length }}</div>
                <div class="text-caption text-grey mt-1">
                  {{ ((tenants.filter(t => t.status === 'Active').length / tenants.length) * 100).toFixed(0) }}% active rate
                </div>
              </div>
              <v-avatar color="success-lighten-5" size="56">
                <v-icon color="success" size="28">mdi-check-circle</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card 
          class="stat-card" 
          :style="{ borderLeft: '4px solid #F59E0B' }"
          hover
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">
                  Monthly Recurring Revenue
                  <v-tooltip location="top" max-width="300">
                    <template v-slot:activator="{ props }">
                      <v-icon size="14" color="grey" v-bind="props" class="ml-1">mdi-information</v-icon>
                    </template>
                    <div class="text-caption">
                      <div class="font-weight-bold mb-1">How MRR is calculated:</div>
                      <div>Sum of all active monthly subscriptions</div>
                      <div class="mt-2">
                        Example: 3 tenants × ₹5,000/month each = ₹15,000 MRR
                      </div>
                    </div>
                  </v-tooltip>
                </div>
                <div class="text-h3 font-weight-bold text-orange-darken-2">₹{{ (mrr / 100).toLocaleString() }}</div>
                <div class="text-caption text-grey mt-1">
                  From {{ tenants.filter(t => t.status === 'Active').length }} active tenant{{ tenants.filter(t => t.status === 'Active').length !== 1 ? 's' : '' }}
                </div>
              </div>
              <v-avatar color="orange-lighten-5" size="56">
                <v-icon color="orange-darken-1" size="28">mdi-currency-inr</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card 
          class="stat-card elevation-3" 
          :style="{ borderLeft: '4px solid #8B5CF6' }"
          hover
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 font-weight-medium mb-1">Total Users</div>
                <div class="text-h3 font-weight-bold text-purple-darken-1">{{ totalUsers.toLocaleString() }}</div>
                <div class="text-caption text-grey mt-1">
                  Across all tenants
                </div>
              </div>
              <v-avatar color="purple-lighten-5" size="56">
                <v-icon color="purple-darken-1" size="28">mdi-account-group</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-card class="elevation-3 mb-8 rounded-lg">
      <v-card-title class="bg-grey-lighten-5 pa-6">
        <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
        <span class="text-h6 font-weight-bold">Quick Actions</span>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" sm="4">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="primary" 
              class="action-btn"
              @click="showCreateDialog = true"
            >
              <div class="text-center">
                <v-icon size="32" class="mb-2">mdi-plus-circle</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Create Branch</div>
                <div class="text-caption">Add a new location</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="indigo" 
              to="/organization/org_location"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="32" class="mb-2">mdi-cog</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Configurator</div>
                <div class="text-caption">Manage branch settings</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn 
              block 
              size="large" 
              variant="tonal" 
              color="success" 
              to="/apps/places/membership"
              class="action-btn"
            >
              <div class="text-center">
                <v-icon size="32" class="mb-2">mdi-card-account-details</v-icon>
                <div class="text-subtitle-1 font-weight-bold">Membership</div>
                <div class="text-caption">Manage plans & users</div>
              </div>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tenants Table -->
    <v-card class="elevation-3 rounded-lg">
      <v-card-title class="d-flex align-center justify-space-between pa-6 bg-grey-lighten-5">
        <div class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-file-certificate</v-icon>
          <span class="text-h6 font-weight-bold">Location Subscriptions</span>
        </div>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search tenants..."
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="search-field"
          style="max-width: 300px;"
        ></v-text-field>
      </v-card-title>

      <v-data-table 
        :headers="headers" 
        :items="tenants" 
        :search="search"
        hover
        class="elevation-0"
      >
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary-lighten-4" size="40" class="mr-3">
              <span class="text-primary font-weight-bold">{{ item.name.charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-grey">{{ item.type }}</div>
            </div>
          </div>
        </template>
        
        <template v-slot:item.plan="{ item }">
          <v-chip 
            size="small" 
            :color="getPlanColor(item.plan)"
            variant="flat"
            class="font-weight-medium"
          >
            {{ item.plan }}
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip 
            size="small" 
            :color="item.status === 'Active' ? 'success' : 'grey'" 
            variant="flat"
          >
            <v-icon start size="14">{{ item.status === 'Active' ? 'mdi-check-circle' : 'mdi-pause-circle' }}</v-icon>
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.domain="{ item }">
          <div v-if="domains[item.id]" class="d-flex align-center">
            <span class="mr-2 text-body-2">{{ domains[item.id].domain }}</span>
            <v-tooltip :text="domains[item.id].status === 'active' ? 'SSL Verified' : 'Pending Verification'" location="top">
              <template v-slot:activator="{ props }">
                <v-icon 
                  v-bind="props"
                  size="18" 
                  :color="domains[item.id].status === 'active' ? 'success' : 'warning'"
                >
                  {{ domains[item.id].status === 'active' ? 'mdi-shield-check' : 'mdi-alert-circle-outline' }}
                </v-icon>
              </template>
            </v-tooltip>
          </div>
          <span v-else class="text-grey text-caption">No custom domain</span>
        </template>

        <template v-slot:item.userCount="{ item }">
          <div class="font-weight-medium">{{ item.userCount.toLocaleString() }}</div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="Configure Storefront" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  size="small" 
                  variant="text" 
                  icon="mdi-cog" 
                  :to="`/apps/storefront?placeId=${item.id}`" 
                  v-bind="props" 
                  color="primary"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Sell Memberships" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  size="small" 
                  variant="text" 
                  icon="mdi-cash-register" 
                  :to="`/apps/places/membership?placeId=${item.id}`" 
                  v-bind="props"
                  color="success"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="View Live App" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  size="small" 
                  variant="text" 
                  icon="mdi-open-in-new" 
                  :href="`/go/app/${item.id}`" 
                  target="_blank" 
                  v-bind="props"
                  color="info"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create Tenant Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="d-flex align-center pa-6 bg-primary text-white">
          <v-icon class="mr-2" color="white">mdi-plus-circle</v-icon>
          <span class="text-h5">Create New Tenant</span>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-text-field 
            v-model="newTenant.name" 
            label="Organization Name" 
            variant="outlined"
            prepend-inner-icon="mdi-office-building"
            placeholder="e.g., Acme Corporation"
            hint="This will be displayed in the app"
            persistent-hint
            class="mb-4"
          ></v-text-field>
          
          <v-select 
            v-model="newTenant.plan" 
            :items="['Starter', 'Pro', 'Enterprise']" 
            label="Subscription Plan" 
            variant="outlined"
            prepend-inner-icon="mdi-star-circle"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-icon :color="getPlanColor(item.value)">mdi-circle</v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-alert type="info" variant="tonal" class="mt-4 text-caption">
            After creation, you'll be redirected to the Storefront Configurator to customize branding and features.
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn 
            variant="text" 
            @click="showCreateDialog = false"
            :disabled="creating"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="createTenant" 
            :loading="creating"
            prepend-icon="mdi-rocket-launch"
            variant="flat"
            class="px-6"
          >
            Create & Configure
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { placesService } from '@/services/appLayer/placesService';
import { domainService } from '@/services/appLayer/domainService';
import { useRouter } from 'vue-router';

const router = useRouter();
const tenants = ref([]);
const domains = ref({});
const showCreateDialog = ref(false);
const creating = ref(false);
const search = ref('');
const newTenant = ref({ name: '', plan: 'Starter' });

const headers = [
  { title: 'Tenant / Place', key: 'name', sortable: true },
  { title: 'Plan', key: 'plan', sortable: true },
  { title: 'Custom Domain', key: 'domain', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Users', key: 'userCount', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const totalUsers = computed(() => {
  return tenants.value.reduce((sum, t) => sum + (t.userCount || 0), 0);
});

const loadData = async () => {
  const places = await placesService.getAll();
  
  tenants.value = places.map((p, i) => ({
    ...p,
    plan: ['Starter', 'Pro', 'Enterprise'][i % 3],
    status: 'Active',
    userCount: Math.floor(Math.random() * 500) + 50
  }));

  for (const t of tenants.value) {
    try {
      const d = await domainService.getDomain(t.id);
      if (d) domains.value[t.id] = d;
    } catch (e) {}
  }
};

const createTenant = async () => {
  if (!newTenant.value.name) return;
  creating.value = true;
  try {
    const place = await placesService.create({ 
      name: newTenant.value.name, 
      type: 'branch', 
      address: 'New Location' 
    });
    
    showCreateDialog.value = false;
    router.push(`/apps/storefront?placeId=${place.id}`);
  } catch(e) {
    alert('Error creating tenant');
  } finally {
    creating.value = false;
  }
};

const mrr = computed(() => {
  const planMap = { 'Starter': 29, 'Pro': 99, 'Enterprise': 499 };
  return tenants.value.reduce((sum, t) => sum + (planMap[t.plan] || 0), 0) * 100;
});

const getPlanColor = (plan) => {
  switch(plan) {
    case 'Enterprise': return 'purple';
    case 'Pro': return 'blue';
    default: return 'grey-darken-1';
  }
};

onMounted(loadData);
</script>

<style scoped>
.saas-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 2rem;
}

.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.15) !important;
}

.search-field {
  background: white;
}

.gradient-text {
  background: linear-gradient(135deg, #1976D2 0%, #42A5F5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.action-btn {
  height: 120px !important;
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
}

/* Enhanced table row hover effect */
:deep(.v-data-table .v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}

/* Modern chip styling */
:deep(.v-chip) {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.7rem;
}
</style>
