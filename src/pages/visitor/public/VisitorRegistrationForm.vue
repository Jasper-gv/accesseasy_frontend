<template>
  <div class="visitor-registration d-flex flex-column align-center justify-center h-100 bg-grey-lighten-4">
    <v-card class="registration-card elevation-4 rounded-lg overflow-hidden" width="100%" max-width="480">
      
      <!-- Loading State -->
      <div v-if="loading" class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="mt-4 text-grey">Loading form...</div>
      </div>

      <!-- Success State -->
      <div v-else-if="submitted" class="success-state pa-4 text-center">
        <VisitorBadgeCard 
          :visitor="visitorData"
          :template-name="templateName"
          :status="visitorStatus"
          :qr-code="qrCode"
          :badge-fields="badgeFields"
          :selected-badge-fields="selectedBadgeFields"
        />

        <v-btn block variant="outlined" color="primary" class="mt-6" @click="resetForm">
          Register Another Visitor
        </v-btn>
      </div>

      <!-- Form State -->
      <div v-else>
        <!-- Header -->
        <div class="bg-primary pa-4">
          <div class="d-flex align-center mb-4">
            <v-btn icon variant="text" color="white" @click="goBack" class="mr-2">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div class="d-flex align-center">
               <!-- Tenant Branding Mock -->
               <v-avatar color="white" size="32" class="mr-3">
                 <v-icon icon="mdi-domain" color="primary" size="20" />
               </v-avatar>
               <div class="text-white font-weight-bold">Acme Corp</div>
            </div>
          </div>
          
          <div class="pl-12">
            <div class="text-h5 font-weight-bold text-white">{{ templateName }}</div>
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
import VisitorBadgeCard from '@/components/visitor/VisitorBadgeCard.vue';

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
const visitorStatus = ref('pending');
const visitorData = ref({});
const badgeFields = ref([]);
const selectedBadgeFields = ref([]);

// Mock form definition (in real app, fetch from backend based on template.formId)
const mockFormDefinition = [
  { key: 'personName', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
  { key: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
  { key: 'mobileNumber', type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
  { key: 'purpose', type: 'select', label: 'Purpose of Visit', required: true, options: ['Meeting', 'Interview', 'Delivery', 'Other'] },
  { key: 'hostName', type: 'text', label: 'Host Name', required: true, placeholder: 'Who are you visiting?' },
];

onMounted(async () => {
  const { templateId, code } = route.query;
  
  if (templateId) {
    await loadTemplateData(templateId);
  } else if (code) {
    await loadTemplateData(code);
  } else {
    await loadTemplateData(1);
  }
});

const loadTemplateData = async (idOrCode) => {
  loading.value = true;
  try {
    // For now, treating as template ID or mock resolution
    const template = await visitorService.getVisitorTemplateById(Number(idOrCode) || 1);
    
    if (template) {
      templateName.value = template.name;
      approvalRequired.value = template.approvalRequired;
      badgeFields.value = template.badgeFields || [];
      selectedBadgeFields.value = template.selectedBadgeFields || [];
      
      // Map default fields
      const fields = [];
      if (template.formId) {
        // In a real app, we'd fetch the form definition. 
        // Here we'll use a hardcoded map based on defaultFormFields from editor
        const defaultFields = ['Full Name', 'Email Address', 'Phone Number', 'Purpose of Visit'];
        
        defaultFields.forEach(label => {
          const key = label.toLowerCase().replace(/\s+/g, '');
          let type = 'text';
          if (key.includes('email')) type = 'email';
          if (key.includes('phone')) type = 'phone';
          if (key.includes('purpose')) type = 'select';
          
          fields.push({
            key,
            label,
            type,
            required: true,
            options: type === 'select' ? ['Meeting', 'Interview', 'Delivery', 'Other'] : []
          });
        });
      }

      // Map custom fields
      if (template.customFormFields) {
        template.customFormFields.forEach(field => {
          fields.push({
            key: field.label.toLowerCase().replace(/\s+/g, ''),
            label: field.label,
            type: field.type,
            required: field.required,
            isCustom: true
          });
        });
      }
      
      formFields.value = fields;
      
      // Initialize form data
      formData.value = {};
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
    const visitorDataPayload = {
      ...formData.value,
      personName: formData.value.fullname, // Map fullname to personName
      mobileNumber: formData.value.phonenumber, // Map phonenumber
      visitDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: '18:00', // Default end time
      accessLevel: 1, // Default access level
      status: approvalRequired.value ? 'pending' : 'approved'
    };
    const response = await visitorService.registerVisitor(visitorDataPayload);
    
    visitorName.value = visitorDataPayload.personName;
    visitorData.value = { ...visitorDataPayload, customFields: {} }; // Store for badge
    
    // Populate custom fields in visitorData for badge display
    formFields.value.filter(f => f.isCustom).forEach(f => {
       if (!visitorData.value.customFields) visitorData.value.customFields = {};
       visitorData.value.customFields[f.label] = formData.value[f.key];
    });

    if (approvalRequired.value) {
      visitorStatus.value = 'pending';
    } else {
      visitorStatus.value = 'approved';
      // Generate QR if approved
      if (response.data.qrCode) {
        qrCode.value = response.data.qrCode;
      } else {
         // Generate local QR if not returned
         const qrUrl = await visitorService.generateQR(response.data);
         qrCode.value = qrUrl;
      }
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
