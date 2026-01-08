<template>
  <div class="visitor-management">
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
      
      <v-tab value="request">
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

      <v-tab value="logs" v-if="canViewLogs">
        <v-icon icon="mdi-history" class="mr-2" />
        Logs
      </v-tab>

      <v-tab value="templates" v-if="canViewSettings">
        <v-icon icon="mdi-file-document-edit-outline" class="mr-2" />
        Templates
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

      <v-window-item value="request">
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

      <v-window-item value="logs" v-if="canViewLogs">
        <EntryLogs />
      </v-window-item>

      <v-window-item value="templates" v-if="canViewSettings">
        <!-- Simple view switching for demo purposes, normally would use router-view -->
        <component 
          :is="currentTemplateView" 
          :mode="templateMode" 
          :templateId="templateId"
          @change-view="handleTemplateViewChange" 
        />
      </v-window-item>

      <v-window-item value="settings" v-if="canViewSettings">
        <VisitorSettings />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VisitorDashboard from './dashboard/VisitorDashboard.vue';
import VisitorRequest from './request/VisitorRequest.vue';
import VisitorApprovals from './approvals/VisitorApprovals.vue';
import EntryLogs from './security/EntryLogs.vue';
import VisitorSettings from './admin/VisitorSettings.vue';
import VisitorTemplates from './admin/VisitorTemplates.vue';
import VisitorTemplateEditor from './admin/VisitorTemplateEditor.vue';
import VisitorFormDesigner from './admin/VisitorFormDesigner.vue';
import VisitorBadgeDesigner from './admin/VisitorBadgeDesigner.vue';
import VisitorSecurityDashboard from './security/VisitorSecurityDashboard.vue';
import VisitorScanner from './security/VisitorScanner.vue';
import { visitorService } from '@/services/visitorService';

const route = useRoute();
const router = useRouter();

const activeTab = ref('dashboard');
const pendingCount = ref(0);

// Role-based access control (hardcoded for demo)
const userRole = ref('Admin'); 

const canViewDashboard = computed(() => ['Admin', 'Manager'].includes(userRole.value));
const canViewApprovals = computed(() => ['Admin', 'Manager', 'Security'].includes(userRole.value));
const canViewSecurity = computed(() => ['Admin', 'Security'].includes(userRole.value));
const canViewLogs = computed(() => ['Admin', 'Security', 'Manager'].includes(userRole.value));
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
  } else if (view === 'logs') {
    // We can reuse the main logs component or a simplified one
    // For now, let's switch to the main logs tab if we want, or keep it inside
    // But since tabs are top-level, switching tab is better if we want to reuse VisitorLogs
    // However, for the "Security Panel" flow, it might be better to have a self-contained view
    // Let's assume we have a simplified log view or just redirect to the logs tab
    activeTab.value = 'logs';
  }
};

onMounted(async () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  } else {
    if (userRole.value === 'Security') {
      activeTab.value = 'security';
    } else if (userRole.value === 'Admin' || userRole.value === 'Manager') {
      activeTab.value = 'dashboard';
    }
  }

  await fetchPendingCount();
});

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
