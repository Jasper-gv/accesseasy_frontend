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
            <div class="text-body-2 brand-sub">Switch account seamlessly</div>
          </div>
        </v-col>
      </v-row>

      <!-- Content -->
      <v-row justify="center">
        <!-- Login Card -->
        <v-col cols="12" sm="10" md="8" lg="6">
          <v-card
            :style="cardStyle"
            rounded="lg"
            class="mx-auto"
            style="max-width: 600px"
          >
            <v-card-text class="pa-8">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-h5 font-weight-black heading-text">Login</div>
                <!-- <v-chip size="small" :style="demoChipStyle" variant="flat">
                  Demo only
                </v-chip> -->
              </div>
              <div class="text-body-2 help-text">
                Enter phone number or email for different account
              </div>

              <!-- Session Timeout Alert -->
              <v-alert
                v-if="showTimeoutMessage"
                type="error"
                variant="tonal"
                class="mt-4"
                :style="alertStyle"
                density="default"
                closable
                @click:close="dismissTimeoutMessage"
              >
                Session timed out
              </v-alert>

              <!-- Tabs for Phone/Email -->
              <v-tabs v-model="activeTab" :style="tabsStyle" class="mt-6">
                <v-tab value="phone">Phone</v-tab>
                <v-tab value="email">Email</v-tab>
              </v-tabs>

              <v-window v-model="activeTab">
                <!-- Phone Login -->
                <v-window-item value="phone">
                  <v-form @submit.prevent="handleSubmit" class="mt-6">
                    <div class="text-body-1 label-text mb-2">Phone Number</div>
                    <v-row>
                      <v-col cols="4">
                        <v-select
                          v-model="countryCode"
                          :items="countryCodes"
                          item-title="code"
                          item-value="code"
                          variant="outlined"
                          density="default"
                          :style="loginInputStyle"
                        ></v-select>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="phoneNumber"
                          label="Enter phone number"
                          variant="outlined"
                          density="default"
                          type="tel"
                          :rules="phoneRules"
                          :error-messages="phoneError"
                          :style="loginInputStyle"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-btn
                      block
                      size="large"
                      type="submit"
                      :loading="loading"
                      :style="primaryBtnStyle"
                      class="mt-6"
                    >
                      Get Verification Code
                    </v-btn>
                  </v-form>
                </v-window-item>

                <!-- Email Login -->
                <v-window-item value="email">
                  <v-form @submit.prevent="handleEmailSubmit" class="mt-6">
                    <div class="text-body-1 label-text mb-2">Email Address</div>
                    <v-text-field
                      v-model="email"
                      label="Enter email address"
                      variant="outlined"
                      density="default"
                      type="email"
                      :rules="emailRules"
                      :error-messages="emailError"
                      :style="loginInputStyle"
                    ></v-text-field>
                    <v-btn
                      block
                      size="large"
                      type="submit"
                      :loading="emailLoading"
                      :style="primaryBtnStyle"
                      class="mt-6"
                    >
                      Get Verification Code
                    </v-btn>
                  </v-form>
                </v-window-item>
              </v-window>

              <!-- Sign-up Link -->
              <div class="text-center mt-6">
                <v-btn
                  variant="text"
                  :style="{ color: colors.brand }"
                  :to="{ path: '/register' }"
                >
                  Don't have an account? Sign-up
                </v-btn>
              </div>

              <div class="text-body-2 help-text mt-8">
                © {{ year }} Fieldseasy
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";

const router = useRouter();
const route = useRoute();

const countryCode = ref("+91");
const phoneNumber = ref("");
const email = ref("");
const loading = ref(false);
const emailLoading = ref(false);
const phoneError = ref("");
const emailError = ref("");
const countryCodes = ref([{ code: "+91", flag: "🇮🇳" }]);
const showTimeoutMessage = ref(false);
const activeTab = ref("phone");
const year = ref(new Date().getFullYear());

const phoneRules = [
  (v) => !!v || "Phone number is required",
  (v) => /^\d{10}$/.test(v) || "Phone number must be 10 digits",
];

const emailRules = [
  (v) => !!v || "Email is required",
  (v) => /.+@.+\..+/.test(v) || "Email must be valid",
];

function clearPreviousSession() {
  localStorage.removeItem("pinVerifiedInSession");
  localStorage.removeItem("fromOtp");
  localStorage.removeItem("sessionUuid");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("fullPhoneNumber");
  localStorage.removeItem("userData");
  localStorage.removeItem("tenantData");
}

function dismissTimeoutMessage() {
  showTimeoutMessage.value = false;
}

async function handleSubmit() {
  phoneError.value = "";

  if (!phoneNumber.value) {
    phoneError.value = "Phone number is required";
    return;
  }

  if (!/^\d{10}$/.test(phoneNumber.value)) {
    phoneError.value = "Phone number must be 10 digits";
    return;
  }

  loading.value = true;

  try {
    clearPreviousSession();

    const fullPhoneNumber = countryCode.value + phoneNumber.value;

    // Step 1: Check if user exists first
    const phoneExists = await authService.checkPhoneExists(fullPhoneNumber);
    if (!phoneExists) {
      phoneError.value =
        "This phone number is not registered. Please sign up first.";
      return;
    }

    // Step 2: Check resignation status (without triggering OTP)
    const isResigned = await authService.checkUserResigned(fullPhoneNumber);
    if (isResigned) {
      phoneError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    // Proceed to OTP verification
    await proceedToOtpVerification();
  } catch (error) {
    console.error("Error during alternate login:", error);
    phoneError.value =
      "An error occurred. Please try again or check the internet connection";
  } finally {
    loading.value = false;
  }
}

async function proceedToOtpVerification() {
  try {
    // Trigger OTP for alternate login
    const response = await authService.generateOtp(phoneNumber.value);
    if (response && response.otp_session_uuid) {
      localStorage.setItem("sessionUuid", response.otp_session_uuid);
      localStorage.setItem("fromOtp", "true");
      localStorage.setItem("userPhone", phoneNumber.value);
      localStorage.setItem(
        "fullPhoneNumber",
        countryCode.value + phoneNumber.value,
      );
      localStorage.setItem("fromAlternateLogin", "true");

      router.push({
        name: "Verification",
        params: { phoneNumber: phoneNumber.value },
      });
    } else {
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

async function handleEmailSubmit() {
  emailError.value = "";

  if (!email.value) {
    emailError.value = "Email is required";
    return;
  }

  if (!/.+@.+\..+/.test(email.value)) {
    emailError.value = "Email must be valid";
    return;
  }

  emailLoading.value = true;

  try {
    clearPreviousSession();

    // Step 1: Check if email exists
    const emailExists = await authService.checkEmailExists(email.value);
    if (!emailExists) {
      emailError.value = "This email is not registered. Please sign up first.";
      return;
    }

    // Step 2: Check resignation status
    const isResigned = await authService.checkUserResigned(email.value);
    if (isResigned) {
      emailError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    // Trigger OTP for email
    const response = await authService.generateEmailOtp(email.value);
    if (response && response.otp_session_uuid) {
      localStorage.setItem("sessionUuid", response.otp_session_uuid);
      localStorage.setItem("fromOtp", "true");
      localStorage.setItem("userEmail", email.value);
      localStorage.setItem("fromAlternateLogin", "true");

      router.push({
        name: "Verification",
        params: { email: email.value },
      });
    } else {
      emailError.value = "Failed to generate OTP. Please try again.";
    }
  } catch (error) {
    console.error("Error during email login:", error);
    if (error.message === "RESIGNED_USER") {
      emailError.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
    } else {
      emailError.value =
        "An error occurred. Please try again or check the internet connection";
    }
  } finally {
    emailLoading.value = false;
  }
}

onMounted(() => {
  clearPreviousSession();
  if (route.query.timeout) {
    showTimeoutMessage.value = true;
  }
});

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

const loginInputStyle = {
  color: colors.text,
};

const primaryBtnStyle = {
  background: `linear-gradient(90deg, ${colors.brand}, ${colors.accent})`,
  color: "#ffffff",
};

const tabsStyle = {
  backgroundColor: colors.surface,
  color: colors.text,
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
</style>
