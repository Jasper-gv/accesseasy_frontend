<!-- taskpage.vue - Updated main page with status filter -->
<template>
  <div class="tasks-container">
    <div
      class="main-content"
      :class="{
        'with-filter': showFilters,
        'with-create': openCreateWO,
        'with-complete': openCompleteSidebar,
      }"
    >
      <DataTableWrapper
        v-model:searchQuery="searchQuery"
        @update:searchQuery="handleSearchUpdate"
        :total-items="totalItems"
        height="calc(95vh - 190px)"
      >
        <!-- Toolbar Actions Slot -->
        <template v-slot:toolbar-actions>
          <div class="wo-counters" aria-label="Work Order Status Counters">
            <div
              class="wo-pill total"
              role="button"
              aria-live="polite"
              @click="filterByStatus('')"
              :class="{ active: filters.status === '' }"
            >
              <ListChecks class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Total</span>
              <span class="wo-count">{{ statusCounts.total }}</span>
            </div>
            <div
              class="wo-pill pending"
              role="button"
              aria-live="polite"
              @click="filterByStatus('pending')"
              :class="{ active: filters.status === 'pending' }"
            >
              <Clock class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Pending</span>
              <span class="wo-count">{{ statusCounts.pending }}</span>
            </div>
            <div
              class="wo-pill overdue"
              role="button"
              aria-live="polite"
              @click="filterByStatus('overdue')"
              :class="{ active: filters.status === 'overdue' }"
            >
              <AlertTriangle class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Overdue</span>
              <span class="wo-count">{{ statusCounts.overdue }}</span>
            </div>
            <div
              class="wo-pill completed"
              role="button"
              aria-live="polite"
              @click="filterByStatus('completed')"
              :class="{ active: filters.status === 'completed' }"
            >
              <CheckCircle class="wo-icon" aria-hidden="true" />
              <span class="wo-label">Completed</span>
              <span class="wo-count">{{ statusCounts.completed }}</span>
            </div>
          </div>

          <!-- Existing actions -->
          <BaseButton
            variant="secondary"
            text="Filters"
            :leftIcon="Filter"
            :badge="hasActiveFilters ? '!' : null"
            @click="toggleFilters"
          />
          <BaseButton
            v-if="selectedTaskIds.length > 0"
            variant="danger"
            :loading="externalLoading"
            :text="`Delete (${selectedTaskIds.length})`"
            :leftIcon="Trash2"
            @click="openDeleteModal = true"
          />
          <BaseButton
            variant="primary"
            :text="`Create Work Order`"
            :leftIcon="PlusIcon"
            :loading="externalLoading"
            @click="handleCreateWorkOrder"
          />

          <DropdownButton
            text="Export"
            :leftIcon="Download"
            :items="exportItems"
            @itemClick="handleExport"
          />
        </template>

        <!-- Table content states -->
        <div v-if="isInitialLoading || loading">
          <SkeletonLoader
            variant="table-body-only"
            :rows="tasks.length || 10"
            :columns="6"
          />
        </div>
        <div v-else-if="error">
          <ErrorState
            title="Unable to load tasks"
            :message="error"
            @retry="fetchTasksWithFilters"
          />
        </div>
        <div v-else-if="!loading && !isInitialLoading && tasks.length === 0">
          <EmptyState
            title="No Work Orders found"
            message="Try adjusting your filters or create a new work order"
            :primaryAction="{ text: 'Create Work Order', icon: Plus }"
            :secondaryAction="{ text: 'Clear Filters', icon: X }"
            @primaryAction="openCreateWO = true"
            @secondaryAction="clearAllFiltersAndReload"
          />
        </div>
        <div v-else>
          <TaskTable
            :tasks="tasks"
            :selectedTaskIds="selectedTaskIds"
            :expandedTaskId="expandedTaskId"
            :sortBy="sortBy"
            :sortDirection="sortDirection"
            @toggleSelectAll="toggleSelectAll"
            @toggleTaskSelection="toggleTaskSelection"
            @requestSort="requestSort"
            @toggleExpandedDetails="toggleExpandedDetails"
            @openCompleteSidebar="handleOpenCompleteSidebar"
          />
        </div>

        <!-- Create Work Order Sidebar -->
        <CreateWorkOrderSidebar
          v-model="openCreateWO"
          @created="refreshTasks"
        />

        <!-- Complete Task Sidebar -->
        <CompleteTaskSidebar
          v-model="openCompleteSidebar"
          :task="selectedTaskForCompletion"
          @complete="handleTaskComplete"
          @saveDraft="handleTaskSaveDraft"
        />

        <!-- Pagination Slot -->
        <template v-slot:pagination>
          <CustomPagination
            v-model:page="currentPage"
            v-model:itemsPerPage="itemsPerPage"
            :total-items="totalItems"
            @update:page="handlePageChange"
            @update:itemsPerPage="handleItemsPerPageChange"
          />
        </template>
      </DataTableWrapper>
    </div>

    <!-- Filter Panel -->
    <FilterPanel
      :show="showFilters"
      title="Task Filters"
      :hasFilters="hasActiveFilters"
      @close="showFilters = false"
      @clear="clearAllFiltersAndReload"
      @apply="applyFilters"
    >
      <FilterSection title="Month" :icon="Calendar">
        <FilterMonth
          v-model="filters.month"
          @change="applyFilters"
          @clear="clearMonthFilter"
        />
      </FilterSection>

      <FilterSection title="Task Type" :icon="Tag">
        <FilterSelect
          v-model="filters.assignFormId"
          :options="formTemplateOptions"
          placeholder="All Task Types"
          @change="applyFilters"
        />
      </FilterSection>

      <FilterSection title="Status" :icon="ListChecks">
        <FilterSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="All Statuses"
          @change="applyFilters"
          @clear="clearStatusFilter"
        />
      </FilterSection>
    </FilterPanel>

    <!-- Toast Container -->
    <ToastContainer ref="toastContainer" />

    <!-- Common Delete Modal -->
    <ConfirmDeleteModal
      :show="openDeleteModal"
      title="Delete Tasks"
      :itemLabel="'Task(s)'"
      :itemName="`${selectedTaskIds.length} selected`"
      :deleting="deleting"
      confirmText="Delete"
      cancelText="Cancel"
      @close="openDeleteModal = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, watch } from "vue";
import {
  Filter,
  Trash2,
  Plus,
  Download,
  Calendar,
  Tag,
  X,
  ListChecks,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-vue-next";

// Import composables
import { useTaskApi } from "@/composables/workorder/tasks/useTaskApi";
import { useTaskExport } from "@/composables/workorder/tasks/useTaskExport";
import { useTaskFilters } from "@/composables/workorder/tasks/useTaskFilters";

// Import components
import TaskTable from "@/components/tasks_Components/table/taskTable.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import CreateWorkOrderSidebar from "@/pages/taskManagement/taskcomponents/formTemplate/AddTaskForm/CreateWorkOrderChoice.vue";
import CompleteTaskSidebar from "@/pages/taskManagement/taskcomponents/formTemplate/submitTaskForm/CompleteWorkOrder.vue";

// Common components
import ConfirmDeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import FilterPanel from "@/components/common/filters/FilterPanel.vue";
import FilterSection from "@/components/common/filters/FilterSection.vue";
import FilterSelect from "@/components/common/filters/FilterSelect.vue";
import FilterMonth from "@/components/common/filters/FilterMonth.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DropdownButton from "@/components/common/buttons/DropdownButton.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";

// State
const openCreateWO = ref(false);
const openCompleteSidebar = ref(false);
const selectedTaskForCompletion = ref(null);
const openDeleteModal = ref(false);
const deleting = ref(false);
const isInitialLoading = ref(true);
const externalLoading = ref(false);

// Initialize composables
const taskApi = useTaskApi();
const taskExport = useTaskExport();
const taskFilters = useTaskFilters();

const {
  tasks,
  formTemplates,
  loading,
  error,
  totalItems,
  fetchTasks,
  fetchFormTemplates,
  deleteSelectedTasks: apiDeleteSelectedTasks,
  statusCounts,
} = taskApi;

const { exportData } = taskExport;

const {
  filters,
  searchQuery,
  hasActiveFilters,
  buildTaskFilterParams,
  clearAllFilters,
  clearStatusFilter,
  debouncedApplyFilters,
} = taskFilters;

// Component state
const showFilters = ref(false);
const expandedTaskId = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const selectedTaskIds = ref([]);
const sortBy = ref("date_created");
const sortDirection = ref("desc");
const toastContainer = ref(null);

// Status options for filter dropdown
const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Completed", value: "completed" },
];

// Export items config
const exportItems = [
  { label: "Export to Excel", value: "excel", icon: Download },
  { label: "Export to CSV", value: "csv", icon: Download },
];

// Options
const formTemplateOptions = computed(() =>
  formTemplates.value.map((template) => ({
    label: template.formName,
    value: template.id,
  })),
);

const allTasksSelected = computed(
  () =>
    tasks.value.length > 0 &&
    selectedTaskIds.value.length === tasks.value.length,
);

// --- Methods ---
const fetchTasksWithFilters = async () => {
  const filterParams = buildTaskFilterParams();
  await fetchTasks({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value,
    filters: filterParams,
  });
  isInitialLoading.value = false;
};

const applyFilters = async () => {
  isInitialLoading.value = false;
  await debouncedApplyFilters(fetchTasksWithFilters);
};

const filterByStatus = (status) => {
  filters.status = status;
  currentPage.value = 1; // Reset to first page
  applyFilters();
};

const clearAllFiltersAndReload = async () => {
  clearAllFilters();
  selectedTaskIds.value = [];
  sortBy.value = "date_created";
  sortDirection.value = "desc";
  currentPage.value = 1;
  isInitialLoading.value = true;
  await fetchTasksWithFilters();
};

const clearMonthFilter = () => {
  clearMonthFilter();
  applyFilters();
};

const toggleTaskSelection = (taskId) => {
  if (selectedTaskIds.value.includes(taskId)) {
    selectedTaskIds.value = selectedTaskIds.value.filter((id) => id !== taskId);
  } else {
    selectedTaskIds.value.push(taskId);
  }
};

const toggleSelectAll = () => {
  if (allTasksSelected.value) {
    selectedTaskIds.value = [];
  } else {
    selectedTaskIds.value = tasks.value.map((task) => task.id);
  }
};

const handleConfirmDelete = async () => {
  if (selectedTaskIds.value.length === 0) {
    toastContainer.value?.warning("No tasks selected for deletion.");
    openDeleteModal.value = false;
    return;
  }

  deleting.value = true;
  externalLoading.value = true;
  const success = await apiDeleteSelectedTasks(selectedTaskIds.value);
  deleting.value = false;
  externalLoading.value = false;

  if (success) {
    selectedTaskIds.value = [];
    toastContainer.value?.success("Tasks deleted successfully!");
    await fetchTasksWithFilters();
    openDeleteModal.value = false;
  } else {
    toastContainer.value?.error("Failed to delete tasks. Please try again.");
  }
};

const toggleExpandedDetails = (taskId) => {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId;
};

const handleCreateWorkOrder = () => {
  showFilters.value = false;
  openCompleteSidebar.value = false;
  openCreateWO.value = true;
};

const handleOpenCompleteSidebar = (task) => {
  showFilters.value = false;
  openCreateWO.value = false;
  selectedTaskForCompletion.value = task;
  openCompleteSidebar.value = true;
};

const handleTaskComplete = async (completionData) => {
  try {
    externalLoading.value = true;
    console.log("Completing task:", completionData);
    toastContainer.value?.success("Task completed successfully!");
    await fetchTasksWithFilters();
  } catch (error) {
    toastContainer.value?.error("Failed to complete task. Please try again.");
  } finally {
    externalLoading.value = false;
  }
};

const handleTaskSaveDraft = async (draftData) => {
  try {
    externalLoading.value = true;
    console.log("Saving draft:", draftData);
    toastContainer.value?.success("Draft saved successfully!");
  } catch (error) {
    toastContainer.value?.error("Failed to save draft. Please try again.");
  } finally {
    externalLoading.value = false;
  }
};

const handlePageChange = async (newPage) => {
  currentPage.value = newPage;
  await fetchTasksWithFilters();
};

const handleItemsPerPageChange = async (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  await fetchTasksWithFilters();
};

const requestSort = async (field) => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDirection.value = "desc";
  }
  currentPage.value = 1;
  await fetchTasksWithFilters();
};

const handleExport = (item) => {
  const filterParams = buildTaskFilterParams();
  exportData(item.value, filterParams);
};

const handleSearchUpdate = (newSearchQuery) => {
  searchQuery.value = newSearchQuery;
  currentPage.value = 1;
  applyFilters();
};

const toggleFilters = () => {
  const newShowFilters = !showFilters.value;
  openCreateWO.value = false;
  openCompleteSidebar.value = false;
  showFilters.value = newShowFilters;
};

const refreshTasks = async () => {
  await fetchTasksWithFilters();
};

watch(openCompleteSidebar, (isOpen) => {
  if (!isOpen) {
    selectedTaskForCompletion.value = null;
  }
});

onBeforeMount(async () => {
  await fetchFormTemplates();
  await fetchTasksWithFilters();
});
</script>

<style scoped>
.tasks-container {
  height: 100vh;
  display: flex;
  padding: -1rem;
  overflow: hidden;
  background-color: #f8fafc;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-right 0.3s ease;
}

.main-content.with-filter {
  margin-right: 350px;
}

.main-content.with-complete {
  margin-right: 460px;
}

@media (max-width: 1024px) {
  .main-content.with-filter,
  .main-content.with-create .main-content.with-complete {
    margin-right: 0;
  }
}

.wo-counters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  flex-wrap: wrap;
}

.wo-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer; /* Indicate clickable */
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.wo-pill.active {
  border-color: #3b82f6; /* Highlight active filter */
  background-color: #e0f2fe;
}

.wo-icon {
  width: 16px;
  height: 16px;
}

.wo-label {
  font-weight: 600;
}

.wo-count {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.wo-pill.total {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #e2e8f0;
}

.wo-pill.total.active {
  background: #e0f2fe;
  border-color: #3b82f6;
}

.wo-pill.pending {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}

.wo-pill.pending.active {
  background: #ffedd5;
  border-color: #f97316;
}

.wo-pill.overdue {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.wo-pill.overdue.active {
  background: #fee2e2;
  border-color: #ef4444;
}

.wo-pill.completed {
  background: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.wo-pill.completed.active {
  background: #d1fae5;
  border-color: #10b981;
}
</style>
