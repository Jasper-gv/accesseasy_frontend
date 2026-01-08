<template>
  <div class="visitor-registration d-flex flex-column align-center justify-center h-100 bg-grey-lighten-4">
    <v-card class="registration-card elevation-4 rounded-lg overflow-hidden" width="100%" max-width="480">
      
      <!-- Loading State -->
      <div v-if="loading" class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="mt-4 text-grey">Loading form...</div>
      </div>

      <!-- Success State -->
      <div v-else-if="submitted" class="success-state pa-8 text-center">
        <v-icon icon="mdi-check-circle" color="success" size="80" class="mb-4" />
        <h2 class="text-h5 font-weight-bold mb-2">Registration Successful!</h2>
        <div class="text-body-1 text-grey-darken-1 mb-6">
          {{ approvalRequired ? 'Your request has been sent for approval.' : 'You have been checked in.' }}
        </div>

        <div v-if="qrCode" class="qr-container mb-6 pa-4 bg-white rounded border d-inline-block">
          <img :src="qrCode" alt="Visitor QR Code" style="width: 200px; height: 200px;" />
          <div class="text-caption font-weight-bold mt-2">{{ visitorName }}</div>
        </div>

        <v-btn block variant="outlined" color="primary" @click="resetForm">
          Register Another Visitor
        </v-btn>
      </div>

      <!-- Form State -->
      <div v-else>
        <!-- Header -->
        <div class="bg-primary pa-4 d-flex align-center">
          <v-btn icon variant="text" color="white" @click="goBack" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-white">{{ templateName }}</div>
            <div class="text-caption text-white opacity-80">Please fill in your details</div>
          </div>
        </div>

        <v-form ref="formRef" @submit.prevent="submitForm" class="pa-6">
          <!-- Dynamic Fields -->
          <div v-for="(field, index) in formFields" :key="index" class="mb-4">
            <v-text-field
              v-if="['text', 'email', 'phone'].includes(field.type)"
              v-model="formData[field.key]"
              :label="field.label"
              :placeholder="field.placeholder"
              :rules="field.required ? [v => !!v || `${field.label} is required`] : []"
              variant="outlined"
              density="comfortable"
              :type="field.type === 'phone' ? 'tel' : field.type"
            />
            
            <v-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.key]"
              :label="field.label"
              :items="field.options"
              :rules="field.required ? [v => !!v || `${field.label} is required`] : []"
              variant="outlined"
              density="comfortable"
            />
            
            <v-textarea
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.key]"
              :label="field.label"
              :placeholder="field.placeholder"
              :rules="field.required ? [v => !!v || `${field.label} is required`] : []"
              variant="outlined"
              density="comfortable"
              rows="3"
            />
            
            <v-checkbox
              v-else-if="field.type === 'checkbox'"
              v-model="formData[field.key]"
              :label="field.label"
              :rules="field.required ? [v => !!v || 'This field is required'] : []"
              density="compact"
            />
          </div>

          <v-btn
            block
            color="primary"
            size="large"
            type="submit"
            :loading="submitting"
            class="mt-6"
          >
            Submit Registration
          </v-btn>
        </v-form>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { visitorService } from '@/services/visitorService';

const router = useRouter();
const route = useRoute();
const formRef = ref(null);

const loading = ref(true);
const submitting = ref(false);
const submitted = ref(false);

const templateId = ref(null);
const templateName = ref('');
const approvalRequired = ref(false);
const formFields = ref([]);
const formData = ref({});
const qrCode = ref(null);
const visitorName = ref('');

// Mock form definition (in real app, fetch from backend based on template.formId)
const mockFormDefinition = [
  { key: 'personName', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
  { key: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
  { key: 'mobileNumber', type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
  { key: 'purpose', type: 'select', label: 'Purpose of Visit', required: true, options: ['Meeting', 'Interview', 'Delivery', 'Other'] },
  { key: 'hostName', type: 'text', label: 'Host Name', required: true, placeholder: 'Who are you visiting?' },
];

onMounted(async () => {
  // In a real app, we'd get templateId from route params
  // templateId.value = route.params.templateId;
  
  // For demo, let's assume a default template if none provided
  await loadTemplateData(1);
});

const loadTemplateData = async (id) => {
  loading.value = true;
  try {
    const template = await visitorService.getVisitorTemplateById(id);
    if (template) {
      templateName.value = template.name;
      approvalRequired.value = template.approvalEnabled;
      
      // Load form fields (mocked)
      formFields.value = mockFormDefinition;
      
      // Initialize form data
      formFields.value.forEach(field => {
        formData.value[field.key] = '';
      });
    }
  } catch (error) {
    console.error('Error loading template:', error);
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  submitting.value = true;
  try {
    const visitorData = {
      ...formData.value,
      visitDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: '18:00', // Default end time
      accessLevel: 1, // Default access level
    };

    const response = await visitorService.registerVisitor(visitorData);
    
    visitorName.value = visitorData.personName;
    if (response.data.qrCode) {
      qrCode.value = response.data.qrCode;
    }
    
    submitted.value = true;
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.back();
};

const resetForm = () => {
  submitted.value = false;
  qrCode.value = null;
  formRef.value?.reset();
  // Reset form data
  formFields.value.forEach(field => {
    formData.value[field.key] = '';
  });
};
</script>

<style scoped>
.visitor-registration {
  min-height: 100vh;
}
</style>
