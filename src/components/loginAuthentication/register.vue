<template>
  <v-app class="bg-app">
    <v-container class="py-8">
      <!-- Header -->
      <v-row class="mb-6" align="center" justify="center">
        <v-col cols="12" sm="10" md="8" lg="6" class="d-flex justify-center">
          <v-avatar size="44" class="mr-3" :style="logoStyle">
            <span class="font-weight-black">F</span>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-black brand-text">Fieldseasy</div>
            <div class="text-caption brand-sub">
              Join Fieldseasy Web Application
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Content -->
      <v-row justify="center">
        <!-- Registration Card -->
        <v-col cols="12" sm="8" md="6" lg="5">
          <v-card
            :style="cardStyle"
            rounded="lg"
            class="mx-auto"
            style="max-width: 500px"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between mb-1">
                <div class="text-h6 font-weight-black heading-text">
                  Create Account
                </div>
                <!-- <v-chip size="x-small" :style="demoChipStyle" variant="flat">
                  Demo only
                </v-chip> -->
              </div>
              <div class="text-caption help-text">
                Step {{ currentStep }} of 2:
                {{ currentStep === 1 ? "Company Details" : "Personal Details" }}
              </div>

              <!-- Progress Bar -->
              <v-progress-linear
                :model-value="currentStep === 1 ? 50 : 100"
                color="primary"
                height="6"
                rounded
                class="mt-4"
                :style="{ backgroundColor: colors.border }"
              ></v-progress-linear>

              <!-- Form -->
              <v-form ref="form" class="mt-4">
                <div v-if="currentStep === 1" class="step-content">
                  <div class="text-body-2 label-text mb-1">
                    GST Number (Optional)
                  </div>
                  <v-text-field
                    v-model="businessId"
                    label="Enter GST number"
                    variant="outlined"
                    density="comfortable"
                    maxlength="15"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-identifier"
                  ></v-text-field>
                  <div class="text-body-2 label-text mb-1">Company Name</div>
                  <v-text-field
                    v-model="companyName"
                    label="Enter company name"
                    variant="outlined"
                    density="comfortable"
                    :rules="requiredRule"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-office-building"
                  ></v-text-field>
                  <div class="text-body-2 label-text mb-1">Company Address</div>
                  <v-textarea
                    v-model="companyAddress"
                    label="Enter company address"
                    variant="outlined"
                    density="comfortable"
                    :rules="requiredRule"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-map-marker"
                    rows="3"
                  ></v-textarea>
                  <v-alert
                    v-if="folderCreationStatus"
                    type="info"
                    variant="tonal"
                    :style="infoAlertStyle"
                    density="comfortable"
                    class="mt-3"
                  >
                    {{ folderCreationStatus }}
                  </v-alert>
                </div>
                <div v-if="currentStep === 2" class="step-content">
                  <div class="text-body-2 label-text mb-1">Full Name</div>
                  <v-text-field
                    v-model="fullName"
                    label="Enter full name"
                    variant="outlined"
                    density="comfortable"
                    :rules="requiredRule"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-account"
                  ></v-text-field>
                  <div class="text-body-2 label-text mb-1">Email</div>
                  <v-text-field
                    v-model="email"
                    label="Enter email address"
                    variant="outlined"
                    density="comfortable"
                    :rules="emailRules"
                    type="email"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-email"
                  ></v-text-field>
                  <v-alert
                    v-if="emailError"
                    type="error"
                    variant="tonal"
                    :style="alertStyle"
                    density="comfortable"
                    class="mt-3"
                  >
                    {{ emailError }}
                  </v-alert>
                  <div class="text-body-2 label-text mb-1">Phone Number</div>
                  <v-text-field
                    v-model="mobileNumber"
                    label="Enter phone number"
                    variant="outlined"
                    density="comfortable"
                    :rules="phoneRules"
                    type="tel"
                    prefix="+91"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-phone"
                  ></v-text-field>
                  <v-alert
                    v-if="phoneError"
                    type="error"
                    variant="tonal"
                    :style="alertStyle"
                    density="comfortable"
                    class="mt-3"
                  >
                    {{ phoneError }}
                  </v-alert>
                  <div class="text-body-2 label-text mb-1">Employee ID</div>
                  <v-text-field
                    v-model="employeeId"
                    label="Enter employee ID"
                    variant="outlined"
                    density="comfortable"
                    :rules="requiredRule"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-card-account-details"
                  ></v-text-field>
                  <div class="text-body-2 label-text mb-1">
                    User PAN (Optional)
                  </div>
                  <v-text-field
                    v-model="userPan"
                    label="Enter PAN"
                    variant="outlined"
                    density="comfortable"
                    :rules="panRules"
                    maxlength="10"
                    :style="inputStyle"
                    prepend-inner-icon="mdi-card-account-details-outline"
                  ></v-text-field>
                </div>

                <!-- Buttons -->
                <div class="d-flex ga-2 mt-4">
                  <v-btn
                    v-if="currentStep > 1"
                    variant="outlined"
                    size="large"
                    :style="ghostBtnStyle"
                    @click="prevStep"
                    class="flex-grow-0"
                  >
                    <v-icon left>mdi-arrow-left</v-icon>Back
                  </v-btn>
                  <v-btn
                    block
                    size="large"
                    :loading="isLoading"
                    :style="primaryBtnStyle"
                    @click="handleStep"
                    :class="{ 'flex-grow-1': true, 'ml-2': currentStep > 1 }"
                  >
                    {{ currentStep === 1 ? "Continue" : "Create Account" }}
                    <v-icon right>{{
                      currentStep === 1 ? "mdi-arrow-right" : "mdi-check"
                    }}</v-icon>
                  </v-btn>
                </div>

                <!-- Footer -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  :style="alertStyle"
                  density="comfortable"
                  class="mt-4"
                >
                  {{ error }}
                </v-alert>
                <v-alert
                  v-if="successMessage"
                  type="success"
                  variant="tonal"
                  :style="successAlertStyle"
                  density="comfortable"
                  class="mt-4"
                >
                  {{ successMessage }}
                </v-alert>
                <div class="text-center mt-4">
                  <v-btn
                    variant="text"
                    :style="{ color: colors.brand }"
                    :to="{ path: '/login' }"
                  >
                    Already have an account? Sign-in
                  </v-btn>
                </div>
                <div class="text-caption help-text mt-4">
                  © {{ year }} Fieldseasy
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

const currentStep = ref(1);
const isLoading = ref(false);
const error = ref("");
const successMessage = ref("");
const folderCreationStatus = ref("");
const companyName = ref("");
const businessId = ref("");
const companyAddress = ref("");
const locationData = ref(null);
const createdResources = ref({
  tenant: null,
  folders: [],
  location: null,
  organization: null,
  attendanceCycle: null,
  shift: null,
  personalModule: null,
  configs: [],
});
const createdFolderStructure = ref(null);
const fullName = ref("");
const email = ref("");
const mobileNumber = ref("");
const employeeId = ref("");
const userPan = ref("");
const emailError = ref("");
const phoneError = ref("");
const form = ref(null);
const year = ref(new Date().getFullYear());

const requiredRule = [(v) => !!v || "This field is required"];
const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
  async (v) => await validateEmail(v),
];
const phoneRules = [
  (v) => !!v || "Phone number is required",
  (v) => /^\d{10}$/.test(v) || "Phone number must be 10 digits",
  async (v) => await validatePhoneNumber(v),
];
const panRules = [
  (v) =>
    !v ||
    /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v) ||
    "PAN must be 10 characters (5 letters, 4 numbers, 1 letter)",
];

watch(
  () => businessId.value,
  () => {
    // No GST verification, so no need to reset fields
  },
);

async function validateStep() {
  if (!form.value) return false;
  const { valid, errors } = await form.value.validate();
  if (!valid) {
    error.value = `Please correct the following errors: ${errors
      .map((err) => `${err.id}: ${err.errorMessages[0]}`)
      .join(", ")}`;
    return false;
  }
  error.value = "";
  return true;
}

async function getGeocoding(address) {
  if (!address) return;
  try {
    const geocodeResponse = await api.post("/branchLocation/location/geocode", {
      address,
    });
    locationData.value = {
      lat: geocodeResponse.data.lat,
      lng: geocodeResponse.data.lng,
    };
  } catch (error) {
    locationData.value = null;
  }
}

async function createLocationManagement(tenantId) {
  try {
    const locationPayload = {
      status: "active",
      locType: "branch",
      locdetail: {
        locationName: companyName.value,
        pincode: extractPincode(companyAddress.value),
        address: companyAddress.value,
      },
      orgLocation: null,
      tenant: tenantId,
      ...(locationData.value
        ? {
            locmark: {
              type: "Point",
              coordinates: [locationData.value.lng, locationData.value.lat],
            },
          }
        : {}),
    };
    const locationResponse = await api.post(
      "/items/locationManagement",
      locationPayload,
    );
    if (locationResponse.status === 200 || locationResponse.status === 201) {
      const locationId = locationResponse.data.data.id;
      createdResources.value.location = locationId;
      return locationId;
    }
    throw new Error("Failed to create location");
  } catch (error) {
    return null;
  }
}

function extractPincode(address) {
  const pincodeMatch = address.match(/\b\d{6}\b/);
  return pincodeMatch ? pincodeMatch[0] : "";
}

async function createFolderStructure(tenantId) {
  try {
    folderCreationStatus.value = "Creating folder structure...";
    const mainFolderResponse = await createFolder(tenantId);
    const mainFolderId = mainFolderResponse.data.data.id;
    createdResources.value.folders.push(mainFolderId);
    const childFolders = [
      "Profiles",
      "Faces",
      "Fingers",
      "Imported Files",
      "Documents",
      "DeviceImages",
      "TDS Documents",
      "Leave Documents",
      "Asserts",
      "Workorders",
      "rfidCard",
    ];
    const folderIds = {};
    const allFolders = [{ id: mainFolderId, name: tenantId, parent: null }];
    for (const folderName of childFolders) {
      const folderResponse = await createFolder(folderName, mainFolderId);
      const folderId = folderResponse.data.data.id;
      createdResources.value.folders.push(folderId);
      folderIds[folderName] = folderId;
      allFolders.push({
        id: folderId,
        name: folderName,
        parent: mainFolderId,
      });
    }
    const importedFilesSubFolders = ["EmployeeDatas", "AttendanceRecords"];
    for (const subFolder of importedFilesSubFolders) {
      const folderResponse = await createFolder(
        subFolder,
        folderIds["Imported Files"],
      );
      const folderId = folderResponse.data.data.id;
      createdResources.value.folders.push(folderId);
      allFolders.push({
        id: folderId,
        name: subFolder,
        parent: folderIds["Imported Files"],
      });
    }
    const documentsSubFolders = ["OnboardDocuments", "OffBoardDocuments"];
    for (const subFolder of documentsSubFolders) {
      const folderResponse = await createFolder(
        subFolder,
        folderIds["Documents"],
      );
      const folderId = folderResponse.data.data.id;
      createdResources.value.folders.push(folderId);
      allFolders.push({
        id: folderId,
        name: subFolder,
        parent: folderIds["Documents"],
      });
    }
    await updateTenantWithFolders(tenantId, allFolders);
    createdFolderStructure.value = { mainFolderId, folderIds, allFolders };
    folderCreationStatus.value = "Folder structure created successfully!";
    return createdFolderStructure.value;
  } catch (error) {
    folderCreationStatus.value = "Error creating folder structure.";
    throw error;
  }
}

async function createFolder(name, parent = null) {
  const payload = { name, ...(parent ? { parent } : {}) };
  return await api.post("/folders", payload);
}

async function updateTenantWithFolders(tenantId, folders) {
  try {
    return await api.patch(`/items/tenant/${tenantId}`, {
      foldersId: folders,
    });
  } catch (error) {
    throw error;
  }
}

async function cleanupResources() {
  try {
    folderCreationStatus.value = "Cleaning up resources due to error...";
    for (const configId of createdResources.value.configs) {
      try {
        await api.delete(`/items/config/${configId}`);
      } catch (error) {
        console.error(`Error deleting config ${configId}:`, error);
      }
    }
    if (createdResources.value.personalModule) {
      try {
        await api.delete(
          `/items/personalModule/${createdResources.value.personalModule}`,
        );
      } catch (error) {
        console.error(
          `Error deleting personal module ${createdResources.value.personalModule}:`,
          error,
        );
      }
    }
    if (createdResources.value.shift) {
      try {
        await api.delete(`/items/shifts/${createdResources.value.shift}`);
      } catch (error) {
        console.error(
          `Error deleting shift ${createdResources.value.shift}:`,
          error,
        );
      }
    }
    if (createdResources.value.attendanceCycle) {
      try {
        await api.delete(
          `/items/attendanceCycle/${createdResources.value.attendanceCycle}`,
        );
      } catch (error) {
        console.error(
          `Error deleting attendance cycle ${createdResources.value.attendanceCycle}:`,
          error,
        );
      }
    }
    if (
      createdFolderStructure.value &&
      createdFolderStructure.value.allFolders
    ) {
      const foldersByParent = {};
      for (const folder of createdFolderStructure.value.allFolders) {
        foldersByParent[folder.parent] = (
          foldersByParent[folder.parent] || []
        ).concat(folder);
      }
      const deleteQueue = [];
      const visited = new Set();
      const collectFoldersToDelete = (folderId) => {
        if (visited.has(folderId)) return;
        visited.add(folderId);
        const children = foldersByParent[folderId] || [];
        for (const child of children) collectFoldersToDelete(child.id);
        deleteQueue.push(folderId);
      };
      if (createdFolderStructure.value.mainFolderId)
        collectFoldersToDelete(createdFolderStructure.value.mainFolderId);
      for (let i = deleteQueue.length - 1; i >= 0; i--) {
        try {
          await api.delete(`/folders/${deleteQueue[i]}`);
        } catch (folderError) {
          console.error(
            `Error deleting folder ${deleteQueue[i]}:`,
            folderError,
          );
        }
      }
    } else {
      for (const folder of createdResources.value.folders.reverse()) {
        try {
          await api.delete(`/folders/${folder}`);
        } catch (folderError) {
          console.error(`Error deleting folder ${folder}:`, folderError);
        }
      }
    }
    if (createdResources.value.organization) {
      try {
        await api.delete(
          `/items/organization/${createdResources.value.organization}`,
        );
      } catch (error) {
        console.error(
          `Error deleting organization ${createdResources.value.organization}:`,
          error,
        );
      }
    }
    if (createdResources.value.location) {
      try {
        await api.delete(
          `/items/locationManagement/${createdResources.value.location}`,
        );
      } catch (error) {
        console.error(
          `Error deleting location ${createdResources.value.location}:`,
          error,
        );
      }
    }
    if (createdResources.value.tenant) {
      try {
        await api.delete(`/items/tenant/${createdResources.value.tenant}`);
      } catch (error) {
        console.error(
          `Error deleting tenant ${createdResources.value.tenant}:`,
          error,
        );
      }
    }
    error.value =
      "Due to an issue, all created details have been deleted. Please try again or contact the support team at support@senzrgo.com.";
  } catch (error) {
    error.value =
      "An error occurred during cleanup. Some details may remain. Please try again or contact the support team at support@senzrgo.com.";
  }
}

async function handleStep() {
  if (!(await validateStep())) return;
  if (currentStep.value === 1) {
    currentStep.value = 2;
  } else {
    await handleRegistration();
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--;
}

async function handleRegistration() {
  isLoading.value = true;
  error.value = "";
  folderCreationStatus.value = "";
  createdResources.value = {
    tenant: null,
    folders: [],
    location: null,
    organization: null,
    attendanceCycle: null,
    shift: null,
    personalModule: null,
    configs: [],
  };
  createdFolderStructure.value = null;
  if (!email.value.includes("@") || !email.value.includes(".")) {
    error.value = "Please enter a valid email address";
    isLoading.value = false;
    return;
  }
  if (!companyName.value) {
    error.value = "Company name is required";
    isLoading.value = false;
    return;
  }
  if (!employeeId.value) {
    error.value = "Please enter your employee ID";
    isLoading.value = false;
    return;
  }
  try {
    const emailResponse = await api.get(`/users`, {
      params: { "filter[email][_eq]": email.value, "fields[]": "email" },
    });
    if (emailResponse.data.data.length > 0) {
      error.value = "Email already exists";
      isLoading.value = false;
      return;
    }
    const tenantPayload = {
      tenantName: companyName.value,
      panOrGst: businessId.value,
    };
    const tenantResponse = await api.post("/items/tenant", tenantPayload);
    if (tenantResponse.status !== 200 && tenantResponse.status !== 201)
      throw new Error("Failed to create tenant");
    const tenantId = tenantResponse.data.data.tenantId;
    createdResources.value.tenant = tenantId;
    await createFolderStructure(tenantId);
    const locationId = await createLocationManagement(tenantId);
    let organizationId = null;
    const organizationPayload = {
      orgName: companyName.value,
      orgNumber: mobileNumber.value ? `+91${mobileNumber.value}` : null,
      orgGst: businessId.value,
      orgType: "main tenant",
      orgAddress: companyAddress.value,
      tenant: tenantId,
      ...(locationId ? { orgLocation: locationId } : {}),
    };
    const organizationResponse = await api.post(
      "/items/organization",
      organizationPayload,
    );
    if (
      organizationResponse.status === 200 ||
      organizationResponse.status === 201
    ) {
      organizationId = organizationResponse.data.data.id;
      createdResources.value.organization = organizationId;
      if (locationId && organizationId) {
        await api.patch(`/items/locationManagement/${locationId}`, {
          orgLocation: organizationId,
        });
      }
    }
    const attendanceCyclePayload = {
      fixedCycle: true,
      tenant: tenantId,
      multi_attendance_cycle: {
        cycles: [
          {
            cycleId: 1,
            cycleName: "Normal Employee",
            startDate: 1,
            endDate: "end of the month",
            includeWeekends: true,
            includeHolidays: true,
          },
          {
            cycleId: 2,
            cycleName: "Daily wages Employee",
            startDate: 14,
            endDate: 15,
            includeWeekends: true,
            includeHolidays: true,
          },
        ],
      },
    };
    const attendanceCycleResponse = await api.post(
      "/items/attendanceCycle",
      attendanceCyclePayload,
    );
    createdResources.value.attendanceCycle =
      attendanceCycleResponse.data.data.id;
    const shiftResponse = await api.post("/items/shifts", {
      shift: "GeneralShift",
      entryTime: "09:00:00",
      exitTime: "18:00:00",
      break: "00:30:00",
      status: "assigned",
      tenant: tenantId,
    });
    const shiftId = shiftResponse.data.data.id;
    createdResources.value.shift = shiftId;
    const rolesResponse = await api.get("/roles", {
      params: { "filter[name][_eq]": "Admin", "fields[]": "id" },
    });
    const adminRoleId =
      rolesResponse.data.data?.[0]?.id ||
      "ea2303aa-1662-43ca-a7f7-ab84924a7e0a";
    const personalModulePayload = {
      status: "active",
      accessOn: true,
      employeeId: employeeId.value,
      cycleType: 1,
      uniqueId: `${tenantId}-${employeeId.value}`,
      attendanceSettings: {
        isMonday: false,
        monJ: { shifts: [shiftId] },
        isTuesday: false,
        tueJ: { shifts: [shiftId] },
        isWednesday: false,
        wedJ: { shifts: [shiftId] },
        isThursday: false,
        thuJ: { shifts: [shiftId] },
        isFriday: false,
        friJ: { shifts: [shiftId] },
        isSaturday: false,
        satJ: { shifts: [shiftId] },
        isSunday: true,
        sunJ: { shifts: [] },
      },
      assignedUser: {
        first_name: fullName.value,
        email: email.value,
        phone: `+91${mobileNumber.value}`,
        role: adminRoleId,
        tenant: tenantId,
        pan: userPan.value,
        appAccess: true,
        organization: organizationId,
        userApp: "fieldeasy",
      },
    };
    const personalModuleResponse = await api.post(
      "/items/personalModule",
      personalModulePayload,
    );
    createdResources.value.personalModule = personalModuleResponse.data.data.id;

    const salaryBreakdownResponse = await api.post("/items/SalaryBreakdown", {
      employee: personalModuleResponse.data.data.id,
      tenant: tenantId,
    });
    createdResources.value.salaryBreakdown =
      salaryBreakdownResponse.data.data.id;

    const defaultTemplates = [
      { name: "Regular Staff", type: "regular" },
      { name: "Housekeeping Employee", type: "housekeeping" },
      { name: "Security Staff", type: "security" },
      { name: "Flex Shifts", type: "flex" },
    ];
    for (const template of defaultTemplates) {
      const templateResponse = await api.post("/items/config", {
        configName: template.name,
        tenant: tenantId,
        attendancePolicies: { locationCentric: false },
        salarySettings: { status: "draft" },
      });
      createdResources.value.configs.push(templateResponse.data.data.id);
    }
    successMessage.value = "Everything created successfully!";
    setTimeout(() => router.push("/login"), 2000);
  } catch (e) {
    let errorMessage = e.response
      ? e.response.status === 429
        ? "Too many requests. Please try again later."
        : e.response.status >= 500
          ? "Server error. Please try again or contact support."
          : e.response.data.message || e.message
      : "An error occurred during registration.";
    error.value = `${errorMessage} Cleaning up created resources...`;
    await cleanupResources();
    isLoading.value = false;
  }
}

async function validateEmail(value) {
  if (!value) return true;
  try {
    const response = await api.get(`/users`, {
      params: { "filter[email][_eq]": value, "fields[]": "email" },
    });
    if (response.data.data.length > 0) {
      emailError.value =
        "This email is already registered. Please use a different email.";
      return false;
    }
    emailError.value = "";
    return true;
  } catch (error) {
    emailError.value =
      "An error occurred while validating the email. Please try again.";
    return false;
  }
}

async function validatePhoneNumber(value) {
  if (!value) return true;
  try {
    const response = await api.get(`/users`, {
      params: {
        "filter[phone][_eq]": `+91${value}`,
        "fields[]": "phone",
        "fields[]": "userApp",
      },
    });
    if (
      response.data.data.some((user) =>
        user.userApp?.toLowerCase().includes("fieldeasy"),
      )
    ) {
      phoneError.value =
        "This phone number is already registered for fieldseasy. Please log in or use a different number.";
      return false;
    }
    phoneError.value = "";
    return true;
  } catch (error) {
    phoneError.value =
      "An error occurred while validating the phone number. Please try again.";
    return false;
  }
}

/* Inline palette + styles to match the login page */
const colors = {
  background: "#122f68",
  surface: "#0f2a57",
  border: "#2a4a8a",
  brand: "#5b7fff",
  accent: "#4dd6c2",
  text: "#d7e3ff",
  textSub: "#b9d1ff",
};

const bgAppStyle = {
  backgroundColor: colors.background,
};

const cardStyle = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.text,
};

const inputStyle = {
  backgroundColor: "#103063",
  color: colors.text,
  borderColor: colors.border,
};

const primaryBtnStyle = {
  background: `linear-gradient(90deg, ${colors.brand}, ${colors.accent})`,
  color: "#ffffff",
};

const ghostBtnStyle = {
  backgroundColor: "#103063",
  color: colors.text,
  border: `1px solid ${colors.border}`,
};

const alertStyle = {
  background:
    "linear-gradient(135deg, rgba(254,202,202,0.9), rgba(248,113,113,0.95))",
  color: "#7f1d1d",
  border: "1px solid rgba(239,68,68,0.4)",
};

const successAlertStyle = {
  background:
    "linear-gradient(135deg, rgba(209,250,229,0.9), rgba(110,231,183,0.95))",
  color: "#065f46",
  border: "1px solid rgba(16,185,129,0.4)",
};

const infoAlertStyle = {
  background:
    "linear-gradient(135deg, rgba(191,219,254,0.9), rgba(147,197,253,0.95))",
  color: "#1e40af",
  border: "1px solid rgba(59,130,246,0.4)",
};

const demoChipStyle = {
  backgroundColor: "rgba(251,191,36,0.25)",
  border: "1px solid rgba(251,191,36,0.35)",
  color: "#fde68a",
};

const logoStyle = {
  background: `linear-gradient(135deg, ${colors.brand}, ${colors.accent})`,
  color: "#fff",
};
</script>

<style scoped>
.bg-app {
  min-height: 100vh;
  background-color: #122f68;
}

.brand-text {
  color: #d7e3ff;
  letter-spacing: -0.02em;
}

.brand-sub {
  color: #b9d1ff;
}

.heading-text {
  color: #d7e3ff;
}

.help-text {
  color: #b9d1ff;
}

.label-text {
  color: #d7e3ff;
}

.step-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
