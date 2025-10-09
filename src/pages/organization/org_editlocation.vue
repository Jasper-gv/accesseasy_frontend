<template>
  <div>
    <v-form ref="form">
      <v-toolbar density="compact" color="grey-lighten-4">
        <v-btn icon color="black" @click="handleClose">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title class="ml-4">Edit Site</v-toolbar-title>
        <v-spacer></v-spacer>
        <BaseButton variant="danger" @click="handleClose">CANCEL</BaseButton>
        <BaseButton
          variant="primary"
          class="ml-2"
          :loading="isSaving"
          @click="handleSave"
          >SAVE</BaseButton
        >
      </v-toolbar>

      <div class="content-wrapper pa-4">
        <v-card flat>
          <v-row>
            <!-- Left Column: Form Fields -->
            <v-col cols="12" md="6">
              <!-- Location Name -->
              <v-text-field
                v-model="formData.locationName"
                label="Site Name *"
                variant="outlined"
                density="comfortable"
                :rules="locationNameRules"
                required
              ></v-text-field>

              <!-- Contact Person -->
              <v-text-field
                v-model="formData.contactPerson"
                label="Contact Person *"
                variant="outlined"
                density="comfortable"
                :rules="contactPersonRules"
                required
              ></v-text-field>

              <!-- Contact Number -->
              <v-text-field
                v-model="formData.contactNumber"
                label="Contact Number *"
                variant="outlined"
                density="comfortable"
                type="tel"
                :rules="contactNumberRules"
                required
                max-length="10"
              ></v-text-field>

              <!-- Organization Selection -->
              <v-select
                v-model="formData.orgLocation"
                :items="organizationOptions"
                label="Organization *"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => !!v || 'Organization is required']"
                :loading="organizationsLoading"
                required
              >
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <span class="mr-2">{{ getOrgName(item.value) }}</span>
                    <v-chip
                      :color="getOrgTypeColor(item.value)"
                      size="small"
                      variant="flat"
                    >
                      {{ getOrgType(item.value) }}
                    </v-chip>
                  </div>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:append>
                      <v-chip
                        :color="getOrgTypeColor(item.value)"
                        size="small"
                        variant="flat"
                      >
                        {{ getOrgType(item.value) }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <!-- State -->
              <!-- <v-select
                v-model="formData.state"
                :items="stateOptions"
                label="State *"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => !!v || 'State is required']"
                @change="updateState"
              ></v-select> -->

              <!-- Radius -->
              <v-card class="pa-4 mt-3" elevation="1">
                <v-card-title class="text-subtitle-1 pa-0 mb-3">
                  <v-icon class="mr-2" color="primary"
                    >mdi-map-marker-radius</v-icon
                  >
                  Radius
                </v-card-title>
                <v-slider
                  v-model="formData.radiusMm"
                  label="Radius (MM)"
                  min="10"
                  max="5000"
                  step="10"
                  thumb-label="always"
                  :rules="radiusRules"
                  color="primary"
                  class="mb-4"
                >
                  <template v-slot:append>
                    <v-text-field
                      v-model="formData.radiusMm"
                      style="width: 100px"
                      density="compact"
                      hide-details
                      variant="outlined"
                      suffix="MM"
                      :min="10"
                      :max="5000"
                      type="number"
                    ></v-text-field>
                  </template>
                </v-slider>
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-2"
                >
                  <div class="d-flex align-center">
                    <div>
                      <strong>Radius:</strong> {{ formData.radiusMm }} MM
                    </div>
                  </div>
                </v-alert>
                <div class="text-caption text-grey-darken-1">
                  <v-icon size="small" class="mr-1">mdi-information</v-icon>
                  Set the radius for area coverage (10-5000 MM)
                </div>
              </v-card>
            </v-col>

            <!-- Right Column: Pincode, Address, and Map -->
            <v-col cols="12" md="6">
              <!-- Pincodes -->
              <v-card
                class="pa-3 mb-3"
                elevation="1"
                v-if="formData.pincodes.length > 0"
              >
                <v-card-title class="text-subtitle-1 pa-0 mb-2">
                  <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                  Added Pincodes ({{ formData.pincodes.length }})
                </v-card-title>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip
                    v-for="(pincode, index) in formData.pincodes"
                    :key="index"
                    color="primary"
                    variant="flat"
                    size="small"
                    closable
                    @click:close="removePincode(index)"
                  >
                    <v-icon start size="small"
                      >mdi-numeric-{{ index }}-circle</v-icon
                    >
                    {{ pincode }}
                  </v-chip>
                </div>
              </v-card>

              <!-- Add Pincode -->
              <v-text-field
                v-model="newPincode"
                label="Add New Pincode"
                variant="outlined"
                density="comfortable"
                type="number"
                maxlength="6"
                hint="Press ➕ or hit ENTER — you can add multiple pincodes"
                persistent-hint
                :rules="[
                  (v) =>
                    !v ||
                    /^\d{6}$/.test(v) ||
                    'Pincode must be exactly 6 digits',
                  (v) =>
                    !formData.pincodes.includes(v) || 'Pincode already added',
                ]"
                @keyup.enter="addPincode"
              >
                <template #append-inner>
                  <BaseButton
                    variant="primary"
                    size="md"
                    :text="'Add'"
                    :lefticon="'mdi-plus'"
                    @click="addPincode"
                    aria-label="Add pincode"
                  />
                </template>
              </v-text-field>

              <v-alert
                v-if="pincodeValidationMessage"
                :type="pincodeValidationType"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                {{ pincodeValidationMessage }}
              </v-alert>

              <!-- Address -->
              <v-textarea
                v-model="formData.address"
                label="Selected Address"
                variant="outlined"
                rows="3"
                readonly
                auto-grow
                class="mt-3"
              ></v-textarea>

              <!-- Map -->
              <v-card class="map-card mt-3" elevation="2">
                <v-card-title class="pa-3 pb-2">
                  <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                  <span class="text-h6">Location Selection</span>
                </v-card-title>
                <v-card-text class="pa-3">
                  <div class="search-container mb-3">
                    <v-text-field
                      v-model="searchQuery"
                      label="Search location..."
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-magnify"
                      clearable
                      @click:clear="clearSearch"
                      :loading="searchLoading"
                    ></v-text-field>
                    <v-list
                      v-if="searchResults.length > 0"
                      class="search-results"
                      elevation="4"
                    >
                      <v-list-item
                        v-for="(result, index) in searchResults"
                        :key="index"
                        @click="selectSearchResult(result)"
                        class="search-result-item"
                      >
                        <v-list-item-title>{{
                          result.description
                        }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div class="map-wrapper">
                    <div id="map" class="map-container"></div>
                    <div class="coordinates-display">
                      <v-chip
                        v-if="formData.lat && formData.lng"
                        color="primary"
                        variant="elevated"
                        size="small"
                      >
                        <v-icon start>mdi-crosshairs-gps</v-icon>
                        {{ parseFloat(formData.lat).toFixed(6) }},
                        {{ parseFloat(formData.lng).toFixed(6) }}
                      </v-chip>
                    </div>
                  </div>
                  <div class="text-caption mt-2 text-grey-darken-1">
                    <v-icon size="small" class="mr-1">mdi-information</v-icon>
                    Click on the map to select location or use the search above
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </div>

      <v-snackbar
        v-model="showSuccessAlert"
        color="success"
        timeout="2000"
        location="top"
      >
        <v-icon class="me-2" color="white">mdi-check-circle</v-icon>
        Location updated successfully!
      </v-snackbar>

      <v-snackbar
        v-model="showErrorAlert"
        color="red"
        timeout="3000"
        location="top"
      >
        <v-icon class="me-2" color="white">mdi-alert-circle</v-icon>
        {{ errorMessage }}
        <template v-slot:actions>
          <v-btn color="red" variant="text" @click="showErrorAlert = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

const tenantId = currentUserTenant.getTenantId();
const route = useRoute();
const router = useRouter();
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref("");
const form = ref(null);
const isSaving = ref(false);
const organizationsLoading = ref(false);

const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// Search related
const searchQuery = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);
const searchDebounceTimeout = ref(null);

// Pincode related
const newPincode = ref("");
const pincodeValidationMessage = ref("");
const pincodeValidationType = ref("info");

// Organizations data
const organizations = ref([]);
const organizationOptions = ref([]);

// API CONFIGURATION
const token = authService.getToken();
const apiHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
};

// Generic API request function
const makeApiRequest = async (endpoint, options = {}) => {
  const url = `${import.meta.env.VITE_API_URL}${endpoint}`;
  const config = {
    headers: apiHeaders,
    ...options,
  };
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// FORM DATA & VALIDATION
const formData = ref({
  id: null,
  locationName: "",
  contactPerson: "",
  contactNumber: "",
  orgLocation: "",
  pincodes: [],
  radiusMm: 200,
  lat: null,
  lng: null,
  address: "",
  state: null,
  status: "active",
  tenant: tenantId,
});

// Computed property for radius in millimeters
const radiusInMillimeters = computed(() => {
  return formData.value.radiusMm;
});

// Computed property for data preview with proper JSON format
const previewPayload = computed(() => {
  if (!formData.value.lat || !formData.value.lng) return {};

  return {
    locdetail: {
      locationName: formData.value.locationName,

      pincodes: formData.value.pincodes,
      address: formData.value.address,
    },
    locSize: `${formData.value.radiusMm}`,
    locmark: {
      type: "Point",
      coordinates: [
        parseFloat(formData.value.lng),
        parseFloat(formData.value.lat),
      ],
    },
    orgLocation: formData.value.orgLocation,

    status: formData.value.status,
    tenant: formData.value.tenant,
    qrDetails: `${tenantId}|${formData.value.lng}|${formData.value.lat}`,
    contactDetails: {
      contactPerson: formData.value.contactPerson,
      contactNumber: formData.value.contactNumber,
    },
  };
});

// Helper functions for organization dropdown
const getOrgName = (orgId) => {
  const org = organizations.value.find((o) => o.id === orgId);
  return org ? org.orgName : "";
};

const getOrgType = (orgId) => {
  const org = organizations.value.find((o) => o.id === orgId);
  if (!org || !org.orgType) return "";
  const formatted = org.orgType.replace(/org$/i, "");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
};

const getOrgTypeColor = (orgId) => {
  const org = organizations.value.find((o) => o.id === orgId);
  if (!org || !org.orgType) return "grey";
  const orgType = org.orgType.toLowerCase();
  if (orgType.includes("client")) return "yellow";
  if (orgType.includes("contact")) return "blue";
  return "grey";
};

// Validation rules
const locationNameRules = [
  (v) => !!v || "Location name is required",
  (v) => (v && v.length >= 3) || "Location name must be at least 3 characters",
];

const contactPersonRules = [
  (v) => !!v || "Contact person is required",
  (v) => (v && v.length >= 2) || "Contact person must be at least 2 characters",
];

const contactNumberRules = [
  (v) => !!v || "Contact number is required",
  (v) => /^\d{10}$/.test(v) || "Contact number must be exactly 10 digits",
];

const radiusRules = [
  (v) => (v >= 10 && v <= 5000) || "Radius must be between 10-5000 MM",
];

const pincodeRules = computed(() => {
  return [
    (v) => (v && v.length > 0) || "At least one pincode is required",
    (v) =>
      !v ||
      v.every((pincode) => /^\d{6}$/.test(pincode)) ||
      "All pincodes must be 6 digits",
  ];
});

// PINCODE FUNCTIONALITY
const validatePincode = (pincode) => {
  if (!pincode)
    return { valid: false, message: "Please enter a pincode", type: "warning" };
  if (!/^\d{6}$/.test(pincode))
    return {
      valid: false,
      message: "Pincode must be exactly 6 digits",
      type: "error",
    };
  if (formData.value.pincodes.includes(pincode))
    return { valid: false, message: "Pincode already exists", type: "warning" };
  return { valid: true, message: "Pincode is valid", type: "success" };
};

const addPincode = () => {
  const validation = validatePincode(newPincode.value);
  if (!validation.valid) {
    pincodeValidationMessage.value = validation.message;
    pincodeValidationType.value = validation.type;
    return;
  }

  formData.value.pincodes.push(newPincode.value);
  newPincode.value = "";

  pincodeValidationMessage.value = "Pincode added successfully";
  pincodeValidationType.value = "success";

  setTimeout(() => {
    pincodeValidationMessage.value = "";
  }, 3000);
};

const removePincode = (index) => {
  const removedPincode = formData.value.pincodes[index];
  formData.value.pincodes.splice(index, 1);

  pincodeValidationMessage.value = `Pincode ${removedPincode} removed`;
  pincodeValidationType.value = "info";

  setTimeout(() => {
    pincodeValidationMessage.value = "";
  }, 3000);
};

const extractPincodeFromAddress = (address) => {
  const pincodeRegex = /\b\d{6}\b/g;
  const matches = address.match(pincodeRegex);
  return matches || [];
};

// MAP FUNCTIONALITY
let map = null;
let marker = null;
let autocompleteService = null;
let placesService = null;
let geocoder = null;
const apiKey = `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

const initMap = () => {
  const lat = parseFloat(formData.value.lat) || 20.5937;
  const lng = parseFloat(formData.value.lng) || 78.9629;
  const zoom = formData.value.lat ? 13 : 5;

  if (map) {
    map = null;
  }

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom,
    mapTypeId: "roadmap",
  });

  map.addListener("click", handleMapClick);

  autocompleteService = new google.maps.places.AutocompleteService();
  placesService = new google.maps.places.PlacesService(map);
  geocoder = new google.maps.Geocoder();

  if (formData.value.lat && formData.value.lng) {
    marker = new google.maps.Marker({
      position: {
        lat: parseFloat(formData.value.lat),
        lng: parseFloat(formData.value.lng),
      },
      map,
    });
  }
};

async function handleMapClick(e) {
  const lat = e.latLng.lat();
  const lng = e.latLng.lng();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK && results[0]) {
      const address = results[0].formatted_address;
      updateMapAndAddress(lat, lng, address);
    } else {
      updateMapAndAddress(lat, lng);
      formData.value.address = "Address not found";
      console.error("Geocode failed:", status);
    }
  });
}

async function updateMapAndAddress(lat, lng, address = null) {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  formData.value.lat = lat.toFixed(6);
  formData.value.lng = lng.toFixed(6);

  if (marker) {
    marker.setPosition({ lat, lng });
  } else {
    marker = new google.maps.Marker({
      position: { lat, lng },
      map,
    });
  }

  map.setCenter({ lat, lng });
  map.setZoom(13);

  if (address) {
    formData.value.address = address;

    const extractedPincodes = extractPincodeFromAddress(address);
    let addedCount = 0;
    extractedPincodes.forEach((pincode) => {
      if (!formData.value.pincodes.includes(pincode)) {
        formData.value.pincodes.push(pincode);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      pincodeValidationMessage.value = `Added ${addedCount} new pincode(s) from address`;
      pincodeValidationType.value = "success";
    } else if (extractedPincodes.length > 0) {
      pincodeValidationMessage.value =
        "All pincodes from address already added";
      pincodeValidationType.value = "info";
    } else {
      pincodeValidationMessage.value = "No pincode found in address";
      pincodeValidationType.value = "info";
    }

    setTimeout(() => {
      pincodeValidationMessage.value = "";
    }, 3000);
  }
}

// SEARCH FUNCTIONALITY
const searchLocation = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;
  try {
    const request = {
      input: searchQuery.value,
      componentRestrictions: { country: "IN" },
      types: ["geocode"],
    };
    const { predictions } =
      await autocompleteService.getPlacePredictions(request);
    searchResults.value = predictions;
  } catch (error) {
    console.error("Search error:", error);
    errorMessage.value = "Failed to search location";
    showErrorAlert.value = true;
  } finally {
    searchLoading.value = false;
  }
};

const selectSearchResult = async (prediction) => {
  placesService.getDetails(
    { placeId: prediction.place_id },
    (place, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        place.geometry
      ) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address;
        updateMapAndAddress(lat, lng, address);
      } else {
        console.error("Place details failed:", status);
      }
    },
  );
  searchResults.value = [];
  searchQuery.value = "";
};

const clearSearch = () => {
  searchResults.value = [];
  searchQuery.value = "";
};

watch(searchQuery, (newQuery) => {
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value);
  }
  if (newQuery.length > 2) {
    searchDebounceTimeout.value = setTimeout(() => {
      searchLocation();
    }, 300);
  } else {
    searchResults.value = [];
  }
});

// FORM HANDLERS
const handleClose = () => {
  router.push({ name: "org_location" });
};

// Fetch organizations
const fetchOrganizations = async () => {
  try {
    organizationsLoading.value = true;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch organizations");
    }

    const result = await response.json();
    organizations.value = result.data || [];

    // Filter organizations to only include clientorg and contact
    const filteredOrganizations = organizations.value.filter(
      (org) =>
        org.orgType &&
        ["clientorg", "contact"].includes(org.orgType.toLowerCase()),
    );

    organizationOptions.value = filteredOrganizations.map((org) => ({
      title: org.orgName,
      value: org.id,
    }));

    const mainTenant = filteredOrganizations.find(
      (org) => org.orgType && org.orgType.toLowerCase() === "clientorg",
    );

    if (mainTenant && !formData.value.orgLocation) {
      formData.value.orgLocation = mainTenant.id;
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
    errorMessage.value = "Failed to load organizations";
    showErrorAlert.value = true;
  } finally {
    organizationsLoading.value = false;
  }
};

// Fetch location data
const fetchLocationData = async (locationId) => {
  try {
    const response = await makeApiRequest(
      `/items/locationManagement/${locationId}`,
      {
        method: "GET",
      },
    );
    return response.data || response;
  } catch (error) {
    console.error("Error fetching location data:", error);
    throw error;
  }
};

// Update location
const updateLocationToApi = async (locationData) => {
  try {
    const result = await makeApiRequest(
      `/items/locationManagement/${locationData.id}`,
      {
        method: "PATCH",
        body: JSON.stringify(locationData),
      },
    );
    console.log("Location updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

// Load location data
const loadLocationData = async () => {
  const locationId = route.params.id;

  if (!locationId) {
    errorMessage.value = "Location ID not found";
    showErrorAlert.value = true;
    return;
  }

  try {
    const locationData = await fetchLocationData(locationId);
    console.log("Fetched location data:", locationData);

    formData.value = {
      id: locationData.id,
      locationName: locationData.locdetail?.locationName || "",
      contactPerson: locationData.contactDetails?.contactPerson || "",
      contactNumber: locationData.contactDetails?.contactNumber || "",
      orgLocation: locationData.orgLocation || "",
      pincodes: locationData.locdetail?.pincodes || [],
      radiusMm: parseInt(locationData.locSize) || 200,
      lat: locationData.locmark?.coordinates
        ? locationData.locmark.coordinates[1]
        : null,
      lng: locationData.locmark?.coordinates
        ? locationData.locmark.coordinates[0]
        : null,
      address: locationData.locdetail?.address || "",

      status: locationData.status || "active",
      tenant: locationData.tenant || tenantId,
    };

    // Migrate legacy pincode if exists
    if (
      locationData.locdetail?.pincode &&
      (!formData.value.pincodes || formData.value.pincodes.length === 0)
    ) {
      formData.value.pincodes = [locationData.locdetail.pincode];
      console.log("Auto-migrated legacy pincode to array format");
    }

    nextTick(() => {
      initMap();
    });
  } catch (error) {
    errorMessage.value = error.message || "Failed to load location data";
    showErrorAlert.value = true;
  }
};

// Save handler
const handleSave = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    errorMessage.value = "Please fill all required fields correctly";
    showErrorAlert.value = true;
    return;
  }

  if (!formData.value.lat || !formData.value.lng) {
    errorMessage.value = "Please select a location on the map";
    showErrorAlert.value = true;
    return;
  }

  if (formData.value.pincodes.length === 0) {
    errorMessage.value = "Please add at least one pincode";
    showErrorAlert.value = true;
    return;
  }

  const invalidPincodes = formData.value.pincodes.filter(
    (p) => !/^\d{6}$/.test(p),
  );
  if (invalidPincodes.length > 0) {
    errorMessage.value = `Invalid pincodes found: ${invalidPincodes.join(", ")}`;
    showErrorAlert.value = true;
    return;
  }

  isSaving.value = true;
  try {
    const locationPayload = {
      id: formData.value.id,
      locdetail: {
        locationName: formData.value.locationName,

        pincodes: [...new Set(formData.value.pincodes)],
        address: formData.value.address,
      },

      locSize: formData.value.radiusMm.toString(),
      locmark: {
        type: "Point",
        coordinates: [
          parseFloat(formData.value.lng),
          parseFloat(formData.value.lat),
        ],
      },
      orgLocation: formData.value.orgLocation,
      status: formData.value.status,
      tenant: formData.value.tenant,
      qrDetails: `${tenantId}|${formData.value.lng}|${formData.value.lat}`,
      contactDetails: {
        contactPerson: formData.value.contactPerson,
        contactNumber: formData.value.contactNumber,
      },
    };

    console.log("Final payload:", JSON.stringify(locationPayload, null, 2));

    await updateLocationToApi(locationPayload);

    showSuccessAlert.value = true;
    setTimeout(() => {
      router.push({ name: "org_location" });
    }, 2000);
  } catch (error) {
    errorMessage.value =
      error.message || "Failed to update location. Please try again.";
    showErrorAlert.value = true;
  } finally {
    isSaving.value = false;
  }
};

// LIFECYCLE HOOKS
const loadGoogleMaps = () => {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    nextTick(() => {
      initMap();
      fetchOrganizations();
      loadLocationData();
    });
  };
  document.head.appendChild(script);
};

onMounted(() => {
  loadGoogleMaps();
});

onUnmounted(() => {
  if (map) {
    map = null;
  }
  if (searchDebounceTimeout.value) {
    clearTimeout(searchDebounceTimeout.value);
  }
});
</script>

<style scoped>
.content-wrapper {
  height: calc(100vh - 64px);
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.map-card {
  border-radius: 12px;
  overflow: visible;
}

.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.map-wrapper {
  position: relative;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  z-index: 1;
}

.coordinates-display {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  pointer-events: none;
}

.v-row {
  margin-top: 1rem;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.v-col {
  padding: 8px 12px;
}

.v-label--active {
  color: #1976d2 !important;
}

:deep(.v-slider-thumb__label) {
  background-color: #1976d2;
}

:deep(.v-slider-track__fill) {
  background-color: #1976d2;
}

:deep(.v-chip) {
  margin: 2px;
}

:deep(.v-combobox .v-field__input) {
  min-height: 40px;
}

@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }
}
</style>
