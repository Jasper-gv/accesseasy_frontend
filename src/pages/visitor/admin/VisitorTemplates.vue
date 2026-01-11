<template>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Visitor Processes</h2>
        <div class="text-subtitle-2 text-grey-darken-1 mt-1">
          Manage visitor entry processes, events, and scenarios.
        </div>
      </div>
      <div>
        <BaseButton
          variant="primary"
          prepend-icon="mdi-plus"
          @click="createTemplate"
        >
          Create New Process
        </BaseButton>
      </div>
    </div>

    <div class="d-flex gap-4 mb-4">
      <div style="width: 200px;">
        <v-select
          v-model="typeFilter"
          :items="['All', 'Standard', 'Event', 'Contractor', 'Delivery']"
          label="Filter by Type"
          variant="outlined"
          density="compact"
          hide-details
        />
      </div>
      <div style="width: 300px;">
        <v-autocomplete
          v-model="selectedBranch"
          :items="branches"
          item-title="title"
          item-value="value"
          label="Search Branch"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          placeholder="Filter by branch"
        />
      </div>
    </div>

    <v-card variant="outlined" class="table-card">
      <v-data-table
        :headers="headers"
        :items="filteredTemplates"
        :loading="loading"
        hover
      >
        <!-- Template Name & Description -->
        <template v-slot:item.name="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption text-grey-darken-1">{{ item.description }}</div>
            <div class="mt-1 d-flex gap-2">
              <v-chip size="x-small" variant="outlined" class="mr-1">
                {{ item.branchScope === 'specific' ? `${item.selectedBranches?.length || 0} Branches` : 'All Branches' }}
              </v-chip>
              <v-chip size="x-small" color="primary" variant="flat" v-if="item.processType === 'Event'">
                Event
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Type & Validity -->
        <template v-slot:item.type="{ item }">
          <div class="text-body-2">{{ item.processType || 'Standard' }}</div>
          <div v-if="item.processType === 'Event' && item.validityStart" class="text-caption text-grey">
            {{ formatDate(item.validityStart) }} - {{ formatDate(item.validityEnd) }}
          </div>
        </template>

        <!-- Features (QR, Link, Approval) -->
        <template v-slot:item.features="{ item }">
          <div class="d-flex gap-2">
            <v-chip
              v-if="item.qrEnabled"
              size="x-small"
              color="primary"
              variant="flat"
            >
              QR
            </v-chip>
            <v-chip
              v-if="item.linkEnabled"
              size="x-small"
              color="info"
              variant="flat"
            >
              Link
            </v-chip>
             <v-chip
              v-if="item.approvalRequired"
              size="x-small"
              color="warning"
              variant="flat"
            >
              Approval
            </v-chip>
          </div>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-chip
            size="small"
            :color="item.status === 'active' ? 'success' : 'grey'"
            variant="tonal"
          >
            {{ item.status === 'active' ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-btn
              icon
              variant="text"
              size="small"
              color="grey-darken-1"
              @click="editTemplate(item)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
            </v-btn>
            
            <v-btn
              icon
              variant="text"
              size="small"
              color="grey-darken-1"
              @click="duplicateTemplate(item)"
            >
              <v-icon>mdi-content-copy</v-icon>
              <v-tooltip activator="parent" location="top">Duplicate</v-tooltip>
            </v-btn>

            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="grey-darken-1"
                  v-bind="props"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  :value="item.status === 'active' ? 'disable' : 'enable'"
                  @click="toggleStatus(item)"
                >
                  <template v-slot:prepend>
                    <v-icon size="small">{{ item.status === 'active' ? 'mdi-cancel' : 'mdi-check' }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.status === 'active' ? 'Disable' : 'Enable' }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      <v-icon :icon="snackbarIcon" class="mr-2" />
      {{ snackbarMessage }}
    </v-snackbar>
  
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { visitorService } from '@/services/visitorService';
import BaseButton from '@/components/common/buttons/BaseButton.vue';

const emit = defineEmits(['change-view']);

const router = useRouter();
const loading = ref(false);
const templates = ref([]);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

const selectedBranch = ref(null);
const branches = ref([]);
const typeFilter = ref('All');

const filteredTemplates = computed(() => {
  let result = templates.value;

  // Filter by Branch
  if (selectedBranch.value) {
    result = result.filter(template => {
      if (template.branchScope === 'all') return true;
      if (template.branchScope === 'specific' && template.selectedBranches) {
        return template.selectedBranches.includes(selectedBranch.value);
      }
      return false;
    });
  }

  // Filter by Type
  if (typeFilter.value !== 'All') {
    result = result.filter(t => t.processType === typeFilter.value);
  }
  
  return result;
});

const headers = [
  { title: 'Process Name', key: 'name', width: '25%' },
  { title: 'Type', key: 'type', width: '15%' },
  { title: 'Enabled Features', key: 'features', sortable: false },
  { title: 'Status', key: 'status', width: '10%' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false, width: '15%' },
];

onMounted(async () => {
  await Promise.all([
    loadTemplates(),
    loadBranches()
  ]);
});

const loadTemplates = async () => {
  loading.value = true;
  try {
    const data = await visitorService.getVisitorTemplates();
    templates.value = data;
  } catch (error) {
    console.error('Error loading templates:', error);
    showNotification('Error loading templates', 'error');
  } finally {
    loading.value = false;
  }
};

const loadBranches = async () => {
  try {
    const data = await visitorService.getBranches();
    branches.value = [{ title: 'All Branches', value: null }, ...data];
  } catch (error) {
    console.error('Error loading branches:', error);
  }
};

const createTemplate = () => {
  emit('change-view', 'create');
};



const editTemplate = (item) => {
  // In a real app we'd pass the ID, but for this simple switcher we'll just switch view
  // We might need to pass the ID to the parent or store it
  // For now, let's assume the parent handles it or we use a store
  // But wait, VisitorTemplateEditor expects route.params.id
  // Since we are not using router, we should probably update VisitorTemplateEditor to accept props
  // However, to keep it simple, I'll just emit the event.
  // Ideally, we should refactor VisitorTemplateEditor to take props.
  emit('change-view', 'edit', { id: item.id });
};

const duplicateTemplate = async (item) => {
  try {
    const newItem = {
      ...item,
      id: null, // Let backend generate ID
      name: `${item.name} (Copy)`,
      status: 'active',
    };
    await visitorService.createVisitorTemplate(newItem);
    await loadTemplates();
    showNotification('Template duplicated successfully', 'success');
  } catch (error) {
    console.error('Error duplicating template:', error);
    showNotification('Error duplicating template', 'error');
  }
};

const toggleStatus = async (item) => {
  try {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    await visitorService.updateVisitorTemplate(item.id, { status: newStatus });
    await loadTemplates();
    showNotification(`Template ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`, 'success');
  } catch (error) {
    console.error('Error updating status:', error);
    showNotification('Error updating status', 'error');
  }
};

const showNotification = (message, type = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = type;
  snackbarIcon.value = type === 'success' ? 'mdi-check-circle' : 
                       type === 'error' ? 'mdi-alert-circle' : 'mdi-information';
  showSnackbar.value = true;
};
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};
</script>

<style scoped>
.visitor-templates {
  max-width: 100%;
}

.table-card {
  border-radius: 12px;
  border-color: #e0e0e0;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}
</style>
