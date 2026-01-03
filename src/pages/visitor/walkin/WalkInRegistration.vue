<template>
  <div class="walk-in-registration">
    <v-container class="fill-height pa-4">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="10" md="8" lg="6">
          <!-- Header -->
          <div class="text-center mb-6">
            <v-icon icon="mdi-account-plus" size="64" color="primary" class="mb-4" />
            <h1 class="text-h4 font-weight-bold mb-2">Visitor Registration</h1>
            <p class="text-body-1 text-grey-darken-1">
              Please fill in your details to complete registration
            </p>
          </div>

          <!-- Registration Form -->
          <v-card v-if="!submitted" class="registration-card" elevation="4">
            <v-card-text class="pa-6">
              <v-form ref="formRef" @submit.prevent="handleSubmit">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="formData.personName"
                      label="Full Name"
                      prepend-inner-icon="mdi-account"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.mobileNumber"
                      label="Mobile Number"
                      prepend-inner-icon="mdi-phone"
                      variant="outlined"
                      density="comfortable"
                      type="tel"
                      :rules="[rules.required, rules.phone]"
                      required
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.email"
                      label="Email Address"
                      prepend-inner-icon="mdi-email"
                      variant="outlined"
                      density="comfortable"
                      type="email"
                      :rules="[rules.required, rules.email]"
                      required
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.purpose"
                      :items="purposeOptions"
                      label="Purpose of Visit"
                      prepend-inner-icon="mdi-briefcase"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.visitDate"
                      label="Visit Date"
                      prepend-inner-icon="mdi-calendar"
                      variant="outlined"
                      density="comfortable"
                      type="date"
                      :min="today"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.startTime"
                      label="Start Time"
                      prepend-inner-icon="mdi-clock-start"
                      variant="outlined"
                      density="comfortable"
                      type="time"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.endTime"
                      label="End Time"
                      prepend-inner-icon="mdi-clock-end"
                      variant="outlined"
                      density="comfortable"
                      type="time"
                      :rules="[rules.required]"
                      required
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      v-model="formData.hostName"
                      label="Host / Contact Person (Optional)"
                      prepend-inner-icon="mdi-account-tie"
                      variant="outlined"
                      density="comfortable"
                      hint="Person you're visiting"
                      persistent-hint
                    />
                  </v-col>
                </v-row>

                <v-divider class="my-4" />

                <div class="d-flex justify-end gap-3">
                  <v-btn
                    variant="outlined"
                    color="grey-darken-1"
                    @click="resetForm"
                    :disabled="submitting"
                  >
                    Reset
                  </v-btn>
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    :loading="submitting"
                    prepend-icon="mdi-check"
                  >
                    Submit Registration
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Success Screen with QR -->
          <v-card v-else class="success-card" elevation="4">
            <v-card-text class="pa-6 text-center">
              <v-icon
                icon="mdi-check-circle"
                size="80"
                color="success"
                class="mb-4"
              />
              <h2 class="text-h5 font-weight-bold mb-2">Registration Successful!</h2>
              
              <v-alert
                v-if="requiresApproval"
                type="warning"
                variant="tonal"
                prominent
                class="my-4"
              >
                <template #title>
                  <span class="font-weight-bold">Pending Approval</span>
                </template>
                Your registration is pending approval. You will receive your visitor QR code once approved.
              </v-alert>

              <div v-else class="qr-section mt-6">
                <p class="text-body-1 mb-4">Here's your visitor pass:</p>
                <QRDisplay
                  :qr-code="generatedQR"
                  :visitor-data="formData"
                  :valid-from="`${formData.visitDate}T${formData.startTime}`"
                  :valid-until="`${formData.visitDate}T${formData.endTime}`"
                  status="approved"
                  :show-countdown="true"
                  @download="handleDownload"
                  @share="handleShare"
                />
              </div>

              <v-btn
                color="primary"
                variant="outlined"
                class="mt-6"
                @click="registerAnother"
              >
                Register Another Visitor
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      <v-icon :icon="snackbarIcon" class="mr-2" />
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { visitorService } from '@/services/visitorService';
import QRDisplay from '@/components/visitor/QRDisplay.vue';

const route = useRoute();
const formRef = ref(null);
const submitting = ref(false);
const submitted = ref(false);
const generatedQR = ref(null);
const requiresApproval = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const today = new Date().toISOString().split('T')[0];
const currentTime = new Date().toTimeString().slice(0, 5);

const formData = ref({
  personName: '',
  mobileNumber: '',
  email: '',
  purpose: '',
  visitDate: today,
  startTime: currentTime,
  endTime: '17:00',
  hostName: '',
  registrationType: 'walk-in',
  accessLevel: 1,
});

const purposeOptions = [
  'Meeting',
  'Interview',
  'Delivery',
  'Maintenance',
  'Contractor',
  'Other',
];

const rules = {
  required: (v) => !!v || 'This field is required',
  email: (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
  phone: (v) => /^[+]?[\d\s-()]+$/.test(v) || 'Phone number must be valid',
};

onMounted(async () => {
  // Check if coming from QR scan
  if (route.query.type === 'walk-in') {
    // Pre-fill some data if needed
  }

  // Load settings to check if approval is required
  const settings = await visitorService.getVisitorSettings();
  requiresApproval.value = settings.enableApproval;
  formData.value.accessLevel = settings.defaultAccessLevel;
});

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  submitting.value = true;
  try {
    const result = await visitorService.registerVisitor(formData.value);
    
    if (result.success) {
      submitted.value = true;
      
      if (!requiresApproval.value) {
        // Generate QR immediately if no approval needed
        generatedQR.value = result.data.qrCode;
      }

      showNotification('Registration submitted successfully!', 'success');
    }
  } catch (error) {
    console.error('Error submitting registration:', error);
    showNotification('Error submitting registration. Please try again.', 'error');
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  formRef.value?.reset();
  formData.value = {
    personName: '',
    mobileNumber: '',
    email: '',
    purpose: '',
    visitDate: today,
    startTime: currentTime,
    endTime: '17:00',
    hostName: '',
    registrationType: 'walk-in',
    accessLevel: 1,
  };
};

const registerAnother = () => {
  submitted.value = false;
  generatedQR.value = null;
  resetForm();
};

const handleDownload = () => {
  showNotification('QR code downloaded successfully!', 'success');
};

const handleShare = () => {
  showNotification('Share functionality coming soon!', 'info');
};

const showNotification = (message, type = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = type;
  snackbarIcon.value =
    type === 'success'
      ? 'mdi-check-circle'
      : type === 'error'
        ? 'mdi-alert-circle'
        : 'mdi-information';
  showSnackbar.value = true;
};
</script>

<style scoped>
.walk-in-registration {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
}

.registration-card,
.success-card {
  border-radius: 24px;
  overflow: hidden;
}

.gap-3 {
  gap: 12px;
}

@media (max-width: 600px) {
  .walk-in-registration {
    padding: 20px 0;
  }
}
</style>
