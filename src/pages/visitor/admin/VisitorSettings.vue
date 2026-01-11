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
              <div class="text-body-2 text-grey-darken-1 mb-4">
                Manage QR codes for different entry points.
              </div>

              <v-expand-transition>
                <div v-if="settings.enable_qr" class="mt-auto pt-2">
                  <div class="d-flex justify-end mb-3">
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      prepend-icon="mdi-plus"
                      @click="createQR"
                    >
                      Create New QR
                    </v-btn>
                  </div>

                  <div v-if="settings.qr_codes.length === 0" class="text-center text-grey pa-4 border rounded border-dashed">
                    No active QR codes. Create one to get started.
                  </div>

                  <div v-else class="d-flex flex-column gap-3">
                    <div 
                      v-for="(qr, index) in settings.qr_codes" 
                      :key="qr.id"
                      class="bg-grey-lighten-4 rounded-lg pa-3"
                    >
                      <div class="d-flex justify-space-between align-center mb-2">
                        <div class="text-subtitle-2 font-weight-bold">{{ qr.name }}</div>
                        <v-btn
                          icon="mdi-delete-outline"
                          variant="text"
                          color="error"
                          size="x-small"
                          @click="removeQR(index)"
                        >
                          <v-tooltip activator="parent" location="top">Delete QR</v-tooltip>
                        </v-btn>
                      </div>

                      <div class="d-flex gap-2">
                        <v-btn
                          variant="outlined"
                          size="x-small"
                          prepend-icon="mdi-qrcode"
                          class="flex-grow-1"
                          @click="openQrDialog(qr, 'site')"
                        >
                          View QR
                        </v-btn>
                        <v-btn
                          variant="outlined"
                          size="x-small"
                          prepend-icon="mdi-share-variant"
                          class="flex-grow-1"
                          @click="shareQR(qr)"
                        >
                          Share
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
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
              <div class="text-body-2 text-grey-darken-1 mb-4">
                Generate and share registration links with visitors before their arrival.
              </div>

              <v-expand-transition>
                <div v-if="settings.enable_link" class="mt-auto pt-2">
                  <div class="d-flex justify-end mb-3">
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      prepend-icon="mdi-plus"
                      @click="createLink"
                    >
                      Create New Link
                    </v-btn>
                  </div>

                  <div v-if="settings.public_links.length === 0" class="text-center text-grey pa-4 border rounded border-dashed">
                    No active links. Create one to get started.
                  </div>

                  <div v-else class="d-flex flex-column gap-3">
                    <div 
                      v-for="(link, index) in settings.public_links" 
                      :key="link.id"
                      class="bg-grey-lighten-4 rounded-lg pa-3"
                    >
                      <div class="d-flex justify-space-between align-center mb-2">
                        <div class="text-subtitle-2 font-weight-bold">{{ link.name }}</div>
                        <v-btn
                          icon="mdi-delete-outline"
                          variant="text"
                          color="error"
                          size="x-small"
                          @click="removeLink(index)"
                        >
                          <v-tooltip activator="parent" location="top">Delete Link</v-tooltip>
                        </v-btn>
                      </div>

                      <div class="d-flex align-center bg-white rounded px-2 py-1 mb-2 border">
                        <div class="text-truncate text-caption flex-grow-1 mr-2 text-grey-darken-1">
                          {{ getLinkUrl(link.code) }}
                        </div>
                        <v-btn
                          icon="mdi-content-copy"
                          variant="text"
                          size="x-small"
                          density="comfortable"
                          color="grey-darken-2"
                          @click="copyLink(link.code)"
                        >
                          <v-tooltip activator="parent" location="top">Copy Link</v-tooltip>
                        </v-btn>
                      </div>

                      <div class="d-flex gap-2">
                        <v-btn
                          variant="outlined"
                          size="x-small"
                          prepend-icon="mdi-qrcode"
                          class="flex-grow-1"
                          @click="openQrDialog(link, 'link')"
                        >
                          QR Code
                        </v-btn>
                        <v-btn
                          variant="outlined"
                          size="x-small"
                          prepend-icon="mdi-share-variant"
                          class="flex-grow-1"
                          @click="shareLink(link.code)"
                        >
                          Share
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- QR Code Dialog -->
        <v-dialog v-model="showQrDialog" max-width="400">
          <v-card v-if="selectedItemForQr">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ selectedItemForQr.name }} QR</span>
              <v-btn icon="mdi-close" variant="text" size="small" @click="showQrDialog = false" />
            </v-card-title>
            <v-card-text class="d-flex flex-column align-center pa-4">
              <div class="bg-white pa-2 rounded mb-4 border">
                <img :src="qrCodeUrl" alt="QR Code" style="width: 200px; height: 200px;" v-if="qrCodeUrl"/>
                <v-skeleton-loader type="image" width="200" height="200" v-else />
              </div>
              <div class="text-caption text-center text-grey-darken-1 mb-4">
                Scan this code to access the visitor registration form.
              </div>
              <v-btn
                block
                variant="flat"
                color="primary"
                prepend-icon="mdi-download"
                @click="downloadQR"
              >
                Download QR Code
              </v-btn>
            </v-card-text>
          </v-card>
        </v-dialog>


        <!-- 3. Approval Option -->
        <!-- <v-col cols="12" md="4">
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
                    v-model="settings.approvers"
                    :items="approvers"
                    item-title="label"
                    item-value="value"
                    label="Select Approvers"
                    variant="outlined"
                    density="compact"
                    hide-details
                    multiple
                    chips
                    closable-chips
                    :loading="loadingApprovers"
                    prepend-inner-icon="mdi-account-multiple-check"
                    placeholder="Select approvers"
                    @update:model-value="saveSettings"
                  />
                  <div class="text-caption text-grey-darken-1 mt-2">
                    <v-icon icon="mdi-shield-check" size="small" class="mr-1" />
                    Visitor entry requires approval from one of these users.
                  </div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col> -->
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
import QRCode from 'qrcode';
import BaseButton from '@/components/common/buttons/BaseButton.vue';
import { Save, Plus, Trash2, Copy, QrCode, Share2 } from 'lucide-vue-next';

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
  qr_codes: [],
  enable_link: false,
  public_links: [],
  enable_approval: false,
  approvers: [],
});

const qrCodeUrl = ref('');
const selectedItemForQr = ref(null);
const showQrDialog = ref(false);
const qrType = ref('site'); // 'site' or 'link'

const originalSettings = ref({});

onMounted(async () => {
  await loadSites();
  await loadSettings();
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
        qr_codes: data.qr_codes || [],
        enable_link: data.enable_link || false,
        public_links: data.public_links || [],
        enable_approval: data.enable_approval || false,
        approvers: data.approvers || [],
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

  if (settings.value.enable_approval && (!settings.value.approvers || settings.value.approvers.length === 0)) {
    // Don't show error if just toggling approval on, wait for selection
    return;
  }

  saving.value = true;
  try {
    const payload = {
      enable_qr: settings.value.enable_qr,
      qr_codes: settings.value.qr_codes,
      enable_link: settings.value.enable_link,
      public_links: settings.value.public_links,
      enable_approval: settings.value.enable_approval,
      approvers: settings.value.enable_approval ? settings.value.approvers : [],
    };
    
    const response = await visitorService.updateVisitorSettings(payload);
    
    // Update local settings with any generated values from backend
    if (response.data) {
       settings.value.qr_codes = response.data.qr_codes || [];
       settings.value.public_links = response.data.public_links || [];
    }

    originalSettings.value = { ...settings.value };
    showNotification('Configuration saved successfully', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving configuration', 'error');
  } finally {
    saving.value = false;
  }
};

const createLink = () => {
  const chars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const newLink = {
    id: Date.now(),
    name: `Link ${settings.value.public_links.length + 1}`,
    code: code,
    created_at: new Date().toISOString()
  };
  
  settings.value.public_links.push(newLink);
  // Auto-save when creating a link to persist it
  saveSettings();
};

const removeLink = (index) => {
  settings.value.public_links.splice(index, 1);
  saveSettings();
};

const createQR = () => {
  const chars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const newQR = {
    id: Date.now(), // In real app, backend would assign ID
    name: `Entry Point ${settings.value.qr_codes.length + 1}`,
    code: code,
    created_at: new Date().toISOString()
  };
  
  settings.value.qr_codes.push(newQR);
  saveSettings();
};

const removeQR = (index) => {
  settings.value.qr_codes.splice(index, 1);
  saveSettings();
};

const getLinkUrl = (code) => {
  // Point to the public visitor landing page
  return `${window.location.origin}/visitor/landing?code=${code}`;
};

const getQrUrl = (code) => {
  // Point to the public visitor landing page with qr_id
  return `${window.location.origin}/visitor/landing?qr_id=${code}`;
};

const copyLink = (code) => {
  const url = getLinkUrl(code);
  navigator.clipboard.writeText(url);
  showNotification('Link copied to clipboard', 'success');
};

const openQrDialog = async (item, type) => {
  selectedItemForQr.value = item;
  qrType.value = type;
  
  let url = '';
  if (type === 'site') {
    url = getQrUrl(item.code);
  } else {
    url = getLinkUrl(item.code);
  }
  
  await generateQrImage(url);
  showQrDialog.value = true;
};

const showNotification = (message, type = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = type;
  snackbarIcon.value = type === 'success' ? 'mdi-check-circle' : 
                       type === 'error' ? 'mdi-alert-circle' : 'mdi-information';
  showSnackbar.value = true;
};

const generateQrImage = async (text) => {
  try {
    const url = await QRCode.toDataURL(text, { width: 200, margin: 1 });
    qrCodeUrl.value = url;
  } catch (err) {
    console.error('QR Generation Error:', err);
  }
};

const downloadQR = () => {
  if (!qrCodeUrl.value || !selectedItemForQr.value) return;
  
  const name = qrType.value === 'site' 
    ? `visitor-entry-${selectedItemForQr.value.name}-qr.png` 
    : `visitor-link-${selectedItemForQr.value.code}-qr.png`;
  
  const link = document.createElement('a');
  link.download = name;
  link.href = qrCodeUrl.value;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const shareQR = async (item) => {
  // Implementation depends on browser capabilities. 
  // For now, we'll just show a notification.
  showNotification('Sharing functionality would open native share sheet', 'info');
};

const shareLink = (code) => {
  const url = getLinkUrl(code);
  if (navigator.share) {
    navigator.share({
      title: 'Visitor Registration',
      text: 'Please register for your visit using this link:',
      url: url,
    }).catch(console.error);
  } else {
    copyLink(code);
  }
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

.font-monospace {
  font-family: monospace;
  letter-spacing: 2px;
}
</style>
