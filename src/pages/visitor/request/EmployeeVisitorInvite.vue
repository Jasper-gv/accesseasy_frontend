<template>
  <div class="employee-invite h-100 d-flex flex-column bg-grey-lighten-5">
    <v-container fluid class="fill-height pa-0">
      <v-row class="fill-height ma-0">
        <!-- Left Side: Template Selection -->
        <v-col cols="12" md="4" lg="3" class="border-r bg-white pa-0 d-flex flex-column">
          <div class="pa-4 border-b">
            <h2 class="text-h6 font-weight-bold">Invite Visitor</h2>
            <div class="text-caption text-grey-darken-1 mb-4">Select an event to invite visitors to</div>
            
            <v-select
              v-model="selectedBranch"
              :items="branches"
              item-title="title"
              item-value="value"
              label="Select Branch"
              variant="outlined"
              density="compact"
              hide-details
              prepend-inner-icon="mdi-domain"
              class="mb-2"
              return-object
            />
          </div>
          
          <div class="overflow-y-auto flex-grow-1 pa-4">
            <div v-if="loadingTemplates" class="d-flex justify-center pa-4">
              <v-progress-circular indeterminate color="primary" />
            </div>
            
            <div v-else-if="templates.length === 0" class="text-center pa-4 text-grey">
              No active events available.
            </div>

            <v-card
              v-for="template in filteredTemplates"
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
                  <v-chip size="x-small" color="primary" variant="flat">
                    QR Entry
                  </v-chip>
                  <v-chip size="x-small" color="info" variant="flat">
                    Link Entry
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <!-- Right Side: Invite Generation -->
        <v-col cols="12" md="8" lg="9" class="pa-0 d-flex flex-column bg-grey-lighten-5">
          <div v-if="!selectedTemplate" class="fill-height d-flex flex-column align-center justify-center text-grey">
            <v-icon icon="mdi-account-plus-outline" size="64" class="mb-4 opacity-50" />
            <div class="text-h6">Select an event to start</div>
            <div class="text-body-2">Choose an event from the list on the left</div>
          </div>

          <div v-else class="fill-height d-flex flex-column">
            <!-- Header -->
            <div class="pa-6 pb-2">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <h1 class="text-h5 font-weight-bold">Invite to {{ selectedTemplate.name }}</h1>
                  <div class="text-body-2 text-grey-darken-1 mt-1">
                    Generate a unique invite for your visitor.
                  </div>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-grow-1 overflow-y-auto px-6 pb-6">
              <v-card class="mx-auto" max-width="600">
                <v-card-text class="pa-6">
                  <v-form ref="formRef" @submit.prevent="generateInvite">
                    <div class="text-subtitle-1 font-weight-bold mb-4">Visitor Details (Optional)</div>
                    <div class="text-caption text-grey mb-4">
                      Pre-filling details makes it easier for your visitor.
                    </div>

                    <v-text-field
                      v-model="inviteData.visitorName"
                      label="Visitor Name"
                      placeholder="e.g. John Doe"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account"
                    />

                    <v-text-field
                      v-model="inviteData.visitorEmail"
                      label="Visitor Email"
                      placeholder="e.g. john@example.com"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-email"
                      type="email"
                    />

                    <v-btn
                      block
                      color="primary"
                      size="large"
                      type="submit"
                      :loading="generating"
                      class="mt-6"
                      prepend-icon="mdi-creation"
                    >
                      Generate Invite
                    </v-btn>
                  </v-form>

                  <!-- Generated Result -->
                  <v-expand-transition>
                    <div v-if="generatedInvite" class="mt-8 pt-6 border-t">
                      <div class="d-flex align-center justify-center mb-6">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold mb-1">Invite Generated!</div>
                          <div class="text-caption text-success">Ready to share</div>
                        </div>
                      </div>

                      <div class="bg-grey-lighten-4 rounded-lg pa-4 mb-4">
                        <div class="d-flex align-center bg-white rounded px-3 py-2 border mb-3">
                          <div class="text-truncate flex-grow-1 mr-2 text-body-2">
                            {{ generatedInvite.url }}
                          </div>
                          <v-btn
                            icon="mdi-content-copy"
                            variant="text"
                            size="small"
                            color="primary"
                            @click="copyLink(generatedInvite.url)"
                          >
                            <v-tooltip activator="parent" location="top">Copy Link</v-tooltip>
                          </v-btn>
                        </div>

                        <div class="d-flex justify-center mb-4" v-if="generatedInvite.qrCode">
                           <img :src="generatedInvite.qrCode" alt="Invite QR" style="width: 150px; height: 150px;" class="bg-white pa-2 rounded border" />
                        </div>

                        <div class="d-flex gap-2">
                          <v-btn
                            flex-grow-1
                            variant="outlined"
                            prepend-icon="mdi-whatsapp"
                            color="success"
                            @click="shareWhatsapp(generatedInvite.url)"
                            block
                          >
                            WhatsApp
                          </v-btn>
                          <v-btn
                            flex-grow-1
                            variant="outlined"
                            prepend-icon="mdi-email-outline"
                            color="info"
                            @click="shareEmail(generatedInvite.url)"
                            block
                          >
                            Email
                          </v-btn>
                          <v-btn
                            flex-grow-1
                            variant="outlined"
                            prepend-icon="mdi-message-text-outline"
                            color="secondary"
                            @click="shareSMS(generatedInvite.url)"
                            block
                          >
                            SMS
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </v-expand-transition>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

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
import QRCode from 'qrcode';
import { visitorService } from '@/services/visitorService';

const templates = ref([]);
const branches = ref([]);
const selectedBranch = ref(null);
const selectedTemplate = ref(null);
const loadingTemplates = ref(false);
const generating = ref(false);
const generatedInvite = ref(null);

const inviteData = ref({
  visitorName: '',
  visitorEmail: '',
});

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

onMounted(async () => {
  await Promise.all([
    loadBranches(),
    loadTemplates()
  ]);
});

const loadBranches = async () => {
  try {
    const data = await visitorService.getBranches();
    branches.value = data;
    if (data.length > 0) {
      selectedBranch.value = data[0];
    }
  } catch (error) {
    console.error('Error loading branches:', error);
  }
};

const loadTemplates = async () => {
  loadingTemplates.value = true;
  try {
    const data = await visitorService.getVisitorTemplates();
    // Filter for active templates
    templates.value = data.filter(t => t.status === 'active');
  } catch (error) {
    console.error('Error loading templates:', error);
    showNotification('Error loading events', 'error');
  } finally {
    loadingTemplates.value = false;
  }
};

const filteredTemplates = computed(() => {
  if (!selectedBranch.value) return [];
  
  return templates.value.filter(t => {
    // If scope is 'all', show it
    if (t.branchScope === 'all') return true;
    
    // If scope is 'specific', check if selected branch is in the list
    if (t.branchScope === 'specific' && t.selectedBranches) {
      return t.selectedBranches.includes(selectedBranch.value.value);
    }
    
    return false;
  });
});

const selectTemplate = (template) => {
  selectedTemplate.value = template;
  generatedInvite.value = null;
  inviteData.value = { visitorName: '', visitorEmail: '' };
};

const generateInvite = async () => {
  generating.value = true;
  try {
    const result = await visitorService.generatePublicLink(selectedTemplate.value.id);
    
    if (result.success) {
      const url = result.link;
      const qrCode = await QRCode.toDataURL(url, { width: 200, margin: 1 });
      
      generatedInvite.value = {
        url,
        qrCode,
        id: result.token
      };
      
      showNotification('Invite generated successfully', 'success');
    }
  } catch (error) {
    console.error('Error generating invite:', error);
    showNotification('Error generating invite', 'error');
  } finally {
    generating.value = false;
  }
};

const copyLink = (url) => {
  navigator.clipboard.writeText(url);
  showNotification('Link copied to clipboard', 'success');
};

const shareWhatsapp = (url) => {
  const text = `Hi ${inviteData.value.visitorName || 'there'}, please use this link to register for your visit: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

const shareEmail = (url) => {
  const subject = `Invitation to visit`;
  const body = `Hi ${inviteData.value.visitorName || 'there'},\n\nPlease use this link to register for your visit:\n${url}`;
  window.location.href = `mailto:${inviteData.value.visitorEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const shareSMS = (url) => {
  const body = `Hi ${inviteData.value.visitorName || 'there'}, please register here: ${url}`;
  window.location.href = `sms:?body=${encodeURIComponent(body)}`;
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
.employee-invite {
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
