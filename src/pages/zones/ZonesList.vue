<template>
  <div class="zones-container">
    <div v-if="!showForm" class="main-content">
      <v-data-table
        v-model="selected"
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="-1"
        class="elevation-1 zones-table"
        height="calc(90vh - 190px)"
        fixed-header
        show-select
        @click:row="
          (event, { item }) => {
            if (userRole == 'Admin' || userRole == 'Manager') {
              editItem(item);
            }
          }
        "
      >
        <template v-slot:top>
          <div class="d-flex align-center py-2 px-4">
            <v-text-field
              v-model="search"
              label="Search Zone"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              class="search-field"
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="black" class="ms-2" @click="showAddZoneForm">
              <v-icon start>mdi-plus</v-icon>
              Create Zone
            </v-btn>
          </div>
        </template>

        <template v-slot:item.entry_doors="{ item }">
          {{ formatDoors(item.entry_doors) }}
        </template>

        <template v-slot:item.exit_doors="{ item }">
          {{ formatDoors(item.exit_doors) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon
            small
            class="mr-2"
            @click.stop="editItem(item)"
            color="primary"
          >
            mdi-pencil
          </v-icon>
          <v-icon small @click.stop="deleteItem(item)" color="error">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>

      <CustomPagination
        :page="page"
        :itemsPerPage="itemsPerPage"
        :total-items="totalItems"
        :is-searching="!!search"
        @update:page="handlePageChange"
        @update:itemsPerPage="handleItemsPerPageChange"
      />
    </div>

    <ZoneForm
      v-if="showForm"
      :is-editing="isEditing"
      :zone-data="editedItem"
      @save-success="handleSaveSuccess"
      @cancel="showForm = false"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete the zone "{{ itemToDelete?.zoneName }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { zoneService } from "@/services/zoneService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { computed, onMounted, ref, watch } from "vue";
import ZoneForm from "./ZoneForm.vue";
import CustomPagination from "@/utils/pagination/CustomPagination.vue";

// State management
const search = ref("");
const page = ref(1);
const itemsPerPage = ref(25);
const totalItems = ref(0);
const selected = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const editedItem = ref({});
const items = ref([]);
const loading = ref(false);
const deleteDialog = ref(false);
const itemToDelete = ref(null);
const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
var userRole;

const headers = ref([
  {
    title: "Zone Name",
    key: "zoneName",
    align: "start",
    sortable: true,
    width: "200px",
  },
  {
    title: "Entry Doors",
    key: "entry_doors",
    align: "start",
    sortable: false,
    width: "300px",
  },
  {
    title: "Exit Doors",
    key: "exit_doors",
    align: "start",
    sortable: false,
    width: "300px",
  },
  {
    title: "Actions",
    key: "actions",
    align: "center",
    sortable: false,
    width: "120px",
  },
]);

/**
 * Format doors array to comma-separated string
 */
const formatDoors = (doors) => {
  if (!doors || !Array.isArray(doors) || doors.length === 0) {
    return "None";
  }
  return doors.map((door) => door.doorName).join(", ");
};

/**
 * Fetch zones data from API
 */
const fetchZonesData = async () => {
  try {
    const userDetails = await currentUserTenant.fetchLoginUserDetails();
    userRole = userDetails.role?.name;

    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    loading.value = true;
    const data = await zoneService.fetchZones();
    items.value = data;
    totalItems.value = data.length;
  } catch (error) {
    console.error("Error fetching zones data:", error);
  } finally {
    loading.value = false;
  }
};

/**
 * Handle page change
 */
const handlePageChange = (newPage) => {
  page.value = newPage;
};

/**
 * Handle items per page change
 */
const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage;
};

/**
 * Show add zone form
 */
const showAddZoneForm = () => {
  isEditing.value = false;
  editedItem.value = {};
  showForm.value = true;
};

/**
 * Edit zone item
 */
const editItem = (item) => {
  isEditing.value = true;
  editedItem.value = { ...item };
  showForm.value = true;
};

/**
 * Delete zone item
 */
const deleteItem = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

/**
 * Confirm delete action
 */
const confirmDelete = async () => {
  try {
    await zoneService.deleteZone(itemToDelete.value.id);
    deleteDialog.value = false;
    itemToDelete.value = null;
    await fetchZonesData();
  } catch (error) {
    console.error("Error deleting zone:", error);
    alert("Error deleting zone");
  }
};

/**
 * Handle save success
 */
const handleSaveSuccess = () => {
  showForm.value = false;
  fetchZonesData();
};

// Computed filtered items based on search
const filteredItems = computed(() => {
  if (!search.value) return items.value;
  return items.value.filter((item) =>
    item.zoneName?.toLowerCase().includes(search.value.toLowerCase())
  );
});

// Watch search to update filtered results
watch(search, () => {
  totalItems.value = filteredItems.value.length;
});

onMounted(async () => {
  await fetchZonesData();
});
</script>

<style scoped>
.zones-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow: auto;
}

.search-field {
  max-width: 300px;
}

::v-deep(
  .v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th
) {
  background: #ebeaea !important;
  box-shadow: inset 0 -1px 0
    rgba(var(--v-border-color), var(--v-border-opacity));
  color: black !important;
  text-align: start;
  z-index: 1;
}

:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  overflow-x: auto;
  scrollbar-width: thin;
}
</style>
