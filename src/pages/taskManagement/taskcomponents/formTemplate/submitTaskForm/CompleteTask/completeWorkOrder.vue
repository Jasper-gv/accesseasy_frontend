<template>
  <div v-if="open" class="sidebar-overlay">
    <div class="complete-task-sidebar">
      <!-- Header -->
      <header class="sidebar-header">
        <div class="sidebar-title-with-icon">
          <v-icon color="primary" class="mr-2">mdi-clipboard-list</v-icon>
          <h3 class="sidebar-title">
            Complete Work Order: {{ workOrderDetails?.formName || "Task" }}
          </h3>
        </div>
        <button class="close-btn" @click="closeSidebar">
          <X class="icon" />
        </button>
      </header>

      <!-- Content -->
      <div class="sidebar-content">
        <!-- Loading State -->
        <div v-if="fetchingWorkOrder" class="loading-container">
          <v-progress-circular
            indeterminate
            size="32"
            color="primary"
            class="mb-3"
          ></v-progress-circular>
          <p class="loading-text">Loading work order details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="workOrderError" class="error-container">
          <v-icon color="error" size="32" class="mb-2">mdi-alert-circle</v-icon>
          <p class="error-text">{{ workOrderError }}</p>
          <BaseButton
            variant="secondary"
            text="Retry"
            @click="retryFetch"
            class="mt-2"
          />
        </div>

        <!-- Work Order Content -->
        <div v-else-if="workOrderDetails">
          <!-- Task Details Box -->
          <div class="task-details-box">
            <h4 class="section-title">Work Order Details</h4>

            <div class="detail-row">
              <label class="detail-label">Task Type:</label>
              <span class="detail-value">{{
                props.task?.taskType || "N/A"
              }}</span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Task Title:</label>
              <div class="detail-value description-text">
                {{ props.task?.title || "No title provided" }}
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Description:</label>
              <div class="detail-value description-text">
                {{ props.task?.description || "No description provided" }}
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Current Status:</label>
              <div
                class="status-badge"
                :class="getStatusClass(props.task?.status)"
              >
                {{ formatStatus(props.task?.status) }}
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Priority:</label>
              <div
                class="priority-badge"
                :class="getPriorityClass(props.task?.task_priority)"
              >
                {{ formatPriority(props.task?.task_priority) }}
              </div>
            </div>

            <div class="detail-row">
              <label class="detail-label">Assigned to:</label>
              <span class="detail-value">
                {{
                  props.task?.assignedUser && props.task?.employeeId
                    ? `${props.task.assignedUser} - ${props.task.employeeId}`
                    : "Not assigned"
                }}
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Client:</label>
              <span class="detail-value">{{
                props.task?.orgName || "N/A"
              }}</span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Tenant:</label>
              <span class="detail-value">{{
                props.task?.tenantName || "N/A"
              }}</span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Start Date:</label>
              <span class="detail-value">
                {{ formatDate(props.task?.from) || "N/A" }}
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Due Date:</label>
              <span class="detail-value">
                {{ formatDate(props.task?.dueTime) || "N/A" }}
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Location:</label>
              <span class="detail-value">
                {{ props.task?.locationName || "N/A" }}
                <span v-if="props.task?.address">
                  ({{ props.task.address }})
                </span>
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Pincode:</label>
              <span class="detail-value">
                {{ props.task?.pincodes?.join(", ") || "N/A" }}
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Within Range:</label>
              <span class="detail-value">
                {{
                  props.task?.locSize ? `${props.task.locSize} meters` : "N/A"
                }}
              </span>
            </div>

            <div class="detail-row">
              <label class="detail-label">Radius:</label>
              <span class="detail-value">
                {{
                  props.task?.radiusInMeters
                    ? `${props.task.radiusInMeters} meters`
                    : "N/A"
                }}
              </span>
            </div>
          </div>

          <!-- Dynamic Form for Completion Fields -->
          <div v-if="visibleCompletionFields.length > 0" class="form-section">
            <h4 class="section-title">
              <v-icon color="primary" class="mr-2">mdi-form-select</v-icon>
              Complete Task Form
            </h4>

            <v-form
              ref="formRef"
              v-model="formValid"
              @submit.prevent="handleComplete"
            >
              <div class="form-fields">
                <div
                  v-for="field in visibleCompletionFields"
                  :key="field.key"
                  class="form-field"
                  :class="getFieldColSize(field.type)"
                >
                  <label class="field-label">
                    {{ field.label }}
                    <span
                      v-if="isFieldMandatory(field, userRole)"
                      class="required-asterisk"
                      >*</span
                    >
                  </label>

                  <!-- Dynamic Field Rendering -->
                  <component
                    :is="getFieldComponent(field)"
                    v-bind="getFieldProps(field)"
                    :model-value="formData[field.key]"
                    @update:model-value="
                      (value) => updateFieldValue(field.key, value)
                    "
                    :rules="getValidationRules(field, userRole, formData)"
                    :error-messages="getFieldErrorMessages(field)"
                    @click:append-inner="handleFieldAction(field, $event)"
                    @change="handleFieldChange(field, $event)"
                  />

                  <!-- Field-specific additional content -->
                  <template
                    v-if="field.type === 'otp' || field.type === 'happy-code'"
                  >
                    <BaseButton
                      variant="secondary"
                      text="Generate/Resend Code"
                      class="mt-2"
                      @click="generateCode(field)"
                    >
                      <template #icon>
                        <v-icon>mdi-key-variant</v-icon>
                      </template>
                    </BaseButton>
                  </template>

                  <!-- GPS Current Location Status -->
                  <template
                    v-if="
                      getFieldTypeString(field.type) === 'gps-currentLocation'
                    "
                  >
                    <v-progress-linear
                      v-if="currentLocation.loading"
                      indeterminate
                      color="primary"
                      class="mt-2"
                    ></v-progress-linear>
                    <v-alert
                      v-else-if="currentLocation.error"
                      type="error"
                      variant="tonal"
                      class="mt-2"
                      closable
                    >
                      {{ currentLocation.error }}
                    </v-alert>
                    <v-chip
                      v-else-if="formData[field.key]"
                      color="success"
                      variant="tonal"
                      size="small"
                      class="mt-2"
                    >
                      <v-icon start size="small">mdi-check-circle</v-icon>
                      Location Captured
                    </v-chip>
                  </template>

                  <!-- Image Preview -->
                  <template
                    v-if="
                      field.type === 'image' && imageFieldDisplayUrls[field.key]
                    "
                  >
                    <div class="image-preview-container mt-2">
                      <img
                        :src="imageFieldDisplayUrls[field.key]"
                        :alt="field.label"
                        class="image-preview"
                      />
                      <button
                        @click="removeImage(field.key)"
                        class="remove-image-btn"
                      >
                        <X class="icon-sm" />
                      </button>
                    </div>
                  </template>

                  <!-- Unsupported field type warning -->
                  <template v-if="!isFieldTypeSupported(field.type)">
                    <v-chip
                      color="warning"
                      variant="tonal"
                      size="small"
                      class="mt-2"
                    >
                      <v-icon start size="small"
                        >mdi-alert-circle-outline</v-icon
                      >
                      Unsupported field type:
                      {{ getFieldTypeDisplay(field.type) }}
                    </v-chip>
                  </template>
                </div>
              </div>
            </v-form>
          </div>

          <!-- Completion Notes -->
          <div class="notes-section">
            <h4 class="section-title">Completion Notes</h4>
            <textarea
              v-model="completionNotes"
              placeholder="Enter your completion notes here..."
              rows="4"
              class="notes-textarea"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="sidebar-footer">
        <BaseButton
          variant="primary"
          text="Complete Task"
          :loading="loading"
          :disabled="fetchingWorkOrder || !!workOrderError || !canCompleteTask"
          @click="handleComplete"
        />
        <BaseButton
          variant="secondary"
          text="Save Draft"
          :disabled="fetchingWorkOrder || !!workOrderError"
          @click="handleSaveDraft"
        />
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted } from "vue";
import { X } from "lucide-vue-next";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { useTaskCompletionApi } from "@/composables/workorder/completeWorkOrderForm/useTaskCompletionApi";
import {
  getValidationRules,
  isFieldMandatory,
} from "@/utils/createWOF/validationRules";
import { currentUserTenant } from "@/utils/currentUserTenant";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "complete", "saveDraft"]);

// Initialize the API composable
const {
  fetchWorkOrderDetails: apiFetchWorkOrderDetails,
  uploadTaskImage,
  loading: taskApiLoading,
} = useTaskCompletionApi();

// Component state
const open = ref(props.modelValue);
const loading = ref(false);
const completionNotes = ref("");
const formRef = ref(null);
const formValid = ref(true); // Default to true to allow saving non-mandatory fields
const userRole = ref(null); // Will be set dynamically

// Work order specific
const fetchingWorkOrder = ref(false);
const workOrderError = ref(null);
const workOrderDetails = ref(null);

// Form data and validation
const formData = reactive({});
const fieldErrors = reactive({});
const imageFieldFileIds = reactive({});
const imageFieldDisplayUrls = reactive({});

// Location handling
const currentLocation = reactive({
  lat: null,
  lng: null,
  error: null,
  loading: false,
});

// Field type support mapping
const SUPPORTED_FIELD_TYPES = {
  text: true,
  number: true,
  bigtext: true,
  dropdown: true,
  boolean: true,
  image: true,
  gps: true,
  "gps-currentLocation": true,
  clientSelector: true,
  otp: true,
  "happy-code": true,
  date: true,
};

// Fetch user role on mount
onMounted(async () => {
  try {
    userRole.value = await currentUserTenant.getRoleAsync();
    if (!userRole.value) {
      console.error("No user role found");
      workOrderError.value = "User role not found. Please log in again.";
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    workOrderError.value = "Failed to fetch user role. Please try again.";
  }
});

// Watchers
watch(
  () => props.modelValue,
  (val) => (open.value = val),
);
watch(open, (val) => emit("update:modelValue", val));

watch(
  () => props.task,
  async (newTask) => {
    if (newTask && newTask.assignFormId) {
      fetchingWorkOrder.value = true;
      workOrderError.value = null;

      try {
        const result = await apiFetchWorkOrderDetails(newTask.assignFormId);

        if (result.success) {
          workOrderDetails.value = result.data;
          initializeFormData();
        } else {
          workOrderError.value = result.error;
        }
      } catch (err) {
        console.error("Error fetching work order details:", err);
        workOrderError.value =
          err.message || "Failed to fetch work order details.";
      } finally {
        fetchingWorkOrder.value = false;
      }
    } else {
      resetFormState();
    }
  },
  { immediate: true },
);

// Computed properties
const completionFields = computed(() => {
  if (!workOrderDetails.value?.custom_FormTemplate?.fields) return [];
  return workOrderDetails.value.custom_FormTemplate.fields.filter(
    (field) =>
      field.field_type === "completion" ||
      field.field_type === "creation/completion",
  );
});

const visibleCompletionFields = computed(() => {
  if (!userRole.value) return [];
  return completionFields.value.filter((field) =>
    isFieldVisible(field, userRole.value),
  );
});

const canCompleteTask = computed(() => {
  if (!userRole.value) return false;
  return visibleCompletionFields.value.every((field) => {
    if (!isFieldMandatory(field, userRole.value)) return true;
    const value = formData[field.key];
    return value !== null && value !== undefined && value !== "";
  });
});

// Methods
const resetFormState = () => {
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
  Object.keys(imageFieldFileIds).forEach(
    (key) => delete imageFieldFileIds[key],
  );
  Object.keys(imageFieldDisplayUrls).forEach(
    (key) => delete imageFieldDisplayUrls[key],
  );
  completionNotes.value = "";
  workOrderError.value = null;
  workOrderDetails.value = null;
};

const initializeFormData = () => {
  if (!workOrderDetails.value?.custom_FormTemplate?.fields || !userRole.value)
    return;

  visibleCompletionFields.value.forEach((field) => {
    if (formData[field.key] === undefined) {
      const fieldType = getFieldTypeString(field.type);

      switch (fieldType) {
        case "boolean":
          formData[field.key] = false;
          break;
        case "number":
          formData[field.key] = null;
          break;
        case "dropdown":
        case "clientSelector":
          formData[field.key] = null;
          break;
        default:
          formData[field.key] = "";
      }
    }
  });
};

const retryFetch = () => {
  if (props.task?.assignFormId) {
    fetchingWorkOrder.value = true;
    workOrderError.value = null;

    apiFetchWorkOrderDetails(props.task.assignFormId)
      .then((result) => {
        if (result.success) {
          workOrderDetails.value = result.data;
          initializeFormData();
        } else {
          workOrderError.value = result.error;
        }
      })
      .catch((err) => {
        console.error("Error fetching work order details:", err);
        workOrderError.value =
          err.message || "Failed to fetch work order details.";
      })
      .finally(() => {
        fetchingWorkOrder.value = false;
      });
  }
};

// Field type utilities
const getFieldTypeString = (fieldType) => {
  if (typeof fieldType === "object" && fieldType.date === true) {
    return "date";
  }
  return fieldType;
};

const getFieldTypeDisplay = (fieldType) => {
  return getFieldTypeString(fieldType);
};

const isFieldTypeSupported = (fieldType) => {
  const typeString = getFieldTypeString(fieldType);
  return SUPPORTED_FIELD_TYPES[typeString] || false;
};

// Field visibility and validation
const isFieldVisible = (field, role) => {
  const required = field.roleBasedRequired;
  if (
    required &&
    typeof required === "object" &&
    required[role] !== undefined
  ) {
    return required[role];
  }
  return false; // Default to hidden if role not specified
};

// Dynamic field component mapping
const getFieldComponent = (field) => {
  const fieldType = getFieldTypeString(field.type);

  switch (fieldType) {
    case "text":
    case "number":
    case "date":
    case "gps":
    case "gps-currentLocation":
    case "otp":
    case "happy-code":
      return "v-text-field";
    case "bigtext":
      return "v-textarea";
    case "dropdown":
    case "clientSelector":
      return "v-select";
    case "boolean":
      return "v-checkbox";
    case "image":
      return "v-file-input";
    default:
      return "v-text-field";
  }
};

// Get dynamic field properties
const getFieldProps = (field) => {
  const fieldType = getFieldTypeString(field.type);
  const baseProps = {
    label: field.placeholder || field.label,
    variant: "outlined",
    density: "comfortable",
    clearable: fieldType !== "boolean",
  };

  switch (fieldType) {
    case "number":
      return {
        ...baseProps,
        type: "number",
        min: field.validations?.min,
        max: field.validations?.max,
      };

    case "date":
      return {
        ...baseProps,
        type: "date",
      };

    case "bigtext":
      return {
        ...baseProps,
        rows: 3,
        autoGrow: true,
        maxlength: field.validations?.maxLength,
      };

    case "dropdown":
      return {
        ...baseProps,
        items: field.options || [],
        itemTitle: "text",
        itemValue: "value",
      };

    case "clientSelector":
      return {
        ...baseProps,
        items: [], // Assume fetched dynamically
        itemTitle: "orgName",
        itemValue: "id",
        appendInnerIcon: field.input_modes?.qr ? "mdi-qrcode-scan" : undefined,
      };

    case "boolean":
      return {
        label: field.label,
        density: "comfortable",
        color: "primary",
      };

    case "image":
      return {
        ...baseProps,
        accept: "image/jpeg,image/jpg,image/png",
        prependIcon: "mdi-camera",
        showSizeCounter: true,
      };

    case "gps":
    case "gps-currentLocation":
      return {
        ...baseProps,
        readonly: true,
        appendInnerIcon: "mdi-map-marker",
      };

    case "otp":
    case "happy-code":
      return {
        ...baseProps,
        type: field.input_modes?.number !== false ? "number" : "text",
        maxlength: field.validations?.length,
      };

    default:
      return {
        ...baseProps,
        disabled: !isFieldTypeSupported(field.type),
      };
  }
};

// Field interaction handlers
const updateFieldValue = (fieldKey, value) => {
  formData[fieldKey] = value;
  if (fieldErrors[fieldKey]) {
    delete fieldErrors[fieldKey];
  }
};

const handleFieldAction = async (field, event) => {
  const fieldType = getFieldTypeString(field.type);

  if (fieldType === "clientSelector" && field.input_modes?.qr) {
    console.log("Open QR scanner for", field.key);
  } else if (fieldType === "gps") {
    console.log("Open location selector for", field.key);
  } else if (fieldType === "gps-currentLocation") {
    await getCurrentLocation(field.key);
  }
};

const handleFieldChange = async (field, value) => {
  const fieldType = getFieldTypeString(field.type);

  if (fieldType === "image") {
    const file = Array.isArray(value) ? value[0] : value;
    if (file) {
      await handleImageUpload(field.key, file);
    }
  }
};

// Specific field handlers
const getCurrentLocation = async (fieldKey) => {
  currentLocation.loading = true;
  currentLocation.error = null;

  try {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser");
    }

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    currentLocation.lat = lat;
    currentLocation.lng = lng;

    // Save to formData so it can be submitted
    formData[fieldKey] = `${lat},${lng}`;

    console.log("📍 Location found:", lat, lng, "±", accuracy, "meters");
  } catch (error) {
    currentLocation.error = error.message || "Failed to get current location";
    console.error("Geolocation error:", error);
  } finally {
    currentLocation.loading = false;
  }
};

const handleImageUpload = async (fieldKey, file) => {
  try {
    const result = await uploadTaskImage(file, props.task?.id);

    if (result.success) {
      imageFieldFileIds[fieldKey] = result.data.id;
      imageFieldDisplayUrls[fieldKey] = result.data.url;
      formData[fieldKey] = file;
    } else {
      fieldErrors[fieldKey] = result.error;
    }
  } catch (error) {
    fieldErrors[fieldKey] = "Failed to upload image";
    console.error("Image upload error:", error);
  }
};

const removeImage = (fieldKey) => {
  if (imageFieldDisplayUrls[fieldKey]) {
    URL.revokeObjectURL(imageFieldDisplayUrls[fieldKey]);
  }
  delete imageFieldFileIds[fieldKey];
  delete imageFieldDisplayUrls[fieldKey];
  formData[fieldKey] = null;
};

const generateCode = (field) => {
  const length = field.validations?.length || 6;
  const code = Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substr(0, length);
  formData[field.key] = code;
  console.log(`Generated ${field.type} for ${field.label}:`, code);
};

// Utility functions
const getFieldColSize = (fieldType) => {
  const typeString = getFieldTypeString(fieldType);
  switch (typeString) {
    case "bigtext":
    case "image":
      return "full-width";
    case "boolean":
      return "half-width";
    default:
      return "standard-width";
  }
};

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "status-completed";
    case "pending":
      return "status-pending";
    case "inprogress":
      return "status-inprogress";
    case "overdue":
      return "status-overdue";
    default:
      return "status-pending";
  }
};

const formatStatus = (status) => {
  if (!status) return "Pending";
  return (
    status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, " $1")
  );
};

const getPriorityClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "priority-high";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    default:
      return "priority-medium";
  }
};

const formatPriority = (priority) => {
  return priority
    ? priority.charAt(0).toUpperCase() + priority.slice(1)
    : "Medium";
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFieldErrorMessages = (field) => {
  return fieldErrors[field.key] ? [fieldErrors[field.key]] : [];
};

// Main action handlers
const closeSidebar = () => {
  Object.values(imageFieldDisplayUrls).forEach((url) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });

  resetFormState();
  open.value = false;
};

// template.vue
const handleComplete = async () => {
  loading.value = true;
  try {
    let allValid = true;
    for (const field of visibleCompletionFields.value) {
      if (isFieldMandatory(field, userRole.value)) {
        const value = formData[field.key];
        if (value === null || value === undefined || value === "") {
          allValid = false;
          fieldErrors[field.key] =
            field.validations?.message || `${field.label} is required`;
        } else {
          // Validate field against its rules
          const rules = getValidationRules(field, userRole.value, formData);
          for (const rule of rules) {
            const result = rule(value);
            if (result !== true) {
              allValid = false;
              fieldErrors[field.key] = result;
            }
          }
        }
      }
    }

    if (!allValid) {
      loading.value = false;
      return;
    }

    const completionData = {
      task: props.task,
      notes: completionNotes.value,
      formData: { ...formData },
      imageFileIds: { ...imageFieldFileIds },
      workOrderDetails: workOrderDetails.value,
      isInternalTask: false,
    };

    emit("complete", completionData);
    closeSidebar();
  } finally {
    loading.value = false;
  }
};

const handleSaveDraft = () => {
  const draftData = {
    task: props.task,
    notes: completionNotes.value,
    formData: { ...formData },
    imageFileIds: { ...imageFieldFileIds },
    workOrderDetails: workOrderDetails.value,
    isInternalTask: false,
  };

  emit("saveDraft", draftData);
  closeSidebar();
};
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 60px;
  right: 0;
  bottom: 0;
  width: 460px;
  z-index: 999;
  pointer-events: none;
}

.complete-task-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;
  pointer-events: auto;
  border-left: 1px solid #e5e7eb;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #fff;
  margin-top: 10px;
}

.sidebar-title-with-icon {
  display: flex;
  align-items: center;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.icon {
  width: 20px;
  height: 20px;
  color: #374151;
}

.icon-sm {
  width: 16px;
  height: 16px;
  color: #374151;
}

.sidebar-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: #fff;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.error-text {
  font-size: 0.875rem;
  color: #991b1b;
  margin: 0 0 1rem 0;
}

.task-details-box {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-section {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.75rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  min-width: 100px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.875rem;
  color: #1e293b;
  flex: 1;
}

.description-text {
  background: #fff;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  min-height: 60px;
  word-wrap: break-word;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-completed {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-inprogress {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.status-overdue {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-high {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.priority-medium {
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
}

.priority-low {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  width: 100%;
}

.form-field.half-width {
  width: 50%;
}

.form-field.standard-width {
  width: 100%;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-asterisk {
  color: #ef4444;
  font-weight: 600;
}

.image-preview-container {
  position: relative;
  display: inline-block;
}

.image-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
}

.remove-image-btn {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: #dc2626;
}

.notes-section {
  margin-bottom: 1rem;
}

.notes-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.notes-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.sidebar-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: #fff;
}

@media (max-width: 1024px) {
  .sidebar-overlay {
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  .complete-task-sidebar {
    width: 90%;
    max-width: 460px;
    margin-left: auto;
  }
}
</style>
