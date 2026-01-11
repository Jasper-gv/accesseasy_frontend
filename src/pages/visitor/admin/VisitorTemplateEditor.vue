<template>
  <div class="visitor-template-editor">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">{{ isEditMode ? 'Edit Template' : 'Create Template' }}</h2>
        <div class="text-subtitle-2 text-grey-darken-1 mt-1">
          Configure visitor experience and access rules.
        </div>
      </div>
      <div class="d-flex gap-3">
        <v-btn
          variant="outlined"
          color="grey-darken-1"
          @click="cancel"
        >
          Cancel
        </v-btn>
        <BaseButton
          variant="primary"
          :loading="saving"
          @click="saveTemplate"
        >
          {{ isEditMode ? 'Update Template' : 'Create Template' }}
        </BaseButton>
      </div>
    </div>

    <v-form ref="formRef" @submit.prevent="saveTemplate">
      <v-row>
        <!-- Left Column: Configuration -->
        <v-col cols="12" md="8">
          <!-- Basic Info -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Basic Information</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="template.name"
                label="Process Name"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Name is required']"
                placeholder="e.g., Standard Visitor, Tech Conf 2025"
              />
              
              <!-- Process Type Selection -->
              <div class="mt-4 mb-2 text-subtitle-2">Process Type</div>
              <v-radio-group v-model="template.processType" inline color="primary" density="compact">
                <v-radio label="Standard" value="Standard"></v-radio>
                <v-radio label="Event" value="Event"></v-radio>
                <v-radio label="Contractor" value="Contractor"></v-radio>
                <v-radio label="Delivery" value="Delivery"></v-radio>
              </v-radio-group>

              <!-- Event Validity (Conditional) -->
              <v-expand-transition>
                <div v-if="template.processType === 'Event'" class="mb-4 pa-4 bg-grey-lighten-4 rounded border">
                  <div class="text-subtitle-2 mb-3">Event Validity Period</div>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="template.validityStart"
                        label="Start Date"
                        type="date"
                        variant="outlined"
                        density="compact"
                        :rules="[v => !!v || 'Start date is required for events']"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="template.validityEnd"
                        label="End Date"
                        type="date"
                        variant="outlined"
                        density="compact"
                        :rules="[v => !!v || 'End date is required for events']"
                      />
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>
              
              <v-file-input
                v-model="logoFile"
                label="Process Logo"
                variant="outlined"
                density="comfortable"
                prepend-icon="mdi-camera"
                accept="image/*"
                @update:model-value="handleLogoUpload"
                hint="Upload a logo for this process (Max 2MB)"
                persistent-hint
              />
              
              <!-- Logo Preview -->
              <div v-if="template.logo" class="mt-4 d-flex align-center">
                <v-avatar size="64" rounded="lg" class="mr-4">
                  <v-img :src="template.logo" cover></v-img>
                </v-avatar>
                <v-btn
                  variant="text"
                  color="error"
                  size="small"
                  @click="removeLogo"
                >
                  Remove Logo
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Branch Visibility & Scope -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Branch Visibility & Scope</v-card-title>
            <v-card-text>
              <v-radio-group v-model="template.branchScope" color="primary">
                <v-radio label="All Branches (Default)" value="all">
                  <template v-slot:label>
                    <div>
                      <div class="font-weight-medium">All Branches</div>
                      <div class="text-caption text-grey-darken-1">Template will be available across all branches under the tenant</div>
                    </div>
                  </template>
                </v-radio>
                <v-radio label="Specific Branches" value="specific">
                  <template v-slot:label>
                    <div>
                      <div class="font-weight-medium">Specific Branches</div>
                      <div class="text-caption text-grey-darken-1">Select specific branches where this template should be available</div>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>

              <v-expand-transition>
                <div v-if="template.branchScope === 'specific'" class="ml-8">
                  <v-select
                    v-model="template.selectedBranches"
                    :items="branches"
                    item-title="title"
                    item-value="value"
                    label="Select Branches"
                    variant="outlined"
                    density="comfortable"
                    multiple
                    chips
                    closable-chips
                    placeholder="Choose branches"
                    :rules="[v => template.branchScope !== 'specific' || (v && v.length > 0) || 'Please select at least one branch']"
                  />
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>

          <!-- Form Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center px-4 pt-4">
              <span class="text-subtitle-1 font-weight-bold">Visitor Form Configuration</span>
            </v-card-title>
            <v-card-text>
              <div class="text-subtitle-2 mb-2">Mandatory Fields</div>
              <div class="d-flex flex-wrap gap-2 mb-4">
                <v-chip v-for="field in defaultFormFields" :key="field" variant="outlined" color="grey-darken-2">
                  {{ field }}
                </v-chip>
              </div>

              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-2">Custom Fields</div>
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addCustomField"
                >
                  Add Field
                </v-btn>
              </div>

              <div v-if="template.customFormFields.length === 0" class="text-center py-4 text-grey">
                No custom fields added
              </div>

              <v-list v-else density="compact" class="bg-grey-lighten-5 rounded-lg pa-2">
                <v-list-item v-for="(field, index) in template.customFormFields" :key="index" class="mb-2 bg-white rounded border-sm">
                  <template v-slot:prepend>
                    <v-icon size="small" color="grey" class="cursor-move">mdi-drag</v-icon>
                  </template>
                  
                  <v-row dense align="center" class="w-100 ml-2">
                    <v-col cols="4">
                      <v-text-field
                        v-model="field.label"
                        label="Label"
                        variant="plain"
                        density="compact"
                        hide-details
                        placeholder="Field Label"
                      />
                    </v-col>
                    <v-col cols="3">
                      <v-select
                        v-model="field.type"
                        :items="['text', 'number', 'dropdown']"
                        label="Type"
                        variant="plain"
                        density="compact"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="3">
                      <v-switch
                        v-model="field.required"
                        label="Required"
                        color="primary"
                        density="compact"
                        hide-details
                        class="ml-2"
                      />
                    </v-col>
                    <v-col cols="2" class="text-right">
                      <v-btn icon variant="text" size="small" color="error" @click="removeCustomField(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Badge Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center px-4 pt-4">
              <span class="text-subtitle-1 font-weight-bold">Badge Configuration</span>
            </v-card-title>
            <v-card-text>
              <div class="text-subtitle-2 mb-2">Badge Fields</div>
              <div class="text-caption text-grey-darken-1 mb-3">Select fields to display on the visitor badge.</div>

              <div class="d-flex flex-wrap gap-2 mb-4">
                <v-chip
                  v-for="field in availableBadgeFields"
                  :key="field"
                  :color="template.selectedBadgeFields.includes(field) ? 'primary' : 'default'"
                  :variant="template.selectedBadgeFields.includes(field) ? 'flat' : 'outlined'"
                  filter
                  @click="toggleBadgeField(field)"
                >
                  {{ field }}
                </v-chip>
              </div>

              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-2">Additional Badge Fields</div>
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addBadgeField"
                >
                  Add Field
                </v-btn>
              </div>

              <div v-if="template.badgeFields.length === 0" class="text-center py-4 text-grey">
                No additional badge fields added
              </div>

              <v-list v-else density="compact" class="bg-grey-lighten-5 rounded-lg pa-2">
                <v-list-item v-for="(field, index) in template.badgeFields" :key="index" class="mb-2 bg-white rounded border-sm">
                  <template v-slot:prepend>
                    <v-icon size="small" color="grey" class="cursor-move">mdi-drag</v-icon>
                  </template>
                  
                  <v-row dense align="center" class="w-100 ml-2">
                    <v-col cols="5">
                      <v-text-field
                        v-model="field.label"
                        label="Label"
                        variant="plain"
                        density="compact"
                        hide-details
                        placeholder="Field Label"
                      />
                    </v-col>
                    <v-col cols="5">
                       <v-select
                        v-model="field.type"
                        :items="['text', 'image']"
                        label="Type"
                        variant="plain"
                        density="compact"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="2" class="text-right">
                      <v-btn icon variant="text" size="small" color="error" @click="removeBadgeField(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Access & Permission Settings -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Access & Permission Settings</v-card-title>
            <v-card-text>
              <div class="text-subtitle-2 font-weight-bold mb-2">Entry Methods</div>
              <div class="text-caption text-grey-darken-1 mb-3">Select how visitors can access the registration form.</div>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-checkbox
                    v-model="template.qrEnabled"
                    label="QR Code Scan"
                    color="primary"
                    hide-details
                    density="compact"
                  >
                    <template v-slot:details>
                       <div class="text-caption text-grey ml-2">Link to a specific QR Code</div>
                    </template>
                  </v-checkbox>
                </v-col>
                <v-col cols="12" md="6">
                  <v-checkbox
                    v-model="template.linkEnabled"
                    label="Public Link"
                    color="info"
                    hide-details
                    density="compact"
                  >
                     <template v-slot:details>
                       <div class="text-caption text-grey ml-2">Enable public registration link</div>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>

              <v-expand-transition>
                <div v-if="template.qrEnabled" class="mt-4">
                  <v-select
                    v-model="template.qrCodeId"
                    :items="qrPages"
                    item-title="name"
                    item-value="id"
                    label="Select QR Code"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Choose a QR Code"
                    :rules="[v => !!v || 'QR Code is required']"
                  />
                  <div v-if="qrPages.length === 0" class="mt-2 text-caption text-warning">
                    No QR codes available. Please create one in Visitor Settings.
                  </div>
                </div>
              </v-expand-transition>

              <v-expand-transition>
                <div v-if="template.linkEnabled" class="mt-4">
                  <v-select
                    v-model="template.publicLinkCode"
                    :items="publicLinks"
                    item-title="name"
                    item-value="code"
                    label="Select Public Link"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Choose a link"
                    :rules="[v => !!v || 'Public link is required']"
                  />
                  
                  <div v-if="template.publicLinkCode" class="mt-2 pa-3 bg-grey-lighten-4 rounded border">
                    <div class="text-caption text-grey-darken-1 mb-1">Registration URL:</div>
                    <div class="d-flex align-center">
                      <div class="text-body-2 text-primary text-truncate flex-grow-1 mr-2">
                        {{ getLinkUrl(template.publicLinkCode) }}
                      </div>
                      <v-btn
                        icon="mdi-content-copy"
                        variant="text"
                        size="x-small"
                        color="grey-darken-2"
                        @click="copyLink(template.publicLinkCode)"
                      >
                        <v-tooltip activator="parent" location="top">Copy Link</v-tooltip>
                      </v-btn>
                    </div>
                  </div>
                  <div v-else-if="publicLinks.length === 0" class="mt-2 text-caption text-warning">
                    No public links available. Please create one in Visitor Settings.
                  </div>
                </div>
              </v-expand-transition>

              <v-expand-transition>
                <div class="mt-4">
                  <v-checkbox
                    v-model="template.approvalRequired"
                    label="Require Approval"
                    color="warning"
                    hide-details
                    density="compact"
                  >
                    <template v-slot:details>
                       <div class="text-caption text-grey ml-2">Require security approval before entry</div>
                    </template>
                  </v-checkbox>
                </div>
              </v-expand-transition>

              <v-expand-transition>
                <div v-if="template.approvalRequired" class="mt-2 ml-8">
                  <v-select
                    v-model="template.approverId"
                    :items="approvers"
                    item-title="label"
                    item-value="value"
                    label="Select Approver"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Choose who approves requests"
                    :rules="template.approvalRequired ? [v => !!v || 'Approver is required'] : []"
                  />
                </div>
              </v-expand-transition>
              
              <div class="mt-4">
                 <v-select
                  v-model="template.accessLevelId"
                  :items="accessLevels"
                  item-title="accessLevelName"
                  item-value="id"
                  label="Default Access Level"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Select access level"
                  :loading="loadingAccessLevels"
                  :rules="[v => !!v || 'Access level is required']"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column: Mobile Preview -->
        <v-col cols="12" md="4">
          <div class="position-sticky" style="top: 20px;">
            <div class="text-h6 font-weight-bold mb-4">Mobile Preview</div>
            <div class="mobile-frame mx-auto">
              <div class="mobile-screen">
                <!-- Mobile Header -->
                <div class="mobile-header bg-primary pa-4 text-white">
                  <div class="text-subtitle-1 font-weight-bold">{{ template.name || 'Event Name' }}</div>
                  <div class="text-caption">Visitor Registration</div>
                </div>

                <!-- Mobile Content -->
                <div class="mobile-content pa-4">
                  <!-- Form Preview -->
                  <div class="mb-6">
                    <div class="text-subtitle-2 font-weight-bold mb-2">Registration Form</div>
                    <div class="d-flex flex-column gap-2">
                      <div v-for="field in defaultFormFields" :key="field" class="preview-field">
                        <div class="text-caption text-grey-darken-1">{{ field }}</div>
                        <div class="preview-input"></div>
                      </div>
                      <div v-for="(field, index) in template.customFormFields" :key="index" class="preview-field">
                        <div class="text-caption text-grey-darken-1">{{ field.label || 'New Field' }} <span v-if="field.required" class="text-error">*</span></div>
                        <div class="preview-input"></div>
                      </div>
                    </div>
                  </div>

                  <v-divider class="mb-6"></v-divider>

                  <!-- Badge Preview -->
                  <div>
                    <div class="text-subtitle-2 font-weight-bold mb-2">Badge Preview</div>
                    <div class="badge-preview pa-3 border rounded bg-white">
                      <div class="d-flex align-center mb-3">
                        <v-avatar size="40" color="grey-lighten-2" class="mr-3">
                          <v-icon icon="mdi-account" color="grey"></v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-subtitle-2 font-weight-bold">Visitor Name</div>
                          <div class="text-caption text-grey">{{ template.name || 'Event Name' }}</div>
                        </div>
                      </div>
                      
                      <!-- Default Badge Fields -->
                      <div class="d-flex justify-center my-2">
                         <v-icon size="64" icon="mdi-qrcode" color="black"></v-icon>
                      </div>

                      <!-- Custom Badge Fields -->
                       <div v-if="template.badgeFields.length > 0" class="mt-3 pt-3 border-t">
                        <div v-for="(field, index) in template.badgeFields" :key="index" class="text-caption mb-1">
                          <span class="font-weight-bold">{{ field.label || 'Field' }}:</span> Value
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-form>

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
import { useRouter, useRoute } from 'vue-router';
import { visitorService } from '@/services/visitorService';
import BaseButton from '@/components/common/buttons/BaseButton.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'create', // 'create' or 'edit'
  },
  templateId: {
    type: [String, Number],
    default: null,
  },
  defaultLinkEnabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['change-view']);

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const saving = ref(false);
const logoFile = ref(null);
const generatingLink = ref(false);
const linkCopied = ref(false);
const loadingAccessLevels = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const isEditMode = computed(() => props.mode === 'edit' || !!props.templateId || !!route.params.id);

const template = ref({
  name: '',
  description: '',
  processType: 'Standard', // Default
  validityStart: null,
  validityEnd: null,
  gates: [],
  branchScope: 'all',
  selectedBranches: [],
  customFormFields: [],
  selectedBadgeFields: ['Visitor Name', 'Event Name', 'QR Code'],
  badgeFields: [],
  accessLevelId: null,
  qrEnabled: true,
  qrPageId: null,
  linkEnabled: false,
  publicLinkCode: null, // Changed from publicLink to publicLinkCode
  approvalRequired: false,
  approverId: null,
  status: 'active',
  isDefault: false,
  logo: null,
});

// Initialize with default link enabled if prop is set
if (props.defaultLinkEnabled) {
  template.value.linkEnabled = true;
}

const defaultFormFields = ['Full Name', 'Email Address', 'Phone Number', 'Purpose of Visit'];
const availableBadgeFields = ['Visitor Name', 'Event Name', 'QR Code', 'Host Name', 'Visit Date', 'Access Level', 'Photo'];

const toggleBadgeField = (field) => {
  if (!template.value.selectedBadgeFields) template.value.selectedBadgeFields = [];
  
  const index = template.value.selectedBadgeFields.indexOf(field);
  if (index === -1) {
    template.value.selectedBadgeFields.push(field);
  } else {
    template.value.selectedBadgeFields.splice(index, 1);
  }
};

const qrPages = ref([]);
const accessLevels = ref([]);
const approvers = ref([]);
const branches = ref([]);
const publicLinks = ref([]); // Added publicLinks state

const selectedQRPage = computed(() => {
  return qrPages.value.find(p => p.id === template.value.qrPageId);
});

onMounted(async () => {
  await Promise.all([
    loadQRPages(),
    loadAccessLevels(),
    loadApprovers(),
    loadBranches(), 
    loadPublicLinks(), // Added loadPublicLinks
  ]);
  
  if (isEditMode.value) {
    const templateId = props.templateId || route.params.id;
    await loadTemplate(templateId);
  }
});

const loadQRPages = async () => {
  try {
    const data = await visitorService.getQRPages();
    qrPages.value = data;
  } catch (error) {
    console.error('Error loading QR pages:', error);
  }
};

const loadAccessLevels = async () => {
  loadingAccessLevels.value = true;
  try {
    const data = await visitorService.getAccessLevels();
    accessLevels.value = data;
  } catch (error) {
    console.error('Error loading access levels:', error);
    showNotification('Error loading access levels', 'error');
  } finally {
    loadingAccessLevels.value = false;
  }
};

const loadTemplate = async (id) => {
  try {
    const data = await visitorService.getVisitorTemplateById(Number(id));
    if (data) {
      template.value = { 
        ...data,
        processType: data.processType || 'Standard',
        validityStart: data.validityStart,
        validityEnd: data.validityEnd,
        gates: data.gates || [],
        branchScope: data.branchScope || 'all',
        selectedBranches: data.selectedBranches || [],
        customFormFields: data.customFormFields || [],
        selectedBadgeFields: data.selectedBadgeFields || ['Visitor Name', 'Event Name', 'QR Code'],
        badgeFields: data.badgeFields || [],
      };
    }
  } catch (error) {
    console.error('Error loading template:', error);
  }
};

const loadApprovers = async () => {
  try {
    const approversList = await visitorService.getApprovers();
    approvers.value = approversList.map(approver => ({
      label: approver.assignedUser?.first_name || 'Unknown',
      value: approver.assignedUser?.id || null,
    }));
  } catch (error) {
    console.error('Error loading approvers:', error);
  }
};

const loadBranches = async () => {
  // Hardcoded data as requested
  branches.value = [
    { title: 'branch srivai', value: 8818 },
    { title: 'branch chennai', value: 8819 },
    { title: 'branch madurai', value: 8820 },
  ];
};

const loadPublicLinks = async () => {
  try {
    const settings = await visitorService.getVisitorSettings();
    if (settings && settings.public_links) {
      publicLinks.value = settings.public_links;
    }
  } catch (error) {
    console.error('Error loading public links:', error);
  }
};

const handleLogoUpload = (file) => {
  if (!file) {
    return;
  }
  
  // Create a preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    template.value.logo = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeLogo = () => {
  template.value.logo = null;
  logoFile.value = null;
};

const addCustomField = () => {
  template.value.customFormFields.push({
    label: '',
    type: 'text',
    required: false
  });
};

const removeCustomField = (index) => {
  template.value.customFormFields.splice(index, 1);
};

const addBadgeField = () => {
  template.value.badgeFields.push({
    label: '',
    type: 'text'
  });
};

const removeBadgeField = (index) => {
  template.value.badgeFields.splice(index, 1);
};

const getLinkUrl = (code) => {
  return `${window.location.origin}/visitor/landing?code=${code}`;
};

const copyLink = async (code) => {
  try {
    const url = getLinkUrl(code);
    await navigator.clipboard.writeText(url);
    linkCopied.value = true;
    showNotification('Link copied to clipboard', 'success');
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error copying link:', error);
    showNotification('Error copying link', 'error');
  }
};

const saveTemplate = async () => {
  const { valid } = await formRef.value.validate();
  
  if (!valid) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  saving.value = true;
  try {
    if (isEditMode.value) {
      const templateId = props.templateId || route.params.id;
      await visitorService.updateVisitorTemplate(Number(templateId), template.value);
      showNotification('Template updated successfully', 'success');
    } else {
      await visitorService.createVisitorTemplate(template.value);
      showNotification('Template created successfully', 'success');
    }
    
    setTimeout(() => {
      emit('change-view', 'list');
    }, 1000);
  } catch (error) {
    console.error('Error saving template:', error);
    showNotification('Error saving template', 'error');
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  emit('change-view', 'list');
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
.visitor-template-editor {
  max-width: 100%;
}

.gap-3 {
  gap: 12px;
}

.gap-2 {
  gap: 8px;
}

.cursor-move {
  cursor: move;
}

.mobile-frame {
  width: 300px;
  height: 600px;
  border: 12px solid #333;
  border-radius: 36px;
  overflow: hidden;
  background: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  position: relative;
}

.mobile-screen {
  height: 100%;
  overflow-y: auto;
  background: #f5f5f5;
}

.preview-field {
  margin-bottom: 8px;
}

.preview-input {
  height: 32px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
