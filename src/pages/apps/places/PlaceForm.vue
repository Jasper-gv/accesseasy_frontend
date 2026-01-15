<template>
  <v-container max-width="800">
    <v-card class="pa-4">
      <v-card-title>{{ isEditMode ? 'Edit Place' : 'Add New Place' }}</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="savePlace">
          <v-text-field
            v-model="place.name"
            label="Place Name"
            variant="outlined"
            :rules="[v => !!v || 'Name is required']"
          ></v-text-field>
          
          <v-select
            v-model="place.type"
            label="Type"
            :items="['Gym', 'Office', 'Branch', 'Store', 'Warehouse']"
            variant="outlined"
            :rules="[v => !!v || 'Type is required']"
          ></v-select>
          
          <v-text-field
            v-model="place.address"
            label="Address"
            variant="outlined"
            :rules="[v => !!v || 'Address is required']"
          ></v-text-field>

          <v-select
            v-if="isEditMode"
            v-model="place.status"
            label="Status"
            :items="['Active', 'Inactive']"
            variant="outlined"
          ></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" to="/apps/places">Cancel</v-btn>
        <v-btn 
            color="primary" 
            variant="flat" 
            :loading="saving" 
            :disabled="!valid"
            @click="savePlace"
        >
            {{ isEditMode ? 'Update' : 'Save' }} Place
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { placesService } from '@/services/appLayer/placesService';

const route = useRoute();
const router = useRouter();
const form = ref(null);
const valid = ref(false);
const saving = ref(false);

const place = ref({
    name: '',
    type: 'Branch',
    address: '',
    status: 'Active'
});

const isEditMode = computed(() => !!route.params.id);

onMounted(async () => {
    if (isEditMode.value) {
        try {
            const data = await placesService.getById(route.params.id);
            if (data) {
                place.value = { ...data };
            } else {
                // Handle not found
                router.push('/apps/places');
            }
        } catch (e) {
            console.error(e);
        }
    }
});

const savePlace = async () => {
    const { valid } = await form.value.validate();
    if (!valid) return;

    saving.value = true;
    try {
        if (isEditMode.value) {
            await placesService.update(route.params.id, place.value);
        } else {
            await placesService.create(place.value);
        }
        router.push('/apps/places');
    } catch (e) {
        console.error(e);
        // Show error snackbar (omitted for brevity)
    } finally {
        saving.value = false;
    }
};
</script>
