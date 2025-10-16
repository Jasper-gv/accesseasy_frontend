<!-- /senzrfieldopsfrontend/src/pages/taskManagement/taskcomponents/formTemplate/AddTaskForm/createWorkOrder.vue -->
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

        <!-- 3) Dynamic Form (tabs for core fields and job sheets) -->
        <div v-else-if="formDetails">
          <v-tabs
            v-model="activeTab"
            bg-color="transparent"
            color="primary"
            class="custom-tabs mb-4"
            slider-color="primary"
          >
            <v-tab value="core" :disabled="true" class="custom-tab">
              <v-icon class="mr-2" size="20">mdi-file-document</v-icon>
              Task details
            </v-tab>
            <v-tab
              v-for="jobSheet in visibleJobSheets"
              :key="jobSheet.job_id"
              :value="jobSheet.job_id"
              :disabled="true"
              class="custom-tab"
            >
              <v-icon class="mr-2" size="20">mdi-clipboard-text</v-icon>
              {{ jobSheet.job_name }}
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- Core Fields Tab -->
            <v-window-item value="core">
              <FormStep
                :form-details="formDetails"
                :current-step="currentFormStep"
                :total-steps="totalFormSteps"
                :current-step-fields="currentStepFields"
                :form-data="workOrderFormData"
                :form-valid="formValid"
                :clients="clients"
                :users="users"
                :departments="departments"
                :shared-properties="sharedProperties"
                :user-role="userRole"
                :priority="priority"
                :reschedule-enabled="rescheduleEnabled"
                :schedule-end-date="scheduleEndDate"
                :selected-days="selectedDays"
                :from-date="fromDate"
                :due-date="dueDate"
                :show-priority-reschedule="activeTab === 'core'"
                :loading="loading"
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
            </v-window-item>

            <!-- Job Sheet Tabs -->
            <v-window-item
              v-for="jobSheet in visibleJobSheets"
              :key="jobSheet.job_id"
              :value="jobSheet.job_id"
            >
              <FormStep
                :form-details="formDetails"
                :current-step="currentFormStep"
                :total-steps="totalFormSteps"
                :current-step-fields="currentStepFields"
                :form-data="workOrderFormData[jobSheet.job_id] || {}"
                :form-valid="formValid"
                :clients="clients"
                :users="users"
                :departments="departments"
                :shared-properties="sharedProperties"
                :user-role="userRole"
                :priority="priority"
                :reschedule-enabled="rescheduleEnabled"
                :schedule-end-date="scheduleEndDate"
                :selected-days="selectedDays"
                :from-date="fromDate"
                :due-date="dueDate"
                :show-priority-reschedule="activeTab === 'core'"
                :loading="loading"
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
            </v-window-item>
          </v-window>

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

  <!-- Embedded mode -->
  <div v-else>
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
        <v-tabs
          v-model="activeTab"
          bg-color="transparent"
          color="primary"
          class="custom-tabs mb-4"
          slider-color="primary"
        >
          <v-tab value="core" :disabled="true" class="custom-tab">
            <v-icon class="mr-2" size="20">mdi-file-document</v-icon>
            Task details
          </v-tab>
          <v-tab
            v-for="jobSheet in visibleJobSheets"
            :key="jobSheet.job_id"
            :value="jobSheet.job_id"
            :disabled="true"
            class="custom-tab"
          >
            <v-icon class="mr-2" size="20">mdi-clipboard-text</v-icon>
            {{ jobSheet.job_name }}
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="core">
            <FormStep
              :form-details="formDetails"
              :current-step="currentFormStep"
              :total-steps="totalFormSteps"
              :current-step-fields="currentStepFields"
              :form-data="workOrderFormData"
              :form-valid="formValid"
              :clients="clients"
              :users="users"
              :departments="departments"
              :shared-properties="sharedProperties"
              :user-role="userRole"
              :priority="priority"
              :reschedule-enabled="rescheduleEnabled"
              :schedule-end-date="scheduleEndDate"
              :selected-days="selectedDays"
              :from-date="fromDate"
              :due-date="dueDate"
              :show-priority-reschedule="activeTab === 'core'"
              :loading="loading"
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
          </v-window-item>

          <v-window-item
            v-for="jobSheet in visibleJobSheets"
            :key="jobSheet.job_id"
            :value="jobSheet.job_id"
          >
            <FormStep
              :form-details="formDetails"
              :current-step="currentFormStep"
              :total-steps="totalFormSteps"
              :current-step-fields="currentStepFields"
              :form-data="workOrderFormData[jobSheet.job_id] || {}"
              :form-valid="formValid"
              :clients="clients"
              :users="users"
              :departments="departments"
              :shared-properties="sharedProperties"
              :user-role="userRole"
              :priority="priority"
              :reschedule-enabled="rescheduleEnabled"
              :schedule-end-date="scheduleEndDate"
              :selected-days="selectedDays"
              :from-date="fromDate"
              :due-date="dueDate"
              :show-priority-reschedule="activeTab === 'core'"
              :loading="loading"
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
          </v-window-item>
        </v-window>

        <div class="pb-safe" />
      </div>

      <v-alert v-else type="info" variant="tonal">
        Select a form to start creating a work order.
      </v-alert>
    </section>

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
  departments,
  loading,
  error,
  fetchFormDetails,
  fetchDropdownData,
  submitForm,
  uploadImage,
  getFirstPresent,
} = formApi();

const sharedProperties = computed(() => {
  return formDetails.value?.custom_FormTemplate?.shared_properties || {};
});

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
const activeTab = ref("core"); // Default to core fields

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

// Computed properties for core fields and job sheets
const coreFields = computed(
  () => formDetails.value?.custom_FormTemplate?.corefields || [],
);
const jobSheets = computed(
  () => formDetails.value?.custom_FormTemplate?.jobSheet || [],
);

const visibleJobSheets = computed(() =>
  jobSheets.value.filter((js) =>
    js.fields.some(
      (f) =>
        f.field_type === "creation" || f.field_type === "creation/completion",
    ),
  ),
);

const totalFormSteps = computed(() => 1 + visibleJobSheets.value.length); // Core fields + visible job sheets

const currentStepFields = computed(() => {
  let fields = [];
  if (activeTab.value === "core") {
    fields = [...coreFields.value];

    // Add team field to core fields if enabled
    if (sharedProperties.value?.booleans?.team) {
      fields.push({
        key: "team",
        label: "Department",
        type: "dropdown",
        field_type: "creation",
      });
    }
  } else {
    const jobSheet = jobSheets.value.find(
      (js) => js.job_id === activeTab.value,
    );
    fields = jobSheet?.fields || [];
  }
  const filteredFields = fields.filter(
    (f) =>
      f.field_type === "creation" || f.field_type === "creation/completion",
  );
  return filteredFields;
});

// IMPROVED Date normalization helper
const normalizeDateString = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") {
    if (v.includes("T")) return v.split("T")[0];
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

// Helper function to get date from formData with multiple key possibilities
const getDateFromFormData = (formData, fieldNames) => {
  for (const field of fieldNames) {
    if (formData[field]) {
      return formData[field];
    }
  }
  return null;
};

// Watchers for date changes to update reactive state
const fromDateTime = computed(() =>
  getDateFromFormData(workOrderFormData, [
    "from",
    "fromDate",
    "from_date",
    "startDate",
    "start_date",
  ]),
);
const dueDateTime = computed(() =>
  getDateFromFormData(workOrderFormData, [
    "dueTime",
    "due_time",
    "dueDate",
    "due_date",
    "endDate",
    "end_date",
    "toDate",
    "to_date",
  ]),
);

watch([fromDateTime, dueDateTime], ([newFrom, newDue]) => {
  fromDate.value = newFrom;
  dueDate.value = newDue;
});

// Watcher for date changes to adjust reschedule settings
watch([normalizedFromDate, normalizedDueDate], () => {
  if (!canEnableReschedule.value) {
    rescheduleEnabled.value = false;
    scheduleEndDate.value = null;
    selectedDays.value = [];
  } else {
    scheduleEndDate.value = normalizedFromDate.value;
  }
});

// Visibility by role helper
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
  activeTab.value = "core";
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

  const coreFields = formDetails.value?.custom_FormTemplate?.corefields || [];
  coreFields
    .filter(
      (f) =>
        f.field_type === "creation" || f.field_type === "creation/completion",
    )
    .forEach((f) => {
      const type =
        typeof f.type === "object" && f.type.date === true ? "date" : f.type;
      workOrderFormData[f.key] =
        type === "boolean"
          ? false
          : type === "date" || type === "number"
            ? null
            : "";
    });

  const jobSheets = formDetails.value?.custom_FormTemplate?.jobSheet || [];
  jobSheets.forEach((jobSheet) => {
    workOrderFormData[jobSheet.job_id] = reactive({});
    jobSheet.fields
      .filter(
        (f) =>
          f.field_type === "creation" || f.field_type === "creation/completion",
      )
      .forEach((f) => {
        const type =
          typeof f.type === "object" && f.type.date === true ? "date" : f.type;
        workOrderFormData[jobSheet.job_id][f.key] =
          type === "boolean"
            ? false
            : type === "date" || type === "number"
              ? null
              : "";
      });
  });

  workOrderFormData.priority = null;
  workOrderFormData.fromDate = null;
  workOrderFormData.dueDate = null;
  workOrderFormData.rescheduleEnabled = false;
  workOrderFormData.scheduleEndDate = null;
  workOrderFormData.selectedDays = [];

  console.log("[v0] Form data initialized:", workOrderFormData);
};

// Navigation across steps
const nextFormStep = async () => {
  if (currentFormStep.value < totalFormSteps.value) {
    currentFormStep.value++;
    activeTab.value = tabKeys.value[currentFormStep.value - 1];
    if (activeTab.value !== "core" && !workOrderFormData[activeTab.value]) {
      workOrderFormData[activeTab.value] = reactive({});

      const jobSheet = jobSheets.value.find(
        (js) => js.job_id === activeTab.value,
      );
      if (jobSheet) {
        jobSheet.fields
          .filter(
            (f) =>
              f.field_type === "creation" ||
              f.field_type === "creation/completion",
          )
          .forEach((f) => {
            const type =
              typeof f.type === "object" && f.type.date === true
                ? "date"
                : f.type;
            workOrderFormData[activeTab.value][f.key] =
              type === "boolean"
                ? false
                : type === "date" || type === "number"
                  ? null
                  : "";
          });
      }
    }

    scrollTop();
    showValidationToast("Step completed successfully!", "success");
  } else {
    await handleSubmit();
  }
};

const prevFormStep = () => {
  if (currentFormStep.value > 1) {
    currentFormStep.value--;
    activeTab.value = tabKeys.value[currentFormStep.value - 1];
    scrollTop();
  }
};

const tabKeys = computed(() => {
  const keys = ["core"];
  visibleJobSheets.value.forEach((js) => keys.push(js.job_id));
  return keys;
});

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
    if (!formDetails.value || !formDetails.value.custom_FormTemplate) {
      showValidationToast(
        "Form details not loaded. Please try again.",
        "error",
      );
      return;
    }

    let submissionData = { ...workOrderFormData };

    if (sharedProperties.value?.booleans?.team && submissionData.team) {
      console.log(
        "[v0] Including team field in submission:",
        submissionData.team,
      );
    }

    const dynamicFields = [];

    // Main task fields (core)
    const mainFields = {};
    const coreFields = formDetails.value?.custom_FormTemplate?.corefields || [];
    for (const f of coreFields) {
      const key = f.key;
      if (submissionData[key] !== undefined) {
        if (key === "user_location") {
          mainFields[key] = {
            lat: submissionData.lat,
            lng: submissionData.lng,
          };
        } else if (key === "taskimage" && submissionData[key]) {
          // Check if it's already an array of IDs (from FieldRenderer multi-upload)
          if (
            Array.isArray(submissionData[key]) &&
            typeof submissionData[key][0] === "string"
          ) {
            // Already uploaded, use the array of IDs directly
            mainFields[key] = submissionData[key];
          } else if (submissionData[key].length > 0) {
            // Legacy single file upload
            mainFields[key] = await uploadImage(submissionData[key][0]);
          }
        } else if (
          ![
            "orgId",
            "from",
            "dueTime",
            "title",
            "description",
            "task_priority",
          ].includes(key)
        ) {
          mainFields[key] = submissionData[key];
        }
      }
    }
    const employeeIdAlt = getFirstPresent(submissionData, [
      "UsersId",
      "employeeId",
      "empId",
      "assignedEmployee",
      "assignedUserId",
    ]);
    mainFields.UsersId = employeeIdAlt;

    if (sharedProperties.value?.booleans?.team && submissionData.team) {
      mainFields.team = submissionData.team;
    }

    dynamicFields.push({ fields: mainFields });

    // Job sheets
    const jobSheetsValue =
      formDetails.value?.custom_FormTemplate?.jobSheet || [];
    for (const jobSheet of jobSheetsValue) {
      const jobSheetData = submissionData[jobSheet.job_id] || {};
      const jobFields = {};
      Object.keys(jobSheetData).forEach((key) => {
        if (
          jobSheetData[key] !== undefined &&
          jobSheetData[key] !== null &&
          jobSheetData[key] !== ""
        ) {
          jobFields[key] = jobSheetData[key];
        }
      });
      if (jobSheet.requires_location) {
        const latKey = jobSheet.location_field_key?.lat || "lat";
        const lngKey = jobSheet.location_field_key?.lng || "lng";
        if (jobSheetData[latKey] || jobSheetData[lngKey]) {
          jobFields["user_location"] = {
            lat: jobSheetData[latKey],
            lng: jobSheetData[lngKey],
          };
        }
      }
      if (jobSheetData.taskimage) {
        // Check if already uploaded (array of IDs)
        if (
          Array.isArray(jobSheetData.taskimage) &&
          typeof jobSheetData.taskimage[0] === "string"
        ) {
          jobFields.taskimage = jobSheetData.taskimage;
        } else if (jobSheetData.taskimage.length > 0) {
          // Legacy single file upload
          jobFields.taskimage = await uploadImage(jobSheetData.taskimage[0]);
        }
      }
      jobFields.UsersId = employeeIdAlt;
      dynamicFields.push({ fields: jobFields });
    }

    submissionData.dynamicFields = dynamicFields;

    if (priority.value) {
      submissionData.task_priority = priority.value;
    }

    const rescheduleConditionMet =
      rescheduleEnabled.value && fromDate.value && scheduleEndDate.value;

    if (rescheduleConditionMet) {
      const start = normalizedFromDate.value;
      const end = normalizeDateString(scheduleEndDate.value);
      const selected = selectedDays.value || [];

      if (!selected.length) {
        showValidationToast(
          "Please select at least one day for rescheduling.",
          "error",
        );
        return;
      }

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

    console.log("formDetails:", formDetails.value);
    console.log("custom_FormTemplate:", formDetails.value?.custom_FormTemplate);
    console.log("jobSheets:", jobSheets.value);

    const allFields = [
      ...(formDetails.value?.custom_FormTemplate?.corefields || []),
      ...(Array.isArray(jobSheets.value)
        ? jobSheets.value.reduce(
            (acc, js) => [...acc, ...(js.fields || [])],
            [],
          )
        : []),
    ];
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
  const fields = formDetails.value?.custom_FormTemplate?.corefields || [];

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

      const targetFormData = currentGpsFieldKey.value.includes("job-")
        ? workOrderFormData[currentGpsFieldKey.value.split("_")[0]]
        : workOrderFormData;

      targetFormData[currentGpsFieldKey.value] = `${
        isFinite(latNum) ? latNum.toFixed(6) : lat
      },${isFinite(lngNum) ? lngNum.toFixed(6) : lng}`;

      const fields = [
        ...(formDetails.value?.custom_FormTemplate?.corefields || []),
        ...(Array.isArray(jobSheets.value)
          ? jobSheets.value.reduce(
              (acc, js) => [...acc, ...(js.fields || [])],
              [],
            )
          : []),
      ];
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
        targetFormData[latKey] = isFinite(Number(lat))
          ? Number(lat).toFixed(6)
          : lat;
      if (lngKey)
        targetFormData[lngKey] = isFinite(Number(lng))
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
  activeTab.value = "core";
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
  z-index: 2050;
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

/* Enhanced tab styling for maximum visibility */
.custom-tabs {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.custom-tab {
  text-transform: none;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  margin: 0 4px;
  transition: all 0.3s ease;
  min-height: 48px;
  cursor: not-allowed !important;
  opacity: 0.7;
  position: relative;
}

/* Super visible active tab with border and shadow */
.custom-tab.v-tab--selected {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.5) !important;
  opacity: 1 !important;
  transform: scale(1.05);
  border: 2px solid #0d47a1 !important;
  z-index: 2;
}

.custom-tab.v-tab--selected .v-icon {
  color: #ffffff !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Non-active tabs with clear distinction */
.custom-tab:not(.v-tab--selected) {
  background: #f5f5f5;
  color: #757575;
  border: 1px solid #e0e0e0;
}

.custom-tab:not(.v-tab--selected) .v-icon {
  color: #9e9e9e;
}

/* Disabled state - prevent hover effects */
.custom-tab:disabled,
.custom-tab[disabled] {
  pointer-events: none;
  cursor: not-allowed !important;
}

/* Add indicator line under active tab */
.custom-tab.v-tab--selected::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: #1976d2;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .cwo-drawer {
    width: 100% !important;
  }

  .custom-tab {
    font-size: 0.85rem;
    min-height: 44px;
  }
}
</style>
