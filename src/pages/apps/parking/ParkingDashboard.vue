<template>
  <div>
    <h1 class="text-h4 mb-4">Parking Management</h1>
    <!-- Stats Row -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card title="Occupied Slots" :text="stats.occupied.toString()" color="warning" variant="tonal"></v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card title="Available Slots" :text="stats.available.toString()" color="success" variant="tonal"></v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card title="Total Capacity" :text="stats.totalSlots.toString()" variant="outlined"></v-card>
      </v-col>
    </v-row>

    <!-- Analytics Section -->
    <v-row class="mt-2 text-left">
      <v-col cols="12" md="8">
        <v-card title="Occupancy Trends" subtitle="24 Hour History">
          <v-card-text>
            <div class="d-flex align-end justify-space-between px-4 pb-2" style="height: 250px;">
               <!-- Hourly Occupancy CSS Chart -->
               <div v-for="(h, i) in [20, 35, 60, 85, 95, 80, 55, 30, 15, 10, 5, 25]" :key="i" class="d-flex flex-column align-center" style="width: 7%;">
                   <div 
                    :class="h > 80 ? 'bg-error' : (h > 50 ? 'bg-warning' : 'bg-success')" 
                    class="rounded-t mb-1 opacity-80" 
                    :style="{ width: '70%', height: h + '%' }"
                   ></div>
                   <div class="text-caption text-grey" style="font-size: 10px;">{{ 8 + i }}h</div>
               </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card title="Revenue Snapshot" subtitle="Today">
          <v-card-text>
            <div class="d-flex align-end mb-2">
              <div class="text-h4 font-weight-bold text-success">₹12,450</div>
              <div class="text-caption text-success mb-1 ml-2">+15% vs Avg</div>
            </div>
            <v-progress-linear model-value="75" color="success" height="8" rounded></v-progress-linear>
            <div class="text-caption text-grey mt-1">75% of daily target</div>
          </v-card-text>
          <v-divider></v-divider>
          <v-list density="compact">
            <v-list-item title="Premium Slots" subtitle="₹4,500">
               <template v-slot:prepend><div class="mr-2 text-body-2">36%</div></template>
            </v-list-item>
            <v-list-item title="Regular Slots" subtitle="₹7,950">
               <template v-slot:prepend><div class="mr-2 text-body-2">64%</div></template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- Entry Form -->
      <v-col cols="12" md="5">
        <v-card title="Video Entry" class="mb-4">
             <v-card-text class="text-center">
                 <div class="bg-black rounded mb-2 d-flex align-center justify-center white--text" style="height: 150px;">
                    <v-icon color="grey" size="48">mdi-cctv</v-icon>
                    <span class="ml-2">Live Camera Feed</span>
                 </div>
                 <v-btn block color="primary" prepend-icon="mdi-camera">Capture Plate</v-btn>
             </v-card-text>
        </v-card>

        <v-card title="Manual Entry">
          <v-card-text>
            <v-form @submit.prevent="handleEntry" ref="entryForm">
                <v-text-field 
                    v-model="newVehicle.plateNumber" 
                    label="Vehicle Number (e.g. KA-01-AB-1234)" 
                    variant="outlined"
                    :rules="[v => !!v || 'Required']"
                ></v-text-field>
                
                <v-select
                    v-model="newVehicle.templateId"
                    label="Pass Type"
                    :items="parkingTemplates"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    :rules="[v => !!v || 'Required']"
                ></v-select>
                
                <v-text-field 
                    v-model="newVehicle.slot" 
                    label="Assign Slot (Optional)" 
                    variant="outlined"
                ></v-text-field>
                <div class="mb-4 text-caption text-grey" v-if="selectedTemplate">
                    Rate: ₹{{ selectedTemplate.cost }} / {{ selectedTemplate.duration }} Hours
                </div>
                <v-btn block color="secondary" size="large" type="submit" :loading="processing">Log Entry</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Parked Vehicles List -->
      <v-col cols="12" md="7">
        <v-card title="Parked Vehicles">
            <template v-slot:append>
                <v-btn icon="mdi-refresh" variant="text" @click="loadData"></v-btn>
            </template>
            <v-data-table
                :headers="headers"
                :items="parkedVehicles"
                :loading="loading"
            >
                <template v-slot:item.entryTime="{ item }">
                    {{ new Date(item.entryTime).toLocaleTimeString() }}
                </template>
                 <template v-slot:item.actions="{ item }">
                    <v-btn 
                        size="small" 
                        color="error" 
                        variant="tonal"
                        @click="handleExit(item)"
                        :loading="exitId === item.id"
                    >
                        Exit
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { parkingService } from '@/services/appLayer/parkingService';
import { passTemplateService } from '@/services/appLayer/passTemplateService';

const stats = ref({ occupied: 0, available: 0, totalSlots: 0 });
const parkedVehicles = ref([]);
const parkingTemplates = ref([]);
const loading = ref(false);
const processing = ref(false);
const exitId = ref(null);
const entryForm = ref(null);

const newVehicle = ref({
    plateNumber: '',
    templateId: '',
    slot: ''
});

const selectedTemplate = computed(() => parkingTemplates.value.find(t => t.id === newVehicle.value.templateId));

const headers = [
    { title: 'Plate Number', key: 'plateNumber' },
    { title: 'Pass Type', key: 'templateName' },
    { title: 'Slot', key: 'slot' },
    { title: 'Entry Time', key: 'entryTime' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const loadData = async () => {
    loading.value = true;
    try {
        const [statsData, vehiclesData, templatesData] = await Promise.all([
            parkingService.getStats(),
            parkingService.getParkedVehicles(),
            passTemplateService.getAll()
        ]);
        stats.value = statsData;
        parkedVehicles.value = vehiclesData;
        parkingTemplates.value = templatesData.filter(t => t.type === 'Parking');
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const handleEntry = async () => {
    const { valid } = await entryForm.value.validate();
    if (!valid) return;

    processing.value = true;
    try {
        await parkingService.vehicleEntry({
            ...newVehicle.value,
            templateName: selectedTemplate.value.name,
            costPerUnit: selectedTemplate.value.cost
        });
        newVehicle.value = { plateNumber: '', templateId: '', slot: '' };
        await loadData();
    } catch (e) {
        alert(e.message);
    } finally {
        processing.value = false;
    }
};

const handleExit = async (vehicle) => {
    exitId.value = vehicle.id;
    try {
        // Logic: Calculate fee based on duration and template cost
        const res = await parkingService.vehicleExit(vehicle.id);
        
        // Fee override simulation (the service uses dummy logic, but we can display the template-based calc here)
        const durationHrs = (new Date() - new Date(vehicle.entryTime)) / 36e5;
        const rate = vehicle.costPerUnit || 20;
        const estimatedFee = Math.ceil(durationHrs) * rate;

        alert(`Vehicle Exited.\nDuration: ${durationHrs.toFixed(2)} Hrs\nRate: ₹${rate}/hr\nTotal Fee: ₹${estimatedFee}`);
        await loadData();
    } catch (e) {
        console.error(e);
    } finally {
        exitId.value = null;
    }
};

onMounted(() => {
    loadData();
});
</script>
