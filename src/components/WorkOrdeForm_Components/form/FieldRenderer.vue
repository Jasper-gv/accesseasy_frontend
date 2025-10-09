<!-- create file render woek orde.vue  -->
<template>
  <div class="field-wrapper">
    <v-label class="field-label">
      <v-icon
        :icon="getFieldIcon(field)"
        size="18"
        class="mr-2"
        :color="isFieldMandatory(field) ? 'primary' : 'primary'"
      ></v-icon>
      {{ field.label }}
      <span v-if="isFieldMandatory(field)" class="required-indicator">*</span>
    </v-label>

    <!-- Special handling for orgId field type -->
    <div v-if="isOrgIdField">
      <!-- Step 1: Choose Client or Contact -->
      <v-select
        v-if="!selectedOrgType"
        :items="orgTypeOptions"
        item-title="label"
        item-value="value"
        label="Choose Organization Type"
        variant="outlined"
        density="comfortable"
        hide-details="auto"
        @update:model-value="onOrgTypeChange"
        class="field-input mb-3"
      >
        <template #prepend-inner>
          <v-icon>mdi-account-group</v-icon>
        </template>
      </v-select>

      <!-- Step 2: Choose specific organization -->
      <div v-else>
        <v-select
          v-model="formData[field.key]"
          :items="filteredOrganizations"
          :loading="loadingOrganizations"
          item-title="orgName"
          item-value="id"
          :label="`Select ${selectedOrgType}`"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          clearable
          class="field-input"
          :rules="activeRules"
          validate-on="input"
        >
          <template #prepend-inner>
            <v-icon>{{
              selectedOrgType === "Client" ? "mdi-domain" : "mdi-account"
            }}</v-icon>
          </template>
        </v-select>

        <!-- Change organization type button -->
        <v-btn
          size="small"
          variant="text"
          color="primary"
          @click="resetOrgSelection"
          class="mt-2"
        >
          <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
          Change Type
        </v-btn>
      </div>
    </div>

    <!-- UsersId special select -->
    <v-select
      v-else-if="isUsersField"
      :items="users || []"
      item-title="label"
      item-value="id"
      v-model="formData.UsersId"
      :label="usersLabel"
      :hint="formData?.UsersId ? 'Personal ID selected' : 'Select employee'"
      persistent-hint
      clearable
      variant="outlined"
      density="comfortable"
      class="field-input"
      :rules="activeRules"
      validate-on="input"
    >
      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps">
          <v-list-item-subtitle v-if="item?.raw?.employeeId">
          </v-list-item-subtitle>
          <template #append>
            <v-chip
              size="x-small"
              :color="statusColor(item?.raw?.attendance?.status)"
              variant="tonal"
              :prepend-icon="statusIcon(item?.raw?.attendance?.status)"
            >
              {{ statusLabel(item?.raw?.attendance?.status) }}
            </v-chip>
          </template>
        </v-list-item>
      </template>
    </v-select>

    <!-- gps-currentLocation -->
    <div v-else-if="field.type === 'gps-currentLocation'">
      <v-text-field
        v-model="formData[field.key]"
        :label="field.label || 'Current Location'"
        variant="outlined"
        density="comfortable"
        readonly
        :class="{ 'captured-location': !!formData[field.key] }"
        append-inner-icon="mdi-crosshairs-gps"
        @click:append-inner="() => captureCurrentLocation(field)"
      />
      <v-alert
        v-if="locationError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-2"
      >
        <template #prepend>
          <v-icon>mdi-alert-circle-outline</v-icon>
        </template>
        {{ locationError }}
      </v-alert>
    </div>

    <!-- Client Location (disabled until client selected) -->
    <div v-else-if="isClientLocationField">
      <v-select
        :disabled="disableClientLocation"
        v-model="formData.clientLocationId"
        :items="clientLocations"
        item-title="name"
        item-value="id"
        label="Client Location"
        variant="outlined"
        density="comfortable"
        :hint="disableClientLocation ? 'Select a Client first' : ''"
        persistent-hint
        class="field-input"
        @update:model-value="onLocationSelect"
      />
    </div>

    <!-- Date fields -->
    <v-text-field
      v-else-if="getFieldTypeString(field.type) === 'date'"
      v-model="formData[field.key]"
      type="datetime-local"
      variant="outlined"
      density="comfortable"
      hide-details="auto"
      class="field-input"
      :min="getDateMin(field)"
      :rules="activeRules"
      validate-on="input"
    />

    <!-- Generic dynamic field (all other fields) -->
    <component
      v-else
      :is="getFieldComponent(field)"
      v-bind="resolvedProps"
      v-model="formData[field.key]"
      :rules="activeRules"
      @click:append-inner="handleFieldAction"
      @update:model-value="onChange"
      @blur="onBlur"
      class="field-input"
    />

    <!-- Field-specific additional content -->
    <div
      v-if="field.type === 'otp' || field.type === 'happy-code'"
      class="mt-3"
    >
      <v-btn
        color="orange-darken-1"
        variant="tonal"
        block
        @click="$emit('generate-code', field)"
        prepend-icon="mdi-key-variant"
        class="generate-code-btn"
      >
        Generate/Resend Code
      </v-btn>
    </div>

    <!-- Unsupported field type warning -->
    <v-alert
      v-if="!isFieldTypeSupported(field.type)"
      type="warning"
      variant="tonal"
      density="compact"
      class="mt-2"
    >
      <template #prepend>
        <v-icon>mdi-alert-circle-outline</v-icon>
      </template>
      Unsupported field type: {{ getFieldTypeDisplay(field.type) }}
    </v-alert>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  getValidationRules,
  isFieldMandatory,
} from "@/utils/createWOF/validationRules";
import {
  getFieldComponent,
  getFieldProps,
  getFieldTypeString,
  getFieldTypeDisplay,
  isFieldTypeSupported,
  getFieldIcon,
} from "@/utils/createWOF/fieldUtils";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

const props = defineProps({
  field: Object,
  formData: Object,
  clients: Array,
  users: Array,
  userRole: String,
  options: Object,
});

const emit = defineEmits(["field-action", "generate-code"]);

const handleFieldAction = (event) => {
  emit("field-action", props.field, event);
};

const touched = ref(false);
const onBlur = () => {
  touched.value = true;
};
const onChange = () => {
  touched.value = true;
};

// Only provide rules after a field is interacted with, or when it already has a value
const activeRules = computed(() => {
  const hasValue =
    props.formData && props.field && props.formData[props.field.key];
  return touched.value || !!hasValue
    ? getValidationRules(props.field, props.userRole, props.formData)
    : [];
});

// Organization selection logic
const selectedOrgType = ref(null);
const filteredOrganizations = ref([]);
const loadingOrganizations = ref(false);

const orgTypeOptions = [
  { label: "Client", value: "Client" },
  { label: "Contact", value: "Contact" },
];

// Check if field is orgId type
const isOrgIdField = computed(() => {
  const key = props.field?.key || "";
  return key === "orgId" || getFieldTypeString(props.field?.type) === "orgId";
});

// Organization type selection handler
const onOrgTypeChange = async (type) => {
  selectedOrgType.value = type;
  await fetchFilteredOrganizations(type);
};

// Reset organization selection
const resetOrgSelection = () => {
  selectedOrgType.value = null;
  filteredOrganizations.value = [];
  props.formData[props.field.key] = null;
};

// Fetch organizations based on type
const fetchFilteredOrganizations = async (orgType) => {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  if (!token || !tenantId) {
    console.error("Token or Tenant ID not available");
    return;
  }

  loadingOrganizations.value = true;

  try {
    const filterParam =
      orgType === "Client"
        ? "filter[_and][0][_and][1][orgType][_contains]=clientorg"
        : "filter[_and][0][_and][0][orgType][_contains]=contact";

    const params = new URLSearchParams([
      ["limit", "-1"],
      ["fields[]", "orgName"],
      ["fields[]", "id"],
      ["fields[]", "orgType"],
      [`filter[_and][0][tenant][tenantId][_eq]`, tenantId],
      [filterParam.split("=")[0], filterParam.split("=")[1]],
      ["filter[_and][2][status][_neq]", "archived"],
      ["sort", "orgName"],
    ]).toString();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    filteredOrganizations.value = (data?.data || []).map((org) => ({
      id: org.id,
      orgName: org.orgName,
      orgType: org.orgType,
    }));
  } catch (error) {
    console.error(`Error fetching ${orgType.toLowerCase()}s:`, error);
    filteredOrganizations.value = [];
  } finally {
    loadingOrganizations.value = false;
  }
};

// Handle geolocation capture
const locationError = ref(null);

const captureCurrentLocation = (field) => {
  if (!navigator.geolocation) {
    locationError.value = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lng = position.coords.longitude.toFixed(6);

      // Clear any previous error
      locationError.value = null;

      // Show in textbox
      props.formData[field.key] = `${lat}, ${lng}`;

      // Set lat and lng directly in formData for payload
      props.formData.lat = lat;
      props.formData.lng = lng;

      // Push lat/lng to formData.fields for backward compatibility (if needed)
      if (Array.isArray(props.formData.fields)) {
        props.formData.fields = props.formData.fields.filter(
          (f) => f.key !== "lat" && f.key !== "lng",
        );
        props.formData.fields.push({ key: "lat", value: lat });
        props.formData.fields.push({ key: "lng", value: lng });
      }
    },
    (error) => {
      console.error("Location error:", error);
      locationError.value =
        "Failed to capture location. Please allow location access or try again.";
    },
  );
};

// Handle taskimage upload
const uploadError = ref(null);
const uploadStatus = ref(null);

const getWorkOrdersFolderId = async () => {
  try {
    const token = authService.getToken();
    const tenantId = currentUserTenant.getTenantId();
    if (!tenantId) throw new Error("Tenant ID not found");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) throw new Error("Failed to fetch tenant data");

    const data = await response.json();
    if (data.data?.[0]?.foldersId) {
      const workordersFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Workorders",
      );
      if (workordersFolder) return workordersFolder.id;
    }
    return null;
  } catch (err) {
    console.error("Error fetching Workorders folder ID:", err);
    return null;
  }
};

const handleImageUpload = async (field) => {
  const file = props.formData[field.key]?.[0];
  if (!file) {
    props.formData.taskimage = null;
    uploadError.value = null;
    uploadStatus.value = null;
    return;
  }

  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file only");
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("Image size must be less than 10MB");
    }

    // Get tenant ID and folder ID
    const tenantId = currentUserTenant.getTenantId();
    if (!tenantId) throw new Error("Tenant ID not found");

    const workOrdersFolderId = await getWorkOrdersFolderId();
    const token = authService.getToken();

    // Prepare form data
    const formData = new FormData();
    if (workOrdersFolderId) {
      formData.append("folder", workOrdersFolderId);
    }

    const fileExtension = file.name.split(".").pop();
    const customFileName = `task-${tenantId}-${Date.now()}.${fileExtension}`;
    formData.append("file", file, customFileName);

    // Upload file
    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized access. Token might be expired.");
      }
      throw new Error(`Failed to upload image: ${response.status}`);
    }

    const result = await response.json();
    props.formData.taskimage = result.data.id; // Store file ID
    uploadError.value = null;
    uploadStatus.value = `Uploaded: ${file.name}`;
  } catch (err) {
    console.error("Error uploading image:", err);
    uploadError.value = err.message || "Failed to upload image";
    uploadStatus.value = null;
    props.formData.taskimage = null;
  }
};

watch(
  () => props.formData[props.field?.key],
  (newValue) => {
    if (!newValue && selectedOrgType.value) {
      resetOrgSelection();
    }
  },
);

const resolvedProps = computed(() => {
  const base = getFieldProps(props.field);
  const typeString = getFieldTypeString(props.field?.type);
  const key = props.field?.key;

  const defaults = {
    validateOn: "blur",
    hideDetails: "auto",
  };

  if (typeString === "clientSelector" || key === "orgId") {
    return {
      ...base,
      ...defaults,
      validateOn: "input",
      items: props.clients || [],
      itemTitle: "orgName",
      itemValue: "id",
      returnObject: false,
      variant: base?.variant || "outlined",
      density: base?.density || "comfortable",
      clearable: true,
    };
  }

  if (
    typeString === "gps" ||
    (props.field?.label || "").toLowerCase().includes("location")
  ) {
    return {
      ...base,
      ...defaults,
      validateOn: "input",
      clearable: true,
    };
  }

  return {
    ...base,
    ...defaults,
  };
});

/* ----------------- Date helpers ----------------- */
const getDateMin = (field) => {
  const now = new Date();
  // Adjust to IST (UTC+5:30)
  const offset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + offset);
  const minDate = nowIST.toISOString().slice(0, 16);

  if (isDueDate(field)) {
    // Use fromDate if available, otherwise current IST time
    return props.formData?.fromDate || minDate;
  }
  // Prevent past dates for fromDate
  return minDate;
};

const isDueDate = (field) => {
  const key = (field?.key || "").toLowerCase();
  return key.includes("due") || key.includes("end"); // Handles "dueDate", "endDate"
};
/* -------------------------------------------------- */

const isClientLocationField = computed(() => {
  const key = (
    props.field?.key ||
    props.field?.field ||
    props.field?.name ||
    ""
  )
    .toString()
    .toLowerCase();
  return [
    "clientlocation",
    "client_location",
    "client_location_id",
    "client_locationid",
  ].includes(key);
});

const hasClientSelected = computed(() => {
  const m = props.formData || {};
  return Boolean(
    m.clientId || m.clientID || m.client || m.client_id || m.orgId,
  );
});

const disableClientLocation = computed(
  () => isClientLocationField.value && !hasClientSelected.value,
);

const isUsersField = computed(() => {
  const key = props.field?.key || props.field?.name || "";
  return key === "UsersId";
});

const usersLabel = computed(() => props.field?.label || "Assign to (Employee)");

const statusLabel = (s) =>
  s === "in" ? "Punched In" : s === "out" ? "Punched Out" : "Not Punched In";
const statusColor = (s) =>
  s === "in" ? "green" : s === "out" ? "red" : "orange";
const statusIcon = (s) =>
  s === "in"
    ? "mdi-login-variant"
    : s === "out"
      ? "mdi-logout-variant"
      : "mdi-clock-outline";

// Client locations logic
const clientLocations = ref([]);
const loadingClientLocations = ref(false);

watch(
  () => props.formData.orgId,
  async (newOrgId) => {
    if (isClientLocationField.value && newOrgId) {
      await fetchClientLocations(newOrgId);
    } else if (!newOrgId) {
      clientLocations.value = [];
      props.formData.clientLocationId = null;
      props.formData.currentLat = null;
      props.formData.currentLng = null;
      props.formData.radiusInMeters = null;
    }
  },
  { immediate: true },
);

async function fetchClientLocations(orgId) {
  const token = authService.getToken();
  const tenantId = currentUserTenant.getTenantId();

  if (!token || !tenantId) {
    console.error("Token or Tenant ID not available");
    return;
  }

  loadingClientLocations.value = true;

  try {
    const filterParam = `filter[_and][0][orgLocation][id][_eq]=${orgId}`;
    const params =
      new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "locSize"],
        ["fields[]", "locType"],
        ["fields[]", "locdetail"],
        ["fields[]", "locmark"],
        ["fields[]", "id"],
        ["fields[]", "orgLocation.orgName"],
        [`filter[_and][1][tenant][tenantId][_eq]`, tenantId],
        ["filter[_and][1][locType][_eq]", "serviceable_area"],
      ]).toString() +
      "&" +
      filterParam;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    clientLocations.value = (data?.data || [])
      .filter((loc) => loc.locType === "serviceable_area")
      .map((loc) => ({
        id: loc.id,
        name: loc.locdetail?.locationName || "Unnamed Location",
        locmark: loc.locmark,
        locSize: loc.locSize,
      }));
  } catch (error) {
    console.error("Error fetching client locations:", error);
    clientLocations.value = [];
  } finally {
    loadingClientLocations.value = false;
  }
}

const onLocationSelect = (locId) => {
  const selectedLoc = clientLocations.value.find((l) => l.id === locId);
  if (selectedLoc) {
    const coords = selectedLoc.locmark?.coordinates || [];
    props.formData.currentLat = coords[1] || null; // lat
    props.formData.currentLng = coords[0] || null; // lng
    props.formData.radiusInMeters = selectedLoc.locSize || null;
  } else {
    props.formData.currentLat = null;
    props.formData.currentLng = null;
    props.formData.radiusInMeters = null;
  }
};
</script>

<style scoped>
.field-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #37474f;
  margin-bottom: 12px;
  font-size: 0.95rem;
}

.required-indicator {
  color: #f44336;
  margin-left: 4px;
  font-weight: 700;
}

.captured-location input {
  color: red !important;
  font-weight: 600;
}

.field-input {
  transition: all 0.3s ease;
}

.field-input:hover {
  transform: translateY(-1px);
}

.generate-code-btn {
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s ease;
}

.generate-code-btn:hover {
  transform: translateY(-2px);
}

/* Custom field styling */
:deep(.v-text-field .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

:deep(.v-text-field .v-field:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

:deep(.v-text-field .v-field--focused) {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2);
}

:deep(.v-select .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.v-textarea .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.v-file-input .v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

:deep(.v-checkbox .v-selection-control__wrapper) {
  color: #1976d2;
}

/* Ensure datetime-local input displays correctly */
:deep(.v-text-field input[type="datetime-local"]) {
  font-size: 0.95rem;
  padding: 8px 12px;
  width: 100%;
}
</style>
