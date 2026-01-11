<template>
  <div class="h-100 d-flex flex-column">
    <div class="px-6 pt-6 pb-2">
      <h1 class="text-h4 font-weight-bold">Security Operations</h1>
      <div class="text-subtitle-1 text-grey">Manage access for {{ currentPlace?.name || 'this location' }}</div>
    </div>
    
    <div class="flex-grow-1 pa-6">
      <!-- Reuse existing security dashboard -->
      <VisitorSecurityDashboard :place-id="placeId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { accessService } from '@/services/accessService';
import VisitorSecurityDashboard from '@/pages/visitor/security/VisitorSecurityDashboard.vue';

const route = useRoute();
const placeId = computed(() => route.params.placeId);
const currentPlace = ref(null);

onMounted(async () => {
  if (placeId.value) {
    currentPlace.value = await accessService.getPlaceById(placeId.value);
  }
});
</script>
