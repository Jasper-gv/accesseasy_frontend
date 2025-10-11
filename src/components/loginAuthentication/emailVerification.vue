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
            <div class="text-body-2 brand-sub">Secure verification process</div>
          </div>
        </v-col>
      </v-row>

      <!-- Content -->
      <v-row justify="center">
        <!-- OTP Verification Card -->
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
                  Verify Your Email
                </div>
                <!-- <v-chip size="small" :style="demoChipStyle" variant="flat">
                  Demo only
                </v-chip> -->
              </div>
              <div class="text-body-2 help-text">
                Enter the 6-digit code sent to {{ displayEmail }}
              </div>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mt-4"
                :style="alertStyle"
                density="default"
                closable
                @click:close="clearError"
              >
                {{ error }}
              </v-alert>

              <!-- Success Alert -->
              <v-alert
                v-if="success"
                type="success"
                variant="tonal"
                class="mt-4"
                :style="successAlertStyle"
                density="default"
                closable
                @click:close="clearSuccess"
              >
                {{ success }}
              </v-alert>

              <!-- OTP Input -->
              <div class="mt-6">
                <div class="text-body-1 label-text mb-2">Verification Code</div>
                <div class="d-flex ga-3 justify-center">
                  <v-text-field
                    v-for="(digit, index) in 6"
                    :key="index"
                    v-model="otpDigits[index]"
                    maxlength="1"
                    type="text"
                    density="default"
                    variant="outlined"
                    :style="[
                      otpInputStyle,
                      { maxWidth: '80px', textAlign: 'center' },
                    ]"
                    class="otp-input"
                    :class="{
                      filled: otpDigits[index],
                      focused: focusedIndex === index,
                    }"
                    @input="handleInput(index)"
                    @keydown="handleKeydown($event, index)"
                    @focus="focusedIndex = index"
                    @blur="focusedIndex = -1"
                    ref="otpFields"
                  />
                </div>
              </div>

              <!-- Timer and Resend OTP -->
              <div class="text-body-2 help-text mt-4 text-center">
                <span v-if="timer > 0">Resend OTP in {{ timer }} seconds</span>

                <a
                  v-else
                  href="#"
                  @click.prevent="resendOtp"
                  :style="{
                    color: colors.accent,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }"
                  class="text-body-2"
                >
                  <span v-if="!resendLoading">Resend OTP</span>
                  <span v-else>Sending...</span>
                </a>
              </div>

              <!-- Verify Button -->
              <v-btn
                class="mt-6"
                block
                color="primary"
                size="large"
                :style="primaryBtnStyle"
                :loading="loading"
                :disabled="!isValidOtp || loading"
                @click="verifyCode"
              >
                Verify Code
              </v-btn>

              <!-- Back Button -->
              <v-btn
                class="mt-4"
                block
                variant="outlined"
                :style="ghostBtnStyle"
                size="large"
                @click="goBackToLogin"
              >
                Back to Login
              </v-btn>

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
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";

const router = useRouter();
const route = useRoute();

const otpDigits = ref(Array(6).fill(""));
const loading = ref(false);
const resendLoading = ref(false);
const error = ref("");
const success = ref(""); // New ref for success message
const focusedIndex = ref(-1);
const userEmail = ref("");
const otpFields = ref([]);
const year = ref(new Date().getFullYear());
const timer = ref(30); // 30-second timer
let timerInterval = null;

const isValidOtp = computed(() =>
  otpDigits.value.every((digit) => digit !== ""),
);
const displayEmail = computed(() => {
  return userEmail.value || localStorage.getItem("email") || "your email";
});

// Start the timer
function startTimer() {
  timer.value = 30;
  clearInterval(timerInterval); // Clear any existing interval
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value -= 1;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

// Clear success message
function clearSuccess() {
  success.value = "";
}
// Resend OTP by calling onEmailSubmit
async function resendOtp() {
  resendLoading.value = true;
  error.value = "";
  success.value = ""; // Clear previous success message
  try {
    await onEmailSubmit(userEmail.value);
    success.value = "OTP sent successfully!"; // Show success message
    setTimeout(() => clearSuccess(), 3000); // Clear after 3 seconds
    startTimer(); // Reset timer after successful resend
    otpDigits.value = Array(6).fill(""); // Clear OTP input
    nextTick(() => {
      if (otpFields.value[0]) {
        otpFields.value[0].focus();
      }
    });
  } catch (err) {
    error.value = err?.message || "Failed to resend OTP. Please try again.";
  } finally {
    resendLoading.value = false;
  }
}

// Modified onEmailSubmit to accept email as parameter
async function onEmailSubmit(email) {
  error.value = "";
  success.value = ""; // Clear previous success message
  if (!validEmail(email)) {
    error.value = "Enter a valid email address.";
    return;
  }
  try {
    // Check if email exists
    const emailExists = await authService.checkEmailExists(email);
    if (!emailExists) {
      error.value = "This email is not registered. Please sign up first.";
      return;
    }

    // Check if user is resigned
    const isResigned = await authService.checkUserResignedByEmail(email);
    if (isResigned) {
      error.value =
        "Resigned Employee has No access. Please contact your Company Admin.";
      return;
    }

    // Generate OTP
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/emailLogin/generate-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, userApp: "fieldeasy" }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.otp_session_uuid) {
      throw new Error(
        data?.message || "Could not start email session. Try again.",
      );
    }
    localStorage.setItem("email", email);
    localStorage.setItem("emailSessionUuid", data.otp_session_uuid);
    router.push({ name: "EmailVerification", params: { email: email } });
  } catch (err) {
    throw err; // Propagate error to be handled by caller
  }
}

// Email validation function
function validEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function handleInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => {
      otpFields.value[index + 1]?.focus();
    });
  }
}

function handleKeydown(event, index) {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    otpFields.value[index - 1].focus();
  }
  if (event.key === "Enter" && index === 5 && isValidOtp.value) {
    verifyCode();
  }
}

function clearError() {
  error.value = "";
}

function goBackToLogin() {
  router.push("/login");
}

async function verifyCode() {
  error.value = "";
  success.value = ""; // Clear previous success message
  loading.value = true;

  if (!isValidOtp.value) {
    error.value = "Please enter all 6 digits.";
    loading.value = false;
    return;
  }

  try {
    const otp = otpDigits.value.join("");
    const sessionUuid = localStorage.getItem("emailSessionUuid");
    const email = userEmail.value;

    if (!sessionUuid || !email) {
      error.value = "Session expired. Please go back to login.";
      loading.value = false;
      return;
    }

    // Verify OTP using authService
    const response = await authService.verifyEmailOtp(otp, sessionUuid, email);

    if (response && response.token) {
      // OTP verified successfully
      success.value = "OTP verified successfully!"; // Show success message
      setTimeout(() => {
        clearSuccess();
        // Navigate to PIN verification
        localStorage.setItem("fromEmailOtp", "true");
        router.push({
          name: "PinVerification",
          params: { email: email },
          query: { fromEmail: true },
        });
      }, 2000); // Navigate after 2 seconds to allow user to see the success message
    } else {
      error.value = "OTP is wrong, please enter correct OTP.";
      otpDigits.value = Array(6).fill("");
      nextTick(() => {
        if (otpFields.value[0]) {
          otpFields.value[0].focus();
        }
      });
    }
  } catch (err) {
    console.error("Email OTP verification error:", err);
    error.value =
      err?.response?.data?.message || "OTP is wrong, please enter correct OTP.";
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      if (otpFields.value[0]) {
        otpFields.value[0].focus();
      }
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  userEmail.value = localStorage.getItem("email") || route.params.email;
  if (!userEmail.value) {
    error.value = "Email not found. Please go back to login.";
    return;
  }
  startTimer(); // Start the timer when the component is mounted
  nextTick(() => {
    if (otpFields.value[0]) {
      otpFields.value[0].focus();
    }
  });
});

onUnmounted(() => {
  clearInterval(timerInterval); // Clean up timer on component unmount
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

const cardStyle = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  color: colors.text,
};

const otpInputStyle = {
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
    "linear-gradient(135deg, rgba(187,247,208,0.9), rgba(34,197,94,0.95))",
  color: "#14532d",
  border: "1px solid rgba(74,222,128,0.4)",
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

.otp-input.filled {
  background: linear-gradient(
    180deg,
    rgba(91, 127, 255, 0.14),
    rgba(91, 127, 255, 0.07)
  );
}
</style>
