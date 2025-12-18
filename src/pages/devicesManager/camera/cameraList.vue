<template>
  <div class="camera-list-container">
    <div class="header-actions">
      <h2>Camera Management</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddCameraDialog">
        Add Camera
      </v-btn>
    </div>

    <v-card class="mt-4">
      <v-data-table
        :headers="headers"
        :items="cameras"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status === 'online' ? 'success' : 'error'"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="me-2" @click="editCamera(item)">
            mdi-pencil
          </v-icon>
          <v-icon size="small" color="error" @click="deleteCamera(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog Placeholder -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editedItem.name" label="Camera Name"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.ip" label="IP Address"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="editedItem.location" label="Location"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const loading = ref(false);
const dialog = ref(false);
const editedIndex = ref(-1);

const headers = [
  { title: 'Camera Name', key: 'name' },
  { title: 'IP Address', key: 'ip' },
  { title: 'Location', key: 'location' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const cameras = ref([
  {
    id: 1,
    name: 'Main Entrance Cam',
    ip: '192.168.1.101',
    location: 'Headquarters',
    status: 'online',
  },
  {
    id: 2,
    name: 'Warehouse Back Door',
    ip: '192.168.1.102',
    location: 'Warehouse A',
    status: 'offline',
  },
]);

const editedItem = ref({
  name: '',
  ip: '',
  location: '',
});

const defaultItem = {
  name: '',
  ip: '',
  location: '',
};

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Camera' : 'Edit Camera';
});

const openAddCameraDialog = () => {
  editedIndex.value = -1;
  editedItem.value = Object.assign({}, defaultItem);
  dialog.value = true;
};

const editCamera = (item) => {
  editedIndex.value = cameras.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
};

const deleteCamera = (item) => {
  const index = cameras.value.indexOf(item);
  confirm('Are you sure you want to delete this item?') && cameras.value.splice(index, 1);
};

const close = () => {
  dialog.value = false;
  editedItem.value = Object.assign({}, defaultItem);
  editedIndex.value = -1;
};

const save = () => {
  if (editedIndex.value > -1) {
    Object.assign(cameras.value[editedIndex.value], editedItem.value);
  } else {
    cameras.value.push({ ...editedItem.value, id: Date.now(), status: 'offline' });
  }
  close();
};
</script>

<style scoped>
.camera-list-container {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
