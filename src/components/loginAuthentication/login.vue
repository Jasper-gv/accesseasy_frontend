<!-- login page.vue -->
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="h-100">
      <!-- Full Background Image -->
      <v-col cols="12" class="d-flex align-center justify-end pa-0">
        <div
          class="background-container d-flex align-center justify-end h-100"
          :style="backgroundStyle"
        >
          <!-- Right Panel - Login Form (Above Image) -->
          <div class="login-container">
            <!-- Redesigned login card with new layout matching the design image -->
            <v-card
              class="login-card"
              style="
                border: 2px solid #059669;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
              "
            >
              <!-- Logo and Tagline inside card header -->
              <div class="card-header">
                <div class="logo-section">
                  <img
                    src="/public/images/accesseasylogo1.jpeg"
                    alt="AccessEasy"
                    class="logo-image"
                  />
                </div>
              </div>

              <!-- Sub Header with light green background -->
              <div class="card-subheader">
                <h2 class="subheader-title">Login to dashboard</h2>
              </div>

              <!-- Card content with improved spacing -->
              <div class="card-content">
                <!-- Tab buttons with new styling -->
                <div class="tab-buttons-container">
                  <button
                    @click="setMode('phone')"
                    :class="['tab-btn', { active: mode === 'phone' }]"
                  >
                    PHONE
                  </button>
                  <button
                    @click="setMode('email')"
                    :class="['tab-btn', { active: mode === 'email' }]"
                  >
                    E-MAIL
                  </button>
                </div>

                <!-- Phone Tab -->
                <div v-if="mode === 'phone'" class="form-section">
                  <label class="form-label">Mobile Number</label>

                  <div class="phone-row">
                    <div class="country-code-text">+91</div>
                    <v-text-field
                      v-model.trim="phoneRaw"
                      placeholder="Enter your Phone Number"
                      variant="outlined"
                      density="comfortable"
                      type="tel"
                      @input="sanitizePhone"
                      @keyup.enter="handleSubmit"
                      :error="!!phoneError"
                      :error-messages="phoneError ? [phoneError] : []"
                      class="phone-input"
                    ></v-text-field>
                  </div>
                  <div class="help-text">
                    We'll initiate a secure session and take you to OTP
                    verification.
                  </div>
                </div>

                <!-- Email Tab -->
                <div v-if="mode === 'email'" class="form-section">
                  <label class="form-label">E-mail</label>
                  <v-text-field
                    v-model.trim="email"
                    placeholder="your@example.com"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                    @keyup.enter="handleSubmit"
                    :error="!!emailError"
                    :error-messages="emailError ? [emailError] : []"
                  ></v-text-field>
                  <div class="help-text">
                    We'll initiate a secure session and take you to OTP
                    verification.
                  </div>
                </div>

                <!-- Submit button with new styling -->
                <v-btn
                  @click="handleSubmit"
                  :disabled="loading || emailLoading"
                  :loading="loading || emailLoading"
                  block
                  size="large"
                  class="submit-btn"
                >
                  {{ loading || emailLoading ? "Loading..." : "Get OTP" }}
                </v-btn>

                <!-- Signup link with improved styling -->
                <p class="signup-text">
                  Don't have an account?
                  <router-link to="/register" class="signup-link"
                    >Signup Now</router-link
                  >
                </p>
              </div>
            </v-card>

            <p class="footer-text">© 2025 Fieldseasy</p>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";

const router = useRouter();
const mode = ref("phone");
const phoneRaw = ref("");
const phoneError = ref("");
const loading = ref(false);
const email = ref("");
const emailError = ref("");
const emailLoading = ref(false);

// Background image style
const backgroundStyle = computed(() => ({
  backgroundImage: `url('/public/images/loginimage.png')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
}));

function setMode(next) {
  mode.value = next;
  phoneError.value = "";
  emailError.value = "";
}

function sanitizePhone() {
  phoneRaw.value = (phoneRaw.value || "").replace(/\D/g, "").slice(0, 10);
  if (phoneError.value) phoneError.value = "";
}

function validPhone(num) {
  return /^\d{10}$/.test(num);
}

function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

async function onPhoneSubmit() {
  phoneError.value = "";
  const digits = (phoneRaw.value || "").replace(/\D/g, "");

  if (!validPhone(digits)) {
    phoneError.value = "Please enter a valid 10-digit mobile number.";
    return;
  }

  loading.value = true;

  try {
    localStorage.removeItem("pinVerifiedInSession");
    localStorage.removeItem("fromOtp");

    // ✅ SIMPLIFIED: Hardcoded +91 since it's now plain text
    const fullPhoneNumber = "+91" + digits;

    // Check if phone exists
    const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
    if (!phoneExists) {
      phoneError.value =
        "This phone number is not registered. Please sign up first.";
      return;
    }

    // Check if user is resigned
    const isResigned = await authService.checkUserResigned(fullPhoneNumber);
    if (isResigned) {
      phoneError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    const user = await authService.getUserByPhone(fullPhoneNumber);
    const hasPin = user && user.userPin;

    const token = authService.getToken();
    const isTokenValid = token && authService.isAuthenticated();

    localStorage.setItem("userPhone", digits);

    if (!hasPin || (hasPin && !isTokenValid)) {
      await proceedToOtpVerification(fullPhoneNumber);
    } else if (hasPin && isTokenValid) {
      router.push({
        name: "PinVerification",
        params: { phoneNumber: digits },
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    let errorMessage =
      "An error occurred. Please try again or check the internet connection";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    phoneError.value = errorMessage;
  } finally {
    loading.value = false;
  }
}

async function proceedToOtpVerification(fullPhoneNumber) {
  try {
    let response = await authService.generateOtp(fullPhoneNumber);

    if (typeof response === "string") {
      try {
        response = JSON.parse(response);
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }
    }

    if (response && response.otp_session_uuid) {
      localStorage.setItem("sessionUuid", response.otp_session_uuid);
      localStorage.setItem("fromOtp", "true");
      localStorage.setItem("fullPhoneNumber", fullPhoneNumber);

      router.push({
        name: "Verification",
        params: { phoneNumber: fullPhoneNumber.slice(3) },
      });
    } else {
      let backendMessage = "Failed to generate OTP. Please try again.";

      if (response?.message) {
        backendMessage = response.message;
      } else if (response?.msg91Response?.message) {
        backendMessage = `${response.message || "OTP Error:"} ${response.msg91Response.message}`;
      }

      phoneError.value = backendMessage;
    }
  } catch (error) {
    console.error("Error generating OTP:", error);

    let errorMessage = "Failed to generate OTP. Please try again.";

    if (error.message === "RESIGNED_USER") {
      errorMessage =
        "Resigned Employee has No access. Please contact your Company Admin .";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data) {
      const data = error.response.data;
      if (data.message) {
        errorMessage = data.message;
      } else if (data.msg91Response?.message) {
        errorMessage = `${data.message || "OTP Error:"} ${data.msg91Response.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    phoneError.value = errorMessage;
  }
}

async function onEmailSubmit() {
  emailError.value = "";

  if (!validEmail(email.value)) {
    emailError.value = "Enter a valid email address.";
    return;
  }

  emailLoading.value = true;

  try {
    // Check if email exists
    const emailExists = await authService.checkEmailExists(email.value);
    if (!emailExists) {
      emailError.value = "This email is not registered. Please sign up first.";
      return;
    }

    // Check if user is resigned
    const isResigned = await authService.checkUserResignedByEmail(email.value);
    if (isResigned) {
      emailError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    // Generate OTP
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/emailLogin/generate-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value, userApp: "fieldeasy" }),
      },
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.otp_session_uuid) {
      throw new Error(
        data?.message || "Could not start email session. Try again.",
      );
    }

    localStorage.setItem("email", email.value);
    localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
    router.push({ name: "EmailVerification", params: { email: email.value } });
  } catch (err) {
    emailError.value =
      err?.message || "Something went wrong. Please try again.";
  } finally {
    emailLoading.value = false;
  }
}

function handleSubmit() {
  if (mode.value === "phone") {
    onPhoneSubmit();
  } else {
    onEmailSubmit();
  }
}
</script>

<style scoped>
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

/* Logo section styling - now inside card */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
}

.logo-image {
  max-width: 250px;
  width: 100%;
  height: auto;
  object-fit: contain;
}

/* Card header styling - contains logo */
.card-header {
  text-align: center;
}

/* Sub header styling */
.card-subheader {
  background: #abffb54d;
  padding: 14px 24px;
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

/* Card content styling */
.card-content {
  padding: 20px 24px;
  background: white;
  margin-bottom: 250px;
}

/* Tab buttons styling */
.tab-buttons-container {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.tab-btn:hover {
  border-color: #059669;
  color: #059669;
}

.tab-btn.active {
  background: #059669;
  color: white;
  border-color: #059669;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

/* Form section styling */
.form-section {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.phone-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

/* ✅ NEW: Plain text country code styling */
.country-code-text {
  flex: 0 0 auto;
  width: 100px;
  min-width: 100px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  height: 50px;
}

.phone-input {
  flex: 1;
  min-width: 0;
}

.help-text {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* Submit button styling */
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

/* Signup text styling */
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

/* ✅ MOBILE - PLAIN WHITE BACKGROUND + CENTERED LOGIN */
@media (max-width: 960px) {
  .background-container {
    background: #ffffff !important; /* ✅ PLAIN WHITE */
    background-image: none !important; /* ✅ NO IMAGE */
  }

  .login-container {
    padding: 12px !important;
    margin: 0 auto !important; /* ✅ CENTERED */
    max-width: 480px;
    width: 90% !important;
  }

  .logo-text {
    font-size: 24px;
  }

  .card-content {
    padding: 16px 20px;
    margin-bottom: 50px;
  }

  .tab-btn {
    font-size: 11px;
    padding: 8px 12px;
  }
}

@media (max-width: 768px) {
  .background-container {
    background: #ffffff !important; /* ✅ PLAIN WHITE */
    background-image: none !important; /* ✅ NO IMAGE */
  }

  .login-container {
    padding: 8px !important;
    margin: 0 auto !important; /* ✅ CENTERED */
    max-width: 100%;
    width: calc(100% - 16px) !important;
  }

  .card-content {
    padding: 16px 20px;
    margin-bottom: 40px;
  }

  .phone-row {
    flex-wrap: wrap;
  }

  .country-code-text {
    width: 90px;
    min-width: 90px;
  }
}

@media (max-width: 480px) {
  .background-container {
    background: #ffffff !important; /* ✅ PLAIN WHITE */
    background-image: none !important; /* ✅ NO IMAGE */
  }

  .login-container {
    padding: 8px !important;
    margin: 0 auto !important; /* ✅ CENTERED */
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

  .tab-btn {
    font-size: 10px;
    padding: 6px 10px;
  }

  .phone-row {
    gap: 8px;
  }

  .country-code-text {
    width: 80px;
    min-width: 80px;
    font-size: 15px;
    padding: 0 10px;
  }

  .help-text {
    font-size: 11px;
  }

  .signup-text {
    font-size: 11px;
  }

  .footer-text {
    font-size: 10px;
  }
}
</style>
