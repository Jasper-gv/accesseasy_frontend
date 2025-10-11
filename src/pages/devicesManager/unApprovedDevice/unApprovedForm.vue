<template>
  <div class="controller-form-container">
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>
    <v-snackbar
      class="errormessge"
      v-model="showErrorSnackbar"
      color="error"
      timeout="2000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
    <div class="form-header">
      <div class="header-content">
        <v-btn icon variant="text" @click="$emit('cancel')" class="back-button">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h6">
          {{ isEditing ? "Edit Device" : "Add Device" }}
        </h2>
      </div>
      <div class="action-buttons">
        <v-btn color="error" variant="text" @click="$emit('cancel')"
          >CANCEL</v-btn
        >
        <v-btn color="primary" @click="saveController">SAVE</v-btn>
      </div>
    </div>
    <!-- ADD DEVICE UI (no tabs, only form fields) -->
    <div v-if="!isEditing" class="form-content-wrapper">
      <div class="form-content">
        <div v-if="showDoorWarning" class="info-banner">
          <v-icon
            icon="mdi-information-outline"
            color="info"
            class="me-2"
          ></v-icon>
          <span>
            Controller type {{ formData.controllerType }} can only have
            {{ formData.controllerType }} door(s). Please remove extra
            selections.
          </span>
        </div>
        <v-form ref="form" v-model="valid" @submit.prevent="saveController">
          <div class="form-section">
            <!-- Device Details Section (Moved to top) -->
            <div v-if="formData.controllerName" class="split-section">
              <div class="image-section">
                <div v-if="formData.controllerName" class="device-image">
                  <img :src="getImageUrl()" alt="Device Image" />
                </div>
                <div v-else class="device-image-placeholder">
                  <v-icon size="48" color="grey-lighten-1">mdi-camera</v-icon>
                  <div class="placeholder-text">
                    Select a device to view image
                  </div>
                </div>
              </div>
              <div class="device-details-section">
                <h3 class="details-title">Device Details</h3>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-icon sn-icon">
                      <v-icon>mdi-barcode</v-icon>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">SN Number</div>
                      <div class="detail-value">{{ formData.sn }}</div>
                    </div>
                    <v-icon
                      size="small"
                      class="info-icon"
                      @click="showSnInfoDialog = true"
                      >mdi-information</v-icon
                    >
                  </div>
                  <div
                    class="detail-item"
                    v-if="formData.controllerName !== 'AI face'"
                  >
                    <div class="detail-icon device-type-icon">
                      <v-icon>mdi-devices</v-icon>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">Device Type</div>
                      <div class="detail-value">
                        {{ formData.controllerType }}
                      </div>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-icon attendance-mode-icon">
                      <v-icon>mdi-clock-check-outline</v-icon>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">Attendance mode</div>
                      <div class="detail-value">
                        {{ formData.attendanceMode }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="detail-item"
                    v-if="formData.controllerName !== 'AI face'"
                  >
                    <div class="detail-icon passback-icon">
                      <v-icon>mdi-shield-outline</v-icon>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">Anti Pass-back Mode</div>
                      <div class="detail-value">
                        {{ formData.antiPassbackMode }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="detail-item"
                    v-if="formData.controllerName !== 'AI face'"
                  >
                    <div class="detail-icon door-icon">
                      <v-icon>mdi-door</v-icon>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">Door Mode</div>
                      <div class="detail-value">{{ formData.doorMode }}</div>
                    </div>
                  </div>
                  <div
                    class="detail-item"
                    v-if="formData.controllerName !== 'AI face'"
                  >
                    <div class="detail-icon interlock-icon">
                      <v-icon>mdi-lock</v-icon>
                    </div>
                    <div class="detail-content">
                      <div class="detail-label">Interlock mode</div>
                      <div class="detail-value">
                        {{ formData.interlockMode }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.controllerName"
                  :items="['AI face', 'finger print', '4 door device']"
                  label="Device Type *"
                  required
                  variant="outlined"
                  density="comfortable"
                  :error-messages="getFieldErrorMessage('controllerName')"
                  @blur="markFieldAsTouched('controllerName')"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.deviceName"
                  label="Device Name"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="detail-value"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex align-center">
                  <v-text-field
                    v-model="formData.controllerId"
                    label="Serial Number *"
                    required
                    variant="outlined"
                    density="comfortable"
                    :error-messages="getFieldErrorMessage('controllerId')"
                    @blur="markFieldAsTouched('controllerId')"
                    class="flex-grow-1"
                  ></v-text-field>
                  <v-icon
                    size="small"
                    class="info-icon ms-2"
                    @click="showDeviceIdInfoDialog = true"
                    >mdi-information</v-icon
                  >
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="device-group-container">
                  <div class="custom-dropdown">
                    <div
                      label="deviceGroup"
                      class="dropdown-trigger"
                      @click="toggleDeviceGroupDropdown"
                      :class="{ 'dropdown-active': showDeviceGroupDropdown }"
                    >
                      <span v-if="formData.deviceGroup">{{
                        formData.deviceGroup
                      }}</span>
                      <span v-else class="placeholder"
                        >Select device group</span
                      >
                      <v-icon>{{
                        showDeviceGroupDropdown
                          ? "mdi-chevron-up"
                          : "mdi-chevron-down"
                      }}</v-icon>
                    </div>
                    <div
                      v-if="showDeviceGroupDropdown"
                      class="dropdown-content"
                    >
                      <div class="search-container">
                        <input
                          type="text"
                          v-model="deviceGroupSearch"
                          placeholder="Search groups..."
                          @input="filterDeviceGroups"
                          class="search-input"
                        />
                      </div>
                      <div class="dropdown-items">
                        <div
                          v-for="group in filteredDeviceGroups"
                          :key="group"
                          class="dropdown-item"
                          @click="selectDeviceGroup(group)"
                          :class="{ selected: formData.deviceGroup === group }"
                        >
                          {{ group }}
                        </div>
                        <div
                          class="dropdown-item add-new"
                          @click="showAddGroupPopup = true"
                        >
                          <v-icon size="small" class="me-2">mdi-plus</v-icon>
                          Add
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="isAdminRole">
                <v-select
                  v-model="formData.tenant"
                  :items="tenantOptions"
                  variant="outlined"
                  density="comfortable"
                  item-title="name"
                  item-value="id"
                  label="Tenant"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.attendanceMode"
                  :items="attendanceModeOptions"
                  label="Attendance Mode"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="getFieldErrorMessage('attendanceMode')"
                  @blur="markFieldAsTouched('attendanceMode')"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.branch"
                  :items="branchOptions"
                  variant="outlined"
                  density="comfortable"
                  item-title="name"
                  item-value="id"
                  label="Branch"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-text-field
                  v-model="formData.comparison_threshold"
                  label="Comparison Threshold"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-text-field
                  v-model="formData.quality_threshold"
                  label="Quality Threshold"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-text-field
                  v-model="formData.liveness_threshold"
                  label="Liveness Threshold"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-switch
                  v-model="advanceDoorMode"
                  label="Advanced Door Mode"
                  color="primary"
                  inset
                  hide-details
                ></v-switch>
              </v-col>
            </v-row>
            <!-- Advanced Fields for Add Device (conditionally shown) -->
            <v-row
              v-if="formData.controllerName !== 'AI face' && advanceDoorMode"
            >
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.doorMode"
                  :items="doorModeOptions"
                  label="Door Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.interval"
                  :items="heartbeatIntervalOptions"
                  label="Heartbeat Interval"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.interlockMode"
                  :items="interlockModeOptions"
                  label="Interlock Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.antiPassbackMode"
                  :items="antiPassbackModeOptions"
                  label="Anti-Passback Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </div>
          <!-- Hidden fields -->
          <div style="display: none">
            <v-file-input
              v-model="formData.controllerImageFile"
              accept="image/*"
              @update:model-value="handleImageChange"
            ></v-file-input>
            <v-text-field v-model="formData.sn"></v-text-field>
            <v-select
              v-model="formData.interlockMode"
              :items="interlockModeOptions"
            ></v-select>
          </div>
        </v-form>
      </div>
    </div>
    <!-- EDIT DEVICE UI (with vertical tabs) -->
    <div v-else class="form-content-wrapper">
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="(tab, index) in tabs"
            :key="index"
            :value="tab"
            :active="currentTab === tab.id"
            @click="currentTab = tab.id"
            :class="{ 'has-error': tabHasError(tab.id) }"
          >
            <template v-slot:prepend>
              <v-icon :color="tabHasError(tab.id) ? 'error' : 'default'">
                {{ tab.icon }}
              </v-icon>
            </template>
            <v-list-item-title>
              {{ tab.title }}
              <v-icon
                v-if="tabHasError(tab.id)"
                color="error"
                size="small"
                class="ms-2"
              >
                mdi-alert-circle
              </v-icon>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
      <!-- Main Form Content -->
      <div class="form-content">
        <div v-if="showDoorWarning" class="info-banner">
          <v-icon
            icon="mdi-information-outline"
            color="info"
            class="me-2"
          ></v-icon>
          <span>
            Controller type {{ formData.controllerType }} can only have
            {{ formData.controllerType }} door(s). Please remove extra
            selections.
          </span>
        </div>
        <v-form ref="form" v-model="valid" @submit.prevent="saveController">
          <div v-show="currentTab === 'basic'" class="form-section">
            <v-row>
              <v-col cols="12" md="6">
                <div class="detail-item">
                  <div class="detail-icon device-type-icon">
                    <v-icon>mdi-devices</v-icon>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Device Type</div>
                    <div class="detail-value">
                      {{ formData.controllerName }}
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="detail-item">
                  <div class="detail-icon sn-icon">
                    <v-icon>mdi-barcode</v-icon>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Serial Number</div>
                    <div class="detail-value">{{ formData.sn }}</div>
                  </div>
                </div>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <div class="detail-item">
                  <div class="detail-icon device-type-icon">
                    <v-icon>mdi-devices</v-icon>
                  </div>
                  <div class="detail-content">
                    <div class="detail-label">Device Type</div>
                    <div class="detail-value">
                      {{ formData.controllerType }}
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.deviceName"
                  label="Device Name"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="detail-value"
                />
              </v-col>
              <v-col cols="12" md="6">
                <div class="device-group-container">
                  <div class="custom-dropdown">
                    <div
                      class="dropdown-trigger"
                      @click="toggleDeviceGroupDropdown"
                      :class="{ 'dropdown-active': showDeviceGroupDropdown }"
                    >
                      <span v-if="formData.deviceGroup">{{
                        formData.deviceGroup
                      }}</span>
                      <span v-else class="placeholder"
                        >Select device group</span
                      >
                      <v-icon>{{
                        showDeviceGroupDropdown
                          ? "mdi-chevron-up"
                          : "mdi-chevron-down"
                      }}</v-icon>
                    </div>
                    <div
                      v-if="showDeviceGroupDropdown"
                      class="dropdown-content"
                    >
                      <div class="search-container">
                        <input
                          type="text"
                          v-model="deviceGroupSearch"
                          placeholder="Search groups..."
                          @input="filterDeviceGroups"
                          class="search-input"
                        />
                      </div>
                      <div class="dropdown-items">
                        <div
                          v-for="group in filteredDeviceGroups"
                          :key="group"
                          class="dropdown-item"
                          @click="selectDeviceGroup(group)"
                          :class="{ selected: formData.deviceGroup === group }"
                        >
                          {{ group }}
                        </div>
                        <div
                          class="dropdown-item add-new"
                          @click="showAddGroupPopup = true"
                        >
                          <v-icon size="small" class="me-2">mdi-plus</v-icon>
                          Add
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.branch"
                  :items="branchOptions"
                  item-title="name"
                  item-value="id"
                  label="Branch"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6" v-if="isAdminRole">
                <v-select
                  v-model="formData.tenant"
                  :items="tenantOptions"
                  item-title="name"
                  item-value="id"
                  label="Tenant"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </div>
          <div v-show="currentTab === 'modes'" class="form-section">
            <v-row>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.doorMode"
                  :items="doorModeOptions"
                  label="Door Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.interval"
                  :items="heartbeatIntervalOptions"
                  label="Heartbeat Interval"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.interlockMode"
                  :items="interlockModeOptions"
                  label="Interlock Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.attendanceMode"
                  :items="attendanceModeOptions"
                  label="Attendance Mode"
                  :error-messages="getFieldErrorMessage('attendanceMode')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('attendanceMode')"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName !== 'AI face'"
              >
                <v-select
                  v-model="formData.antiPassbackMode"
                  :items="antiPassbackModeOptions"
                  label="Anti-Passback Mode"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-text-field
                  v-model="formData.comparison_threshold"
                  label="Comparison Threshold"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-select
                  v-model="formData.identification_Intervel"
                  :items="[3, 5]"
                  label="Identification Interval (Sec)"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-select>
              </v-col>

              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-select
                  v-model="formData.identification_distance"
                  :items="[50, 100, 150]"
                  label="Identification Distance (cm)"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-text-field
                  v-model="formData.quality_threshold"
                  label="Quality Threshold"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
                v-if="formData.controllerName === 'AI face'"
              >
                <v-text-field
                  v-model="formData.liveness_threshold"
                  label="Liveness Threshold"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
          <div
            v-show="currentTab === 'assignedDoors'"
            v-if="formData.controllerName !== 'AI face'"
            class="form-section"
          >
            <h3 class="section-title">Assigned Doors</h3>
            <div class="door-grid">
              <div
                v-for="i in parseInt(formData.controllerType || '0')"
                :key="`door-${i}`"
                class="door-card"
              >
                <h4 class="door-title">Door {{ i }}</h4>
                <v-select
                  v-model="formData.doorAssignments[i - 1].doorId"
                  :items="getAvailableDoorOptions(i - 1)"
                  item-title="doorName"
                  item-value="id"
                  label="Select Door"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  @update:model-value="
                    (val) => handleDoorAssignmentChange(val, i - 1, 'doorId')
                  "
                ></v-select>
                <div
                  v-if="formData.doorAssignments[i - 1].doorId"
                  class="door-options"
                >
                  <v-text-field
                    v-model="formData.doorAssignments[i - 1].timerMode"
                    label="Door open too long (seconds)"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    min="1"
                    max="120"
                    @input="
                      (event) =>
                        enforceDoorTimerModeRange(event, i - 1, 'timerMode')
                    "
                  ></v-text-field>
                  <v-switch
                    v-model="formData.doorAssignments[i - 1].passiveMode"
                    :label="
                      formData.doorAssignments[i - 1].passiveMode
                        ? 'Passage Mode: ON'
                        : 'Passage Mode: OFF'
                    "
                    color="primary"
                    inset
                    hide-details
                    @update:model-value="
                      (val) => {
                        handleDoorAssignmentChange(val, i - 1, 'passiveMode');
                      }
                    "
                  ></v-switch>
                  <v-switch
                    v-model="formData.doorAssignments[i - 1].senzrMode"
                    :label="
                      formData.doorAssignments[i - 1].senzrMode
                        ? 'Senzr Mode: ON'
                        : 'Senzr Mode: OFF'
                    "
                    color="primary"
                    inset
                    hide-details
                    @update:model-value="
                      (val) => {
                        handleDoorAssignmentChange(val, i - 1, 'senzrMode');
                        if (!val)
                          formData.doorAssignments[i - 1].buzzerMode = false;
                      }
                    "
                  ></v-switch>
                  <v-switch
                    v-model="formData.doorAssignments[i - 1].buzzerMode"
                    :label="
                      formData.doorAssignments[i - 1].buzzerMode
                        ? 'Buzzer Mode: ON'
                        : 'Buzzer Mode: OFF'
                    "
                    color="primary"
                    inset
                    hide-details
                    :disabled="!formData.doorAssignments[i - 1].senzrMode"
                    @update:model-value="
                      (val) =>
                        handleDoorAssignmentChange(val, i - 1, 'buzzerMode')
                    "
                  ></v-switch>
                  <div class="mt-4">
                    <v-text-field
                      v-if="
                        formData.doorAssignments[i - 1].buzzerMode !== false
                      "
                      v-model="formData.doorAssignments[i - 1].buzzerTimer"
                      label="Buzzer Timer"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      min="1"
                      max="120"
                      @input="
                        (event) =>
                          enforceBuzzerTimerModeRange(
                            event,
                            i - 1,
                            'buzzerTimer',
                          )
                      "
                    ></v-text-field>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-form>
      </div>
    </div>
    <!-- Add Group Popup -->
    <div
      v-if="showAddGroupPopup"
      class="popup-overlay"
      @click.self="showAddGroupPopup = false"
    >
      <div class="popup-container">
        <div class="popup-header">
          <h3>Add New Device Group</h3>
          <v-icon @click="showAddGroupPopup = false" class="close-icon"
            >mdi-close</v-icon
          >
        </div>
        <div class="popup-content">
          <div class="input-group">
            <label for="newGroupName">Group Name</label>
            <input
              type="text"
              id="newGroupName"
              v-model="newDeviceGroup"
              placeholder="Enter group name"
              ref="newGroupInput"
              @keyup.enter="addNewDeviceGroup"
            />
          </div>
          <div class="popup-actions">
            <button class="cancel-btn" @click="showAddGroupPopup = false">
              Cancel
            </button>
            <button
              class="add-btn"
              @click="addNewDeviceGroup"
              :disabled="!newDeviceGroup.trim()"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- SN Info Dialog -->
    <v-dialog v-model="showSnInfoDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Device Serial Number Info</v-card-title>
        <v-card-text>
          <p>
            The device serial number (SN) can typically be found on the back
            side of the device.
          </p>
          <p class="mt-3">
            Please refer to your device's physical label for the exact SN.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showSnInfoDialog = false"
            >Got It</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Device ID Info Dialog -->
    <v-dialog v-model="showDeviceIdInfoDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Serial Number Information</v-card-title>
        <v-card-text>
          <p>The Serial Number is a unique identifier for your controller.</p>
          <p class="mt-3">
            For most devices, the Serial Number can be found on a sticker or
            label on the device itself, often near the network port. It might
            also be accessible through the device's configuration interface.
          </p>
          <p class="mt-3">
            Please consult your device's manual or physical labels for the exact
            Serial Number.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showDeviceIdInfoDialog = false"
            >Got It</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
  nextTick,
  onUnmounted,
} from "vue";

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false,
  },
  deviceData: {
    type: Object,
    default: () => ({}),
  },
  tenantId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["save-success", "cancel"]);

const form = ref(null);
const valid = ref(false);
const currentTab = ref("basic");
const imageError = ref("");
const currentImageId = ref(null);
const formSubmitAttempted = ref(false);
const formErrors = ref({});
const touchedFields = ref({});
const showDoorWarning = ref(false);
const existingControllers = ref([]);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const userRole = ref("");
const tenantOptions = ref([]);
const deviceGroups = ref([]);
const filteredDeviceGroups = ref([]);
const deviceGroupSearch = ref("");
const showDeviceGroupDropdown = ref(false);
const newDeviceGroup = ref("");
const newGroupInput = ref(null);
const showAddGroupPopup = ref(false);
const showSnInfoDialog = ref(false);
const showDeviceIdInfoDialog = ref(false);
const advanceDoorMode = ref(false);

const isAdminRole = computed(() => {
  return ["esslAdmin", "Administrator"].includes(userRole.value);
});

const doorOptions = ref([]);
const branchOptions = ref([]);
const globallyAssignedDoorIds = ref(new Set());

const doorModeOptions = [
  "4Reader-4Switch",
  "6Reader-2Switch",
  "8Reader-0Switch",
];
const interlockModeOptions = [
  "No Interlock",
  "Door 1 & 2",
  "Door 3 & 4",
  "Door 1,2 & 3",
  "Door (1,2)& (3,4)",
  "Door 1,2,3 & 4",
];
const antiPassbackModeOptions = [
  "No anti pass-back mode",
  "Door 1,2",
  "Door 1,2 & 3",
  "Door (1,2) & (3,4)",
  "Door 1,2,3,4",
];
const heartbeatIntervalOptions = ["15", "30", "45", "60"];
const attendanceModeOptions = computed(() => {
  if (formData.controllerName === "4 door device") {
    return ["in", "out"];
  }
  return ["in", "out", "InOut"];
});

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const tabs = computed(() => {
  const baseTabs = [
    { id: "basic", title: "Basic Info", icon: "mdi-information" },
    { id: "modes", title: "Device Modes", icon: "mdi-door" },
  ];
  if (formData.controllerName !== "AI face") {
    baseTabs.push({
      id: "assignedDoors",
      title: "Assigned Doors",
      icon: "mdi-door-open",
    });
  }
  return baseTabs;
});

const tabRequiredFields = {
  basic: ["controllerId", "controllerName"],
  modes: ["attendanceMode"],
  assignedDoors: [],
};

const formData = reactive({
  controllerImage: null,
  controllerImageFile: null,
  deviceName: "",
  comparison_threshold: null,
  quality_threshold: null,
  identification_Intervel: null,
  identification_distance: null,

  liveness_threshold: null,
  controllerId: "",
  controllerName: "",
  controllerIP: "",
  serverIp: "",
  sn: "",
  controllerType: "",
  status: "approved",
  doorAssignments: Array(4)
    .fill(null)
    .map(() => ({
      doorId: null,
      timerMode: "10",
      buzzerMode: true,
      junctionId: null,
      senzrMode: true,
      buzzerTimer: "",
      passiveMode: true,
    })),
  doorMode: "4Reader-4Switch",
  interlockMode: "No Interlock",
  interval: "60",
  attendanceMode: "InOut",
  antiPassbackMode: "No anti pass-back mode",
  controllerStatus: "",
  branch: "",
  tenant: "",
  deviceGroup: "",
});

const enforceDoorTimerModeRange = (event, index, field) => {
  let value = parseInt(event.target.value);
  if (isNaN(value) || value < 0) {
    value = 0;
  } else if (value > 120) {
    value = 120;
  }
  formData.doorAssignments[index][field] = String(value);
};
const enforceBuzzerTimerModeRange = (event, index, field) => {
  let value = parseInt(event.target.value);
  if (isNaN(value) || value < 0) {
    value = 0;
  } else if (value > 120) {
    value = 120;
  }
  formData.doorAssignments[index][field] = String(value);
};

function validateFormData(formData) {
  function isValidIP(ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return false;
    }
    const octets = ip.split(".");
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  if (!/^[A-Za-z0-9-_]+$/.test(formData.controllerId)) {
    throw new Error(
      "Serial Number can only contain letters, numbers, hyphens and underscores",
    );
  }
  return true;
}

const tabHasError = (tabId) => {
  if (!formSubmitAttempted.value) return false;
  const requiredFields = tabRequiredFields[tabId];
  if (tabId === "modes" && formData.controllerName !== "AI face") {
    return requiredFields
      .filter((field) => field !== "attendanceMode")
      .some((field) => !formData[field]);
  }
  return requiredFields.some((field) => !formData[field]);
};

const isAttendanceModeRequired = () => {
  return formData.controllerName === "AI face";
};

const getFieldErrorMessage = (field) => {
  if (field === "attendanceMode") {
    if (
      isAttendanceModeRequired() &&
      !formData[field] &&
      touchedFields.value[field]
    ) {
      return "This field is required for AI face devices";
    }
    return "";
  }
  if (formData[field]) {
    formErrors.value[field] = "";
    return "";
  }
  if (formErrors.value[field] && touchedFields.value[field]) {
    return formErrors.value[field];
  }
  return "";
};

const markFieldAsTouched = (field) => {
  touchedFields.value[field] = true;
  if (!formData[field] && tabRequiredFields[currentTab.value].includes(field)) {
    formErrors.value[field] = "This field is required";
  }
};

async function handleImageChange(file) {
  try {
    if (file) {
      if (currentImageId.value) {
        await deleteImage(currentImageId.value);
      }
      const fileId = await handleImageUpload(file);
      currentImageId.value = fileId;
      formData.controllerImage = fileId;
      imageError.value = "";
    } else {
      if (currentImageId.value) {
        await deleteImage(currentImageId.value);
        currentImageId.value = null;
        formData.controllerImage = null;
      }
    }
  } catch (error) {
    imageError.value = "Failed to process image. Please try again.";
    console.error("Image handling error:", error);
  }
}

async function handleImageUpload(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authService.getToken()}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload image");
  const data = await response.json();
  return data.data.id;
}

async function deleteImage(fileId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/files/${fileId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    },
  );
  if (!response.ok) throw new Error("Failed to delete image");
  return true;
}

async function fetchUserRole() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/me?fields=role.name`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch user role");
    const data = await response.json();
    userRole.value = data.data?.role?.name || "";
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
}

async function fetchTenants() {
  if (!isAdminRole.value) return;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch tenants");
    const data = await response.json();
    tenantOptions.value = data.data.map((tenant) => ({
      id: tenant.tenantId,
      name: tenant.tenantName,
    }));
  } catch (error) {
    console.error("Error fetching tenants:", error);
  }
}

const toggleDeviceGroupDropdown = () => {
  showDeviceGroupDropdown.value = !showDeviceGroupDropdown.value;
  if (showDeviceGroupDropdown.value) {
    fetchDeviceGroups();
  }
};

const fetchDeviceGroups = async () => {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=deviceGroup`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch device groups");
    }
    const data = await response.json();
    const uniqueGroups = [
      ...new Set(
        data.data
          .map((item) => item.deviceGroup)
          .filter((group) => group && group.trim() !== ""),
      ),
    ];
    deviceGroups.value = uniqueGroups;
    filteredDeviceGroups.value = uniqueGroups;
  } catch (error) {
    console.error("Error fetching device groups:", error);
    showErrorMessage("Failed to load device groups");
  }
};

const filterDeviceGroups = () => {
  if (!deviceGroupSearch.value) {
    filteredDeviceGroups.value = deviceGroups.value;
  } else {
    filteredDeviceGroups.value = deviceGroups.value.filter((group) =>
      group.toLowerCase().includes(deviceGroupSearch.value.toLowerCase()),
    );
  }
};

const selectDeviceGroup = (group) => {
  formData.deviceGroup = group;
  showDeviceGroupDropdown.value = false;
  showAddGroupPopup.value = false;
};

const showAddNewGroupInput = () => {
  showAddGroupPopup.value = true;
  newDeviceGroup.value = "";
  nextTick(() => {
    if (newGroupInput.value) {
      newGroupInput.value.focus();
    }
  });
};

const addNewDeviceGroup = async () => {
  if (!newDeviceGroup.value.trim()) {
    return;
  }
  try {
    const newGroup = newDeviceGroup.value.trim();
    deviceGroups.value.push(newGroup);
    filteredDeviceGroups.value = deviceGroups.value;
    formData.deviceGroup = newGroup;
    showAddGroupPopup.value = false;
    showDeviceGroupDropdown.value = false;
    newDeviceGroup.value = "";
    showSuccessMessage("Device group added successfully!");
  } catch (error) {
    console.error("Error creating device group:", error);
    showErrorMessage(error.message || "Failed to create device group");
  }
};

async function saveController() {
  if (props.isEditing) {
    await editController();
  } else {
    await createNewController();
  }
}

async function generateSequentialDoorNumber() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=doorNumber`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch door numbers: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return "1";
    }

    let maxDoorNumber = 0;
    for (const door of data.data) {
      if (door.doorNumber) {
        const numericPart = parseInt(door.doorNumber.replace(/\D/g, ""), 10);
        if (!isNaN(numericPart) && numericPart > maxDoorNumber) {
          maxDoorNumber = numericPart;
        }
      }
    }

    return (maxDoorNumber + 1).toString();
  } catch (error) {
    console.error("Error generating door number:", error);
    return "1";
  }
}

async function createNewController() {
  formSubmitAttempted.value = true;
  const mandatoryFields = ["controllerId", "controllerName"];
  if (isAttendanceModeRequired()) {
    mandatoryFields.push("attendanceMode");
  }
  let hasErrors = false;
  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  if (hasErrors) {
    showErrorMessage("Please fill in all required fields");
    return;
  }

  try {
    validateFormData(formData);
  } catch (error) {
    showErrorMessage(error.message);
    return;
  }

  try {
    const resolvedTenantId =
      isAdminRole.value && formData.tenant
        ? formData.tenant
        : await resolveTenantId();
    const status = "approved";

    const payload = {
      id: formData.controllerId,
      controllerName: formData.controllerName,
      controllerIP: formData.controllerIP,
      deviceName: formData.deviceName,
      serverIp: formData.serverIp,
      sn: formData.sn,
      status: status,
      controllerImage: currentImageId.value,
      controllerStatus: "waiting",
      tenant: resolvedTenantId,
      branch: formData.branch || null,
      deviceGroup: formData.deviceGroup || null,
      selectedDoors: [],
    };

    if (formData.controllerName === "AI face") {
      payload.attendanceMode = formData.attendanceMode || null;
      payload.controllerType = "1";
      payload.identification_Intervel = formData.identification_Intervel || 0;
      payload.identification_distance = formData.identification_distance || 0;
      payload.comparison_threshold =
        parseFloat(formData.comparison_threshold) || 0;
      payload.quality_threshold = parseFloat(formData.quality_threshold) || 0;
      payload.liveness_threshold = parseFloat(formData.liveness_threshold) || 0;
    } else {
      payload.controllerType = formData.controllerType;
      payload.attendanceMode = formData.attendanceMode || null;

      if (advanceDoorMode.value) {
        payload.doorMode = formData.doorMode || null;
        payload.interlockMode = formData.interlockMode || null;
        payload.interval = formData.interval || null;
        payload.antiPassbackMode = formData.antiPassbackMode || null;
      } else {
        payload.doorMode = "4Reader-4Switch";
        payload.interlockMode = "No Interlock";
        payload.interval = "60";
        payload.antiPassbackMode = "No anti pass-back mode";
      }

      const doorCount = parseInt(formData.controllerType) || 0;
      const createdDoors = [];
      const selectedDoors = [];

      for (let i = 1; i <= doorCount; i++) {
        const doorNumber = await generateSequentialDoorNumber();
        const doorName = `${formData.controllerId}-${i}`;
        const uniqueId = `${resolvedTenantId}-${doorNumber}`;

        const doorPayload = {
          doorName: doorName,
          doorNumber: doorNumber,
          uniqueId: uniqueId,
          tenant: resolvedTenantId,
          branch: formData.branch || null,
          timerMode: "10",
          buzzerMode: 0,
          senzrMode: 0,
          passiveMode: 0,
          buzzerTimer: "10",
          status: "active",
        };

        const doorResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/doors`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(doorPayload),
          },
        );

        if (!doorResponse.ok) {
          const errorData = await doorResponse.json();
          throw new Error(
            `Failed to create door ${i}: ${errorData.errors?.[0]?.message || "Unknown error"}`,
          );
        }

        const doorData = await doorResponse.json();
        const doorId = doorData.data.id;

        selectedDoors.push(doorId);

        createdDoors.push({
          controllers_id: formData.controllerId,
          doors_id: {
            id: doorId,
            buzzerMode: 0,
            timerMode: "10",
            senzrMode: 0,
            passiveMode: 0,
            buzzerTimer: "10",
          },
        });
      }

      payload.selectedDoors = selectedDoors;

      if (createdDoors.length > 0) {
        payload.assignedDoor = {
          create: createdDoors,
        };
      }
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to create controller",
      );
    }

    await fetchDoors();

    showSuccessMessage("Device added successfully!");
    setTimeout(() => {
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error creating controller:", error);
    showErrorMessage(
      error.message || "Failed to create controller. Please try again.",
    );
  }
}

async function editController() {
  formSubmitAttempted.value = true;
  const mandatoryFields = ["controllerId", "controllerName"];
  if (isAttendanceModeRequired()) {
    mandatoryFields.push("attendanceMode");
  }
  let hasErrors = false;
  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  if (hasErrors) {
    showErrorMessage("Please fill in all required fields");
    return;
  }

  try {
    validateFormData(formData);
  } catch (error) {
    showErrorMessage(error.message);
    return;
  }

  try {
    const status = "approved";
    const payload = {
      controllerName: formData.controllerName,
      controllerIP: formData.controllerIP,
      deviceName: formData.deviceName,
      serverIp: formData.serverIp,
      status: status,
      deviceGroup: formData.deviceGroup || null,
      sn: formData.sn,
      controllerStatus: "waiting",
      selectedDoors: [], // Initialize selectedDoors array
    };

    if (formData.controllerName === "AI face") {
      payload.attendanceMode = formData.attendanceMode || null;
      payload.controllerType = "1";
      payload.identification_Intervel =
        formData.identification_Intervel || null;
      payload.identification_distance =
        formData.identification_distance || null;
      payload.comparison_threshold =
        parseFloat(formData.comparison_threshold) || 0;
      payload.quality_threshold = parseFloat(formData.quality_threshold) || 0;
      payload.liveness_threshold = parseFloat(formData.liveness_threshold) || 0;
    } else {
      payload.controllerType = formData.controllerType;
      payload.doorMode = formData.doorMode || null;
      payload.interlockMode = formData.interlockMode || null;
      payload.interval = formData.interval || null;
      payload.attendanceMode = formData.attendanceMode || null;
      payload.antiPassbackMode = formData.antiPassbackMode || null;

      // Populate selectedDoors with door IDs from doorAssignments
      payload.selectedDoors = formData.doorAssignments
        .filter((assignment) => assignment.doorId)
        .map((assignment) => assignment.doorId);

      // Update door properties via individual PATCH requests
      const doorsToPatch = formData.doorAssignments
        .filter((assignment) => assignment.doorId)
        .map((assignment) => ({
          id: assignment.doorId,
          payload: {
            timerMode: assignment.timerMode || "10",
            buzzerMode: assignment.buzzerMode ? 1 : 0,
            senzrMode: assignment.senzrMode ? 1 : 0,
            passiveMode: assignment.passiveMode ? 1 : 0,
            buzzerTimer: assignment.buzzerTimer || "10",
          },
        }));

      // Send PATCH requests for each door
      for (const door of doorsToPatch) {
        const patchResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/doors/${door.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(door.payload),
          },
        );

        if (!patchResponse.ok) {
          const errorData = await patchResponse.json();
          console.error("Failed to update door:", errorData);
          throw new Error(
            `Failed to update door ${door.id}: ${
              errorData.errors?.[0]?.message || "Unknown error"
            }`,
          );
        }
      }
    }

    if (formData.branch) {
      payload.branch = { id: formData.branch };
    }
    if (isAdminRole.value && formData.tenant) {
      payload.tenant = formData.tenant;
    }

    if (currentImageId.value !== props.deviceData?.controllerImage?.id) {
      payload.controllerImage = currentImageId.value;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers/${props.deviceData?.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update controller",
      );
    }

    await fetchDoors();

    showSuccessMessage("Controller updated successfully!");
    setTimeout(() => {
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error updating controller:", error);
    showErrorMessage(
      error.message || "Failed to update controller. Please try again.",
    );
  }
}

async function resolveTenantId() {
  if (props.tenantId instanceof Promise) {
    return await props.tenantId;
  }
  return props.tenantId;
}

async function fetchExistingControllers() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/controllers?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=assignedDoor.doors_id.id&fields=assignedDoor.doors_id.buzzerMode&fields=assignedDoor.doors_id.timerMode&fields=assignedDoor.doors_id.buzzerMode&fields=assignedDoor.doors_id.timerMode&fields=assignedDoor.doors_id.senzrMode&fields=assignedDoor.doors_id.buzzerTimer&fields=id&fields=assignedDoor.doors_id.passiveMode`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    const assignedIds = new Set();
    data.data.forEach((controller) => {
      controller.assignedDoor?.forEach((assignment) => {
        if (assignment.doors_id?.id) {
          assignedIds.add(assignment.doors_id.id);
        }
      });
    });
    globallyAssignedDoorIds.value = assignedIds;
  } catch (error) {
    console.error(
      "Error fetching existing controllers for global door check:",
      error,
    );
  }
}

const getAvailableDoorOptions = (currentIndex) => {
  const selectedDoorIdsInCurrentForm = new Set(
    formData.doorAssignments
      .filter((_, i) => i !== currentIndex)
      .map((assignment) => assignment.doorId)
      .filter(Boolean),
  );

  const currentDeviceAssignedDoorIds = new Set(
    props.isEditing && props.deviceData?.assignedDoor
      ? props.deviceData.assignedDoor.map((d) => d.doors_id?.id).filter(Boolean)
      : [],
  );

  const filtered = doorOptions.value.filter((door) => {
    const isSelectedInCurrentForm = selectedDoorIdsInCurrentForm.has(door.id);
    const isGloballyAssigned = globallyAssignedDoorIds.value.has(door.id);
    const isAssignedToCurrentDevice = currentDeviceAssignedDoorIds.has(door.id);

    if (props.isEditing && isAssignedToCurrentDevice) {
      return !isSelectedInCurrentForm;
    } else {
      return !isSelectedInCurrentForm && !isGloballyAssigned;
    }
  });

  return filtered;
};

const handleDoorAssignmentChange = (val, index, field) => {
  if (field === "doorId") {
    formData.doorAssignments[index].doorId = val;
    if (val !== null) {
      const selectedDoor = doorOptions.value.find((door) => door.id === val);
      if (selectedDoor) {
        formData.doorAssignments[index].timerMode =
          selectedDoor.timerMode || "10";
        formData.doorAssignments[index].buzzerMode = selectedDoor.buzzerMode;
        formData.doorAssignments[index].senzrMode =
          selectedDoor.senzrMode || false;
        formData.doorAssignments[index].passiveMode =
          selectedDoor.passiveMode || false;
        formData.doorAssignments[index].buzzerTimer =
          selectedDoor.buzzerTimer || "10";
      } else {
        formData.doorAssignments[index].timerMode = "10";
        formData.doorAssignments[index].senzrMode = false;
        formData.doorAssignments[index].buzzerMode = false;
        formData.doorAssignments[index].passiveMode = false;
        formData.doorAssignments[index].buzzerTimer = "10";
      }
    } else {
      formData.doorAssignments[index].timerMode = "10";
      formData.doorAssignments[index].senzrMode = false;
      formData.doorAssignments[index].buzzerMode = false;
      formData.doorAssignments[index].passiveMode = false;
      formData.doorAssignments[index].buzzerTimer = "10";
    }
  } else {
    formData.doorAssignments[index][field] = val;
  }
};

async function fetchBranches() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/branch?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    branchOptions.value = data.data.map((branch) => ({
      id: branch.id,
      name: branch.branchName,
    }));
  } catch (error) {
    console.error("Error fetching branches:", error);
  }
}

function populateDoorAssignmentsFromDeviceData(newVal) {
  try {
    Object.keys(formData).forEach((key) => {
      if (key !== "doorAssignments") {
        formData[key] = "";
      }
    });

    formData.doorAssignments = Array(4)
      .fill(null)
      .map(() => ({
        doorId: null,
        timerMode: "10",
        buzzerMode: false,
        senzrMode: false,
        passiveMode: false,
        buzzerTimer: "10",
        junctionId: null,
      }));

    formData.controllerId = newVal.id || "";
    formData.controllerName = newVal.controllerName || "";
    formData.controllerIP = newVal.controllerIP || "";
    formData.deviceName = newVal.deviceName || "";
    formData.identification_Intervel = newVal.identification_Intervel || "";
    formData.identification_distance = newVal.identification_distance || "";
    formData.comparison_threshold = newVal.comparison_threshold || "";
    formData.quality_threshold = newVal.quality_threshold || "";
    formData.liveness_threshold = newVal.liveness_threshold || "";
    formData.serverIp = newVal.serverIp || "";
    formData.sn = newVal.sn || "";
    formData.controllerType = newVal.controllerType || "";
    formData.status = newVal.status || "approved";
    formData.doorMode = newVal.doorMode || "4Reader-4Switch";
    formData.interlockMode = newVal.interlockMode || "No Interlock";
    formData.interval = newVal.interval || "60";
    formData.attendanceMode = newVal.attendanceMode || "InOut";
    formData.antiPassbackMode =
      newVal.antiPassbackMode || "No anti pass-back mode";
    formData.deviceGroup = newVal.deviceGroup || "";

    if (newVal?.controllerImage?.id) {
      currentImageId.value = newVal.controllerImage.id;
      formData.controllerImage = newVal.controllerImage.id;
    }

    if (newVal?.selectedDoors && newVal.selectedDoors.length > 0) {
      newVal.selectedDoors.forEach((doorId, index) => {
        if (index < 4) {
          const correspondingDoor = doorOptions.value.find(
            (d) => d.id === doorId,
          );

          if (correspondingDoor) {
            console.log("called1", newVal);
            formData.doorAssignments[index] = {
              doorId: doorId || null,
              timerMode: String(correspondingDoor.timerMode || "10"),
              buzzerMode: correspondingDoor.buzzerMode,
              senzrMode: correspondingDoor.senzrMode,
              passiveMode: correspondingDoor.passiveMode,
              buzzerTimer: String(correspondingDoor.buzzerTimer || "10"),
            };
          } else {
            formData.doorAssignments[index] = {
              doorId: doorId || null,
              timerMode: "10",
              buzzerMode: false,
              senzrMode: false,
              passiveMode: false,
              buzzerTimer: "10",
            };
          }
        }
      });
    }

    if (newVal?.branch?.id) {
      formData.branch = newVal.branch.id;
    }
    if (newVal?.tenant?.tenantId) {
      formData.tenant = newVal.tenant.tenantId;
    }
  } catch (error) {
    console.error("Error populating form data:", error);
    showErrorMessage("Error loading controller data. Please try again.");
  }
}
const fetchDoors = async () => {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/doors?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=id,doorName,buzzerMode,timerMode,senzrMode,passiveMode,buzzerTimer`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    let availableDoors = data.data.map((door) => ({
      id: door.id,
      doorName: door.doorName,
      senzrMode: door.senzrMode,
      passiveMode: door.passiveMode,
      timerMode: door.timerMode || "10",
      buzzerMode: door.buzzerMode,
      buzzerTimer: door.buzzerTimer || "10",
    }));
    doorOptions.value = availableDoors;
  } catch (error) {
    console.error("Error fetching doors:", error);
  }
};
watch(
  () => props.deviceData,
  (newVal) => {
    if (props.isEditing && newVal) {
      if (doorOptions.value.length === 0) {
        const unwatchDoors = watch(
          doorOptions,
          (currentDoorOptions) => {
            if (currentDoorOptions.length > 0) {
              populateDoorAssignmentsFromDeviceData(newVal);
              unwatchDoors();
            }
          },
          { immediate: true },
        );
        return;
      }
      populateDoorAssignmentsFromDeviceData(newVal);
    }
  },
  { immediate: true, deep: true },
);

watch(
  formData,
  (newVal, oldVal) => {
    Object.keys(newVal).forEach((field) => {
      if (newVal[field] && formErrors.value[field]) {
        formErrors.value[field] = "";
      }
    });
  },
  { deep: true },
);

watch(currentTab, (newTab, oldTab) => {
  if (oldTab) {
    const mandatoryFields = tabRequiredFields[oldTab];
    mandatoryFields.forEach((field) => {
      if (!formData[field]) {
        touchedFields.value[field] = true;
        formErrors.value[field] = "This field is required";
      }
    });
  }
});

watch(
  () => formData.controllerIP,
  (newValue) => {
    if (newValue) {
      formData.controllerIP = newValue.replace(/[^\d.]/g, "");
    }
  },
);

watch(
  () => formData.serverIp,
  (newValue) => {
    if (newValue) {
      formData.serverIp = newValue.replace(/[^\d.]/g, "");
    }
  },
);

watch(
  () => formData.controllerId,
  (newValue) => {
    formData.sn = newValue;
  },
);

watch(
  () => formData.controllerName,
  async (newValue) => {
    if (newValue === "AI face") {
      formData.controllerType = "1";
      if (currentTab.value === "assignedDoors") {
        currentTab.value = "basic";
      }
      await uploadImageForController("AI face");
    } else if (newValue === "finger print") {
      formData.controllerType = "1";
      await uploadImageForController("finger print");
    } else if (newValue === "4 door device") {
      formData.controllerType = "4";
      await uploadImageForController("4 door device");
    }
  },
);

watch(
  () => formData.controllerType,
  (newValue) => {
    const newType = parseInt(newValue || "0");
    formData.doorAssignments.forEach((assignment, index) => {
      if (index >= newType) {
        formData.doorAssignments[index] = {
          doorId: null,
          timerMode: "10",
          buzzerMode: false,
          senzrMode: false,
          passiveMode: false,
          buzzerTimer: "10",
          junctionId: null,
        };
      }
    });
  },
);

function getDefaultImagePath(controllerName) {
  switch (controllerName) {
    case "AI face":
      return "/deviceImages/Aiface.jpg";
    case "finger print":
      return "/deviceImages/FingerPrint.jpg";
    case "4 door device":
      return "/deviceImages/DoorDevice.jpg";
    default:
      return null;
  }
}

const getImageUrl = () => {
  if (currentImageId.value) {
    return `${import.meta.env.VITE_API_URL}/assets/${currentImageId.value}?access_token=${authService.getToken()}`;
  } else if (formData.controllerName) {
    return getDefaultImagePath(formData.controllerName);
  }
  return null;
};

async function uploadImageForController(controllerName) {
  try {
    const imagePath = getDefaultImagePath(controllerName);
    if (!imagePath) {
      console.warn("No default image path for controllerName:", controllerName);
      return;
    }
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const fileName = `${controllerName.replace(/\s+/g, "_")}.jpg`;
    const file = new File([blob], fileName, { type: "image/jpeg" });
    const fileId = await handleImageUpload(file);
    currentImageId.value = fileId;
    formData.controllerImage = fileId;
  } catch (error) {
    console.error("Error uploading controller image:", error);
    imageError.value = "Failed to upload image for controller";
  }
}

const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll(".custom-dropdown");
  let clickedOutside = true;
  dropdowns.forEach((dropdown) => {
    if (dropdown.contains(event.target)) {
      clickedOutside = false;
    }
  });
  if (clickedOutside && showDeviceGroupDropdown.value) {
    showDeviceGroupDropdown.value = false;
  }
};

onMounted(async () => {
  await fetchUserRole();
  await fetchTenants();
  await fetchDoors();
  await fetchExistingControllers();
  await fetchBranches();
  document.addEventListener("click", handleClickOutside);
  fetchDeviceGroups();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.controller-form-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  width: 100%;
  max-width: 100%;
}
.form-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  border-bottom: 1px solid #e0e0e0;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
/* Common UI Styles for both Add and Edit */
.form-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden; /* Keep this for the overall wrapper */
}
.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto; /* Enable scrolling for sidebar if content overflows */
  flex-shrink: 0; /* Prevent sidebar from shrinking */
}
.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto; /* Enable scrolling for main form content */
  height: calc(100vh - 64px); /* Adjust height to allow scrolling */
}
.form-section {
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.has-error {
  color: rgb(var(--v-theme-error));
}
:deep(.v-list-item--active) {
  background-color: #eee;
}
:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}
/* Form Field Layout */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}
.form-row > * {
  flex: 1 1 280px; /* Allow items to grow and shrink, with a minimum width */
}
.split-section {
  display: flex;
  gap: 30px;
  margin-bottom: 20px; /* Added margin-bottom for spacing after moving */
}
.image-section {
  flex: 1;
  max-width: 300px;
  flex-shrink: 0;
}
.device-image {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
.device-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.device-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4169e1, #7b68ee);
  border-radius: 8px;
  color: white;
  text-align: center;
  padding: 20px;
}
.placeholder-text {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 500;
}
.device-details-section {
  flex: 2;
  min-width: 0;
}
.details-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  position: relative;
}
.detail-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.sn-icon {
  background-color: #e3f2fd;
  color: #2196f3;
}
.device-type-icon {
  background-color: #e3f2fd;
  color: #2196f3;
}
.attendance-mode-icon {
  background-color: #e8f5e9;
  color: #4caf50;
}
.passback-icon {
  background-color: #fff3e0;
  color: #ff9800;
}
.timer-icon {
  background-color: #fff3e0;
  color: blue;
}
.door-icon {
  background-color: #fff3e0;
  color: green;
}
.parking-icon {
  background-color: #f3e5f5;
  color: #9c27b0;
}
.interval-icon {
  background-color: #fff3e0;
  color: #ff9800;
}
.interlock-icon {
  background-color: #ede7f6;
  color: #673ab7;
}
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label {
  font-size: 0.875rem;
  color: #666;
}
.detail-value {
  font-weight: 600;
  color: #333;
}
.info-icon {
  cursor: pointer;
  color: #666;
}
.info-banner {
  background-color: rgb(231, 242, 252);
  color: rgb(13, 60, 97);
  padding: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  border-radius: 4px;
  width: 100%;
}
.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
  animation:
    fadeIn 0.3s ease-in-out,
    fadeOut 0.3s ease-in-out 2.7s;
  order: -1;
}
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
  animation:
    fadeIn 0.3s ease-in-out,
    fadeOut 0.3s ease-in-out 2.7s;
  order: -1;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@media (max-width: 1200px) {
  .form-row > * {
    flex: 1 1 calc(33.33% - 13.33px);
  }
}
@media (max-width: 900px) {
  .form-row > * {
    flex: 1 1 calc(50% - 10px);
  }
}
@media (max-width: 600px) {
  .form-row > * {
    flex: 1 1 100%;
  }
  .split-section {
    flex-direction: column;
  }
  .image-section {
    max-width: 100%;
  }
}
@media (max-width: 768px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
  .image-panel {
    max-height: 300px;
  }
  .details-grid {
    grid-template-columns: 1fr;
  }
}
/* Device group dropdown styles */
.device-group-container {
  position: relative;
  width: 100%;
}
.custom-dropdown {
  position: relative;
  width: 100%;
}
.dropdown-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  min-height: 40px;
}
.dropdown-active {
  border-color: #2196f3;
}
.placeholder {
  color: #999;
}
.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  z-index: 1000;
  margin-top: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.search-container {
  padding: 8px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}
.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.dropdown-items {
  padding: 8px 0;
}
.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}
.dropdown-item:hover {
  background-color: #f5f5f5;
}
.dropdown-item.selected {
  background-color: #e3f2fd;
  color: #2196f3;
}
.dropdown-item.add-new {
  display: flex;
  align-items: center;
  color: #2196f3;
  border-top: 1px solid #eee;
  margin-top: 8px;
}
/* Popup styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.popup-container {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.popup-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.close-icon {
  cursor: pointer;
  color: #666;
}
.popup-content {
  padding: 20px;
}
.input-group {
  margin-bottom: 20px;
}
.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}
.input-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
.popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.cancel-btn {
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.add-btn {
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.add-btn:disabled {
  background-color: #b0bec5;
  cursor: not-allowed;
}
/* Fix for v-label to match Vuetify styling */
.v-label {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  margin-bottom: 4px;
  display: block;
}
/* NEW: Door Assignment Section Styles */
.door-assignment-section {
  margin-top: 30px;
  margin-bottom: 30px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}
.door-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
.door-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #fdfdfd;
}
.door-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #555;
}
.door-options {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #eee;
}
</style>
