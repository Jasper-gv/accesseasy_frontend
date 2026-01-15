<template>
  <div class="staff-portal fill-height bg-grey-lighten-4 d-flex align-center justify-center">
    <v-card width="100%" max-width="900" class="elevation-4 rounded-xl overflow-hidden">
      <v-row no-gutters>
        <!-- Left Side: Branding -->
        <v-col cols="12" md="5" class="bg-primary d-flex flex-column justify-center align-center pa-8 text-center">
          <v-icon size="80" color="white" class="mb-4">mdi-shield-account</v-icon>
          <h1 class="text-h4 font-weight-bold text-white mb-2">Staff Portal</h1>
          <p class="text-white text-body-1 opacity-90">Secure access for operational teams</p>
          <div class="mt-8 opacity-80 text-caption text-white">
            v2.4.0 • Enterprise Edition
          </div>
        </v-col>

        <!-- Right Side: Login/Selection -->
        <v-col cols="12" md="7" class="pa-8">
          <div class="text-center mb-6">
            <h2 class="text-h5 font-weight-bold mb-1">Select Your Role</h2>
            <p class="text-grey">Choose your department to proceed</p>
          </div>

          <v-row>
            <v-col cols="12" sm="6" v-for="role in roles" :key="role.id">
              <v-card 
                variant="outlined" 
                class="role-card h-100 pa-4 text-center cursor-pointer transition-swing"
                :class="{'selected-role': selectedRole === role.id}"
                @click="selectRole(role)"
                hover
                :style="{ borderColor: selectedRole === role.id ? role.color : '' }"
              >
                <v-avatar :color="role.color + '-lighten-5'" size="64" class="mb-3">
                  <v-icon :color="role.color" size="32">{{ role.icon }}</v-icon>
                </v-avatar>
                <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ role.title }}</h3>
                <p class="text-caption text-grey">{{ role.desc }}</p>
              </v-card>
            </v-col>
          </v-row>

          <!-- Location Selector (Simulated) -->
          <v-expand-transition>
            <div v-if="selectedRole" class="mt-6">
              <v-select
                v-model="selectedLocation"
                :items="locations"
                label="Select Location / Branch"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                :color="activeRoleColor"
              ></v-select>

              <v-text-field
                v-model="accessCode"
                label="Access Code"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :color="activeRoleColor"
                placeholder="Enter 4-digit PIN"
              ></v-text-field>

              <v-btn 
                block 
                size="large" 
                :color="activeRoleColor" 
                class="mt-4 text-none font-weight-bold"
                :loading="loggingIn"
                @click="handleLogin"
              >
                Launch {{ activeRoleTitle }} App
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </v-card>
    
    <!-- Floating Help Button -->
    <v-btn
        position="fixed"
        location="bottom right"
        icon="mdi-help"
        color="secondary"
        class="ma-4"
        variant="tonal"
    ></v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedRole = ref(null);
const selectedLocation = ref('Downtown Gym');
const accessCode = ref('');
const loggingIn = ref(false);

const locations = ['Downtown Gym', 'Uptown Branch', 'Corporate HQ'];

const roles = [
  { 
    id: 'security', 
    title: 'Security', 
    desc: 'Visitor & Entry Management', 
    icon: 'mdi-security', 
    color: 'blue' 
  },
  { 
    id: 'canteen', 
    title: 'Canteen', 
    desc: 'Food Service & POS', 
    icon: 'mdi-food', 
    color: 'orange' 
  },
  { 
    id: 'reception', 
    title: 'Reception', 
    desc: 'General Admin & Helpdesk', 
    icon: 'mdi-desk', 
    color: 'purple' 
  },
  { 
    id: 'parking', 
    title: 'Parking', 
    desc: 'Traffic & Slot Control', 
    icon: 'mdi-car-parking', 
    color: 'indigo' 
  }
];

const activeRoleColor = computed(() => {
  const role = roles.find(r => r.id === selectedRole.value);
  return role ? role.color : 'primary';
});

const activeRoleTitle = computed(() => {
  const role = roles.find(r => r.id === selectedRole.value);
  return role ? role.title : '';
});

const selectRole = (role) => {
  selectedRole.value = role.id;
  // Reset for demo feel
  accessCode.value = '';
};

const handleLogin = () => {
  loggingIn.value = true;
  
  // Simulate API delay
  setTimeout(() => {
    loggingIn.value = false;
    
    // Route based on role
    if (selectedRole.value === 'security') {
      router.push('/apps/validator');
    } else if (selectedRole.value === 'canteen') {
      router.push('/apps/canteen/validator');
    } else if (selectedRole.value === 'parking') {
      router.push('/apps/parking');
    } else {
      // Reception fallback
      router.push('/apps/storefront'); 
    }
  }, 1000);
};
</script>

<style scoped>
.staff-portal {
  background: #f5f5f5;
}

.role-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.role-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.selected-role {
  background-color: rgb(var(--v-theme-surface));
  border-width: 2px;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>
