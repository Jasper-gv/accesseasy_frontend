<template>
  <div class="membership-sales">
    <!-- Premium Header -->
    <div class="sales-header mb-8">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h3 font-weight-bold mb-2">
            <v-icon size="44" color="primary" class="mr-3">mdi-card-account-details</v-icon>
            Membership Sales
          </h1>
          <p class="text-subtitle-1 text-grey-darken-1">Sell access levels and memberships to customers</p>
        </div>
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-cog"
          variant="outlined"
          to="/apps/access-levels"
        >
          Manage Access Levels
        </v-btn>
      </div>
    </div>

    <v-row>
      <!-- Available Access Levels -->
      <v-col cols="12" md="8">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5 font-weight-bold">Available Access Levels</h2>
          <v-chip color="success" variant="flat">
            <v-icon start size="16">mdi-check-circle</v-icon>
            {{ filteredAccessLevels.length }} Plans Found
          </v-chip>
        </div>

        <v-tabs v-model="billingFilter" color="primary" class="mb-6">
            <v-tab value="all" class="text-none">All Plans</v-tab>
            <v-tab value="daily" class="text-none">Daily / Passes</v-tab>
            <v-tab value="monthly" class="text-none">Monthly</v-tab>
             <v-tab value="yearly" class="text-none">Yearly</v-tab>
        </v-tabs>

        <v-row>
          <v-col cols="12" md="6" v-for="level in filteredAccessLevels" :key="level.id">
            <v-card
              :class="['membership-card', { 'selected': selectedLevel?.id === level.id }]"
              :style="{ borderColor: selectedLevel?.id === level.id ? '#1976D2' : 'transparent' }"
              elevation="3"
              hover
              @click="selectLevel(level)"
            >
              <!-- Card Header with Icon -->
              <div class="card-header pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar
                      :color="getModuleColor(level.module) + '-lighten-4'"
                      size="56"
                      class="mr-3"
                    >
                      <v-icon :color="getModuleColor(level.module)" size="32">
                        {{ getModuleIcon(level.module) }}
                      </v-icon>
                    </v-avatar>
                    <div>
                      <h3 class="text-h6 font-weight-bold">{{ level.name }}</h3>
                      <div class="text-caption text-grey-darken-1">
                        {{ getScopeLabel(level.scope, level.locationIds) }}
                      </div>
                    </div>
                  </div>
                  <v-chip
                    v-if="selectedLevel?.id === level.id"
                    color="primary"
                    size="small"
                    variant="flat"
                  >
                    <v-icon start size="14">mdi-check</v-icon>
                    Selected
                  </v-chip>
                </div>
              </div>

              <v-divider></v-divider>

              <!-- Pricing -->
              <v-card-text class="pb-2">
                <div class="d-flex align-center mb-3">
                  <div class="text-h3 font-weight-bold text-primary mr-2">
                    ₹{{ level.price.toLocaleString() }}
                  </div>
                  <div class="text-body-2 text-grey-darken-1">
                    / {{ level.recurringBilling }}
                  </div>
                </div>

                <!-- Features -->
                <div class="features-list">
                  <div v-if="level.permissions.visitor?.allowEntry" class="feature-item">
                    <v-icon size="18" color="success" class="mr-2">mdi-check-circle</v-icon>
                    <span>Visitor Access{{ level.permissions.visitor.vipAccess ? ' (VIP)' : '' }}</span>
                  </div>
                  <div v-if="level.permissions.parking?.allowParking" class="feature-item">
                    <v-icon size="18" color="success" class="mr-2">mdi-check-circle</v-icon>
                    <span>Parking Access{{ level.permissions.parking.premiumSlots ? ' (Premium)' : '' }}</span>
                  </div>
                  <div v-if="level.permissions.canteen?.creditLimit > 0" class="feature-item">
                    <v-icon size="18" color="success" class="mr-2">mdi-check-circle</v-icon>
                    <span>₹{{ level.permissions.canteen.creditLimit }} Canteen Credit</span>
                  </div>
                  <div v-if="level.permissions.canteen?.discount > 0" class="feature-item">
                    <v-icon size="18" color="success" class="mr-2">mdi-check-circle</v-icon>
                    <span>{{ level.permissions.canteen.discount }}% Discount</span>
                  </div>
                </div>
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions class="pa-4">
                <v-btn
                  block
                  :color="selectedLevel?.id === level.id ? 'success' : 'primary'"
                  :variant="selectedLevel?.id === level.id ? 'flat' : 'outlined'"
                  size="large"
                >
                  {{ selectedLevel?.id === level.id ? 'Selected' : 'Select Plan' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-card v-if="accessLevels.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-package-variant</v-icon>
          <h3 class="text-h6 mt-4 mb-2">No Access Levels Available</h3>
          <p class="text-body-2 text-grey mb-4">Create access levels to start selling memberships</p>
          <v-btn color="primary" to="/apps/access-levels" prepend-icon="mdi-plus">
            Create Access Level
          </v-btn>
        </v-card>
      </v-col>

      <!-- Customer Form -->
      <v-col cols="12" md="4">
        <v-card class="sticky-card" elevation="3">
          <v-card-title class="bg-primary text-white pa-6">
            <v-icon class="mr-2" color="white">mdi-account-plus</v-icon>
            <span>Customer Details</span>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-alert
              v-if="selectedLevel"
              type="info"
              variant="tonal"
              class="mb-4"
              density="comfortable"
            >
              <div class="text-body-2">
                <strong>Selected:</strong> {{ selectedLevel.name }}
              </div>
              <div class="text-h5 font-weight-bold mt-2">
                ₹{{ selectedLevel.price.toLocaleString() }}
              </div>
            </v-alert>

            <div v-if="!selectedLevel" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-3">mdi-hand-pointing-left</v-icon>
              <p class="text-body-2 text-grey mt-4">Select a plan to proceed</p>
            </div>

            <v-form v-else @submit.prevent="processSale" ref="form">
              <v-text-field
                v-model="customer.name"
                label="Customer Name"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :rules="[v => !!v || 'Name is required']"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="customer.mobile"
                label="Mobile Number"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                :rules="[v => !!v || 'Mobile is required', v => /^\d{10}$/.test(v) || 'Invalid mobile']"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="customer.email"
                label="Email (Optional)"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                type="email"
                class="mb-3"
              ></v-text-field>

              <v-select
                v-model="paymentMethod"
                :items="['Cash', 'Card', 'UPI', 'Net Banking']"
                label="Payment Method"
                variant="outlined"
                prepend-inner-icon="mdi-credit-card"
                class="mb-4"
              ></v-select>

              <v-btn
                block
                color="success"
                size="x-large"
                type="submit"
                :loading="processing"
                prepend-icon="mdi-cash-check"
                class="text-none font-weight-bold"
              >
                Collect ₹{{ selectedLevel.price.toLocaleString() }} & Issue
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="500" persistent>
      <v-card class="text-center pa-8">
        <v-avatar color="success-lighten-5" size="96" class="mb-4">
          <v-icon size="64" color="success">mdi-check-circle</v-icon>
        </v-avatar>
        
        <h2 class="text-h4 font-weight-bold mb-2">Membership Active!</h2>
        <p class="text-body-1 text-grey-darken-1 mb-4">
          Issued to <strong>{{ customer.name }}</strong>
        </p>

        <v-card variant="outlined" class="pa-4 mb-4">
          <div class="text-caption text-grey-darken-1 mb-2">Access Code</div>
          <div class="qr-placeholder bg-grey-lighten-4 pa-6 rounded">
            <v-icon size="48" color="grey">mdi-qrcode</v-icon>
            <div class="text-caption mt-2">QR Code: {{ membershipCode }}</div>
          </div>
          <div class="text-caption text-grey mt-2">SMS sent to {{ customer.mobile }}</div>
        </v-card>

        <div class="d-flex gap-2">
          <v-btn block color="primary" variant="outlined" @click="printReceipt">
            <v-icon start>mdi-printer</v-icon>
            Print Receipt
          </v-btn>
          <v-btn block color="primary" @click="finishSale">
            <v-icon start>mdi-check</v-icon>
            Done
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { accessLevelService } from '@/services/appLayer/accessLevelService';
import { memberAccessService } from '@/services/appLayer/memberAccessService';

const accessLevels = ref([]);
const billingFilter = ref('all');
const selectedLevel = ref(null);
const processing = ref(false);
const successDialog = ref(false);
const form = ref(null);
const paymentMethod = ref('Cash');
const membershipCode = ref('');

const filteredAccessLevels = computed(() => {
    if (billingFilter.value === 'all') return accessLevels.value;
    return accessLevels.value.filter(l => l.recurringBilling === billingFilter.value);
});

const customer = ref({
  name: '',
  mobile: '',
  email: ''
});

onMounted(async () => {
  try {
    // Load only active access levels
    const all = await accessLevelService.getAll();
    accessLevels.value = all.filter(l => l.status === 'active');
  } catch (e) {
    console.error(e);
  }
});

const selectLevel = (level) => {
  selectedLevel.value = level;
};

const processSale = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  processing.value = true;
  
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate membership code
    membershipCode.value = `MEM${Date.now().toString().slice(-8)}`;
    
    // In real app: assign access level to user
    // await memberAccessService.assignAccess(userId, selectedLevel.value.id, adminId, locationId);
    
    successDialog.value = true;
  } catch (e) {
    alert('Error processing sale');
  } finally {
    processing.value = false;
  }
};

const printReceipt = () => {
  // Implement receipt printing
  alert('Printing receipt...');
};

const finishSale = () => {
  successDialog.value = false;
  selectedLevel.value = null;
  customer.value = { name: '', mobile: '', email: '' };
  form.value?.reset();
};

const getModuleColor = (module) => {
  const colors = {
    multi: 'purple',
    visitor: 'blue',
    parking: 'indigo',
    canteen: 'orange'
  };
  return colors[module] || 'grey';
};

const getModuleIcon = (module) => {
  const icons = {
    multi: 'mdi-star-four-points',
    visitor: 'mdi-account-group',
    parking: 'mdi-car-parking',
    canteen: 'mdi-food'
  };
  return icons[module] || 'mdi-key';
};

const getScopeLabel = (scope, locationIds) => {
  if (scope === 'global') return 'Valid at all locations';
  return `Valid at ${locationIds.length} location(s)`;
};
</script>

<style scoped>
.membership-sales {
  max-width: 1400px;
  margin: 0 auto;
}

.sales-header {
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 2rem;
}

.membership-card {
  transition: all 0.3s ease;
  border: 3px solid transparent;
  border-radius: 16px !important;
  cursor: pointer;
}

.membership-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15) !important;
}

.membership-card.selected {
  border-color: #1976D2 !important;
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.3) !important;
}

.card-header {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.sticky-card {
  position: sticky;
  top: 20px;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
