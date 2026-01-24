<template>
  <div class="h-100 overflow-y-auto">
    <h1 class="text-h4 mb-4">Visitor Management</h1>
    <v-row>
      <v-col cols="12" md="4">
        <v-card title="Active Visitors" subtitle="Currently on premise" :text="stats.active.toString()" color="primary" variant="tonal"></v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card title="Expected Today" subtitle="Pre-registered" :text="stats.expected.toString()" variant="outlined"></v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card title="Total Visits" subtitle="Today" :text="stats.totalToday.toString()" variant="outlined"></v-card>
      </v-col>
    </v-row>

    <!-- Analytics Section -->
    <v-row class="mt-2">
      <v-col cols="12" md="8">
        <v-card title="Visitor Traffic Trends" subtitle="Last 7 Days">
          <v-card-text>
            <div class="d-flex align-end justify-space-between px-4 pb-2" style="height: 300px;">
              <!-- Simple CSS Bar Chart -->
              <div class="d-flex flex-column align-center" style="width: 12%;">
                <div class="bg-primary-lighten-2 rounded-t mb-2" style="width: 60%; height: 45%;"></div>
                <div class="text-caption text-grey">Mon</div>
              </div>
              <div class="d-flex flex-column align-center" style="width: 12%;">
                <div class="bg-primary-lighten-2 rounded-t mb-2" style="width: 60%; height: 60%;"></div>
                <div class="text-caption text-grey">Tue</div>
              </div>
              <div class="d-flex flex-column align-center" style="width: 12%;">
                <div class="bg-primary rounded-t mb-2" style="width: 60%; height: 85%;"></div>
                <div class="text-caption text-grey font-weight-bold">Wed</div>
              </div>
              <div class="d-flex flex-column align-center" style="width: 12%;">
                <div class="bg-primary-lighten-2 rounded-t mb-2" style="width: 60%; height: 55%;"></div>
                <div class="text-caption text-grey">Thu</div>
              </div>
              <div class="d-flex flex-column align-center" style="width: 12%;">
                <div class="bg-primary-lighten-2 rounded-t mb-2" style="width: 60%; height: 70%;"></div>
                <div class="text-caption text-grey">Fri</div>
              </div>
              <div class="d-flex flex-column align-center" style="width: 12%;">
                <div class="bg-grey-lighten-1 rounded-t mb-2" style="width: 60%; height: 30%;"></div>
                <div class="text-caption text-grey">Sat</div>
              </div>
              <div class="d-flex flex-column align-center" style="width: 12%;">
                <div class="bg-grey-lighten-1 rounded-t mb-2" style="width: 60%; height: 20%;"></div>
                <div class="text-caption text-grey">Sun</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card title="Peak Hours" subtitle="Based on historical data">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-clock-time-four" title="10:00 AM - 11:00 AM">
              <template v-slot:append><v-chip color="red" size="small">High</v-chip></template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-clock-time-three" title="2:00 PM - 3:00 PM">
              <template v-slot:append><v-chip color="orange" size="small">Medium</v-chip></template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-clock-time-eight" title="4:00 PM - 5:00 PM">
              <template v-slot:append><v-chip color="orange" size="small">Medium</v-chip></template>
            </v-list-item>
          </v-list>
          <v-divider class="my-2"></v-divider>
          <v-card-text class="pt-0">
            <div class="text-caption text-grey">Busiest Day</div>
            <div class="text-h6">Wednesday</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-card class="mt-6" title="Recent Visitor Log">
      <template v-slot:append>
        <v-btn icon="mdi-refresh" variant="text" @click="loadData" :loading="loading"></v-btn>
      </template>
      <v-data-table
        :headers="headers"
        :items="visitors"
        :loading="loading"
        class="elevation-0"
      >
        <template v-slot:item.checkInTime="{ item }">
            {{ new Date(item.checkInTime).toLocaleTimeString() }}
        </template>
        <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'Active' ? 'success' : 'default'" size="small">
                {{ item.status }}
            </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn 
                v-if="item.status === 'Active'"
                size="small" 
                color="warning" 
                variant="flat"
                @click="checkOut(item)"
                :loading="processingId === item.id"
            >
                Check Out
            </v-btn>
        </template>
      </v-data-table>
    </v-card>
    
    <div class="mt-4">
      <p>Public Visitor Link: <a href="/go/visitor-entry" target="_blank">/go/visitor-entry</a></p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { visitorService } from '@/services/appLayer/visitorService';

const stats = ref({ active: 0, expected: 0, totalToday: 0 });
const visitors = ref([]);
const loading = ref(true);
const processingId = ref(null);

const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Mobile', key: 'mobile' },
    { title: 'Purpose', key: 'purpose' },
    { title: 'Host', key: 'host' },
    { title: 'Check In', key: 'checkInTime' },
    { title: 'Status', key: 'status' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const loadData = async () => {
    loading.value = true;
    try {
        const [statsData, visitorsData] = await Promise.all([
            visitorService.getStats(),
            visitorService.getAll()
        ]);
        stats.value = statsData;
        visitors.value = visitorsData;
    } catch (e) {
        console.error("Failed to load visitor data", e);
    } finally {
        loading.value = false;
    }
};

const checkOut = async (visitor) => {
    processingId.value = visitor.id;
    try {
        await visitorService.checkOut(visitor.id);
        await loadData();
    } catch (e) {
        console.error("Check out failed", e);
    } finally {
        processingId.value = null;
    }
};

onMounted(() => {
    loadData();
});
</script>
