<template>
  <div class="verification-wrapper">
    <div class="verification-container">
      <!-- Left side with Lottie animation -->
      <div class="left-side">
        <div class="brand-container">
          <h2 class="brand-name">FieldsEasy</h2>
          <div class="brand-tagline">Secure verification process</div>
        </div>
        <div class="animation-wrapper">
          <dotlottie-player
            src="https://lottie.host/e4dafee6-4b5c-4185-bd27-5e968b34789b/XGfDOe4uzv.lottie"
            background="transparent"
            speed="1"
            class="lottie-player"
            loop
            autoplay
          ></dotlottie-player>
        </div>
        <div class="features">
          <div class="feature-item">
            <i class="fas fa-shield-alt"></i>
            <span>Secure OTP Verification</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-mobile-alt"></i>
            <span>SMS Code Delivery</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-lock"></i>
            <span>Protected Access</span>
          </div>
        </div>
      </div>

      <!-- Right side with verification form -->
      <div class="right-side">
        <div class="form-container">
          <div class="form-header">
            <h4 class="form-title">Verify Your Number</h4>
            <p class="form-subtitle">
              Enter the 6-digit code sent to {{ phoneNumber }}
            </p>
          </div>

          <div class="verification-form">
            <transition name="fade">
              <div v-if="error" class="error-alert">
                <i class="fas fa-exclamation-circle error-icon"></i>
                <span class="error-message">{{ error }}</span>
                <button @click="clearError" class="error-close-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </transition>

            <div class="input-group">
              <label class="input-label">Verification Code</label>
              <div class="otp-container">
                <div
                  v-for="(digit, index) in 6"
                  :key="index"
                  class="otp-input-wrapper"
                  :class="{
                    filled: otpDigits[index],
                    focused: focusedIndex === index,
                  }"
                >
                  <input
                    type="text"
                    v-model="otpDigits[index]"
                    maxlength="1"
                    class="otp-input"
                    @input="handleInput(index)"
                    @keydown="handleKeydown($event, index)"
                    @focus="focusedIndex = index"
                    @blur="focusedIndex = -1"
                    ref="otpFields"
                  />
                </div>
              </div>
            </div>

            <button
              class="verify-btn"
              :class="{ disabled: !isValidOtp }"
              :disabled="!isValidOtp || loading"
              @click="verifyCode"
            >
              <span v-if="!loading" class="btn-text">Verify Code</span>
              <span v-if="!loading" class="btn-icon">
                <i class="fas fa-check"></i>
              </span>
              <span v-if="loading" class="loading-spinner"></span>
            </button>

            <div class="resend-container">
              <p class="resend-text">
                Didn't receive the code?
                <button
                  class="resend-link"
                  :class="{ disabled: timer > 0 }"
                  @click="resendCode"
                  :disabled="timer > 0"
                >
                  {{ timer > 0 ? `Resend in ${formatTime()}` : "Resend Code" }}
                </button>
              </p>
            </div>

            <button @click="goBackToLogin" class="back-btn">
              <i class="fas fa-arrow-left"></i>
              Back to Login
            </button>

            <div class="version-info">(version: V25.05.02.2)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authService } from "@/services/authService";

export default {
  name: "Verification",
  data() {
    return {
      otpDigits: Array(6).fill(""),
      loading: false,
      error: "",
      timer: 30,
      timerInterval: null,
      focusedIndex: -1,
    };
  },

  computed: {
    isValidOtp() {
      return this.otpDigits.every((digit) => digit !== "");
    },

    phoneNumber() {
      return (
        localStorage.getItem("userPhone") || this.$route.params.phoneNumber
      );
    },
  },

  methods: {
    handleInput(index) {
      this.otpDigits[index] = this.otpDigits[index].replace(/[^0-9]/g, "");

      if (this.otpDigits[index] && index < 5) {
        this.$refs.otpFields[index + 1].focus();
      }
    },

    handleKeydown(event, index) {
      if (event.key === "Backspace" && !this.otpDigits[index] && index > 0) {
        this.$refs.otpFields[index - 1].focus();
      }
    },

    clearError() {
      this.error = "";
    },

    goBackToLogin() {
      this.$router.push("/login");
    },

    async verifyCode() {
      this.loading = true;
      this.error = "";

      try {
        const sessionUuid = localStorage.getItem("sessionUuid");
        const phone = localStorage.getItem("userPhone");

        if (!sessionUuid || !phone) {
          this.$router.push("/login");
          throw new Error(
            "Missing session information. Please try logging in again.",
          );
        }

        const enteredOtp = this.otpDigits.join("");

        if (!enteredOtp || enteredOtp.length !== 6) {
          throw new Error("Please enter a valid 6-digit OTP.");
        }

        const verificationResponse = await authService
          .verifyOtp(enteredOtp, sessionUuid, phone)

          .catch((error) => {
            if (error.response && error.response.status === 400) {
              if (error.response.data.error === "session validation failed") {
                throw new Error(
                  "Invalid or expired verification code. Please request a new one.",
                );
              }
              throw new Error(
                "Bad request. Please check your input and try again.",
              );
            }
            throw error;
          });
        this.$router.push("/taskManagement/taskcomponents");
        if (verificationResponse.token) {
          authService.setToken(verificationResponse.token);
          localStorage.setItem("userPhone", phone);
        } else {
          throw new Error(
            "Verification failed. Invalid or expired verification code.",
          );
        }
      } catch (error) {
        this.error =
          error.message ||
          "An error occurred during verification. Please try again.";
        this.otpDigits = Array(6).fill("");
        this.$nextTick(() => {
          this.$refs.otpFields[0].focus();
        });
      } finally {
        this.loading = false;
      }
    },

    async resendCode() {
      if (this.timer > 0) {
        return;
      }

      this.loading = true;
      this.error = "";

      try {
        const phoneNumber = this.phoneNumber;

        const otpResponse = await authService.generateOtp(phoneNumber);

        if (otpResponse.otp_session_uuid) {
          localStorage.setItem("sessionUuid", otpResponse.otp_session_uuid);
          localStorage.setItem("userPhone", phoneNumber);

          this.otpDigits = Array(6).fill("");
          this.$nextTick(() => {
            this.$refs.otpFields[0].focus();
          });

          this.startTimer();
          // Show success message briefly
          this.error = "New verification code has been sent!";
          setTimeout(() => {
            this.error = "";
          }, 3000);
        } else {
          throw new Error("Failed to generate OTP. Please try again.");
        }
      } catch (error) {
        this.error =
          error.message || "Failed to resend code. Please try again.";
      } finally {
        this.loading = false;
      }
    },

    startTimer() {
      this.timer = 30;
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.timerInterval);
        }
      }, 1000);
    },

    formatTime() {
      const minutes = Math.floor(this.timer / 60);
      const seconds = this.timer % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    },
  },

  mounted() {
    this.startTimer();
    this.$nextTick(() => {
      if (this.$refs.otpFields && this.$refs.otpFields[0]) {
        this.$refs.otpFields[0].focus();
      }
    });
  },

  beforeDestroy() {
    clearInterval(this.timerInterval);
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

.verification-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e, #3949ab, #1976d2);
  background-size: 400% 400%;
  animation: gradientBackground 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: "Poppins", sans-serif;
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.verification-container {
  display: flex;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: containerFadeIn 0.8s ease-out;
  position: relative;
}

@keyframes containerFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.left-side {
  flex: 1;
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  color: white;
  position: relative;
  overflow: hidden;
}

.left-side::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  animation: pulseEffect 15s infinite linear;
  z-index: 1;
}

@keyframes pulseEffect {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.brand-container {
  position: relative;
  z-index: 2;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.brand-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-tagline {
  font-size: 1.1rem;
  font-weight: 300;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.animation-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  animation: fadeIn 1s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.lottie-player {
  width: 100%;
  max-width: 400px;
  height: auto;
}

.features {
  margin-top: 2rem;
  position: relative;
  z-index: 2;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  animation: slideRight 0.5s ease-out both;
}

.feature-item:nth-child(1) {
  animation-delay: 0.6s;
}
.feature-item:nth-child(2) {
  animation-delay: 0.8s;
}
.feature-item:nth-child(3) {
  animation-delay: 1s;
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-item i {
  color: #64b5f6;
  margin-right: 10px;
  font-size: 1.2rem;
}

.right-side {
  flex: 1;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  position: relative;
}

.form-container {
  width: 100%;
  max-width: 400px;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1565c0;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #546e7a;
  font-size: 1rem;
  line-height: 1.5;
}

.verification-form {
  animation: fadeIn 0.8s ease-out 0.5s both;
}

.input-group {
  margin-bottom: 2rem;
}

.input-label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 500;
  color: #455a64;
  font-size: 0.9rem;
  text-align: center;
}

.error-alert {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border: 1px solid #ef5350;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  animation: slideDown 0.3s ease-out;
}

.error-icon {
  color: #d32f2f;
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.error-message {
  color: #d32f2f;
  font-size: 0.9rem;
  flex: 1;
}

.error-close-btn {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.error-close-btn:hover {
  background-color: rgba(211, 47, 47, 0.1);
}

.otp-container {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.otp-input-wrapper {
  position: relative;
  width: 50px;
  height: 60px;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.otp-input-wrapper.filled {
  border-color: #1976d2;
  background: #e3f2fd;
  transform: scale(1.05);
}

.otp-input-wrapper.focused {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  background: #e3f2fd;
}

.otp-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  color: #1565c0;
  outline: none;
  border-radius: 10px;
}

.verify-btn {
  width: 100%;
  background: linear-gradient(to right, #1976d2, #1565c0);
  color: white;
  border: none;
  border-radius: 12px;
  height: 52px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(21, 101, 192, 0.3);
  position: relative;
  overflow: hidden;
}

.verify-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: all 0.6s ease;
}

.verify-btn:hover::before {
  left: 100%;
}

.verify-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(21, 101, 192, 0.4);
}

.verify-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.2);
}

.btn-text {
  margin-right: 0.25rem;
}

.btn-icon {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.verify-btn:hover:not(.disabled) .btn-icon {
  transform: translateX(2px);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.resend-container {
  margin-top: 2rem;
  text-align: center;
}

.resend-text {
  color: #546e7a;
  font-size: 0.95rem;
  margin: 0;
}

.resend-link {
  background: none;
  border: none;
  color: #1976d2;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
  padding: 0.25rem 0;
}

.resend-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #1976d2;
  transition: width 0.3s ease;
}

.resend-link:hover:not(.disabled) {
  color: #1565c0;
}

.resend-link:hover:not(.disabled)::after {
  width: 100%;
}

.resend-link.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #90a4ae;
}

.back-btn {
  width: 100%;
  background: transparent;
  color: #546e7a;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  height: 48px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.back-btn:hover {
  background-color: #f5f5f5;
  border-color: #bdbdbd;
  color: #424242;
}

.back-btn i {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.back-btn:hover i {
  transform: translateX(-2px);
}

.version-info {
  text-align: center;
  color: #90a4ae;
  font-size: 0.8rem;
  margin-top: 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .verification-container {
    flex-direction: column;
    min-height: auto;
  }

  .left-side {
    padding: 2rem;
  }

  .right-side {
    padding: 2rem;
  }

  .brand-name {
    font-size: 2rem;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .features {
    display: none;
  }

  .otp-container {
    gap: 0.5rem;
  }

  .otp-input-wrapper {
    width: 45px;
    height: 55px;
  }
}

@media (max-width: 600px) {
  .verification-wrapper {
    padding: 1rem;
  }

  .verification-container {
    border-radius: 16px;
  }

  .left-side {
    padding: 1.5rem;
  }

  .right-side {
    padding: 1.5rem;
  }

  .brand-name {
    font-size: 1.75rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .otp-container {
    gap: 0.4rem;
  }

  .otp-input-wrapper {
    width: 40px;
    height: 50px;
  }

  .otp-input {
    font-size: 1.25rem;
  }
}
</style>
