<template>
  <div class="pre-shared-link pa-6">
    <v-container fluid>
      <!-- Header -->
      <h1 class="text-h4 font-weight-bold mb-4">
        <v-icon icon="mdi-link-variant" class="mr-2" color="primary" />
        Generate Pre-shared Registration Link
      </h1>
      <p class="text-body-1 text-grey-darken-1 mb-6">
        Create and share visitor registration links via email or SMS
      </p>

      <v-row>
        <!-- Generate Link Form -->
        <v-col cols="12" md="6">
          <v-card elevation="2">
            <v-card-title class="font-weight-bold">
              <v-icon icon="mdi-link-plus" class="mr-2" color="primary" />
              Create New Link
            </v-card-title>
            <v-card-text>
              <v-form ref="formRef" @submit.prevent="generateLink">
                <v-text-field
                  v-model="linkData.hostName"
                  label="Host Name (Pre-fill)"
                  prepend-inner-icon="mdi-account-tie"
                  variant="outlined"
                  density="comfortable"
                  hint="This will be pre-filled in the registration form"
                  persistent-hint
                  class="mb-4"
                />

                <v-select
                  v-model="linkData.purpose"
                  :items="purposeOptions"
                  label="Purpose (Pre-fill)"
                  prepend-inner-icon="mdi-briefcase"
                  variant="outlined"
                  density="comfortable"
                  hint="Pre-select the visit purpose"
                  persistent-hint
                  class="mb-4"
                />

                <v-select
                  v-model="linkData.expiryHours"
                  :items="expiryOptions"
                  label="Link Expiry"
                  prepend-inner-icon="mdi-clock-outline"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  block
                  size="large"
                  prepend-icon="mdi-link-variant-plus"
                  :loading="generating"
                >
                  Generate Link
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Generated Link Display -->
          <v-card v-if="generatedLink" class="mt-4" color="success" variant="tonal" elevation="2">
            <v-card-text>
              <h3 class="text-h6 font-weight-bold mb-3">
                <v-icon icon="mdi-check-circle" class="mr-2" />
                Link Generated Successfully!
              </h3>

              <v-text-field
                :model-value="generatedLinkUrl"
                label="Registration Link"
                prepend-inner-icon="mdi-link"
                variant="outlined"
                readonly
                class="mb-3"
              >
                <template #append-inner>
                  <v-btn
                    icon="mdi-content-copy"
                    variant="text"
                    @click="copyLink"
                  />
                </template>
              </v-text-field>

              <v-divider class="my-4" />

              <h4 class="text-subtitle-1 font-weight-bold mb-3">Share via:</h4>

              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="shareEmail"
                    label="Email Address"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    density="comfortable"
                    type="email"
                  />
                  <v-btn
                    color="primary"
                    block
                    prepend-icon="mdi-email-send"
                    @click="sendViaEmail"
                    :loading="sending"
                    class="mb-3"
                  >
                    Send via Email
                  </v-btn>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="shareSMS"
                    label="Phone Number"
                    prepend-inner-icon="mdi-phone"
                    variant="outlined"
                    density="comfortable"
                    type="tel"
                  />
                  <v-btn
                    color="secondary"
                    block
                    prepend-icon="mdi-message-text"
                    @click="sendViaSMS"
                    :loading="sending"
                    class="mb-3"
                  >
                    Send via SMS
                  </v-btn>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="shareWhatsApp"
                    label="WhatsApp Number"
                    prepend-inner-icon="mdi-whatsapp"
                    variant="outlined"
                    density="comfortable"
                    type="tel"
                    hint="Include country code (e.g., 15551234567)"
                  />
                  <v-btn
                    color="success"
                    block
                    prepend-icon="mdi-whatsapp"
                    @click="sendViaWhatsApp"
                    :loading="sending"
                  >
                    Send via WhatsApp
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Link History -->
        <v-col cols="12" md="6">
          <v-card elevation="2">
            <v-card-title class="font-weight-bold">
              <v-icon icon="mdi-history" class="mr-2" color="info" />
              Link History
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="link in linkHistory"
                  :key="link.id"
                  class="mb-2"
                >
                  <template #prepend>
                    <v-avatar :color="link.used ? 'success' : 'warning'" size="40">
                      <v-icon
                        :icon="link.used ? 'mdi-check' : 'mdi-clock-outline'"
                        color="white"
                      />
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ link.token }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Generated: {{ formatDateTime(link.generatedAt) }}
                    <br />
                    Expires: {{ formatDateTime(link.expiresAt) }}
                    <br />
                    {{ link.used ? `Used: ${formatDateTime(link.usedAt)}` : 'Not used yet' }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="d-flex flex-column align-end gap-2">
                      <v-chip
                        :color="link.used ? 'success' : isExpired(link.expiresAt) ? 'error' : 'warning'"
                        size="small"
                        variant="tonal"
                      >
                        {{ link.used ? 'Used' : isExpired(link.expiresAt) ? 'Expired' : 'Active' }}
                      </v-chip>
                      <v-btn
                        v-if="!link.used && !isExpired(link.expiresAt)"
                        size="x-small"
                        color="primary"
                        variant="outlined"
                        @click="copyLinkUrl(link.token)"
                      >
                        Copy Link
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
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
import { visitorService } from '@/services/visitorService';

const formRef = ref(null);
const generating = ref(false);
const sending = ref(false);
const generatedLink = ref(null);
const linkHistory = ref([]);
const shareEmail = ref('');
const shareSMS = ref('');
const shareWhatsApp = ref('');
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const linkData = ref({
  hostName: '',
  purpose: '',
  expiryHours: 48,
});

const purposeOptions = [
  'Meeting',
  'Interview',
  'Delivery',
  'Maintenance',
  'Contractor',
  'Other',
];

const expiryOptions = [
  { title: '24 Hours', value: 24 },
  { title: '48 Hours', value: 48 },
  { title: '7 Days', value: 168 },
  { title: '30 Days', value: 720 },
];

onMounted(() => {
  fetchLinkHistory();
});

const generatedLinkUrl = computed(() => {
  if (!generatedLink.value) return '';
  return `${window.location.origin}/visitor-register?token=${generatedLink.value.token}&type=pre-shared`;
});

const generateLink = async () => {
  generating.value = true;
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + linkData.value.expiryHours);

    const result = await visitorService.generatePreSharedLink({
      generatedBy: 'Admin User',
      expiresAt: expiresAt.toISOString(),
      preFilledData: {
        hostName: linkData.value.hostName,
        purpose: linkData.value.purpose,
      },
    });

    if (result.success) {
      generatedLink.value = result.data;
      showNotification('Link generated successfully!', 'success');
      await fetchLinkHistory();
    }
  } catch (error) {
    console.error('Error generating link:', error);
    showNotification('Error generating link', 'error');
  } finally {
    generating.value = false;
  }
};

const fetchLinkHistory = async () => {
  try {
    linkHistory.value = await visitorService.getPreSharedLinks();
  } catch (error) {
    console.error('Error fetching link history:', error);
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(generatedLinkUrl.value);
  showNotification('Link copied to clipboard!', 'success');
};

const copyLinkUrl = (token) => {
  const url = `${window.location.origin}/visitor-register?token=${token}&type=pre-shared`;
  navigator.clipboard.writeText(url);
  showNotification('Link copied to clipboard!', 'success');
};

const sendViaEmail = () => {
  if (!shareEmail.value) {
    showNotification('Please enter an email address', 'warning');
    return;
  }
  
  const subject = encodeURIComponent('Visitor Registration Link');
  const body = encodeURIComponent(`Please register for your visit using this link: ${generatedLinkUrl.value}`);
  window.open(`mailto:${shareEmail.value}?subject=${subject}&body=${body}`, '_blank');
  
  showNotification(`Email client opened for ${shareEmail.value}`, 'success');
  shareEmail.value = '';
};

const sendViaSMS = () => {
  if (!shareSMS.value) {
    showNotification('Please enter a phone number', 'warning');
    return;
  }
  
  const body = encodeURIComponent(`Please register for your visit: ${generatedLinkUrl.value}`);
  // Detect iOS to use the correct separator
  const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
  window.open(`sms:${shareSMS.value}${separator}body=${body}`, '_blank');
  
  showNotification(`SMS app opened for ${shareSMS.value}`, 'success');
  shareSMS.value = '';
};

const sendViaWhatsApp = () => {
  if (!shareWhatsApp.value) {
    showNotification('Please enter a WhatsApp number', 'warning');
    return;
  }

  // Remove any non-numeric characters from the phone number
  const cleanNumber = shareWhatsApp.value.replace(/\D/g, '');
  
  const text = encodeURIComponent(`Please register for your visit using this link: ${generatedLinkUrl.value}`);
  window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  
  showNotification(`WhatsApp opened for ${shareWhatsApp.value}`, 'success');
  shareWhatsApp.value = '';
};

const isExpired = (expiresAt) => {
  return new Date(expiresAt) < new Date();
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
.pre-shared-link {
  background: #f5f7fa;
  min-height: 100vh;
}

.gap-2 {
  gap: 8px;
}
</style>
