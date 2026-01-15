<template>
  <div>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h4">Locations</h1>
        <p class="text-subtitle-1">Manage your gyms, branches, and sites.</p>
      </v-col>
      <v-col class="text-right">
        <v-btn color="secondary" variant="outlined" class="mr-2" prepend-icon="mdi-cog" to="/apps/places/settings">Settings</v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/apps/places/new">Add Location</v-btn>
      </v-col>
    </v-row>

    <v-card elevation="0" border>
        <v-data-table
            :headers="headers"
            :items="places"
            :loading="loading"
            class="elevation-0"
        >
            <template v-slot:item.status="{ item }">
                <v-chip :color="item.status === 'Active' ? 'success' : 'grey'" size="small">
                    {{ item.status }}
                </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
                <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" :to="`/apps/places/${item.id}/edit`"></v-btn>
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDelete(item)"></v-btn>
            </template>
        </v-data-table>
    </v-card>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
        <v-card title="Delete Place?">
            <v-card-text>Are you sure you want to delete <strong>{{ placeToDelete?.name }}</strong>?</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
                <v-btn color="error" variant="flat" :loading="deleting" @click="deletePlace">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { placesService } from '@/services/appLayer/placesService';

const places = ref([]);
const loading = ref(true);
const deleteDialog = ref(false);
const placeToDelete = ref(null);
const deleting = ref(false);

const headers = [
    { title: 'Name', key: 'name', align: 'start' },
    { title: 'Type', key: 'type', align: 'start' },
    { title: 'Address', key: 'address', align: 'start' },
    { title: 'Status', key: 'status', align: 'start' },
    { title: 'Actions', key: 'actions', align: 'end', sortable: false },
];

const loadPlaces = async () => {
    loading.value = true;
    try {
        places.value = await placesService.getAll();
    } catch (e) {
        console.error("Failed to load places", e);
    } finally {
        loading.value = false;
    }
};

const confirmDelete = (item) => {
    placeToDelete.value = item;
    deleteDialog.value = true;
};

const deletePlace = async () => {
    if (!placeToDelete.value) return;
    deleting.value = true;
    try {
        await placesService.delete(placeToDelete.value.id);
        await loadPlaces();
        deleteDialog.value = false;
    } catch (e) {
        console.error("Failed to delete", e);
    } finally {
        deleting.value = false;
        placeToDelete.value = null;
    }
};

onMounted(() => {
    loadPlaces();
});
</script>
