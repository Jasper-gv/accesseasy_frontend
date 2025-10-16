<template>
  <div>
    <v-form ref="form">
      <v-toolbar density="compact" color="grey-lighten-4">
        <v-btn icon color="black" @click="handleClose">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title class="ml-4">Add Brach</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" class="mr-2" @click="handleClose">
          CANCEL
        </v-btn>
        <v-btn
          style="background-color: skyblue"
          color="white"
          @click="handleSave"
          :loading="isSaving"
        >
          SAVE
        </v-btn>
      </v-toolbar>

      <div class="d-flex content-wrapper">
        <!-- Side Navigation -->
        <div class="side-nav pa-4">
          <v-list density="compact" nav>
            <v-list-item
              v-for="(item, i) in menuItems"
              :key="i"
              :value="item"
              :active="selectedTab === item.value"
              @click="selectedTab = item.value"
              color="black"
              rounded
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Content Area -->
        <div class="content-area pa-4">
          <v-card flat>
            <v-window v-model="selectedTab">
              <!-- Basic Details -->
              <v-window-item value="basic">
                <v-row>
                  <!-- Location Name -->
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="formData.locationName"
                      label="Branch Name *"
                      variant="outlined"
                      density="comfortable"
                      :rules="locationNameRules"
                      required
                    ></v-text-field>
                  </v-col>

                  <!-- Location Type -->
                  <!-- <v-col cols="12" sm="6">
                    <v-select
                      v-model="formData.locationType"
                      label="Location Type *"
                      :items="locationTypeOptions"
                      :rules="[(v) => !!v || 'Location type is required']"
                      required
                      variant="outlined"
                      density="comfortable"
                    ></v-select>
                  </v-col> -->

                  <!-- Organization Selection -->
                  <!-- <v-col cols="12" sm="6">
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
                  </v-col> -->

                  <!-- Multiple Pincodes with Index Display -->
                  <v-col cols="12" sm="6">
                    <!-- Display Pincodes with Index -->
                    <v-card
                      class="pa-3 mb-3"
                      elevation="1"
                      v-if="formData.pincodes.length > 0"
                    >
                      <v-card-title class="text-subtitle-1 pa-0 mb-2">
                        <v-icon class="mr-2" color="primary"
                          >mdi-map-marker</v-icon
                        >
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

                    <!-- Pincode Input with Validation -->
                    <v-text-field
                      v-model="newPincode"
                      label="Add New Pincode"
                      variant="outlined"
                      density="comfortable"
                      type="number"
                      maxlength="6"
                      @keyup.enter="addPincode"
                      append-inner-icon="mdi-plus"
                      @click:append-inner="addPincode"
                      :rules="[
                        (v) =>
                          !v ||
                          /^\d{6}$/.test(v) ||
                          'Pincode must be exactly 6 digits',
                        (v) =>
                          !formData.pincodes.includes(v) ||
                          'Pincode already added',
                      ]"
                      :hint="`Enter 6-digit pincode (${formData.pincodes.length} added)`"
                      persistent-hint
                    ></v-text-field>

                    <v-alert
                      v-if="pincodeValidationMessage"
                      :type="pincodeValidationType"
                      variant="tonal"
                      density="compact"
                      class="mt-2"
                    >
                      {{ pincodeValidationMessage }}
                    </v-alert>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="formData.state"
                      :items="stateOptions"
                      label="State *"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'State is required']"
                      @change="updateState"
                    ></v-select>
                  </v-col>

                  <!-- Serviceable Area Radius -->
                  <!-- <v-col cols="12" sm="8">
                    <v-card class="pa-4" elevation="1">
                      <v-card-title class="text-subtitle-1 pa-0 mb-3">
                        <v-icon class="mr-2" color="primary"
                          >mdi-map-marker-radius</v-icon
                        >
                        Serviceable Area Radius
                      </v-card-title>

                     
                      <v-slider
                        v-model="formData.radiusKm"
                        label="Radius (KM)"
                        min="1"
                        max="500"
                        step="1"
                        thumb-label="always"
                        :rules="radiusRules"
                        color="primary"
                        class="mb-4"
                      >
                        <template v-slot:append>
                          <v-text-field
                            v-model="formData.radiusKm"
                            style="width: 100px"
                            density="compact"
                            hide-details
                            variant="outlined"
                            suffix="KM"
                            :min="1"
                            :max="500"
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
                            <strong>Radius:</strong> {{ formData.radiusKm }} KM
                            ({{ radiusInMeters }} meters)
                          </div>
                        </div>
                      </v-alert>

                      <div class="text-caption text-grey-darken-1">
                        <v-icon size="small" class="mr-1"
                          >mdi-information</v-icon
                        >
                        Set the radius for serviceable area coverage (1-500 KM)
                      </div>
                    </v-card>
                  </v-col> -->

                  <v-col cols="12">
                    <v-card class="map-card" elevation="2">
                      <v-card-title class="pa-3 pb-2">
                        <v-icon class="mr-2" color="primary"
                          >mdi-map-marker</v-icon
                        >
                        <span class="text-h6">Location Selection</span>
                      </v-card-title>
                      <v-card-text class="pa-3">
                        <!-- Search Bar -->
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
                          <!-- Search Results -->
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
                        <!-- Map Container -->
                        <div class="map-wrapper">
                          <div id="map" class="map-container"></div>
                          <!-- Coordinates Display -->
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
                          <v-icon size="small" class="mr-1"
                            >mdi-information</v-icon
                          >
                          Click on the map to select location or use the search
                          above
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Address Display -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.address"
                      label="Selected Address"
                      variant="outlined"
                      rows="3"
                      readonly
                      auto-grow
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-window-item>
            </v-window>
          </v-card>
        </div>
      </div>

      <!-- Success Snackbar -->
      <v-snackbar
        v-model="showSuccessAlert"
        color="success"
        timeout="2000"
        location="top"
      >
        <v-icon class="me-2" color="white">mdi-check-circle</v-icon>
        Location added successfully!
      </v-snackbar>

      <!-- Error Snackbar -->
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
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
const tenantId = currentUserTenant.getTenantId();
const router = useRouter();
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const errorMessage = ref("");
const form = ref(null);
const selectedTab = ref("basic");
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

// ==================== API CONFIGURATION ====================
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

// ==================== FORM DATA & VALIDATION ====================
// Form data
const formData = ref({
  locationName: "",
  locationType: "branch",
  orgLocation: "",
  pincodes: [],
  radiusKm: 5,
  lat: null,
  lng: null,
  address: "",
  state: null,
});

// Computed property for radius in meters
const radiusInMeters = computed(() => {
  return formData.value.radiusKm * 1000;
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
    locType: formData.value.locationType,
    locSize: `${formData.value.radiusKm}`,
    locmark: {
      type: "Point",
      coordinates: [
        parseFloat(formData.value.lng),
        parseFloat(formData.value.lat),
      ],
    },
    orgLocation: formData.value.orgLocation,
    status: "draft",
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
  if (orgType.includes("tenant")) return "blue";
  if (orgType.includes("distributor")) return "green";
  if (orgType.includes("client")) return "yellow";
  return "grey";
};

// Location type options
const locationTypeOptions = [{ title: "Branch", value: "branch" }];

// Menu items
const menuItems = [
  {
    title: "Basic Details",
    icon: "mdi-card-text-outline",
    value: "basic",
  },
];

// Validation rules
const locationNameRules = [
  (v) => !!v || "Location name is required",
  (v) => (v && v.length >= 3) || "Location name must be at least 3 characters",
];

const radiusRules = [
  (v) => (v >= 1 && v <= 500) || "Radius must be between 1-500 KM",
];

// Pincode validation rules
const pincodeRules = computed(() => {
  return [
    (v) => (v && v.length > 0) || "At least one pincode is required",
    (v) =>
      !v ||
      v.every((pincode) => /^\d{6}$/.test(pincode)) ||
      "All pincodes must be 6 digits",
  ];
});

// ==================== PINCODE FUNCTIONALITY ====================
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

// ==================== MAP FUNCTIONALITY ====================
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

// ==================== SEARCH FUNCTIONALITY ====================
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

// ==================== FORM HANDLERS ====================
const handleClose = () => {
  router.push({ name: "branch-configuration" });
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
    organizationOptions.value = organizations.value.map((org) => ({
      title: org.orgName,
      value: org.id,
    }));

    // Set default to main tenant if found
    const mainTenant = organizations.value.find(
      (org) => org.orgType && org.orgType.toLowerCase() === "main tenant",
    );

    if (mainTenant) {
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

// Save Location
const saveLocationToApi = async (locationData) => {
  try {
    console.log(
      "Saving location with data:",
      JSON.stringify(locationData, null, 2),
    );
    const result = await makeApiRequest("/items/locationManagement", {
      method: "POST",
      body: JSON.stringify(locationData),
    });

    console.log("Location saved successfully:", result);
    return result;
  } catch (error) {
    console.error("Error saving location:", error);
    throw error;
  }
};

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
      locdetail: {
        locationName: formData.value.locationName,
        pincodes: [...new Set(formData.value.pincodes)],
        address: formData.value.address,
      },
      state: formData.value.state,
      locType: "branch",
      locSize: formData.value.radiusKm.toString(),
      locmark: {
        type: "Point",
        coordinates: [
          parseFloat(formData.value.lng),
          parseFloat(formData.value.lat),
        ],
      },
      // orgLocation: formData.value.orgLocation,
      status: "active",
      tenant: tenantId,
      qrDetails: `${tenantId}|${formData.value.lng}|${formData.value.lat}`,
    };

    console.log("Final payload:", JSON.stringify(locationPayload, null, 2));

    const result = await saveLocationToApi(locationPayload);
    console.log("API response:", result);

    showSuccessAlert.value = true;
    setTimeout(() => {
      router.push({ name: "branch-configuration" });
    }, 2000);
  } catch (error) {
    errorMessage.value =
      error.message || "Failed to add location. Please try again.";
    showErrorAlert.value = true;
  } finally {
    isSaving.value = false;
  }
};

// ==================== LIFECYCLE HOOKS ====================
const loadGoogleMaps = () => {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    nextTick(() => {
      initMap();
      fetchOrganizations();
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
}

.side-nav {
  width: 240px;
  border-right: 1px solid #e0e0e0;
  background-color: white;
  height: 100%;
}

.content-area {
  flex: 1;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}

.v-row {
  margin-top: 1rem;
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

.index-display {
  max-height: 200px;
  overflow-y: auto;
}

.index-item {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.index-item:last-child {
  border-bottom: none;
}

.text-h6 {
  font-weight: 600;
  color: #1976d2;
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

/* Enhanced styles for pincode chips */
:deep(.v-chip) {
  margin: 2px;
}

:deep(.v-combobox .v-field__input) {
  min-height: 40px;
}

/* JSON code display styling */
:deep(.v-code) {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .side-nav {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .map-container {
    height: 300px;
  }
}
</style>
