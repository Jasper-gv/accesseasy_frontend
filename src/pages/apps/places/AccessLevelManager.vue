<template>
  <div class="access-level-manager">
    <!-- Header -->
    <div v-if="!embedded" class="manager-header mb-8">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">
            <v-icon size="40" color="primary" class="mr-2">mdi-card-account-details</v-icon>
            Membership Plans
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">Manage membership tiers, passes, and access permissions</p>
        </div>
        <v-btn 
          color="primary" 
          size="large"
          prepend-icon="mdi-plus-circle" 
          @click="showCreateDialog = true"
          elevation="2"
          class="px-6"
        >
          Create Plan
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" hover>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">Total Plans</div>
                <div class="text-h4 font-weight-bold text-primary">{{ accessLevels.length }}</div>
              </div>
              <v-avatar color="primary-lighten-5" size="56">
                <v-icon color="primary" size="28">mdi-key</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" hover>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">Global Access</div>
                <div class="text-h4 font-weight-bold text-success">{{ globalCount }}</div>
              </div>
              <v-avatar color="success-lighten-5" size="56">
                <v-icon color="success" size="28">mdi-earth</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" hover>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">Location-Specific</div>
                <div class="text-h4 font-weight-bold text-info">{{ locationSpecificCount }}</div>
              </div>
              <v-avatar color="info-lighten-5" size="56">
                <v-icon color="info" size="28">mdi-map-marker-multiple</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2" hover>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey-darken-1 mb-1">Active Plans</div>
                <div class="text-h4 font-weight-bold text-success">{{ activeCount }}</div>
              </div>
              <v-avatar color="success-lighten-5" size="56">
                <v-icon color="success" size="28">mdi-check-circle</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" bg-color="transparent" color="purple" class="mb-6">
      <v-tab value="list" class="text-none">Membership Plans</v-tab>
      <v-tab value="analytics" class="text-none">Plan Analytics</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- List Tab -->
      <v-window-item value="list">
        <!-- Access Levels Table -->
    <v-card class="elevation-3">
      <v-card-title class="d-flex align-center justify-space-between pa-6 bg-grey-lighten-5">
        <div class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>
          <span class="text-h6 font-weight-bold">Plans List</span>
        </div>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search..."
          single-line
          hide-details
          density="compact"
          variant="outlined"
          style="max-width: 300px;"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="accessLevels"
        :search="search"
        hover
        class="elevation-0"
      >
        <template v-slot:item.name="{ item }">
          <div class="py-2">
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.type }}</div>
          </div>
        </template>

        <template v-slot:item.module="{ item }">
          <v-chip size="small" :color="getModuleColor(item.module)" variant="flat">
            {{ getModuleLabel(item.module) }}
          </v-chip>
        </template>

        <template v-slot:item.scope="{ item }">
          <v-chip 
            size="small" 
            :color="item.scope === 'global' ? 'success' : 'info'"
            variant="flat"
            prepend-icon="mdi-earth"
          >
            {{ item.scope === 'global' ? 'All Locations' : `${item.locationIds.length} Location(s)` }}
          </v-chip>
        </template>

        <template v-slot:item.price="{ item }">
          <div class="font-weight-medium">₹{{ item.price.toLocaleString() }}</div>
          <div class="text-caption text-grey">{{ item.recurringBilling }}</div>
        </template>

        <template v-slot:item.visitor="{ item }">
          <v-chip v-if="item.permissions.visitor.linkedTemplateId" size="small" color="blue" variant="tonal" prepend-icon="mdi-account-details">
            {{ visitorTemplates.find(t => t.id === item.permissions.visitor.linkedTemplateId)?.name || 'Linked' }}
          </v-chip>
          <span v-else class="text-caption text-grey">None</span>
        </template>

        <template v-slot:item.parking="{ item }">
          <v-chip v-if="item.permissions.parking.linkedTemplateId" size="small" color="indigo" variant="tonal" prepend-icon="mdi-car">
            {{ parkingTemplates.find(t => t.id === item.permissions.parking.linkedTemplateId)?.name || 'Linked' }}
          </v-chip>
          <span v-else class="text-caption text-grey">None</span>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            size="small"
            :color="item.status === 'active' ? 'success' : 'grey'"
            variant="flat"
          >
            <v-icon start size="14">{{ item.status === 'active' ? 'mdi-check-circle' : 'mdi-pause-circle' }}</v-icon>
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="Edit" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-pencil"
                  @click="editAccessLevel(item)"
                  v-bind="props"
                  color="primary"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip :text="item.status === 'active' ? 'Deactivate' : 'Activate'" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  size="small"
                  variant="text"
                  :icon="item.status === 'active' ? 'mdi-pause' : 'mdi-play'"
                  @click="toggleStatus(item)"
                  v-bind="props"
                  :color="item.status === 'active' ? 'warning' : 'success'"
                ></v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Delete" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-delete"
                  @click="deleteAccessLevel(item)"
                  v-bind="props"
                  color="error"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>
    </v-window-item>

    <!-- Analytics Tab -->
    <v-window-item value="analytics">
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="selectedLevelForAnalytics"
            :items="accessLevels"
            item-title="name"
            item-value="id"
            label="Select Plan to Analyze"
            variant="outlined"
            prepend-inner-icon="mdi-card-account-details"
            class="mb-4"
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <div v-if="selectedLevelForAnalytics && levelAnalytics">
        <v-row>
          <!-- KPI Cards -->
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2">
              <v-card-text>
                <div class="text-caption text-grey-darken-1 mb-1">Total Sold</div>
                <div class="text-h3 font-weight-bold text-purple">{{ levelAnalytics.summary.totalSold }}</div>
                <div class="text-caption text-grey mt-1">All time</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2">
              <v-card-text>
                <div class="text-caption text-grey-darken-1 mb-1">Currently Active</div>
                <div class="text-h3 font-weight-bold text-success">{{ levelAnalytics.summary.currentlyActive }}</div>
                <div class="text-caption text-success mt-1">
                  <v-icon size="14">mdi-arrow-up</v-icon>
                  {{ levelAnalytics.summary.retentionRate }}% retention
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2">
              <v-card-text>
                <div class="text-caption text-grey-darken-1 mb-1">Monthly Revenue</div>
                <div class="text-h3 font-weight-bold text-green">₹{{ levelAnalytics.revenue.monthly.toLocaleString() }}</div>
                <div class="text-caption text-grey mt-1">Recurring</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card elevation="2">
              <v-card-text>
                <div class="text-caption text-grey-darken-1 mb-1">Churn Rate</div>
                <div class="text-h3 font-weight-bold text-orange">{{ levelAnalytics.summary.churnRate }}%</div>
                <div class="text-caption text-grey mt-1">Last  30 days</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <!-- Sales Trend Chart Placeholder -->
          <v-col cols="12" md="8">
            <v-card elevation="3">
              <v-card-title class="pa-4">Sales Trend (Last 90 Days)</v-card-title>
              <v-card-text>
                <div class="chart-placeholder text-center py-8">
                  <v-icon size="64" color="grey-lighten-3">mdi-chart-line</v-icon>
                  <p class="text-caption text-grey mt-2">Line chart: Memberships sold over time</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Usage by Location -->
          <v-col cols="12" md="4">
            <v-card elevation="3">
              <v-card-title class="pa-4">Usage by Location</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item v-for="loc in levelAnalytics.usageByLocation" :key="loc.location">
                    <v-list-item-title>{{ loc.location }}</v-list-item-title>
                    <template v-slot:append>
                      <div class="text-right">
                        <div class="font-weight-bold">{{ loc.members }}</div>
                        <div class="text-caption text-grey">{{ loc.usage }} visits</div>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <!-- Average Usage Metrics -->
          <v-col cols="12">
            <v-card elevation="3">
              <v-card-title class="pa-4">Average Member Usage</v-card-title>
              <v-card-text class="pa-6">
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="text-center">
                      <v-icon size="48" color="blue">mdi-account-clock</v-icon>
                      <div class="text-h4 font-weight-bold text-blue mt-2">{{ levelAnalytics.averageUsage.checkInsPerMonth }}</div>
                      <div class="text-caption text-grey">Check-ins / Month</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="text-center">
                      <v-icon size="48" color="indigo">mdi-car</v-icon>
                      <div class="text-h4 font-weight-bold text-indigo mt-2">{{ levelAnalytics.averageUsage.parkingUsage }}</div>
                      <div class="text-caption text-grey">Parking Uses / Month</div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="text-center">
                      <v-icon size="48" color="orange">mdi-currency-inr</v-icon>
                      <div class="text-h4 font-weight-bold text-orange mt-2">₹{{ levelAnalytics.averageUsage.canteenSpend.toLocaleString() }}</div>
                      <div class="text-caption text-grey">Canteen Spend / Month</div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Empty State -->
      <v-card v-else class="text-center pa-12" elevation="2">
        <v-icon size="80" color="grey-lighten-3">mdi-chart-box</v-icon>
        <h3 class="text-h6 mt-4 mb-2 text-grey">Select a Membership Plan</h3>
        <p class="text-body-2 text-grey">Choose a plan above to view detailed performance analytics</p>
      </v-card>
    </v-window-item>
  </v-window>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="800" persistent scrollable>
      <v-card>
        <v-card-title class="pa-6 bg-primary text-white">
          <v-icon class="mr-2" color="white">mdi-key-plus</v-icon>
          <span class="text-h5">{{ editMode ? 'Edit' : 'Create New' }} Membership Plan</span>
        </v-card-title>

        <v-card-text class="pa-6" style="max-height: 600px;">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Plan Name"
                variant="outlined"
                prepend-inner-icon="mdi-tag"
                placeholder="e.g., Gold Gym Membership"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.type"
                :items="accessTypes"
                label="Type"
                variant="outlined"
                prepend-inner-icon="mdi-shape"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="formData.module"
                :items="modules"
                label="Module"
                variant="outlined"
                prepend-inner-icon="mdi-apps"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2"></v-divider>
              <h3 class="text-h6 mb-4">Scope Configuration</h3>
            </v-col>

            <v-col cols="12">
              <v-radio-group v-model="formData.scope" inline>
                <v-radio label="Global (All Locations)" value="global" color="success"></v-radio>
                <v-radio label="Location-Specific" value="locations" color="info"></v-radio>
              </v-radio-group>
            </v-col>

            <v-col cols="12" v-if="formData.scope === 'locations'">
              <v-select
                v-model="formData.locationIds"
                :items="places"
                item-title="name"
                item-value="id"
                label="Select Locations"
                variant="outlined"
                multiple
                chips
                prepend-inner-icon="mdi-map-marker"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2"></v-divider>
              <h3 class="text-h6 mb-4">Module Permissions</h3>
            </v-col>

            <!-- Visitor Permissions -->
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-title class="text-body-1">
                  <v-icon class="mr-2" color="blue">mdi-account-group</v-icon>
                  Visitor
                </v-card-title>
                <v-card-text>
                  <v-checkbox v-model="formData.permissions.visitor.allowEntry" label="Allow Entry" hide-details density="compact"></v-checkbox>
                  <v-checkbox v-model="formData.permissions.visitor.vipAccess" label="VIP Access" hide-details density="compact"></v-checkbox>
                  
                  <v-select
                    v-if="formData.permissions.visitor.allowEntry && visitorGates.length"
                    v-model="formData.permissions.visitor.allowedGates"
                    :items="visitorGates"
                    label="Allowed Gates"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    class="mt-2"
                  ></v-select>

                  <v-select
                    v-if="formData.permissions.visitor.allowEntry"
                    v-model="formData.permissions.visitor.linkedTemplateId"
                    :items="visitorTemplates"
                    item-title="name"
                    item-value="id"
                    label="Visitor Form Template"
                    variant="outlined"
                    density="compact"
                    class="mt-2"
                    clearable
                    placeholder="Auto-assign form"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Parking Permissions -->
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-title class="text-body-1">
                  <v-icon class="mr-2" color="indigo">mdi-car-parking</v-icon>
                  Parking
                </v-card-title>
                <v-card-text>
                  <v-checkbox v-model="formData.permissions.parking.allowParking" label="Allow Parking" hide-details density="compact"></v-checkbox>
                  <v-checkbox v-model="formData.permissions.parking.premiumSlots" label="Premium Slots" hide-details density="compact"></v-checkbox>
                  <v-select
                    v-if="formData.permissions.parking.allowParking"
                    v-model="formData.permissions.parking.linkedTemplateId"
                    :items="parkingTemplates"
                    item-title="name"
                    item-value="id"
                    label="Parking Pass Template"
                    variant="outlined"
                    density="compact"
                    class="mt-2"
                    clearable
                    placeholder="Auto-assign pass"
                  ></v-select>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Canteen Permissions -->
            <v-col cols="12" md="4">
              <v-card variant="outlined">
                <v-card-title class="text-body-1">
                  <v-icon class="mr-2" color="orange">mdi-food</v-icon>
                  Canteen
                </v-card-title>
                <v-card-text>
                  <v-text-field
                    v-model.number="formData.permissions.canteen.creditLimit"
                    label="Credit Limit"
                    type="number"
                    prefix="₹"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                  <v-text-field
                    v-model.number="formData.permissions.canteen.discount"
                    label="Discount %"
                    type="number"
                    suffix="%"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2"></v-divider>
              <h3 class="text-h6 mb-4">Pricing & Validity</h3>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.price"
                label="Price"
                type="number"
                prefix="₹"
                variant="outlined"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="formData.recurringBilling"
                :items="billingPeriods"
                label="Billing Period"
                variant="outlined"
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.validityDays"
                label="Validity (Days)"
                type="number"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog" :disabled="saving">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveAccessLevel"
            :loading="saving"
            prepend-icon="mdi-content-save"
            variant="flat"
            class="px-6"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { accessLevelService } from '@/services/appLayer/accessLevelService';
import { placesService } from '@/services/appLayer/placesService';
import { analyticsService } from '@/services/appLayer/analyticsService';
import { passTemplateService } from '@/services/appLayer/passTemplateService';

const props = defineProps(['embedded', 'placeId', 'visitorSettings', 'parkingSettings']);

const accessLevels = ref([]);
const places = ref([]);
const search = ref('');
const showCreateDialog = ref(false);
const editMode = ref(false);
const saving = ref(false);
const visitorTemplates = ref([]);
const parkingTemplates = ref([]);

const visitorGates = computed(() => {
  if (!props.visitorSettings?.entryGates) return [];
  return props.visitorSettings.entryGates.split(',').map(g => g.trim());
});

// Analytics State
const activeTab = ref('list');
const selectedLevelForAnalytics = ref(null);
const levelAnalytics = ref(null);

const formData = ref({
  name: '',
  type: 'membership',
  module: 'multi',
  scope: 'global',
  locationIds: [],
  permissions: {
    visitor: { allowEntry: true, vipAccess: false, linkedTemplateId: null, allowedGates: [] },
    parking: { allowParking: false, premiumSlots: false, linkedTemplateId: null },
    canteen: { creditLimit: 0, discount: 0 }
  },
  price: 0,
  recurringBilling: 'monthly',
  validityDays: 365
});

// Watch for analytics selection
watch(selectedLevelForAnalytics, async (newVal) => {
  if (newVal) {
    levelAnalytics.value = await analyticsService.getAccessLevelAnalytics('place-123', newVal);
  } else {
    levelAnalytics.value = null;
  }
});

const headers = [
  { title: 'Plan Name', key: 'name' },
  { title: 'Module', key: 'module' },
  { title: 'Scope', key: 'scope' },
  { title: 'Price', key: 'price' },
  { title: 'Status', key: 'status' },
  { title: 'Visitor Template', key: 'visitor', sortable: false },
  { title: 'Parking Template', key: 'parking', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
];

const accessTypes = [
  { title: 'Membership', value: 'membership' },
  { title: 'Day Pass', value: 'day_pass' },
  { title: 'Parking Pass', value: 'parking_pass' },
  { title: 'Visitor Pass', value: 'visitor_pass' }
];

const modules = [
  { title: 'All Modules', value: 'multi' },
  { title: 'Visitor Only', value: 'visitor' },
  { title: 'Parking Only', value: 'parking' },
  { title: 'Canteen Only', value: 'canteen' }
];

const billingPeriods = [
  { title: 'None (One-time)', value: 'none' },
  { title: 'Monthly', value: 'monthly' },
  { title: 'Quarterly', value: 'quarterly' },
  { title: 'Annually', value: 'annually' }
];

const globalCount = computed(() => accessLevels.value.filter(l => l.scope === 'global').length);
const locationSpecificCount = computed(() => accessLevels.value.filter(l => l.scope === 'locations').length);
const activeCount = computed(() => accessLevels.value.filter(l => l.status === 'active').length);

const loadData = async () => {
  accessLevels.value = await accessLevelService.getAll();
  places.value = await placesService.getAll();
  
  const allTemplates = await passTemplateService.getAll();
  const filtered = props.placeId 
    ? allTemplates.filter(t => t.placeId === props.placeId || t.placeId === 'all') 
    : allTemplates;

  visitorTemplates.value = filtered.filter(t => t.type === 'Visitor');
  parkingTemplates.value = filtered.filter(t => t.type === 'Parking');
};

const getModuleColor = (module) => {
  switch(module) {
    case 'multi': return 'purple';
    case 'visitor': return 'blue';
    case 'parking': return 'indigo';
    case 'canteen': return 'orange';
    default: return 'grey';
  }
};

const getModuleLabel = (module) => {
  switch(module) {
    case 'multi': return 'All Modules';
    case 'visitor': return 'Visitor';
    case 'parking': return 'Parking';
    case 'canteen': return 'Canteen';
    default: return module;
  }
};

const editAccessLevel = (item) => {
  editMode.value = true;
  formData.value = { ...item };
  showCreateDialog.value = true;
};

const saveAccessLevel = async () => {
  saving.value = true;
  try {
    if (editMode.value) {
      await accessLevelService.update(formData.value.id, formData.value);
    } else {
      await accessLevelService.create(formData.value);
    }
    await loadData();
    closeDialog();
  } catch (e) {
    alert('Error saving access level');
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (item) => {
  try {
    await accessLevelService.toggleStatus(item.id);
    await loadData();
  } catch (e) {
    alert('Error toggling status');
  }
};

const deleteAccessLevel = async (item) => {
  if (confirm(`Delete "${item.name}"?`)) {
    try {
      await accessLevelService.delete(item.id);
      await loadData();
    } catch (e) {
      alert('Error deleting access level');
    }
  }
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editMode.value = false;
  formData.value = {
    name: '',
    type: 'membership',
    module: 'multi',
    scope: 'global',
    locationIds: [],
    permissions: {
      visitor: { allowEntry: true, vipAccess: false, linkedTemplateId: null, allowedGates: [] },
      parking: { allowParking: false, premiumSlots: false, linkedTemplateId: null },
      canteen: { creditLimit: 0, discount: 0 }
    },
    price: 0,
    recurringBilling: 'monthly',
    validityDays: 365
  };
};

onMounted(loadData);
</script>

<style scoped>
.access-level-manager {
  max-width: 1400px;
  margin: 0 auto;
}

.manager-header {
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
</style>
