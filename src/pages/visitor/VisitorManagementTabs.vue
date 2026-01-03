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
      
      <v-tab value="approvals" v-if="canViewApprovals">
        <v-icon icon="mdi-check-circle" class="mr-2" />
        Approvals
        <v-badge
          v-if="pendingCount > 0"
          :content="pendingCount"
          color="error"
          inline
          class="ml-2"
        />
      </v-tab>

      <v-tab value="scanner" v-if="canViewScanner">
        <v-icon icon="mdi-qrcode-scan" class="mr-2" />
        QR Scanner
      </v-tab>

      <v-tab value="logs" v-if="canViewLogs">
        <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
        Entry Logs
      </v-tab>

      <v-tab value="reception" v-if="canViewReception">
        <v-icon icon="mdi-qrcode" class="mr-2" />
        Reception QR
      </v-tab>

      <v-tab value="generate-link" v-if="canViewGenerateLink">
        <v-icon icon="mdi-link-variant" class="mr-2" />
        Generate Link
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

      <v-window-item value="approvals" v-if="canViewApprovals">
        <VisitorApprovals @approval-updated="handleApprovalUpdate" />
      </v-window-item>

      <v-window-item value="scanner" v-if="canViewScanner">
        <QRScanner />
      </v-window-item>

      <v-window-item value="logs" v-if="canViewLogs">
        <EntryLogs />
      </v-window-item>

      <v-window-item value="reception" v-if="canViewReception">
        <WalkInReception />
      </v-window-item>

      <v-window-item value="generate-link" v-if="canViewGenerateLink">
        <PreSharedLink />
      </v-window-item>

      <v-window-item value="settings" v-if="canViewSettings">
        <VisitorSettings />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VisitorDashboard from './dashboard/VisitorDashboard.vue';
import VisitorApprovals from './approvals/VisitorApprovals.vue';
import QRScanner from './security/QRScanner.vue';
import EntryLogs from './security/EntryLogs.vue';
import WalkInReception from './walkin/WalkInReception.vue';
import PreSharedLink from './preshared/PreSharedLink.vue';
import VisitorSettings from './admin/VisitorSettings.vue';
import { visitorService } from '@/services/visitorService';

const route = useRoute();
const router = useRouter();

const activeTab = ref('dashboard');
const pendingCount = ref(0);

// Role-based access control (hardcoded for demo)
// In production, this would come from auth service
const userRole = ref('Admin'); // Can be: Admin, Security, Manager, Employee

const canViewDashboard = computed(() => ['Admin', 'Manager'].includes(userRole.value));
const canViewApprovals = computed(() => ['Admin', 'Manager'].includes(userRole.value));
const canViewScanner = computed(() => ['Admin', 'Security'].includes(userRole.value));
const canViewLogs = computed(() => ['Admin', 'Security', 'Manager'].includes(userRole.value));
const canViewReception = computed(() => ['Admin', 'Security'].includes(userRole.value));
const canViewGenerateLink = computed(() => ['Admin', 'Manager'].includes(userRole.value));
const canViewSettings = computed(() => ['Admin'].includes(userRole.value));

onMounted(async () => {
  // Set initial tab based on route or user role
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  } else {
    // Default tab based on role
    if (userRole.value === 'Security') {
      activeTab.value = 'scanner';
    } else if (userRole.value === 'Admin' || userRole.value === 'Manager') {
      activeTab.value = 'dashboard';
    }
  }

  // Fetch pending count
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
