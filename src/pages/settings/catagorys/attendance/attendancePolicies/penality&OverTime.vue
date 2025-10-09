<!-- my senzrgo panelity.vue  -->
<template>
  <div class="penalty-settings-container">
    <ToastNotification
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
    <!-- Content -->
    <div class="content">
      <!-- General Settings -->
      <div class="policy-card">
        <div class="policy-header">
          <div class="policy-title">
            <div class="policy-icon general">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
              </svg>
            </div>
            <span>General Settings</span>
          </div>
          <div class="header-actions">
            <button
              v-if="!isEditing"
              @click="toggleEditing"
              class="btn btn-primary"
            >
              <svg
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
            <template v-else>
              <button @click="cancelEdit" class="btn btn-secondary">
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </button>
              <button @click="saveChanges" class="btn btn-primary">
                <svg
                  class="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                  />
                  <polyline points="17,21 17,13 7,13 7,21" />
                  <polyline points="7,3 7,8 15,8" />
                </svg>
                Save Changes
              </button>
            </template>
          </div>
        </div>
        <div class="policy-content">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Location Centric</div>
              <div class="setting-description">
                Enable location-based attendance tracking
              </div>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                v-model="generalSettings.locationCentric"
                :disabled="!isEditing"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <!-- Added Total Working Hours field below Location Centric -->
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Total Working Hours</div>
              <div class="setting-description">
                Set maximum working hours per day (max 9 hours)
              </div>
            </div>
            <div class="hours-input-wrapper">
              <input
                type="number"
                v-model="generalSettings.totalWorkingHours"
                :disabled="!isEditing"
                class="form-input hours-input"
                min="1"
                max="9"
                placeholder="9"
              />
              <span class="hours-suffix">hours</span>
              <div v-if="errors.totalWorkingHours" class="error-message">
                {{ errors.totalWorkingHours }}
              </div>
            </div>
          </div>
          <!-- <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Calculate Within Break</div>
              <div class="setting-description">
                Include break time in penalty calculations
              </div>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                v-model="generalSettings.calculate_WithInBreak"
                :disabled="!isEditing"
              />
              <span class="toggle-slider"></span>
            </label>
          </div> -->
        </div>
      </div>

      <!-- Late Coming Policy -->
      <div class="policy-card">
        <div class="policy-header">
          <div class="policy-title">
            <div class="policy-icon late-coming">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <span>Late Coming Policy</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              v-model="lateComing.enabled"
              :disabled="!isEditing"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div v-if="lateComing.enabled" class="policy-content">
          <div class="policy-type-section">
            <div class="section-label">POLICY TYPE</div>
            <div class="policy-type-buttons">
              <button
                v-for="type in ['fixed', 'leave', 'lop']"
                :key="type"
                @click="!isEditing || (lateComing.penaltyType = type)"
                :class="[
                  'policy-type-btn',
                  { active: lateComing.penaltyType === type },
                ]"
                :disabled="!isEditing"
              >
                {{
                  type === "fixed"
                    ? "Fixed Amount"
                    : type === "leave"
                      ? "Leave"
                      : "LOP"
                }}
              </button>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Grace Period (minutes)</label>
              <input
                type="number"
                v-model="lateComing.gracePeriod"
                :disabled="!isEditing"
                class="form-input"
                max="360"
              />
              <div v-if="errors.lateGracePeriod" class="error-message">
                {{ errors.lateGracePeriod }}
              </div>
            </div>
            <!-- Modified deduction type handling for LOP with custom option and help icon -->
            <div class="form-group">
              <label class="form-label">
                {{
                  lateComing.penaltyType === "fixed"
                    ? "Deduction Type"
                    : "Deduction Type"
                }}
              </label>
              <select
                v-if="lateComing.penaltyType === 'fixed'"
                v-model="lateComing.deductionType"
                :disabled="!isEditing"
                class="form-select"
              >
                <option value="Custom Multiplier">Custom Multiplier</option>
                <option value="Fixed Hourly Rate">Fixed Hourly Rate</option>
              </select>
              <!-- For LOP, show only custom option with help icon -->
              <div
                v-else-if="lateComing.penaltyType === 'lop'"
                class="custom-lop-wrapper"
              >
                <div class="custom-lop-field">
                  <span class="custom-lop-text">Fixed</span>
                  <button
                    type="button"
                    @click="showLopHelpModal = true"
                    class="help-icon-btn"
                    :disabled="!isEditing"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
              <select
                v-else-if="lateComing.penaltyType === 'leave'"
                v-model="lateComing.leaveType"
                :disabled="!isEditing"
                class="form-select"
              >
                <option
                  v-for="leave in leaveOptions"
                  :key="leave.value"
                  :value="leave.value"
                >
                  {{ leave.title }}
                </option>
              </select>
            </div>
            <!-- Added fine amount field for fixed penalty type -->
            <div class="form-group" v-if="lateComing.penaltyType === 'fixed'">
              <label class="form-label">
                {{
                  lateComing.deductionType === "Custom Multiplier"
                    ? "Custom Multiplier (× Hourly Salary)"
                    : "Fixed Rate (₹ per hour)"
                }}
              </label>
              <input
                type="number"
                v-model="lateComing.fineAmount"
                :disabled="!isEditing"
                class="form-input"
                :placeholder="
                  lateComing.deductionType === 'Fixed Hourly Rate' ? '₹' : 'X'
                "
              />
            </div>
            <div class="form-group">
              <label class="form-label">Waive Off Days</label>
              <input
                type="number"
                v-model="lateComing.waiveOffDays"
                :disabled="!isEditing"
                class="form-input"
                min="3"
              />
              <span class="form-suffix">days</span>
              <div v-if="errors.lateWaiveOffDays" class="error-message">
                {{ errors.lateWaiveOffDays }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Early Leaving Policy -->
      <div class="policy-card">
        <div class="policy-header">
          <div class="policy-title">
            <div class="policy-icon early-leaving">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4" />
                <path
                  d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.08 2.38"
                />
              </svg>
            </div>
            <span>Early Leaving Policy</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              v-model="earlyLeaving.enabled"
              :disabled="!isEditing"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div v-if="earlyLeaving.enabled" class="policy-content">
          <div class="policy-type-section">
            <div class="section-label">POLICY TYPE</div>
            <div class="policy-type-buttons">
              <button
                v-for="type in ['fixed', 'leave', 'lop']"
                :key="type"
                @click="!isEditing || (earlyLeaving.penaltyType = type)"
                :class="[
                  'policy-type-btn',
                  { active: earlyLeaving.penaltyType === type },
                ]"
                :disabled="!isEditing"
              >
                {{
                  type === "fixed"
                    ? "Fixed Amount"
                    : type === "leave"
                      ? "Leave"
                      : "LOP"
                }}
              </button>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Grace Period (minutes)</label>
              <input
                type="number"
                v-model="earlyLeaving.gracePeriod"
                :disabled="!isEditing"
                class="form-input"
                max="360"
              />
              <div v-if="errors.earlyGracePeriod" class="error-message">
                {{ errors.earlyGracePeriod }}
              </div>
            </div>
            <!-- Modified early leaving deduction type handling for LOP with custom option -->
            <div class="form-group">
              <label class="form-label">
                {{
                  earlyLeaving.penaltyType === "fixed"
                    ? "Deduction Type"
                    : "Deduction Type"
                }}
              </label>
              <select
                v-if="earlyLeaving.penaltyType === 'fixed'"
                v-model="earlyLeaving.deductionType"
                :disabled="!isEditing"
                class="form-select"
              >
                <option value="Custom Multiplier">Custom Multiplier</option>
                <option value="Fixed Hourly Rate">Fixed Hourly Rate</option>
              </select>
              <!-- For LOP, show only custom option with help icon -->
              <div
                v-else-if="earlyLeaving.penaltyType === 'lop'"
                class="custom-lop-wrapper"
              >
                <div class="custom-lop-field">
                  <span class="custom-lop-text">Fixed</span>
                  <button
                    type="button"
                    @click="showEarlyLopHelpModal = true"
                    class="help-icon-btn"
                    :disabled="!isEditing"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
              <select
                v-else-if="earlyLeaving.penaltyType === 'leave'"
                v-model="earlyLeaving.leaveType"
                :disabled="!isEditing"
                class="form-select"
              >
                <option
                  v-for="leave in leaveOptions"
                  :key="leave.value"
                  :value="leave.value"
                >
                  {{ leave.title }}
                </option>
              </select>
            </div>
            <!-- Added fine amount field for early leaving fixed penalty -->
            <div class="form-group" v-if="earlyLeaving.penaltyType === 'fixed'">
              <label class="form-label">
                {{
                  earlyLeaving.deductionType === "Custom Multiplier"
                    ? "Custom Multiplier (× Hourly Salary)"
                    : "Fixed Rate (₹ per hour)"
                }}
              </label>
              <input
                type="number"
                v-model="earlyLeaving.fineAmount"
                :disabled="!isEditing"
                class="form-input"
                :placeholder="
                  earlyLeaving.deductionType === 'Fixed Hourly Rate' ? '₹' : 'X'
                "
              />
            </div>
            <div class="form-group">
              <label class="form-label">Waive Off Days</label>
              <input
                type="number"
                v-model="earlyLeaving.waiveOffDays"
                :disabled="!isEditing"
                class="form-input"
                min="3"
              />
              <span class="form-suffix">days</span>
              <div v-if="errors.earlyWaiveOffDays" class="error-message">
                {{ errors.earlyWaiveOffDays }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Overtime Policy -->
      <div class="policy-card">
        <div class="policy-header">
          <div class="policy-title">
            <div class="policy-icon overtime">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 8,14" />
              </svg>
            </div>
            <span>Overtime Policy</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              v-model="overtime.enabled"
              :disabled="!isEditing"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div v-if="overtime.enabled" class="policy-content">
          <div class="subsection">
            <div class="subsection-title">Working Hours OT</div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Grace Period (minutes)</label>
                <input
                  type="number"
                  v-model="overtime.gracePeriod"
                  :disabled="!isEditing"
                  class="form-input"
                />
              </div>
              <!-- Enhanced overtime pay type options -->
              <div class="form-group">
                <label class="form-label">Extra Hours Pay Type</label>
                <select
                  v-model="overtime.extraHoursType"
                  :disabled="!isEditing"
                  class="form-select"
                >
                  <option value="Custom Multiplier">Custom Multiplier</option>
                  <option value="Fixed Hourly Rate">Fixed Hourly Rate</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">
                  {{
                    overtime.extraHoursType === "Custom Multiplier"
                      ? "Custom Multiplier (× Hourly Salary)"
                      : "Fixed Rate (₹ per hour)"
                  }}
                </label>
                <input
                  type="number"
                  v-model="overtime.extraHoursPay"
                  :disabled="!isEditing"
                  class="form-input"
                  :placeholder="
                    overtime.extraHoursType === 'Fixed Hourly Rate' ? '₹' : 'X'
                  "
                />
              </div>
            </div>
          </div>
          <div class="subsection">
            <div class="subsection-title">Holiday Pay</div>
            <div class="form-grid">
              <!-- Added public holiday pay type and amount -->
              <div class="form-group">
                <label class="form-label">Public Holiday Pay Type</label>
                <select
                  v-model="overtime.publicHolidayPayType"
                  :disabled="!isEditing"
                  class="form-select"
                >
                  <option value="Custom Multiplier">Custom Multiplier</option>
                  <option value="Fixed Hourly Rate">Fixed Hourly Rate</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">
                  {{
                    overtime.publicHolidayPayType === "Custom Multiplier"
                      ? "Custom Multiplier (× Hourly Salary)"
                      : "Fixed Rate (₹ per hour)"
                  }}
                </label>
                <input
                  type="number"
                  v-model="overtime.publicHolidayPay"
                  :disabled="!isEditing"
                  class="form-input"
                  :placeholder="
                    overtime.publicHolidayPayType === 'Fixed Hourly Rate'
                      ? '₹'
                      : 'X'
                  "
                />
              </div>
            </div>
          </div>
          <div class="subsection">
            <div class="subsection-title">Week Off Pay</div>
            <div class="form-grid">
              <!-- Added week off pay type and amount -->
              <div class="form-group">
                <label class="form-label">Week Off Pay Type</label>
                <select
                  v-model="overtime.weekOffPayType"
                  :disabled="!isEditing"
                  class="form-select"
                >
                  <option value="Custom Multiplier">Custom Multiplier</option>
                  <option value="Fixed Hourly Rate">Fixed Hourly Rate</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">
                  {{
                    overtime.weekOffPayType === "Custom Multiplier"
                      ? "Custom Multiplier (× Hourly Salary)"
                      : "Fixed Rate (₹ per hour)"
                  }}
                </label>
                <input
                  type="number"
                  v-model="overtime.weekOffPay"
                  :disabled="!isEditing"
                  class="form-input"
                  :placeholder="
                    overtime.weekOffPayType === 'Fixed Hourly Rate' ? '₹' : 'X'
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Working Hours -->
      <div class="policy-card">
        <div class="policy-header">
          <div class="policy-title">
            <div class="policy-icon working-hours">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span>Working Hours</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              v-model="workingHours.enabled"
              :disabled="!isEditing"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div v-if="workingHours.enabled" class="policy-content">
          <div class="policy-type-section">
            <div class="section-label">POLICY TYPE</div>
            <div class="policy-type-buttons">
              <button
                v-for="type in ['fixed', 'leave', 'lop']"
                :key="type"
                @click="!isEditing || (workingHours.penaltyType = type)"
                :class="[
                  'policy-type-btn',
                  { active: workingHours.penaltyType === type },
                ]"
                :disabled="!isEditing"
              >
                {{
                  type === "fixed"
                    ? "Fixed Amount"
                    : type === "leave"
                      ? "Leave"
                      : "LOP"
                }}
              </button>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Minimum Working Hours</label>
              <div class="time-input-wrapper">
                <input
                  type="text"
                  v-model="workingHours.minimumHours"
                  :disabled="!isEditing"
                  class="form-input"
                  placeholder="HH:MM:SS"
                />
                <svg
                  class="time-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Working Hours Days Limit</label>
              <input
                type="number"
                v-model="workingHours.workinghrsDaysLimit"
                :disabled="!isEditing"
                class="form-input"
                min="3"
              />
              <div v-if="errors.workingHoursDaysLimit" class="error-message">
                {{ errors.workingHoursDaysLimit }}
              </div>
            </div>
            <!-- Modified working hours deduction type handling for LOP with custom option -->
            <div class="form-group">
              <label class="form-label">
                {{
                  workingHours.penaltyType === "fixed"
                    ? "Fine Type"
                    : "Deduction Type"
                }}
              </label>
              <select
                v-if="workingHours.penaltyType === 'fixed'"
                v-model="workingHours.deductionType"
                :disabled="!isEditing"
                class="form-select"
              >
                <option value="Custom Multiplier">Custom Multiplier</option>
                <option value="Fixed Hourly Rate">Fixed Hourly Rate</option>
              </select>
              <!-- For LOP, show only custom option with help icon -->
              <div
                v-else-if="workingHours.penaltyType === 'lop'"
                class="custom-lop-wrapper"
              >
                <div class="custom-lop-field">
                  <span class="custom-lop-text">Fixed</span>
                  <button
                    type="button"
                    @click="showWorkingHoursLopHelpModal = true"
                    class="help-icon-btn"
                    :disabled="!isEditing"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
              <select
                v-else-if="workingHours.penaltyType === 'leave'"
                v-model="workingHours.leaveType"
                :disabled="!isEditing"
                class="form-select"
              >
                <option
                  v-for="leave in leaveOptions"
                  :key="leave.value"
                  :value="leave.value"
                >
                  {{ leave.title }}
                </option>
              </select>
            </div>
            <!-- Added fine amount field for working hours fixed penalty -->
            <div class="form-group" v-if="workingHours.penaltyType === 'fixed'">
              <label class="form-label">
                {{
                  workingHours.deductionType === "Custom Multiplier"
                    ? "Custom Multiplier (× Hourly Salary)"
                    : "Fixed Rate (₹ per hour)"
                }}
              </label>
              <input
                type="number"
                v-model="workingHours.fineAmount"
                :disabled="!isEditing"
                class="form-input"
                :placeholder="
                  workingHours.deductionType === 'Fixed Hourly Rate' ? '₹' : 'X'
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Added help modals for LOP custom options -->
    <!-- Late Coming LOP Help Modal -->
    <div
      v-if="showLopHelpModal"
      class="modal-overlay"
      @click="showLopHelpModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Late Coming LOP Fixed Calculation</h3>
          <button @click="showLopHelpModal = false" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="calculation-rules">
            <h4>Automatic Calculation Based on Late Hours:</h4>
            <ul>
              <li>
                <strong>2 hours late:</strong> Quarter Day (0.25 day deduction)
              </li>
              <li>
                <strong>4 hours late:</strong> Half Day (0.5 day deduction)
              </li>
              <li>
                <strong>6 hours late:</strong> Three Quarter Day (0.75 day
                deduction)
              </li>
              <li>
                <strong>8+ hours late:</strong> Full Day (1.0 day deduction)
              </li>
            </ul>
            <p class="note">
              The system will automatically calculate the appropriate deduction
              based on how many hours the employee is late.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Early Leaving LOP Help Modal -->
    <div
      v-if="showEarlyLopHelpModal"
      class="modal-overlay"
      @click="showEarlyLopHelpModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Early Leaving LOP Fixed Calculation</h3>
          <button @click="showEarlyLopHelpModal = false" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="calculation-rules">
            <h4>Automatic Calculation Based on Early Departure Hours:</h4>
            <ul>
              <li>
                <strong>2 hours early:</strong> Quarter Day (0.25 day deduction)
              </li>
              <li>
                <strong>4 hours early:</strong> Half Day (0.5 day deduction)
              </li>
              <li>
                <strong>6 hours early:</strong> Three Quarter Day (0.75 day
                deduction)
              </li>
              <li>
                <strong>8+ hours early:</strong> Full Day (1.0 day deduction)
              </li>
            </ul>
            <p class="note">
              The system will automatically calculate the appropriate deduction
              based on how many hours early the employee leaves.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Working Hours LOP Help Modal -->
    <div
      v-if="showWorkingHoursLopHelpModal"
      class="modal-overlay"
      @click="showWorkingHoursLopHelpModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Working Hours LOP Fixed Calculation</h3>
          <button
            @click="showWorkingHoursLopHelpModal = false"
            class="modal-close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="calculation-rules">
            <h4>Automatic Calculation Based on Insufficient Working Hours:</h4>
            <ul>
              <li>
                <strong>2 hours short:</strong> Quarter Day (0.25 day deduction)
              </li>
              <li>
                <strong>4 hours short:</strong> Half Day (0.5 day deduction)
              </li>
              <li>
                <strong>6 hours short:</strong> Three Quarter Day (0.75 day
                deduction)
              </li>
              <li>
                <strong>8+ hours short:</strong> Full Day (1.0 day deduction)
              </li>
            </ul>
            <p class="note">
              The system will automatically calculate the appropriate deduction
              based on how many hours short of the minimum working hours
              requirement.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, reactive, onMounted, watch } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ToastNotification from "@/components/common/notifications/ToastNotification.vue";

export default {
  name: "PenaltySettings",
  components: {
    ToastNotification, // Register the component here
  },
  props: {
    config: {
      type: Object,
      required: true,
    },
    policyPatch: {
      type: Number,
      required: true,
    },
    showSnackbar: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const tenantId = currentUserTenant.getTenantId();
    const token = authService.getToken();
    const isEditing = ref(false);
    const policyData = ref(null);
    const originalPolicyData = ref(null);

    const showLopHelpModal = ref(false);
    const showEarlyLopHelpModal = ref(false);
    const showWorkingHoursLopHelpModal = ref(false);
    const showToast = ref(false);
    const toastMessage = ref("");
    const toastType = ref("info");
    const showLocalToast = (message, type = "info") => {
      toastMessage.value = message;
      toastType.value = type;
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    };
    const errors = reactive({
      totalWorkingHours: "",
      lateGracePeriod: "",
      earlyGracePeriod: "",
      lateWaiveOffDays: "",
      earlyWaiveOffDays: "",
      workingHoursDaysLimit: "",
    });

    const leaveOptions = ref([
      { title: "Casual Leave", value: "casual" },
      { title: "Sick Leave", value: "sick" },
      { title: "Annual Leave", value: "annual" },
      { title: "Personal Leave", value: "personal" },
    ]);

    const generalSettings = reactive({
      locationCentric: false,
      calculate_WithInBreak: false,
      totalWorkingHours: 9, // Added total working hours field
    });

    const lateComing = reactive({
      enabled: false,
      penaltyType: "amount",
      gracePeriod: "",
      fineAmount: "",
      waiveOffDays: "",
      deductionType: "",
      leaveType: "",
    });

    const earlyLeaving = reactive({
      enabled: false,
      penaltyType: "amount",
      gracePeriod: "",
      fineAmount: "",
      waiveOffDays: "",
      deductionType: "",
      leaveType: "",
    });

    const overtime = reactive({
      enabled: false,
      gracePeriod: "",
      extraHoursType: "",
      extraHoursPay: "",
      weekOffPayType: "",
      weekOffPay: "",
      publicHolidayPayType: "",
      publicHolidayPay: "",
    });

    const workingHours = reactive({
      enabled: false,
      minimumHours: "",
      penaltyType: "",
      fineAmount: "",
      waiveOffDays: "",
      deductionType: "",
      workinghrsDaysLimit: "",
      leaveType: "",
    });

    const validateTotalWorkingHours = () => {
      const hours = Number(generalSettings.totalWorkingHours);
      if (isNaN(hours) || hours < 1 || hours > 9) {
        errors.totalWorkingHours =
          "Total working hours must be between 1 and 9 hours";
        return false;
      }
      errors.totalWorkingHours = "";
      return true;
    };

    const validateGracePeriod = (value, field) => {
      const minutes = Number(value);
      if (isNaN(minutes) || minutes < 0 || minutes > 360) {
        errors[field] =
          "Grace period must be between 0 and 6 hours (360 minutes)";
        return false;
      }
      errors[field] = "";
      return true;
    };

    const validateWaiveOffDays = (value, field) => {
      const days = Number(value);
      if (isNaN(days) || days < 3) {
        errors[field] = "Waive off days must be 3 or more days";
        return false;
      }
      errors[field] = "";
      return true;
    };

    watch(() => generalSettings.totalWorkingHours, validateTotalWorkingHours);
    watch(
      () => lateComing.gracePeriod,
      (value) => validateGracePeriod(value, "lateGracePeriod"),
    );
    watch(
      () => earlyLeaving.gracePeriod,
      (value) => validateGracePeriod(value, "earlyGracePeriod"),
    );
    watch(
      () => lateComing.waiveOffDays,
      (value) => validateWaiveOffDays(value, "lateWaiveOffDays"),
    );
    watch(
      () => earlyLeaving.waiveOffDays,
      (value) => validateWaiveOffDays(value, "earlyWaiveOffDays"),
    );
    watch(
      () => workingHours.workinghrsDaysLimit,
      (value) => validateWaiveOffDays(value, "workingHoursDaysLimit"),
    );

    watch(
      () => lateComing.penaltyType,
      (newType) => {
        if (newType === "lop") {
          lateComing.deductionType = "fixed";
        }
      },
    );

    watch(
      () => earlyLeaving.penaltyType,
      (newType) => {
        if (newType === "lop") {
          earlyLeaving.deductionType = "fixed";
        }
      },
    );

    watch(
      () => workingHours.penaltyType,
      (newType) => {
        if (newType === "lop") {
          workingHours.deductionType = "fixed";
        }
      },
    );

    const toggleEditing = () => {
      isEditing.value = !isEditing.value;
    };

    const gracePeriodRule = (v) => {
      const num = Number(v);
      if (isNaN(num) || num < 0 || num > 60)
        return "Grace period must be between 0 and 60 minutes";
      return true;
    };

    const waiveOffDaysRule = (v) => {
      const num = Number(v);
      if (isNaN(num) || num < 0 || num > 5)
        return "Waive off days must be between 0 and 5";
      return true;
    };

    const convertToHHMMSS = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
    };

    const convertToMinutes = (hhmmss) => {
      const [hours, minutes] = hhmmss.split(":");
      return parseInt(hours) * 60 + parseInt(minutes);
    };

    const saveChanges = async () => {
      const isValid = [
        validateTotalWorkingHours(), // always validate totalWorkingHours, since always present
        !lateComing.enabled ||
          validateGracePeriod(lateComing.gracePeriod, "lateGracePeriod"),
        !lateComing.enabled ||
          validateWaiveOffDays(lateComing.waiveOffDays, "lateWaiveOffDays"),
        !earlyLeaving.enabled ||
          validateGracePeriod(earlyLeaving.gracePeriod, "earlyGracePeriod"),
        !earlyLeaving.enabled ||
          validateWaiveOffDays(earlyLeaving.waiveOffDays, "earlyWaiveOffDays"),
        !workingHours.enabled ||
          validateWaiveOffDays(
            workingHours.workinghrsDaysLimit,
            "workingHoursDaysLimit",
          ),
      ].every(Boolean);

      if (!isValid) {
        showLocalToast("Please fix validation errors before saving", "error");
        return;
      }

      try {
        const payload = {
          locationCentric: generalSettings.locationCentric,
          calculate_WithInBreak: generalSettings.calculate_WithInBreak,
          TotalWorking_Hours: generalSettings.totalWorkingHours, // Added total working hours
          entryTimeLimit: lateComing.enabled,
          setEntryTimeLimit: convertToHHMMSS(lateComing.gracePeriod),
          lateEntryAllowed: parseInt(lateComing.waiveOffDays) || 0,
          lateEntryPenaltyAmt: parseFloat(lateComing.fineAmount) || null,
          exitTimeLimit: earlyLeaving.enabled,
          setExitTimeLimit: convertToHHMMSS(earlyLeaving.gracePeriod),
          earlyExitAllowed: parseInt(earlyLeaving.waiveOffDays) || 0,
          earlyExitPenaltyAmt: parseFloat(earlyLeaving.fineAmount) || null,
          isWorkingHours: workingHours.enabled,
          workinghrsDaysLimit:
            parseInt(workingHours.workinghrsDaysLimit) || null,
          workingHoursAmount: parseFloat(workingHours.fineAmount) || null,
          isOverTime: overtime.enabled,
          setOverTimeLimit: convertToHHMMSS(overtime.gracePeriod),
          extraHoursPay: parseFloat(overtime.extraHoursPay) || null,
          weekOffPay: parseFloat(overtime.weekOffPay) || null,
          publicHolidayPay: parseFloat(overtime.publicHolidayPay) || null,
        };

        if (lateComing.penaltyType != "") {
          payload["lateComingType"] = lateComing.penaltyType;
        }
        if (lateComing.deductionType != "") {
          payload["LateCommingDayMode"] = lateComing.deductionType;
        }
        if (lateComing.leaveType != "") {
          payload["lateCommingLeave"] = lateComing.leaveType;
        }
        if (earlyLeaving.penaltyType != "") {
          payload["earlyLeavingType"] = earlyLeaving.penaltyType;
        }
        if (earlyLeaving.deductionType != "") {
          payload["earlyLeavingDayMode"] = earlyLeaving.deductionType;
        }
        if (earlyLeaving.leaveType != "") {
          payload["earlyLeavingLeave"] = earlyLeaving.leaveType;
        }
        if (workingHours.minimumHours != "") {
          payload["setMinWorkingHours"] = workingHours.minimumHours;
        }
        if (workingHours.penaltyType != "") {
          payload["workingHoursType"] = workingHours.penaltyType;
        }
        if (workingHours.deductionType != "") {
          payload["wrkHoursDayMode"] = workingHours.deductionType;
        }
        if (workingHours.leaveType != "") {
          payload["wrkHoursLeave"] = workingHours.leaveType;
        }
        if (overtime.weekOffPayType != "") {
          payload["weekOffType"] = overtime.weekOffPayType;
        }
        if (overtime.publicHolidayPayType != "") {
          payload["publicHolidayType"] = overtime.publicHolidayPayType;
        }
        if (overtime.extraHoursType != "") {
          payload["extraHoursType"] = overtime.extraHoursType;
        }

        Object.keys(payload).forEach(
          (key) => payload[key] === null && delete payload[key],
        );

        const historyResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/personalModule?filter[_and][0][config][attendancePolicies][id][_eq]=${props.policyPatch}&fields[]=attendancePolicyHistory`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!historyResponse.ok) {
          throw new Error("Failed to fetch attendance policy history");
        }

        const historyData = await historyResponse.json();
        const historyIds = historyData.data
          .filter((item) => item.attendancePolicyHistory !== null)
          .map((item) => item.attendancePolicyHistory);

        if (historyIds.length > 0) {
          const filteredOriginalData = {};
          Object.keys(payload).forEach((prop) => {
            if (
              originalPolicyData.value &&
              originalPolicyData.value[prop] !== undefined &&
              originalPolicyData.value[prop] !== null &&
              originalPolicyData.value[prop] !== "00:00:00" &&
              JSON.stringify(originalPolicyData.value[prop]) !==
                JSON.stringify(payload[prop])
            ) {
              filteredOriginalData[prop] = originalPolicyData.value[prop];
            }
          });

          const perviousPolicyResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/attendancePolicies`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                keys: historyIds,
                data: filteredOriginalData,
              }),
            },
          );

          if (!perviousPolicyResponse.ok) {
            throw new Error("Failed to update previous policy");
          }
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendancePolicies/${props.policyPatch}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          const updatedResult = await response.json();
          originalPolicyData.value = updatedResult.data;
          isEditing.value = false;
          showLocalToast("Settings saved successfully!", "success");
        } else {
          throw new Error("Failed to save settings");
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        showLocalToast(`Error saving settings: ${error.message}`, "error");
      }
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    onMounted(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendancePolicies/${props.policyPatch}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const result = await response.json();
        policyData.value = result.data;
        originalPolicyData.value = result.data;

        generalSettings.locationCentric = policyData.value.locationCentric;
        generalSettings.calculate_WithInBreak =
          policyData.value.calculate_WithInBreak || false;
        generalSettings.totalWorkingHours =
          policyData.value.TotalWorking_Hours || 9; // Load total working hours

        lateComing.enabled = policyData.value.entryTimeLimit;
        lateComing.penaltyType =
          policyData.value.lateComingType === "amount"
            ? "fixed"
            : policyData.value.lateComingType || "fixed";
        lateComing.gracePeriod = convertToMinutes(
          policyData.value.setEntryTimeLimit,
        );
        lateComing.fineAmount = policyData.value.lateEntryPenaltyAmt;
        lateComing.waiveOffDays = policyData.value.lateEntryAllowed;
        lateComing.deductionType = policyData.value.LateCommingDayMode;
        lateComing.leaveType = policyData.value.lateCommingLeave;

        earlyLeaving.enabled = policyData.value.exitTimeLimit;
        earlyLeaving.penaltyType =
          policyData.value.earlyLeavingType === "amount"
            ? "fixed"
            : policyData.value.earlyLeavingType || "fixed";
        earlyLeaving.gracePeriod = convertToMinutes(
          policyData.value.setExitTimeLimit,
        );
        earlyLeaving.fineAmount = policyData.value.earlyExitPenaltyAmt;
        earlyLeaving.waiveOffDays = policyData.value.earlyExitAllowed;
        earlyLeaving.deductionType = policyData.value.earlyLeavingDayMode;
        earlyLeaving.leaveType = policyData.value.earlyLeavingLeave;

        overtime.enabled = policyData.value.isOverTime;
        overtime.gracePeriod = convertToMinutes(
          policyData.value.setOverTimeLimit,
        );
        overtime.extraHoursType = policyData.value.extraHoursType;
        overtime.extraHoursPay = policyData.value.extraHoursPay;
        overtime.weekOffPayType = policyData.value.weekOffType;
        overtime.weekOffPay = policyData.value.weekOffPay;
        overtime.publicHolidayPayType = policyData.value.publicHolidayType;
        overtime.publicHolidayPay = policyData.value.publicHolidayPay;

        workingHours.enabled = policyData.value.isWorkingHours;
        workingHours.minimumHours = policyData.value.setMinWorkingHours;
        workingHours.penaltyType =
          policyData.value.workingHoursType === "amount"
            ? "fixed"
            : policyData.value.workingHoursType || "fixed";
        workingHours.fineAmount = policyData.value.workingHoursAmount;
        workingHours.deductionType = policyData.value.wrkHoursDayMode;
        workingHours.workinghrsDaysLimit = policyData.value.workinghrsDaysLimit;
        workingHours.leaveType = policyData.value.wrkHoursLeave;

        [
          lateComing.waiveOffDays,
          earlyLeaving.waiveOffDays,
          workingHours.waiveOffDays,
        ].forEach((value) => {
          const numValue = parseInt(value);
          if (numValue < 3 || numValue > 5) {
            value = "3";
          }
        });
      } catch (error) {
        console.error("Error fetching attendance policies:", error);
        showLocalToast(
          "Error fetching attendance policies. Please try again.",
          "error",
        );
      }
    });

    return {
      isEditing,
      generalSettings,
      lateComing,
      earlyLeaving,
      overtime,
      workingHours,
      leaveOptions,
      errors, // Added errors to return
      showLopHelpModal, // Added modal states
      showEarlyLopHelpModal,
      showWorkingHoursLopHelpModal,
      toggleEditing,
      saveChanges,
      cancelEdit,
      gracePeriodRule,
      waiveOffDaysRule,
      showToast,
      toastMessage,
      toastType,
      showLocalToast,
    };
  },
};
</script>

<style scoped>
.penalty-settings-container {
  background: #ffffff;
  min-height: 110vh;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: #ef4444;
  color: white;
}

.btn-secondary:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.icon {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.content {
  max-height: 80vh;
  /* max-width: 100vh; */
  overflow-y: auto;
}

.policy-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.policy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.policy-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.policy-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.policy-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
  color: white;
}

.policy-icon.general {
  background: #3b82f6;
}

.policy-icon.late-coming {
  background: #f97316;
}

.policy-icon.early-leaving {
  background: #ef4444;
}

.policy-icon.overtime {
  background: #10b981;
}

.policy-icon.working-hours {
  background: #8b5cf6;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 1.5rem;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 1.125rem;
  width: 1.125rem;
  left: 0.1875rem;
  bottom: 0.1875rem;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(1.5rem);
}

.toggle input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.policy-content {
  padding: 1.5rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.875rem;
  color: #64748b;
}

.policy-type-section {
  margin-bottom: 1.5rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.policy-type-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.policy-type-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.policy-type-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.policy-type-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.policy-type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-suffix {
  position: absolute;
  right: 0.75rem;
  top: 2.25rem;
  font-size: 0.875rem;
  color: #6b7280;
  pointer-events: none;
}

.time-input-wrapper {
  position: relative;
}

.time-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  pointer-events: none;
}

.subsection {
  margin-bottom: 2rem;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

/* Added styles for new components */
.hours-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hours-input {
  flex: 1;
  max-width: 100px;
}

.hours-suffix {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.custom-lop-wrapper {
  width: 100%;
}

.custom-lop-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  min-height: 42px;
}

.custom-lop-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.help-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-icon-btn:hover:not(:disabled) {
  color: #3b82f6;
  background: #f3f4f6;
}

.help-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.help-icon-btn svg {
  width: 1rem;
  height: 1rem;
  stroke-width: 2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #374151;
  background: #f3f4f6;
}

.modal-close svg {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

.modal-body {
  padding: 1.5rem;
}

.calculation-rules h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.calculation-rules ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.calculation-rules li {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.calculation-rules li strong {
  color: #1f2937;
}

.note {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: #1e40af;
  margin: 0;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-height: 90vh;
  }

  .hours-input-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .hours-input {
    max-width: 100%;
  }
}
</style>
