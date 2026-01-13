<template>
  <div class="h-100 d-flex flex-column">
    <div class="px-6 pt-6 pb-2">
      <h1 class="text-h4 font-weight-bold">Location Templates</h1>
      <div class="text-subtitle-1 text-grey">Manage visitor templates for {{ currentPlace?.name || 'this location' }}</div>
    </div>
    
    <div class="flex-grow-1 pa-6">
      <!-- Reuse existing templates component, scoped to this place -->
      <component 
        :is="currentViewComponent" 
        v-bind="currentViewProps"
        @change-view="handleChangeView"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { accessService } from '@/services/accessService';
import VisitorTemplates from '@/pages/visitor/admin/VisitorTemplates.vue';
import VisitorTemplateEditor from '@/pages/visitor/admin/VisitorTemplateEditor.vue';

const route = useRoute();
const placeId = computed(() => route.params.placeId);
const currentPlace = ref(null);

const currentView = ref('list');
const selectedTemplateId = ref(null);

const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'create':
    case 'edit':
      return VisitorTemplateEditor;
    case 'list':
    default:
      return VisitorTemplates;
  }
});

const currentViewProps = computed(() => {
  switch (currentView.value) {
    case 'create':
      return { 
        mode: 'create',
        placeId: placeId.value 
      };
    case 'edit':
      return { 
        mode: 'edit', 
        templateId: selectedTemplateId.value,
        placeId: placeId.value 
      };
    case 'list':
    default:
      return { 
        scope: 'local', 
        placeId: placeId.value 
      };
  }
});

const handleChangeView = (view, data = {}) => {
  currentView.value = view;
  if (data.id) {
    selectedTemplateId.value = data.id;
  } else {
    selectedTemplateId.value = null;
  }
};

onMounted(async () => {
  if (placeId.value) {
    currentPlace.value = await accessService.getPlaceById(placeId.value);
  }
});
</script>
