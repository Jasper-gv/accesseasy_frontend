<template>
  <div>
    <v-fab
      icon="mdi-plus"
      color="primary"
      location="bottom right"
      app
      size="large"
      class="mb-4 mr-4"
      @click="dialog = true"
    ></v-fab>

    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 font-weight-bold pa-4">
          New Entry Request
        </v-card-title>

        <v-card-text class="pa-4">
          <v-window v-model="step">
            <!-- Step 1: Select Place -->
            <v-window-item :value="1">
              <div class="text-subtitle-1 mb-4">Where is this entry for?</div>
              <v-text-field
                v-model="searchPlace"
                prepend-inner-icon="mdi-magnify"
                label="Search Place"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-4"
              ></v-text-field>
              
              <v-list border rounded lines="two" max-height="300" class="overflow-y-auto">
                <v-list-item
                  v-for="place in filteredPlaces"
                  :key="place.id"
                  :title="place.name"
                  :subtitle="place.type"
                  @click="selectPlace(place)"
                  :active="selectedPlace?.id === place.id"
                  color="primary"
                  rounded
                >
                  <template v-slot:prepend>
                    <v-avatar rounded size="40" :image="place.image"></v-avatar>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- Step 2: Select Flow -->
            <v-window-item :value="2">
              <div class="d-flex align-center mb-4">
                <v-btn icon="mdi-arrow-left" variant="text" size="small" class="mr-2" @click="step = 1"></v-btn>
                <div class="text-subtitle-1">Select Entry Flow for <span class="font-weight-bold">{{ selectedPlace?.name }}</span></div>
              </div>

              <v-list border rounded lines="two">
                <v-list-item
                  v-for="flow in placeFlows"
                  :key="flow.id"
                  :title="flow.name"
                  :subtitle="flow.description || 'Standard Entry'"
                  @click="selectFlow(flow)"
                  :active="selectedFlow?.id === flow.id"
                  color="primary"
                  rounded
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon>mdi-source-branch</v-icon>
                    </v-avatar>
                  </template>
                  <template v-slot:append>
                    <v-chip size="x-small" v-if="flow.approvalRequired" color="warning">Approval Req</v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- Step 3: Enter Details -->
            <v-window-item :value="3">
              <div class="d-flex align-center mb-4">
                <v-btn icon="mdi-arrow-left" variant="text" size="small" class="mr-2" @click="step = 2"></v-btn>
                <div class="text-subtitle-1">Enter Details</div>
              </div>

              <v-form ref="form" v-model="valid">
                <div v-if="requiresData('Identity')">
                  <div class="text-caption font-weight-bold text-grey mb-2">VISITOR DETAILS</div>
                  <v-text-field
                    v-model="formData.name"
                    label="Full Name"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Name is required']"
                  ></v-text-field>
                  <v-text-field
                    v-model="formData.phone"
                    label="Phone Number"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Phone is required']"
                  ></v-text-field>
                </div>

                <div v-if="requiresData('Vehicle')" class="mt-4">
                  <div class="text-caption font-weight-bold text-grey mb-2">VEHICLE DETAILS</div>
                  <v-text-field
                    v-model="formData.plate"
                    label="License Plate"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Plate is required']"
                  ></v-text-field>
                  <v-text-field
                    v-model="formData.model"
                    label="Vehicle Model"
                    variant="outlined"
                    density="compact"
                  ></v-text-field>
                </div>
              </v-form>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-if="step === 3"
            color="primary"
            variant="flat"
            :loading="submitting"
            @click="submitRequest"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSnackbar" color="success">
      Request submitted successfully!
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { accessService } from '@/services/accessService';

const dialog = ref(false);
const step = ref(1);
const loading = ref(false);
const submitting = ref(false);
const showSnackbar = ref(false);

// Data
const places = ref([]);
const placeFlows = ref([]);
const searchPlace = ref('');

// Selection
const selectedPlace = ref(null);
const selectedFlow = ref(null);
const formData = ref({
  name: '',
  phone: '',
  plate: '',
  model: ''
});

// Load Places when dialog opens
watch(dialog, async (val) => {
  if (val && places.value.length === 0) {
    places.value = await accessService.getPlaces();
  }
  if (!val) {
    // Reset on close
    setTimeout(() => {
      step.value = 1;
      selectedPlace.value = null;
      selectedFlow.value = null;
      formData.value = { name: '', phone: '', plate: '', model: '' };
    }, 300);
  }
});

const filteredPlaces = computed(() => {
  if (!searchPlace.value) return places.value;
  return places.value.filter(p => p.name.toLowerCase().includes(searchPlace.value.toLowerCase()));
});

const selectPlace = async (place) => {
  selectedPlace.value = place;
  loading.value = true;
  try {
    placeFlows.value = await accessService.getPlaceFlows(place.id);
    step.value = 2;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const selectFlow = (flow) => {
  selectedFlow.value = flow;
  step.value = 3;
};

const requiresData = (type) => {
  return selectedFlow.value?.requiredData?.includes(type);
};

const closeDialog = () => {
  dialog.value = false;
};

const submitRequest = async () => {
  submitting.value = true;
  try {
    const requestData = {
      placeId: selectedPlace.value.id,
      flowId: selectedFlow.value.id,
      identityData: {
        name: formData.value.name,
        phone: formData.value.phone
      },
      vehicleData: {
        plate: formData.value.plate,
        model: formData.value.model
      }
    };

    await accessService.createEntryRequest(requestData);
    showSnackbar.value = true;
    closeDialog();
  } catch (error) {
    console.error('Error submitting request:', error);
  } finally {
    submitting.value = false;
  }
};
</script>
