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

          <!-- Visitor Configuration Form -->
          <v-container v-else-if="moduleName === 'Visitor'">
            <v-row>
              <!-- Basic Template Details -->
              <v-col cols="12">
                <h3 class="text-h6 mb-4">Basic Template Details</h3>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitorFormData.name"
                  label="Template Name"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="visitorFormData.accessLevel"
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
              <v-col cols="12" md="6">
                <v-switch
                  v-model="visitorFormData.securityCheck"
                  label="Security Check Required"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="visitorFormData.autoEntry"
                  label="Auto Entry Allowed"
                  color="primary"
                  hide-details
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitorFormData.duration"
                  label="Duration (minutes)"
                  type="number"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="visitorFormData.validityPeriod"
                  :items="['Time-based', 'Date-based', 'One-time']"
                  label="Validity Period"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>

              <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

              <!-- Host Notification Settings -->
              <v-col cols="12">
                <h3 class="text-h6 mb-4">Host Notification Settings</h3>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="visitorFormData.hostNotification.method"
                  :items="notificationMethods"
                  label="Host Notification Method"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>

              <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

              <!-- Visitor Information Fields -->
              <v-col cols="12">
                <h3 class="text-h6 mb-4">Visitor Information Fields</h3>
                <p class="text-caption text-grey mb-2">Configure default fields and add custom fields as needed.</p>
              </v-col>
              
              <v-col cols="12">
                <v-card variant="outlined" class="pa-2">
                  <v-card-text class="px-2 pb-2">
                    <!-- Header -->
                    <v-row class="font-weight-bold text-caption text-grey-darken-1 mb-2 d-none d-md-flex">
                      <v-col cols="1" class="text-center">Enable</v-col>
                      <v-col cols="3">Field Label</v-col>
                      <v-col cols="3">Input Type</v-col>
                      <v-col cols="3">Options / Config</v-col>
                      <v-col cols="1" class="text-center">Req.</v-col>
                      <v-col cols="1" class="text-center">Action</v-col>
                    </v-row>

                    <v-row v-for="(field, index) in visitorFormData.visitorFields" :key="index" class="align-center mb-2">
                      <!-- Enable Checkbox -->
                      <v-col cols="2" md="1" class="text-center py-1">
                         <v-checkbox 
                            v-model="field.enabled" 
                            hide-details 
                            density="compact"
                            :disabled="field.required && !field.isCustom"
                         ></v-checkbox>
                      </v-col>

                      <!-- Field Label -->
                      <v-col cols="10" md="3" class="py-1">
                        <v-text-field
                          v-if="field.isCustom"
                          v-model="field.label"
                          label="Label"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-text-field>
                        <div v-else class="font-weight-medium pt-2">{{ field.label }}</div>
                      </v-col>

                      <!-- Input Type -->
                      <v-col cols="12" md="3" class="py-1" v-if="field.enabled">
                        <v-select
                          v-model="field.inputType"
                          :items="inputTypes"
                          label="Input Type"
                          variant="outlined"
                          density="compact"
                          hide-details
                          :disabled="!field.isCustom && field.id === 'purpose'" 
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="3" class="py-1" v-else></v-col>

                      <!-- Options / Config -->
                      <v-col cols="12" md="3" class="py-1" v-if="field.enabled">
                        <v-text-field
                          v-if="field.inputType === 'Dropdown'"
                          v-model="field.options"
                          label="Options (comma separated)"
                          placeholder="Option 1, Option 2"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3" class="py-1" v-else></v-col>

                      <!-- Required Toggle -->
                      <v-col cols="6" md="1" class="text-center py-1" v-if="field.enabled">
                        <v-switch
                          v-model="field.required"
                          color="primary"
                          hide-details
                          density="compact"
                          :disabled="!field.isCustom && field.id === 'name'"
                        ></v-switch>
                      </v-col>
                      <v-col cols="6" md="1" class="py-1" v-else></v-col>

                      <!-- Action (Delete Custom) -->
                      <v-col cols="6" md="1" class="text-center py-1">
                        <v-btn 
                            v-if="field.isCustom" 
                            icon="mdi-delete" 
                            size="x-small" 
                            color="error" 
                            variant="text" 
                            @click="removeCustomField(index)"
                        ></v-btn>
                      </v-col>
                      
                      <v-col cols="12"><v-divider v-if="index < visitorFormData.visitorFields.length - 1" class="my-1"></v-divider></v-col>
                    </v-row>

                    <v-btn 
                        prepend-icon="mdi-plus" 
                        variant="text" 
                        color="primary" 
                        class="mt-2"
                        @click="addCustomField"
                    >
                        Add Custom Field
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

              <!-- Visitor Entry Payment -->
              <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                   <h3 class="text-h6">Visitor Entry Payment</h3>
                   <v-switch
                      v-model="visitorFormData.payment.enabled"
                      label="Enable Payment"
                      color="primary"
                      hide-details
                      density="compact"
                   ></v-switch>
                </div>
              </v-col>
              <v-col cols="12" v-if="visitorFormData.payment.enabled">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="visitorFormData.payment.amount"
                      label="Entry Amount"
                      type="number"
                      prefix="₹"
                      variant="outlined"
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="visitorFormData.payment.gateways"
                      :items="paymentGateways"
                      label="Payment Gateway Options"
                      variant="outlined"
                      density="compact"
                      multiple
                      chips
                    ></v-select>
                  </v-col>
                </v-row>
              </v-col>

              <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>

              <!-- Visitor Badge Template Configuration -->
              <v-col cols="12">
                <h3 class="text-h6 mb-4">Visitor Badge Template</h3>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitorFormData.badge.title"
                  label="Badge Title"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'Badge Title is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="visitorFormData.badge.logo"
                  label="Badge Logo"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-camera"
                  accept="image/*"
                  :rules="[v => !!v || 'Logo is required']"
                ></v-file-input>
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined" class="pa-2">
                   <v-card-title class="text-subtitle-2 px-2">Badge Fields</v-card-title>
                   <v-card-text class="px-2 pb-2">
                      <p class="text-caption text-grey mb-2">Default fields (Name, Phone) are always included.</p>
                      
                      <!-- Default Fields (Read-only view) -->
                      <div class="d-flex align-center mb-2">
                          <v-chip size="small" color="primary" class="mr-2">Visitor Name</v-chip>
                          <v-chip size="small" color="primary" class="mr-2">Phone Number</v-chip>
                      </div>

                      <!-- Additional Fields -->
                      <v-row v-for="(field, index) in visitorFormData.badge.additionalFields" :key="index" class="align-center mb-2">
                          <v-col cols="10" class="py-1">
                              <v-select
                                  v-model="field.fieldId"
                                  :items="availableBadgeFields"
                                  item-title="label"
                                  item-value="id"
                                  label="Select Field"
                                  variant="outlined"
                                  density="compact"
                                  hide-details
                              ></v-select>
                          </v-col>
                          <v-col cols="2" class="text-center py-1">
                              <v-btn 
                                icon="mdi-delete" 
                                size="x-small" 
                                color="error" 
                                variant="text" 
                                @click="removeBadgeField(index)"
                              ></v-btn>
                          </v-col>
                      </v-row>

                      <v-btn 
                        prepend-icon="mdi-plus" 
                        variant="text" 
                        color="primary" 
                        class="mt-2"
                        @click="addBadgeField"
                        :disabled="availableBadgeFields.length === 0"
                      >
                        Add Badge Field
                      </v-btn>
                   </v-card-text>
                </v-card>
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

const visitorFormData = ref({
  name: '',
  accessLevel: null,
  securityCheck: false,
  autoEntry: false,
  duration: 60,
  validityPeriod: 'Time-based',
  hostNotification: {
    method: 'None', // SMS, Email, Both, None
  },
  visitorFields: [], // Array of objects: { id, label, inputType, options, required, isCustom, enabled }
  payment: {
    enabled: false,
    amount: 0,
    gateways: [] // Stripe, Razorpay, PayPal, Cash on Desk
  },
  badge: {
    title: '',
    logo: null, // File or URL
    additionalFields: [] // Array of objects: { fieldId, label }
  }
});

const notificationMethods = ['SMS', 'Email', 'Both', 'None'];

const inputTypes = [
  'Text',
  'Number',
  'Dropdown',
  'Date',
  'Email',
  'Phone Number',
  'Multiline Text'
];

const defaultVisitorFields = [
  { id: 'name', label: 'Name', inputType: 'Text', options: '', required: true, isCustom: false, enabled: true },
  { id: 'purpose', label: 'Purpose of Visit', inputType: 'Dropdown', options: 'Business, Personal, Interview, Delivery', required: true, isCustom: false, enabled: true },
  { id: 'email', label: 'Email', inputType: 'Email', options: '', required: false, isCustom: false, enabled: false },
  { id: 'phone', label: 'Phone Number', inputType: 'Phone Number', options: '', required: false, isCustom: false, enabled: false },
  { id: 'company', label: 'Company Name', inputType: 'Text', options: '', required: false, isCustom: false, enabled: false },
  { id: 'id_proof', label: 'ID Proof', inputType: 'Text', options: '', required: false, isCustom: false, enabled: false },
];

const availableBadgeFields = computed(() => {
  return visitorFormData.value.visitorFields.filter(f => f.enabled && !['name', 'phone'].includes(f.id));
});

const addCustomField = () => {
  visitorFormData.value.visitorFields.push({
    id: `custom_${Date.now()}`,
    label: 'New Field',
    inputType: 'Text',
    options: '',
    required: false,
    isCustom: true,
    enabled: true
  });
};

const removeCustomField = (index) => {
  visitorFormData.value.visitorFields.splice(index, 1);
};

const addBadgeField = () => {
  visitorFormData.value.badge.additionalFields.push({
    fieldId: null,
    label: ''
  });
};

const removeBadgeField = (index) => {
  visitorFormData.value.badge.additionalFields.splice(index, 1);
};

const getFieldName = (fieldId) => {
  const field = visitorFormData.value.visitorFields.find(f => f.id === fieldId);
  return field ? field.label : '';
};

const paymentGateways = [
  'Stripe',
  'Razorpay',
  'PayPal',
  'Cash on Desk'
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
  } else if (moduleName.value === 'Visitor') {
     visitorFormData.value = {
        name: '',
        accessLevel: null,
        securityCheck: false,
        autoEntry: false,
        duration: 60,
        validityPeriod: 'Time-based',
        hostNotification: { method: 'None' },
        visitorFields: JSON.parse(JSON.stringify(defaultVisitorFields)),
        payment: { enabled: false, amount: 0, gateways: [] },
        badge: { title: '', logo: null, additionalFields: [] }
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
  } else if (moduleName.value === 'Visitor') {
     // Ensure deep copy and proper structure if loading from existing
     const itemCopy = JSON.parse(JSON.stringify(item));
     
     // Merge with defaults if missing (for legacy or partial updates)
     // This is a simplified merge, in a real app we might need more robust logic
     if (!itemCopy.visitorFields || itemCopy.visitorFields.length === 0) {
         itemCopy.visitorFields = JSON.parse(JSON.stringify(defaultVisitorFields));
     }
     if (!itemCopy.badge.additionalFields) {
         itemCopy.badge.additionalFields = [];
     }

     visitorFormData.value = itemCopy;
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
  } else if (moduleName.value === 'Visitor') {
      // Save Visitor Logic
      if (!visitorFormData.value.name || !visitorFormData.value.badge.title) {
          alert('Please fill in all mandatory fields (Name, Badge Title)');
          return;
      }
      
      const newItem = {
          ...visitorFormData.value,
          moduleType: 'Visitor',
          status: 'Active',
          // Map specific fields to generic ones for list view if needed
          securityCheck: visitorFormData.value.securityCheck,
          duration: visitorFormData.value.duration,
          validityType: visitorFormData.value.validityPeriod
      };

      if (editedIndex.value > -1) {
          Object.assign(allTemplates.value[editedIndex.value], newItem);
      } else {
          const newId = Math.max(...allTemplates.value.map(t => t.id), 0) + 1;
          allTemplates.value.push({ ...newItem, id: newId });
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
