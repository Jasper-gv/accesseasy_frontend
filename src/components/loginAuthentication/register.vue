<!-- register.vue -->
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="h-100">
      <!-- Full Background Image - EXACT SAME AS LOGIN PAGE -->
      <v-col cols="12" class="d-flex align-center justify-end pa-0">
        <div
          class="background-container d-flex align-center justify-end h-100"
          :style="backgroundStyle"
        >
          <!-- Right Panel - EXACT SAME LOGIN DESIGN -->
          <div class="login-container">
            <!-- Redesigned register card with EXACT SAME layout as loginpage.vue -->
            <v-card
              class="login-card"
              style="
                border: 2px solid #059669;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
              "
            >
              <!-- Logo and Tagline inside card header - EXACT SAME -->
              <div class="card-header">
                <div class="logo-section">
                  <img
                    src="/public/images/project.png"
                    alt="FieldsEasy"
                    class="logo-image"
                  />
                </div>
              </div>

              <!-- Sub Header with light green background - EXACT SAME -->
              <div class="card-subheader">
                <h2 class="subheader-title">Create Account</h2>
              </div>

              <!-- Card content with improved spacing - EXACT SAME -->
              <div class="card-content">
                <!-- Form - 2x2 GRID + NORMAL COMPANY FIELDS -->
                <v-form ref="form" class="mt-4">
                  <!-- ✅ 2x2 GRID - Personal Details -->
                  <div class="grid-section mb-4">
                    <!-- Row 1: Name + Phone -->
                    <div class="grid-row">
                      <!-- Full Name -->
                      <div class="field-group">
                        <label class="form-label">
                          Full Name <span class="required-asterisk">*</span>
                        </label>
                        <v-text-field
                          v-model="fullName"
                          placeholder="Enter full name"
                          variant="outlined"
                          density="comfortable"
                          :rules="requiredRule"
                          prepend-inner-icon="mdi-account"
                          hide-details
                        ></v-text-field>
                      </div>

                      <!-- Phone Number -->
                      <div class="field-group">
                        <label class="form-label">
                          Phone Number <span class="required-asterisk">*</span>
                        </label>
                        <v-text-field
                          v-model="mobileNumber"
                          placeholder="Enter phone Number"
                          variant="outlined"
                          density="comfortable"
                          :rules="phoneRules"
                          type="tel"
                          prepend-inner-icon="mdi-phone"
                          hide-details
                        ></v-text-field>
                      </div>
                    </div>

                    <!-- Row 2: Email + Employee ID -->
                    <div class="grid-row">
                      <!-- Email -->
                      <div class="field-group">
                        <label class="form-label">
                          Email <span class="required-asterisk">*</span>
                        </label>
                        <v-text-field
                          v-model="email"
                          placeholder="Enter email address"
                          variant="outlined"
                          density="comfortable"
                          :rules="emailRules"
                          type="email"
                          prepend-inner-icon="mdi-email"
                          @input="email = email.toLowerCase()"
                          hide-details
                        ></v-text-field>
                      </div>

                      <!-- Employee ID -->
                      <div class="field-group">
                        <label class="form-label">
                          Employee ID <span class="required-asterisk">*</span>
                        </label>
                        <v-text-field
                          v-model="employeeId"
                          placeholder="Enter employee ID"
                          variant="outlined"
                          density="comfortable"
                          :rules="requiredRule"
                          prepend-inner-icon="mdi-card-account-details"
                          hide-details
                        ></v-text-field>
                      </div>
                    </div>
                  </div>

                  <!-- ✅ COMPANY DETAILS - EXACT SAME AS BEFORE -->
                  <div class="mb-4">
                    <label class="form-label">
                      Company Name <span class="required-asterisk">*</span>
                    </label>
                    <v-text-field
                      v-model="companyName"
                      placeholder="Enter company name"
                      variant="outlined"
                      density="comfortable"
                      :rules="requiredRule"
                      prepend-inner-icon="mdi-office-building"
                    ></v-text-field>
                  </div>

                  <div class="mb-4">
                    <label class="form-label">
                      Company Address <span class="required-asterisk">*</span>
                    </label>
                    <v-textarea
                      v-model="companyAddress"
                      placeholder="Enter company address"
                      variant="outlined"
                      density="comfortable"
                      :rules="requiredRule"
                      prepend-inner-icon="mdi-map-marker"
                      rows="2"
                      class="address-textarea"
                    ></v-textarea>
                  </div>

                  <!-- Submit button - DISABLED until form is valid -->
                  <v-btn
                    block
                    size="large"
                    :loading="isLoading"
                    :disabled="!isFormValid || isLoading"
                    class="submit-btn"
                    @click="handleRegistration"
                  >
                    Create Account
                  </v-btn>

                  <!-- Login link with EXACT SAME styling -->
                  <p class="signup-text">
                    Already have an account?
                    <router-link to="/login" class="signup-link"
                      >Sign-in</router-link
                    >
                  </p>
                </v-form>
              </div>
            </v-card>

            <!-- Footer - EXACT SAME -->
            <p class="footer-text">© {{ year }} Fieldseasy</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ✅ TOAST NOTIFICATIONS - DIRECT FROM ToastNotification.vue -->
    <div class="toast-container">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <ToastNotification
          v-for="toast in toasts"
          :key="toast.id"
          :show="true"
          :message="toast.message"
          :type="toast.type"
          @close="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";
import {
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
  XIcon,
} from "lucide-vue-next";

const router = useRouter();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

// ALL ORIGINAL REFS - CLEAN
const isLoading = ref(false);
const companyName = ref("");
const companyAddress = ref("");
const fullName = ref("");
const email = ref("");
const mobileNumber = ref("");
const employeeId = ref("");
const emailError = ref("");
const phoneError = ref("");
const form = ref(null);
const year = ref(new Date().getFullYear());

// ✅ VALIDATION STATE - Track if fields are valid
const isEmailValid = ref(false);
const isPhoneValid = ref(false);

// ✅ TOAST SYSTEM - SINGLE TOAST (replace old ones)
const toasts = ref([]);
let emailToastId = null;
let phoneToastId = null;

const addToast = (message, type = "info", duration = 5000) => {
  const id = Date.now() + Math.random();
  const toast = { id, message, type };
  toasts.value.push(toast);

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

// ✅ TOAST SHORTCUTS
const showSuccess = (message, duration = 3000) =>
  addToast(message, "success", duration);
const showError = (message, duration = 5000) =>
  addToast(message, "error", duration);

// ✅ SHOW EMAIL ERROR ONLY ONCE
const showEmailError = (message, duration = 6000) => {
  if (emailToastId) removeToast(emailToastId);
  emailToastId = addToast(message, "error", duration);
};

// ✅ SHOW PHONE ERROR ONLY ONCE
const showPhoneError = (message, duration = 8000) => {
  if (phoneToastId) removeToast(phoneToastId);
  phoneToastId = addToast(message, "error", duration);
};

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

// ✅ COMPUTED PROPERTY - Check if form is valid
const isFormValid = computed(() => {
  return (
    companyName.value.trim() !== "" &&
    companyAddress.value.trim() !== "" &&
    fullName.value.trim() !== "" &&
    email.value.trim() !== "" &&
    mobileNumber.value.trim() !== "" &&
    employeeId.value.trim() !== "" &&
    isEmailValid.value &&
    isPhoneValid.value
  );
});

// Background image style - EXACT SAME AS LOGIN PAGE
const backgroundStyle = computed(() => ({
  backgroundImage: `url('/public/images/loginimage.png')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
}));

// ALL ORIGINAL FUNCTIONS - NOW WITH SINGLE TOASTS
async function validateForm() {
  if (!form.value) return false;
  const { valid, errors } = await form.value.validate();
  if (!valid) {
    const errorMsg = `Please correct the following errors: ${errors
      .map((err) => `${err.id}: ${err.errorMessages[0]}`)
      .join(", ")}`;
    showError(errorMsg, 7000);
    return false;
  }
  return true;
}

async function validateEmail(value) {
  if (!value) return true;
  try {
    const response = await api.get(`/users`, {
      params: {
        "filter[email][_eq]": value.toLowerCase(),
        "fields[]": "email",
      },
    });
    if (response.data.data.length > 0) {
      emailError.value =
        "This email is already registered. Please use a different email.";
      showEmailError(emailError.value);
      isEmailValid.value = false;
      return false;
    }
    emailError.value = "";
    isEmailValid.value = true;
    return true;
  } catch (error) {
    emailError.value =
      "An error occurred while validating the email. Please try again.";
    showEmailError(emailError.value);
    isEmailValid.value = false;
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
        user.userApp?.toLowerCase().includes("fieldeasy")
      )
    ) {
      phoneError.value =
        "This phone number is already registered for Fieldseasy. Please log in or use a different number.";
      showPhoneError(phoneError.value);
      isPhoneValid.value = false;
      return false;
    }
    phoneError.value = "";
    isPhoneValid.value = true;
    return true;
  } catch (error) {
    phoneError.value =
      "An error occurred while validating the phone number. Please try again.";
    showPhoneError(phoneError.value);
    isPhoneValid.value = false;
    return false;
  }
}

async function handleRegistration() {
  if (!(await validateForm())) return;

  isLoading.value = true;

  try {
    // Validate inputs
    if (!email.value.includes("@") || !email.value.includes(".")) {
      showError("Please enter a valid email address");
      isLoading.value = false;
      return;
    }
    if (!companyName.value) {
      showError("Company name is required");
      isLoading.value = false;
      return;
    }
    if (!employeeId.value) {
      showError("Please enter your employee ID");
      isLoading.value = false;
      return;
    }

    // Create tenant
    const tenantPayload = {
      tenantName: companyName.value,
      panOrGst: null,
      companyAddress: JSON.stringify(companyAddress.value || ""),
    };
    const tenantResponse = await api.post("/items/tenant", tenantPayload);
    if (tenantResponse.status !== 200 && tenantResponse.status !== 201) {
      throw new Error("Failed to create tenant");
    }
    const tenantId = tenantResponse.data.data.tenantId;

    // Create personal module
    const adminRoleId = "ea2303aa-1662-43ca-a7f7-ab84924a7e0a";
    const personalModulePayload = {
      status: "active",
      accessOn: true,
      employeeId: employeeId.value,
      cycleType: 1,
      uniqueId: `${tenantId}-${employeeId.value}`,
      assignedUser: {
        first_name: fullName.value,
        email: email.value,
        phone: mobileNumber.value ? `+91${mobileNumber.value}` : null,
        role: adminRoleId,
        tenant: tenantId,
        appAccess: true,
        userApp: "fieldeasy",
      },
    };
    const personalModuleResponse = await api.post(
      "/items/personalModule",
      personalModulePayload
    );
    if (
      personalModuleResponse.status !== 200 &&
      personalModuleResponse.status !== 201
    ) {
      throw new Error("Failed to create personal module");
    }

    // ✅ SUCCESS TOAST - SINGLE
    showSuccess("Registration successful! Redirecting to login...", 3000);
    setTimeout(() => router.push("/login"), 2000);
  } catch (e) {
    const errorMsg = e.response
      ? e.response.status === 429
        ? "Too many requests. Please try again later."
        : e.response.status >= 500
          ? "Server error. Please check registration_errors collection or contact support."
          : e.response.data.message || e.message
      : "An error occurred during registration. Please check registration_errors collection.";
    showError(errorMsg, 7000);
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* EXACT SAME STYLES AS LOGIN PAGE - 100% COPIED */
.h-100 {
  height: 100%;
}

.background-container {
  position: relative;
  width: 100%;
}

/* DESKTOP - Background Image */
@media (min-width: 961px) {
  .background-container {
    background-image: url("/public/images/loginimage.png") !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    min-height: 100vh !important;
  }
}

.login-container {
  max-width: 520px;
  width: 100%;
  z-index: 10;
  margin-right: 170px;
  position: relative;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-image {
  height: 100px;
  width: auto;
  object-fit: contain;
}

.card-header {
  text-align: center;
  padding: 24px 0;
}

.card-subheader {
  background: #abffb54d;
  padding: 17px 24px;
  text-align: center;
  border-bottom: 1px solid #5fb96e;
  border-top: 1px solid #5fb96e;
}

.subheader-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  letter-spacing: 0.3px;
}

.card-content {
  padding: 24px 20px;
  background: white;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

/* ✅ RED ASTERISK STYLE */
.required-asterisk {
  color: #dc2626 !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  margin-left: 4px !important;
}

/* ✅ 2x2 GRID STYLES */
.grid-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
}

:deep(.v-text-field),
:deep(.v-textarea) {
  margin-bottom: 0 !important;
}

/* ✅ ADDRESS TEXTAREA - FIX (KEEPS ORIGINAL) */
:deep(.address-textarea .v-field) {
  height: auto !important;
}

:deep(.address-textarea textarea) {
  overflow: hidden !important;
  resize: none !important;
  padding: 8px 12px !important;
}

.submit-btn {
  background: #059669 !important;
  color: white !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 12px 16px !important;
  margin-top: 16px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3) !important;
  transition: all 0.3s ease !important;
}

.submit-btn:hover:not(:disabled) {
  background: #0a7a73 !important;
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.4) !important;
}

.submit-btn:disabled {
  background: #ccc !important;
  color: #999 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

.signup-text {
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-top: 16px;
  margin-bottom: 0;
}

.signup-link {
  color: #059669;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signup-link:hover {
  color: #0a7a73;
  text-decoration: underline;
}

.footer-text {
  text-align: center;
  font-size: 11px;
  color: #999;
  margin-top: 12px;
  margin-bottom: 0;
}

.login-card {
  transition: all 0.3s ease;
}

/* ✅ TOAST STYLES - FROM ToastNotification.vue */
.toast-container {
  position: fixed;
  top: 4rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toast-list > * {
  pointer-events: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* ✅ MOBILE - PLAIN WHITE BACKGROUND + CENTERED LOGIN */
@media (max-width: 960px) {
  .background-container {
    background: #ffffff !important;
    background-image: none !important;
  }

  .login-container {
    padding: 12px !important;
    margin: 0 auto !important;
    max-width: 480px;
    width: 90% !important;
  }

  .card-content {
    padding: 16px 20px;
    margin-bottom: 50px;
  }

  /* ✅ MOBILE GRID - STACK VERTICALLY */
  .grid-row {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .toast-container {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 8px !important;
    margin: 0 auto !important;
    max-width: 100%;
    width: calc(100% - 16px) !important;
  }

  .card-content {
    padding: 16px 20px;
    margin-bottom: 40px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 8px !important;
    margin: 0 auto !important;
    max-width: 100%;
    width: calc(100% - 16px) !important;
  }

  .card-content {
    padding: 14px 16px;
    margin-bottom: 30px;
  }

  .subheader-title {
    font-size: 14px;
  }

  .form-label {
    font-size: 12px;
  }

  .required-asterisk {
    font-size: 13px !important;
  }

  :deep(.v-field) {
    height: 38px;
  }

  .signup-text {
    font-size: 11px;
  }

  .footer-text {
    font-size: 10px;
  }

  /* ✅ MOBILE GRID - TIGHTER SPACING */
  .grid-section {
    gap: 12px !important;
  }

  .grid-row {
    gap: 10px !important;
  }
}
</style>
