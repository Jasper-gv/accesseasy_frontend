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
            <div class="text-body-2 brand-sub">Secure PIN verification</div>
          </div>
        </v-col>
      </v-row>

      <!-- Content -->
      <v-row justify="center">
        <!-- PIN Verification Card -->
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
                  {{ isPinCreation ? "Create Your PIN" : "Enter Your PIN" }}
                </div>
              </div>
              <div class="text-body-2 help-text">
                {{
                  isPinCreation
                    ? "Please create a 4-digit PIN for secure access"
                    : "Enter your 4-digit PIN to continue"
                }}
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
                v-if="successMessage"
                type="success"
                variant="tonal"
                class="mt-4"
                :style="alertSuccessStyle"
                density="default"
                closable
                @click:close="clearSuccessMessage"
              >
                {{ successMessage }}
              </v-alert>

              <!-- PIN Input -->
              <div class="mt-6">
                <div class="text-body-1 label-text mb-2">
                  {{
                    isPinCreation
                      ? isConfirmingPin
                        ? "Confirm PIN"
                        : "Create PIN"
                      : "Enter PIN"
                  }}
                </div>
                <div class="d-flex ga-3 justify-center">
                  <v-text-field
                    v-for="(digit, index) in 4"
                    :key="index"
                    v-model="pinDigits[index]"
                    maxlength="1"
                    :type="showPin ? 'text' : 'password'"
                    density="default"
                    variant="outlined"
                    :style="[
                      pinInputStyle,
                      { maxWidth: '80px', textAlign: 'center' },
                    ]"
                    class="pin-input"
                    :class="{
                      filled: pinDigits[index],
                      focused: focusedIndex === index,
                    }"
                    @input="handleInput(index)"
                    @keydown="handleKeydown($event, index)"
                    @focus="focusedIndex = index"
                    @blur="focusedIndex = -1"
                    ref="pinFields"
                  />
                </div>
                <div class="text-body-2 help-text mt-2 text-center">
                  Enter 4 digits
                </div>
              </div>

              <!-- Show PIN Toggle -->
              <div class="d-flex justify-center mt-3">
                <v-checkbox
                  v-model="showPin"
                  label="Show PIN"
                  :style="{ color: colors.textSub }"
                  hide-details
                />
              </div>

              <!-- Verify Button -->
              <v-btn
                class="mt-6"
                block
                color="primary"
                size="large"
                :style="primaryBtnStyle"
                :loading="loading"
                :disabled="!isValidPin || loading"
                @click="handlePinAction"
              >
                {{ actionButtonText }}
              </v-btn>

              <!-- Forgot PIN Link -->
              <div v-if="showForgotPin" class="text-center mt-4">
                <v-btn
                  variant="text"
                  :style="{ color: colors.brand }"
                  @click="resetPin"
                >
                  Reset PIN
                </v-btn>
              </div>

              <!-- Back Button -->
              <v-btn
                class="mt-4"
                block
                variant="outlined"
                :style="ghostBtnStyle"
                size="large"
                @click="goToAlternateLogin"
              >
                Login to Another Account
              </v-btn>

              <!-- Session Timeout Modal -->
              <v-dialog v-model="showTimeoutModal" max-width="500">
                <v-card :style="cardStyle">
                  <v-card-text class="pa-8 text-center">
                    <v-icon size="80" color="warning" class="mb-4">
                      mdi-alert
                    </v-icon>
                    <div class="text-h5 font-weight-black heading-text">
                      Session Timed Out
                    </div>
                    <div class="text-body-2 help-text mt-2">
                      Your session has expired due to inactivity.
                    </div>
                    <v-btn
                      class="mt-6"
                      color="primary"
                      :style="primaryBtnStyle"
                      size="large"
                      @click="confirmTimeout"
                    >
                      OK
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-dialog>

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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import crypto from "crypto-js";

// Encryption/Decryption config
const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function checkIfEncrypted(text) {
  if (!text || typeof text !== "string") return false;
  const parts = text.split(":");
  if (parts.length !== 2) return false;
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(parts[0]) && hexRegex.test(parts[1]);
}

function encryptData(plainText) {
  const iv = crypto.lib.WordArray.random(16);
  const keyWordArray = crypto.enc.Hex.parse(ENCRYPTION_KEY);

  const encrypted = crypto.AES.encrypt(plainText, keyWordArray, {
    iv: iv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7,
  });

  return `${iv.toString(crypto.enc.Hex)}:${encrypted.ciphertext.toString(
    crypto.enc.Hex,
  )}`;
}

function decryptData(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== "string") {
      return encryptedText || "";
    }

    if (!checkIfEncrypted(encryptedText)) {
      return encryptedText;
    }

    const textParts = encryptedText.split(":");
    const iv = textParts[0];
    const encryptedData = textParts[1];

    const ivWordArray = crypto.enc.Hex.parse(iv);
    const keyWordArray = crypto.enc.Hex.parse(ENCRYPTION_KEY);
    const ciphertext = crypto.enc.Hex.parse(encryptedData);

    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: ciphertext,
    });

    const decrypted = crypto.AES.decrypt(cipherParams, keyWordArray, {
      iv: ivWordArray,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7,
    });

    return decrypted.toString(crypto.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText;
  }
}

const router = useRouter();
const route = useRoute();

const pinDigits = ref(Array(4).fill(""));
const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const isPinCreation = ref(false);
const isConfirmingPin = ref(false);
const tempPin = ref("");
const attempts = ref(0);
const showForgotPin = ref(false);
const errorMessageTimeout = ref(null);
const successMessageTimeout = ref(null);
const userPhone = ref("");
const userId = ref(null);
const userPin = ref(null);
const inactivityTimer = ref(null);
const lastActivityTime = ref(Date.now());
const showPin = ref(false);
const showTimeoutModal = ref(false);
const isResettingPin = ref(false);
const focusedIndex = ref(-1);
const pinFields = ref([]);

const year = ref(new Date().getFullYear());

const isValidPin = computed(() =>
  pinDigits.value.every((digit) => digit !== ""),
);
const actionButtonText = computed(() =>
  isPinCreation.value
    ? isConfirmingPin.value
      ? "Confirm PIN"
      : "Create PIN"
    : "Verify PIN",
);
const currentPin = computed(() => pinDigits.value.join(""));

function handleInput(index) {
  updateLastActivity();
  pinDigits.value[index] = pinDigits.value[index].replace(/[^0-9]/g, "");
  if (pinDigits.value[index] && index < 3) {
    nextTick(() => {
      pinFields.value[index + 1]?.focus();
    });
  }
}

function handleKeydown(event, index) {
  updateLastActivity();
  if (event.key === "Backspace" && !pinDigits.value[index] && index > 0) {
    pinFields.value[index - 1].focus();
  }
  if (event.key === "Enter" && isValidPin.value) {
    handlePinAction();
  }
}

function clearError() {
  error.value = "";
  if (errorMessageTimeout.value) {
    clearTimeout(errorMessageTimeout.value);
    errorMessageTimeout.value = null;
  }
}

function clearSuccessMessage() {
  successMessage.value = "";
  if (successMessageTimeout.value) {
    clearTimeout(successMessageTimeout.value);
    successMessageTimeout.value = null;
  }
}

function setSuccessMessage(message) {
  if (successMessageTimeout.value) {
    clearTimeout(successMessageTimeout.value);
  }
  successMessage.value = message;
  successMessageTimeout.value = setTimeout(() => {
    successMessage.value = "";
    successMessageTimeout.value = null;
  }, 3000);
}

function setErrorMessage(message) {
  if (errorMessageTimeout.value) {
    clearTimeout(errorMessageTimeout.value);
  }
  error.value = message;
  errorMessageTimeout.value = setTimeout(() => {
    error.value = "";
    errorMessageTimeout.value = null;
  }, 3000);
}

function goToAlternateLogin() {
  router.push("/alternate-login");
}

async function checkUserPin() {
  try {
    // Check if logging in via email or phone
    const isEmailLogin = route.query.fromEmail === "true" || route.params.email;

    if (isEmailLogin) {
      // Email-based login
      const email = route.params.email || localStorage.getItem("email");

      if (!email) {
        throw new Error("Email not found");
      }

      const user = await authService.getUserByEmail(email);

      if (user) {
        userId.value = user.id;
        userPin.value = user.userPin;

        const fromOtpVerification =
          localStorage.getItem("fromEmailOtp") === "true";
        const hasPin = user.userPin && user.userPin !== "";

        if (hasPin && fromOtpVerification) {
          isPinCreation.value = false;
        } else {
          isPinCreation.value = !hasPin;
        }

        isConfirmingPin.value = false;
        return hasPin;
      } else {
        throw new Error("User not found");
      }
    } else {
      // Phone-based login (existing code)
      let phone =
        route.params.phoneNumber ||
        localStorage.getItem("userPhone") ||
        userPhone.value;

      if (!phone) {
        throw new Error("Phone number not found");
      }

      phone = phone.replace(/\D/g, "");
      if (phone.startsWith("91") && phone.length === 12) {
        phone = phone.substring(2);
      }

      userPhone.value = phone;
      localStorage.setItem("userPhone", phone);

      const fullPhoneNumber = `+91${phone}`;
      const user = await authService.getUserByPhone(fullPhoneNumber);

      if (user) {
        userId.value = user.id;
        userPin.value = user.userPin;

        const fromOtpVerification = route.query.fromOtp === "true";
        const hasPin = user.userPin && user.userPin !== "";

        if (hasPin && fromOtpVerification) {
          isPinCreation.value = false;
        } else {
          isPinCreation.value = !hasPin;
        }

        isConfirmingPin.value = false;
        return hasPin;
      } else {
        throw new Error("User not found");
      }
    }
  } catch (error) {
    console.error("Error checking user data:", error);
    isPinCreation.value = true;
    isConfirmingPin.value = false;
    return false;
  }
}

async function handlePinAction() {
  updateLastActivity();
  loading.value = true;

  try {
    if (isPinCreation.value) {
      if (!isConfirmingPin.value) {
        if (
          isResettingPin.value &&
          userPin.value &&
          currentPin.value === userPin.value.toString()
        ) {
          setErrorMessage(
            "New PIN cannot be the same as your old PIN. Please choose a different PIN.",
          );
          pinDigits.value = Array(4).fill("");
          nextTick(() => {
            pinFields.value[0]?.focus();
          });
          loading.value = false;
          return;
        }

        tempPin.value = currentPin.value;
        isConfirmingPin.value = true;
        pinDigits.value = Array(4).fill("");
        setSuccessMessage("Please re-enter your PIN to confirm");
        nextTick(() => {
          pinFields.value[0]?.focus();
        });
        loading.value = false;
        return;
      } else {
        const currentPinStr = currentPin.value.toString().trim();
        const tempPinStr = tempPin.value.toString().trim();

        if (currentPinStr.length !== 4 || tempPinStr.length !== 4) {
          setErrorMessage("PIN must be exactly 4 digits");
          pinDigits.value = Array(4).fill("");
          isConfirmingPin.value = false;
          tempPin.value = "";
          nextTick(() => {
            pinFields.value[0]?.focus();
          });
          loading.value = false;
          return;
        }

        if (currentPinStr === tempPinStr) {
          await savePin(currentPinStr);
          setSuccessMessage("4-digit PIN successfully created");
          if (isResettingPin.value) {
            // setTimeout(() => {
            //   router.push("/login");
            // }, 1500);
          } else {
            authService.setPinVerified(true);
            setTimeout(() => {
              router.push("/taskManagement/taskcomponents");
            }, 1500);
          }
        } else {
          setErrorMessage("PINs do not match, please try again");
          pinDigits.value = Array(4).fill("");
          isConfirmingPin.value = false;
          tempPin.value = "";
          nextTick(() => {
            pinFields.value[0]?.focus();
          });
          loading.value = false;
          return;
        }
      }
    } else {
      await verifyPin();
    }
  } catch (error) {
    setErrorMessage(error.message || "An error occurred. Please try again.");
  } finally {
    loading.value = false;
  }
}

async function verifyPin() {
  try {
    const enteredPin = currentPin.value.toString().trim();

    let databasePin = userPin.value || "";

    if (enteredPin.length !== 4) {
      setErrorMessage("PIN must be exactly 4 digits");
      pinDigits.value = Array(4).fill("");
      nextTick(() => {
        pinFields.value[0]?.focus();
      });
      return;
    }

    if (checkIfEncrypted(databasePin)) {
      databasePin = decryptData(databasePin);
    }

    if (enteredPin === databasePin) {
      setSuccessMessage("PIN verified successfully");
      attempts.value = 0;
      localStorage.setItem("pinVerifiedInSession", "true");
      setTimeout(() => {
        router.push("/taskManagement/taskcomponents");
      }, 1500);
      return;
    }

    attempts.value++;
    if (attempts.value >= 3) {
      showForgotPin.value = true;
      setErrorMessage("Maximum attempts reached. Please reset your PIN.");
    } else {
      setErrorMessage(
        `Incorrect PIN. ${3 - attempts.value} attempts remaining.`,
      );
    }

    pinDigits.value = Array(4).fill("");
    nextTick(() => {
      pinFields.value[0]?.focus();
    });
  } catch (error) {
    console.error("[v0] PIN verification error:", error);
    throw new Error("Failed to verify PIN. Please try again.");
  }
}

async function savePin(pin) {
  try {
    if (!userId.value) {
      throw new Error("User ID not found");
    }

    const encryptedPin = encryptData(pin);

    const response = await authService.protectedApi.patch(
      `/users/${userId.value}`,
      { userPin: encryptedPin },
    );

    if (response.status === 200) {
      localStorage.setItem("pinVerifiedInSession", "true");
      console.log(authService.getToken());
      return true;
    } else {
      throw new Error("Failed to save PIN");
    }
  } catch (error) {
    console.error("Error saving PIN:", error);
    throw new Error("Failed to save PIN. Please try again.");
  }
}

function resetPin() {
  isPinCreation.value = true;
  isConfirmingPin.value = false;
  pinDigits.value = Array(4).fill("");
  tempPin.value = "";
  attempts.value = 0;
  showForgotPin.value = false;
  isResettingPin.value = true;
  setSuccessMessage("Please create a new PIN");
  nextTick(() => {
    pinFields.value[0]?.focus();
  });
}

function updateLastActivity() {
  lastActivityTime.value = Date.now();
  authService.updateLastActivity();
}

function checkInactivity() {
  const currentTime = Date.now();
  const inactiveTime = currentTime - lastActivityTime.value;
  if (inactiveTime > 3600000) {
    handleSessionTimeout();
  }
}

function handleSessionTimeout() {
  if (inactivityTimer.value) {
    clearInterval(inactivityTimer.value);
  }
  showTimeoutModal.value = true;
}

function confirmTimeout() {
  showTimeoutModal.value = false;
  // router.push({
  //   path: "/login",
  //   query: { timeout: true },
  // });
}

function setupInactivityTracking() {
  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
  events.forEach((event) => {
    document.addEventListener(event, updateLastActivity);
  });
  inactivityTimer.value = setInterval(checkInactivity, 60000);
}

function cleanupInactivityTracking() {
  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
  events.forEach((event) => {
    document.removeEventListener(event, updateLastActivity);
  });
  if (inactivityTimer.value) {
    clearInterval(inactivityTimer.value);
  }
}

onMounted(() => {
  setupInactivityTracking();
  userPhone.value =
    route.params.phoneNumber || localStorage.getItem("userPhone");
  if (!userPhone.value) {
    setErrorMessage("Phone number not found");
    // setTimeout(() => {
    //   router.push("/login");
    // }, 3000);
    return;
  }
  checkUserPin()
    .then(() => {
      nextTick(() => {
        if (pinFields.value[0]) {
          pinFields.value[0].focus();
        }
      });
    })
    .catch((error) => {
      console.error("Error in mounted:", error);
      setErrorMessage("Error initializing PIN verification. Please try again.");
      // setTimeout(() => {
      //   router.push("/login");
      // }, 3000);
    });
});

onBeforeUnmount(() => {
  cleanupInactivityTracking();
  if (errorMessageTimeout.value) {
    clearTimeout(errorMessageTimeout.value);
  }
  if (successMessageTimeout.value) {
    clearTimeout(successMessageTimeout.value);
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

const pinInputStyle = {
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

const alertSuccessStyle = {
  background:
    "linear-gradient(135deg, rgba(200,230,201,0.9), rgba(165,214,167,0.95))",
  color: "#2e7d32",
  border: "1px solid rgba(76,175,80,0.4)",
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

.pin-input.filled {
  background: linear-gradient(
    180deg,
    rgba(91, 127, 255, 0.14),
    rgba(91, 127, 255, 0.07)
  );
}
</style>
