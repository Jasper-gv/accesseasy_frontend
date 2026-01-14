<template>
  <div class="visitor-landing d-flex flex-column align-center justify-center h-100 bg-grey-lighten-4">
    <v-card class="landing-card elevation-4 rounded-lg overflow-hidden" width="100%" max-width="480">
      <!-- Branding Header -->
      <div class="branding-header bg-primary pa-6 text-center">
        <v-avatar color="white" size="80" class="mb-4 elevation-2">
          <v-icon icon="mdi-domain" size="40" color="primary" />
        </v-avatar>
        <h1 class="text-h5 font-weight-bold text-white">Acme Corp</h1>
        <div class="text-subtitle-2 text-white opacity-80">Visitor Registration</div>
      </div>

      <v-card-text class="pa-6">
        <div class="text-center mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">Welcome!</h2>
          <div class="text-body-2 text-grey-darken-1">
            Please select the purpose of your visit to proceed with registration.
          </div>
        </div>

        <div v-if="loading" class="d-flex justify-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="error" class="pa-4">
          <v-alert
            type="error"
            variant="tonal"
            :text="error"
            icon="mdi-alert-circle"
          ></v-alert>
          <div class="text-center mt-4">
             <v-btn variant="text" color="primary" @click="error = null; loadTemplates()">
               View All Options
             </v-btn>
          </div>
        </div>

        <v-list v-else class="template-list">
          <v-list-item
            v-for="template in templates"
            :key="template.id"
            class="template-item mb-3 rounded border"
            @click="selectTemplate(template)"
            elevation="0"
            hover
          >
            <template v-slot:prepend>
              <v-avatar color="primary-lighten-5" class="mr-3">
                <v-icon color="primary" icon="mdi-account-arrow-right" />
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{ template.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ template.description }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-icon icon="mdi-chevron-right" color="grey" />
            </template>
          </v-list-item>
        </v-list>

        <div class="text-center mt-6">
          <v-btn variant="text" color="primary" size="small" prepend-icon="mdi-qrcode-scan">
            I have a QR Code
          </v-btn>
        </div>
      </v-card-text>
      
      <v-divider />
      
      <div class="pa-4 text-center text-caption text-grey">
        Powered by Axios EC
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { visitorService } from '@/services/visitorService';

const router = useRouter();
const route = useRoute();
const templates = ref([]);
const loading = ref(true);

const error = ref(null);

onMounted(async () => {
  await handleEntry();
});

const handleEntry = async () => {
  loading.value = true;
  error.value = null;
  const { code, site, qr_id } = route.query;

  try {
    if (code) {
      console.log('Processing link code:', code);
      // Directly route to registration with the code
      router.push({ path: '/visitor/register', query: { code } });
      return;
    } 
    
    if (qr_id) {
      console.log('Processing QR ID:', qr_id);
      const template = await visitorService.getVisitorTemplateByQrId(qr_id);
      
      if (template) {
        router.push({ path: '/visitor/register', query: { templateId: template.id } });
        return;
      } else {
        error.value = 'No active template found for this QR code.';
        loading.value = false;
        return;
      }
    }

    if (site) {
      console.log('Processing site code:', site);
    }

    // Default: Load all active public templates
    await loadTemplates();
  } catch (err) {
    console.error('Error handling entry:', err);
    error.value = 'An error occurred while processing your request.';
  } finally {
    if (!error.value) loading.value = false;
  }
};

const loadTemplates = async () => {
  try {
    // In a real public page, we'd fetch only active public templates
    const data = await visitorService.getVisitorTemplates();
    templates.value = data.filter(t => t.status === 'active');
  } catch (err) {
    console.error('Error loading templates:', err);
    error.value = 'Failed to load visitor templates.';
  }
};

const selectTemplate = (template) => {
  router.push({ path: '/visitor/register', query: { templateId: template.id } });
};
</script>

<style scoped>
.visitor-landing {
  min-height: 100vh;
}

.template-item {
  border-color: #e0e0e0 !important;
  transition: all 0.2s;
}

.template-item:hover {
  border-color: #667eea !important;
  background-color: #f0f4ff;
}

.bg-primary-lighten-5 {
  background-color: #e8eaf6 !important;
}
</style>
