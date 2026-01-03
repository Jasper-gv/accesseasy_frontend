<template>
  <div class="visitor-settings pa-6">
    <v-card class="settings-card" elevation="2">
      <v-card-title class="text-h5 font-weight-bold pa-6 bg-gradient">
        <v-icon icon="mdi-cog" class="mr-2" />
        Visitor Management Settings
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="saveSettings">
          <!-- Visitor Flow Settings -->
          <div class="settings-section mb-6">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon icon="mdi-account-multiple" class="mr-2" color="primary" />
              Visitor Flow Configuration
            </h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="setting-card">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="font-weight-bold mb-1">Walk-in QR Visitors</div>
                        <div class="text-caption text-grey-darken-1">
                          Allow visitors to scan reception QR and register
                        </div>
                      </div>
                      <v-switch
                        v-model="settings.enableWalkIn"
                        color="primary"
                        hide-details
                        inset
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="setting-card">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="font-weight-bold mb-1">Pre-shared Registration Link</div>
                        <div class="text-caption text-grey-darken-1">
                          Generate and share visitor registration links
                        </div>
                      </div>
                      <v-switch
                        v-model="settings.enablePreShared"
                        color="primary"
                        hide-details
                        inset
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="setting-card">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="font-weight-bold mb-1">Security / Host Approval</div>
                        <div class="text-caption text-grey-darken-1">
                          Require approval before QR activation
                        </div>
                      </div>
                      <v-switch
                        v-model="settings.enableApproval"
                        color="primary"
                        hide-details
                        inset
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="setting-card">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center">
                      <div>
                        <div class="font-weight-bold mb-1">Multiple Entry Allowance</div>
                        <div class="text-caption text-grey-darken-1">
                          Allow visitors to check-in multiple times
                        </div>
                      </div>
                      <v-switch
                        v-model="settings.allowMultipleEntry"
                        color="primary"
                        hide-details
                        inset
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Access Level & Validity Settings -->
          <div class="settings-section mb-6">
            <h3 class="text-h6 font-weight-bold mb-4">
              <v-icon icon="mdi-shield-check" class="mr-2" color="primary" />
              Access Control
            </h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.defaultAccessLevel"
                  :items="accessLevels"
                  item-title="accessLevelName"
                  item-value="id"
                  label="Default Visitor Access Level"
                  prepend-inner-icon="mdi-key"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Access level is required']"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon icon="mdi-key" size="20" />
                      </template>
                      <template #subtitle>
                        {{ item.raw.accessLevelNumber }}
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.qrValidityHours"
                  type="number"
                  label="QR Validity Duration (Hours)"
                  prepend-inner-icon="mdi-clock-outline"
                  variant="outlined"
                  density="comfortable"
                  min="1"
                  max="168"
                  :rules="[
                    v => !!v || 'Validity hours is required',
                    v => v >= 1 || 'Minimum 1 hour',
                    v => v <= 168 || 'Maximum 168 hours (7 days)',
                  ]"
                  hint="Default validity period for visitor QR codes"
                  persistent-hint
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-6" />

          <!-- Current Settings Summary -->
          <div class="settings-summary">
            <v-alert
              type="info"
              variant="tonal"
              prominent
              border="start"
              icon="mdi-information"
            >
              <template #title>
                <span class="font-weight-bold">Current Configuration</span>
              </template>
              <div class="text-body-2 mt-2">
                <ul class="pl-4">
                  <li>
                    Walk-in Registration: 
                    <strong>{{ settings.enableWalkIn ? 'Enabled' : 'Disabled' }}</strong>
                  </li>
                  <li>
                    Pre-shared Links: 
                    <strong>{{ settings.enablePreShared ? 'Enabled' : 'Disabled' }}</strong>
                  </li>
                  <li>
                    Approval Required: 
                    <strong>{{ settings.enableApproval ? 'Yes' : 'No' }}</strong>
                  </li>
                  <li>
                    Multiple Entries: 
                    <strong>{{ settings.allowMultipleEntry ? 'Allowed' : 'Not Allowed' }}</strong>
                  </li>
                  <li>
                    QR Validity: 
                    <strong>{{ settings.qrValidityHours }} hours</strong>
                  </li>
                  <li>
                    Default Access Level: 
                    <strong>{{ selectedAccessLevelName }}</strong>
                  </li>
                </ul>
              </div>
            </v-alert>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-end gap-3 mt-6">
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              prepend-icon="mdi-refresh"
              @click="resetSettings"
              :disabled="saving"
            >
              Reset
            </v-btn>
            <v-btn
              type="submit"
              color="primary"
              prepend-icon="mdi-content-save"
              :loading="saving"
            >
              Save Settings
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

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
import { ref, computed, onMounted } from 'vue';
import { visitorService } from '@/services/visitorService';

const formRef = ref(null);
const saving = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const settings = ref({
  enableWalkIn: true,
  enablePreShared: true,
  enableApproval: true,
  allowMultipleEntry: false,
  qrValidityHours: 24,
  defaultAccessLevel: 1,
});

const originalSettings = ref({});
const accessLevels = ref([]);

onMounted(async () => {
  await loadSettings();
  await loadAccessLevels();
});

const loadSettings = async () => {
  try {
    const data = await visitorService.getVisitorSettings();
    settings.value = { ...data };
    originalSettings.value = { ...data };
  } catch (error) {
    console.error('Error loading settings:', error);
    showNotification('Error loading settings', 'error');
  }
};

const loadAccessLevels = async () => {
  try {
    accessLevels.value = await visitorService.getAccessLevels();
  } catch (error) {
    console.error('Error loading access levels:', error);
  }
};

const selectedAccessLevelName = computed(() => {
  const level = accessLevels.value.find(l => l.id === settings.value.defaultAccessLevel);
  return level ? level.accessLevelName : 'Not Set';
});

const saveSettings = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    await visitorService.updateVisitorSettings(settings.value);
    originalSettings.value = { ...settings.value };
    showNotification('Settings saved successfully', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving settings', 'error');
  } finally {
    saving.value = false;
  }
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
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card {
  border-radius: 16px;
  overflow: hidden;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.settings-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
}

.setting-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.setting-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.settings-summary {
  background: #f0f4f8;
  border-radius: 12px;
  padding: 16px;
}

.gap-3 {
  gap: 12px;
}

@media (max-width: 960px) {
  .visitor-settings {
    padding: 16px;
  }
}
</style>
