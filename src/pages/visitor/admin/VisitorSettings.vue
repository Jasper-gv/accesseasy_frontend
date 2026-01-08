<template>
  <div class="visitor-settings">
    <v-form ref="formRef" @submit.prevent="saveSettings">
      
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h2 class="text-h6 font-weight-bold">Visitor Management Configuration</h2>
          <div class="text-subtitle-2 text-grey-darken-1 mt-1">
            Configure global settings and defaults for visitor management.
          </div>
        </div>
        <div class="d-flex gap-3">
          <!-- <v-btn
            variant="outlined"
            color="grey-darken-1"
            prepend-icon="mdi-refresh"
            @click="resetSettings"
            :disabled="saving"
          >
            Reset
          </v-btn> -->

          <BaseButton
            type="submit"
            variant="primary"
            :left-icon="Save"
            :loading="saving"
          >
            Save Configuration
          </BaseButton>
        </div>
      </div>

      <!-- Site Selector -->
      <!-- <v-card variant="outlined" class="setting-card mb-6">
        <v-card-text>
          <div class="d-flex align-center gap-4">
            <v-icon icon="mdi-domain" color="primary" size="large" />
            <div class="flex-grow-1">
              <div class="text-h6 font-weight-bold">Site Configuration</div>
              <div class="text-caption text-grey-darken-1">
                Select the site to apply these settings.
              </div>
            </div>
            <div style="min-width: 300px;">
              <v-select
                v-model="settings.siteId"
                :items="sites"
                item-title="name"
                item-value="id"
                label="Select Site"
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-map-marker"
              />
            </div>
          </div>
        </v-card-text>
      </v-card> -->

      <v-row>
        <!-- 1. QR Option -->
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="setting-card h-100">
            <v-card-text class="d-flex flex-column h-100">
              <div class="d-flex justify-space-between align-start mb-4">
                <v-avatar color="primary-lighten-5" rounded>
                  <v-icon color="primary" icon="mdi-qrcode" />
                </v-avatar>
                <v-switch
                  v-model="settings.enable_qr"
                  color="primary"
                  hide-details
                  inset
                  density="compact"
                  @update:model-value="saveSettings"
                />
              </div>
              <div class="text-h6 font-weight-bold mb-1">QR Code Entry</div>
              <div class="text-body-2 text-grey-darken-1">
                Allow visitors to scan a QR code at the reception to register themselves.
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 2. Link Option -->
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="setting-card h-100">
            <v-card-text class="d-flex flex-column h-100">
              <div class="d-flex justify-space-between align-start mb-4">
                <v-avatar color="info-lighten-5" rounded>
                  <v-icon color="info" icon="mdi-link-variant" />
                </v-avatar>
                <v-switch
                  v-model="settings.enable_link"
                  color="info"
                  hide-details
                  inset
                  density="compact"
                  @update:model-value="saveSettings"
                />
              </div>
              <div class="text-h6 font-weight-bold mb-1">Pre-shared Link</div>
              <div class="text-body-2 text-grey-darken-1">
                Generate and share registration links with visitors before their arrival.
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 3. Approval Option -->
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="setting-card h-100">
            <v-card-text class="d-flex flex-column h-100">
              <div class="d-flex justify-space-between align-start mb-4">
                <v-avatar color="warning-lighten-5" rounded>
                  <v-icon color="warning" icon="mdi-shield-account" />
                </v-avatar>
                <v-switch
                  v-model="settings.enable_approval"
                  color="warning"
                  hide-details
                  inset
                  density="compact"
                  @update:model-value="handleApprovalChange"
                />
              </div>
              <div class="text-h6 font-weight-bold mb-1">Security Approval</div>
              <div class="text-body-2 text-grey-darken-1 mb-4">
                Require security personnel to approve visitors before issuing a QR code.
              </div>
              
              <v-expand-transition>
                <div v-if="settings.enable_approval" class="mt-auto pt-2">
                  <v-select
                    v-model="settings.approver"
                    :items="approvers"
                    item-title="label"
                    item-value="value"
                    label="Default Approver"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :loading="loadingApprovers"
                    prepend-inner-icon="mdi-account-check"
                    placeholder="Select approver"
                    @update:model-value="saveSettings"
                  />
                </div>
              </v-expand-transition>
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
import { ref, onMounted, computed, watch } from 'vue';
import { visitorService } from '@/services/visitorService';
import BaseButton from '@/components/common/buttons/BaseButton.vue';
import { Save } from 'lucide-vue-next';

const formRef = ref(null);
const saving = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');
const loadingApprovers = ref(false);
const approvers = ref([]);
const approversLoaded = ref(false);
const sites = ref([]);

const settings = ref({
  siteId: null,
  enable_qr: false,
  enable_link: false,
  enable_approval: false,
  approver: null,
});

const originalSettings = ref({});

onMounted(async () => {
  await loadSites();
  await loadSettings();
  if (settings.value.enable_approval) {
    await loadApprovers();
  }
});

watch(() => settings.value.enable_approval, async (newValue) => {
  if (newValue && !approversLoaded.value) {
    await loadApprovers();
  }
});

const loadSites = async () => {
  try {
    const data = await visitorService.getSites();
    sites.value = data;
    if (data.length > 0 && !settings.value.siteId) {
      settings.value.siteId = data[0].id;
    }
  } catch (error) {
    console.error('Error loading sites:', error);
  }
};

const loadSettings = async () => {
  try {
    const data = await visitorService.getVisitorSettings();
    if (data) {
      settings.value = {
        siteId: settings.value.siteId, // Keep selected site or default
        enable_qr: data.enable_qr || false,
        enable_link: data.enable_link || false,
        enable_approval: data.enable_approval || false,
        approver: data.approver || null,
      };
      originalSettings.value = { ...settings.value };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showNotification('Error loading settings', 'error');
  }
};

const loadApprovers = async () => {
  if (approversLoaded.value) return;
  
  loadingApprovers.value = true;
  try {
    const approversList = await visitorService.getApprovers();
    approvers.value = approversList.map(approver => ({
      label: approver.assignedUser?.first_name || 'Unknown',
      value: { 
        id: approver.assignedUser?.id, 
        name: approver.assignedUser?.first_name 
      },
    }));
    approversLoaded.value = true;
  } catch (error) {
    console.error('Error loading approvers:', error);
    showNotification('Error loading approvers', 'error');
  } finally {
    loadingApprovers.value = false;
  }
};

const saveSettings = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (settings.value.enable_approval && !settings.value.approver) {
    // Don't show error if just toggling approval on, wait for selection
    // But if trying to save explicitly or if approval is on and no approver, we might need to warn
    // However, for auto-save, we just return if invalid state to avoid bad API calls
    return;
  }

  saving.value = true;
  try {
    const payload = {
      enable_qr: settings.value.enable_qr,
      enable_link: settings.value.enable_link,
      enable_approval: settings.value.enable_approval,
      approver: settings.value.enable_approval ? settings.value.approver : null,
    };
    
    await visitorService.updateVisitorSettings(payload);
    originalSettings.value = { ...settings.value };
    showNotification('Configuration saved successfully', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving configuration', 'error');
  } finally {
    saving.value = false;
  }
};

const handleApprovalChange = (value) => {
  // If disabling, save immediately
  if (!value) {
    saveSettings();
  }
  // If enabling, do nothing (wait for approver selection)
};

const resetSettings = () => {
  settings.value = { ...originalSettings.value };
  formRef.value?.resetValidation();
  showNotification('Settings reset to last saved state', 'info');
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
.visitor-settings {
  max-width: 100%;
}

.setting-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border-color: #e0e0e0;
  background: white;
}

.setting-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.bg-primary-lighten-5 {
  background-color: #e8eaf6 !important;
}

.bg-info-lighten-5 {
  background-color: #e1f5fe !important;
}

.bg-warning-lighten-5 {
  background-color: #fff8e1 !important;
}
</style>
