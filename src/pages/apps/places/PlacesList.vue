<template>
  <div>
    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6">
        <h1 class="text-3xl font-bold">Locations</h1>
        <p class="text-base text-medium-emphasis">Manage your gyms, branches, and sites.</p>
      </v-col>
      <v-col cols="12" sm="6" class="d-flex align-center justify-end gap-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search Locations"
          single-line
          hide-details
          variant="outlined"
          density="compact"
          class="mr-4"
          style="max-width: 300px;"
        ></v-text-field>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">Add Location</v-btn>
      </v-col>
    </v-row>

    <v-card elevation="0" border>
        <v-data-table
            :headers="headers"
            :items="places"
            :search="search"
            :loading="loading"
            class="elevation-0"
        >
            <template v-slot:item.templateId="{ item }">
                {{ getTemplateName(item.templateId) }}
            </template>
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

    <!-- Create Dialog -->
    <v-dialog v-model="createDialog" max-width="600">
        <v-card>
            <v-card-title class="text-xl font-bold pa-4">Add New Location</v-card-title>
            <v-card-text>
                <v-form ref="createForm" v-model="valid" @submit.prevent="createPlace">
                    <v-text-field
                        v-model="newPlace.name"
                        label="Location Name"
                        variant="outlined"
                        :rules="[v => !!v || 'Name is required']"
                        class="mb-2"
                    ></v-text-field>

                    <v-text-field
                        v-model="newPlace.address"
                        label="Address"
                        variant="outlined"
                        :rules="[v => !!v || 'Address is required']"
                        class="mb-2"
                    ></v-text-field>

                    <v-select
                        v-model="newPlace.type"
                        label="Location Type"
                        :items="['Gym', 'Office', 'Branch', 'Store', 'Warehouse']"
                        variant="outlined"
                        :rules="[v => !!v || 'Type is required']"
                        class="mb-2"
                    ></v-select>

                    <v-select
                        v-model="newPlace.templateId"
                        label="Template Selection"
                        :items="templates"
                        item-title="name"
                        item-value="id"
                        variant="outlined"
                        class="mb-2"
                    ></v-select>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
                <v-btn color="primary" variant="flat" :loading="creating" :disabled="!valid" @click="createPlace">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

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
import { passTemplateService } from '@/services/appLayer/passTemplateService';

const places = ref([]);
const loading = ref(true);
const search = ref('');
const deleteDialog = ref(false);
const placeToDelete = ref(null);
const deleting = ref(false);

// Create Dialog State
const createDialog = ref(false);
const creating = ref(false);
const valid = ref(false);
const createForm = ref(null);
const templates = ref([]);
const newPlace = ref({
    name: '',
    address: '',
    type: 'Branch',
    templateId: null
});

const headers = [
    { title: 'Name', key: 'name', align: 'start' },
    { title: 'Type', key: 'type', align: 'start' },
    { title: 'Address', key: 'address', align: 'start' },
    { title: 'Template', key: 'templateId', align: 'start' },
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

const loadTemplates = async () => {
    try {
        templates.value = await passTemplateService.getAll();
    } catch (e) {
        console.error("Failed to load templates", e);
    }
};

const getTemplateName = (id) => {
    if (!id) return '-';
    const template = templates.value.find(t => t.id === id);
    return template ? template.name : 'Unknown Template';
};

const openCreateDialog = () => {
    newPlace.value = {
        name: '',
        address: '',
        type: 'Branch',
        templateId: null
    };
    createDialog.value = true;
};

const createPlace = async () => {
    const { valid } = await createForm.value.validate();
    if (!valid) return;

    creating.value = true;
    try {
        await placesService.create(newPlace.value);
        await loadPlaces();
        createDialog.value = false;
    } catch (e) {
        console.error("Failed to create place", e);
    } finally {
        creating.value = false;
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
    loadTemplates();
});
</script>
