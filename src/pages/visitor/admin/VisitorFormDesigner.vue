<template>
  <div class="visitor-form-designer h-100 d-flex flex-column">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center pa-4 border-b bg-white">
      <div>
        <h2 class="text-h6 font-weight-bold">Form Designer</h2>
        <div class="text-caption text-grey-darken-1">
          Customize the visitor registration form.
        </div>
      </div>
      <div class="d-flex gap-3">
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <BaseButton variant="primary" @click="saveForm" :loading="saving">Save Form</BaseButton>
      </div>
    </div>

    <div class="d-flex flex-grow-1 overflow-hidden">
      <!-- Sidebar: Fields -->
      <div class="designer-sidebar border-r bg-grey-lighten-5 pa-4 overflow-y-auto">
        <div class="text-subtitle-2 font-weight-bold mb-3 text-uppercase text-grey-darken-1">Available Fields</div>
        
        <div class="mb-4">
          <div class="text-caption font-weight-bold mb-2">Standard Fields</div>
          <div 
            v-for="field in standardFields" 
            :key="field.type"
            class="draggable-field mb-2"
            draggable="true"
            @dragstart="onDragStart($event, field)"
          >
            <v-icon :icon="field.icon" size="small" class="mr-2" />
            {{ field.label }}
          </div>
        </div>

        <div>
          <div class="text-caption font-weight-bold mb-2">Custom Fields</div>
          <div 
            v-for="field in customFields" 
            :key="field.type"
            class="draggable-field mb-2"
            draggable="true"
            @dragstart="onDragStart($event, field)"
          >
            <v-icon :icon="field.icon" size="small" class="mr-2" />
            {{ field.label }}
          </div>
        </div>
      </div>

      <!-- Main Canvas: Preview -->
      <div class="designer-canvas flex-grow-1 bg-grey-lighten-3 pa-8 overflow-y-auto">
        <div class="canvas-container mx-auto bg-white rounded-lg elevation-2 pa-6" style="max-width: 600px; min-height: 600px;">
          <div class="text-center mb-6">
            <v-text-field
              v-model="formName"
              variant="plain"
              density="compact"
              class="text-h5 font-weight-bold centered-input"
              hide-details
              placeholder="Form Name"
            />
            <div class="text-body-2 text-grey">Please fill in your details</div>
          </div>

          <div 
            class="drop-zone"
            @dragover.prevent
            @drop="onDrop"
          >
            <div v-if="formFields.length === 0" class="empty-state text-center pa-8 border-dashed rounded text-grey">
              <v-icon icon="mdi-drag-variant" size="large" class="mb-2" />
              <div>Drag and drop fields here</div>
            </div>

            <div 
              v-for="(field, index) in formFields" 
              :key="index"
              class="form-field-item mb-4 pa-3 rounded border position-relative"
              :class="{ 'active': selectedFieldIndex === index }"
              @click="selectField(index)"
            >
              <div class="d-flex justify-space-between align-center mb-1">
                <label class="text-subtitle-2 font-weight-medium">
                  {{ field.label }}
                  <span v-if="field.required" class="text-error">*</span>
                </label>
                <div class="field-actions">
                  <v-btn v-if="!field.locked" icon variant="text" size="x-small" color="error" @click.stop="removeField(index)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
              
              <!-- Field Preview -->
              <div class="field-preview">
                <v-text-field
                  v-if="['text', 'email', 'phone'].includes(field.type)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  disabled
                  :placeholder="field.placeholder"
                />
                <v-select
                  v-else-if="field.type === 'select'"
                  variant="outlined"
                  density="compact"
                  hide-details
                  disabled
                  :items="field.options"
                  :placeholder="field.placeholder"
                />
                <v-textarea
                  v-else-if="field.type === 'textarea'"
                  variant="outlined"
                  density="compact"
                  hide-details
                  disabled
                  rows="3"
                  :placeholder="field.placeholder"
                />
                <v-checkbox
                  v-else-if="field.type === 'checkbox'"
                  hide-details
                  disabled
                  :label="field.placeholder || 'Checkbox'"
                />
              </div>
            </div>
          </div>
          
          <div class="mt-6">
            <v-btn block color="primary" size="large" disabled>Submit</v-btn>
          </div>
        </div>
      </div>

      <!-- Properties Panel -->
      <div class="designer-properties border-l bg-white pa-4 overflow-y-auto" style="width: 300px;">
        <div v-if="selectedField" class="properties-content">
          <div class="text-subtitle-2 font-weight-bold mb-4">Field Properties</div>
          
          <v-text-field
            v-model="selectedField.label"
            label="Label"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          
          <v-text-field
            v-model="selectedField.placeholder"
            label="Placeholder"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          
          <v-switch
            v-model="selectedField.required"
            label="Required"
            color="primary"
            hide-details
            density="compact"
            class="mb-3"
          />

          <div v-if="selectedField.type === 'select'" class="mt-4">
            <div class="text-caption font-weight-bold mb-2">Options</div>
            <div v-for="(option, idx) in selectedField.options" :key="idx" class="d-flex gap-2 mb-2">
              <v-text-field
                v-model="selectedField.options[idx]"
                variant="outlined"
                density="compact"
                hide-details
              />
              <v-btn icon variant="text" size="small" color="error" @click="removeOption(idx)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </div>
            <v-btn variant="tonal" size="small" block @click="addOption" prepend-icon="mdi-plus">
              Add Option
            </v-btn>
          </div>
        </div>
        <div v-else class="text-center text-grey mt-10">
          <v-icon icon="mdi-cursor-default-click" size="large" class="mb-2" />
          <div>Select a field to edit properties</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { visitorService } from '@/services/visitorService';
import BaseButton from '@/components/common/buttons/BaseButton.vue';

const emit = defineEmits(['change-view']);

const router = useRouter();
const saving = ref(false);
const selectedFieldIndex = ref(null);
const formName = ref('New Visitor Form');

const formFields = ref([
  { id: 'default-name', type: 'text', label: 'Full Name', icon: 'mdi-account', required: true, placeholder: 'Enter full name', locked: true },
  { id: 'default-email', type: 'email', label: 'Email Address', icon: 'mdi-email', required: true, placeholder: 'Enter email address', locked: true },
  { id: 'default-phone', type: 'phone', label: 'Phone Number', icon: 'mdi-phone', required: true, placeholder: 'Enter phone number', locked: true },
]);

const selectedField = computed(() => {
  if (selectedFieldIndex.value !== null && formFields.value[selectedFieldIndex.value]) {
    return formFields.value[selectedFieldIndex.value];
  }
  return null;
});

const standardFields = [
  { type: 'text', label: 'Company', icon: 'mdi-domain', required: false, placeholder: 'Enter company name' },
];

const customFields = [
  { type: 'text', label: 'Short Text', icon: 'mdi-format-text', required: false, placeholder: '' },
  { type: 'textarea', label: 'Long Text', icon: 'mdi-text-box-outline', required: false, placeholder: '' },
  { type: 'select', label: 'Dropdown', icon: 'mdi-form-dropdown', required: false, placeholder: 'Select an option', options: ['Option 1', 'Option 2'] },
  { type: 'checkbox', label: 'Checkbox', icon: 'mdi-checkbox-marked', required: false, placeholder: 'I agree' },
];

const onDragStart = (event, field) => {
  event.dataTransfer.dropEffect = 'copy';
  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/json', JSON.stringify(field));
};

const onDrop = (event) => {
  const data = event.dataTransfer.getData('application/json');
  if (data) {
    const field = JSON.parse(data);
    formFields.value.push({ ...field, id: Date.now() }); // Clone and add ID
    selectedFieldIndex.value = formFields.value.length - 1; // Select new field
  }
};

const selectField = (index) => {
  selectedFieldIndex.value = index;
};

const removeField = (index) => {
  if (formFields.value[index].locked) return;
  formFields.value.splice(index, 1);
  if (selectedFieldIndex.value === index) {
    selectedFieldIndex.value = null;
  } else if (selectedFieldIndex.value > index) {
    selectedFieldIndex.value--;
  }
};

const addOption = () => {
  if (selectedField.value && selectedField.value.options) {
    selectedField.value.options.push(`Option ${selectedField.value.options.length + 1}`);
  }
};

const removeOption = (idx) => {
  if (selectedField.value && selectedField.value.options) {
    selectedField.value.options.splice(idx, 1);
  }
};

const saveForm = async () => {
  if (formFields.value.length === 0) {
    alert('Please add at least one field to the form.');
    return;
  }

  saving.value = true;
  try {
    // Separate default fields (locked mandatory fields) from custom fields
    const defaultFields = formFields.value
      .filter(field => field.locked)
      .map(field => ({
        type: field.type,
        label: field.label,
        required: field.required
      }));

    const customFields = formFields.value
      .filter(field => !field.locked)
      .map(field => {
        const fieldConfig = {
          type: field.type,
          label: field.label,
          required: field.required
        };
        
        // Include options for select/dropdown fields
        if (field.type === 'select' && field.options) {
          fieldConfig.options = field.options;
        }
        
        return fieldConfig;
      });

    // Prepare form data with only metadata (no visitor input data)
    const formData = {
      name: formName.value,
      default_fields: defaultFields,
      custom_fields: customFields,
    };
    
    await visitorService.createVisitorForm(formData);
    emit('change-view', 'edit'); // Return to template editor (or list)
  } catch (error) {
    console.error('Error saving form:', error);
    alert('Failed to save form');
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  emit('change-view', 'edit'); // Return to editor
};
</script>

<style scoped>
.visitor-form-designer {
  background: #f5f7fa;
}

.designer-sidebar {
  width: 250px;
  flex-shrink: 0;
}

.draggable-field {
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

.draggable-field:hover {
  border-color: #667eea;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}

.form-field-item {
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.form-field-item:hover {
  background-color: #f9fafb;
}

.form-field-item.active {
  border-color: #667eea;
  background-color: #f0f4ff;
}

.empty-state {
  border: 2px dashed #e0e0e0;
}
</style>
