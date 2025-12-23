<!-- PinVerification.vue -->
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="h-100">
      <!-- Full Background Image - SAME AS LOGIN -->
      <v-col cols="12" class="d-flex align-center justify-end pa-0">
        <div
          class="background-container d-flex align-center justify-end h-100"
          :style="backgroundStyle"
        >
          <!-- Right Panel - PIN Verification Form (EXACT SAME AS LOGIN) -->
          <div class="login-container">
            <!-- Redesigned PIN verification card with EXACT SAME LAYOUT as login -->
            <v-card
              class="login-card"
              style="
                border: 2px solid #059669;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
              "
            >
              <!-- Logo and Tagline inside card header - SAME -->
              <div class="card-header">
                <div class="logo-section">
                  <img
                    src="/public/images/accesseasylogo1.jpeg"
                    alt="AccessEasy"
                    class="logo-image"
                  />
                </div>
              </div>

              <!-- Sub Header with light green background - SAME -->
              <div class="card-subheader">
                <h2 class="subheader-title">{{ pageHeader }}</h2>
              </div>

              <!-- Card content with improved spacing - SAME -->
              <div class="card-content">
                <!-- Back Button - SAME POSITION AS ALERTS -->
                <div
                  v-if="
                    currentStep > STEP.ENTER_PIN &&
                    !isFirstTime &&
                    !maxAttemptsReached
                  "
                  class="text-left mb-2"
                ></div>

                <!-- Error Alert - SAME POSITION -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ error }}
                </v-alert>

                <!-- Success Alert - SAME POSITION -->
                <v-alert
                  v-if="successMessage"
                  type="success"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ successMessage }}
                </v-alert>

                <!-- ENTER PIN STEP - 4 DIGIT BOXES WITH EYE ON RIGHT -->
                <div v-if="currentStep === STEP.ENTER_PIN">
                  <div v-if="!maxAttemptsReached" class="form-section">
                    <label class="form-label">PIN</label>
                    <div class="d-flex justify-center gap-2 pin-container">
                      <v-text-field
                        v-for="(digit, index) in 4"
                        :key="`enterpin-${index}`"
                        v-model="pinDigits[index]"
                        maxlength="1"
                        :type="showPin ? 'text' : 'password'"
                        density="comfortable"
                        variant="outlined"
                        class="pin-digit-input"
                        :class="{ filled: pinDigits[index] }"
                        @input="handlePinDigitInput(index)"
                        @keydown="handlePinKeydown($event, index)"
                        @focus="focusedIndex = index"
                        @blur="focusedIndex = -1"
                        ref="pinFields"
                      />
                      <!-- EYE ICON ON RIGHT SIDE -->
                      <v-icon
                        :icon="showPin ? 'mdi-eye' : 'mdi-eye-off'"
                        size="20"
                        :color="showPin ? '#059669' : '#666'"
                        class="pin-eye-icon-right"
                        @click="showPin = !showPin"
                      />
                    </div>
                  </div>

                  <!-- MAX ATTEMPTS REACHED - WITH RESET BUTTON -->
                  <div v-else class="form-section text-center">
                    <v-icon size="48" color="#fc5354" class="mb-2"
                      >mdi-lock-alert</v-icon
                    >
                    <p class="subheader-title mb-2">Maximum Attempts Reached</p>
                    <p class="help-text mb-4">
                      Please reset your PIN to continue
                    </p>

                    <!-- RED RESET PIN BUTTON -->
                    <BaseButton
                      @click="startForgotPinFlow"
                      :disabled="loading"
                      :loading="loading"
                      block
                      size="lg"
                      variant="danger"
                      class="reset-btn"
                    >
                      {{ loading ? "Sending..." : "Reset PIN" }}
                    </BaseButton>
                  </div>

                  <!-- Buttons - ONLY FOR NORMAL ENTRY -->
                  <BaseButton
                    v-if="!maxAttemptsReached"
                    @click="handlePinAction"
                    :disabled="loading || !isValidPin"
                    :loading="loading"
                    block
                    size="lg"
                    variant="primary"
                    class="submit-btn"
                  >
                    {{ loading ? "Verifying..." : "Verify PIN" }}
                  </BaseButton>

                  <!-- Reset PIN Link - HIDE WHEN MAX ATTEMPTS -->
                  <div
                    v-if="currentStep === STEP.ENTER_PIN && !maxAttemptsReached"
                    class="text-center mt-2"
                  >
                    <a
                      href="#"
                      @click.prevent="startForgotPinFlow"
                      class="signup-link"
                    >
                      Reset PIN
                    </a>
                  </div>

                  <!-- Switch Account Link - HIDE WHEN MAX ATTEMPTS -->
                  <p v-if="!maxAttemptsReached" class="signup-text">
                    <a
                      href="#"
                      @click.prevent="goToAlternateLogin"
                      class="signup-link"
                    >
                      Switch Account
                    </a>
                  </p>
                </div>

                <!-- VERIFY OTP STEP -->
                <div
                  v-else-if="currentStep === STEP.VERIFY_OTP"
                  class="form-section"
                >
                  <label class="form-label">Enter OTP</label>
                  <div class="d-flex justify-center gap-2">
                    <v-text-field
                      v-for="(digit, index) in 6"
                      :key="index"
                      v-model="otpDigits[index]"
                      maxlength="1"
                      type="text"
                      density="comfortable"
                      variant="outlined"
                      class="otp-input-field"
                      :class="{ filled: otpDigits[index] }"
                      @input="handleOtpInput(index)"
                      @keydown="handleOtpKeydown($event, index)"
                      @focus="otpFocusedIndex = index"
                      @blur="otpFocusedIndex = -1"
                      ref="otpFields"
                    />
                  </div>
                  <div class="help-text">
                    Didn't receive?
                    <a
                      href="#"
                      @click.prevent="resendOtp"
                      class="signup-link ml-1"
                    >
                      {{ loading ? "Sending..." : "Send again" }}
                    </a>
                  </div>
                </div>

                <!-- CREATE PIN STEP - 4 DIGIT BOXES WITH EYE ON RIGHT -->
                <div v-else class="form-section">
                  <label class="form-label">
                    {{ isConfirmingPin ? "Confirm PIN" : "New PIN" }}
                  </label>
                  <div class="d-flex justify-center gap-2 pin-container">
                    <v-text-field
                      v-for="(digit, index) in 4"
                      :key="`newpin-${index}`"
                      v-model="newPinDigits[index]"
                      maxlength="1"
                      :type="showPin ? 'text' : 'password'"
                      density="comfortable"
                      variant="outlined"
                      class="pin-digit-input"
                      :class="{ filled: newPinDigits[index] }"
                      @input="handleNewPinDigitInput(index)"
                      @keydown="handleNewPinKeydown($event, index)"
                      @focus="newPinFocusedIndex = index"
                      @blur="newPinFocusedIndex = -1"
                      ref="newPinFields"
                    />
                    <!-- EYE ICON ON RIGHT SIDE -->
                    <v-icon
                      :icon="showPin ? 'mdi-eye' : 'mdi-eye-off'"
                      size="30"
                      :color="showPin ? '#059669' : '#666'"
                      class="pin-eye-icon-right"
                      @click="showPin = !showPin"
                    />
                  </div>
                </div>

                <!-- Submit Buttons for OTP/CREATE PIN - SAME STYLE -->
                <BaseButton
                  v-if="currentStep !== STEP.ENTER_PIN"
                  @click="
                    currentStep === STEP.VERIFY_OTP
                      ? verifyForgotPinOtp()
                      : handleNewPinAction()
                  "
                  :disabled="
                    loading ||
                    (currentStep === STEP.VERIFY_OTP
                      ? !isValidOtp
                      : !isValidNewPin)
                  "
                  :loading="loading"
                  block
                  size="lg"
                  variant="primary"
                  class="submit-btn"
                >
                  {{
                    loading
                      ? "Processing..."
                      : currentStep === STEP.VERIFY_OTP
                        ? "Verify OTP"
                        : isConfirmingPin
                          ? "Confirm PIN"
                          : "Create PIN"
                  }}
                </BaseButton>

                <!-- Back to PIN Link - SAME STYLE -->
                <p v-if="currentStep !== STEP.ENTER_PIN" class="signup-text">
                  <a
                    href="#"
                    @click.prevent="resetToPinEntry"
                    class="signup-link"
                  >
                    Back to PIN
                  </a>
                </p>
              </div>
            </v-card>

            <p class="footer-text">© {{ year }} Fieldseasy</p>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import crypto from "crypto-js";
import BaseButton from "@/components/common/buttons/BaseButton.vue"; // IMPORT

// PROPS
const props = defineProps({
  contactType: { type: String, required: true },
  contactValue: { type: String, required: true },
});

const route = useRoute();
const router = useRouter();

// CONSTANTS
const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const STEP = {
  ENTER_PIN: 1,
  VERIFY_OTP: 2,
  CREATE_PIN: 3,
};

// REACTIVE STATE
const pinDigits = ref(Array(4).fill(""));
const otpDigits = ref(Array(6).fill(""));
const newPinDigits = ref(Array(4).fill(""));
const currentPin = ref("");
const currentNewPin = ref("");
const loading = ref(false);
const error = ref("");
const successMessage = ref("");
const currentStep = ref(STEP.ENTER_PIN);
const isConfirmingPin = ref(false);
const tempPin = ref("");
const attempts = ref(0);
const userPhone = ref("");
const userEmail = ref("");
const displayPhone = ref("");
const userId = ref(null);
const userPin = ref(null);
const showPin = ref(false);
const focusedIndex = ref(-1);
const otpFocusedIndex = ref(-1);
const newPinFocusedIndex = ref(-1);
const pinFields = ref([]);
const otpFields = ref([]);
const newPinFields = ref([]);
const year = ref(new Date().getFullYear());
const errorTimeout = ref(null);
const successTimeout = ref(null);
const isFirstTime = ref(false);
const maxAttemptsReached = ref(false);

// COMPUTED
const isValidPin = computed(() => pinDigits.value.every((d) => d !== ""));
const isValidOtp = computed(() => otpDigits.value.every((d) => d !== ""));
const isValidNewPin = computed(() => newPinDigits.value.every((d) => d !== ""));

const pageTitle = computed(() =>
  currentStep.value === STEP.ENTER_PIN
    ? maxAttemptsReached.value
      ? "Reset Your PIN"
      : "Secure PIN verification"
    : currentStep.value === STEP.VERIFY_OTP
      ? "Enter OTP"
      : "Create New PIN",
);
const pageHeader = computed(() =>
  currentStep.value === STEP.ENTER_PIN
    ? maxAttemptsReached.value
      ? "Reset PIN Required"
      : "Enter Your PIN"
    : currentStep.value === STEP.VERIFY_OTP
      ? "Verify OTP"
      : isConfirmingPin.value
        ? "Confirm PIN"
        : isFirstTime.value
          ? "Set Up Your PIN"
          : "Create Your PIN",
);
const visibleSteps = computed(() => [STEP.VERIFY_OTP, STEP.CREATE_PIN]);
const contactType = computed(() => (userEmail.value ? "Email" : "Phone"));
const userContact = computed(() => userEmail.value || userPhone.value);
const displayContact = computed(() =>
  userEmail.value ? userEmail.value : displayPhone.value,
);

// Background style
const backgroundStyle = computed(() => ({
  backgroundImage: `url('/public/images/loginimage.png')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
}));

/* ------------------------------------------------------------------ */
/* INPUT HANDLERS – ONLY MOVE FOCUS, NO AUTO‑SUBMIT                     */
/* ------------------------------------------------------------------ */
function handlePinDigitInput(index) {
  pinDigits.value[index] = pinDigits.value[index].replace(/[^0-9]/g, "");
  currentPin.value = pinDigits.value.join("");

  if (pinDigits.value[index] && index < 3) {
    nextTick(() => pinFields.value[index + 1]?.focus());
  }
}

function handleOtpInput(index) {
  otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, "");
  if (otpDigits.value[index] && index < 5) {
    nextTick(() => otpFields.value[index + 1]?.focus());
  }
}

function handleNewPinDigitInput(index) {
  newPinDigits.value[index] = newPinDigits.value[index].replace(/[^0-9]/g, "");
  currentNewPin.value = newPinDigits.value.join("");

  if (newPinDigits.value[index] && index < 3) {
    nextTick(() => newPinFields.value[index + 1]?.focus());
  }
}

/* ------------------------------------------------------------------ */
/* KEYDOWN HANDLERS – SUBMIT ONLY ON ENTER (when form is valid)        */
/* ------------------------------------------------------------------ */
function handlePinKeydown(event, index) {
  if (event.key === "Backspace" && !pinDigits.value[index] && index > 0) {
    nextTick(() => pinFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidPin.value && !maxAttemptsReached.value) {
    handlePinAction();
  }
}

function handleOtpKeydown(event, index) {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    nextTick(() => otpFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidOtp.value) {
    verifyForgotPinOtp();
  }
}

function handleNewPinKeydown(event, index) {
  if (event.key === "Backspace" && !newPinDigits.value[index] && index > 0) {
    nextTick(() => newPinFields.value[index - 1]?.focus());
  }

  if (event.key === "Enter" && isValidNewPin.value) {
    handleNewPinAction();
  }
}

/* ------------------------------------------------------------------ */
/* SCROLL TO CARD (used after every button click)                     */
/* ------------------------------------------------------------------ */
function scrollToCard() {
  nextTick(() => {
    const card = document.querySelector(".login-card");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ------------------------------------------------------------------ */
/* UTILS (unchanged)                                                 */
/* ------------------------------------------------------------------ */
function formatPhoneForAPI(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  return clean.length === 10 ? `+91${clean}` : `+91${clean}`;
}
function formatPhoneForDisplay(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("91") && clean.length === 12) clean = clean.slice(2);
  return clean.length === 10
    ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`
    : `+91 ${clean}`;
}
function prepareForgotPinPayload() {
  return props.contactType === "email"
    ? { email: userEmail.value, userApp: "fieldeasy" }
    : { phone: formatPhoneForAPI(userPhone.value), userApp: "fieldeasy" };
}
function checkIfEncrypted(text) {
  if (!text || typeof text !== "string") return false;
  const [iv, ct] = text.split(":");
  const hex = /^[0-9a-fA-F]+$/;
  return iv && ct && hex.test(iv) && hex.test(ct);
}
function encryptData(plain) {
  const iv = crypto.lib.WordArray.random(16);
  const key = crypto.enc.Hex.parse(ENCRYPTION_KEY);
  const encrypted = crypto.AES.encrypt(plain, key, {
    iv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7,
  });
  return `${iv.toString(crypto.enc.Hex)}:${encrypted.ciphertext.toString(crypto.enc.Hex)}`;
}
function decryptData(enc) {
  try {
    if (!enc || typeof enc !== "string") return enc || "";
    if (!checkIfEncrypted(enc)) return enc;
    const [ivHex, ctHex] = enc.split(":");
    const iv = crypto.enc.Hex.parse(ivHex);
    const key = crypto.enc.Hex.parse(ENCRYPTION_KEY);
    const cipherParams = crypto.lib.CipherParams.create({
      ciphertext: crypto.enc.Hex.parse(ctHex),
    });
    return crypto.AES.decrypt(cipherParams, key, {
      iv,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7,
    }).toString(crypto.enc.Utf8);
  } catch (e) {
    console.error("Decrypt error:", e);
    return enc;
  }
}
function clearError() {
  error.value = "";
  if (errorTimeout.value) clearTimeout(errorTimeout.value);
}
function clearSuccessMessage() {
  successMessage.value = "";
  if (successTimeout.value) clearTimeout(successTimeout.value);
}
function setSuccessMessage(msg) {
  clearSuccessMessage();
  successMessage.value = msg;
  successTimeout.value = setTimeout(() => (successMessage.value = ""), 3000);
}
function setErrorMessage(msg) {
  clearError();
  error.value = msg;
  errorTimeout.value = setTimeout(() => (error.value = ""), 5000);
}
function goToAlternateLogin() {
  router.push("/alternate-login");
}
function goBack() {
  if (currentStep.value === STEP.CREATE_PIN && isConfirmingPin.value) {
    isConfirmingPin.value = false;
    newPinDigits.value = Array(4).fill("");
  } else if (currentStep.value === STEP.CREATE_PIN) {
    currentStep.value = STEP.VERIFY_OTP;
    otpDigits.value = Array(6).fill("");
    nextTick(() => otpFields.value[0]?.focus());
  } else if (currentStep.value === STEP.VERIFY_OTP) {
    resetToPinEntry();
  }
}
function resetPinOnlyMode() {
  maxAttemptsReached.value = false;
  attempts.value = 0;
  pinDigits.value = Array(4).fill("");
}

/* ------------------------------------------------------------------ */
/* API FLOWS (loading flag is set before each request)                */
/* ------------------------------------------------------------------ */
async function startForgotPinFlow() {
  loading.value = true;
  try {
    if (props.contactType === "email") {
      userEmail.value = props.contactValue;
      userPhone.value = "";
      displayPhone.value = "";
    } else {
      userPhone.value = props.contactValue;
      displayPhone.value = formatPhoneForDisplay(
        userPhone.value.replace("+91", ""),
      );
    }
    await authService.forgotPin(prepareForgotPinPayload());
    currentStep.value = STEP.VERIFY_OTP;
    setSuccessMessage(`OTP sent to ${displayContact.value}`);
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } catch (e) {
    setErrorMessage(e.response?.data?.message || "Failed to send OTP");
  } finally {
    loading.value = false;
  }
}

async function verifyForgotPinOtp() {
  loading.value = true;
  scrollToCard();
  try {
    const payload = prepareForgotPinPayload();
    payload.otp = otpDigits.value.join("");
    const res = await authService.verifyForgotPinOtp(payload);
    if (res.success) {
      setSuccessMessage("OTP verified! Create new PIN");
      currentStep.value = STEP.CREATE_PIN;
      isConfirmingPin.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
    }
  } catch (e) {
    setErrorMessage(e.response?.data?.message || "Invalid OTP");
    otpDigits.value = Array(6).fill("");
    await authService.forgotPin(prepareForgotPinPayload());
    setSuccessMessage(`New OTP sent to ${displayContact.value}`);
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } finally {
    loading.value = false;
  }
}

async function resendOtp() {
  loading.value = true;
  scrollToCard();
  try {
    await authService.forgotPin(prepareForgotPinPayload());
    setSuccessMessage(`New OTP sent to ${displayContact.value}`);
    otpDigits.value = Array(6).fill("");
    nextTick(() => {
      otpFields.value[0]?.focus();
      scrollToCard();
    });
  } catch (e) {
    setErrorMessage("Failed to resend OTP");
  } finally {
    loading.value = false;
  }
}

async function handleNewPinAction() {
  loading.value = true;
  scrollToCard();
  try {
    if (!isConfirmingPin.value) {
      tempPin.value = newPinDigits.value.join("");
      isConfirmingPin.value = true;
      newPinDigits.value = Array(4).fill("");
      setSuccessMessage("Please re‑enter your PIN to confirm");
      loading.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
      return;
    }
    if (newPinDigits.value.join("") !== tempPin.value) {
      setErrorMessage("PINs do not match, please try again");
      newPinDigits.value = Array(4).fill("");
      isConfirmingPin.value = false;
      tempPin.value = "";
      loading.value = false;
      nextTick(() => {
        newPinFields.value[0]?.focus();
        scrollToCard();
      });
      return;
    }
    await savePin(newPinDigits.value.join(""));
    const userData =
      props.contactType === "email"
        ? await authService.getUserByEmail(userEmail.value)
        : await authService.getUserByPhone(userPhone.value);
    authService.setUserData(userData);
    authService.setPinVerified(true);
    setSuccessMessage(`PIN created successfully! Redirecting...`);
    setTimeout(() => router.push("/taskManagement/taskcomponents"), 2000);
  } catch (e) {
    setErrorMessage(e.message || "Failed to create PIN");
  } finally {
    loading.value = false;
  }
}

function resetToPinEntry() {
  currentStep.value = STEP.ENTER_PIN;
  pinDigits.value = Array(4).fill("");
  attempts.value = 0;
  otpDigits.value = Array(6).fill("");
  newPinDigits.value = Array(4).fill("");
  currentNewPin.value = "";
  maxAttemptsReached.value = false;
  nextTick(() => {
    pinFields.value[0]?.focus();
    scrollToCard();
  });
}

async function checkUserPin() {
  try {
    let user;
    if (props.contactType === "email") {
      userEmail.value = props.contactValue;
      user = await authService.getUserByEmail(userEmail.value);
    } else {
      userPhone.value = props.contactValue;
      displayPhone.value = formatPhoneForDisplay(
        userPhone.value.replace("+91", ""),
      );
      user = await authService.getUserByPhone(userPhone.value);
    }
    if (user) {
      userId.value = user.id;
      userPin.value = user.userPin;
      return !!user.userPin;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* FIXED: handlePinAction – now shows loading spinner correctly       */
/* ------------------------------------------------------------------ */
async function handlePinAction() {
  loading.value = true;
  scrollToCard();

  try {
    await verifyPin();
  } finally {
    loading.value = false;
  }
}

async function verifyPin() {
  try {
    let dbPin = userPin.value || "";
    dbPin = checkIfEncrypted(dbPin)
      ? decryptData(dbPin).trim()
      : dbPin.toString().trim();

    if (currentPin.value === dbPin) {
      setSuccessMessage("PIN verified successfully");
      authService.setPinVerified(true);
      setTimeout(() => router.push("/taskManagement/taskcomponents"), 1500);
      return;
    }

    attempts.value++;
    if (attempts.value >= 3) {
      maxAttemptsReached.value = true;
      setErrorMessage("Maximum attempts reached. Please reset your PIN.");
      pinDigits.value = Array(4).fill("");
    } else {
      setErrorMessage(
        `Incorrect PIN. ${3 - attempts.value} attempts remaining.`,
      );
      pinDigits.value = Array(4).fill("");
    }
  } catch (e) {
    setErrorMessage("Failed to verify PIN. Please try again.");
    pinDigits.value = Array(4).fill("");
  }
}

async function savePin(pin) {
  if (!userId.value) throw new Error("User ID not found");
  const encrypted = encryptData(pin);
  const { status } = await authService.protectedApi.patch(
    `/users/${userId.value}`,
    { userPin: encrypted },
  );
  if (status !== 200) throw new Error("Failed to save PIN");
}

/* ------------------------------------------------------------------ */
/* LIFECYCLE                                                          */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  const fromReset = route.query.fromPinReset === true;
  if (fromReset) {
    authService.setPinVerified(true);
    await nextTick();
    router.push("/taskManagement/taskcomponents");
    return;
  }

  const hasPin = await checkUserPin();
  if (!hasPin) {
    isFirstTime.value = true;
    currentStep.value = STEP.CREATE_PIN;
    nextTick(() => {
      newPinFields.value[0]?.focus();
      scrollToCard();
    });
  } else {
    nextTick(() => {
      pinFields.value[0]?.focus();
      scrollToCard();
    });
  }
});

onBeforeUnmount(() => {
  if (errorTimeout.value) clearTimeout(errorTimeout.value);
  if (successTimeout.value) clearTimeout(successTimeout.value);
});
</script>

<style scoped>
/* pinVerification.css */
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

/* Logo section styling - SAME */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-image {
  height: 130px;
  width: auto;
}

/* Card header styling - SAME */
.card-header {
  text-align: center;
}

/* Sub header styling - SAME */
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

/* Card content styling - SAME */
.card-content {
  padding: 20px 24px;
  background: white;
  margin-bottom: 250px;
}

/* Form section styling - SAME */
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

.gap-2 {
  gap: 8px;
}

/* PIN CONTAINER WITH EYE ON RIGHT */
.pin-container {
  gap: 8px !important;
  align-items: center !important;
}

/* ALL PIN DIGIT BOXES - SAME STYLE */
.pin-digit-input {
  flex: 0 0 50px !important;
  max-width: 50px !important;
  min-width: 40px !important;
}

.pin-digit-input :deep(.v-field) {
  height: 40px !important;
  padding: 0 !important;
}

.pin-digit-input :deep(.v-field__input) {
  text-align: center !important;
  font-size: 16px !important;
  padding: 0 4px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.pin-digit-input.filled :deep(.v-field__outline) {
  border-color: #059669 !important;
}

.pin-digit-input :deep(.v-field__outline) {
  border-width: 1px !important;
}

/* OTP INPUT FIELDS */
.otp-input-field {
  flex: 0 0 50px !important;
  max-width: 50px !important;
  min-width: 40px !important;
}

.otp-input-field :deep(.v-field) {
  height: 40px !important;
  padding: 0 !important;
}

.otp-input-field :deep(.v-field__input) {
  text-align: center !important;
  font-size: 16px !important;
  padding: 0 4px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.otp-input-field.filled :deep(.v-field__outline) {
  border-color: #059669 !important;
}

.otp-input-field :deep(.v-field__outline) {
  border-width: 1px !important;
}

/* PIN EYE ICON ON RIGHT SIDE */
.pin-eye-icon-right {
  cursor: pointer !important;
  transition: color 0.3s ease !important;
  flex-shrink: 0 !important;
  align-self: center !important;
}

.pin-eye-icon-right:hover {
  color: #059669 !important;
}

.help-text {
  font-size: 12px;
  color: #999;
  margin-top: 30px;
  text-align: center;
}

.ml-1 {
  margin-left: 4px;
}

/* Submit button styling - SAME */
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

/* RESET BUTTON STYLE */
.reset-btn {
  background: #fc5354 !important;
  margin-top: 16px !important;
}

.reset-btn:hover:not(:disabled) {
  background: #d32f2f !important;
  box-shadow: 0 6px 16px rgba(252, 83, 84, 0.4) !important;
}

/* Signup text styling - SAME */
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
  transition: all 0.3s Ease;
}

/* MOBILE - PLAIN WHITE BACKGROUND + CENTERED - SAME AS LOGIN */
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
    margin-bottom: 60px;
  }

  .otp-input-field {
    flex: 0 0 40px !important;
    max-width: 40px !important;
    min-width: 35px !important;
  }

  .pin-digit-input {
    flex: 0 0 40px !important;
    max-width: 40px !important;
    min-width: 35px !important;
  }

  .pin-eye-icon-right {
    font-size: 18px !important;
  }
}

@media (max-width: 768px) {
  .background-container {
    background: #ffffff !important;
    background-image: none !important;
  }

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

  .otp-input-field {
    flex: 0 0 35px !important;
    max-width: 35px !important;
    min-width: 30px !important;
  }

  .pin-digit-input {
    flex: 0 0 35px !important;
    max-width: 35px !important;
    min-width: 30px !important;
  }

  .pin-eye-icon-right {
    font-size: 16px !important;
  }
}

@media (max-width: 480px) {
  .background-container {
    background: #ffffff !important;
    background-image: none !important;
  }

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

  .otp-input-field {
    flex: 0 0 30px !important;
    max-width: 30px !important;
    min-width: 25px !important;
  }

  .otp-input-field :deep(.v-field__input) {
    font-size: 14px !important;
    padding: 0 2px !important;
  }

  .pin-digit-input {
    flex: 0 0 30px !important;
    max-width: 30px !important;
    min-width: 25px !important;
  }

  .pin-digit-input :deep(.v-field__input) {
    font-size: 14px !important;
    padding: 0 2px !important;
  }

  .pin-eye-icon-right {
    font-size: 14px !important;
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
