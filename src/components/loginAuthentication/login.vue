<template>
  <v-app class="bg-app">
    <v-container class="py-12">
      <!-- Header -->
      <v-row class="mb-8" align="center" justify="center">
        <v-col cols="12" sm="10" md="8" lg="6" class="d-flex justify-center">
          <v-avatar size="56" class="mr-4" :style="logoStyle">
            <span class="font-weight-black text-h5">F</span>
          </v-avatar>
          <div>
            <div class="text-h4 font-weight-black brand-text">Fieldseasy</div>
            <div class="text-body-2 brand-sub">Field operations made easy</div>
          </div>
        </v-col>
      </v-row>

      <!-- Content -->
      <v-row justify="center">
        <!-- Auth Card -->
        <v-col cols="12" sm="10" md="8" lg="6">
          <v-card
            :style="cardStyle"
            rounded="lg"
            class="mx-auto"
            style="max-width: 600px"
          >
            <v-card-text class="pa-8">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-h5 font-weight-black heading-text">
                  Welcome to Fieldseasy
                </div>
              </div>
              <div class="text-body-2 help-text">
                Continue with your mobile number or email.
              </div>

              <!-- Toggle -->
              <div class="d-flex ga-3 mt-6">
                <v-btn
                  :style="[pillStyle, mode === 'phone' ? pillActiveStyle : {}]"
                  @click="setMode('phone')"
                  size="large"
                >
                  Phone
                </v-btn>
                <v-btn
                  :style="[pillStyle, mode === 'email' ? pillActiveStyle : {}]"
                  @click="setMode('email')"
                  size="large"
                >
                  Email
                </v-btn>
              </div>

              <!-- Phone mode -->
              <div v-if="mode === 'phone'" class="mt-6">
                <div class="text-body-1 label-text mb-2">Mobile number</div>
                <div class="d-flex ga-3">
                  <v-select
                    v-model="countryCode"
                    :items="countryItems"
                    density="default"
                    hide-details
                    variant="outlined"
                    :style="[inputStyle, { maxWidth: '100px', height: '10px' }]"
                  />
                  <v-text-field
                    v-model.trim="phoneRaw"
                    density="default"
                    variant="outlined"
                    placeholder="Enter your Phone Number"
                    type="tel"
                    :style="phoneInputStyle"
                    :error-messages="phoneError"
                    @input="sanitizePhone"
                    @keyup.enter="handleSubmit"
                  />
                </div>
                <div class="text-body-2 help-text mt-2">
                  Digits only. You’ll receive an OTP on the next screen.
                </div>

                <v-btn
                  class="mt-6"
                  block
                  color="primary"
                  :style="primaryBtnStyle"
                  :loading="loading"
                  @click="handleSubmit"
                >
                  Get Code
                </v-btn>

                <!-- Sign-up Link -->
                <div class="text-center mt-4">
                  <v-btn
                    variant="text"
                    :style="{ color: colors.brand }"
                    :to="{ path: '/register' }"
                  >
                    Don't have an account? Sign-up
                  </v-btn>
                </div>

                <v-alert
                  v-if="phoneError"
                  type="error"
                  variant="tonal"
                  class="mt-4"
                  :style="alertStyle"
                  density="default"
                >
                  {{ phoneError }}
                </v-alert>

                <div
                  class="d-grid mt-6"
                  style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                  "
                >
                  <v-chip
                    :style="chipGhostStyle"
                    size="default"
                    variant="outlined"
                    >GPS tracking</v-chip
                  >
                  <v-chip
                    :style="chipGhostStyle"
                    size="default"
                    variant="outlined"
                    >Digital timesheets</v-chip
                  >
                  <v-chip
                    :style="chipGhostStyle"
                    size="default"
                    variant="outlined"
                    >Auto reports</v-chip
                  >
                </div>
              </div>

              <!-- Email mode -->
              <div v-else class="mt-6">
                <div class="text-body-1 label-text mb-2">Email address</div>
                <v-text-field
                  v-model.trim="email"
                  placeholder="your@example.com"
                  density="default"
                  hide-details
                  variant="outlined"
                  type="email"
                  :style="inputStyle"
                  @keyup.enter="onEmailSubmit"
                />

                <div class="text-body-2 help-text mt-2">
                  We’ll initiate a secure session and take you to PIN
                  verification.
                </div>

                <v-btn
                  class="mt-6"
                  block
                  color="primary"
                  :loading="emailLoading"
                  :style="primaryBtnStyle"
                  @click="onEmailSubmit"
                >
                  Continue with Email
                </v-btn>

                <!-- Sign-up Link -->
                <div class="text-center mt-4">
                  <v-btn
                    variant="text"
                    :style="{ color: colors.brand }"
                    :to="{ path: '/register' }"
                  >
                    Don't have an account? Sign-up
                  </v-btn>
                </div>

                <v-alert
                  v-if="emailError"
                  type="error"
                  variant="tonal"
                  class="mt-4"
                  :style="alertStyle"
                  density="default"
                  closable
                  @click:close="emailError = ''"
                >
                  {{ emailError }}
                </v-alert>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";

const router = useRouter();
const mode = ref("phone");
const countryCode = ref("+91");
const phoneRaw = ref("");
const phoneError = ref("");
const loading = ref(false);
const email = ref("");
const emailError = ref("");
const emailLoading = ref(false);
const year = new Date().getFullYear();

const countryItems = [{ title: "🇮🇳 +91", value: "+91" }];

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

    const fullPhoneNumber = countryCode.value + digits;

    const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
    if (!phoneExists) {
      phoneError.value =
        "This phone number is not registered. Please sign up first.";
      return;
    }

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
    phoneError.value =
      "An error occurred. Please try again or check the internet connection";
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

    console.log("OTP Generation Response:", response);

    if (response && response.otp_session_uuid) {
      console.log("✅ Valid OTP response:", response);
      localStorage.setItem("sessionUuid", response.otp_session_uuid);
      localStorage.setItem("fromOtp", "true");
      localStorage.setItem("fullPhoneNumber", fullPhoneNumber);

      // Debug routes
      console.log("Available routes:", router.getRoutes());
      console.log("Navigating to Verification with params:", {
        name: "Verification",
        params: { phoneNumber: fullPhoneNumber.replace(countryCode.value, "") },
      });

      router.push({
        name: "Verification",
        params: { phoneNumber: fullPhoneNumber.replace(countryCode.value, "") },
      });
    } else {
      console.warn("Invalid OTP response structure:", response);
      phoneError.value = "Failed to generate OTP. Please try again.";
    }
  } catch (error) {
    console.error("Error generating OTP:", error);
    if (error.message === "RESIGNED_USER") {
      phoneError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
    } else {
      phoneError.value = "Failed to generate OTP. Please try again.";
    }
  }
}

function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
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

/* Inline palette + styles */
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

const phoneInputStyle = {
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

const pillStyle = {
  backgroundColor: "#103063",
  color: colors.text,
  border: `1px solid ${colors.border}`,
  textTransform: "none",
};

const pillActiveStyle = {
  boxShadow: `inset 0 0 0 1px ${colors.brand}`,
  background:
    "linear-gradient(180deg, rgba(91,127,255,0.28), rgba(91,127,255,0.14))",
};

const chipStyle = {
  background:
    "linear-gradient(180deg, rgba(91,127,255,0.24), rgba(91,127,255,0.12))",
  border: `1px solid ${colors.brand}`,
  color: colors.text,
};

const chipGhostStyle = {
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

.hero-title {
  color: #d7e3ff;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.hero-lead {
  color: #b9d1ff;
}

.stat-text {
  color: #d7e3ff;
}

.stat-sub {
  color: #b9d1ff;
}
</style>
