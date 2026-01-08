<template>
  <div class="visitor-badge-designer h-100 d-flex flex-column">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center pa-4 border-b bg-white">
      <div>
        <h2 class="text-h6 font-weight-bold">Badge Designer</h2>
        <div class="text-caption text-grey-darken-1">
          Customize the visitor badge layout and branding.
        </div>
      </div>
      <div class="d-flex gap-3">
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <BaseButton variant="primary" @click="saveBadge" :loading="saving">Save Layout</BaseButton>
      </div>
    </div>

    <div class="d-flex flex-grow-1 overflow-hidden">
      <!-- Sidebar: Elements & Branding -->
      <div class="designer-sidebar border-r bg-grey-lighten-5 pa-4 overflow-y-auto">
        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-3 text-uppercase text-grey-darken-1">Elements</div>
          <div 
            v-for="element in availableElements" 
            :key="element.type"
            class="draggable-element mb-2"
            draggable="true"
            @dragstart="onDragStart($event, element)"
          >
            <v-icon :icon="element.icon" size="small" class="mr-2" />
            {{ element.label }}
          </div>
        </div>

        <v-divider class="mb-6" />

        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-3 text-uppercase text-grey-darken-1">Badge Settings</div>
          <v-text-field
            v-model="badgeName"
            label="Badge Name"
            placeholder="e.g. Standard Visitor Badge"
            variant="outlined"
            density="compact"
            class="mb-3"
            :rules="[v => !!v || 'Badge name is required']"
          />
        </div>

        <v-divider class="mb-6" />

        <div class="mb-6">
          <div class="text-subtitle-2 font-weight-bold mb-3 text-uppercase text-grey-darken-1">Branding</div>
          <v-text-field
            v-model="branding.companyName"
            label="Company Name"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-color-picker
            v-model="branding.accentColor"
            mode="hex"
            hide-inputs
            hide-sliders
            show-swatches
            class="mb-3 w-100"
          />
          <v-file-input
            label="Upload Logo"
            variant="outlined"
            density="compact"
            prepend-icon="mdi-camera"
            accept="image/*"
            hide-details
          />
        </div>
      </div>

      <!-- Main Canvas -->
      <div class="designer-canvas flex-grow-1 bg-grey-lighten-3 pa-8 overflow-y-auto d-flex justify-center align-center">
        <div 
          class="badge-canvas bg-white elevation-3 position-relative overflow-hidden"
          :style="{ borderColor: branding.accentColor }"
          @dragover.prevent
          @drop="onDrop"
        >
          <!-- Header (Branding) -->
          <div class="badge-header pa-4 text-center" :style="{ backgroundColor: branding.accentColor, color: 'white' }">
            <div class="text-h6 font-weight-bold">{{ branding.companyName || 'Company Name' }}</div>
            <div class="text-caption">VISITOR PASS</div>
          </div>

          <!-- Content Area -->
          <div class="badge-content pa-4 h-100 position-relative">
            <div 
              v-for="(item, index) in badgeElements" 
              :key="index"
              class="badge-element-item position-absolute"
              :style="{ top: item.y + 'px', left: item.x + 'px' }"
              @mousedown="startDrag($event, index)"
            >
              <div class="element-content pa-2 border border-dashed rounded d-flex align-center justify-center bg-grey-lighten-5">
                <v-icon :icon="item.icon" size="small" class="mr-2" />
                <span class="text-caption font-weight-bold">{{ item.label }}</span>
                <v-btn 
                  v-if="!item.locked"
                  icon 
                  variant="text" 
                  size="x-small" 
                  color="error" 
                  class="delete-btn"
                  @click.stop="removeElement(index)"
                >
                  <v-icon size="small">mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="badgeElements.length === 0" class="d-flex align-center justify-center h-100 text-grey-lighten-1">
              <div class="text-center">
                <v-icon icon="mdi-drag-variant" size="large" class="mb-2" />
                <div>Drag elements here</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="badge-footer pa-2 text-center text-caption text-grey">
            Valid for one day only
          </div>
        </div>
      </div>

      <!-- Properties Panel (Right) -->
      <div class="designer-properties border-l bg-white pa-4 overflow-y-auto" style="width: 250px;">
        <div v-if="selectedElementIndex !== null" class="properties-content">
          <div class="text-subtitle-2 font-weight-bold mb-4">Element Properties</div>
          <v-text-field
            v-model="badgeElements[selectedElementIndex].x"
            label="X Position"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model="badgeElements[selectedElementIndex].y"
            label="Y Position"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
        </div>
        <div v-else class="text-center text-grey mt-10">
          <v-icon icon="mdi-cursor-default-click" size="large" class="mb-2" />
          <div>Select an element to edit properties</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/buttons/BaseButton.vue';
import { visitorService } from '@/services/visitorService';

const emit = defineEmits(['change-view']);

const router = useRouter();
const saving = ref(false);
const selectedElementIndex = ref(null);

const badgeName = ref(''); // Added for badge name

const branding = ref({
  companyName: 'Acme Corp',
  accentColor: '#1976D2',
  logo: null,
});

const availableElements = [
  { type: 'photo', label: 'Visitor Photo', icon: 'mdi-camera' },
  { type: 'host', label: 'Host Name', icon: 'mdi-account-tie' },
  { type: 'date', label: 'Visit Date', icon: 'mdi-calendar' },
  // { type: 'vehicle', label: 'Vehicle Number', icon: 'mdi-car' },
];

const badgeElements = ref([
  { id: 'default-name', type: 'full_name', label: 'Full Name', icon: 'mdi-account', x: 20, y: 20, locked: true },
  { id: 'default-phone', type: 'phone', label: 'Phone Number', icon: 'mdi-phone', x: 20, y: 60, locked: true },
  { id: 'default-host', type: 'hostName', label: 'Host Name', icon: 'mdi-account-tie', x: 20, y: 100, locked: true },
]);

const onDragStart = (event, element) => {
  event.dataTransfer.dropEffect = 'copy';
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/json', JSON.stringify(element));
};

const onDrop = (event) => {
  const data = event.dataTransfer.getData('application/json');
  if (data) {
    const element = JSON.parse(data);
    // Calculate relative position
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - 50; // Center offset
    const y = event.clientY - rect.top - 20;

    badgeElements.value.push({ 
      ...element, 
      x: Math.max(0, x), 
      y: Math.max(0, y),
      id: Date.now() 
    });
    selectedElementIndex.value = badgeElements.value.length - 1;
  }
};

const removeElement = (index) => {
  if (badgeElements.value[index].locked) return;
  badgeElements.value.splice(index, 1);
  selectedElementIndex.value = null;
};

// Simple drag implementation for elements on canvas
const startDrag = (event, index) => {
  selectedElementIndex.value = index;
  const element = badgeElements.value[index];
  const startX = event.clientX;
  const startY = event.clientY;
  const initialX = element.x;
  const initialY = element.y;

  const onMouseMove = (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    element.x = Math.max(0, initialX + dx);
    element.y = Math.max(0, initialY + dy);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const saveBadge = async () => {
  if (!badgeName.value) {
    alert('Please enter a badge name');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name: badgeName.value,
      default_elements: badgeElements.value.map(el => ({
        key: el.type,
        label: el.label
      })),
      custom_elements: [], // Add logic for custom elements if needed
      branding: branding.value
    };

    await visitorService.createVisitorBadge(payload);
    console.log('Badge saved:', payload);
    emit('change-view', 'edit'); // Return to editor
  } catch (error) {
    console.error('Error saving badge:', error);
    alert('Failed to save badge');
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  emit('change-view', 'edit'); // Return to editor
};
</script>

<style scoped>
.visitor-badge-designer {
  background: #f5f7fa;
}

.designer-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.draggable-element {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
  cursor: grab;
  transition: all 0.2s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.draggable-element:hover {
  border-color: #667eea;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}

.badge-canvas {
  width: 350px; /* Standard badge width approx */
  height: 500px; /* Standard badge height approx */
  border-radius: 12px;
  border-top: 8px solid; /* Accent color border */
  display: flex;
  flex-direction: column;
}

.badge-element-item {
  cursor: move;
  user-select: none;
}

.element-content {
  background: rgba(255, 255, 255, 0.9);
  min-width: 120px;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
  position: absolute;
  top: -10px;
  right: -10px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.badge-element-item:hover .delete-btn {
  opacity: 1;
}
</style>
