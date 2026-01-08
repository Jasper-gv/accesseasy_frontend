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
        <v-col cols="12" md="8">
          <!-- Basic Info -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Basic Information</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="template.name"
                label="Template Name"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || 'Name is required']"
                placeholder="e.g., Standard Visitor, Contractor"
              />
              <v-textarea
                v-model="template.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                rows="3"
                placeholder="Brief description of this visitor type"
              />
              
              <v-file-input
                v-model="logoFile"
                label="Template Logo"
                variant="outlined"
                density="comfortable"
                prepend-icon="mdi-camera"
                accept="image/*"
                @update:model-value="handleLogoUpload"
                hint="Upload a logo for this template (Max 2MB)"
                persistent-hint
              />
            </v-card-text>
          </v-card>

          <!-- Form Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center px-4 pt-4">
              <span class="text-subtitle-1 font-weight-bold">Registration Form</span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                @click="openFormDesigner"
              >
                Design Form
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="template.formId"
                :items="forms"
                item-title="name"
                item-value="id"
                label="Select Form (Optional)"
                variant="outlined"
                density="comfortable"
                placeholder="Choose a registration form"
                clearable
              />
              <div class="text-caption text-grey-darken-1 mt-2">
                This form will be shown to visitors when they register via QR or link.
              </div>
            </v-card-text>
          </v-card>

          <!-- Badge Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center px-4 pt-4">
              <span class="text-subtitle-1 font-weight-bold">Badge Layout</span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                prepend-icon="mdi-pencil"
                @click="openBadgeDesigner"
              >
                Design Badge
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="template.badgeLayoutId"
                :items="badgeLayouts"
                item-title="name"
                item-value="id"
                label="Select Badge Layout (Optional)"
                variant="outlined"
                density="comfortable"
                placeholder="Choose a badge layout"
                clearable
              />
              <div v-if="selectedBadge" class="text-caption text-grey-darken-1 mt-2">
                {{ selectedBadge.description }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Access Control -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Access Control</v-card-title>
            <v-card-text>
              <v-select
                v-model="template.accessLevelId"
                :items="accessLevels"
                item-title="accessLevelName"
                item-value="id"
                label="Access Level"
                variant="outlined"
                density="comfortable"
                placeholder="Select access level"
                :loading="loadingAccessLevels"
                :rules="[v => !!v || 'Access level is required']"
              />
              <div class="text-caption text-grey-darken-1 mt-2">
                This access level will be assigned to visitors using this template. It controls which doors and zones they can access.
              </div>
            </v-card-text>
          </v-card>

          <!-- QR Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">QR Configuration</v-card-title>
            <v-card-text>
              <v-switch
                v-model="template.qrEnabled"
                label="Enable QR Code"
                color="primary"
                hide-details
                density="compact"
              />
              <div class="text-caption text-grey-darken-1 mt-2 mb-4">
                When enabled, a QR code will be generated after visitor registration for check-in/check-out.
              </div>

              <v-expand-transition>
                <div v-if="template.qrEnabled">
                  <v-select
                    v-model="template.qrPageId"
                    :items="qrPages"
                    item-title="name"
                    item-value="id"
                    label="QR Page Layout"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Select QR page layout"
                    :rules="template.qrEnabled ? [v => !!v || 'QR page is required when QR is enabled'] : []"
                  />
                  <div v-if="selectedQRPage" class="text-caption text-grey-darken-1 mt-2">
                    {{ selectedQRPage.description }}
                  </div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>

          <!-- Link Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Link Configuration</v-card-title>
            <v-card-text>
              <v-switch
                v-model="template.linkEnabled"
                label="Enable Public Link"
                color="info"
                hide-details
                density="compact"
              />
              <div class="text-caption text-grey-darken-1 mt-2 mb-4">
                When enabled, employees can share a public registration link with visitors.
              </div>

              <v-expand-transition>
                <div v-if="template.linkEnabled">
                  <v-text-field
                    v-model="template.publicLink"
                    label="Public Registration Link"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    :placeholder="template.publicLink || 'Click Generate to create a link'"
                  >
                    <template v-slot:append-inner>
                      <v-btn
                        v-if="template.publicLink"
                        icon
                        variant="text"
                        size="small"
                        @click="copyLink"
                      >
                        <v-icon>{{ linkCopied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
                        <v-tooltip activator="parent" location="top">
                          {{ linkCopied ? 'Copied!' : 'Copy link' }}
                        </v-tooltip>
                      </v-btn>
                    </template>
                  </v-text-field>
                  
                  <v-btn
                    v-if="!template.publicLink"
                    variant="outlined"
                    color="primary"
                    size="small"
                    prepend-icon="mdi-link-variant"
                    @click="generateLink"
                    :loading="generatingLink"
                    class="mt-2"
                  >
                    Generate Link
                  </v-btn>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>

          <!-- Approval Configuration -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Approval Configuration</v-card-title>
            <v-card-text>
              <v-switch
                v-model="template.approvalRequired"
                label="Require Approval"
                color="warning"
                hide-details
                density="compact"
              />
              <div class="text-caption text-grey-darken-1 mt-2 mb-4">
                When enabled, visitor registration will require approval before QR/badge is generated.
              </div>

              <v-expand-transition>
                <div v-if="template.approvalRequired">
                  <v-select
                    v-model="template.approverId"
                    :items="approvers"
                    item-title="label"
                    item-value="value"
                    label="Approver"
                    variant="outlined"
                    density="comfortable"
                    placeholder="Select approver"
                    :rules="template.approvalRequired ? [v => !!v || 'Approver is required when approval is enabled'] : []"
                  />
                  <div class="text-caption text-grey-darken-1 mt-2">
                    The selected approver will be notified when a visitor registers using this template.
                  </div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Mobile Preview -->
          <v-card variant="outlined" class="mb-6 sticky-preview">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Mobile Preview</v-card-title>
            <v-card-text class="d-flex justify-center">
              <div class="mobile-frame">
                <div class="mobile-screen">
                  <!-- Status Bar -->
                  <div class="status-bar d-flex justify-space-between px-2 py-1">
                    <span class="text-caption font-weight-bold">9:41</span>
                    <div class="d-flex gap-1">
                      <v-icon size="x-small">mdi-signal</v-icon>
                      <v-icon size="x-small">mdi-wifi</v-icon>
                      <v-icon size="x-small">mdi-battery</v-icon>
                    </div>
                  </div>
                  
                  <!-- Content -->
                  <div class="mobile-content pa-4 d-flex flex-column align-center">
                    <div class="logo-placeholder mb-4">
                      <img v-if="template.logo" :src="template.logo" alt="Logo" class="preview-logo" />
                      <v-icon v-else icon="mdi-image-outline" size="large" color="grey-lighten-1" />
                    </div>
                    
                    <h3 class="text-h6 font-weight-bold text-center mb-2">{{ template.name || 'Visitor Registration' }}</h3>
                    <p class="text-caption text-center text-grey-darken-1 mb-4">
                      {{ template.description || 'Welcome! Please complete the registration form.' }}
                    </p>

                    <!-- Feature Badges -->
                    <div class="d-flex flex-wrap gap-2 mb-4 justify-center">
                      <v-chip v-if="template.qrEnabled" size="x-small" color="primary" variant="flat">
                        <v-icon start size="x-small">mdi-qrcode</v-icon>
                        QR Enabled
                      </v-chip>
                      <v-chip v-if="template.linkEnabled" size="x-small" color="info" variant="flat">
                        <v-icon start size="x-small">mdi-link</v-icon>
                        Link Enabled
                      </v-chip>
                      <v-chip v-if="template.approvalRequired" size="x-small" color="warning" variant="flat">
                        <v-icon start size="x-small">mdi-check-decagram</v-icon>
                        Approval Required
                      </v-chip>
                    </div>
                    
                    <v-btn block color="primary" class="mb-3" rounded="lg">Start Registration</v-btn>
                    <v-btn block variant="text" size="small">I have an invite</v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Status Controls -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="text-subtitle-1 font-weight-bold px-4 pt-4">Status</v-card-title>
            <v-card-text>
              <v-switch
                v-model="template.status"
                :label="template.status === 'active' ? 'Active' : 'Inactive'"
                true-value="active"
                false-value="inactive"
                color="success"
                hide-details
                inset
              />
              <v-checkbox
                v-model="template.isDefault"
                label="Set as Default Template"
                hide-details
                density="compact"
                class="mt-2"
              />
            </v-card-text>
          </v-card>
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
  formId: null,
  badgeLayoutId: null,
  accessLevelId: null,
  qrEnabled: true,
  qrPageId: null,
  linkEnabled: false,
  publicLink: null,
  approvalRequired: false,
  approverId: null,
  status: 'active',
  isDefault: false,
  logo: null,
});

const forms = ref([]);
const badgeLayouts = ref([]);
const qrPages = ref([]);
const accessLevels = ref([]);
const approvers = ref([]);

const selectedBadge = computed(() => {
  return badgeLayouts.value.find(b => b.id === template.value.badgeLayoutId);
});

const selectedQRPage = computed(() => {
  return qrPages.value.find(p => p.id === template.value.qrPageId);
});

onMounted(async () => {
  await Promise.all([
    loadForms(),
    loadBadgeLayouts(),
    loadQRPages(),
    loadAccessLevels(),
    loadApprovers(),
  ]);
  
  console.log('[VisitorTemplateEditor] Mounted - isEditMode:', isEditMode.value, 'props:', props);
  
  if (isEditMode.value) {
    const templateId = props.templateId || route.params.id;
    console.log('[VisitorTemplateEditor] Loading template ID:', templateId);
    await loadTemplate(templateId);
  }
});

const loadForms = async () => {
  try {
    const data = await visitorService.getVisitorForms();
    forms.value = data;
  } catch (error) {
    console.error('Error loading forms:', error);
  }
};

const loadBadgeLayouts = async () => {
  try {
    const data = await visitorService.getBadgeLayouts();
    badgeLayouts.value = data;
  } catch (error) {
    console.error('Error loading badge layouts:', error);
  }
};

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
      template.value = { ...data };
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

const handleLogoUpload = (file) => {
  if (!file) {
    template.value.logo = null;
    return;
  }
  
  // Create a preview URL
  const reader = new FileReader();
  reader.onload = (e) => {
    template.value.logo = e.target.result;
  };
  reader.readAsDataURL(file);
};

const generateLink = async () => {
  generatingLink.value = true;
  try {
    const result = await visitorService.generatePublicLink(template.value.id);
    if (result.success) {
      template.value.publicLink = result.link;
      showNotification('Public link generated successfully', 'success');
    }
  } catch (error) {
    console.error('Error generating link:', error);
    showNotification('Error generating link', 'error');
  } finally {
    generatingLink.value = false;
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(template.value.publicLink);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Error copying link:', error);
  }
};

const saveTemplate = async () => {
  console.log('[VisitorTemplateEditor] saveTemplate called');
  console.log('[VisitorTemplateEditor] Current template data:', template.value);
  console.log('[VisitorTemplateEditor] isEditMode:', isEditMode.value);
  
  const { valid } = await formRef.value.validate();
  console.log('[VisitorTemplateEditor] Form validation result:', valid);
  
  if (!valid) {
    console.error('[VisitorTemplateEditor] Form validation failed');
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  saving.value = true;
  try {
    if (isEditMode.value) {
      const templateId = props.templateId || route.params.id;
      console.log('[VisitorTemplateEditor] Updating template ID:', templateId);
      const result = await visitorService.updateVisitorTemplate(Number(templateId), template.value);
      console.log('[VisitorTemplateEditor] Update result:', result);
      showNotification('Template updated successfully', 'success');
    } else {
      // Create Visitor Template (badge is optional)
      const templateData = {
        ...template.value,
      };
      
      console.log('[VisitorTemplateEditor] Creating template with data:', templateData);
      const result = await visitorService.createVisitorTemplate(templateData);
      console.log('[VisitorTemplateEditor] Create result:', result);
      showNotification('Template created successfully', 'success');
    }
    
    // Small delay to show the success message
    setTimeout(() => {
      console.log('[VisitorTemplateEditor] Emitting change-view to list');
      emit('change-view', 'list');
    }, 1000);
  } catch (error) {
    console.error('[VisitorTemplateEditor] Error saving template:', error);
    console.error('[VisitorTemplateEditor] Error details:', error.response?.data || error.message);
    showNotification('Error saving template: ' + (error.response?.data?.errors?.[0]?.message || error.message), 'error');
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  emit('change-view', 'list');
};

const openFormDesigner = () => {
  emit('change-view', 'form-designer');
};

const openBadgeDesigner = () => {
  emit('change-view', 'badge-designer');
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

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.sticky-preview {
  position: sticky;
  top: 20px;
}

/* Mobile Preview Styles */
.mobile-frame {
  width: 280px;
  height: 560px;
  background-color: #1a1a1a;
  border-radius: 36px;
  padding: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
}

.mobile-screen {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 10;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
}

.logo-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
