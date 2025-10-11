<!-- FormStep.vue - Fixed submission handling -->
<template>
  <v-card class="form-step-card" elevation="8">
    <v-card-text class="form-step-content">
      <v-form
        ref="formRef"
        v-model="internalFormValid"
        @submit.prevent="handleFormSubmit"
      >
        <v-row class="field-grid">
          <v-col
            v-for="field in currentStepFields"
            :key="field.key"
            cols="12"
            :md="getFieldColSize(field.type)"
            class="field-column"
          >
            <FieldRenderer
              :field="field"
              :form-data="formData"
              :clients="clients"
              :users="users"
              :user-role="userRole"
              @field-action="$emit('field-action', field, $event)"
              @generate-code="$emit('generate-code', field)"
            />
          </v-col>

          <!-- Priority -->
          <v-col cols="12" class="field-column">
            <v-label class="field-label">
              <v-icon size="18" color="primary" class="mr-2">mdi-flag</v-icon>
              Task priority
            </v-label>
            <v-select
              label="priority"
              :model-value="priority"
              @update:model-value="$emit('update-priority', $event)"
              :items="priorityItems"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              clearable
              placeholder="Select priority"
            >
              <template #item="{ props: itemProps, item }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-icon :color="item.raw.color" class="mr-2">
                      {{ item.raw.icon }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <v-chip
                  :color="item.raw.color"
                  variant="tonal"
                  size="small"
                  class="ma-1"
                >
                  <v-icon :color="item.raw.color" class="mr-1">
                    {{ item.raw.icon }}
                  </v-icon>
                  {{ item.raw.label }}
                </v-chip>
              </template>
            </v-select>
          </v-col>

          <!-- Reschedule toggle (fixed condition) -->
          <v-col cols="12" class="field-column">
            <v-switch
              :model-value="rescheduleEnabled"
              @update:model-value="$emit('update-reschedule-enabled', $event)"
              :disabled="!canEnableReschedule"
              color="primary"
              :label="`Reschedule across multiple days`"
              hide-details="auto"
            />
            <small v-if="!canEnableReschedule" class="text-muted">
              Enable only when From and Due date are on the same day.
            </small>
            <small v-else class="text-success">
              From: {{ normalizedFromDate }} | Due: {{ normalizedDueDate }}
            </small>
          </v-col>

          <!-- Reschedule controls -->
          <template v-if="rescheduleEnabled">
            <!-- Start date (disabled) -->
            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                Start date (fixed)
              </v-label>
              <v-text-field
                label="Start date"
                :value="normalizedFromDate"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                disabled
              />
            </v-col>

            <!-- End date (select) -->
            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar-range</v-icon
                >
                End date
              </v-label>
              <v-text-field
                label="End date"
                :model-value="scheduleEndDate"
                @update:model-value="$emit('update-schedule-end-date', $event)"
                type="date"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                :min="normalizedFromDate || undefined"
                placeholder="Select end date"
              />
            </v-col>

            <!-- Weekday selection -->
            <v-col cols="12" class="field-column">
              <v-label class="field-label">
                <v-icon size="18" color="primary" class="mr-2"
                  >mdi-calendar-week</v-icon
                >
                Repeat on days
              </v-label>
              <div class="weekday-grid">
                <v-checkbox
                  v-for="d in weekdays"
                  :key="d.value"
                  :model-value="selectedDays"
                  @update:model-value="$emit('update-selected-days', $event)"
                  :label="d.label"
                  :value="d.value"
                  hide-details="auto"
                  density="compact"
                  color="primary"
                />
              </div>
              <small class="text-muted">
                Tasks will be created for the selected weekdays between Start
                and End date.
              </small>
            </v-col>
          </template>
        </v-row>

        <!-- Form Actions -->
        <v-card-actions class="form-actions">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            type="submit"
            :disabled="!internalFormValid"
            size="large"
            class="action-btn primary-btn"
            :append-icon="'mdi-check-circle'"
            @click="handleFormSubmit"
          >
            Create Task
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import FieldRenderer from "./FieldRenderer.vue";

const props = defineProps({
  formDetails: Object,
  currentStep: Number,
  totalSteps: Number,
  currentStepFields: Array,
  formData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  formValid: Boolean,
  clients: Array,
  users: Array,
  userRole: String,
  priority: { type: String, default: null },
  rescheduleEnabled: { type: Boolean, default: false },
  scheduleEndDate: { type: String, default: null },
  selectedDays: { type: Array, default: () => [] },
  fromDate: { type: String, default: null },
  dueDate: { type: String, default: null },
});

const emit = defineEmits([
  "next-step",
  "prev-step",
  "field-action",
  "generate-code",
  "update:formValid",
  "update-priority",
  "update-reschedule-enabled",
  "update-schedule-end-date",
  "update-selected-days",
  "update-from-date",
  "update-due-date",
  "submit-form",
]);

const formRef = ref(null);
const internalFormValid = ref(false);

watch(internalFormValid, (val) => {
  emit("update:formValid", val);
});

// FIXED: Handle form submission properly
const handleFormSubmit = (event) => {
  console.log("FormStep handleFormSubmit called");
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  console.log("About to emit submit-form event");
  emit("submit-form");
  console.log("Emitted submit-form event");

  // Fallback - also emit next-step to ensure submission happens
  setTimeout(() => {
    console.log("Fallback: emitting next-step");
    emit("next-step");
  }, 100);
};

const getFieldColSize = (type) => {
  return 12;
};

const priorityItems = [
  { label: "Low", value: "low", icon: "mdi-flag-outline", color: "green" },
  { label: "Medium", value: "medium", icon: "mdi-flag", color: "orange" },
  { label: "High", value: "high", icon: "mdi-flag-checkered", color: "red" },
];

const weekdays = [
  { label: "M", value: "Mon", js: 1 },
  { label: "T", value: "Tue", js: 2 },
  { label: "W", value: "Wed", js: 3 },
  { label: "T", value: "Thu", js: 4 },
  { label: "F", value: "Fri", js: 5 },
  { label: "S", value: "Sat", js: 6 },
  { label: "S", value: "Sun", js: 0 },
];

// Fixed date normalization function
const normalizeDateString = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") {
    // Handle datetime-local format (YYYY-MM-DDTHH:MM)
    if (v.includes("T")) {
      return v.split("T")[0];
    }
    // Handle date format (YYYY-MM-DD)
    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
};

// Fixed computed properties to get dates from form data
const normalizedFromDate = computed(() => {
  // Check multiple possible field names for date fields
  const dateFields = [
    "from",
    "fromDate",
    "from_date",
    "startDate",
    "start_date",
  ];

  // First check props
  if (props.fromDate) {
    return normalizeDateString(props.fromDate);
  }

  // Then check formData for date fields
  for (const field of dateFields) {
    if (props.formData[field]) {
      return normalizeDateString(props.formData[field]);
    }
  }

  return null;
});

const normalizedDueDate = computed(() => {
  // Check multiple possible field names for due date fields
  const dueDateFields = [
    "dueTime",
    "due_time",
    "dueDate",
    "due_date",
    "endDate",
    "end_date",
    "toDate",
    "to_date",
  ];

  // First check props
  if (props.dueDate) {
    return normalizeDateString(props.dueDate);
  }

  // Then check formData for due date fields
  for (const field of dueDateFields) {
    if (props.formData[field]) {
      return normalizeDateString(props.formData[field]);
    }
  }

  return null;
});

// Fixed condition - both dates must exist and be the same
const canEnableReschedule = computed(() => {
  const fromDate = normalizedFromDate.value;
  const dueDate = normalizedDueDate.value;

  console.log("FormStep - Reschedule check:", {
    fromDate,
    dueDate,
    canEnable: !!fromDate && !!dueDate && fromDate === dueDate,
  });

  return !!fromDate && !!dueDate && fromDate === dueDate;
});
</script>

<style scoped>
.form-step-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden;
}

.field-grid {
  margin-bottom: 32px;
}

.field-column {
  transition: all 0.3s ease;
}

.form-actions {
  padding: 0;
  margin-top: 32px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 32px;
}

.action-btn {
  border-radius: 12px !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 140px;
}

.primary-btn {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4) !important;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.text-muted {
  color: #6b7280;
}

.text-success {
  color: #10b981;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
    gap: 16px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
