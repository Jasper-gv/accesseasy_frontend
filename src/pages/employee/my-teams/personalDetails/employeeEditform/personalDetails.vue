<template>
  <div class="personal-details">
    <v-container v-if="loading">
      <v-row>
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="black"
          ></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
    <v-container
      v-else-if="employeeData && employeeData.assignedUser"
      class="pa-4"
    >
      <div class="d-flex justify-space-between align-center mb-4">
        <h3>Employee Details</h3>
        <div class="d-flex gap-3">
          <div class="d-flex align-center">
            <div>
              <BaseButton
                :text="'Update'"
                variant="primary"
                :disabled="
                  !hasChanges ||
                  phoneErrorMessage.value ||
                  emailErrorMessage.value
                "
                @click="updatePersonalDetails"
              />
            </div>
          </div>
        </div>
      </div>
      <br />
      <v-row>
        <!-- Avatar Section -->
        <v-col cols="12" class="d-flex justify-center align-center mb-4">
          <div class="avatar-container">
            <v-avatar size="150">
              <v-img v-if="avatarImage" :src="avatarImage" alt="Avatar"></v-img>
              <v-icon
                v-else
                size="150"
                color="grey lighten-1"
                style="border: 2px solid gray; border-radius: 50%; padding: 5px"
              >
                mdi-account-circle
              </v-icon>
            </v-avatar>
            <v-btn
              icon
              class="edit-avatar-btn"
              @click="triggerFileInput"
              color="white"
              style="background-color: black"
            >
              <v-icon>mdi-camera</v-icon>
            </v-btn>
          </div>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept="image/*"
            @change="handleAvatarChange"
          />
        </v-col>
        <!-- First Name -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.first_name"
            :label="'First Name *'"
            required
            :error-messages="getFieldErrorMessage('first_name')"
            variant="outlined"
            density="comfortable"
            @blur="markFieldAsTouched('first_name')"
            @input="capitalizeFirstLetterEachWord('first_name')"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.middleName"
            :label="'Middle Name'"
            variant="outlined"
            density="comfortable"
            @input="capitalizeFirstLetterEachWord('middleName')"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.last_name"
            :label="'Last Name'"
            :error-messages="getFieldErrorMessage('last_name')"
            variant="outlined"
            density="comfortable"
            @blur="markFieldAsTouched('last_name')"
            @input="capitalizeFirstLetterEachWord('last_name')"
          />
        </v-col>
        <!-- Employee ID -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.employeeId"
            label="Employee ID *"
            required
            :error-messages="getFieldErrorMessage('employeeId')"
            variant="outlined"
            density="comfortable"
            :disabled="isRoleDisabled"
            @blur="markFieldAsTouched('employeeId')"
            @input="handleInputChange('employeeId')"
          ></v-text-field>
        </v-col>
        <!-- Gender -->
        <v-col cols="12" md="6">
          <v-select
            v-model="employeeData.assignedUser.gender"
            :items="['Female', 'Male', 'Other']"
            label="Gender *"
            variant="outlined"
            density="comfortable"
            :error-messages="getFieldErrorMessage('gender')"
            @blur="markFieldAsTouched('gender')"
            @update:model-value="validateField('gender')"
            required
          ></v-select>
        </v-col>
        <!-- Phone -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="displayPhone"
            :label="'Phone'"
            type="tel"
            :error-messages="phoneErrorMessage"
            variant="outlined"
            density="comfortable"
            @blur="validatePhone"
            @input="clearPhoneError"
            maxlength="10"
          ></v-text-field>
        </v-col>
        <!-- Email -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.email"
            :label="'Email'"
            :error-messages="emailErrorMessage"
            variant="outlined"
            density="comfortable"
            @blur="validateEmail"
            @input="
              clearEmailError();
              toLowerCase('email');
            "
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedRole"
            :items="roleOptions"
            item-title="name"
            item-value="id"
            label="Role"
            variant="outlined"
            density="comfortable"
            :disabled="isRoleDisabled"
            @update:model-value="handleRoleChange"
          ></v-select>
          <!-- <v-select
            v-model="employeeData.assignedUser.organization"
            :items="orgOptions"
            item-title="orgName"
            item-value="id"
            label="Organization"
            variant="outlined"
            density="comfortable"
            return-object
          ></v-select> -->
        </v-col>
        <!-- Office Email -->
        <!-- <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.officeEmail"
            label="Office Email"
            :error-messages="getFieldErrorMessage('officeEmail')"
            variant="outlined"
            density="comfortable"
            @blur="markFieldAsTouched('officeEmail')"
            @input="
              handleInputChange('assignedUser.officeEmail');
              toLowerCase('officeEmail');
            "
          ></v-text-field>
        </v-col> -->
        <!-- Role -->
        <v-col cols="12" md="6"> </v-col>
        <!-- <v-col cols="12" md="6">
          <v-select
            v-model="employeeData.assignedUser.skilled"
            :items="[
              'Skilled',
              'HighlySkilled',
              'UnSkilled',
              'SemiSkilled',
              'Drivers',
              'OfficeStaffs',
              'Others',
            ]"
            label="Skill Type"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-col> -->
        <!-- <v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.country || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.country = val"
    label="Country"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.dist || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.dist = val"
    label="District"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.state || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.state = val"
    label="State"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.po || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.po = val"
    label="Post Office"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.house || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.house = val"
    label="House Number"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.loc || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.loc = val"
    label="Location"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.vtc || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.vtc = val"
    label="Village/Town/City"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.subdist || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.subdist = val"
    label="Sub-District"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.street || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.street = val"
    label="Street"
    variant="outlined"
    density="comfortable"
  />
</v-col>

<v-col cols="12" md="6">
  <v-text-field
    :model-value="employeeData.assignedUser?.permanentAddress?.landmark || ''"
    @update:model-value="val => employeeData.assignedUser.permanentAddress.landmark = val"
    label="Landmark"
    variant="outlined"
    density="comfortable"
  />
</v-col> -->
      </v-row>

      <v-row>
        <v-col cols="12">
          <h3>Other Details</h3>
          <br />
        </v-col>
        <!-- <v-col cols="12" md="6">
          <v-switch
            v-model="employeeData.assignedUser.appAccess"
            label="Samay App Access"
            color="primary"
            inset
            hide-details
            :true-value="true"
            :false-value="false"
          ></v-switch>
        </v-col> -->
        <!-- Date of Birth -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.DOB"
            label="Date of Birth"
            type="date"
            variant="outlined"
            density="comfortable"
            :error-messages="getFieldErrorMessage('DOB')"
            :max="maxDate"
            :min="minDate"
            @input="handleInputChange('assignedUser.DOB')"
            @blur="markFieldAsTouched('DOB')"
          ></v-text-field>
        </v-col>
        <!-- Marital Status -->
        <v-col cols="12" md="6">
          <v-select
            v-model="employeeData.assignedUser.maritalStatus"
            :items="['Single', 'Unmarried', 'Married']"
            label="Marital Status"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-col>
        <!-- Blood Group -->
        <v-col cols="12" md="6">
          <v-select
            v-model="employeeData.assignedUser.bloodGroup"
            :items="['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']"
            label="Blood Group"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-textarea
            v-model="employeeData.assignedUser.permanent_Address"
            label="Permanent Address"
            rows="3"
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </v-col>
        <v-col cols="12" md="6">
          <v-textarea
            v-model="employeeData.assignedUser.current_Address"
            label="Communications Address"
            rows="3"
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </v-col>
      </v-row>
      <v-row>
        <!-- <v-col cols="12">
          <h3>Emergency Contact Details</h3>
          <br />
        </v-col> -->
        <!-- Emergency Contact Name -->
        <!-- <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.emergency_Contact_Name"
            label="Emergency Contact Name"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col> -->
        <!-- Emergency Contact Mobile Number -->
        <!-- <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.emergency_Contact_Mobile_Number"
            label="Emergency Contact Mobile Number"
            type="tel"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col> -->
        <!-- Emergency Contact Relationship -->
        <!-- <v-col cols="12" md="6">
          <v-text-field
            v-model="employeeData.assignedUser.emergency_Contact_Relationship"
            label="Emergency Contact Relationship"
            variant="outlined"
            density="comfortable"
          ></v-text-field>
        </v-col> -->

        <!-- Emergency Contact Address -->
        <!-- <v-col cols="12" md="6">
          <v-textarea
            v-model="employeeData.assignedUser.emergency_Contact_Address"
            label="Emergency Contact Address"
            rows="3"
            variant="outlined"
            density="comfortable"
          ></v-textarea>
        </v-col> -->
      </v-row>
    </v-container>

    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>
    <!-- Error message notification -->
    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import SensitiveDataInput from "@/components/sensitiveData/sensitiveDataInput.vue";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const orgOptions = ref([]);
const selectedOrganization = ref(null);
const dobMenu = ref(false);
const fileInput = ref(null);
const avatarImage = ref(null);
const loading = ref(true);
const originalEmployeeData = ref(null);
const roleOptions = ref([]);
const selectedRole = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const isPanChecking = ref(false);
const isAadharChecking = ref(false);
const profilesFolderId = ref(null);
const currentAvatarFileId = ref(null);

const phoneErrorMessage = ref("");
const emailErrorMessage = ref("");
const workingRangeError = ref(""); // New ref for working range error

// Add validation rules
const rules = {
  required: (v) => !!v || "This field is required",
  email: (v) => /.+@.+\..+/.test(v) || "Invalid email address",
  phone: (v) => /^\d{10}$/.test(v) || "Phone number must be 10 digits",
  panFormat: (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v) || "Invalid PAN format",
  aadharFormat: (v) => /^\d{12}$/.test(v) || "Invalid Aadhar format",
};
// Add validation state
const validationErrors = ref({});
const touchedFields = ref(new Set());

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};
const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};
const isRoleDisabled = computed(() => {
  const currentUserRole = authService.getUserRole()?.toLowerCase();

  // If current user is not admin, disable the role field
  if (currentUserRole !== "admin") {
    return true;
  }

  return false;
});

const showAadhaarView = ref(false);

const aadhaarData = ref({
  fullName: "",
  dateOfBirth: "",
  gender: "",
  fatherName: "",
  address: "",
  maskedAadhaar: "",
  verificationDate: "",
  status: "",
});

function toggleAadhaarView() {
  showAadhaarView.value = !showAadhaarView.value;
}

async function fetchAadhaarData() {
  try {
    const user = props.employeeData.assignedUser;

    aadhaarData.value = {
      fullName: `${user.first_name} ${user.last_name || ""}`,
      dateOfBirth: user.DOB || "",
      gender: user.gender || "",
      fatherName: "RAMAN KUMAR", // Replace with API value
      address: "123, Main Street, Bangalore, Karnataka - 560001", // Replace with API value
      maskedAadhaar: "XXXX-XXXX-1234", // Replace with API value
      verificationDate: "15 March 2024", // Replace with API value
      status: "Active",
    };
  } catch (error) {
    console.error("Error fetching Aadhaar data:", error);
  }
}

const displayPhone = computed({
  get: () => {
    if (!props.employeeData?.assignedUser?.phone) return "";
    return props.employeeData.assignedUser.phone.replace(/^\+91/, "");
  },
  set: (value) => {
    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        phone: value,
      },
    };
    emit("update:employeeData", updatedData);
    if (value && !/^\d{10}$/.test(value)) {
      phoneErrorMessage.value = "Phone number must be 10 digits";
    } else {
      phoneErrorMessage.value = "";
    }

    // Only validate uniqueness if the field has been touched
    if (touchedFields.value.has("phone")) {
      validateField("phone");
    }
  },
});

const maxDate = computed(() => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;
  return `${maxYear}-12-31`; // Set to the last day of the year 18 years ago
});

// Computed property for minDate (e.g., 100 years ago for reasonable range)
const minDate = computed(() => {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 100}-01-01`; // Set to 100 years ago
});

// Set default DOB to January 1, 2000, if not set
const setDefaultDOB = () => {
  if (!props.employeeData?.assignedUser?.DOB) {
    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        DOB: "2000-01-01",
      },
    };
    emit("update:employeeData", updatedData);
  }
};
const formattedDOB = computed(() => {
  if (!props.employeeData?.assignedUser?.DOB) return "";
  const date = new Date(props.employeeData.assignedUser.DOB);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const hasChanges = computed(() => {
  if (!originalEmployeeData.value || !props.employeeData) return false;

  const dataChanged =
    JSON.stringify(originalEmployeeData.value) !==
    JSON.stringify(props.employeeData);

  // Check all validation errors
  const hasValidationErrors =
    Object.values(validationErrors.value).some(
      (error) => error !== null && error !== "",
    ) ||
    phoneErrorMessage.value ||
    emailErrorMessage.value ||
    workingRangeError.value;

  return dataChanged && !hasValidationErrors;
});

// Handle working range slider change
const handleWorkingRangeChange = (newValue) => {
  const updatedData = {
    ...props.employeeData,
    workingRange: newValue,
  };
  emit("update:employeeData", updatedData);

  // Validate the new value
  if (newValue < 0 || newValue > 500) {
    workingRangeError.value = "Range must be between 0 and 500 meters";
  } else {
    workingRangeError.value = "";
  }
};

// Generate default email function
const generateDefaultEmail = () => {
  const firstName =
    props.employeeData?.assignedUser?.first_name?.toLowerCase() || "";
  const lastName =
    props.employeeData?.assignedUser?.last_name?.toLowerCase() || "";
  const employeeId = props.employeeData?.employeeId || "";

  if (lastName) {
    return `${firstName}${lastName}${employeeId}@samay.com`;
  } else {
    return `${firstName}${employeeId}@samay.com`;
  }
};

// Handle sensitive input changes (PAN, Aadhar)
const handleSensitiveInputChange = (field) => {
  touchedFields.value.add(field);
  validateField(field);

  if (field === "pan") {
    toUpperCase("pan");
  }
};

// Check if PAN already exists
const checkPanExists = async () => {
  const pan = props.employeeData?.assignedUser?.pan;
  if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    return; // Don't check if PAN is invalid
  }

  // Skip check if it's the same as original PAN
  if (originalEmployeeData.value?.assignedUser?.pan === pan) {
    return;
  }

  isPanChecking.value = true;
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][pan][_eq]=${pan}&fields[]=pan`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      validationErrors.value["pan"] = "PAN number already exists";
      touchedFields.value.add("pan");

      const updatedData = {
        ...props.employeeData,
        _validationState: {
          ...props.employeeData._validationState,
          personalDetails: false,
        },
      };

      emit("update:employeeData", updatedData);
    }
  } catch (error) {
    console.error("Error checking PAN:", error);
  } finally {
    isPanChecking.value = false;
  }
};

// Check if Aadhar already exists
const checkAadharExists = async () => {
  const aadhar = props.employeeData?.assignedUser?.aadhar;
  if (!aadhar || !/^\d{12}$/.test(aadhar)) {
    return; // Don't check if Aadhar is invalid
  }

  // Skip check if it's the same as original Aadhar
  if (originalEmployeeData.value?.assignedUser?.aadhar === aadhar) {
    return;
  }

  isAadharChecking.value = true;
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[_and][0][aadhar][_eq]=${aadhar}&fields[]=aadhar`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      validationErrors.value["aadhar"] = "Aadhar number already exists";
      touchedFields.value.add("aadhar");

      const updatedData = {
        ...props.employeeData,
        _validationState: {
          ...props.employeeData._validationState,
          personalDetails: false,
        },
      };

      emit("update:employeeData", updatedData);
    }
  } catch (error) {
    console.error("Error checking Aadhar:", error);
  } finally {
    isAadharChecking.value = false;
  }
};

// Fetch the Profiles folder ID from tenant data
const fetchProfilesFolderId = async () => {
  try {
    const token = authService.getToken();
    const tenantId = props.employeeData?.assignedUser?.tenant;

    if (!tenantId) {
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?limit=25&fields[]=tenantName&fields[]=tenantId&fields[]=foldersId&filter[_and][0][_and][0][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      // Find the Profiles folder
      const profilesFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Profiles",
      );

      if (profilesFolder) {
        profilesFolderId.value = profilesFolder.id;
        return profilesFolder.id;
      } else {
        console.error("Profiles folder not found in tenant data");
        return null;
      }
    } else {
      console.error("No folder structure found for tenant");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profiles folder ID:", error);
    return null;
  }
};

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const fields = [
      "id",
      "employeeId",
      "assignedUser.id",
      "assignedUser.first_name",
      "assignedUser.middleName",
      "assignedUser.last_name",
      "assignedUser.phone",
      "assignedUser.email",
      "assignedUser.avatar.id",
      "assignedUser.avatar.type",
      "assignedUser.avatar.title",
      "assignedUser.gender",
      "assignedUser.DOB",
      "assignedUser.maritalStatus",
      "assignedUser.bloodGroup",
      "assignedUser.permanentAddress",
      "assignedUser.pan",
      "assignedUser.aadhar",
      "assignedUser.skilled",
      "assignedUser.officeEmail",
      "assignedUser.role.id",
      "assignedUser.role.name",
      "assignedUser.appAccess",
      "workingRange",
      "assignedUser.tenant",
      "assignedUser.permanent_Address",
      "assignedUser.current_Address",
      "assignedUser.organization.orgName",
      "assignedUser.emergency_Contact_Name",
      "assignedUser.emergency_Contact_Mobile_Number",
      "assignedUser.emergency_Contact_Relationship",
      "assignedUser.emergency_Contact_Address",
      "assignedUser.guardians_Name",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data) {
      if (!data.data.assignedUser?.id) {
        showErrorMessage(
          "Employee data is incomplete. Please refresh the page.",
        );
        return;
      }

      // Ensure workingRange has a default value of 0 if null/undefined
      if (
        data.data.workingRange === null ||
        data.data.workingRange === undefined
      ) {
        data.data.workingRange = 0;
      }

      originalEmployeeData.value = JSON.parse(JSON.stringify(data.data));
      emit("update:employeeData", data.data);

      if (data.data.assignedUser?.avatar?.id) {
        currentAvatarFileId.value = data.data.assignedUser.avatar.id;
        await fetchAndSetAvatar();
      }

      selectedRole.value = data.data.assignedUser?.role?.id || null;
      await fetchProfilesFolderId();
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
  } finally {
    loading.value = false;
  }
};

async function fetchDepartments() {
  const tenantId = await currentUserTenant.getTenantId();
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    orgOptions.value = data.data;

    // Set initial organization if employee data exists
    if (
      props.employeeData?.assignedUser?.organization?.id &&
      !props.employeeData.assignedUser.organization.orgName
    ) {
      const org = orgOptions.value.find(
        (o) => o.id === props.employeeData.assignedUser.organization.id,
      );
      if (org) {
        employeeData.value.assignedUser.organization = org;
      }
    }
  } catch (error) {
    console.error("Error fetching organizations:", error);
  }
}
const verifiedGovData = ref({});
const fetchVerifiedGovernmentData = async () => {
  const token = authService.getToken();

  try {
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "id",
      "employee.id",
      "aadharDetails",
      "panDetails",
      // "voterIdDetails",
      // "uanDetails",
      // "drivingLicenseDetails",
      // "gstDetails",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[employee][_eq]=${props.id}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/verifiedGovernmentData?${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if data exists and has the expected structure
    if (data.data && data.data.length > 0) {
      const rawData = data.data[0];

      // Transform the data to match your UI structure
      verifiedGovData.value = {
        id: rawData.id,
        employee: rawData.employee,
        // Map aadharDetails if it exists
        aadharDetails: rawData.aadharDetails
          ? {
              full_name: rawData.aadharDetails.full_name || "",
              care_of:
                rawData.aadharDetails.care_of ||
                rawData.aadharDetails.father_name ||
                "",
              dob: rawData.aadharDetails.dob || "",
              yob: rawData.aadharDetails.yob || "",
              zip: rawData.aadharDetails.zip || "",
              profile_image: rawData.aadharDetails.profile_image || "",
              gender: rawData.aadharDetails.gender || "",
              masked_aadhaar: rawData.aadharDetails.masked_aadhaar || "",
              full_address: rawData.aadharDetails.full_address || "",
              father_name:
                rawData.aadharDetails.father_name ||
                rawData.aadharDetails.care_of ||
                "",
              address: rawData.aadharDetails.address
                ? {
                    country: rawData.aadharDetails.address.country || "",
                    dist: rawData.aadharDetails.address.dist || "",
                    state: rawData.aadharDetails.address.state || "",
                    po: rawData.aadharDetails.address.po || "",
                    house: rawData.aadharDetails.address.house || "",
                    loc: rawData.aadharDetails.address.loc || "",
                    vtc: rawData.aadharDetails.address.vtc || "",
                    subdist: rawData.aadharDetails.address.subdist || "",
                    street: rawData.aadharDetails.address.street || "",
                    landmark: rawData.aadharDetails.address.landmark || "",
                  }
                : {},
            }
          : null,
        // Map panDetails if it exists
        panDetails: rawData.panDetails || null,
      };
    }
  } catch (err) {
    console.error("Error fetching verifiedGovernmentData:", err);
    showErrorMessage("Failed to load verified government data");

    // Set empty data structure on error
    verifiedGovData.value = {
      id: null,
      employee: null,
      aadharDetails: null,
      panDetails: null,
      voterIdDetails: null,
      uanDetails: null,
      drivingLicenseDetails: null,
      gstDetails: null,
      full_name: "",
      gender: "",
      dob: "",
      masked_aadhaar: "",
      care_of: "",
      address: {},
    };
  }
};

const fetchRoles = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/roles?filter[_and][0][name][_neq]=Administrator&filter[_and][1][name][_neq]=esslAdmin&&filter[_and][2][name][_neq]=Dealer`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    roleOptions.value = data.data.map((role) => ({
      id: role.id,
      name: role.name || "Unnamed Role",
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    roleOptions.value = [];
  }
};

const fetchAuthorizedImage = async (url) => {
  const token = authService.getToken();
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

// Delete the previous avatar file if it exists
const deleteOldAvatarFile = async (fileId) => {
  if (!fileId) return;

  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      console.error(`Failed to delete old avatar file: ${response.status}`);
    } else {
      console.log("Old avatar file deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting old avatar file:", error);
  }
};

const validatePhone = async () => {
  const phone = displayPhone.value;

  if (!phone) {
    phoneErrorMessage.value = "";
    return true;
  }

  // First check format
  if (!/^\d{10}$/.test(phone)) {
    phoneErrorMessage.value = "Phone number must be 10 digits";
    return false;
  }

  const originalPhone =
    originalEmployeeData.value?.assignedUser?.phone?.replace(/^\+91/, "");
  if (originalPhone === phone) {
    phoneErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[phone][_eq]=%2B91${phone}&filter[id][_neq]=${props.employeeData?.assignedUser?.id}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to validate phone number");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      phoneErrorMessage.value =
        "This phone number already exists. Please use a different number.";
      return false;
    } else {
      phoneErrorMessage.value = "";
      return true;
    }
  } catch (error) {
    console.error("Error checking phone number:", error);
    phoneErrorMessage.value = "Error checking phone number";
    return false;
  }
};

const validateEmail = async () => {
  const email = props.employeeData?.assignedUser?.email;

  if (!email) {
    emailErrorMessage.value = "";
    return true;
  }

  // Apply the email validation rule
  if (!rules.email(email)) {
    emailErrorMessage.value = rules.email.message;
    return false;
  }

  if (originalEmployeeData.value?.assignedUser?.email === email) {
    emailErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[email][_eq]=${email}&filter[id][_neq]=${props.employeeData?.assignedUser?.id}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to validate email");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      emailErrorMessage.value =
        "This email already exists. Please use a different email.";
      return false;
    } else {
      emailErrorMessage.value = "";
      return true;
    }
  } catch (error) {
    console.error("Error checking email:", error);
    emailErrorMessage.value = "Error checking email";
    return false;
  }
};

const clearPhoneError = () => {
  phoneErrorMessage.value = "";
};

const clearEmailError = () => {
  emailErrorMessage.value = "";
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Check if we have the Profiles folder ID
    if (!profilesFolderId.value) {
      await fetchProfilesFolderId();
      if (!profilesFolderId.value) {
        showErrorMessage(
          "Could not find Profiles folder. Using default upload location.",
        );
      }
    }
    const formData = new FormData();

    // If we have a profiles folder ID, use it
    if (profilesFolderId.value) {
      formData.append("folder", profilesFolderId.value);
    }

    // Use employee ID in the filename for better organization
    const fileExtension = file.name.split(".").pop();
    const employeeId = props.employeeData.employeeId || "profile";
    const customFileName = `${employeeId}_profile.${fileExtension}`;

    formData.append("file", file, customFileName);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload image");

    const result = await response.json();
    const newAvatarId = result.data.id;

    // Delete the old avatar file if it exists
    if (currentAvatarFileId.value) {
      await deleteOldAvatarFile(currentAvatarFileId.value);
    }

    // Update the current avatar file ID
    currentAvatarFileId.value = newAvatarId;

    const updatedEmployeeData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        avatar: { id: newAvatarId },
      },
    };

    const newAvatarUrl = `${import.meta.env.VITE_API_URL}/assets/${newAvatarId}`;
    avatarImage.value = await fetchAuthorizedImage(newAvatarUrl);

    emit("update:employeeData", updatedEmployeeData);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    showErrorMessage("Failed to upload profile picture. Please try again.");
  }
};

const handleDateChange = (newDate) => {
  dobMenu.value = false;
  const selectedDate = new Date(newDate);
  const today = new Date();
  const age = today.getFullYear() - selectedDate.getFullYear();

  const hasBirthdayOccurred =
    today.getMonth() > selectedDate.getMonth() ||
    (today.getMonth() === selectedDate.getMonth() &&
      today.getDate() >= selectedDate.getDate());

  const actualAge = hasBirthdayOccurred ? age : age - 1;

  if (actualAge < 20) {
    validationErrors.value["DOB"] = "Employee must be at least 20 years old";
    touchedFields.value.add("DOB");
  } else {
    validationErrors.value["DOB"] = null;
  }

  const updatedData = {
    ...props.employeeData,
    _validationState: {
      ...props.employeeData._validationState,
      personalDetails: Object.keys(validationErrors.value).length === 0,
    },
  };

  emit("update:employeeData", updatedData);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const validateField = (fieldName) => {
  touchedFields.value.add(fieldName);
  let value;

  // Special handling for employeeId
  if (fieldName === "employeeId") {
    value = props.employeeData[fieldName];
  } else {
    value = props.employeeData?.assignedUser?.[fieldName];
  }

  validationErrors.value[fieldName] = null;

  // Check for required fields - only first_name, gender, and employeeId are required
  if (["first_name", "gender", "employeeId"].includes(fieldName) && !value) {
    validationErrors.value[fieldName] = "This field is required";
  }

  // Additional validations for other fields (but not required)
  if (fieldName === "email" && value && !/.+@.+\..+/.test(value)) {
    validationErrors.value[fieldName] = "Invalid email address";
  }

  if (fieldName === "phone") {
    const phoneWithoutPrefix = value ? value.replace(/^\+91/, "") : "";
    if (phoneWithoutPrefix && !/^\d{10}$/.test(phoneWithoutPrefix)) {
      validationErrors.value[fieldName] = "Phone number must be 10 digits";
    }
  }

  if (fieldName === "pan" && value && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
    validationErrors.value[fieldName] = "Invalid PAN format";
  }

  if (fieldName === "aadhar" && value && !/^\d{12}$/.test(value)) {
    validationErrors.value[fieldName] = "Invalid Aadhar format";
  }

  if (fieldName === "DOB" && value) {
    const selectedDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const hasBirthdayOccurred =
      today.getMonth() > selectedDate.getMonth() ||
      (today.getMonth() === selectedDate.getMonth() &&
        today.getDate() >= selectedDate.getDate());
    const actualAge = hasBirthdayOccurred ? age : age - 1;

    if (actualAge < 18) {
      // Changed from 20 to 18
      validationErrors.value[fieldName] =
        "Employee must be at least 18 years old";
    }
  }

  const updatedData = {
    ...props.employeeData,
    _validationState: {
      ...props.employeeData._validationState,
      personalDetails: Object.values(validationErrors.value).every(
        (error) => error === null,
      ),
    },
  };

  emit("update:employeeData", updatedData);
};

const getFieldErrorMessage = (fieldName) => {
  if (fieldName === "employeeId") {
    return touchedFields.value.has(fieldName)
      ? validationErrors.value[fieldName] || ""
      : "";
  }
  return touchedFields.value.has(fieldName)
    ? validationErrors.value[fieldName] || ""
    : "";
};

const markFieldAsTouched = (fieldName) => {
  touchedFields.value.add(fieldName);
  validateField(fieldName);
};

const capitalizeFirstLetterEachWord = (field) => {
  if (props.employeeData?.assignedUser?.[field]) {
    const updatedValue = props.employeeData.assignedUser[field]
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        [field]: updatedValue,
      },
    };

    emit("update:employeeData", updatedData);
    validateField(field);
  }
};

const toLowerCase = (field) => {
  if (props.employeeData?.assignedUser?.[field]) {
    const updatedValue = props.employeeData.assignedUser[field].toLowerCase();

    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        [field]: updatedValue,
      },
    };

    emit("update:employeeData", updatedData);
    validateField(field);
  }
};

const toUpperCase = (field) => {
  if (props.employeeData?.assignedUser?.[field]) {
    const updatedValue = props.employeeData.assignedUser[field].toUpperCase();

    const updatedData = {
      ...props.employeeData,
      assignedUser: {
        ...props.employeeData.assignedUser,
        [field]: updatedValue,
      },
    };

    emit("update:employeeData", updatedData);
    validateField(field);
  }
};

const fetchAndSetAvatar = async () => {
  if (props.employeeData?.assignedUser?.avatar?.id) {
    const imageUrl = await fetchAuthorizedImage(
      `${import.meta.env.VITE_API_URL}/assets/${props.employeeData.assignedUser.avatar.id}`,
    );
    avatarImage.value = imageUrl;
  }
};

const handleRoleChange = (newValue) => {
  if (newValue !== originalEmployeeData.value.assignedUser?.role?.id) {
    props.employeeData.assignedUser.role = { id: newValue };
    validateField("role");
  }
};

const handleInputChange = (field) => {
  if (field === "pan" || field === "aadhar") {
    validationErrors.value[field] = null;
  }
};

const updatePersonalDetails = async () => {
  const token = authService.getToken();
  if (!props.employeeData?.assignedUser?.id) {
    showErrorMessage(
      "Employee data is incomplete. Please refresh the page and try again.",
    );
    return;
  }

  const requiredFields = ["first_name", "gender", "employeeId"];
  requiredFields.forEach((field) => {
    touchedFields.value.add(field);
    validateField(field);
  });

  const isPhoneValid = await validatePhone();
  const isEmailValid = await validateEmail();

  const phone = displayPhone.value;
  if (phone && !/^\d{10}$/.test(phone)) {
    phoneErrorMessage.value = "Phone number must be 10 digits";
    showErrorMessage("Please fix phone number format before updating");
    return;
  }
  const mandatoryFields = ["first_name", "gender", "employeeId"];
  const missingFields = mandatoryFields.filter((field) =>
    field === "employeeId"
      ? !props.employeeData[field]
      : !props.employeeData.assignedUser[field],
  );

  if (missingFields.length > 0) {
    showErrorMessage("Please fill in all required fields");
    return;
  }

  if (
    Object.values(validationErrors.value).some(
      (error) => error !== null && error !== "",
    ) ||
    phoneErrorMessage.value ||
    emailErrorMessage.value
  ) {
    if (validationErrors.value["pan"] === "PAN number already exists") {
      showErrorMessage(
        "PAN number already exists in the system. Please use a different PAN number.",
      );
      return;
    }

    if (validationErrors.value["aadhar"] === "Aadhar number already exists") {
      showErrorMessage(
        "Aadhar number already exists in the system. Please use a different Aadhar number.",
      );
      return;
    }

    showErrorMessage("Please fix all validation errors before updating");
    return;
  }

  if (isPanChecking.value || isAadharChecking.value) {
    showErrorMessage(
      "Please wait while we validate your PAN and Aadhar numbers",
    );
    return;
  }

  try {
    const personalModuleFieldsToUpdate = {};
    const assignedUserFieldsToUpdate = {};

    // Handle workingRange
    const currentWorkingRange = props.employeeData.workingRange;
    const originalWorkingRange = originalEmployeeData.value.workingRange;

    // Normalize empty string to null for comparison and payload
    const normalizedCurrentWorkingRange =
      currentWorkingRange === "" ? null : currentWorkingRange;
    const normalizedOriginalWorkingRange =
      originalWorkingRange === "" ? null : originalWorkingRange;

    if (normalizedCurrentWorkingRange !== normalizedOriginalWorkingRange) {
      personalModuleFieldsToUpdate.workingRange = normalizedCurrentWorkingRange;
    }

    // Handle employeeId
    if (
      props.employeeData.employeeId !== originalEmployeeData.value.employeeId
    ) {
      personalModuleFieldsToUpdate.employeeId = props.employeeData.employeeId;
    }
    for (const [key, value] of Object.entries(
      props.employeeData.assignedUser,
    )) {
      const originalValue = originalEmployeeData.value.assignedUser[key];
      const hasChanged = value !== originalValue;

      if (key === "appAccess") {
        if (value !== originalEmployeeData.value.assignedUser[key]) {
          assignedUserFieldsToUpdate[key] = value;
        }
      } else if (hasChanged) {
        if (key === "avatar" && value?.id) {
          assignedUserFieldsToUpdate[key] = value.id;
        } else if (key === "phone") {
          assignedUserFieldsToUpdate[key] = value
            ? value.startsWith("+91")
              ? value
              : `+91${value}`
            : null;
        } else if (key === "role") {
          const roleId =
            value?.id ||
            selectedRole.value ||
            "f667b169-c66c-4ec1-bef9-1831c1647c0d";
          assignedUserFieldsToUpdate[key] = roleId;
        } else if (key === "email") {
          // Handle email - generate default if empty
          const emailValue = value || generateDefaultEmail();
          assignedUserFieldsToUpdate[key] = emailValue;
        } else {
          assignedUserFieldsToUpdate[key] = value === "" ? null : value;
        }
      }
    }

    // Handle role if not already processed and is empty/null
    if (
      !assignedUserFieldsToUpdate.role &&
      (!props.employeeData.assignedUser.role?.id || !selectedRole.value)
    ) {
      assignedUserFieldsToUpdate.role = "f667b169-c66c-4ec1-bef9-1831c1647c0d";
    }

    // Handle email if not already processed and is empty
    if (
      !assignedUserFieldsToUpdate.email &&
      !props.employeeData.assignedUser.email
    ) {
      assignedUserFieldsToUpdate.email = generateDefaultEmail();
    }

    // Construct the final payload
    const payload = {};
    if (Object.keys(assignedUserFieldsToUpdate).length > 0) {
      payload.assignedUser = {
        id: props.employeeData.assignedUser.id,
        ...assignedUserFieldsToUpdate,
      };
    }
    Object.assign(payload, personalModuleFieldsToUpdate); // Add top-level fields

    if (Object.keys(payload).length === 0) {
      showErrorMessage(
        "No changes to update in personal details, please make any changes to update",
      );
      return;
    }

    console.log("Update payload:", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.errors) {
        const errorMessages = errorData.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(errorMessages);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Update successful", result);
    originalEmployeeData.value = JSON.parse(JSON.stringify(props.employeeData));
    showSuccessMessage("Personal details updated successfully!");
  } catch (error) {
    console.error("Error updating personal details:", error);
    if (error.message.includes("assignedUser.id")) {
      showErrorMessage(
        "Error: User ID is missing. Please refresh the page and try again.",
      );
    } else if (
      error.message.includes("duplicate") ||
      error.message.includes("already exists")
    ) {
      showErrorMessage(error.message);
    } else {
      showErrorMessage("Failed to update personal details. Please try again.");
    }
  }
};

watch(
  () => props.employeeData?.assignedUser,
  (newValue) => {
    if (newValue && !newValue.id && props.employeeData) {
    }
  },
  { deep: true, immediate: false },
);

// Watch for changes in workingRange to validate its value
watch(
  () => props.employeeData.workingRange,
  (newValue) => {
    if (newValue === null || newValue === undefined || newValue === "") {
      workingRangeError.value = ""; // Clear error if empty
    } else if (typeof newValue === "number") {
      if (newValue < 0 || newValue > 500) {
        workingRangeError.value = "Range must be between 0 and 500 meters";
      } else {
        workingRangeError.value = "";
      }
    } else {
      // If it's not a number (e.g., string that couldn't be parsed), treat as invalid
      workingRangeError.value = "Invalid number format";
    }
  },
  { immediate: true }, // Run immediately to validate initial value
);

onMounted(() => {
  fetchEmployeeData();
  fetchRoles();
  fetchAadhaarData();
  fetchDepartments();
  setDefaultDOB();
});

watch(
  () => props.employeeData?.assignedUser?.avatar?.id,
  (newAvatarId, oldAvatarId) => {
    if (newAvatarId && newAvatarId !== oldAvatarId) {
      fetchAndSetAvatar();
    }
  },
);
</script>

<style scoped>
/* Custom styling for Aadhaar information display */
.aadhaar-info-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.aadhaar-info-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.personal-details {
  height: calc(90vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
}
.avatar-container {
  position: relative;
  display: inline-block;
}
.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  background-color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
:deep(.v-input--error) {
  color: rgb(var(--v-theme-error)) !important;
}
:deep(.v-input--error .v-field) {
  border-color: rgb(var(--v-theme-error)) !important;
}
:deep(.error--text) {
  color: rgb(var(--v-theme-error)) !important;
}
</style>
