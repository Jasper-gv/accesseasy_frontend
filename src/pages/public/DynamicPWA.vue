<template>
  <v-app :style="dynamicAppStyles">
    <!-- Dynamic Header -->
    <v-app-bar 
      :color="config.theme?.primary || '#1976D2'" 
      elevation="0"
      class="app-header"
      height="80"
    >
      <template v-slot:prepend>
        <v-avatar v-if="config.logoUrl" size="48" class="ml-4 rounded-lg elevation-2 bg-white pa-1">
          <v-img :src="config.logoUrl" contain></v-img>
        </v-avatar>
        <v-avatar v-else color="white" size="48" class="ml-4 rounded-lg">
          <v-icon :color="config.theme?.primary || 'primary'">mdi-domain</v-icon>
        </v-avatar>
      </template>
      
      <v-toolbar-title class="font-weight-bold text-white ml-2">
        {{ config.appName }}
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn icon="mdi-account-circle" color="white" variant="text" class="mr-2"></v-btn>
    </v-app-bar>

    <v-main class="pwa-main" :style="{ backgroundColor: config.theme?.background || '#f5f5f5' }">
      <v-container class="py-8 px-4" style="max-width: 1200px;">
        <!-- Welcome Section -->
        <div class="welcome-section text-center mb-10">
          <h1 class="text-h3 font-weight-bold mb-3 gradient-text" :style="gradientTextStyle">Hello!</h1>
          <p class="text-h6 text-grey-darken-1 font-weight-light">Choose a service for your visit today</p>
        </div>

        <!-- Dynamic Feature Sections -->
        
        <!-- VISITOR SECTION -->
        <div v-if="config.modules.visitor && visitorTemplates.length" class="mb-10">
          <div class="d-flex align-center mb-4">
            <v-icon color="blue" class="mr-2">mdi-account-multiple</v-icon>
            <div class="text-h6 font-weight-bold">Visitor Entry</div>
            <v-divider class="ml-4"></v-divider>
          </div>
          <v-row>
            <v-col v-for="temp in visitorTemplates" :key="temp.id" cols="12" sm="6" md="4">
              <v-card 
                link 
                :to="`/go/visitor-entry?templateId=${temp.id}`" 
                class="feature-card text-center" 
                height="180"
                hover
                elevation="3"
                :style="{ borderTop: `4px solid ${config.theme?.secondary || '#424242'}` }"
              >
                <v-card-text class="d-flex flex-column align-center justify-center fill-height pa-6">
                  <div class="feature-icon-wrapper mb-3 blue">
                    <v-icon size="40" color="white">mdi-account-plus</v-icon>
                  </div>
                  <div class="text-h6 font-weight-bold">{{ temp.name }}</div>
                  <div class="text-caption text-grey">{{ temp.accessMode }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- PARKING SECTION -->
        <div v-if="config.modules.parking && parkingTemplates.length" class="mb-10">
          <div class="d-flex align-center mb-4">
            <v-icon color="indigo" class="mr-2">mdi-parking</v-icon>
            <div class="text-h6 font-weight-bold">Parking Access</div>
            <v-divider class="ml-4"></v-divider>
          </div>
          <v-row>
            <v-col v-for="temp in parkingTemplates" :key="temp.id" cols="12" sm="6" md="4">
              <v-card 
                link 
                @click="showComingSoon(`Parking Booking: ${temp.name}`)"
                class="feature-card text-center" 
                height="180"
                hover
                elevation="3"
                :style="{ borderTop: `4px solid ${config.theme?.secondary || '#424242'}` }"
              >
                <v-card-text class="d-flex flex-column align-center justify-center fill-height pa-6">
                  <div class="feature-icon-wrapper mb-3 indigo">
                    <v-icon size="40" color="white">mdi-car-select</v-icon>
                  </div>
                  <div class="text-h6 font-weight-bold">{{ temp.name }}</div>
                  <div class="text-caption text-grey">{{ temp.accessMode }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- MEMBERSHIP SECTION -->
        <div v-if="config.modules.membership && membershipPlansList.length" class="mb-10">
          <div class="d-flex align-center mb-4">
            <v-icon color="success" class="mr-2">mdi-card-account-details</v-icon>
            <div class="text-h6 font-weight-bold">Buy Memberships</div>
            <v-divider class="ml-4"></v-divider>
          </div>
          <v-row>
            <v-col v-for="plan in membershipPlansList" :key="plan.id" cols="12" sm="6" md="4">
              <v-card 
                link 
                @click="showComingSoon(`Subscription: ${plan.name}`)"
                class="feature-card text-center" 
                height="180"
                hover
                elevation="3"
                :style="{ borderTop: `4px solid ${config.theme?.accent || '#FFC107'}` }"
              >
                <v-card-text class="d-flex flex-column align-center justify-center fill-height pa-6">
                  <div class="feature-icon-wrapper mb-3 green">
                    <v-icon size="40" color="white">mdi-wallet-membership</v-icon>
                  </div>
                  <div class="text-h6 font-weight-bold">{{ plan.name }}</div>
                  <div class="text-subtitle-2 font-weight-bold color-primary">Starting at ₹{{ plan.cost || 'Free' }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- OTHER SERVICES (Canteen) -->
        <div v-if="config.modules.canteen" class="mb-10">
           <div class="d-flex align-center mb-4">
            <v-icon color="orange" class="mr-2">mdi-apps</v-icon>
            <div class="text-h6 font-weight-bold">Facility Services</div>
            <v-divider class="ml-4"></v-divider>
          </div>
          <v-row>
             <v-col cols="12" sm="6" md="4">
                <v-card 
                  link 
                  to="/go/canteen" 
                  class="feature-card text-center" 
                  height="180"
                  hover
                  elevation="3"
                >
                  <v-card-text class="d-flex flex-column align-center justify-center fill-height pa-6">
                    <div class="feature-icon-wrapper mb-3 orange">
                      <v-icon size="40" color="white">mdi-food</v-icon>
                    </div>
                    <div class="text-h6 font-weight-bold">Canteen Order</div>
                    <div class="text-body-2 text-grey">Order food & drinks</div>
                  </v-card-text>
                </v-card>
              </v-col>
          </v-row>
        </div>

        <!-- STAFF & VALIDATOR SERVICES (Integrated) -->
        <div v-if="config.modules.security || config.modules.canteen" class="mb-10">
           <div class="d-flex align-center mb-4">
            <v-icon color="red" class="mr-2">mdi-shield-account</v-icon>
            <div class="text-h6 font-weight-bold">Staff Tools</div>
            <v-divider class="ml-4"></v-divider>
          </div>
          <v-row>
             <v-col v-if="config.modules.security" cols="12" sm="6" md="4">
                <v-card 
                  link 
                  to="/apps/validator" 
                  class="feature-card text-center" 
                  height="160"
                  hover
                  elevation="2"
                  :style="{ borderBottom: `4px solid ${config.theme?.primary || '#f44336'}` }"
                >
                  <v-card-text class="d-flex flex-column align-center justify-center fill-height pa-4">
                    <div class="feature-icon-wrapper mb-2 red" style="width: 64px; height: 64px;">
                      <v-icon size="32" color="white">mdi-qrcode-scan</v-icon>
                    </div>
                    <div class="text-subtitle-1 font-weight-bold">Security Scanner</div>
                    <div class="text-caption text-grey">Verify Entry Passes</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col v-if="config.modules.canteen" cols="12" sm="6" md="4">
                <v-card 
                  link 
                  to="/apps/canteen/validator" 
                  class="feature-card text-center" 
                  height="160"
                  hover
                  elevation="2"
                  :style="{ borderBottom: `4px solid ${config.theme?.primary || '#fb8c00'}` }"
                >
                  <v-card-text class="d-flex flex-column align-center justify-center fill-height pa-4">
                    <div class="feature-icon-wrapper mb-2 orange" style="width: 64px; height: 64px;">
                      <v-icon size="32" color="white">mdi-food-fork-drink</v-icon>
                    </div>
                    <div class="text-subtitle-1 font-weight-bold">Canteen Validator</div>
                    <div class="text-caption text-grey">Verify Meal Claims</div>
                  </v-card-text>
                </v-card>
              </v-col>
          </v-row>
        </div>

        <!-- Powered By Footer -->
        <div class="text-center mt-8 pb-10 text-grey">
          <div class="text-caption">Built with 💙 by AccessEasy Platform</div>
        </div>
      </v-container>
    </v-main>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="text-center">
        <v-progress-circular 
          indeterminate 
          :color="config.theme?.primary || 'primary'"
          size="72"
          width="8"
        ></v-progress-circular>
        <div class="text-h6 mt-4 text-grey-darken-2 font-weight-bold">Launching {{ config.appName || 'Experience' }}...</div>
      </div>
    </div>

    <!-- Coming Soon Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      color="info"
      location="top"
      class="mt-4"
    >
      <v-icon class="mr-2">mdi-auto-fix</v-icon>
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storefrontService } from '@/services/appLayer/storefrontService';
import { passTemplateService } from '@/services/appLayer/passTemplateService';
import { accessLevelService } from '@/services/appLayer/accessLevelService';

const route = useRoute();
const loading = ref(true);
const snackbar = ref(false);
const snackbarText = ref('');

const config = ref({
  appName: 'Loading...',
  theme: {
    primary: '#1976D2',
    secondary: '#424242',
    background: '#f5f5f5'
  },
  logoUrl: '',
  modules: { visitor: false, parking: false, canteen: false }
});

const visitorTemplates = ref([]);
const parkingTemplates = ref([]);
const membershipPlansList = ref([]);

const dynamicAppStyles = computed(() => {
  if (!config.value.theme) return {};
  return {
    '--v-theme-primary': config.value.theme.primary,
    '--v-theme-secondary': config.value.theme.secondary,
  };
});

const gradientTextStyle = computed(() => {
  return {
    background: `linear-gradient(135deg, ${config.value.theme?.primary || '#1976D2'} 0%, ${config.value.theme?.secondary || '#42A5F5'} 100%)`,
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    'background-clip': 'text'
  };
});

const showComingSoon = (feature) => {
  snackbarText.value = `${feature} feature coming soon!`;
  snackbar.value = true;
};

onMounted(async () => {
  try {
    const placeId = route.params.placeId;
    if (placeId) {
      const data = await storefrontService.getConfig(placeId);
      if (data) {
        // Legacy mapping
        if (data.brandColor && !data.theme) {
          data.theme = { ...config.value.theme, primary: data.brandColor };
        }
        
        // Deep merge top-level objects
        config.value = {
          ...config.value,
          ...data,
          theme: { ...config.value.theme, ...(data.theme || {}) },
          modules: { ...config.value.modules, ...(data.modules || {}) }
        };
      }
      
      const templates = await passTemplateService.getAll();
      // In real app, filter templates by placeId
      visitorTemplates.value = templates.filter(t => t.type === 'Visitor');
      parkingTemplates.value = templates.filter(t => t.type === 'Parking');
      
      membershipPlansList.value = await accessLevelService.getAll();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, var(--v-theme-primary) 0%, var(--v-theme-primary-darken-1) 100%) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.pwa-main {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.welcome-section {
  animation: fadeInUp 0.6s ease-out;
}

.gradient-text {
  background: linear-gradient(135deg, var(--v-theme-primary, #1976D2) 0%, var(--v-theme-secondary, #42A5F5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-card {
  position: relative;
  border-radius: 16px !important;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
}

.feature-card:hover .card-overlay {
  opacity: 0.05;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-overlay.blue { background: linear-gradient(135deg, #2196F3, #1976D2); }
.card-overlay.indigo { background: linear-gradient(135deg, #5C6BC0, #3949AB); }
.card-overlay.orange { background: linear-gradient(135deg, #FF9800, #F57C00); }

.feature-icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  animation: pulse 2s ease-in-out infinite;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.feature-icon-wrapper.blue { background: linear-gradient(135deg, #2196F3, #1976D2); box-shadow: 0 8px 24px rgba(33, 150, 243, 0.4); }
.feature-icon-wrapper.indigo { background: linear-gradient(135deg, #5C6BC0, #3949AB); box-shadow: 0 8px 24px rgba(92, 107, 192, 0.4); }
.feature-icon-wrapper.orange { background: linear-gradient(135deg, #FF9800, #F57C00); box-shadow: 0 8px 24px rgba(255, 152, 0, 0.4); }

.staff-portal {
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.05);
}

.portal-header {
  background: linear-gradient(135deg, #455A64 0%, #263238 100%);
}

.staff-btn {
  border-width: 2px !important;
  border-radius: 12px !important;
  height: 60px !important;
  transition: all 0.3s ease;
  font-size: 1rem !important;
}

.staff-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  }
}
</style>
