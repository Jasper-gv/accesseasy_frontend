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
                  Verify Your Number
                </div>
                <!-- <v-chip size="small" :style="demoChipStyle" variant="flat">
                  Demo only
                </v-chip> -->
              </div>
              <div class="text-body-2 help-text">
                Enter the 6-digit code sent to {{ displayPhoneNumber }}
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
                <div class="text-body-2 help-text mt-2 text-center">
                  Enter 6 digits
                </div>
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
                © {{ year }} Fieldseasy • Demo experience for design only.
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";

const router = useRouter();
const route = useRoute();

const otpDigits = ref(Array(6).fill(""));
const loading = ref(false);
const error = ref("");
const focusedIndex = ref(-1);
const userPhone = ref("");
const otpFields = ref([]);
const year = ref(new Date().getFullYear());

const isValidOtp = computed(() =>
  otpDigits.value.every((digit) => digit !== ""),
);
const displayPhoneNumber = computed(() => {
  const phone = userPhone.value || localStorage.getItem("userPhone");
  return phone ? `+91${phone}` : "your number";
});

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
  loading.value = true;

  if (!isValidOtp.value) {
    error.value = "Please enter all 6 digits.";
    loading.value = false;
    return;
  }

  try {
    const otp = otpDigits.value.join("");
    const sessionUuid = localStorage.getItem("sessionUuid");
    const phone = userPhone.value;

    if (!sessionUuid || !phone) {
      error.value = "Session expired. Please go back to login.";
      loading.value = false;
      return;
    }

    // Verify OTP using authService
    const response = await authService.verifyOtp(otp, sessionUuid, phone);

    if (response.token) {
      // OTP verified successfully, navigate to PIN verification
      router.push({
        name: "PinVerification",
        params: { phoneNumber: phone },
        query: { fromOtp: true },
      });
    } else {
      error.value = "Invalid OTP. Please try again.";
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    error.value = "Invalid OTP. Please try again.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  userPhone.value =
    localStorage.getItem("userPhone") || route.params.phoneNumber;
  if (!userPhone.value) {
    error.value = "Phone number not found. Please go back to login.";
    return;
  }
  nextTick(() => {
    if (otpFields.value[0]) {
      otpFields.value[0].focus();
    }
  });
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

.otp-input.filled {
  background: linear-gradient(
    180deg,
    rgba(91, 127, 255, 0.14),
    rgba(91, 127, 255, 0.07)
  );
}
</style>
