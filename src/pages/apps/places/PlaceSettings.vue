<template>
  <div>
    <h1 class="text-h4 mb-4">Settings</h1>
    
    <v-tabs v-model="tab" color="primary">
      <v-tab value="general">General</v-tab>
      <v-tab value="templates">Pass Templates</v-tab>
      <v-tab value="access">Access Control</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <v-window-item value="general">
        <v-card title="General Settings">
          <v-card-text>Settings for the selected place will go here.</v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="templates">
        <v-row>
            <v-col cols="12" class="d-flex justify-space-between align-center">
                <h3 class="text-h6">Manage Pass Types (Memberships, Day Passes)</h3>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">Create Template</v-btn>
            </v-col>
        </v-row>
        
        <v-row class="mt-2">
            <v-col cols="12" md="4" v-for="template in templates" :key="template.id">
                <v-card border elevation="0">
                    <v-card-item>
                        <v-card-title>{{ template.name }}</v-card-title>
                        <v-card-subtitle>{{ template.type }} • {{ template.duration }} Hours</v-card-subtitle>
                    </v-card-item>
                    <v-card-text>
                        <div class="d-flex justify-space-between mb-1">
                            <span>Cost:</span>
                            <span class="font-weight-bold">{{ template.cost === 0 ? 'Free' : `₹${template.cost}` }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-1">
                            <span>Mode:</span>
                            <v-chip size="x-small" :color="template.accessMode === 'Auto Entry' ? 'success' : 'warning'">
                                {{ template.accessMode }}
                            </v-chip>
                        </div>
                        <div class="d-flex justify-space-between">
                            <span>Membership:</span>
                            <v-icon :color="template.isMembership ? 'success' : 'grey'" size="small">
                                {{ template.isMembership ? 'mdi-check-circle' : 'mdi-minus-circle' }}
                            </v-icon>
                        </div>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-btn variant="text" color="primary" size="small" @click="openDialog(template)">Edit</v-btn>
                        <v-btn variant="text" color="error" size="small" @click="deleteTemplate(template.id)">Delete</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <!-- Template Dialog -->
    <v-dialog v-model="dialog" max-width="500">
        <v-card>
            <v-card-title>{{ editedTemplate.id ? 'Edit Template' : 'New Template' }}</v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid" @submit.prevent="saveTemplate">
                    <v-text-field v-model="editedTemplate.name" label="Pass Name" :rules="[v => !!v || 'Required']"></v-text-field>
                    <v-select v-model="editedTemplate.type" label="Type" :items="['Visitor', 'Parking']"></v-select>
                    <v-select v-model="editedTemplate.accessMode" label="Access Mode" :items="['Auto Entry', 'Security Check', 'Reception']"></v-select>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model.number="editedTemplate.duration" label="Duration (Hours)" type="number"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                             <v-text-field v-model.number="editedTemplate.cost" label="Cost (₹)" type="number"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-checkbox v-model="editedTemplate.isMembership" label="Is Membership? (Recurring)"></v-checkbox>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="saveTemplate" :loading="saving">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { passTemplateService } from '@/services/appLayer/passTemplateService';

const tab = ref('templates');
const templates = ref([]);
const dialog = ref(false);
const saving = ref(false);
const valid = ref(false);
const form = ref(null);

const defaultItem = {
    name: '',
    type: 'Visitor',
    accessMode: 'Auto Entry',
    duration: 24,
    cost: 0,
    isMembership: false
};

const editedTemplate = ref({ ...defaultItem });

const loadData = async () => {
    try {
        templates.value = await passTemplateService.getAll();
    } catch (e) {
        console.error(e);
    }
};

const openDialog = (item = null) => {
    editedTemplate.value = item ? { ...item } : { ...defaultItem };
    dialog.value = true;
};

const saveTemplate = async () => {
    const { valid } = await form.value.validate();
    if (!valid) return;

    saving.value = true;
    try {
        if (editedTemplate.value.id) {
            await passTemplateService.update(editedTemplate.value.id, editedTemplate.value);
        } else {
            await passTemplateService.create(editedTemplate.value);
        }
        await loadData();
        dialog.value = false;
    } catch (e) {
        console.error(e);
    } finally {
        saving.value = false;
    }
};

const deleteTemplate = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
        await passTemplateService.delete(id);
        await loadData();
    } catch (e) { console.error(e); }
};

onMounted(loadData);
</script>
