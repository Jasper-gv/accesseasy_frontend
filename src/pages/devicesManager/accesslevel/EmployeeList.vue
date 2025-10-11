<template>
  <div>
    <v-card>
      <v-card-title>
        {{ isAssigned ? "Assigned Employees" : "Unassigned Employees" }}
        <v-spacer></v-spacer>
        <!-- <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field> -->
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="employees"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [10, 20, 50, 100],
        }"
        class="elevation-1"
      >
        <template v-slot:item.assignedUser.first_name="{ item }">
          {{ item.assignedUser.first_name || "N/A" }}
        </template>
        <template v-slot:item.department="{ item }">
          {{ item.department?.departmentName || "N/A" }}
        </template>

        <template v-slot:item.branch="{ item }">
          {{ item.branch?.branchName || "N/A" }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-switch
            color="success"
            hide-details
            inset
            :model-value="isAssigned"
            @update:model-value="toggleAccess(item)"
            :label="isAssigned ? 'Assigned' : 'Unassigned'"
          ></v-switch>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  employees: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isAssigned: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["toggle-access"]);

const search = ref("");

const headers = computed(() => [
  {
    title: "Name",
    align: "start",
    key: "assignedUser.first_name",
    sortable: true,
  },
  {
    title: "Employee ID",
    align: "start",
    key: "employeeId",
    sortable: true,
  },
  {
    title: "Department",
    align: "start",
    key: "department",
    sortable: true,
  },
  {
    title: "Branch",
    align: "start",
    key: "branch",
    sortable: true,
  },
  {
    title: "Actions",
    align: "center",
    key: "actions",
    sortable: false,
  },
]);

const toggleAccess = (item) => {
  emit("toggle-access", item, props.isAssigned);
};
</script>

<style scoped>
.v-data-table {
  width: 100%;
}
::v-deep .v-data-table-header,
::v-deep .v-table__wrapper thead,
::v-deep .v-data-table thead {
  background-color: #f5f5f5 !important; /* Light gray background with high priority */
}
</style>