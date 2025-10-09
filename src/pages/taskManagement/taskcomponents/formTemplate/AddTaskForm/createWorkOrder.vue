<!-- @/components/WorkOrdeForm_Components/form/InternalTaskForm.vue"; -->
<template>
  <!-- Right drawer that sits beside page content -->
  <v-navigation-drawer
    v-if="!embedded"
    :model-value="open"
    @update:model-value="onDrawerUpdate"
    location="right"
    width="460"
    :temporary="false"
    :scrim="false"
    class="cwo-drawer"
  >
    <div class="drawer-root">
      <!-- Header (sticky) -->
      <header class="drawer-header">
        <div class="title-wrap">
          <v-icon color="primary" class="mr-2">mdi-file-document-plus</v-icon>
          <h3 class="title">Create Work Order</h3>
        </div>
        <v-btn icon variant="text" @click="emit('update:open', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </header>

      <!-- Body (scrollable) -->
      <section class="drawer-body" ref="bodyEl">
        <!-- Global toast -->
        <ToastNotification
          :show="showToast"
          :message="toastMessage"
          :type="toastType"
        />

        <!-- 1) Choose form -->
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="selectedTemplateId"
                  :items="formOptions"
                  :loading="loadingForms"
                  :disabled="loadingForms"
                  item-title="formName"
                  item-value="id"
                  variant="outlined"
                  prepend-inner-icon="mdi-format-list-bulleted"
                  hide-details="auto"
                  clearable
                  @update:model-value="onSelectTemplate"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 2) Loading / Error -->
        <LoadingState
          v-if="selectedTemplateId && loading"
          title="Loading form..."
          message="Please wait while we fetch the form details."
          :full-height="false"
        />
        <ErrorState v-else-if="selectedTemplateId && error" :error="error" />

        <!-- 3) Dynamic Form (steps) -->
        <div v-else-if="formDetails">
          <FormStep
            :form-details="formDetails"
            :current-step="currentFormStep"
            :total-steps="totalFormSteps"
            :current-step-fields="currentStepFields"
            :form-data="workOrderFormData"
            :form-valid="formValid"
            :clients="clients"
            :users="users"
            :user-role="userRole"
            :priority="priority"
            :reschedule-enabled="rescheduleEnabled"
            :schedule-end-date="scheduleEndDate"
            :selected-days="selectedDays"
            :from-date="fromDate"
            :due-date="dueDate"
            @next-step="nextFormStep"
            @prev-step="prevFormStep"
            @open-qr-scanner="openQrScanner"
            @open-location-selector="openLocationSelector"
            @generate-code="generateCode"
            @field-action="handleFieldAction"
            @update-priority="updatePriority"
            @update-reschedule-enabled="updateRescheduleEnabled"
            @update-schedule-end-date="updateScheduleEndDate"
            @update-selected-days="updateSelectedDays"
            @update-from-date="updateFromDate"
            @update-due-date="updateDueDate"
            @submit-form="handleSubmit"
          />
          <div class="pb-safe" />
        </div>

        <!-- 4) Empty hint -->
        <v-alert v-else type="info" variant="tonal">
          Select a form to start creating a work order.
        </v-alert>
      </section>

      <!-- Footer note (sticky gap only; actions live inside FormStep) -->
      <footer class="drawer-footer">
        <small class="muted">
          All changes validate in-place. Scroll the form to access the Create
          Task button.
        </small>
      </footer>
    </div>

    <!-- Dialogs / Overlays -->
    <EmailDialog
      :show="showEmailDialog"
      :client-email="clientEmail"
      :email-rules="emailRules"
      @update-and-submit="updateClientEmailAndSubmit"
      @skip="skipEmailProcess"
      @update:show="showEmailDialog = $event"
      @update:client-email="clientEmail = $event"
    />

    <QrScanner
      :show="showQrScannerDialog"
      :qr-image-file="qrImageFile"
      :decoded-content="decodedQrContent"
      :scan-error="qrScanError"
      @close="closeQrScanner"
      @apply="applyQrContent"
      @update:qr-image-file="qrImageFile = $event"
      @update:decoded-content="decodedQrContent = $event"
      @update:scan-error="qrScanError = $event"
    />

    <LocationSelector
      :key="showLocationSelectorDialog ? 'ls-open' : 'ls-closed'"
      :show="showLocationSelectorDialog"
      :location-types="locationTypes"
      :selected-loc-type="selectedLocType"
      :display-location-details="displayLocationDetails"
      :reverse-geocoded-address="reverseGeocodedAddress"
      :location-error="locationError"
      @close="closeLocationSelector"
      @apply="onApplyLocation"
      @update:selected-loc-type="selectedLocType = $event"
    />
  </v-navigation-drawer>

  <!-- Embedded mode (used inside another drawer) -->
  <div v-else>
    <!-- Only the body content; outer drawer/header/close button live in the parent -->
    <section class="drawer-body" ref="bodyEl">
      <ToastNotification
        :show="showToast"
        :message="toastMessage"
        :type="toastType"
      />

      <v-card elevation="2" rounded="lg" class="mb-4">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-select
                v-model="selectedTemplateId"
                :items="formOptions"
                :loading="loadingForms"
                :disabled="loadingForms"
                item-title="formName"
                item-value="id"
                variant="outlined"
                prepend-inner-icon="mdi-format-list-bulleted"
                hide-details="auto"
                clearable
                @update:model-value="onSelectTemplate"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <LoadingState
        v-if="selectedTemplateId && loading"
        title="Loading form..."
        message="Please wait while we fetch the form details."
        :full-height="false"
      />
      <ErrorState v-else-if="selectedTemplateId && error" :error="error" />

      <div v-else-if="formDetails">
        <FormStep
          :form-details="formDetails"
          :current-step="currentFormStep"
          :total-steps="totalFormSteps"
          :current-step-fields="currentStepFields"
          :form-data="workOrderFormData"
          :form-valid="formValid"
          :clients="clients"
          :users="users"
          :user-role="userRole"
          :priority="priority"
          :reschedule-enabled="rescheduleEnabled"
          :schedule-end-date="scheduleEndDate"
          :selected-days="selectedDays"
          :from-date="fromDate"
          :due-date="dueDate"
          @next-step="nextFormStep"
          @prev-step="prevFormStep"
          @open-qr-scanner="openQrScanner"
          @open-location-selector="openLocationSelector"
          @generate-code="generateCode"
          @field-action="handleFieldAction"
          @update-priority="updatePriority"
          @update-reschedule-enabled="updateRescheduleEnabled"
          @update-schedule-end-date="updateScheduleEndDate"
          @update-selected-days="updateSelectedDays"
          @update-from-date="updateFromDate"
          @update-due-date="updateDueDate"
        />
        <div class="pb-safe" />
      </div>

      <v-alert v-else type="info" variant="tonal">
        Select a form to start creating a work order.
      </v-alert>
    </section>

    <!-- Dialogs / Overlays still render (scoped to this component) -->
    <EmailDialog
      :show="showEmailDialog"
      :client-email="clientEmail"
      :email-rules="emailRules"
      @update-and-submit="updateClientEmailAndSubmit"
      @skip="skipEmailProcess"
      @update:show="showEmailDialog = $event"
      @update:client-email="clientEmail = $event"
    />

    <QrScanner
      :show="showQrScannerDialog"
      :qr-image-file="qrImageFile"
      :decoded-content="decodedQrContent"
      :scan-error="qrScanError"
      @close="closeQrScanner"
      @apply="applyQrContent"
      @update:qr-image-file="qrImageFile = $event"
      @update:decoded-content="decodedQrContent = $event"
      @update:scan-error="qrScanError = $event"
    />

    <LocationSelector
      :key="showLocationSelectorDialog ? 'ls-open' : 'ls-closed'"
      :show="showLocationSelectorDialog"
      :location-types="locationTypes"
      :selected-loc-type="selectedLocType"
      :display-location-details="displayLocationDetails"
      :reverse-geocoded-address="reverseGeocodedAddress"
      :location-error="locationError"
      @close="closeLocationSelector"
      @apply="onApplyLocation"
      @update:selected-loc-type="selectedLocType = $event"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useFormApi as formApi } from "@/composables/workorder/createWorkOrderForm/useFormApi";
import { useLocationApi as locationApi } from "@/composables/workorder/createWorkOrderForm/useLocationApi";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import { maybeSendCodes } from "@/composables/workorder/createWorkOrderForm/useOtpHappyCode";
import FormStep from "@/components/WorkOrdeForm_Components/form/FormStep.vue";
import { useToast as toastApi } from "@/composables/workorder/createWorkOrderForm/useToast";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";
import EmailDialog from "@/components/WorkOrdeForm_Components/form/EmailDialog.vue";
import LoadingState from "@/components/common/states/LoadingState.vue";
import ErrorState from "@/components/WorkOrdeForm_Components/form/ErrorState.vue";
import QrScanner from "@/components/WorkOrdeForm_Components/form/QrScanner.vue";
import LocationSelector from "@/components/WorkOrdeForm_Components/form/LocationSelector.vue";

// Props / Emits
const props = defineProps({
  open: { type: Boolean, default: false },
  embedded: { type: Boolean, default: false },
});
const emit = defineEmits(["update:open", "created"]);

// API + Stores
const {
  formDetails,
  clients,
  users,
  loading,
  error,
  fetchFormDetails,
  fetchDropdownData,
  submitForm,
} = formApi();

const {
  locationTypes,
  selectedLocType,
  displayLocationDetails,
  reverseGeocodedAddress,
  locationError,
  showLocationSelectorDialog,
  openLocationSelector,
  closeLocationSelector,
  applyLocation,
  currentGpsFieldKey,
} = locationApi();

const { showToast, toastMessage, toastType, showValidationToast } = toastApi();

// Sidebar-scoped state
const userRole = computed(() => currentUserTenant.getRole());
const tenantId = computed(() => currentUserTenant.getTenantId());
const token = ref(authService.getToken());

// Form selection
const formOptions = ref([]);
const loadingForms = ref(false);
const selectedTemplateId = ref(null);

// Form runtime state
const currentFormStep = ref(1);
const workOrderFormData = reactive({});
const formValid = ref(false);

// QR dialog
const showQrScannerDialog = ref(false);
const qrImageFile = ref([]);
const decodedQrContent = ref("");
const qrScanError = ref("");
const currentQrFieldKey = ref("");

// Email dialog
const showEmailDialog = ref(false);
const clientEmail = ref("");
let resolveEmailPrompt = null;

// Priority and rescheduling state variables
const priority = ref(null);
const rescheduleEnabled = ref(false);
const scheduleEndDate = ref(null);
const selectedDays = ref([]);
const fromDate = ref(null);
const dueDate = ref(null);

// Priority items and weekdays configuration
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

// IMPROVED Date normalization helper
const normalizeDateString = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") {
    // Handle datetime-local format first (YYYY-MM-DDTHH:MM)
    if (v.includes("T")) {
      return v.split("T")[0];
    }
    // Handle date format (YYYY-MM-DD)
    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
};

const normalizedFromDate = computed(() => normalizeDateString(fromDate.value));
const normalizedDueDate = computed(() => normalizeDateString(dueDate.value));

const canEnableReschedule = computed(() => {
  const f = normalizedFromDate.value;
  const d = normalizedDueDate.value;
  return !!f && !!d && f === d;
});

// Helper function to get day name for logging
const getDayName = (dayNumber) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayNumber] || "Unknown";
};

// ENHANCED Date range iteration function with detailed logging
const datesInRangeByWeekdays = (startStr, endStr, dayValues) => {
  if (!startStr || !endStr || !dayValues.length) {
    console.error("❌ Invalid inputs:", { startStr, endStr, dayValues });
    return [];
  }

  // Clean the dates
  const cleanStart = normalizeDateString(startStr);
  const cleanEnd = normalizeDateString(endStr);

  const start = new Date(`${cleanStart}T00:00:00Z`);
  const end = new Date(`${cleanEnd}T00:00:00Z`);

  if (isNaN(start) || isNaN(end) || start > end) {
    console.error("❌ Invalid date range:", { cleanStart, cleanEnd });
    return [];
  }

  const weekdayMap = [
    { value: "Sun", js: 0 },
    { value: "Mon", js: 1 },
    { value: "Tue", js: 2 },
    { value: "Wed", js: 3 },
    { value: "Thu", js: 4 },
    { value: "Fri", js: 5 },
    { value: "Sat", js: 6 },
  ];

  const allowedDays = new Set(
    dayValues
      .map((v) => weekdayMap.find((w) => w.value === v)?.js)
      .filter((x) => x !== undefined),
  );

  const resultDates = [];
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dayOfWeek = d.getUTCDay();
    const dateStr = d.toISOString().slice(0, 10);
    const isIncluded = allowedDays.has(dayOfWeek);

    if (isIncluded) {
      resultDates.push(dateStr);
    }
  }

  return resultDates;
};

// Sync fromDate and dueDate with formData (dynamic fields)
const fromDateFields = [
  "from",
  "fromDate",
  "from_date",
  "startDate",
  "start_date",
];
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

const getDateFromFormData = (formData, fieldNames) => {
  for (const field of fieldNames) {
    if (formData[field]) {
      return formData[field];
    }
  }
  return null;
};

const fromDateTime = computed(() =>
  getDateFromFormData(workOrderFormData, fromDateFields),
);
const dueDateTime = computed(() =>
  getDateFromFormData(workOrderFormData, dueDateFields),
);

watch([fromDateTime, dueDateTime], ([newFrom, newDue]) => {
  fromDate.value = newFrom;
  dueDate.value = newDue;
});

// Watchers for date changes
watch([normalizedFromDate, normalizedDueDate], () => {
  if (!canEnableReschedule.value) {
    rescheduleEnabled.value = false;
    scheduleEndDate.value = null;
    selectedDays.value = [];
  } else {
    scheduleEndDate.value = normalizedFromDate.value;
  }
});

// Visibility by role
const isFieldVisible = (field) => {
  const roleBasedRequired = field.roleBasedRequired;
  if (roleBasedRequired && typeof roleBasedRequired === "object") {
    const req = roleBasedRequired[userRole.value];
    if (req !== true) return false;
  }
  const vis = field.rolesVisibility;
  if (!vis) return true;
  if (Array.isArray(vis)) return vis.includes(userRole.value);
  if (typeof vis === "object") return !!vis[userRole.value];
  return true;
};

// Derived fields grouping logic (steps)
const formFieldSteps = computed(() => {
  if (!formDetails.value?.custom_FormTemplate?.fields) return [];

  const allVisible = formDetails.value.custom_FormTemplate.fields
    .filter(
      (f) =>
        f.field_type === "creation" || f.field_type === "creation/completion",
    )
    .filter(isFieldVisible);

  const perStep = 9999;
  const steps = [];
  let chunk = [];

  for (const f of allVisible) {
    chunk.push(f);
    if (chunk.length === perStep) {
      steps.push(chunk);
      chunk = [];
    }
  }
  if (chunk.length) steps.push(chunk);
  return steps;
});

const currentStepFields = computed(
  () => formFieldSteps.value[currentFormStep.value - 1] || [],
);
const totalFormSteps = computed(() => formFieldSteps.value.length);

// Select a form: fetch details + dropdown data and init form model
const onSelectTemplate = async (id) => {
  if (!id) {
    resetFormRuntime();
    return;
  }
  await fetchFormDetails(id);
  await fetchDropdownData();
  initFormData();
  currentFormStep.value = 1;
};

// Fetch available forms for dropdown
const loadForms = async () => {
  if (!token.value || !tenantId.value) return;

  loadingForms.value = true;
  try {
    const params = new URLSearchParams([
      ["limit", "-1"],
      ["fields[]", "id"],
      ["fields[]", "formName"],
      ["fields[]", "enableForm"],
      ["filter[_and][0][tenant][tenantId][_eq]", tenantId.value],
      ["filter[_and][1][enableForm][_eq]", "true"],
      ["sort", "formName"],
    ]).toString();

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant_template?${params}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );

    if (!res.ok) throw new Error("Failed to load forms");
    const data = await res.json();

    formOptions.value = (data?.data || []).map((x) => ({
      id: x.id,
      formName: x.formName,
    }));

    // Set the first form as the default if forms are available
    if (formOptions.value.length > 0 && !selectedTemplateId.value) {
      selectedTemplateId.value = formOptions.value[0].id;
      await onSelectTemplate(selectedTemplateId.value);
    }
  } catch (e) {
    showValidationToast(e.message || "Failed to load forms", "error");
  } finally {
    loadingForms.value = false;
  }
};

// Init model values based on template
const initFormData = () => {
  Object.keys(workOrderFormData).forEach((k) => delete workOrderFormData[k]);

  const fields = formDetails.value?.custom_FormTemplate?.fields || [];
  fields
    .filter(
      (f) =>
        f.field_type === "creation" || f.field_type === "creation/completion",
    )
    .forEach((f) => {
      const type =
        typeof f.type === "object" && f.type.date === true ? "date" : f.type;

      if (type === "boolean") workOrderFormData[f.key] = false;
      else if (type === "date" || type === "number")
        workOrderFormData[f.key] = null;
      else workOrderFormData[f.key] = "";
    });

  workOrderFormData.priority = null;
  workOrderFormData.fromDate = null;
  workOrderFormData.dueDate = null;
  workOrderFormData.rescheduleEnabled = false;
  workOrderFormData.scheduleEndDate = null;
  workOrderFormData.selectedDays = [];

  priority.value = null;
  fromDate.value = null;
  dueDate.value = null;
  rescheduleEnabled.value = false;
  scheduleEndDate.value = null;
  selectedDays.value = [];
};

// Navigation across steps
const nextFormStep = async () => {
  if (currentFormStep.value < totalFormSteps.value) {
    currentFormStep.value++;
    scrollTop();
    showValidationToast("Step completed successfully!", "success");
  } else {
    await handleSubmit();
  }
};

const prevFormStep = () => {
  if (currentFormStep.value > 1) {
    currentFormStep.value--;
    scrollTop();
  }
};

const bodyEl = ref(null);

const scrollTop = () => {
  if (bodyEl.value && typeof bodyEl.value.scrollTo === "function") {
    bodyEl.value.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    const el = document.querySelector(".cwo-drawer .drawer-body");
    if (el && typeof el.scrollTo === "function") {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

// QR helpers
const openQrScanner = (fieldKey) => {
  currentQrFieldKey.value = fieldKey;
  showQrScannerDialog.value = true;
  qrImageFile.value = [];
  decodedQrContent.value = "";
  qrScanError.value = "";
};

const closeQrScanner = () => {
  showQrScannerDialog.value = false;
  qrImageFile.value = [];
  decodedQrContent.value = "";
  qrScanError.value = "";
  currentQrFieldKey.value = "";
};

const applyQrContent = () => {
  if (decodedQrContent.value && currentQrFieldKey.value) {
    workOrderFormData[currentQrFieldKey.value] = decodedQrContent.value;
    closeQrScanner();
  } else {
    qrScanError.value = "No QR content to apply or target field not set.";
  }
};

// Field-specific actions
const handleFieldAction = (field) => {
  const fieldType =
    typeof field.type === "object" && field.type.date === true
      ? "date"
      : field.type;

  if (fieldType === "clientSelector" && field.input_modes?.qr) {
    openQrScanner(field.key);
  } else if (fieldType === "gps" || fieldType === "gps-currentLocation") {
    const clientOrgId = getSelectedClientOrgId();
    if (!clientOrgId) {
      showValidationToast(
        "Please select a Client before choosing a Client Location",
        "warning",
      );
      return;
    }
    openLocationSelector(field.key, clientOrgId);
  }
};

// Random code generator for otp/happy-code
const generateCode = (field) => {
  const length = field.validations?.length || (field.type === "otp" ? 6 : 4);
  const isNumeric = field.input_modes?.number !== false;
  const chars = isNumeric
    ? "0123456789"
    : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  workOrderFormData[field.key] = code;
};

// Email prompt used by maybeSendCodes
const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

const promptForEmail = () =>
  new Promise((resolve) => {
    resolveEmailPrompt = resolve;
    showEmailDialog.value = true;
  });

const updateClientEmailAndSubmit = () => {
  if (!clientEmail.value || !/.+@.+\..+/.test(clientEmail.value)) {
    showValidationToast("Please enter a valid email address", "error");
    return;
  }
  if (resolveEmailPrompt) resolveEmailPrompt(clientEmail.value);
  resolveEmailPrompt = null;
  showEmailDialog.value = false;
  clientEmail.value = "";
};

const skipEmailProcess = () => {
  if (resolveEmailPrompt) resolveEmailPrompt(null);
  resolveEmailPrompt = null;
  showEmailDialog.value = false;
  clientEmail.value = "";
};

// Update priority and rescheduling functions
const updatePriority = (newPriority) => {
  priority.value = newPriority;
  workOrderFormData.priority = newPriority;
};

const updateRescheduleEnabled = (newEnabled) => {
  rescheduleEnabled.value = newEnabled;
  workOrderFormData.rescheduleEnabled = newEnabled;
};

const updateScheduleEndDate = (newEndDate) => {
  scheduleEndDate.value = newEndDate;
  workOrderFormData.scheduleEndDate = newEndDate;
};

const updateSelectedDays = (newDays) => {
  selectedDays.value = newDays;
  workOrderFormData.selectedDays = newDays;
};

const updateFromDate = (newFromDate) => {
  fromDate.value = newFromDate;
  workOrderFormData.fromDate = newFromDate;
};

const updateDueDate = (newDueDate) => {
  dueDate.value = newDueDate;
  workOrderFormData.dueDate = newDueDate;
};

// ENHANCED Submission with detailed debugging
const handleSubmit = async () => {
  try {
    let submissionData = { ...workOrderFormData };

    if (priority.value) {
      submissionData.task_priority = priority.value;
    }

    // MAIN CONDITION CHECK - Add detailed logging
    const rescheduleConditionMet =
      rescheduleEnabled.value && fromDate.value && scheduleEndDate.value;

    if (rescheduleConditionMet) {
      const start = normalizedFromDate.value;
      const end = normalizeDateString(scheduleEndDate.value);
      const selected = selectedDays.value || [];

      // Check if we have selected days
      if (!selected.length) {
        showValidationToast(
          "Please select at least one day for rescheduling.",
          "error",
        );
        return;
      }

      // Extract time components - with better fallbacks
      let fromTime = "09:00";
      let dueTime = "17:00";

      if (fromDate.value && fromDate.value.includes("T")) {
        fromTime = fromDate.value.split("T")[1].substring(0, 5);
      }
      if (dueDate.value && dueDate.value.includes("T")) {
        dueTime = dueDate.value.split("T")[1].substring(0, 5);
      }

      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(fromTime) || !timeRegex.test(dueTime)) {
        showValidationToast("Invalid time format. Please use HH:MM.", "error");
        return;
      }

      const days = datesInRangeByWeekdays(start, end, selected);

      if (!days.length) {
        showValidationToast(
          "No valid days found for the selected weekdays in the date range.",
          "error",
        );
        return;
      }

      const batchPayload = days.map((day) => ({
        ...submissionData,
        from: `${day}T${fromTime}:00`,
        dueTime: `${day}T${dueTime}:00`,
      }));

      console.log("FINAL BATCH PAYLOAD:", batchPayload);
      console.log(
        `Creating ${days.length} tasks for dates: ${days.join(", ")}`,
      );

      await submitForm(batchPayload, formDetails.value, clients.value);

      showValidationToast(
        `${days.length} tasks created successfully for: ${days.join(", ")}!`,
        "success",
      );
    } else if (fromDate.value && dueDate.value) {
      console.log(">>> ENTERING SINGLE TASK LOGIC <<<");

      if (!fromDate.value.includes("T") || !dueDate.value.includes("T")) {
        showValidationToast(
          "Please specify valid start and due times.",
          "error",
        );
        return;
      }

      const fromTime = fromDate.value.split("T")[1].substring(0, 5);
      const dueTime = dueDate.value.split("T")[1].substring(0, 5);
      const timeRegex = /^\d{2}:\d{2}$/;

      if (!timeRegex.test(fromTime) || !timeRegex.test(dueTime)) {
        showValidationToast("Invalid time format. Please use HH:MM.", "error");
        return;
      }

      submissionData.from = `${normalizedFromDate.value}T${fromTime}:00`;
      submissionData.dueTime = `${normalizedDueDate.value}T${dueTime}:00`;

      console.log("Single task payload:", submissionData);
      await submitForm(submissionData, formDetails.value, clients.value);

      showValidationToast("Task created successfully!", "success");
    } else {
      console.log(">>> ENTERING FALLBACK LOGIC (no dates) <<<");
      await submitForm(submissionData, formDetails.value, clients.value);
      showValidationToast("Task created successfully!", "success");
    }

    // OTP/Happy code handling
    const allFields = formDetails.value?.custom_FormTemplate?.fields || [];
    const formMeta = { fields: allFields };
    const selectedOrgId = getSelectedClientOrgId();

    if (selectedOrgId) {
      await maybeSendCodes({
        createdTask: submissionData,
        formMeta,
        selectedOrgId,
        options: {
          showToast: showValidationToast,
          promptForEmail: async () => {
            const email = await promptForEmail();
            return email || null;
          },
        },
      });
    }

    emit("created");
    if (!props.embedded) emit("update:open", false);
  } catch (err) {
    console.error("SUBMISSION ERROR:", err);
    showValidationToast(err.message || "Failed to submit form", "error");
  }

  console.log("=== SUBMISSION DEBUG END ===");
};

// Helpers
const getSelectedClientOrgId = () => {
  const fields = formDetails.value?.custom_FormTemplate?.fields || [];

  const clientField = fields.find((f) => {
    const type =
      typeof f.type === "object" && f.type?.date === true ? "date" : f.type;
    return type === "clientSelector";
  });

  if (clientField) {
    const val = workOrderFormData[clientField.key];
    if (val && typeof val === "object" && "id" in val) return val.id;
    return val || null;
  }

  const candidates = [
    "orgLocationId",
    "orgLocation.id",
    "clientOrgId",
    "clientId",
    "orgId",
  ];
  for (const key of candidates)
    if (workOrderFormData[key]) return workOrderFormData[key];
  return null;
};

const onApplyLocation = () => {
  if (displayLocationDetails.value && currentGpsFieldKey.value) {
    const { lat, lng } = displayLocationDetails.value.locmark || {};
    if (typeof lat !== "undefined" && typeof lng !== "undefined") {
      const latNum = Number(lat);
      const lngNum = Number(lng);

      workOrderFormData[currentGpsFieldKey.value] = `${
        isFinite(latNum) ? latNum.toFixed(6) : lat
      },${isFinite(lngNum) ? lngNum.toFixed(6) : lng}`;

      const fields = formDetails.value?.custom_FormTemplate?.fields || [];
      const keys = fields.map((f) => f.key);

      const latCandidates = [
        `${currentGpsFieldKey.value}_lat`,
        "latitude",
        "lat",
      ];
      const lngCandidates = [
        `${currentGpsFieldKey.value}_lng`,
        "longitude",
        "lng",
      ];

      const latKey = latCandidates.find((k) => keys.includes(k));
      const lngKey = lngCandidates.find((k) => keys.includes(k));

      if (latKey)
        workOrderFormData[latKey] = isFinite(Number(lat))
          ? Number(lat).toFixed(6)
          : lat;
      if (lngKey)
        workOrderFormData[lngKey] = isFinite(Number(lng))
          ? Number(lng).toFixed(6)
          : lng;
    }
  }
  applyLocation();
};

const resetFormRuntime = () => {
  formDetails.value = null;
  Object.keys(workOrderFormData).forEach((k) => delete workOrderFormData[k]);
  currentFormStep.value = 1;
};

// Load forms and set default when drawer opens
const onDrawerUpdate = async (v) => {
  emit("update:open", v);
  if (v) {
    await loadForms();
    if (!selectedTemplateId.value) resetFormRuntime();
  } else {
    showEmailDialog.value = false;
    showQrScannerDialog.value = false;
  }
};

// Trigger initial load immediately
const loadFormsImmediate = async () => {
  await loadForms();
};

// Watch for mode change in parent to reset and select default form
watch(
  () => props.open,
  async (newVal) => {
    if (newVal && props.embedded) {
      // Reset form state when switching to Work Order mode
      selectedTemplateId.value = null;
      resetFormRuntime();
      await loadForms();
    }
  },
);

loadFormsImmediate();
</script>

<style scoped>
.cwo-drawer {
  z-index: 2050; /* above filters panel */
  right: 0px;
  position: fixed !important;
  right: 0;
  top: 0 !important;
  bottom: 0 !important;
  height: 100% !important;
  width: 460px !important;
  z-index: 904 !important;
}

.drawer-root {
  display: flex;
  flex-direction: column;
}

.drawer-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: 60px;
}

.title-wrap {
  display: flex;
  align-items: center;
}

.title {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0;
}

.drawer-body {
  flex: 1 1 auto;
  overflow: auto;
  background: #fafbff;
}

.drawer-footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 10px 16px 14px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.pb-safe {
  height: 24px;
}

.muted {
  color: #6b7280;
}

@media (max-width: 768px) {
  .cwo-drawer {
    width: 100% !important;
  }
}
</style>
