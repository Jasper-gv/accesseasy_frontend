<template>
  <div class="tasks-container">
    <DataTableWrapper
      :search-query="searchQuery"
      @update:searchQuery="debouncedSearch"
      search-placeholder="Search organizations..."
    >
      <!-- Toolbar Actions -->
      <template #toolbar-actions>
        <div class="header-actions">
          <BaseButton
            variant="primary"
            text="Create"
            :leftIcon="Plus"
            width="100px"
            @click="showAddOrganizationModal"
          />
          <div class="stats-container">
            <div
              class="stat-item"
              :class="{ active: filters.type === '', 'all-orgs--text': true }"
              @click="filterByType('')"
            >
              <span class="stat-value">{{ organizationStats.total }}</span>
              <span class="stat-title">All</span>
            </div>
            <div
              class="stat-item"
              :class="{
                active: filters.type === 'clientorg',
                'client--text': true,
              }"
              @click="filterByType('clientorg')"
            >
              <span class="stat-value">{{ organizationStats.clientorg }}</span>
              <span class="stat-title">Client</span>
            </div>
            <div
              class="stat-item"
              :class="{
                active: filters.type === 'contact',
                'contact--text': true,
              }"
              @click="filterByType('contact')"
            >
              <span class="stat-value">{{ organizationStats.contact }}</span>
              <span class="stat-title">Contact</span>
            </div>
          </div>
        </div>
      </template>

      <SkeletonLoading
        v-if="loading"
        variant="data-table"
        :rows="6"
        :columns="10"
        :animated="true"
      />

      <template v-else>
        <DataTable
          :items="filteredOrganizations"
          :columns="columns"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          item-key="id"
          :row-clickable="false"
          @update:sort-by="sortBy = $event"
          @update:sort-direction="sortDirection = $event"
          @sort="fetchOrganizations"
        >
          <template #error-state>
            <ErrorState
              v-if="error"
              title="Unable to load organizations"
              :message="error"
            />
          </template>

          <template #empty-state>
            <EmptyState
              :title="
                searchQuery
                  ? 'No organizations found'
                  : 'No organizations available'
              "
              :message="
                searchQuery
                  ? 'Try a different search term'
                  : 'No organizations have been added yet'
              "
              :show-default-actions="false"
            >
              <template #actions>
                <BaseButton
                  v-if="searchQuery"
                  variant="secondary"
                  text="Clear Search"
                  width="120px"
                  @click="clearSearch"
                />
                <BaseButton
                  variant="primary"
                  text="Add your first Organization"
                  width="160px"
                  @click="showAddOrganizationModal"
                />
              </template>
            </EmptyState>
          </template>

          <template #cell-organization="{ item }">
            <div class="organization-info">
              <div class="organization-avatar"></div>
              <div class="organization-details">
                <span class="organization-name">{{ item.orgName }}</span>
              </div>
            </div>
          </template>

          <template #cell-type="{ item }">
            <span
              class="type-badge"
              :class="`type-${item.orgType?.replace(' ', '-') || 'unknown'}`"
            >
              {{ formatType(item.orgType) }}
            </span>
          </template>

          <template #cell-number="{ item }">
            <span class="org-number">{{ item.orgNumber }}</span>
          </template>

          <template #cell-contactPerson="{ item }">
            <span class="org-gst">{{
              item.contactPerson ||
              (item.orgType === "contact" ? "N/A" : "No Contact Person")
            }}</span>
          </template>

          <template #cell-address="{ item }">
            <span class="org-address">{{
              item.orgAddress || "No address"
            }}</span>
          </template>

          <template #cell-actions="{ item }">
            <ActionButton
              variant="ghost"
              :icon="Edit"
              size="small"
              tooltip="Edit Organization"
              @click="editOrganization(item)"
            />
          </template>
        </DataTable>
      </template>

      <template #pagination>
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
</template>

<script setup>
import { ref, computed, onMounted, reactive, onUnmounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ErrorState from "@/components/common/states/ErrorState.vue";
import EmptyState from "@/components/common/states/EmptyState.vue";
import SkeletonLoading from "@/components/common/states/SkeletonLoading.vue";
import { Plus, Pencil, Edit } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";
import ActionButton from "@/components/common/buttons/ActionButton.vue";
const tenantId = currentUserTenant.getTenantId();

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const token = authService.getToken();
const router = useRouter();
// State
const loading = ref(false);
const error = ref(null);
const organizations = ref([]);
const searchQuery = ref("");
const selected = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const sortBy = ref("orgName");
const sortDirection = ref("asc");

// Filters
const filters = reactive({
  type: "",
});

// Stats for all organizations
const allOrganizationsStats = ref({
  total: 0,
  clientorg: 0,
  contact: 0,
});

// DataTable Columns
const columns = ref([
  {
    key: "organization",
    label: "Clients Name",
    sortable: false,
    width: 200,
  },
  { key: "type", label: "Type", sortable: false, width: 100 },
  { key: "number", label: "Contact Number", sortable: false, width: 120 },

  { key: "address", label: "Address", sortable: false, width: 250 },
  { key: "actions", label: "", sortable: false, width: 50 },
]);
const showAddOrganizationModal = () => {
  router.push({
    name: "AddClient",
  });
};

const editOrganization = (item) => {
  router.push({
    name: "EditClient",
    params: { id: item.id },
  });
};
// Computed property to filter organizations
const filteredOrganizations = computed(() => organizations.value);

// Debounced search
const searchTimeout = ref(null);
const debouncedSearch = (value) => {
  searchQuery.value = value;
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchOrganizations();
  }, 300);
};

// API Functions
const fetchOrganizations = async () => {
  loading.value = true;
  error.value = null;

  try {
    let url = `${API_BASE_URL}/items/organization?`;

    // Base filter
    url += `filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;

    let filterIndex = 1;

    // Type filter
    if (filters.type) {
      url += `&filter[_and][${filterIndex}][orgType][_eq]=${filters.type}`;
      filterIndex++;
    } else {
      url += `&filter[_and][${filterIndex}][_or][0][orgType][_eq]=clientorg`;
      url += `&filter[_and][${filterIndex}][_or][1][orgType][_eq]=contact`;
      filterIndex++;
    }

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      url += `&filter[_and][${filterIndex}][_or][0][orgName][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][${filterIndex}][_or][1][orgNumber][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][${filterIndex}][_or][2][orgType][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][${filterIndex}][_or][3][orgGst][_icontains]=${encodeURIComponent(query)}`;
      url += `&filter[_and][${filterIndex}][_or][4][orgAddress][_icontains]=${encodeURIComponent(query)}`;
    }

    // Pagination
    url += `&limit=${itemsPerPage.value}`;
    url += `&offset=${(currentPage.value - 1) * itemsPerPage.value}`;

    // Sorting
    if (sortBy.value) {
      url += `&sort=${sortDirection.value === "desc" ? "-" : ""}${sortBy.value}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    organizations.value = result.data || [];

    // Get total count for pagination
    let countUrl = `${API_BASE_URL}/items/organization?`;
    countUrl += `filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;

    let countFilterIndex = 1;

    // Type filter for count
    if (filters.type) {
      countUrl += `&filter[_and][${countFilterIndex}][orgType][_eq]=${filters.type}`;
      countFilterIndex++;
    } else {
      countUrl += `&filter[_and][${countFilterIndex}][_or][0][orgType][_eq]=clientorg`;
      countUrl += `&filter[_and][${countFilterIndex}][_or][1][orgType][_eq]=contact`;
      countFilterIndex++;
    }

    countUrl += `&aggregate[count]=id`;

    // Search filter for count
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      countUrl += `&filter[_and][${countFilterIndex}][_or][0][orgName][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][${countFilterIndex}][_or][1][orgNumber][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][${countFilterIndex}][_or][2][orgType][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][${countFilterIndex}][_or][3][orgGst][_icontains]=${encodeURIComponent(query)}`;
      countUrl += `&filter[_and][${countFilterIndex}][_or][4][orgAddress][_icontains]=${encodeURIComponent(query)}`;
    }

    const countResponse = await fetch(countUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (countResponse.ok) {
      const countData = await countResponse.json();
      totalItems.value = countData?.data?.[0]?.count?.id || 0;
    }
  } catch (err) {
    console.error("Error fetching organizations:", {
      message: err.message,
      response: await err.response?.json(),
      status: err.response?.status,
    });
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Fetch stats for all organizations
const fetchStats = async () => {
  try {
    let statsUrl = `${API_BASE_URL}/items/organization?`;
    statsUrl += `filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;
    statsUrl += `&filter[_and][1][_or][0][orgType][_eq]=clientorg`;
    statsUrl += `&filter[_and][1][_or][1][orgType][_eq]=contact`;
    statsUrl += `&aggregate[count]=id&groupBy[]=orgType`;

    const statsResponse = await fetch(statsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();

      const stats = {
        total: 0,
        clientorg: 0,
        contact: 0,
      };

      let totalUrl = `${API_BASE_URL}/items/organization?`;
      totalUrl += `filter[_and][0][tenant][tenantId][_eq]=${tenantId}`;
      totalUrl += `&filter[_and][1][_or][0][orgType][_eq]=clientorg`;
      totalUrl += `&filter[_and][1][_or][1][orgType][_eq]=contact`;
      totalUrl += `&aggregate[count]=id`;

      const totalResponse = await fetch(totalUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (totalResponse.ok) {
        const totalData = await totalResponse.json();
        stats.total = totalData.data?.[0]?.count?.id || 0;
      }

      statsData.data?.forEach((item) => {
        if (item.orgType) {
          stats[item.orgType] = item.count?.id || 0;
        }
      });

      allOrganizationsStats.value = stats;
    }
  } catch (error) {
    console.warn("Failed to fetch stats:", error);
  }
};

// Computed properties
const organizationStats = computed(() => allOrganizationsStats.value);

// Methods
const filterByType = (type) => {
  filters.type = filters.type === type ? "" : type;
  currentPage.value = 1;
  fetchOrganizations();
};

const formatType = (type) => {
  if (!type) return "Unknown";
  switch (type.toLowerCase()) {
    case "clientorg":
      return "Client";
    case "contact":
      return "Contact";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  currentPage.value = 1;
  fetchOrganizations();
};

// Pagination handlers
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchOrganizations();
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
  currentPage.value = 1;
  fetchOrganizations();
};

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchOrganizations(), fetchStats()]);
});

onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
});
</script>

<style scoped>
/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
/* Stats Container */
.stats-container {
  display: inline-flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.stat-item.active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.stat-title {
  color: #6b7280;
}

.stat-item.active.all-orgs--text {
  background: rgba(130, 94, 156, 0.1);
}

.stat-item.active.client--text {
  background: rgba(196, 170, 98, 0.1);
}

.stat-item.active.contact--text {
  background: rgba(168, 85, 247, 0.1);
}
/* Type Badge */
.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid transparent;
}

.type-clientorg {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-color: #fcd34d;
}

.type-contact {
  background: linear-gradient(135deg, #f3e8ff, #faf5ff);
  color: #6b21a8;
  border-color: #d8b4fe;
}

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .stats-container {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .stat-item {
    min-width: 50px;
    padding: 0.375rem 0.5rem;
  }
  .stat-number {
    font-size: 1rem;
  }
  .stat-label {
    font-size: 0.625rem;
  }
}
</style>
