<template>
  <div class="visitor-request h-100 d-flex flex-column bg-grey-lighten-5">
    <v-container fluid class="fill-height pa-0">
      <v-row class="fill-height ma-0">
        <!-- Left Side: Template Selection -->
        <v-col cols="12" md="4" lg="3" class="border-r bg-white pa-0 d-flex flex-column">
          <div class="pa-4 border-b">
            <h2 class="text-h6 font-weight-bold">New Visitor Request</h2>
            <div class="text-caption text-grey-darken-1">Select a visitor type to begin</div>
          </div>
          
          <div class="overflow-y-auto flex-grow-1 pa-4">
            <div v-if="loadingTemplates" class="d-flex justify-center pa-4">
              <v-progress-circular indeterminate color="primary" />
            </div>
            
            <div v-else-if="templates.length === 0" class="text-center pa-4 text-grey">
              No templates available.
            </div>

            <v-card
              v-for="template in templates"
              :key="template.id"
              :variant="selectedTemplate?.id === template.id ? 'tonal' : 'outlined'"
              :color="selectedTemplate?.id === template.id ? 'primary' : ''"
              class="mb-3 cursor-pointer template-card"
              @click="selectTemplate(template)"
            >
              <v-card-text>
                <div class="d-flex justify-space-between align-start mb-2">
                  <div class="font-weight-bold text-subtitle-1">{{ template.name }}</div>
                  <v-icon 
                    v-if="selectedTemplate?.id === template.id" 
                    icon="mdi-check-circle" 
                    color="primary" 
                    size="small"
                  />
                </div>
                <div class="text-caption text-grey-darken-1 line-clamp-2">
                  {{ template.description || 'No description provided.' }}
                </div>
                
                <div class="mt-3 d-flex gap-2 flex-wrap">
                  <v-chip size="x-small" v-if="template.approvalEnabled" color="warning" variant="flat">
                    Approval Required
                  </v-chip>
                  <v-chip size="x-small" v-else color="success" variant="flat">
                    Auto-Approved
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <!-- Right Side: Dynamic Form -->
        <v-col cols="12" md="8" lg="9" class="pa-0 d-flex flex-column bg-grey-lighten-5">
          <div v-if="!selectedTemplate" class="fill-height d-flex flex-column align-center justify-center text-grey">
            <v-icon icon="mdi-account-filter-outline" size="64" class="mb-4 opacity-50" />
            <div class="text-h6">Select a template to start</div>
            <div class="text-body-2">Choose a visitor type from the list on the left</div>
          </div>

          <div v-else class="fill-height d-flex flex-column">
            <!-- Form Header -->
            <div class="pa-6 pb-2">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <h1 class="text-h5 font-weight-bold">{{ selectedTemplate.name }} Registration</h1>
                  <div class="text-body-2 text-grey-darken-1 mt-1">
                    Please fill in the details below.
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Content -->
            <div class="flex-grow-1 overflow-y-auto px-6 pb-6">
              <v-card class="mx-auto" max-width="800">
                <v-card-text class="pa-6">
                  <v-form ref="formRef" @submit.prevent="submitRequest">
                    <div v-if="loadingForm" class="d-flex justify-center pa-8">
                      <v-progress-circular indeterminate color="primary" />
                    </div>

                    <div v-else-if="!currentForm" class="text-center pa-8 text-error">
                      <v-icon icon="mdi-alert-circle" size="48" class="mb-2" />
                      <div>Form configuration not found for this template.</div>
                    </div>

                    <v-row v-else>
                      <v-col 
                        v-for="field in currentForm.fields" 
                        :key="field.id"
                        cols="12" 
                        :md="['textarea'].includes(field.type) ? 12 : 6"
                      >
                        <!-- Text / Email / Phone -->
                        <v-text-field
                          v-if="['text', 'email', 'phone'].includes(field.type)"
                          v-model="formData[field.id]"
                          :label="field.label"
                          :placeholder="field.placeholder"
                          :type="field.type === 'phone' ? 'tel' : field.type"
                          variant="outlined"
                          density="comfortable"
                          :rules="getFieldRules(field)"
                          :prepend-inner-icon="getFieldIcon(field.type)"
                        />

                        <!-- Textarea -->
                        <v-textarea
                          v-else-if="field.type === 'textarea'"
                          v-model="formData[field.id]"
                          :label="field.label"
                          :placeholder="field.placeholder"
                          variant="outlined"
                          density="comfortable"
                          rows="3"
                          :rules="getFieldRules(field)"
                          prepend-inner-icon="mdi-text-box-outline"
                        />

                        <!-- Select -->
                        <v-select
                          v-else-if="field.type === 'select'"
                          v-model="formData[field.id]"
                          :items="field.options"
                          :label="field.label"
                          :placeholder="field.placeholder"
                          variant="outlined"
                          density="comfortable"
                          :rules="getFieldRules(field)"
                          prepend-inner-icon="mdi-form-dropdown"
                        />

                        <!-- Checkbox -->
                        <v-checkbox
                          v-else-if="field.type === 'checkbox'"
                          v-model="formData[field.id]"
                          :label="field.label"
                          density="comfortable"
                          :rules="getFieldRules(field)"
                          color="primary"
                        />
                      </v-col>
                      
                      <!-- Standard Visit Details (Always present) -->
                      <v-col cols="12">
                        <v-divider class="my-4" />
                        <div class="text-subtitle-1 font-weight-bold mb-4">Visit Details</div>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="visitDetails.date"
                          label="Visit Date"
                          type="date"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-calendar"
                          :min="today"
                          required
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                          v-model="visitDetails.startTime"
                          label="Start Time"
                          type="time"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-clock-start"
                          required
                        />
                      </v-col>

                      <v-col cols="12" md="3">
                        <v-text-field
                          v-model="visitDetails.endTime"
                          label="End Time"
                          type="time"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-clock-end"
                          required
                        />
                      </v-col>
                    </v-row>

                    <div class="d-flex justify-end mt-6 pt-4 border-t">
                      <v-btn
                        variant="text"
                        class="mr-2"
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
                        prepend-icon="mdi-send"
                        :disabled="!currentForm"
                      >
                        Submit Request
                      </v-btn>
                    </div>
                  </v-form>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Success Snackbar -->
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
import { ref, onMounted, computed } from 'vue';
import { visitorService } from '@/services/visitorService';

const templates = ref([]);
const selectedTemplate = ref(null);
const currentForm = ref(null);
const formData = ref({});
const formRef = ref(null);

const loadingTemplates = ref(false);
const loadingForm = ref(false);
const submitting = ref(false);

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const today = new Date().toISOString().split('T')[0];

const visitDetails = ref({
  date: today,
  startTime: '09:00',
  endTime: '17:00',
});

onMounted(async () => {
  await loadTemplates();
});

const loadTemplates = async () => {
  loadingTemplates.value = true;
  try {
    // Only show active templates
    const allTemplates = await visitorService.getVisitorTemplates();
    templates.value = allTemplates.filter(t => t.status === 'active');
  } catch (error) {
    console.error('Error loading templates:', error);
    showNotification('Error loading templates', 'error');
  } finally {
    loadingTemplates.value = false;
  }
};

const selectTemplate = async (template) => {
  selectedTemplate.value = template;
  formData.value = {}; // Reset form data
  loadingForm.value = true;
  
  try {
    if (template.formId) {
      currentForm.value = await visitorService.getVisitorFormById(template.formId);
    } else {
      currentForm.value = null;
    }
  } catch (error) {
    console.error('Error loading form:', error);
    showNotification('Error loading form configuration', 'error');
  } finally {
    loadingForm.value = false;
  }
};

const getFieldRules = (field) => {
  const rules = [];
  if (field.required) {
    rules.push(v => !!v || `${field.label} is required`);
    if (field.type === 'checkbox') {
      rules.push(v => !!v || 'This must be checked');
    }
  }
  if (field.type === 'email') {
    rules.push(v => /.+@.+\..+/.test(v) || 'Email must be valid');
  }
  return rules;
};

const getFieldIcon = (type) => {
  const icons = {
    text: 'mdi-text',
    email: 'mdi-email',
    phone: 'mdi-phone',
  };
  return icons[type] || 'mdi-pencil';
};

const submitRequest = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  submitting.value = true;
  try {
    // Map dynamic form data to standard visitor object structure
    // In a real app, we might store the raw dynamic data in a 'customData' field
    // For this demo, we'll try to map common fields if possible
    
    // Find fields by label or type to map to standard fields
    const nameField = currentForm.value.fields.find(f => f.label.toLowerCase().includes('name'));
    const emailField = currentForm.value.fields.find(f => f.type === 'email');
    const phoneField = currentForm.value.fields.find(f => f.type === 'phone');
    
    const payload = {
      personName: nameField ? formData.value[nameField.id] : 'Unknown Visitor',
      email: emailField ? formData.value[emailField.id] : '',
      mobileNumber: phoneField ? formData.value[phoneField.id] : '',
      purpose: selectedTemplate.value.name, // Use template name as purpose
      visitDate: visitDetails.value.date,
      startTime: visitDetails.value.startTime,
      endTime: visitDetails.value.endTime,
      hostName: 'Current User', // Should be logged in user
      registrationType: 'manual', // Or 'employee-request'
      accessLevel: selectedTemplate.value.accessLevel,
      customData: { ...formData.value }, // Store all data
      templateId: selectedTemplate.value.id,
    };

    await visitorService.registerVisitor(payload);
    
    showNotification('Visitor request submitted successfully!', 'success');
    resetForm();
    selectedTemplate.value = null; // Go back to selection
  } catch (error) {
    console.error('Error submitting request:', error);
    showNotification('Error submitting request', 'error');
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {};
  formRef.value?.resetValidation();
};

const showNotification = (message, type = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = type;
  snackbarIcon.value = type === 'success' ? 'mdi-check-circle' : 
                       type === 'error' ? 'mdi-alert-circle' : 'mdi-information';
  showSnackbar.value = true;
};
</script>

<style scoped>
.visitor-request {
  height: 100%;
}

.template-card {
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.gap-2 {
  gap: 8px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
