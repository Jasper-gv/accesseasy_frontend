<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Flows</h1>
      <v-btn prepend-icon="mdi-plus" color="primary" variant="flat">
        Create New Flow
      </v-btn>
    </div>

    <v-row>
      <v-col v-for="flow in flows" :key="flow.id" cols="12" md="6">
        <v-card border elevation="0" class="h-100">
          <v-card-item>
            <template v-slot:prepend>
              <v-avatar color="primary" variant="tonal" class="mr-2">
                <v-icon>mdi-source-branch</v-icon>
              </v-avatar>
            </template>
            <v-card-title>{{ flow.name }}</v-card-title>
            <v-card-subtitle>
              Grants: {{ getAccessLevelName(flow.accessLevelId) }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <div class="mb-3">
              <div class="text-caption font-weight-bold mb-1">REQUIRED DATA</div>
              <div class="d-flex gap-2 flex-wrap">
                <v-chip v-for="data in flow.requiredData" :key="data" size="small" variant="outlined">
                  {{ data }}
                </v-chip>
              </div>
            </div>

            <div class="mb-3">
              <div class="text-caption font-weight-bold mb-1">PARKING RULE</div>
              <div class="text-body-2 text-grey-darken-1">
                <v-icon size="small" class="mr-1">mdi-parking</v-icon>
                {{ flow.parkingRule }}
              </div>
            </div>

            <div v-if="flow.approvalRequired" class="d-flex align-center text-warning">
              <v-icon size="small" class="mr-1">mdi-shield-alert</v-icon>
              <span class="text-caption font-weight-bold">Approval Required</span>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="grey-darken-1">Configure</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { accessService } from '@/services/accessService';

const route = useRoute();
const placeId = route.params.placeId;
const flows = ref([]);
const accessLevels = ref([]);

onMounted(async () => {
  try {
    const [flowsData, levelsData] = await Promise.all([
      accessService.getPlaceFlows(placeId),
      accessService.getGlobalAccessLevels()
    ]);
    flows.value = flowsData;
    accessLevels.value = levelsData;
  } catch (error) {
    console.error('Error loading flows:', error);
  }
});

const getAccessLevelName = (id) => {
  const level = accessLevels.value.find(l => l.id === id);
  return level ? level.name : 'Unknown';
};
</script>
