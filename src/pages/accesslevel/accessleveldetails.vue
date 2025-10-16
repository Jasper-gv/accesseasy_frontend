<template>
  <div>
    <DataTableWrapper title="Access Level Details" :showSearch="false">
      <template #toolbar-actions>
        <BaseButton
          v-if="!showAddPage"
          variant="primary"
          size="md"
          @click="openAddPage"
        >
          Add Access Level
        </BaseButton>
      </template>

      <!-- Skeleton Loading -->
      <SkeletonLoader
        v-if="loading"
        variant="data-table"
        :rows="5"
        :columns="2"
      />

      <!-- Table Section -->
      <DataTable
        v-else-if="!showAddPage"
        :items="accessLevels"
        :columns="headers"
        :showSelection="false"
        :expandable="false"
        show-header
      >
        <!-- Custom Switch Cell -->
        <template #cell-type="{ item }">
          <v-switch
            v-model="item.type"
            color="primary"
            inset
            hide-details
            density="compact"
            @change="onToggleAccessType(item)"
          ></v-switch>
        </template>
      </DataTable>

      <!-- Add Access Level Page -->
      <div v-else>
        <accessleveladd @close="closeAddPage" @save="handleSave" />
      </div>
    </DataTableWrapper>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import accessleveladd from "@/pages/accesslevel/acessleveladd.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DataTable from "@/components/common/table/DataTable.vue";
import DataTableWrapper from "@/components/common/table/DataTableWrapper.vue";
import SkeletonLoader from "@/components/common/states/SkeletonLoading.vue";

const loading = ref(true);
const showAddPage = ref(false);

// ✅ Headers
const headers = ref([
  { label: "Access Level Name", key: "name", sortable: true },
  { label: "Access Type", key: "type", sortable: true, type: "switch" },
]);

// ✅ Dummy data
const accessLevels = ref([
  { name: "Staff Access", type: true },
  { name: "Admin Access", type: true },
  { name: "Visitor Access", type: false },
]);

// 🔘 Button actions
const openAddPage = () => {
  showAddPage.value = true;
};

const closeAddPage = () => {
  showAddPage.value = false;
};

// 🔘 When Save is clicked from Add Page
const handleSave = (newData) => {
  if (newData) {
    accessLevels.value.push(newData); // Optionally add to list
  }
  showAddPage.value = false;
};

// 🔘 Switch handler
const onToggleAccessType = (item) => {
  console.log("Switched:", item.name, "→", item.type);
};

// Simulate loading
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 800);
});
</script>

<style scoped>
/* Optional styling for spacing */
</style>
