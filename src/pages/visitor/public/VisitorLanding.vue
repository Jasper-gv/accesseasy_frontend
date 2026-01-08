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

        <v-list class="template-list">
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
import { useRouter } from 'vue-router';
import { visitorService } from '@/services/visitorService';

const router = useRouter();
const templates = ref([]);

onMounted(async () => {
  await loadTemplates();
});

const loadTemplates = async () => {
  try {
    // In a real public page, we'd fetch only active public templates
    const data = await visitorService.getVisitorTemplates();
    templates.value = data.filter(t => t.status === 'active');
  } catch (error) {
    console.error('Error loading templates:', error);
  }
};

const selectTemplate = (template) => {
  // Navigate to registration form with template ID
  // For now, we'll just log it as we haven't implemented the route yet
  console.log('Selected template:', template);
  // router.push({ name: 'visitor-registration', params: { templateId: template.id } });
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
