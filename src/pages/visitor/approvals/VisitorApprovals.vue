<template>
  <div class="visitor-approvals pa-6">
    <v-container fluid>
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">
            <v-icon icon="mdi-check-circle" class="mr-2" color="primary" />
            Visitor Approvals
          </h1>
          <p class="text-body-1 text-grey-darken-1 mt-2">
            Manage pending visitor access requests
          </p>
        </div>
        
        <v-chip color="warning" variant="tonal" size="large">
          <v-icon icon="mdi-clock-alert" class="mr-2" />
          {{ pendingVisitors.length }} Pending
        </v-chip>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center pa-12">
        <v-progress-circular indeterminate color="primary" size="64" />
      </div>

      <!-- Empty State -->
      <div v-else-if="pendingVisitors.length === 0" class="text-center pa-12 bg-white rounded-lg elevation-1">
        <v-icon icon="mdi-check-all" size="64" color="success" class="mb-4" />
        <h3 class="text-h6 font-weight-bold">All Caught Up!</h3>
        <div class="text-body-1 text-grey">No pending visitor requests at the moment.</div>
      </div>

      <!-- Approval Cards Grid -->
      <v-row v-else>
        <v-col
          v-for="visitor in pendingVisitors"
          :key="visitor.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card elevation="2" class="approval-card h-100 d-flex flex-column">
            <div class="pa-4 d-flex justify-space-between align-start">
              <div class="d-flex align-center">
                <v-avatar color="primary-lighten-5" size="48" class="mr-3">
                  <span class="text-h6 font-weight-bold text-primary">
                    {{ visitor.personName.charAt(0) }}
                  </span>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">{{ visitor.personName }}</div>
                  <div class="text-caption text-grey-darken-1">{{ visitor.company || 'No Company' }}</div>
                </div>
              </div>
              <v-chip size="small" color="warning" variant="flat">Pending</v-chip>
            </div>

            <v-divider />

            <v-card-text class="flex-grow-1">
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-calendar" size="small" class="mr-2 text-grey" />
                <span class="text-body-2">{{ formatDate(visitor.visitDate) }}</span>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-clock-outline" size="small" class="mr-2 text-grey" />
                <span class="text-body-2">{{ visitor.startTime }} - {{ visitor.endTime }}</span>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-briefcase-outline" size="small" class="mr-2 text-grey" />
                <span class="text-body-2">{{ visitor.purpose }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon icon="mdi-account-tie-outline" size="small" class="mr-2 text-grey" />
                <span class="text-body-2">Host: {{ visitor.hostName }}</span>
              </div>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4 bg-grey-lighten-5">
              <v-btn
                variant="text"
                color="info"
                class="flex-grow-1"
                prepend-icon="mdi-eye"
                @click="viewDetails(visitor)"
              >
                Details
              </v-btn>
              <v-divider vertical class="mx-2" />
              <v-btn
                variant="text"
                color="error"
                class="flex-grow-1"
                icon="mdi-close"
                @click="confirmReject(visitor)"
              />
              <v-btn
                variant="text"
                color="success"
                class="flex-grow-1"
                icon="mdi-check"
                @click="confirmApprove(visitor)"
              />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Detail Drawer -->
    <v-navigation-drawer
      v-model="showDetailDrawer"
      location="right"
      temporary
      width="600"
    >
      <div v-if="selectedVisitor" class="pa-6">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h5 font-weight-bold">Visitor Details</h2>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showDetailDrawer = false"
          />
        </div>

        <VisitorDetails :visitor-id="selectedVisitor.id" />

        <div class="mt-6 d-flex gap-2">
           <v-btn
            color="error"
            variant="outlined"
            class="flex-grow-1"
            prepend-icon="mdi-close"
            @click="confirmReject(selectedVisitor)"
          >
            Reject
          </v-btn>
          <v-btn
            color="success"
            class="flex-grow-1"
            prepend-icon="mdi-check"
            @click="confirmApprove(selectedVisitor)"
          >
            Approve
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold pa-4">
          {{ confirmAction === 'approve' ? 'Approve Visitor?' : 'Reject Visitor?' }}
        </v-card-title>
        <v-card-text class="pt-0">
          Are you sure you want to {{ confirmAction }} <strong>{{ selectedVisitor?.personName }}</strong>?
          <v-textarea
            v-if="confirmAction === 'reject'"
            v-model="rejectionReason"
            label="Reason for rejection (optional)"
            variant="outlined"
            rows="2"
            class="mt-4"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="showConfirmDialog = false">Cancel</v-btn>
          <v-btn
            :color="confirmAction === 'approve' ? 'success' : 'error'"
            variant="elevated"
            :loading="processing"
            @click="processAction"
          >
            Confirm
          </v-btn>
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
import { ref, computed, onMounted } from 'vue';
import { visitorService } from '@/services/visitorService';
import VisitorDetails from '@/pages/visitor/details/VisitorDetails.vue';

const emit = defineEmits(['approval-updated']);

const loading = ref(false);
const visitors = ref([]);
const showConfirmDialog = ref(false);
const showDetailDrawer = ref(false);
const confirmAction = ref('approve'); // 'approve' or 'reject'
const selectedVisitor = ref(null);
const rejectionReason = ref('');
const processing = ref(false);

const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

onMounted(() => {
  fetchVisitors();
});

const fetchVisitors = async () => {
  loading.value = true;
  try {
    visitors.value = await visitorService.getVisitors({ status: 'pending' });
  } catch (error) {
    console.error('Error fetching visitors:', error);
  } finally {
    loading.value = false;
  }
};

const pendingVisitors = computed(() => visitors.value);

const viewDetails = (visitor) => {
  selectedVisitor.value = visitor;
  showDetailDrawer.value = true;
};

const confirmApprove = (visitor) => {
  selectedVisitor.value = visitor;
  confirmAction.value = 'approve';
  showConfirmDialog.value = true;
};

const confirmReject = (visitor) => {
  selectedVisitor.value = visitor;
  confirmAction.value = 'reject';
  rejectionReason.value = '';
  showConfirmDialog.value = true;
};

const processAction = async () => {
  if (!selectedVisitor.value) return;

  processing.value = true;
  try {
    if (confirmAction.value === 'approve') {
      await visitorService.updateVisitorStatus(selectedVisitor.value.id, 'approved', 'Approver');
      showNotification(`${selectedVisitor.value.personName} approved`, 'success');
    } else {
      await visitorService.updateVisitorStatus(selectedVisitor.value.id, 'rejected', null, rejectionReason.value);
      showNotification(`${selectedVisitor.value.personName} rejected`, 'info');
    }
    
    await fetchVisitors();
    emit('approval-updated');
    showConfirmDialog.value = false;
  } catch (error) {
    console.error(`Error ${confirmAction.value}ing visitor:`, error);
    showNotification(`Error processing request`, 'error');
  } finally {
    processing.value = false;
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
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
.visitor-approvals {
  background: #f5f7fa;
  min-height: 100vh;
}

.approval-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.approval-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}

.bg-primary-lighten-5 {
  background-color: #e8eaf6 !important;
}
</style>
