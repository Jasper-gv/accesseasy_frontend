<template>
  <div class="visitor-approvals pa-6">
    <v-container fluid>
      <!-- Header with Filters -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">
            <v-icon icon="mdi-check-circle" class="mr-2" color="primary" />
            Visitor Approvals
          </h1>
          <p class="text-body-1 text-grey-darken-1 mt-2">
            Review and approve visitor registrations
          </p>
        </div>
        
        <v-chip color="warning" variant="tonal" size="large">
          <v-icon icon="mdi-clock-alert" class="mr-2" />
          {{ pendingVisitors.length }} Pending
        </v-chip>
      </div>

      <!-- Filters -->
      <v-card class="filter-card mb-6" elevation="2">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <v-select
                v-model="filters.status"
                :items="statusOptions"
                label="Status"
                prepend-inner-icon="mdi-filter"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.date"
                label="Visit Date"
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                density="comfortable"
                type="date"
                clearable
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="filters.search"
                label="Search by name, phone, or email"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                clearable
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-btn
                color="primary"
                block
                size="large"
                @click="applyFilters"
              >
                Apply
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Bulk Actions -->
      <div v-if="selectedVisitors.length > 0" class="bulk-actions mb-4">
        <v-alert type="info" variant="tonal" prominent>
          <div class="d-flex justify-space-between align-center">
            <span class="font-weight-bold">
              {{ selectedVisitors.length }} visitor(s) selected
            </span>
            <div class="d-flex gap-2">
              <v-btn
                color="success"
                prepend-icon="mdi-check-all"
                @click="bulkApprove"
                :loading="bulkProcessing"
              >
                Approve Selected
              </v-btn>
              <v-btn
                color="error"
                prepend-icon="mdi-close-circle"
                @click="bulkReject"
                :loading="bulkProcessing"
              >
                Reject Selected
              </v-btn>
            </div>
          </div>
        </v-alert>
      </div>

      <!-- Visitors Table -->
      <v-card elevation="2">
        <v-card-text class="pa-0">
          <v-data-table
            v-model="selectedVisitors"
            :headers="headers"
            :items="filteredVisitors"
            :loading="loading"
            item-value="id"
            show-select
            class="visitors-table"
          >
            <!-- Name Column -->
            <template #item.personName="{ item }">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="36" class="mr-3">
                  <span class="text-white font-weight-bold">
                    {{ item.personName.charAt(0) }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.personName }}</div>
                  <div class="text-caption text-grey-darken-1">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <!-- Phone Column -->
            <template #item.mobileNumber="{ item }">
              <v-chip size="small" variant="outlined">
                <v-icon icon="mdi-phone" size="14" class="mr-1" />
                {{ item.mobileNumber }}
              </v-chip>
            </template>

            <!-- Purpose Column -->
            <template #item.purpose="{ item }">
              <v-chip size="small" color="info" variant="tonal">
                {{ item.purpose }}
              </v-chip>
            </template>

            <!-- Visit Date Column -->
            <template #item.visitDate="{ item }">
              <div>
                <div class="font-weight-medium">{{ formatDate(item.visitDate) }}</div>
                <div class="text-caption text-grey-darken-1">
                  {{ item.startTime }} - {{ item.endTime }}
                </div>
              </div>
            </template>

            <!-- Status Column -->
            <template #item.status="{ item }">
              <VisitorStatusBadge :status="item.status" />
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-2">
                <v-btn
                  size="small"
                  color="info"
                  variant="tonal"
                  icon="mdi-eye"
                  @click="viewDetails(item)"
                />
                <v-btn
                  v-if="item.status === 'pending'"
                  size="small"
                  color="success"
                  variant="tonal"
                  icon="mdi-check"
                  @click="approveVisitor(item)"
                />
                <v-btn
                  v-if="item.status === 'pending'"
                  size="small"
                  color="error"
                  variant="tonal"
                  icon="mdi-close"
                  @click="rejectVisitor(item)"
                />
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Detail Drawer -->
    <v-navigation-drawer
      v-model="showDetailDrawer"
      location="right"
      temporary
      width="500"
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

        <v-divider class="mb-4" />

        <!-- Visitor Info -->
        <div class="visitor-info mb-6">
          <div class="text-center mb-4">
            <v-avatar color="primary" size="80">
              <span class="text-h4 text-white font-weight-bold">
                {{ selectedVisitor.personName.charAt(0) }}
              </span>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mt-3">
              {{ selectedVisitor.personName }}
            </h3>
            <VisitorStatusBadge :status="selectedVisitor.status" class="mt-2" />
          </div>

          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-email" />
              </template>
              <v-list-item-title>{{ selectedVisitor.email }}</v-list-item-title>
              <v-list-item-subtitle>Email</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-phone" />
              </template>
              <v-list-item-title>{{ selectedVisitor.mobileNumber }}</v-list-item-title>
              <v-list-item-subtitle>Phone</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-briefcase" />
              </template>
              <v-list-item-title>{{ selectedVisitor.purpose }}</v-list-item-title>
              <v-list-item-subtitle>Purpose</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-account-tie" />
              </template>
              <v-list-item-title>{{ selectedVisitor.hostName || 'N/A' }}</v-list-item-title>
              <v-list-item-subtitle>Host</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-calendar" />
              </template>
              <v-list-item-title>{{ formatDate(selectedVisitor.visitDate) }}</v-list-item-title>
              <v-list-item-subtitle>Visit Date</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-clock" />
              </template>
              <v-list-item-title>
                {{ selectedVisitor.startTime }} - {{ selectedVisitor.endTime }}
              </v-list-item-title>
              <v-list-item-subtitle>Time</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>

        <!-- Actions -->
        <div v-if="selectedVisitor.status === 'pending'" class="actions">
          <v-btn
            color="success"
            block
            size="large"
            prepend-icon="mdi-check-circle"
            @click="approveVisitor(selectedVisitor)"
            class="mb-3"
          >
            Approve Visitor
          </v-btn>
          <v-btn
            color="error"
            block
            size="large"
            prepend-icon="mdi-close-circle"
            @click="rejectVisitor(selectedVisitor)"
          >
            Reject Visitor
          </v-btn>
        </div>

        <!-- QR Code (if approved) -->
        <div v-if="selectedVisitor.status === 'approved' && selectedVisitor.qrCode" class="mt-6">
          <v-divider class="mb-4" />
          <h3 class="text-h6 font-weight-bold mb-3">Visitor QR Code</h3>
          <QRDisplay
            :qr-code="selectedVisitor.qrCode"
            :visitor-data="selectedVisitor"
            :valid-from="`${selectedVisitor.visitDate}T${selectedVisitor.startTime}`"
            :valid-until="`${selectedVisitor.visitDate}T${selectedVisitor.endTime}`"
            :status="selectedVisitor.status"
            :show-actions="false"
          />
        </div>
      </div>
    </v-navigation-drawer>

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
import VisitorStatusBadge from '@/components/visitor/VisitorStatusBadge.vue';
import QRDisplay from '@/components/visitor/QRDisplay.vue';

const emit = defineEmits(['approval-updated']);

const loading = ref(false);
const visitors = ref([]);
const selectedVisitors = ref([]);
const selectedVisitor = ref(null);
const showDetailDrawer = ref(false);
const bulkProcessing = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const filters = ref({
  status: null,
  date: null,
  search: '',
});

const headers = [
  { title: 'Visitor Name', key: 'personName', sortable: true },
  { title: 'Phone', key: 'mobileNumber', sortable: false },
  { title: 'Purpose', key: 'purpose', sortable: true },
  { title: 'Visit Date & Time', key: 'visitDate', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' },
];

const statusOptions = [
  { title: 'All', value: null },
  { title: 'Pending', value: 'pending' },
  { title: 'Approved', value: 'approved' },
  { title: 'Rejected', value: 'rejected' },
];

onMounted(() => {
  fetchVisitors();
});

const fetchVisitors = async () => {
  loading.value = true;
  try {
    visitors.value = await visitorService.getVisitors(filters.value);
  } catch (error) {
    console.error('Error fetching visitors:', error);
  } finally {
    loading.value = false;
  }
};

const pendingVisitors = computed(() => {
  return visitors.value.filter(v => v.status === 'pending');
});

const filteredVisitors = computed(() => {
  return visitors.value;
});

const applyFilters = () => {
  fetchVisitors();
};

const viewDetails = (visitor) => {
  selectedVisitor.value = visitor;
  showDetailDrawer.value = true;
};

const approveVisitor = async (visitor) => {
  try {
    await visitorService.updateVisitorStatus(visitor.id, 'approved', 'Admin User');
    showNotification(`${visitor.personName} approved successfully!`, 'success');
    await fetchVisitors();
    emit('approval-updated');
    showDetailDrawer.value = false;
  } catch (error) {
    console.error('Error approving visitor:', error);
    showNotification('Error approving visitor', 'error');
  }
};

const rejectVisitor = async (visitor) => {
  try {
    await visitorService.updateVisitorStatus(visitor.id, 'rejected', null, 'Not authorized');
    showNotification(`${visitor.personName} rejected`, 'warning');
    await fetchVisitors();
    emit('approval-updated');
    showDetailDrawer.value = false;
  } catch (error) {
    console.error('Error rejecting visitor:', error);
    showNotification('Error rejecting visitor', 'error');
  }
};

const bulkApprove = async () => {
  bulkProcessing.value = true;
  try {
    const ids = selectedVisitors.value.map(v => v.id || v);
    await visitorService.bulkUpdateStatus(ids, 'approved', 'Admin User');
    showNotification(`${ids.length} visitors approved!`, 'success');
    selectedVisitors.value = [];
    await fetchVisitors();
    emit('approval-updated');
  } catch (error) {
    console.error('Error bulk approving:', error);
    showNotification('Error approving visitors', 'error');
  } finally {
    bulkProcessing.value = false;
  }
};

const bulkReject = async () => {
  bulkProcessing.value = true;
  try {
    const ids = selectedVisitors.value.map(v => v.id || v);
    await visitorService.bulkUpdateStatus(ids, 'rejected');
    showNotification(`${ids.length} visitors rejected`, 'warning');
    selectedVisitors.value = [];
    await fetchVisitors();
    emit('approval-updated');
  } catch (error) {
    console.error('Error bulk rejecting:', error);
    showNotification('Error rejecting visitors', 'error');
  } finally {
    bulkProcessing.value = false;
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
.visitor-approvals {
  background: #f5f7fa;
  min-height: 100vh;
}

.filter-card {
  border-radius: 16px;
}

.visitors-table {
  border-radius: 16px;
}

.gap-2 {
  gap: 8px;
}

.visitor-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}
</style>
