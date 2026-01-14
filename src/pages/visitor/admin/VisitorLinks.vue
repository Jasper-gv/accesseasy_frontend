<template>
  <div class="visitor-links pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Public Visitor Links</h2>
        <div class="text-subtitle-2 text-grey-darken-1 mt-1">
          Manage tenant-level public links and QR codes.
        </div>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="createLink"
      >
        Create New Link
      </v-btn>
    </div>

    <v-row>
      <v-col v-for="link in links" :key="link.id" cols="12" md="6" lg="4">
        <v-card variant="outlined" class="h-100 d-flex flex-column">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" rounded>
                <v-icon icon="mdi-link-variant" />
              </v-avatar>
            </template>
            <v-card-title>{{ link.name }}</v-card-title>
            <v-card-subtitle class="text-truncate">
              {{ link.url }}
            </v-card-subtitle>
            <template v-slot:append>
              <v-chip
                size="small"
                :color="link.status === 'active' ? 'success' : 'grey'"
                variant="flat"
              >
                {{ link.status === 'active' ? 'Enabled' : 'Disabled' }}
              </v-chip>
            </template>
          </v-card-item>

          <v-divider />

          <v-card-text class="flex-grow-1 d-flex flex-column align-center justify-center py-6">
            <!-- Mock QR Code Visual -->
            <div class="qr-placeholder bg-grey-lighten-4 pa-4 rounded mb-4">
              <v-icon icon="mdi-qrcode" size="100" color="grey-darken-2" />
            </div>
            <div class="text-caption text-grey">Scan to register</div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <div class="d-flex justify-space-between w-100 gap-2">
              <v-btn
                variant="text"
                size="small"
                color="success"
                prepend-icon="mdi-whatsapp"
                @click="shareLink(link, 'whatsapp')"
              >
                WhatsApp
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                color="primary"
                prepend-icon="mdi-email"
                @click="shareLink(link, 'email')"
              >
                Email
              </v-btn>
              <v-btn
                variant="text"
                size="small"
                color="info"
                prepend-icon="mdi-message-text"
                @click="shareLink(link, 'sms')"
              >
                SMS
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                color="grey-darken-1"
                @click="copyLink(link)"
              >
                <v-icon>mdi-content-copy</v-icon>
                <v-tooltip activator="parent" location="top">Copy Link</v-tooltip>
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create Link Dialog (Mock) -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Create New Link</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newLinkName"
            label="Link Name"
            variant="outlined"
            placeholder="e.g., Main Office Visitor"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveNewLink">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, onMounted } from 'vue';
import { visitorService } from '@/services/visitorService';

const links = ref([]);
const showCreateDialog = ref(false);
const newLinkName = ref('');

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

onMounted(async () => {
  await loadLinks();
});

const loadLinks = async () => {
  try {
    const settings = await visitorService.getVisitorSettings();
    if (settings && settings.public_links) {
      links.value = settings.public_links;
    }
  } catch (error) {
    console.error('Error loading links:', error);
    showNotification('Error loading links', 'error');
  }
};

const createLink = () => {
  newLinkName.value = '';
  showCreateDialog.value = true;
};

const saveNewLink = async () => {
  if (!newLinkName.value) return;
  
  try {
    // Mock creation - in real app would call API
    const newLink = {
      id: Date.now(),
      name: newLinkName.value,
      code: `LINK-${Math.floor(Math.random() * 1000)}`,
      url: `https://visitor.demo.com/${newLinkName.value.toLowerCase().replace(/\s+/g, '-')}`,
      status: 'active',
      qrCode: 'mock-qr'
    };
    
    // Update local state for demo
    links.value.push(newLink);
    
    // Update service mock data
    const settings = await visitorService.getVisitorSettings();
    settings.public_links = links.value;
    await visitorService.updateVisitorSettings(settings);
    
    showCreateDialog.value = false;
    showNotification('Link created successfully', 'success');
  } catch (error) {
    console.error('Error creating link:', error);
    showNotification('Error creating link', 'error');
  }
};

const shareLink = (link, method) => {
  let message = `Please register using this link: ${link.url}`;
  
  if (method === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    showNotification('Opened WhatsApp', 'success');
  } else if (method === 'email') {
    window.open(`mailto:?subject=Visitor Registration&body=${encodeURIComponent(message)}`, '_blank');
    showNotification('Opened Email Client', 'success');
  } else if (method === 'sms') {
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
    showNotification('Opened SMS App', 'success');
  }
};

const copyLink = (link) => {
  navigator.clipboard.writeText(link.url);
  showNotification('Link copied to clipboard', 'success');
};

const showNotification = (message, type = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = type;
  snackbarIcon.value = type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle';
  showSnackbar.value = true;
};
</script>

<style scoped>
.visitor-links {
  max-width: 100%;
}

.qr-placeholder {
  border: 2px dashed #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-2 {
  gap: 8px;
}
</style>
