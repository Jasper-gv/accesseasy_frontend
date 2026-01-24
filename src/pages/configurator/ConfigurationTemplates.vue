<template>
  <v-container fluid class="pa-4">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">{{ pageTitle }}</h1>
        <p class="text-body-2 text-medium-emphasis">
          Manage configuration templates for {{ moduleName }}.
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
        Create Template
      </v-btn>
    </div>

    <!-- Templates List -->
    <v-row>
      <v-col v-if="templates.length === 0" cols="12">
        <v-card variant="outlined" class="text-center pa-8 rounded-lg border-dashed">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-file-document-outline</v-icon>
          <div class="text-h6 text-grey-darken-1">No Templates Found</div>
          <p class="text-body-2 text-grey mb-4">Create a new template to get started.</p>
          <v-btn color="primary" variant="text" @click="openCreateDialog">Create Now</v-btn>
        </v-card>
      </v-col>

      <v-col
        v-for="template in templates"
        :key="template.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="rounded-lg elevation-2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-truncate">{{ template.name }}</span>
            <v-chip size="small" :color="getStatusColor(template.status)" label>
              {{ template.status }}
            </v-chip>
          </v-card-title>
          <v-card-subtitle class="pb-2">
            {{ template.moduleType }}
          </v-card-subtitle>
          <v-divider></v-divider>
          <v-card-text class="py-3">
            <div class="d-flex align-center mb-2">
              <v-icon size="small" class="mr-2" color="grey">mdi-clock-outline</v-icon>
              <span class="text-caption">Duration: {{ template.duration }} mins</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" class="mr-2" color="grey">mdi-shield-check-outline</v-icon>
              <span class="text-caption">Security Check: {{ template.securityCheck ? 'Yes' : 'No' }}</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2" color="grey">mdi-calendar-range</v-icon>
              <span class="text-caption">Validity: {{ template.validityType }}</span>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn size="small" variant="text" color="primary" @click="editTemplate(template)">
              Edit
            </v-btn>
            <v-btn size="small" variant="text" color="error" @click="deleteTemplate(template.id)">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" :max-width="moduleName === 'Membership' ? 800 : 600" :scrollable="moduleName === 'Membership'">
      <v-card>
        <v-card-title :class="moduleName === 'Membership' ? 'pa-6 bg-primary text-white' : ''">
          <div v-if="moduleName === 'Membership'" class="d-flex align-center">
             <v-icon class="mr-2" color="white">mdi-key-plus</v-icon>
             <span class="text-h5">{{ editedIndex === -1 ? 'Create New' : 'Edit' }} Membership Plan</span>
          </div>
          <span v-else class="text-h5">{{ editedIndex === -1 ? 'New Template' : 'Edit Template' }}</span>
        </v-card-title>
        
        <v-card-text :class="moduleName === 'Membership' ? 'pa-6' : ''" :style="moduleName === 'Membership' ? 'max-height: 600px;' : ''">
          <!-- Membership Form -->
          <v-container v-if="moduleName === 'Membership'">
             <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="membershipFormData.name"
                label="Plan Name"
                variant="outlined"
                prepend-inner-icon="mdi-tag"
                placeholder="e.g., Gold Gym Membership"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="membershipFormData.type"
                :items="accessTypes"
                label="Type"
                variant="outlined"
                prepend-inner-icon="mdi-shape"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="membershipFormData.module"
                :items="modules"
                label="Module"
                variant="outlined"
                prepend-inner-icon="mdi-apps"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="membershipFormData.linkedAccessLevel"
                :items="accessLevelsList"
                item-title="accessLevelName"
                item-value="id"
                label="Access Level"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                clearable
                placeholder="Select Access Level"
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2"></v-divider>
              <h3 class="text-h6 mb-4">Scope Configuration</h3>
            </v-col>

            <v-col cols="12">
              <v-radio-group v-model="membershipFormData.scope" inline>
                <v-radio label="Global (All Locations)" value="global" color="success"></v-radio>
                <v-radio label="Location-Specific" value="locations" color="info"></v-radio>
              </v-radio-group>
            </v-col>

            <v-col cols="12" v-if="membershipFormData.scope === 'locations'">
              <v-select
                v-model="membershipFormData.locationIds"
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
                  <v-checkbox v-model="membershipFormData.permissions.visitor.allowEntry" label="Allow Entry" hide-details density="compact"></v-checkbox>
                  <v-checkbox v-model="membershipFormData.permissions.visitor.vipAccess" label="VIP Access" hide-details density="compact"></v-checkbox>
                  
                  <v-select
                    v-if="membershipFormData.permissions.visitor.allowEntry && visitorGates.length"
                    v-model="membershipFormData.permissions.visitor.allowedGates"
                    :items="visitorGates"
                    label="Allowed Gates"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    class="mt-2"
                  ></v-select>

                  <v-select
                    v-if="membershipFormData.permissions.visitor.allowEntry"
                    v-model="membershipFormData.permissions.visitor.linkedTemplateId"
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
                  <v-checkbox v-model="membershipFormData.permissions.parking.allowParking" label="Allow Parking" hide-details density="compact"></v-checkbox>
                  <v-checkbox v-model="membershipFormData.permissions.parking.premiumSlots" label="Premium Slots" hide-details density="compact"></v-checkbox>
                  <v-select
                    v-if="membershipFormData.permissions.parking.allowParking"
                    v-model="membershipFormData.permissions.parking.linkedTemplateId"
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
                    v-model.number="membershipFormData.permissions.canteen.creditLimit"
                    label="Credit Limit"
                    type="number"
                    prefix="₹"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                  <v-text-field
                    v-model.number="membershipFormData.permissions.canteen.discount"
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
                v-model.number="membershipFormData.price"
                label="Price"
                type="number"
                prefix="₹"
                variant="outlined"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="membershipFormData.recurringBilling"
                :items="billingPeriods"
                label="Billing Period"
                variant="outlined"
              ></v-select>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="membershipFormData.validityDays"
                label="Validity (Days)"
                type="number"
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
          </v-container>

          <!-- Generic Form (Original) -->
          <v-container v-else>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Template Name"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'Name is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.moduleType"
                  :items="moduleTypes"
                  label="Module Type"
                  variant="outlined"
                  density="compact"
                  readonly
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.linkedAccessLevel"
                  :items="accessLevelsList"
                  item-title="accessLevelName"
                  item-value="id"
                  label="Access Level"
                  variant="outlined"
                  density="compact"
                  clearable
                  placeholder="Select Access Level"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.accessMode"
                  :items="['QR Code', 'Face ID', 'Card', 'Manual']"
                  label="Access Mode"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.securityCheck"
                  label="Security Check Required"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.autoEntry"
                  label="Auto Entry Allowed"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.duration"
                  label="Duration (minutes)"
                  type="number"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.validityType"
                  :items="['Time-based', 'Date-based', 'One-time']"
                  label="Validity Period"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions :class="moduleName === 'Membership' ? 'pa-6 pt-0' : ''">
          <v-spacer></v-spacer>
          <v-btn :color="moduleName === 'Membership' ? '' : 'blue-darken-1'" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn 
            :color="moduleName === 'Membership' ? 'primary' : 'blue-darken-1'" 
            :variant="moduleName === 'Membership' ? 'flat' : 'text'" 
            @click="saveTemplate"
            :class="moduleName === 'Membership' ? 'px-6' : ''"
            :prepend-icon="moduleName === 'Membership' ? 'mdi-content-save' : ''"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { accessLevelService } from '@/services/appLayer/accessLevelService';
import { placesService } from '@/services/appLayer/placesService';
import { passTemplateService } from '@/services/appLayer/passTemplateService';

const route = useRoute();
const dialog = ref(false);
const editedIndex = ref(-1);

const moduleMap = {
  'visitor-config': 'Visitor',
  'parking-config': 'Parking',
  'canteen-config': 'Canteen',
  'membership-config': 'Membership'
};

const moduleName = computed(() => moduleMap[route.name] || 'Unknown Module');
const pageTitle = computed(() => `${moduleName.value} Configuration Templates`);

const moduleTypes = ['Visitor', 'Parking', 'Canteen', 'Membership'];

// --- Generic Template Data ---
const defaultItem = {
  name: '',
  moduleType: '',
  accessMode: 'QR Code',
  securityCheck: false,
  autoEntry: false,
  duration: 60,
  validityType: 'Time-based',
  status: 'Active'
};

const editedItem = ref({ ...defaultItem });
const templates = ref([]);

// --- Membership Specific Data ---
const places = ref([]);
const visitorTemplates = ref([]);
const parkingTemplates = ref([]);
const saving = ref(false);
const visitorGates = ref([]); // Mock or fetch if needed

const membershipFormData = ref({
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

// Mock data storage (in-memory for now, could be localStorage)
const allTemplates = ref([
  {
    id: 1,
    name: 'Standard Visitor Pass',
    moduleType: 'Visitor',
    accessMode: 'QR Code',
    securityCheck: true,
    autoEntry: false,
    duration: 120,
    validityType: 'Time-based',
    status: 'Active'
  },
  {
    id: 2,
    name: 'VIP Parking',
    moduleType: 'Parking',
    accessMode: 'Face ID',
    securityCheck: false,
    autoEntry: true,
    duration: 480,
    validityType: 'Date-based',
    status: 'Active'
  }
]);

const filterTemplates = () => {
  const currentType = moduleName.value;
  templates.value = allTemplates.value.filter(t => t.moduleType === currentType);
};

watch(() => route.name, () => {
  filterTemplates();
  editedItem.value.moduleType = moduleName.value; // Pre-fill module type
}, { immediate: true });

const loadMembershipData = async () => {
  try {
    places.value = await placesService.getAll();
    const allTemplates = await passTemplateService.getAll();
    visitorTemplates.value = allTemplates.filter(t => t.type === 'Visitor');
    parkingTemplates.value = allTemplates.filter(t => t.type === 'Parking');
  } catch (error) {
    console.error("Error loading membership data", error);
  }
};

const accessLevelsList = ref([]);

const loadAccessLevels = async () => {
  try {
    // Pass a dummy tenant ID or fetch from store if available
    accessLevelsList.value = await accessLevelService.getAccessLevelsForTemplate('c06d5756-422f-42c7-a581-5b225c39b145');
  } catch (error) {
    console.error("Error loading access levels", error);
  }
};

const openCreateDialog = async () => {
  editedIndex.value = -1;
  
  // Load access levels for all types
  await loadAccessLevels();

  if (moduleName.value === 'Membership') {
    await loadMembershipData();
    membershipFormData.value = {
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
      validityDays: 365,
      linkedAccessLevel: null
    };
  } else {
    editedItem.value = { ...defaultItem, moduleType: moduleName.value, linkedAccessLevel: null };
  }
  
  dialog.value = true;
};

const editTemplate = async (item) => {
  editedIndex.value = allTemplates.value.findIndex(t => t.id === item.id);
  await loadAccessLevels();
  
  if (moduleName.value === 'Membership') {
     await loadMembershipData();
     membershipFormData.value = { ...item }; 
  } else {
    editedItem.value = { ...item };
  }
  
  dialog.value = true;
};

const deleteTemplate = (id) => {
  if (confirm('Are you sure you want to delete this template?')) {
    const index = allTemplates.value.findIndex(t => t.id === id);
    if (index > -1) {
      allTemplates.value.splice(index, 1);
      filterTemplates();
    }
  }
};

const closeDialog = () => {
  dialog.value = false;
  editedItem.value = { ...defaultItem };
  editedIndex.value = -1;
};

const saveTemplate = async () => {
  if (moduleName.value === 'Membership') {
    // Save Membership Logic
    saving.value = true;
    try {
        const newItem = { 
            ...membershipFormData.value, 
            moduleType: 'Membership',
            status: 'Active',
            duration: membershipFormData.value.validityDays + ' days', 
            securityCheck: false 
        };

        if (editedIndex.value > -1) {
             Object.assign(allTemplates.value[editedIndex.value], newItem);
        } else {
             const newId = Math.max(...allTemplates.value.map(t => t.id), 0) + 1;
             allTemplates.value.push({ ...newItem, id: newId });
        }
    } catch (e) {
        console.error(e);
    } finally {
        saving.value = false;
    }
  } else {
    // Save Generic Template Logic
    if (editedIndex.value > -1) {
      Object.assign(allTemplates.value[editedIndex.value], editedItem.value);
    } else {
      const newId = Math.max(...allTemplates.value.map(t => t.id), 0) + 1;
      allTemplates.value.push({ ...editedItem.value, id: newId });
    }
  }
  
  filterTemplates();
  closeDialog();
};

const getStatusColor = (status) => {
  return status === 'Active' ? 'success' : 'grey';
};
</script>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
</style>
