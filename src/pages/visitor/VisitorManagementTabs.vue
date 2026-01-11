<template>
  <div class="visitor-management">
    <!-- Role Switcher for Demo -->
    <div class="bg-white px-4 py-2 border-b d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          to="/hq/dashboard"
          class="mr-4"
        >
          Back to HQ
        </v-btn>
        <div class="text-subtitle-2 text-grey">Visitor Management System (Demo)</div>
      </div>
      <div style="width: 200px">
        <v-select
          v-model="userRole"
          :items="['Admin', 'Employee', 'Security']"
          label="Current Role"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-account-convert"
          @update:model-value="handleRoleChange"
        />
      </div>
    </div>

    <v-tabs
      v-model="activeTab"
      bg-color="white"
      color="primary"
      align-tabs="start"
      class="visitor-tabs"
    >
      <v-tab value="dashboard" v-if="canViewDashboard">
        <v-icon icon="mdi-view-dashboard" class="mr-2" />
        Dashboard
      </v-tab>
      
      <v-tab value="request" v-if="canViewNewRequest">
        <v-icon icon="mdi-account-plus" class="mr-2" />
        New Request
      </v-tab>

      <v-tab value="approvals" v-if="canViewApprovals">
        <v-badge
          v-if="pendingCount > 0"
          :content="pendingCount"
          color="error"
          offset-x="10"
          offset-y="-10"
        >
          <v-icon icon="mdi-check-decagram" class="mr-2" />
          Approvals
        </v-badge>
        <template v-else>
          <v-icon icon="mdi-check-decagram" class="mr-2" />
          Approvals
        </template>
      </v-tab>

      <v-tab value="security" v-if="canViewSecurity">
        <v-icon icon="mdi-shield-account" class="mr-2" />
        Security
      </v-tab>

      <v-tab value="templates" v-if="canViewTemplates">
        <v-icon icon="mdi-file-document-edit-outline" class="mr-2" />
        Templates
      </v-tab>

      <v-tab value="links" v-if="canViewLinks">
        <v-icon icon="mdi-link-variant" class="mr-2" />
        Links
      </v-tab>

      <v-tab value="settings" v-if="canViewSettings">
        <v-icon icon="mdi-cog" class="mr-2" />
        Settings
      </v-tab>
    </v-tabs>

    <v-divider />

    <v-window v-model="activeTab" class="visitor-content">
      <v-window-item value="dashboard" v-if="canViewDashboard">
        <VisitorDashboard />
      </v-window-item>

      <v-window-item value="request" v-if="canViewNewRequest">
        <VisitorRequest />
      </v-window-item>

      <v-window-item value="approvals" v-if="canViewApprovals">
        <VisitorApprovals @approval-updated="handleApprovalUpdate" />
      </v-window-item>

      <v-window-item value="security" v-if="canViewSecurity">
        <component 
          :is="currentSecurityView" 
          @change-view="handleSecurityViewChange"
          @close="handleSecurityViewChange('dashboard')"
        />
      </v-window-item>

      <v-window-item value="templates" v-if="canViewTemplates">
        <component 
          :is="currentTemplateView" 
          :mode="templateMode" 
          :templateId="templateId"
          @change-view="handleTemplateViewChange" 
        />
      </v-window-item>

      <v-window-item value="links" v-if="canViewLinks">
        <VisitorLinks />
      </v-window-item>

      <v-window-item value="settings" v-if="canViewSettings">
        <VisitorSettings />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VisitorDashboard from './dashboard/VisitorDashboard.vue';
import VisitorRequest from './request/VisitorRequest.vue';
import VisitorApprovals from './approvals/VisitorApprovals.vue';
import VisitorSettings from './admin/VisitorSettings.vue';
import VisitorTemplates from './admin/VisitorTemplates.vue';
import VisitorTemplateEditor from './admin/VisitorTemplateEditor.vue';
import VisitorFormDesigner from './admin/VisitorFormDesigner.vue';
import VisitorBadgeDesigner from './admin/VisitorBadgeDesigner.vue';
import VisitorSecurityDashboard from './security/VisitorSecurityDashboard.vue';
import VisitorScanner from './security/VisitorScanner.vue';
import VisitorLinks from './admin/VisitorLinks.vue';
import { visitorService } from '@/services/visitorService';

const route = useRoute();
const router = useRouter();

const activeTab = ref('dashboard');
const pendingCount = ref(0);

// Role-based access control (hardcoded for demo)
const userRole = ref('Admin'); 

// Computed properties for tab visibility based on role
const canViewDashboard = computed(() => ['Admin', 'Employee', 'Security'].includes(userRole.value));
const canViewNewRequest = computed(() => ['Employee'].includes(userRole.value));
const canViewApprovals = computed(() => ['Admin', 'Security'].includes(userRole.value));
const canViewSecurity = computed(() => ['Security'].includes(userRole.value));
const canViewTemplates = computed(() => ['Admin'].includes(userRole.value));
const canViewLinks = computed(() => ['Admin'].includes(userRole.value));
const canViewSettings = computed(() => ['Admin'].includes(userRole.value));

// Template view management
const currentTemplateView = shallowRef(VisitorTemplates);
const templateMode = ref('create');
const templateId = ref(null);

const handleTemplateViewChange = (view, params) => {
  console.log('[VisitorManagementTabs] handleTemplateViewChange:', view, params);
  
  if (view === 'list') {
    currentTemplateView.value = VisitorTemplates;
    templateMode.value = 'create';
    templateId.value = null;
  } else if (view === 'create') {
    currentTemplateView.value = VisitorTemplateEditor;
    templateMode.value = 'create';
    templateId.value = null;
  } else if (view === 'edit') {
    currentTemplateView.value = VisitorTemplateEditor;
    templateMode.value = 'edit';
    templateId.value = params?.id || null;
  } else if (view === 'form-designer') {
    currentTemplateView.value = VisitorFormDesigner;
  } else if (view === 'badge-designer') {
    currentTemplateView.value = VisitorBadgeDesigner;
  }
};

// Security view management
const currentSecurityView = shallowRef(VisitorSecurityDashboard);
const handleSecurityViewChange = (view) => {
  if (view === 'dashboard') {
    currentSecurityView.value = VisitorSecurityDashboard;
  } else if (view === 'scanner') {
    currentSecurityView.value = VisitorScanner;
  }
};

onMounted(async () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  }
  await fetchPendingCount();
});

const handleRoleChange = (newRole) => {
  // Reset active tab to dashboard when role changes to ensure valid state
  activeTab.value = 'dashboard';
};

const fetchPendingCount = async () => {
  try {
    const visitors = await visitorService.getVisitors({ status: 'pending' });
    pendingCount.value = visitors.length;
  } catch (error) {
    console.error('Error fetching pending count:', error);
  }
};

const handleApprovalUpdate = () => {
  fetchPendingCount();
};
</script>

<style scoped>
.visitor-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.visitor-tabs {
  flex-shrink: 0;
}

.visitor-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}

:deep(.v-window__container) {
  height: 100%;
}

:deep(.v-window-item) {
  height: 100%;
}
</style>
