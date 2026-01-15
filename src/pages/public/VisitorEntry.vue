<template>
  <v-container class="fill-height bg-grey-lighten-5 justify-center" fluid>
    <v-card width="100%" max-width="450" class="rounded-xl" elevation="4">
      <div class="bg-primary pa-6 text-center rounded-t-xl">
        <h2 class="text-h5 font-weight-bold text-white mb-2">Welcome Visitor</h2>
        <p class="text-white opacity-80">Please check-in to continue</p>
      </div>

      <v-window v-model="step" class="pa-6">
        <!-- Step 1: Mobile Number -->
        <v-window-item :value="1">
          <p class="text-body-1 mb-4 text-center">Enter your mobile number to verify.</p>
          <v-form @submit.prevent="sendOtp">
             <v-text-field
                v-model="visitor.mobile"
                label="Mobile Number"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                class="mb-4 rounded-lg"
                :rules="[v => !!v || 'Required']"
             ></v-text-field>
             
             <v-btn block color="primary" size="large" class="rounded-lg" type="submit" :loading="loading">
                Send OTP
             </v-btn>
          </v-form>
        </v-window-item>

        <!-- Step 2: OTP -->
        <v-window-item :value="2">
          <p class="text-body-1 mb-4 text-center">Enter the OTP sent to {{ visitor.mobile }}.</p>
          <div class="text-caption text-center text-grey mb-4">Use '1234' for demo</div>
          <v-otp-input v-model="otp" length="4" class="mb-4 justify-center"></v-otp-input>
          
          <v-btn block color="primary" size="large" class="rounded-lg" @click="verifyOtp" :loading="loading">
            Verify
          </v-btn>
          <v-btn block variant="text" class="mt-2" @click="step--">Back</v-btn>
        </v-window-item>

        <!-- Step 3: Select Pass Type (NEW) -->
        <v-window-item :value="3">
            <p class="text-h6 mb-4 text-center">Select Your Pass</p>
            <v-radio-group v-model="selectedTemplateId" v-if="visitorTemplates.length > 0">
                <v-card v-for="t in visitorTemplates" :key="t.id" border class="mb-3" elevation="0" @click="selectedTemplateId = t.id" :color="selectedTemplateId === t.id ? 'primary-lighten-5' : ''">
                    <div class="d-flex align-center pa-3">
                        <v-radio :value="t.id" class="flex-grow-0 mr-2"></v-radio>
                        <div class="flex-grow-1">
                            <div class="font-weight-bold">{{ t.name }}</div>
                            <div class="text-caption">{{ t.duration }} Hours • {{ t.accessMode }}</div>
                        </div>
                        <div class="font-weight-bold text-h6">
                            {{ t.cost === 0 ? 'Free' : `₹${t.cost}` }}
                        </div>
                    </div>
                </v-card>
            </v-radio-group>
            <div v-else class="text-center pa-4 text-grey">Loading passes...</div>

             <v-btn block color="primary" size="large" class="rounded-lg mt-4" @click="step = 4" :disabled="!selectedTemplateId">
                Next
            </v-btn>
        </v-window-item>

        <!-- Step 4: Details -->
        <v-window-item :value="4">
          <p class="text-body-1 mb-4 text-center">Almost there! Fill in your details.</p>
          <v-form ref="detailsForm" @submit.prevent="checkIn">
             <v-text-field v-model="visitor.name" label="Full Name" variant="outlined" density="comfortable" :rules="[v => !!v || 'Required']"></v-text-field>
             <v-text-field v-model="visitor.purpose" label="Purpose of Visit" variant="outlined" density="comfortable" :rules="[v => !!v || 'Required']"></v-text-field>
             <v-text-field v-model="visitor.host" label="Host Name (Optional)" variant="outlined" density="comfortable"></v-text-field>
             
             <div class="d-flex justify-center my-4 pa-4 border rounded dashed">
                <v-icon size="40" color="grey">mdi-camera</v-icon>
                <span class="ml-2 align-self-center text-grey">Take Photo</span>
             </div>

             <v-btn block color="success" size="large" class="rounded-lg" type="submit" :loading="loading">
                {{ getSelectedTemplateCost > 0 ? `Pay ₹${getSelectedTemplateCost} & Check In` : 'Check In' }}
             </v-btn>
          </v-form>
        </v-window-item>

        <!-- Step 5: Success -->
         <v-window-item :value="5">
             <div class="text-center py-6">
                 <v-icon color="success" size="80" class="mb-4">mdi-qrcode</v-icon>
                 <h3 class="text-h5 font-weight-bold mb-2">Check-in Successful!</h3>
                 <p class="text-grey mb-6">Show this QR code at the entrance.</p>
                 <v-btn variant="outlined" @click="reset">New Check-in</v-btn>
             </div>
         </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { visitorService } from '@/services/appLayer/visitorService';
import { passTemplateService } from '@/services/appLayer/passTemplateService';

const step = ref(1);
const loading = ref(false);
const otp = ref('');
const detailsForm = ref(null);
const visitorTemplates = ref([]);
const selectedTemplateId = ref(null);

const visitor = ref({
    mobile: '',
    name: '',
    purpose: '',
    host: ''
});

onMounted(async () => {
    try {
        const all = await passTemplateService.getAll();
        visitorTemplates.value = all.filter(t => t.type === 'Visitor');
        if (visitorTemplates.value.length > 0) {
            selectedTemplateId.value = visitorTemplates.value[0].id;
        }
    } catch (e) { console.error(e); }
});

const getSelectedTemplateCost = computed(() => {
    const t = visitorTemplates.value.find(t => t.id === selectedTemplateId.value);
    return t ? t.cost : 0;
});

const sendOtp = async () => {
    if (!visitor.value.mobile) return;
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        step.value = 2;
    }, 1000);
};

const verifyOtp = async () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
        if (otp.value === '1234') {
            step.value = 3; // Go to Pass Selection
        } else {
            alert('Invalid OTP (Use 1234)');
        }
    }, 1000);
};

const checkIn = async () => {
    const { valid } = await detailsForm.value.validate();
    if (!valid) return;

    loading.value = true;
    try {
        const template = visitorTemplates.value.find(t => t.id === selectedTemplateId.value);
        await visitorService.create({
            ...visitor.value,
            passType: template.name,
            cost: template.cost,
            accessMode: template.accessMode
        });
        step.value = 5;
    } catch (e) {
        console.error(e);
        alert('Check-in failed');
    } finally {
        loading.value = false;
    }
};

const reset = () => {
    visitor.value = { mobile: '', name: '', purpose: '', host: '' };
    otp.value = '';
    step.value = 1;
};
</script>

<style scoped>
.dashed {
  border-style: dashed !important;
}
</style>
