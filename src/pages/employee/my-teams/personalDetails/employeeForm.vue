<!-- employeeForm.vue -->
<template>
  <div class="employee-form-container">
    <!-- Success message notification -->
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

    <!-- Header -->
    <div class="form-header">
      <div class="header-content">
        <v-btn icon variant="text" @click="$emit('cancel')" class="back-button">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h6">Add Employee</h2>
        <div class="first-name-container">
          <v-icon left>mdi-account</v-icon>
          <span class="first-name">{{ props.firstName }}</span>
          <v-tooltip bottom>
            <span>{{ props.titleAttachment }}</span>
          </v-tooltip>
        </div>
      </div>
      <div class="action-buttons">
        <v-btn color="error" variant="text" @click="$emit('cancel')"
          >CANCEL</v-btn
        >
        <v-btn color="black" @click="saveEmployee">SAVE</v-btn>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="form-content-wrapper">
      <!-- Left Sidebar with Tabs -->
      <div class="sidebar">
        <v-list>
          <v-list-item
            v-for="(tab, index) in filteredTabs"
            :key="index"
            :value="tab"
            :active="currentTab === tab.id"
            @click="currentTab = tab.id"
            :class="{ 'has-error': tabHasError(tab.id) }"
          >
            <template v-slot:prepend>
              <v-icon
                :color="tabHasErrorComputed(tab.id) ? 'error' : 'default'"
              >
                {{ tab.icon }}
              </v-icon>
            </template>

            <v-list-item-title>
              {{ tab.title }}
              <v-icon
                v-if="tabHasErrorComputed(tab.id)"
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

      <!-- Right Content Area -->
      <div class="form-content">
        <v-form ref="form" v-model="valid" @submit.prevent="saveEmployee">
          <!-- Personal Details Section -->
          <div v-show="currentTab === 'personal'" class="form-section">
            <h3>Employee Details</h3>
            <br />
            <v-row>
              <!-- Avatar Input -->
              <v-col cols="12" class="d-flex justify-center align-center mb-4">
                <div class="avatar-container">
                  <v-avatar size="150">
                    <v-img
                      v-if="avatarImage"
                      :src="avatarImage"
                      alt="Avatar"
                    ></v-img>
                    <v-icon
                      v-else
                      size="150"
                      color="grey lighten-1"
                      style="
                        border: 2px solid gray;
                        border-radius: 50%;
                        padding: 5px;
                      "
                      >mdi-account-circle</v-icon
                    >
                  </v-avatar>
                  <v-btn
                    icon
                    class="edit-avatar-btn"
                    @click="triggerFileInput"
                    color="white"
                    style="background-color: black"
                  >
                    <v-icon>mdi-camera</v-icon>
                  </v-btn>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  style="display: none"
                  accept="image/*"
                  @change="handleAvatarChange"
                />
              </v-col>
              <!-- First Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.firstName"
                  label="First Name *"
                  required
                  :error-messages="getFieldErrorMessage('firstName')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('firstName')"
                  @input="capitalizeFirstLetterEachWord('firstName')"
                ></v-text-field>
              </v-col>

              <!-- Middle Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.middleName"
                  label="Middle Name"
                  variant="outlined"
                  density="comfortable"
                  @input="capitalizeFirstLetterEachWord('middleName')"
                ></v-text-field>
              </v-col>

              <!-- Last Name -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.lastName"
                  label="Last Name"
                  variant="outlined"
                  density="comfortable"
                  @input="capitalizeFirstLetterEachWord('lastName')"
                ></v-text-field>
              </v-col>

              <!-- Employee ID  -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.employeeId"
                  label="Employee ID *"
                  required
                  :error-messages="getFieldErrorMessage('employeeId')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('employeeId')"
                ></v-text-field>
              </v-col>
              <!-- Gender -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.gender"
                  :items="['Female', 'Male', 'Other']"
                  label="Gender *"
                  required
                  :error-messages="getFieldErrorMessage('gender')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('gender')"
                ></v-select>
              </v-col>

              <!-- Phone -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.phone"
                  label="Phone"
                  type="number"
                  :error-messages="phoneErrorMessage"
                  variant="outlined"
                  density="comfortable"
                  @blur="validatePhone"
                  @input="clearPhoneError"
                  maxlength="10"
                ></v-text-field>
              </v-col>

              <!-- Email -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  :error-messages="emailErrorMessage"
                  variant="outlined"
                  density="comfortable"
                  @blur="validateEmail"
                  @input="
                    clearEmailError();
                    toLowerCase('email');
                  "
                ></v-text-field>
              </v-col>

              <!-- Office Email -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.officeEmail"
                  label="Office Email"
                  :error-messages="getFieldErrorMessage('officeEmail')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('officeEmail')"
                  @input="toLowerCase('officeEmail')"
                ></v-text-field>
              </v-col>

              <!-- Role -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.role"
                  :items="roleOptions"
                  item-title="name"
                  item-value="name"
                  label="Role"
                  :error-messages="getFieldErrorMessage('role')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('role')"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.skilled"
                  :items="[
                    'Skilled',
                    'HighlySkilled',
                    'UnSkilled',
                    'SemiSkilled',
                    'Drivers',
                    'OfficeStaffs',
                    'Others',
                  ]"
                  label="Skill Type"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- App Access Switch -->

              <!-- Working Range Slider -->
              <!-- <v-col cols="12" md="6">
                <v-slider
                  v-model="formData.workingRange"
                  label="Location Range"
                  min="0"
                  max="500"
                  step="1"
                  thumb-label="always"
                  color="black"
                  track-color="grey-lighten-2"
                  class="mt-4"
                >
                  <template v-slot:append>
                    <v-text-field
                      v-model="formData.workingRange"
                      density="compact"
                      style="width: 70px"
                      variant="outlined"
                      hide-details
                      single-line
                      class="ml-2"
                      readonly
                    ></v-text-field>
                  </template>
                </v-slider>
              </v-col> -->

              <v-col cols="12">
                <h3>Other Details</h3>
                <br />
              </v-col>

              <!-- Date of Birth -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.assignedUser.DOB"
                  label="Date of Birth"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="getFieldErrorMessage('DOB')"
                  :max="maxDate"
                  :min="minDate"
                  @input="handleInputChange('assignedUser.DOB')"
                  @blur="markFieldAsTouched('DOB')"
                ></v-text-field>
              </v-col>

              <!-- Marital Status -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.maritalStatus"
                  :items="['Married', `unMarried`]"
                  label="Marital Status"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>

              <!-- Blood Group -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.bloodGroup"
                  :items="['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']"
                  label="Blood Group"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </div>

          <!-- Government IDs Section -->
          <div v-show="currentTab === 'government'" class="form-section">
            <h3>Government IDs</h3>
            <br />
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.voterID"
                  label="Voter ID"
                  :rules="[rules.voterIdFormat]"
                  variant="outlined"
                  density="comfortable"
                  @input="toUpperCase('voterID')"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.drivingLicense"
                  :rules="[rules.drivingLicenseFormat]"
                  label="Driving License"
                  variant="outlined"
                  density="comfortable"
                  @input="toUpperCase('drivingLicense')"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.uan"
                  :rules="[rules.uanFormat]"
                  label="UAN"
                  variant="outlined"
                  density="comfortable"
                  @input="toUpperCase('uan')"
                ></v-text-field>
              </v-col>

              <!-- pan -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.pan"
                  label="PAN"
                  :rules="[rules.panFormat]"
                  variant="outlined"
                  density="comfortable"
                  @input="toUpperCase('pan')"
                ></v-text-field>
              </v-col>

              <!-- Aadhar -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.aadhar"
                  label="Aadhar"
                  type="number"
                  :rules="[rules.aadharFormat]"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Company Details Section -->
          <div v-show="currentTab === 'company'" class="form-section">
            <h3>Company Details</h3>
            <br />
            <v-row>
              <!-- Organization Field -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.organization"
                  :items="orgOptions"
                  item-title="orgName"
                  item-value="id"
                  label="Organization *"
                  required
                  :error-messages="getFieldErrorMessage('organization')"
                  variant="outlined"
                  density="comfortable"
                  @blur="markFieldAsTouched('organization')"
                  @update:model-value="handleOrganizationChange"
                ></v-select>
              </v-col>
              <!-- Designation -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.designation"
                  label="Designation"
                  variant="outlined"
                  density="comfortable"
                  @input="handleInputChange('designation')"
                ></v-text-field>
              </v-col>
              <!-- Department -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.department"
                  :items="departmentOptions"
                  item-title="name"
                  item-value="id"
                  label="Department"
                  :error-messages="getFieldErrorMessage('department')"
                  variant="outlined"
                  density="comfortable"
                  :disabled="!formData.organization"
                  @update:model-value="handleDepartmentChange"
                  @blur="markFieldAsTouched('department')"
                ></v-select>
                <p
                  v-if="!formData.organization"
                  class="text-caption text-black mt-1 d-flex align-center"
                >
                  <v-icon size="16" color="blue-darken-2" class="mr-1">
                    mdi-information
                  </v-icon>
                  <strong>Note:</strong>&nbsp;Please select an organization to
                  enable department selection.
                </p>
              </v-col>
              <!-- Branch Location -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.branchLocation"
                  :items="locationOptions"
                  item-title="name"
                  item-value="id"
                  label="Branch Location"
                  variant="outlined"
                  density="comfortable"
                  :disabled="!formData.organization"
                  @update:model-value="handleBranchLocationChange"
                  @blur="markFieldAsTouched('branchLocation')"
                ></v-select>
                <p
                  v-if="!formData.organization"
                  class="text-caption text-black mt-1 d-flex align-center"
                >
                  <v-icon size="16" color="blue-darken-2" class="mr-1">
                    mdi-information
                  </v-icon>
                  <strong>Note:</strong>&nbsp;Please select an organization to
                  enable branch location selection.
                </p>
              </v-col>
              <!-- Date of Joining -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.dateOfJoining"
                  label="Date of Joining"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <!-- Date of Leaving -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.dateOfLeaving"
                  label="Date of Leaving"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.cycleType"
                  :items="cycleTypeOptions"
                  item-title="cycleName"
                  item-value="cycleId"
                  label="Attendance Cycle Type"
                  variant="outlined"
                  density="comfortable"
                  @update:model-value="handleCycleTypeChange"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.approver"
                  :items="filteredApproverOptions"
                  item-title="name"
                  item-value="id"
                  label="Approver"
                  variant="outlined"
                  density="comfortable"
                  clearable
                >
                  <template v-slot:prepend-item>
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model="searchApprover"
                        label="Search by name"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-magnify"
                        hide-details
                        class="flex-grow-1 mr-2"
                        @input="debounceFilterApprover"
                      ></v-text-field>
                      <v-btn
                        variant="text"
                        density="compact"
                        :icon="
                          showApproverFilters ? 'mdi-chevron-up' : 'mdi-filter'
                        "
                        @click.stop="showApproverFilters = !showApproverFilters"
                      ></v-btn>
                    </div>
                    <v-expand-transition>
                      <v-card
                        v-if="showApproverFilters"
                        class="filter-dropdown mt-2"
                        elevation="4"
                      >
                        <v-card-text class="pa-2">
                          <v-select
                            v-model="selectedApproverDepartmentFilter"
                            :items="[
                              { id: 'all', name: 'All Departments' },
                              ...departmentOptions,
                            ]"
                            item-title="name"
                            item-value="id"
                            label="Department"
                            density="compact"
                            variant="outlined"
                            hide-details
                            @update:modelValue="filterApprovers"
                          ></v-select>
                        </v-card-text>
                      </v-card>
                    </v-expand-transition>
                    <v-divider class="mt-2"></v-divider>
                  </template>
                </v-select>
              </v-col>
              <!-- <v-col cols="12" md="6">
                <v-select
                  v-model="formData.reportingManager"
                  :items="reportingManagerOptions"
                  item-title="name"
                  item-value="id"
                  label="Reporting Manager"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  clearable
                  closable-chips
                >
                  <template v-slot:prepend-item>
                    <div class="d-flex align-center">
                    
                      <v-text-field
                        v-model="searchReportingManager"
                        label="Search by name"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-magnify"
                        hide-details
                        class="flex-grow-1 mr-2"
                        @input="debounceFilter"
                      ></v-text-field>

                   
                      <v-btn
                        variant="text"
                        density="compact"
                        :icon="showFilters ? 'mdi-chevron-up' : 'mdi-filter'"
                        @click.stop="showFilters = !showFilters"
                      ></v-btn>
                    </div>

                  
                    <v-expand-transition>
                      <v-card
                        v-if="showFilters"
                        class="filter-dropdown mt-2"
                        elevation="4"
                      >
                        <v-card-text class="pa-2">
                          <v-select
                            v-model="selectedBranchFilter"
                            :items="[
                              { id: 'all', name: 'All Branches' },
                              ...branchOptions,
                            ]"
                            item-title="name"
                            item-value="id"
                            label="Branch"
                            density="compact"
                            variant="outlined"
                            hide-details
                            @update:modelValue="filterReportingManagers"
                          ></v-select>
                          <v-select
                            v-model="selectedDepartmentFilter"
                            :items="[
                              { id: 'all', name: 'All Departments' },
                              ...departmentOptions,
                            ]"
                            item-title="name"
                            item-value="id"
                            label="Department"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="mt-2"
                            @update:modelValue="filterReportingManagers"
                          ></v-select>
                        </v-card-text>
                      </v-card>
                    </v-expand-transition>

                    <v-divider class="mt-2"></v-divider>
                  </template>
                </v-select>
              </v-col> -->
              <!-- Manages Employee -->
              <!-- <v-col cols="12" md="6">
                <v-select
                  v-model="formData.managesEmployees"
                  :items="managesEmployeeOptions"
                  item-title="name"
                  item-value="id"
                  label="Manages Employee"
                  variant="outlined"
                  density="comfortable"
                  multiple
                  chips
                  clearable
                  closable-chips
                >
                  <template v-slot:prepend-item>
                    <div class="d-flex align-center">
                      <v-text-field
                        v-model="searchManagesEmployee"
                        label="Search by name"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-magnify"
                        hide-details
                        class="flex-grow-1 mr-2"
                        @input="debounceFilterManagesEmployee"
                      ></v-text-field>
                      <v-btn
                        variant="text"
                        density="compact"
                        :icon="
                          showManagesEmployeeFilters
                            ? 'mdi-chevron-up'
                            : 'mdi-filter'
                        "
                        @click.stop="
                          showManagesEmployeeFilters =
                            !showManagesEmployeeFilters
                        "
                      ></v-btn>
                    </div>
                    <v-expand-transition>
                      <v-card
                        v-if="showManagesEmployeeFilters"
                        class="filter-dropdown mt-2"
                        elevation="4"
                      >
                        <v-card-text class="pa-2">
                          <v-select
                            v-model="selectedManagesEmployeeBranchFilter"
                            :items="[
                              { id: 'all', name: 'All Branches' },
                              ...branchOptions,
                            ]"
                            item-title="name"
                            item-value="id"
                            label="Branch"
                            density="compact"
                            variant="outlined"
                            hide-details
                            @update:modelValue="filterManagesEmployee"
                          ></v-select>
                          <v-select
                            v-model="selectedManagesEmployeeDepartmentFilter"
                            :items="[
                              { id: 'all', name: 'All Departments' },
                              ...departmentOptions,
                            ]"
                            item-title="name"
                            item-value="id"
                            label="Department"
                            density="compact"
                            variant="outlined"
                            hide-details
                            class="mt-2"
                            @update:modelValue="filterManagesEmployee"
                          ></v-select>
                        </v-card-text>
                      </v-card>
                    </v-expand-transition>
                    <v-divider class="mt-2"></v-divider>
                  </template>
                </v-select>
              </v-col> -->

              <v-col cols="12">
                <h3>PF and ESI Account</h3>
                <br />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.ESIAccountNumber"
                  type="number"
                  label="ESI Account Number"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.PFAccountNumber"
                  type="string"
                  label="UAN PF AccountNumber"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <div v-show="currentTab === 'access'" class="form-section">
            <AccessManagement
              :initial-data="{
                accessLevel: formData.accessLevel,
                accessOn: formData.accessOn,
              }"
              :access-level-options="accessLevelOptions"
              :tenant-id="tenantId"
              @update:accessLevel="(value) => (formData.accessLevel = value)"
              @update:accessOn="(value) => (formData.accessOn = value)"
              @update:assignedCards="(cards) => (assignedCards = cards)"
              ref="accessManagementRef"
            />
          </div>

          <!-- Attendance Category Section -->
          <div
            v-show="currentTab === 'attendanceCategory'"
            class="form-section"
          >
            <v-row>
              <v-col cols="12">
                <AttendanceSettingsEditor
                  v-model="formData.attendanceCategory"
                  :tenant-id="tenantId"
                  @update:workingHoursData="
                    (data) => (formData.employeeWorkingHours = data)
                  "
                  @update:holidayIds="
                    (ids) => (formData.employeeHolidays = ids)
                  "
                />
              </v-col>
            </v-row>
          </div>

          <!-- previous record section  -->
          <div v-show="currentTab === 'previousRecord'" class="form-section">
            <PastExperienceForm v-model="formData.previousRecords" />
          </div>

          <!-- bank details section -->
          <div v-show="currentTab === 'BankDetails'" class="form-section">
            <h3>Bank Details</h3>
            <BankDetails
              :initial-data="formData"
              @update:model-value="updateBankDetails"
            />
          </div>

          <!-- Verification Form Content -->
          <div
            v-show="currentTab === 'backgroundVerification'"
            class="form-section"
          >
            <h3>Background Verification</h3>
            <br />
            <BackgroundVerification
              :initial-data="{
                phone: formData.phone,
                aadhaar: formData.aadhar,
                pan: formData.pan,
                voterId: formData.voterID,
                uan: formData.uan,
                gst: formData.gst,
              }"
              :verification="formData.verification"
              @update:verification="
                (newVerification) => (formData.verification = newVerification)
              "
              @verification-complete="handleVerificationComplete"
            />
          </div>

          <!-- payroll category -->
          <div v-show="currentTab === 'salary'" class="form-section">
            <div class="payroll-category">
              <v-container class="pa-0">
                <h3>Payroll Category</h3>
                <br />
                <!-- Employee Profile Card -->
                <v-card class="profile-card mb-6">
                  <div class="salary-config pa-4">
                    <v-row>
                      <!-- Payroll Category -->
                      <v-col cols="12" md="4">
                        <label class="config-label">Payroll Category</label>
                        <div class="input-wrapper">
                          <v-icon color="primary" class="field-icon"
                            >mdi-cash-multiple</v-icon
                          >
                          <v-select
                            v-model="selectedSalarySetting"
                            :label="'select Category'"
                            :items="salarySettingsArray"
                            item-title="name"
                            item-value="id"
                            variant="outlined"
                            density="comfortable"
                            class="salary-select"
                            @update:model-value="onSalarySettingChange"
                            style="max-width: 350px; height: 56px"
                          />
                        </div>
                      </v-col>

                      <!-- Annual CTC -->
                      <v-col cols="6" md="2">
                        <label class="config-label">Annual CTC</label>
                        <div class="input-wrapper">
                          <v-icon color="success" class="field-icon"
                            >mdi-currency-inr</v-icon
                          >
                          <v-text-field
                            v-model="annualCTC"
                            :label="'annualCTC'"
                            :disabled="!selectedSalarySetting"
                            @input="calculateMonthlyCTC"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            type="number"
                            class="ctc-input"
                            prefix="₹"
                            style="max-width: 150px; height: 36px"
                          />
                        </div>
                      </v-col>

                      <!-- MONTHLY CTC -->
                      <v-col cols="6" md="2">
                        <label class="config-label">Monthly CTC</label>
                        <div class="inline-salary">
                          <v-icon color="success" class="field-icon"
                            >mdi-wallet</v-icon
                          >
                          <span class="salary-amount">₹{{ monthlyCTC }}</span>
                        </div>
                      </v-col>

                      <!-- Net Salary -->
                      <v-col cols="6" md="2">
                        <label class="config-label">Net Salary</label>
                        <div class="input-wrapper">
                          <v-icon color="success" class="field-icon"
                            >mdi-wallet</v-icon
                          >
                          <span class="salary-amount">₹{{ netSalary }}</span>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-card>

                <!-- Salary Breakdown Section -->
                <div v-if="selectedSalarySetting" class="salary-breakdown">
                  <v-row>
                    <v-col cols="12" lg="6">
                      <!-- Earnings Card -->
                      <v-card class="mb-4 earnings-card">
                        <div class="card-header earnings">
                          <div class="header-content">
                            <v-icon size="28" color="white"
                              >mdi-cash-plus</v-icon
                            >
                            <div class="header-text">
                              <h3>Earnings</h3>
                              <span class="amount">₹ {{ totalEarnings }}</span>
                            </div>
                            <v-icon
                              color="error"
                              class="mr-2"
                              v-if="basicPayValue < 0"
                              @click="showData"
                              >mdi-information</v-icon
                            >
                          </div>
                        </div>
                        <v-card-text>
                          <v-list>
                            <!-- Basic Pay -->
                            <v-list-item>
                              <template v-slot:prepend>
                                <v-icon color="primary">mdi-cash</v-icon>
                              </template>
                              <v-list-item-title>Basic Pay</v-list-item-title>
                              <template v-slot:append>
                                <div class="d-flex align-center">
                                  <span class="percentage mr-2"
                                    >{{ basicPay }}%</span
                                  >
                                  <span class="amount"
                                    >₹ {{ basicPayValue }}</span
                                  >
                                </div>
                              </template>
                            </v-list-item>

                            <!-- Other Earnings -->
                            <v-list-item
                              v-for="(item, index) in earnings"
                              :key="index"
                            >
                              <template v-slot:prepend>
                                <v-icon color="success">mdi-plus-circle</v-icon>
                              </template>
                              <v-list-item-title>{{
                                item.name
                              }}</v-list-item-title>
                              <template v-slot:append>
                                <div class="d-flex align-center">
                                  <span
                                    class="percentage mr-2"
                                    v-if="item.percentage"
                                    >{{ item.percentage }}%</span
                                  >
                                  <span class="amount"
                                    >₹ {{ item.amount }}</span
                                  >
                                </div>
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                      <!-- Employer Contributions Card -->
                      <v-card class="mb-4 employer-card">
                        <div class="card-header employer">
                          <div class="header-content">
                            <v-icon size="28" color="white"
                              >mdi-office-building</v-icon
                            >
                            <div class="header-text">
                              <h3>Employer Contributions</h3>
                              <span class="amount">₹ {{ totalEmployer }}</span>
                            </div>
                          </div>
                        </div>
                        <v-card-text>
                          <v-list>
                            <v-list-item
                              v-for="(item, index) in employerContributions"
                              :key="index"
                            >
                              <template v-slot:prepend>
                                <v-icon color="info">mdi-bank</v-icon>
                              </template>
                              <v-list-item-title>{{
                                item.name
                              }}</v-list-item-title>
                              <template v-slot:append>
                                <v-chip
                                  size="small"
                                  color="grey"
                                  variant="flat"
                                  class="mr-2"
                                  >{{ item.amount }}</v-chip
                                >
                                <v-chip
                                  size="small"
                                  color="success"
                                  variant="flat"
                                  class="mr-2"
                                  v-if="item.includedInCTC"
                                >
                                  In CTC
                                </v-chip>
                                <span class="amount">₹ {{ item.rupee }}</span>
                              </template>
                              <v-chip
                                size="small"
                                color="grey"
                                variant="flat"
                                class="mr-2"
                                >{{ item.component }}</v-chip
                              >
                            </v-list-item>
                            <v-list-item v-if="adminCharges.enable">
                              <template v-slot:prepend>
                                <v-icon color="warning"
                                  >mdi-account-arrow-left</v-icon
                                >
                              </template>
                              <v-list-item-title
                                >Admin Charges</v-list-item-title
                              >
                              <template v-slot:append>
                                <v-chip
                                  size="small"
                                  color="grey"
                                  variant="flat"
                                  class="mr-2"
                                  >{{ adminCharges.charge }}</v-chip
                                >
                                <span class="amount">{{ adminAmount }}</span>
                              </template>
                            </v-list-item>
                            <v-list-item>
                              <template v-slot:prepend>
                                <v-icon color="warning"
                                  >mdi-account-arrow-left</v-icon
                                >
                              </template>
                              <v-list-item-title>LWF</v-list-item-title>
                              <template v-slot:append>
                                <v-list-item-title v-if="lwfDeduction"
                                  >DeductionOn:</v-list-item-title
                                >
                                <v-chip
                                  v-if="lwfDeduction"
                                  size="small"
                                  color="grey"
                                  variant="flat"
                                  class="mr-2"
                                  >{{ lwfDeduction }}</v-chip
                                >
                                <span class="amount">{{ employerLWF }}</span>
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" lg="6">
                      <div class="right-cards">
                        <!-- Employee Contributions Card -->
                        <v-card class="mb-4 employee-card">
                          <div class="card-header employee">
                            <div class="header-content">
                              <v-icon size="28" color="white"
                                >mdi-account-cash</v-icon
                              >
                              <div class="header-text">
                                <h3>Employee Contributions</h3>
                                <span class="amount"
                                  >₹ {{ totalEmployee }}</span
                                >
                              </div>
                            </div>
                          </div>
                          <v-card-text>
                            <v-list>
                              <v-list-item
                                v-for="(item, index) in employeeContributions"
                                :key="index"
                              >
                                <template v-slot:prepend>
                                  <v-icon color="warning"
                                    >mdi-account-arrow-left</v-icon
                                  >
                                </template>
                                <v-list-item-title>{{
                                  item.name
                                }}</v-list-item-title>
                                <template v-slot:append>
                                  <v-chip
                                    size="small"
                                    color="grey"
                                    variant="flat"
                                    class="mr-2"
                                    >{{ item.amount }}</v-chip
                                  >
                                  <span class="amount">₹ {{ item.rupee }}</span>
                                </template>
                                <v-chip
                                  size="small"
                                  color="grey"
                                  variant="flat"
                                  class="mr-2"
                                  >{{ item.component }}</v-chip
                                >
                              </v-list-item>
                            </v-list>

                            <v-list-item>
                              <template v-slot:prepend>
                                <v-icon color="warning"
                                  >mdi-account-arrow-left</v-icon
                                >
                              </template>
                              <v-list-item-title>LWF</v-list-item-title>
                              <template v-slot:append>
                                <v-list-item-title v-if="lwfDeduction"
                                  >DeductionOn:</v-list-item-title
                                >
                                <v-chip
                                  v-if="lwfDeduction"
                                  size="small"
                                  color="grey"
                                  variant="flat"
                                  class="mr-2"
                                  >{{ lwfDeduction }}</v-chip
                                >
                                <span class="amount">{{ employeeLWF }}</span>
                              </template>
                            </v-list-item>
                            <v-list-item>
                              <template v-slot:prepend>
                                <v-icon color="warning"
                                  >mdi-account-arrow-left</v-icon
                                >
                              </template>
                              <v-list-item-title>PT</v-list-item-title>
                              <template v-slot:append>
                                <span class="amount">{{
                                  professionalTaxAmount
                                }}</span>
                              </template>
                            </v-list-item>
                          </v-card-text>
                        </v-card>

                        <!-- Deductions Card -->
                        <v-card class="mb-4 deductions-card">
                          <div class="card-header deductions">
                            <div class="header-content">
                              <v-icon size="28" color="white"
                                >mdi-cash-minus</v-icon
                              >
                              <div class="header-text">
                                <h3>Deductions</h3>
                                <span class="amount"
                                  >₹ {{ totalDeductions }}</span
                                >
                              </div>
                            </div>
                          </div>
                          <v-card-text>
                            <v-list>
                              <v-list-item
                                v-for="(item, index) in deductions"
                                :key="index"
                              >
                                <template v-slot:prepend>
                                  <v-icon color="error"
                                    >mdi-minus-circle</v-icon
                                  >
                                </template>
                                <v-list-item-title>{{
                                  item.name
                                }}</v-list-item-title>
                                <template v-slot:append>
                                  <div class="d-flex align-center">
                                    <span
                                      class="percentage mr-2"
                                      v-if="item.percentage"
                                    >
                                      {{ item.percentage }}%
                                    </span>
                                    <span class="amount"
                                      >₹ {{ item.amount }}</span
                                    >
                                  </div>
                                </template>
                              </v-list-item>
                            </v-list>
                          </v-card-text>
                        </v-card>
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <!-- Action Footer -->
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon color="info" class="mr-2">mdi-information</v-icon>
                      <span class="text-info"
                        >Want to modify the payroll configuration?</span
                      >
                    </div>
                    <v-btn
                      color="primary"
                      variant="elevated"
                      @click="redirectToPayrollConfig"
                      prepend-icon="mdi-cog"
                    >
                      Payroll Category Settings
                    </v-btn>
                  </div>
                </v-card-text>
              </v-container>
            </div>
          </div>
          <!-- Add this section to your template where the other tabs are defined -->
          <div v-show="currentTab === 'LeavePolicy'" class="form-section">
            <h3>Leave Policy</h3>
            <br />
            <v-row>
              <v-col cols="12">
                <v-card v-if="enabledLeaves.length > 0">
                  <v-card-title>Available Leave Policies</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item
                        v-for="(leave, index) in enabledLeaves"
                        :key="index"
                      >
                        <template v-slot:prepend>
                          <v-icon
                            :color="getLeaveColor(leave.leaveName)"
                            size="24"
                          >
                            {{ getLeaveIcon(leave.leaveName).icon }}
                          </v-icon>
                        </template>

                        <v-list-item-title>
                          {{ formatLeaveType(leave.leaveName) }}
                        </v-list-item-title>

                        <template v-slot:append>
                          <v-switch
                            v-model="leave.isAssigned"
                            color="primary"
                            hide-details
                            class="mr-3"
                          ></v-switch>
                          <v-btn
                            icon
                            size="small"
                            class="mr-3"
                            @click="leave.isEditing = !leave.isEditing"
                          >
                            <v-icon>mdi-pencil</v-icon>
                          </v-btn>
                          <v-text-field
                            v-if="leave.isEditing"
                            v-model="leave.leaveConfig.days"
                            type="number"
                            min="0"
                            dense
                            outlined
                            hide-details
                            class="mr-2 days-input"
                            style="max-width: 100px"
                            @change="updateLeaveBalance(leave)"
                            label="Days"
                          ></v-text-field>
                          <v-chip
                            color="primary"
                            variant="outlined"
                            class="mr-2"
                          >
                            {{ leave.leaveConfig?.days || 0 }} Days
                          </v-chip>
                          <v-chip color="primary" variant="outlined">
                            {{ leave.leaveConfig?.monthLimit || 0 }} Month limit
                          </v-chip>
                          <v-chip color="primary" variant="outlined">
                            {{ leave.leaveConfig?.limit || 0 }} Carry Forward
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <v-alert v-else type="info" variant="tonal">
                  No active leave policies found for the current year.
                </v-alert>
              </v-col>
            </v-row>
          </div>
          <!-- emergency Contact -->
          <div
            v-show="currentTab === 'EmergencyContactDetails'"
            class="form-section"
          >
            <h3>Emergency Contact Details</h3>
            <br />
            <v-row>
              <!-- Emergency Contact Section -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.emergencyContactName"
                  label="Emergency Contact Name"
                  variant="outlined"
                  density="comfortable"
                  @input="capitalizeFirstLetterEachWord('emergencyContactName')"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.emergencyContactMobileNumber"
                  label="Emergency Contact Mobile Number"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.emergencyContactRelationship"
                  label="Emergency Contact Relationship"
                  variant="outlined"
                  density="comfortable"
                  @input="
                    capitalizeFirstLetterEachWord(
                      'emergencyContactRelationship',
                    )
                  "
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.guardiansName"
                  label="Guardian's Name"
                  variant="outlined"
                  density="comfortable"
                  @input="capitalizeFirstLetterEachWord('guardiansName')"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.emergencyContactAddress"
                  label="Emergency Contact Address"
                  rows="3"
                  variant="outlined"
                  density="comfortable"
                ></v-textarea>
              </v-col>
            </v-row>
          </div>

          <!-- employee Address -->
          <div v-show="currentTab === 'Appaccess'" class="form-section">
            <!-- App Access Section -->
            <h3>App Access Settings</h3>
            <br />
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.appAccess"
                  label="FieldOps App Access"
                  color="primary"
                  inset
                  hide-details
                  :true-value="true"
                  :false-value="false"
                ></v-switch>
              </v-col>
            </v-row>

            <!-- Attendance Mode Section -->
            <h3 class="mt-6">Attendance Mode Settings</h3>
            <br />
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.GeoAttendance"
                  label="GEO Attendance Mode"
                  color="primary"
                  inset
                  hide-details
                  :true-value="true"
                  :false-value="false"
                ></v-switch>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.QrAttendance"
                  label="QR Code Attendance Mode"
                  color="primary"
                  inset
                  hide-details
                  :true-value="true"
                  :false-value="false"
                  hint="Enable or disable QR Code attendance mode"
                ></v-switch>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.selfieAttendance"
                  label="SelfieAttendance Mode"
                  color="primary"
                  inset
                  hide-details
                  :true-value="true"
                  :false-value="false"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.faceAttendance"
                  label="Face Attendance Mode"
                  color="primary"
                  inset
                  hide-details
                  :true-value="true"
                  :false-value="false"
                ></v-switch>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { authService } from "@/services/authService";
import { convertToCardAccessHex } from "@/utils/helpers/convertToCardAccessHex";
import BackgroundVerification from "./backdround.vue";
import BankDetails from "./bank.vue";
import AccessManagement from "./employeeAddForm/accessManagement.vue";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import AttendanceSettingsEditor from "./employeeAddForm/attendance/attendanceManagement.vue"; // Updated import path
import { useRouter } from "vue-router";
import PastExperienceForm from "./employeeAddForm/pastExperience.vue";
const bankDetails = ref({});
import { debounce } from "lodash";

// Redirect functions
const redirectToAttendanceConfig = () => {
  router.push("/settings/attendanceCatagory");
};

const redirectToPayrollConfig = () => {
  router.push("/settings/payrollCatagory");
};

const capitalizeFirstLetterEachWord = (field) => {
  formData[field] = formData[field]
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const toLowerCase = (field) => {
  formData[field] = formData[field].toLowerCase();
};

const toUpperCase = (field) => {
  formData[field] = formData[field].toUpperCase();
};

const updateBankDetails = (newBankDetails) => {
  bankDetails.value = newBankDetails;
};

const phoneErrorMessage = ref("");
const emailErrorMessage = ref("");

const validatePhone = async () => {
  const phone = formData.phone;

  if (!phone) {
    phoneErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[phone][_eq]=%2B91${phone}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to validate phone number");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      phoneErrorMessage.value =
        "This phone number already exists. Please use a different number.";
      return false;
    } else {
      phoneErrorMessage.value = "";
      return true;
    }
  } catch (error) {
    console.error("Error checking phone number:", error);
    phoneErrorMessage.value = "Error checking phone number";
    return false;
  }
};
const filteredApproverOptions = computed(() => {
  if (!formData.role) return [];

  // Filter approvers based on the selected role
  return approverOptions.value.filter((approver) => {
    if (formData.role === "Admin") {
      // For Admin role, show only Managers
      return approver.role === "Manager";
    } else if (formData.role === "Employee") {
      // For Employee role, show only Managers
      return approver.role === "Manager";
    } else if (formData.role === "Manager") {
      // For Manager role, show only Admins
      return approver.role === "Admin";
    }
    return false;
  });
});
const validateEmail = async () => {
  const email = formData.email;

  if (!email) {
    emailErrorMessage.value = "";
    return true;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users?filter[email][_eq]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to validate email");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      emailErrorMessage.value =
        "This email already exists. Please use a different email.";
      return false;
    } else {
      emailErrorMessage.value = "";
      return true;
    }
  } catch (error) {
    console.error("Error checking email:", error);
    emailErrorMessage.value = "Error checking email";
    return false;
  }
};

const clearEmailError = () => {
  emailErrorMessage.value = "";
};

const clearPhoneError = () => {
  phoneErrorMessage.value = "";
};

const props = defineProps({
  firstName: String,
  tenantId: String,
  titleAttachment: String,
});
const emit = defineEmits(["save-success", "cancel"]);

// Initialize other reactive references
const router = useRouter();
const currentTab = ref("personal");
const formSubmitAttempted = ref(false);
const assignedCards = ref([]);
const formErrors = ref({});
const touchedFields = ref({});
const form = ref(null);
const valid = ref(false);
const fileInput = ref(null);
const avatarImage = ref(null);
const currentAvatarId = ref(null);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const selectedAvatarFile = ref(null);
const accessManagementRef = ref(null);
const isInitialized = ref(false);
const leaveSettings = ref([]);
const enabledLeaves = ref([]);
const selectedBranchFilter = ref("all");
const selectedDepartmentFilter = ref("all");
const searchReportingManager = ref("");
const showFilters = ref(false);
const selectedManagesEmployeeBranchFilter = ref("all");
const selectedManagesEmployeeDepartmentFilter = ref("all");
const searchManagesEmployee = ref("");
const showManagesEmployeeFilters = ref(false);
const managesEmployeeOptions = ref([]);
const orgOptions = ref([]);
const cycleTypeOptions = ref([]);
const departmentOptions = ref([]);
const locationOptions = ref([]);
const selectedApproverDepartmentFilter = ref("all");
const searchApprover = ref("");
const showApproverFilters = ref(false);
const approverOptions = ref([]);

// Define tabs with role-based access
const userRole = ref(authService.getUserRole() || "Employee");

// Filter tabs based on user role - exact role matching
const filteredTabs = computed(() => {
  const currentRole = userRole.value;
  return tabs.filter((tab) => tab.roles.includes(currentRole));
});

// Define tabs with role-based access - exact role names
const tabs = [
  {
    id: "personal",
    title: "Employee Details",
    icon: "mdi-account",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "company",
    title: "Company Details",
    icon: "mdi-domain",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "government",
    title: "Government IDs",
    icon: "mdi-card-account-details",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "attendanceCategory",
    title: "Attendance Settings",
    icon: "mdi-calendar-check",
    roles: ["Admin", "Dealer", "Manager"],
  },
  {
    id: "LeavePolicy",
    title: "Leave Policy",
    icon: "mdi-calendar-account",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "salary",
    title: "Payroll Category",
    icon: "mdi-cash",
    roles: ["Admin", "Dealer"],
  },
  // {
  //   id: "access",
  //   title: "Access Management",
  //   icon: "mdi-key",
  //   roles: ["Admin", "Dealer", "Manager"],
  // },
  {
    id: "previousRecord",
    title: "Past Experience",
    icon: "mdi-history",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "BankDetails",
    title: "Bank Details",
    icon: "mdi-bank",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "EmergencyContactDetails",
    title: "Emergency Contact Details",
    icon: "mdi-phone-in-talk",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
  {
    id: "Appaccess",
    title: "App access settings",
    icon: "mdi-map-marker",
    roles: ["Admin", "Manager", "Employee", "Dealer"],
  },
];

const tabRequiredFields = {
  personal: ["firstName", "gender", "employeeId"],
  government: [],
  company: ["organization"],
  access: [],
  previousRecord: [],
  backgroundVerification: [],
  BankDetails: [],
  salary: [],
  attendanceCategory: [],
  EmergencyContactDetails: [],
  EmployeeAddress: [],
  LeavePolicy: [],
};

// Initialize form data with empty values
const formData = reactive({
  avatar: null,
  avatarFile: null,
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  officeEmail: "",
  gender: "",
  assignedUser: {
    DOB: null,
  },
  Dob: null,
  maritalStatus: "",
  bloodGroup: "",
  status: "active",
  pan: "",
  aadhar: "",
  gst: "",
  organization: "",
  skilled: "",
  employeeId: "",
  department: "",
  branchLocation: "",
  role: "",
  designation: "",
  accessLevel: "",
  tenantName: "",
  dateOfJoining: "",
  dateOfLeaving: "",
  accessOn: true,
  permanentAddress: "",
  currentAddress: "",
  emergencyContactName: "",
  emergencyContactMobileNumber: "",
  emergencyContactRelationship: "",
  emergencyContactAddress: "",
  guardiansName: "",
  voterID: "",
  drivingLicense: "",
  uan: "",
  previousRecords: [],
  ESIAccountNumber: "",
  PFAccountNumber: "",
  shopAccount: "",
  verification: [],
  appAccess: true,
  QrAttendance: true,
  GeoAttendance: true,
  faceAttendance: true,
  selfieAttendance: true,
  workingRange: 100,
  attendanceCategory: null, // This will hold the selected policy ID (config ID)
  employeeWorkingHours: [], // New field for employee-specific working hours data
  employeeHolidays: [], // New field for employee-specific selected holiday IDs
  reportingManager: [],
  managesEmployees: [],
  cycleType: null,
  approver: null,
});

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const accessLevelOptions = ref([]);
const roleOptions = ref([]);
const attendanceCategoryOptions = ref([]);
const holidayOptions = ref([]); // New ref for holidays
const reportingManagerOptions = ref([]);

const debounceFilterManagesEmployee = debounce(filterManagesEmployee, 300);
const components = {
  BackgroundVerification,
  BankDetails,
  AccessManagement,
  PastExperienceForm,
  AttendanceSettingsEditor,
};

const handleVerificationUpdate = (data) => {
  formData.aadhar = data.aadhaar;
  formData.pan = data.pan;
  formData.voterID = data.voterId;
  formData.uan = data.uan;
  formData.gst = data.gst;
};

const handleVerificationComplete = (data) => {
  handleVerificationUpdate(data);
  alert("Verification completed successfully!");
};

const handleLeaveToggle = (leave) => {
  // You can add any logic needed when toggle changes
  console.log(`Leave ${leave.leaveName} toggled to ${leave.isAssigned}`);
};

const updateLeaveBalance = (leave) => {
  if (leave.isAssigned && leave.leaveConfig?.days !== undefined) {
    console.log(
      `Updating ${leave.leaveName} balance to ${leave.leaveConfig.days} days`,
    );
    leave.leaveBalance = leave.leaveConfig.days;
    leave.isEditing = false;
  }
};

const currentYear = new Date().getFullYear();
// Computed property for maxDate (18 years ago from current year)
const maxDate = computed(() => {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear - 18;
  return `${maxYear}-12-31`;
});

// Computed property for minDate (100 years ago for reasonable range)
const minDate = computed(() => {
  const currentYear = new Date().getFullYear();
  return `${currentYear - 100}-01-01`;
});
const rules = {
  required: (value) => !!value || "This field is required",
  panFormat: (value) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(value) || "Invalid PAN format";
  },
  voterIdFormat: (value) => {
    const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
    return !value || voterIdRegex.test(value) || "Invalid Voter ID format";
  },
  drivingLicenseFormat: (value) => {
    const drivingLicenseRegex = /^[A-Z]{2}[0-9]{13}$/;
    return (
      !value ||
      drivingLicenseRegex.test(value) ||
      "Invalid Driving License format"
    );
  },
  uanFormat: (value) => {
    const uanRegex = /^[0-9]{12}$/;
    return !value || uanRegex.test(value) || "Invalid UAN format";
  },
  aadharFormat: (value) => {
    const aadharRegex = /^[0-9]{12}$/;
    return aadharRegex.test(value) || "Invalid Aadhar format";
  },
};

const userTenant = computed(() => {
  return authService.getUserTenant();
});

const tabHasError = (tabId) => {
  if (!formSubmitAttempted.value) return false;
  if (!tabRequiredFields[tabId]) return false;

  return tabRequiredFields[tabId].some(
    (field) =>
      touchedFields.value[field] &&
      (!formData[field] || formErrors.value[field]),
  );
};

const tabHasErrorComputed = computed(() => (tabId) => {
  if (!formSubmitAttempted.value) return false;
  return tabRequiredFields[tabId].some(
    (field) =>
      touchedFields.value[field] &&
      (!formData[field] || formErrors.value[field]),
  );
});

const getFieldErrorMessage = (field) => {
  if (formData[field]) {
    formErrors.value[field] = "";
    return "";
  }
  if (formErrors.value[field] && touchedFields.value[field]) {
    return formErrors.value[field];
  }
  return "";
};

// Function to handle input change for designation
const handleInputChange = (field) => {
  if (field === "designation") {
    capitalizeFirstLetterEachWord(field);
  } else if (field === "assignedUser.DOB") {
    // Clear DOB error when input changes
    if (formData.assignedUser.DOB) {
      formErrors.value.DOB = "";
    }
  }
};

async function fetchDepartments(orgId = null) {
  try {
    const resolvedTenantId = await resolveTenantId();
    let filterQuery = `filter[tenant][tenantId][_eq]=${resolvedTenantId}`;
    if (orgId) {
      filterQuery = `filter[_and][0][tenant][tenantId][_eq]=${resolvedTenantId}&filter[_and][1][orgId][id][_eq]=${orgId}`;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/department?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    departmentOptions.value = data.data.map((dept) => ({
      id: dept.id,
      name: dept.departmentName || "Unnamed Department",
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
    departmentOptions.value = [];
  }
}

async function fetchOrganizations() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/organization?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch organizations");
    }

    const data = await response.json();
    orgOptions.value = data.data.map((org) => ({
      id: org.id,
      orgName: `${org.orgName} (${org.orgType})`, // Combine orgName and orgType for display
      name: `${org.orgName} (${org.orgType})`, // For compatibility
    }));

    console.log("Organizations fetched:", orgOptions.value); // Debug log
  } catch (error) {
    console.error("Error fetching organizations:", error);
    showErrorMessage("Failed to load organizations. Please try again.");
  }
}

async function fetchLocations(orgId = null) {
  try {
    const resolvedTenantId = await resolveTenantId();
    let filterQuery = `filter[tenant][tenantId][_eq]=${resolvedTenantId}`;
    if (orgId) {
      filterQuery += `&filter[orgLocation][id][_eq]=${orgId}`;
    }
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    locationOptions.value = data.data.map((loc) => ({
      id: loc.id,
      name: `${loc.locdetail?.locationName || "Unnamed Location"} (${loc.locType || ""})`,
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    locationOptions.value = [];
  }
}

async function fetchAccessLevels() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/items/accesslevels?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    accessLevelOptions.value = data.data.map((level) => ({
      id: level.id,
      accessLevelName: level.accessLevelName,
      accessLevelNumber: level.accessLevelNumber,
      accessType: level.accessType,
      name: level.accessLevelName,
      label: level.accessLevelName,
    }));
  } catch (error) {
    console.error("Error fetching access levels:", error);
  }
}
async function fetchCycleTypes() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/attendanceCycle?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attendance cycles");
    }

    const data = await response.json();

    // Extract cycle types from multi_attendance_cycle field
    if (data.data && data.data.length > 0) {
      const multiAttendanceCycle = data.data[0].multi_attendance_cycle;

      // Check if multi_attendance_cycle has a cycles array
      if (
        multiAttendanceCycle &&
        multiAttendanceCycle.cycles &&
        Array.isArray(multiAttendanceCycle.cycles)
      ) {
        cycleTypeOptions.value = multiAttendanceCycle.cycles.map((cycle) => ({
          cycleId: cycle.cycleId,
          cycleName: cycle.cycleName,
        }));

        console.log("Cycle options:", cycleTypeOptions.value); // For debugging
      } else {
        console.warn("No cycles found in multi_attendance_cycle");
      }
    }
  } catch (error) {
    console.error("Error fetching attendance cycles:", error);
    showErrorMessage("Failed to load attendance cycle options");
  }
}
const earnings = ref([]);
const deductions = ref([]);
const basicPayValue = ref(0);
const employerContributions = ref([]);
const employeeContributions = ref([]);

const salarySettings = ref([]);
const annualCTC = ref(null);
const monthlyCTC = ref(null);
const showSalaryBreakdown = ref(false);

const selectedSalarySetting = ref(null);

const salarySettingsArray = computed(() => {
  return salarySettings.value.map((setting) => ({
    id: setting.id,
    name: setting.configName,
  }));
});

async function fetchSalarySettings() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/salarySetting?fields=basicPay&fields=earnings&fields=deductions&fields=employerContribution&fields=allowances&fields=deduction&fields=professionalTax&fields=LWF&fields[]=LWF.state&fields[]=LWF.stateTaxRules&fields[]=professionalTax.state&fields[]=professionalTax.stateTaxRules&fields=employersContributions&fields=employeeDeductions&fields=configName&fields=adminCharges&fields=stateTaxes&fields=deductions&fields=id&fields=professionalTax.id&fields=professionalTax.state&fields=professionalTax.stateTaxRules&fields=LWF.id&fields=LWF.state&fields=LWF.stateTaxRules&fields=advancedMode&fields=employerContribution&filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary settings");

    const data = await response.json();
    salarySettings.value = data.data || [];
  } catch (error) {
    console.error("Error fetching salary settings:", error);
  }
}

let lwfDeduction = 0;
let lwfReturns = 0;

const onSalarySettingChange = async (value) => {
  const settingId = typeof value === "object" ? value.id : value;
  if (!settingId) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/salarySetting/${settingId}?fields=basicPay&fields=earnings&fields=deductions&fields=employerContribution&fields=allowances&fields=deduction&fields=professionalTax&fields=LWF&fields[]=LWF.state&fields[]=LWF.stateTaxRules&fields[]=professionalTax.state&fields[]=professionalTax.stateTaxRules&fields=employersContributions&fields=employeeDeductions&fields=configName&fields=adminCharges&fields=stateTaxes&fields=deductions&fields=id&fields=professionalTax.id&fields=professionalTax.state&fields=professionalTax.stateTaxRules&fields=LWF.id&fields=LWF.state&fields=LWF.stateTaxRules`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary setting details");

    const data = await response.json();
    const setting = data.data;

    // Set basic pay
    basicPay.value = setting.basicPay || 0;
    basicPayOption.value = "On Attendance";

    // Set earnings
    earnings.value = (setting.earnings || []).map((item) => ({
      name: item.name,
      calculation: item.calculations,
      [item.calculations.toLowerCase()]: item[item.calculations] ?? null,
    }));

    // Set deductions
    deductions.value = (setting.deductions || []).map((item) => ({
      name: item.name,
      calculation: item.calculation,
      percentage: item.percentage || 0,
      amount: item.amount || 0,
    }));

    // Set employer contributions
    employerContributions.value = setting.employersContributions
      ? Object.entries(setting.employersContributions).map(([key, value]) => ({
          name: key,
          calculations: value.Calculations || [],
          component: value.Calculations.map((item) => item.name).join(", "),
          amount: value.selectedOption || 0,
          includedInCTC: true,
          rupee: 0,
          options: value.options
            ? value.options.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))
            : [],
        }))
      : [];

    // Set employee contributions
    employeeContributions.value = setting.employeeDeductions
      ? Object.entries(setting.employeeDeductions).map(([key, value]) => ({
          name: key,
          calculations: value.Calculations || [],
          component: value.Calculations.map((item) => item.name).join(", "),
          amount: value.selectedOption || 0,
          rupee: 0,
          options: value.options
            ? value.options.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))
            : [],
        }))
      : [];

    //admin charge
    adminCharges.value = setting.adminCharges || {};

    // lwf
    lwf.value = setting.LWF?.stateTaxRules;
    lwfDeduction = lwf.value?.LWF?.Deduction?.join(", ");
    lwfReturns = lwf.value?.LWF?.Returns;

    calculateMonthlyCTC();
  } catch (error) {
    console.error("Error fetching salary setting details:", error);
  }
};

const basicPay = ref(0);
const basicPayOption = ref(0);
let totalEmployer = ref(0);
let totalEmployee = ref(0);
let totalEarnings = ref(0);
let totalDeductions = ref(0);
const lwf = ref(0);
const pt = ref(0);
const adminCharges = ref({ enable: false, charge: "" });
const laborWelfareFundAmount = ref(0);
const professionalTaxAmount = ref(0);
const adminAmount = ref(0);
const employerLWF = ref(0);
const employeeLWF = ref(0);
const gender = ref(null);
const totalAmount = ref(0);

const calculateMonthlyCTC = () => {
  if (
    !annualCTC.value ||
    isNaN(annualCTC.value) ||
    Number(annualCTC.value) === 0
  ) {
    // Reset all values to 0
    monthlyCTC.value = 0;
    basicPayValue.value = 0;
    totalEarnings.value = 0;
    totalEmployer.value = 0;
    totalEmployee.value = 0;
    totalDeductions.value = 0;
    adminAmount.value = 0;
    employerLWF.value = 0;
    employeeLWF.value = 0;
    professionalTaxAmount.value = 0;
    netSalary.value = 0;

    earnings.value = earnings.value.map((item) => ({ ...item, amount: 0 }));
    employerContributions.value = employerContributions.value.map((item) => ({
      ...item,
      rupee: 0,
    }));
    employeeContributions.value = employeeContributions.value.map((item) => ({
      ...item,
      rupee: 0,
    }));

    return;
  }

  // Constants for calculations
  const EMPLOYER_PF_RATE = 0.12;
  const EMPLOYER_ESI_RATE = 0.0325;
  const EMPLOYEE_PF_RATE = 0.12;
  const EMPLOYEE_ESI_RATE = 0.0075;
  const EPF_ADMIN_RATE = 0.01;
  const ESI_THRESHOLD = 21000;

  // Step 1: Calculate Monthly CTC
  monthlyCTC.value = Math.round(annualCTC.value / 12);

  let fixedEarningsTotal = 0;

  earnings.value.forEach((item) => {
    if (item.calculation === "Fixed") {
      let fixedAmount = Number(item.fixed || 0);
      fixedEarningsTotal += fixedAmount;
      item.amount = fixedAmount;
    }
  });

  let remainingCTC = monthlyCTC.value - fixedEarningsTotal;

  let totalPercentageEarnings = 0;

  earnings.value.forEach((item) => {
    if (item.calculation === "Percentage") {
      if (item.name === "HRA" || item.name === "Dearness Allowance") {
        return;
      } else {
        let percentageAmount =
          (Number(item.percentage || 0) / 100) * remainingCTC;
        totalPercentageEarnings += percentageAmount;
        item.amount = percentageAmount;
      }
    }
  });

  // Now update the fixed earnings total
  fixedEarningsTotal += totalPercentageEarnings;

  employerLWF.value = lwf.value?.LWF?.EmployerLWF || 0;
  employeeLWF.value = lwf.value?.LWF?.EmployeeLWF || 0;

  // Step 3: Initialize components based on percentages
  const basicSalaryTarget = (basicPay.value / 100) * remainingCTC;

  const hraEntry = earnings.value.find((e) => e.name === "HRA");
  const daEntry = earnings.value.find((e) => e.name === "Dearness Allowance");

  const hraPercentage = hraEntry?.percentage || 0;
  const daPercentage = daEntry?.percentage || 0;

  const hraTarget = (hraPercentage / 100) * remainingCTC;
  const daTarget = (daPercentage / 100) * remainingCTC;

  basicPayValue.value = basicSalaryTarget;

  if (hraEntry) {
    hraEntry.amount = hraTarget;
  }

  if (daEntry) {
    daEntry.amount = daTarget;
  }

  // step 3: declare
  let pfCalculation = 0;
  let esiCalculation = 0;

  let employerPfTotal = 0,
    employeresiTotal = 0;

  // Step 4: Iterative approach to reach target CTC
  for (let iteration = 0; iteration < 5; iteration++) {
    // Calculate Gross Salary
    const grossSalary = Math.round(
      basicPayValue.value +
        (hraEntry ? hraEntry.amount : 0) +
        (daEntry ? daEntry.amount : 0) +
        fixedEarningsTotal,
    );

    // Find Employer Contributions
    const employerPF = employerContributions.value.find(
      (item) => item.name === "EmployerPF",
    );
    const employerESI = employerContributions.value.find(
      (item) => item.name === "EmployerESI",
    );

    if (employerPF) {
      pfCalculation = employerPF.calculations.reduce((sum, calc) => {
        const earningName = earnings.value.find(
          (earn) => earn.name === calc.name,
        );
        const earningAmount = earningName ? earningAmount : 0;
        return sum + earningAmount;
      }, 0);
    }
    if (employerESI) {
      esiCalculation = employerESI.calculations.reduce((sum, calc) => {
        const earningName = earnings.value.find(
          (earn) => earn.name === calc.name,
        );
        const earningAmount = earningName ? earningAmount : 0;
        return sum + earningAmount;
      }, 0);
    }

    let pfBaseAmount = basicPayValue.value + pfCalculation;
    let esiBaseAmount = basicPayValue.value + esiCalculation;

    let employerPfTotal = 0,
      employeresiTotal = 0;

    if (employerPF) {
      if (Number(employerPF.amount) === 1800) {
        employerPfTotal = Math.min(Math.round(pfBaseAmount * (12 / 100)), 1800);
      } else {
        employerPfTotal = Math.round(pfBaseAmount * (employerPF.amount / 100));
      }
    }

    if (employerESI) {
      employeresiTotal =
        monthlyCTC.value <= ESI_THRESHOLD
          ? Math.round(esiBaseAmount * (employerESI.amount / 100))
          : 0;
    }

    const epfAdmin = Math.min(
      Math.round(adminCharges.value?.enable ? 0.01 * pfBaseAmount : 0),
      150,
    );

    const employerContributionsTotal =
      employerPfTotal + epfAdmin + employeresiTotal;

    const currentCTC = grossSalary + employerContributionsTotal;

    if (Math.abs(currentCTC - monthlyCTC.value) < 0) {
      break;
    }

    if (currentCTC > monthlyCTC.value) {
      const excess = currentCTC - monthlyCTC.value;

      const hraImpact = Math.round(
        1 +
          (monthlyCTC.value <= ESI_THRESHOLD ? EMPLOYER_ESI_RATE : 0) +
          EMPLOYER_PF_RATE +
          (adminCharges.value?.enable ? EPF_ADMIN_RATE : 0),
      );
      const daImpact = hraImpact;
      const basicImpact = hraImpact;

      let remainingExcess = excess;

      if (hraEntry && hraEntry.amount > 0 && remainingExcess > 0) {
        const hraAvailable = hraEntry.amount;
        const reductionNeeded = remainingExcess / hraImpact;
        const hraReduction = Math.min(hraAvailable, reductionNeeded);

        hraEntry.amount -= hraReduction;
        remainingExcess -= hraReduction * hraImpact;
      }

      if (daEntry && daEntry.amount > 0 && remainingExcess > 0) {
        const daReduction = Math.min(
          daEntry.amount,
          remainingExcess / daImpact,
        );

        daEntry.amount -= daReduction;
        remainingExcess -= daReduction * daImpact;
      }

      if (basicPayValue.value > 0 && remainingExcess > 0) {
        const basicReduction = Math.min(
          basicPayValue.value,
          Math.round(remainingExcess / basicImpact),
        );

        basicPayValue.value -= basicReduction;
        remainingExcess -= basicReduction * basicImpact;
      }
    } else {
      const shortage = monthlyCTC.value - currentCTC;

      if (shortage > 0) {
        const basicImpact =
          1 +
          (monthlyCTC.value <= ESI_THRESHOLD ? EMPLOYER_ESI_RATE : 0) +
          EMPLOYER_PF_RATE +
          (adminCharges.value?.enable ? EPF_ADMIN_RATE : 0);

        const basicIncrease = Math.min(
          Math.round(shortage / basicImpact),
          basicSalaryTarget - basicPayValue.value,
        );

        basicPayValue.value += basicIncrease;

        let remainingShortageCovered = basicIncrease * basicImpact;
        let daIncrease = 0,
          hraIncrease = 0;

        // ✅ If DA exists and is below target, increase DA
        if (
          daEntry &&
          daEntry.amount < daTarget &&
          remainingShortageCovered < shortage
        ) {
          const remainingShortageToCover = shortage - remainingShortageCovered;

          daIncrease = Math.min(
            Math.round(remainingShortageToCover / basicImpact),
            daTarget - daEntry.amount,
          );

          if (daIncrease > 0) {
            daEntry.amount += daIncrease;
            remainingShortageCovered += daIncrease * basicImpact;
          }
        }

        // ✅ If DA does not exist OR DA is already maxed out, increase HRA
        if (
          (!daEntry || daEntry.amount >= daTarget) &&
          remainingShortageCovered < shortage
        ) {
          const remainingShortageToCover = shortage - remainingShortageCovered;

          if (hraEntry && hraEntry.amount < hraTarget) {
            hraIncrease = Math.min(
              Math.round(remainingShortageToCover / basicImpact),
              hraTarget - hraEntry.amount,
            );

            if (hraIncrease > 0) {
              hraEntry.amount += hraIncrease;
            }
          }
        }
      }
    }
  }

  // Step 5: Final adjustment to match CTC and deductions (aligned with Python)
  const finalGrossSalary =
    basicPayValue.value +
    (hraEntry ? hraEntry.amount : 0) +
    (daEntry ? daEntry.amount : 0) +
    fixedEarningsTotal;
  const finalpfBaseAmount = basicPayValue.value + pfCalculation;
  const finalesiBaseAmount = basicPayValue.value + esiCalculation;
  const finalEmployerPf = EMPLOYER_PF_RATE * finalpfBaseAmount;
  const finalEpfAdmin = adminCharges.value?.enable
    ? EPF_ADMIN_RATE * finalpfBaseAmount
    : 0;
  const finalEmployerEsi =
    monthlyCTC.value <= ESI_THRESHOLD
      ? EMPLOYER_ESI_RATE * finalesiBaseAmount
      : 0;
  const finalEmployerTotal = finalEmployerPf + finalEpfAdmin + finalEmployerEsi;
  const finalEmployeePf = EMPLOYEE_PF_RATE * finalpfBaseAmount;
  const finalEmployeeEsi =
    monthlyCTC.value <= ESI_THRESHOLD
      ? EMPLOYEE_ESI_RATE * finalesiBaseAmount
      : 0;
  const finalDeductions =
    finalEmployeePf +
    finalEmployeeEsi +
    employeeLWF.value +
    professionalTaxAmount.value;
  const finalCTC = finalGrossSalary + finalEmployerTotal;

  // Step 6: Calculate Professional Tax (unchanged, set to 0 for consistency)
  professionalTaxAmount.value = 0;
  if (lwf.value?.PT) {
    const hasGender = lwf.value.PT.some((entry) => entry.gender !== undefined);
    let filteredData = lwf.value.PT;
    if (hasGender) {
      filteredData = lwf.value.PT.filter(
        (entry) => entry.gender === formData.gender,
      );
    }
    const taxEntry = filteredData.find((entry) => {
      if (entry.salaryRange.includes("and above")) {
        return monthlyCTC.value >= parseInt(entry.salaryRange);
      }
      const [min, max] = entry.salaryRange.split("-").map(Number);
      return monthlyCTC.value >= min && monthlyCTC.value <= (max || Infinity);
    });
    professionalTaxAmount.value = taxEntry
      ? Number(taxEntry.professionalTax)
      : 0;
  }

  // Step 7: Calculate final values for display
  totalEarnings.value =
    earnings.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) +
    basicPayValue.value;

  employerContributions.value = employerContributions.value.map((item) => {
    const calculations = Array.isArray(item.Calculations)
      ? item.Calculations
      : item.calculations || [];
    if (item.amount === 0 || item.amount === undefined) {
      return { ...item, rupee: 0 };
    }
    const totalAmount = calculations.reduce((sum, calc) => {
      const earningName = earnings.value.find(
        (earn) => earn.name === calc.name,
      );
      const earningAmount = earningName ? earningAmount : 0;
      return sum + earningAmount;
    }, 0);
    let finalValue = 0;

    if (item.name === "EmployerPF") {
      if (Number(item.amount) === 1800) {
        finalValue = Math.min(
          (totalAmount + basicPayValue.value) * (12 / 100),
          1800,
        );
      } else {
        finalValue = (totalAmount + basicPayValue.value) * (item.amount / 100);
      }
    }

    if (item.name === "EmployerESI") {
      finalValue =
        monthlyCTC.value <= ESI_THRESHOLD
          ? (totalAmount + basicPayValue.value) * (item.amount / 100)
          : 0;
    }

    return { ...item, rupee: Math.round(finalValue) };
  });
  if (adminCharges.value?.enable === true) {
    adminAmount.value = Math.min(
      Math.round((pfCalculation + basicPayValue.value) * 0.01),
      150,
    );
  } else {
    adminAmount.value = 0;
  }
  employeeContributions.value = employeeContributions.value.map((item) => {
    const calculations = Array.isArray(item.Calculations)
      ? item.Calculations
      : item.calculations || [];
    if (item.amount === 0 || item.amount === undefined) {
      return { ...item, rupee: 0 };
    }
    const totalAmount = calculations.reduce((sum, calc) => {
      const earningName = earnings.value.find(
        (earn) => earn.name === calc.name,
      );
      const earningAmount = earningName ? earningAmount : 0;
      return sum + earningAmount;
    }, 0);
    let finalValue;
    if (Number(item.amount) === 1800) {
      const percentageOption = item.options?.find(
        (opt) => opt.label === "percentage",
      );
      if (percentageOption) {
        finalValue = Math.min(
          (totalAmount + basicPayValue.value) * (percentageOption.value / 100),
          1800,
        );
      } else {
        finalValue = Math.min((totalAmount + basicPayValue.value) * 0.12, 1800);
      }
    } else if (item.name === "EmployeeESI") {
      finalValue =
        monthlyCTC.value <= ESI_THRESHOLD
          ? (totalAmount + basicPayValue.value) * (item.amount / 100)
          : 0;
    } else {
      finalValue =
        (totalAmount + basicPayValue.value) * (item.amount / 100 || 1);
    }
    return { ...item, rupee: Math.round(finalValue) };
  });

  totalEmployer.value =
    employerContributions.value.reduce(
      (sum, item) => sum + (Number(item.rupee) || 0),
      0,
    ) + adminAmount.value;

  totalEmployee.value =
    employeeContributions.value.reduce(
      (sum, item) => sum + (Number(item.rupee) || 0),
      0,
    ) + professionalTaxAmount.value;

  totalDeductions.value = deductions.value.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  netSalary.value =
    totalEarnings.value - totalEmployee.value - totalDeductions.value;

  // Step 8: Round only for display
  basicPayValue.value = Math.round(basicPayValue.value);
  if (hraEntry) hraEntry.amount = Math.round(hraEntry.amount);
  if (daEntry) daEntry.amount = Math.round(daEntry.amount);
  totalEarnings.value = Math.round(totalEarnings.value);
  totalEmployer.value = Math.round(totalEmployer.value);
  totalEmployee.value = Math.round(totalEmployee.value);
  totalDeductions.value = Math.round(totalDeductions.value);
  adminAmount.value = Math.round(adminAmount.value);
  employerLWF.value = Math.round(employerLWF.value);
  employeeLWF.value = Math.round(employeeLWF.value);
  professionalTaxAmount.value = Math.round(professionalTaxAmount.value);
  netSalary.value = Math.round(netSalary.value);
};

const netSalary = computed(() => {
  return (
    totalEmployer.value +
    totalEarnings.value -
    (totalDeductions.value + totalEmployee.value + totalEmployer.value)
  );
});
const getLeaveColor = (leaveName) => {
  // Example implementation
  return leaveName === "Annual" ? "blue" : "green";
};

const getLeaveIcon = (leaveName) => {
  // Example implementation
  return { icon: leaveName === "Annual" ? "mdi-calendar" : "mdi-medical-bag" };
};

const formatLeaveType = (leaveName) => {
  // Example implementation
  return leaveName.replace(/([A-Z])/g, " $1").trim();
};
async function fetchRoles() {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/roles?filter[name][_neq]=Administrator&filter[_and][0][_and][0][name][_neq]=esslAdmin&filter[_and][2][name][_neq]=Dealer&`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    roleOptions.value = data.data.map((role) => ({
      id: role.id,
      name: role.name,
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
}

async function fetchAttendanceCategories() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/config?filter[tenant][tenantId][_eq]=${resolvedTenantId}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );
    const data = await response.json();
    attendanceCategoryOptions.value = data.data.map((config) => ({
      id: config.id,
      name: config.configName, // Ensure proper field mapping
    }));
  } catch (error) {
    console.error("Error fetching attendance categories:", error);
  }
}

async function fetchHolidays() {
  // This function is no longer needed here as HolidaySettings.vue fetches its own data
  // and qadd form.vue will directly manage the selected holiday IDs.
}

async function resolveTenantId() {
  if (props.tenantId instanceof Promise) {
    return await props.tenantId;
  }
  return props.tenantId;
}
const debounceFilter = debounce(filterReportingManagers, 300);

async function filterReportingManagers() {
  try {
    const resolvedTenantId = await resolveTenantId();
    let allManagers = [];
    let page = 1;
    const limit = 100; // Number of items per page
    let hasMore = true;

    while (hasMore) {
      let filters = [];

      // Add branch filter only if a specific branch is selected (not "all")
      if (selectedBranchFilter.value && selectedBranchFilter.value !== "all") {
        const selectedBranch = branchOptions.value.find(
          (branch) => branch.id === selectedBranchFilter.value,
        );
        if (selectedBranch) {
          filters.push(
            `filter[_and][0][branch][branchName][_icontains]=${encodeURIComponent(selectedBranch.name)}`,
          );
        }
      }

      // Add department filter only if a specific department is selected (not "all")
      if (
        selectedDepartmentFilter.value &&
        selectedDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedDepartmentFilter.value,
        );
        if (selectedDept) {
          filters.push(
            `filter[_and][1][department][departmentName][_icontains]=${encodeURIComponent(selectedDept.name)}`,
          );
        }
      }

      // Add search filter if text entered
      if (searchReportingManager.value) {
        filters.push(
          `filter[_and][2][assignedUser][first_name][_icontains]=${encodeURIComponent(searchReportingManager.value)}`,
        );
      }

      // Base filter for tenant and role
      const currentUserRole = authService.getUserRole();
      let roleFilter = "";

      if (currentUserRole === "Admin") {
        roleFilter = `&filter[assignedUser][role][name][_eq]=Manager`;
      } else if (currentUserRole === "Manager") {
        roleFilter = `&filter[_or][0][assignedUser][role][name][_eq]=Employee`;
        roleFilter = `&filter[_or][1][assignedUser][role][name][_eq]=Manager`;
      }

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${resolvedTenantId}${roleFilter}`;
      const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;

      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "branch.id",
        "branch.branchName",
        "department.id",
        "department.departmentName",
      ].join(",");

      // Add pagination parameters
      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}${pagination}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch reporting managers: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Add current page results to allManagers
      const currentPageManagers = data.data || [];
      allManagers = [...allManagers, ...currentPageManagers];

      // Check if we've fetched all available data
      if (currentPageManagers.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Validate and map the response, ensuring id and name are present
    reportingManagerOptions.value = allManagers
      .filter((item) => item.assignedUser?.id && item.assignedUser?.first_name)
      .map((item) => ({
        id: item.assignedUser.id,
        name: item.assignedUser.first_name.trim(),
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
        branchId: item.branch?.id || null,
        branchName: item.branch?.branchName || "",
      }));

    // Log for debugging
    if (reportingManagerOptions.value.length === 0) {
      console.warn("No valid reporting managers found in the API response.");
    }
  } catch (error) {
    console.error("Error filtering reporting managers:", error);
    reportingManagerOptions.value = [];
    showErrorMessage("Failed to load reporting managers. Please try again.");
  }
}

async function filterManagesEmployee() {
  try {
    const resolvedTenantId = await resolveTenantId();
    let allEmployees = [];
    let page = 1;
    const limit = 100; // Number of items per page
    let hasMore = true;

    while (hasMore) {
      let filters = [];

      if (
        selectedManagesEmployeeBranchFilter.value &&
        selectedManagesEmployeeBranchFilter.value !== "all"
      ) {
        const selectedEmployeesBranch = branchOptions.value.find(
          (branch) => branch.id === selectedManagesEmployeeBranchFilter.value,
        );
        if (selectedEmployeesBranch) {
          filters.push(
            `filter[_and][0][branch][branchName][_icontains]=${selectedEmployeesBranch.name}`,
          );
        }
      }

      if (
        selectedManagesEmployeeDepartmentFilter.value &&
        selectedManagesEmployeeDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedManagesEmployeeDepartmentFilter.value,
        );
        if (selectedDept) {
          filters.push(
            `filter[_and][1][department][departmentName][_icontains]=${selectedDept.name}`,
          );
        }
      }

      if (searchManagesEmployee.value) {
        filters.push(
          `filter[_and][2][assignedUser][first_name][_icontains]=${searchManagesEmployee.value}`,
        );
      }

      const currentUserRole = authService.getUserRole();
      let roleFilter = "";

      if (currentUserRole === "Admin") {
        roleFilter = `&filter[assignedUser][role][name][_eq]=Manager`;
      } else if (currentUserRole === "Manager") {
        roleFilter = `&filter[assignedUser][role][name][_eq]=Employee`;
      }

      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${resolvedTenantId}${roleFilter}`;
      const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;

      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "branch.id",
        "branch.branchName",
        "department.id",
        "department.departmentName",
      ].join(",");

      // Add pagination parameters
      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}${pagination}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      const data = await response.json();

      // Add current page results to allEmployees
      const currentPageEmployees = data.data || [];
      allEmployees = [...allEmployees, ...currentPageEmployees];

      // Check if we've fetched all available data
      if (currentPageEmployees.length < limit) {
        hasMore = false;
      } else {
        page++;
      }
    }

    managesEmployeeOptions.value = allEmployees.map((item) => ({
      id: item.assignedUser?.id || "",
      name: `${item.assignedUser?.first_name || ""}`.trim(),
      role: item.assignedUser?.role?.name || "",
      departmentId: item.department?.id || null,
      departmentName: item.department?.departmentName || "",
      branchId: item.branch?.id || null,
      branchName: item.branch?.branchName || "",
    }));
  } catch (error) {
    console.error("Error filtering manages employees:", error);
    managesEmployeeOptions.value = [];
  }
}
async function filterApprovers() {
  try {
    console.log("▶ Starting filterApprovers function...");

    const resolvedTenantId = await resolveTenantId();
    console.log("✅ Tenant ID resolved:", resolvedTenantId);

    let allApprovers = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      console.log(`\n🔄 Fetching page: ${page}`);
      let filters = [];

      // Department filter
      if (
        selectedApproverDepartmentFilter.value &&
        selectedApproverDepartmentFilter.value !== "all"
      ) {
        const selectedDept = departmentOptions.value.find(
          (dept) => dept.id === selectedApproverDepartmentFilter.value,
        );
        if (selectedDept) {
          const deptFilter = `filter[_and][0][department][departmentName][_icontains]=${encodeURIComponent(selectedDept.name)}`;
          filters.push(deptFilter);
          console.log("📌 Department filter applied:", deptFilter);
        }
      }

      // Search filter
      if (searchApprover.value) {
        const searchFilter = `filter[_and][1][assignedUser][first_name][_icontains]=${encodeURIComponent(searchApprover.value)}`;
        filters.push(searchFilter);
        console.log("🔍 Search filter applied:", searchFilter);
      }

      // Exclude Admin role filter
      const excludeAdminFilter = `filter[_and][2][assignedUser][role][name][_neq]=Admin`;
      filters.push(excludeAdminFilter);
      console.log("🚫 Exclude Admin filter applied:", excludeAdminFilter);

      // Base filter for tenant
      const baseFilter = `filter[assignedUser][tenant][tenantId][_eq]=${resolvedTenantId}`;
      const fullFilter = `${baseFilter}${filters.length > 0 ? "&" + filters.join("&") : ""}`;
      console.log("🛠 Full Filter Query:", fullFilter);

      const fields = [
        "id",
        "assignedUser.id",
        "assignedUser.first_name",
        "assignedUser.role.name",
        "department.id",
        "department.departmentName",
        "accessOn",
      ].join(",");
      console.log("📋 Fields requested:", fields);

      const pagination = `&limit=${limit}&page=${page}`;
      const url = `${import.meta.env.VITE_API_URL}/items/personalModule?${fullFilter}&fields=${fields}${pagination}`;
      console.log("🌐 API URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch approvers: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📥 Data received:", data);

      const currentPageApprovers = data.data || [];
      console.log(`✅ Approvers in page ${page}:`, currentPageApprovers);

      allApprovers = [...allApprovers, ...currentPageApprovers];
      console.log("📊 Total approvers collected so far:", allApprovers.length);

      if (currentPageApprovers.length < limit) {
        hasMore = false;
        console.log("⏹ No more pages to fetch.");
      } else {
        page++;
      }
    }

    approverOptions.value = allApprovers
      .filter((item) => item.assignedUser?.id && item.assignedUser?.first_name)
      .map((item) => ({
        id: item.assignedUser.id,
        name: item.assignedUser.first_name.trim(),
        role: item.assignedUser?.role?.name || "",
        departmentId: item.department?.id || null,
        departmentName: item.department?.departmentName || "",
      }));

    console.log("🎯 Final approver options:", approverOptions.value);
  } catch (error) {
    console.error("❌ Error filtering approvers:", error);
    approverOptions.value = [];
    showErrorMessage("Failed to load approvers. Please try again.");
  }
}

const markFieldAsTouched = (field) => {
  touchedFields.value[field] = true;
  if (!formData[field] && tabRequiredFields[currentTab.value].includes(field)) {
    formErrors.value[field] = "This field is required";
  }
};

const generateDefaultEmail = () => {
  const firstName = formData.firstName?.toLowerCase() || "";
  const lastName = formData.lastName?.toLowerCase() || "";
  const employeeId = formData.employeeId || "";

  if (lastName) {
    return `${firstName}${lastName}${employeeId}@fieldops.com`;
  } else {
    return `${firstName}${employeeId}@fieldops.com`;
  }
};

const handleOrganizationChange = async (newValue) => {
  formData.department = "";
  formData.branchLocation = "";
  if (newValue) {
    await fetchDepartments(newValue);
    await fetchLocations(newValue);
  } else {
    departmentOptions.value = [];
    locationOptions.value = [];
  }
};
const handleDepartmentChange = (newValue) => {
  // Handle department selection logic if needed
};

const handleBranchLocationChange = (newValue) => {
  // Handle branch location selection logic if needed
};

const handleCycleTypeChange = (newValue) => {
  // Handle cycle type selection logic if needed
};

async function saveEmployee() {
  formSubmitAttempted.value = true;

  const mandatoryFields = ["firstName", "gender", "employeeId", "organization"];
  let hasErrors = false;

  // Validate mandatory fields
  mandatoryFields.forEach((field) => {
    if (!formData[field]) {
      hasErrors = true;
      formErrors.value[field] = "This field is required";
      touchedFields.value[field] = true;
    }
  });

  // Validate phone and email
  const isPhoneValid = await validatePhone();
  const isEmailValid = await validateEmail();
  if (!isPhoneValid || !isEmailValid) {
    hasErrors = true;
  }

  // Validate DOB (if provided, ensure age >= 18)
  if (formData.assignedUser.DOB) {
    const selectedDate = new Date(formData.assignedUser.DOB);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const hasBirthdayOccurred =
      today.getMonth() > selectedDate.getMonth() ||
      (today.getMonth() === selectedDate.getMonth() &&
        today.getDate() >= selectedDate.getDate());
    const actualAge = hasBirthdayOccurred ? age : age - 1;

    if (actualAge < 18) {
      hasErrors = true;
      formErrors.value.DOB = "Employee must be at least 18 years old";
      touchedFields.value.DOB = true;
    } else {
      formErrors.value.DOB = "";
    }
  }

  // Existing validations for PAN, Aadhar, etc.
  if (
    formData.pan &&
    formData.pan.trim() !== "" &&
    !rules.panFormat(formData.pan)
  ) {
    hasErrors = true;
    formErrors.value.pan = "Invalid PAN format (e.g., ABCDE1234F)";
    touchedFields.value.pan = true;
  }

  if (
    formData.aadhar &&
    formData.aadhar.trim() !== "" &&
    !rules.aadharFormat(formData.aadhar)
  ) {
    hasErrors = true;
    formErrors.value.aadhar = "Invalid Aadhar format (12 digits required)";
    touchedFields.value.aadhar = true;
  }

  if (
    formData.voterID &&
    formData.voterID.trim() !== "" &&
    !rules.voterIdFormat(formData.voterID)
  ) {
    hasErrors = true;
    formErrors.value.voterID = "Invalid Voter ID format (e.g., ABC1234567)";
    touchedFields.value.voterID = true;
  }

  if (
    formData.drivingLicense &&
    formData.drivingLicense.trim() !== "" &&
    !rules.drivingLicenseFormat(formData.drivingLicense)
  ) {
    hasErrors = true;
    formErrors.value.drivingLicense =
      "Invalid Driving License format (e.g., AB1234567890123)";
    touchedFields.value.drivingLicense = true;
  }

  if (
    formData.uan &&
    formData.uan.trim() !== "" &&
    !rules.uanFormat(formData.uan)
  ) {
    hasErrors = true;
    formErrors.value.uan = "Invalid UAN format (12 digits required)";
    touchedFields.value.uan = true;
  }

  if (hasErrors) {
    showErrorMessage("Please fix all validation errors before saving");
    return;
  }

  await createNewEmployee();
}
// async function fetchLeaveSettings() {
//   try {
//     const resolvedTenantId = await resolveTenantId();
//     const response = await fetch(
//       `${
//         import.meta.env.VITE_API_URL
//       }/items/leaveSetting?filter[tenant][tenantId][_eq]=${resolvedTenantId}&fields=id,leaveName,leaveConfig,assignedLeave`,
//       {
//         headers: {
//           Authorization: `Bearer ${authService.getToken()}`,
//         },
//       },
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch leave settings");
//     }

//     const data = await response.json();
//     leaveSettings.value = data.data || [];
//   } catch (error) {
//     console.error("Error fetching leave settings:", error);
//   }
// }

async function fetchLeavePolicies() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const currentYear = new Date().getFullYear();

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/leaveSetting?filter[_and][0][_and][0][tenant][tenantId][_eq]=${resolvedTenantId}&filter[_and][0][_and][1][year(yearOfPolicy)][_eq]=${currentYear}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch leave policies");
    }

    const data = await response.json();
    // Filter and initialize isAssigned if not present
    enabledLeaves.value = data.data
      .filter((leave) => leave.leaveConfig?.isEnabled)
      .map((leave) => ({
        ...leave,
        isAssigned: leave.isAssigned ?? false, // Initialize if undefined
      }));
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    enabledLeaves.value = [];
  }
}
// Add this before the payload construction in createNewEmployee
const reportingManagerIds = Array.isArray(formData.reportingManager)
  ? formData.reportingManager
      .map((manager) => (typeof manager === "object" ? manager.id : manager))
      .filter((id) => id)
  : [];

console.log("Processed Reporting Manager IDs:", reportingManagerIds);

async function createNewEmployee() {
  try {
    const resolvedTenantId = await resolveTenantId();
    const cycleTypeToSave = formData.cycleType || 1;
    const selectedDepartment = departmentOptions.value.find(
      (dept) => dept.id === formData.department,
    );
    const selectedBranchLocation = locationOptions.value.find(
      (loc) => loc.id === formData.branchLocation,
    );
    const selectedRole = roleOptions.value.find(
      (role) => role.name === formData.role,
    ) || { id: "f667b169-c66c-4ec1-bef9-1831c1647c0d" };
    const selectedAccessLevel = accessLevelOptions.value.find(
      (level) => level.name === formData.accessLevel,
    );
    const accessLevelNumber = selectedAccessLevel?.accessLevelNumber || 0;
    const assignedCardsFromComponent =
      accessManagementRef.value?.getAssignedCards() || [];
    const leavesPayload = {
      leaveBalance: {},
      CarryForwardleave: {},
      leaveTaken: {},
      monthLimit: {},
      assignedLeave: [],
      year: null,
    };
    if (enabledLeaves.value && enabledLeaves.value.length > 0) {
      leavesPayload.year = new Date(enabledLeaves.value[0].yearOfPolicy)
        .getFullYear()
        .toString();
      enabledLeaves.value.forEach((leave) => {
        const leaveType = leave.leaveName.toLowerCase().replace(/\s+/g, "");
        leavesPayload.leaveBalance[leaveType] = leave.leaveConfig?.days || 0;
        leavesPayload.CarryForwardleave[leaveType] =
          leave.leaveConfig?.limit || 0;
        leavesPayload.leaveTaken[`t${leaveType}`] =
          leave.leaveConfig?.taken || 0;
        leavesPayload.monthLimit[leaveType] =
          leave.leaveConfig?.monthLimit || 0;
        if (leave.isAssigned === true) {
          leavesPayload.assignedLeave.push(leave.leaveName);
        }
      });
    }
    const reportingManagerIds = Array.isArray(formData.reportingManager)
      ? formData.reportingManager
          .map((manager) => {
            if (typeof manager === "object") return manager.id;
            if (typeof manager === "string" && manager.trim() !== "")
              return manager;
            return null;
          })
          .filter((id) => id && typeof id === "string")
      : [];

    console.log("Final Reporting Manager IDs:", reportingManagerIds);

    const payload = {
      status: formData.status,
      employeeId: formData.employeeId,
      accessOn: formData.accessOn,
      QrAttendance: formData.QrAttendance,
      GeoAttendance: formData.GeoAttendance,
      faceAttendance: formData.faceAttendance,
      selfieAttendance: formData.selfieAttendance,
      uniqueId: `${resolvedTenantId}-${formData.employeeId}`,
      config: formData.attendanceCategory,
      salaryConfig: selectedSalarySetting.value,
      attendancePolicyHistory: { status: "published" },
      workingRange: formData.workingRange,
      leaves: leavesPayload,
      reportingManager: reportingManagerIds,
      managesEmployees: Array.isArray(formData.managesEmployees)
        ? formData.managesEmployees
            .map((employee) =>
              typeof employee === "object" ? employee.id : employee,
            )
            .filter((id) => id)
        : [],
      cycleType: cycleTypeToSave,
      approver: formData.approver,
    };
    if (
      formData.employeeWorkingHours &&
      formData.employeeWorkingHours.length > 0
    ) {
      const attendanceSettingsData = { tenant: resolvedTenantId };
      formData.employeeWorkingHours.forEach((day) => {
        attendanceSettingsData[`is${day.name}`] = !day.isWorking;
        if (day.isWorking && day.shifts && day.shifts.length > 0) {
          attendanceSettingsData[`${day.key}J`] = {
            shifts: day.shifts.map((s) => s.id.toString()),
          };
        } else {
          attendanceSettingsData[`${day.key}J`] = { shifts: [] };
        }
      });
      payload.attendanceSettings = attendanceSettingsData;
    }
    if (formData.employeeHolidays && formData.employeeHolidays.length > 0) {
      payload.holidaySettingsJ = {
        holidays: formData.employeeHolidays.map((id) => id.toString()),
      };
    }
    if (selectedBranchLocation?.id)
      payload.branchLocation = selectedBranchLocation.id;
    if (selectedDepartment?.id) payload.department = selectedDepartment.id;
    if (selectedAccessLevel?.id) payload.accessLevel = selectedAccessLevel.id;
    const verifications = [];
    if (formData.voterID) verifications.push("voterID");
    if (formData.gst) verifications.push("GST");
    if (formData.uan) verifications.push("UAN");
    if (formData.aadhar) verifications.push("aadhar");
    if (formData.pan) verifications.push("PAN");
    const userData = {
      first_name: formData.firstName,
      middle_name: formData.middleName,
      last_name: formData.lastName,
      email: formData.email || generateDefaultEmail(),
      phone: `+91${formData.phone}`,
      appAccess: formData.appAccess,
      password: `${formData.phone}`,
      role: selectedRole?.id,

      userApp: "fieldeasy",
      tenant: resolvedTenantId,
      officeEmail: formData.officeEmail,
      designation: formData.designation,
      skilled: formData.skilled,
      permanent_Address: formData.permanentAddress,
      current_Address: formData.currentAddress,
      UAN: formData.uan,
      voter_ID: formData.voterID,
      driving_License: formData.drivingLicense,
      emergency_Contact_Address: formData.emergencyContactAddress,
      emergency_Contact_Relationship: formData.emergencyContactRelationship,
      emergency_Contact_Mobile_Number: formData.emergencyContactMobileNumber,
      guardians_Name: formData.guardiansName,
      ESIAccountNumber: formData.ESIAccountNumber,
      PFAccountNumber: formData.PFAccountNumber,
      shopAccount: formData.shopAccount,
      verification: verifications,
      previousExperiences:
        formData.previousRecords.length > 0 ? formData.previousRecords : [],
      reportingManager: reportingManagerIds,
      approver: formData.approver,
      cycleType: formData.cycleType,
      DOB: formData.assignedUser.DOB,
      organization: formData.organization,
    };
    if (currentAvatarId.value) userData.avatar = currentAvatarId.value;
    if (formData.gender) userData.gender = formData.gender;
    if (formData.DOB) userData.DOB = formData.DOB;
    if (formData.maritalStatus) userData.maritalStatus = formData.maritalStatus;
    if (formData.bloodGroup) userData.bloodGroup = formData.bloodGroup;
    if (formData.pan) userData.pan = formData.pan;
    if (formData.aadhar) userData.aadhar = formData.aadhar;
    if (formData.gst) userData.gst = formData.gst;
    if (formData.dateOfJoining) userData.dateOfJoining = formData.dateOfJoining;
    if (formData.dateOfLeaving) userData.dateOfLeaving = formData.dateOfLeaving;
    payload.assignedUser = { ...userData, ...bankDetails.value };
    console.log("Reporting Manager IDs in Payload:", payload.reportingManager);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      },
    );
    console.log(payload);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to save employee data",
      );
    }
    const responseData = await response.json();
    const createdEmployeeId = responseData.data.id;
    if (selectedAvatarFile.value) {
      try {
        const avatarId = await handleAvatarUpload(createdEmployeeId);
        if (avatarId) {
          const personalModuleResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/items/personalModule/${createdEmployeeId}?fields[]=assignedUser.id`,
            {
              headers: {
                Authorization: `Bearer ${authService.getToken()}`,
              },
            },
          );
          if (!personalModuleResponse.ok) {
            throw new Error("Failed to fetch personal module data");
          }
          const personalModuleData = await personalModuleResponse.json();
          const userId = personalModuleData.data.assignedUser.id;
          if (!userId) {
            throw new Error("User ID not found in personal module data");
          }
          const avatarUpdateResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/users/${userId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authService.getToken()}`,
              },
              body: JSON.stringify({ avatar: avatarId }),
            },
          );
          if (!avatarUpdateResponse.ok) {
            throw new Error("Failed to update user with avatar ID");
          }
        }
      } catch (error) {
        console.error("Error handling avatar upload:", error);
        showErrorMessage(
          `Avatar upload completed, but couldn't update profile picture: ${error.message}`,
        );
      }
    }
    if (assignedCardsFromComponent.length > 0) {
      for (const card of assignedCardsFromComponent) {
        const cardPayload = {
          rfidCard: card.rfidCard,
          type: card.type.toLowerCase(),
          enabled: card.enabled,
          tenant: resolvedTenantId,
          accessLevelsId: accessLevelNumber,
          cardAccess: card.enabled,
          cardAccessLevelArray: `${card.rfidCard}:${card.enabled ? 1 : 0}:${accessLevelNumber}`,
          cardAccessLevelHex: convertToCardAccessHex(
            card.rfidCard,
            card.enabled,
            accessLevelNumber,
          ),
          employeeId: createdEmployeeId,
        };
        const cardResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/items/cardManagement`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authService.getToken()}`,
            },
            body: JSON.stringify(cardPayload),
          },
        );
        if (!cardResponse.ok) {
          console.error("Failed to create card:", await cardResponse.json());
        }
      }
    }
    const earningsPayload = earnings.value.reduce((acc, item) => {
      acc[item.name] = item.amount;
      return acc;
    }, {});
    const salaryBreakdownResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({
          ctc: annualCTC.value || 0,
          employee: createdEmployeeId,
          tenant: resolvedTenantId,
          earnings: earningsPayload,
          basicPay: basicPayValue.value,
          basicSalary: monthlyCTC.value,
          netSalary: netSalary.value,
          totalDeductions: totalDeductions.value,
          totalEarnings: totalEarnings.value,
          uniqueId: `${resolvedTenantId}-${formData.employeeId}`,
        }),
      },
    );
    if (annualCTC.value) {
      if (totalAmount.value > monthlyCTC.value) {
        alert("Cannot update! Fixed earnings exceed Monthly CTC.");
        return;
      }
    }
    if (!salaryBreakdownResponse.ok) {
      const errorData = await salaryBreakdownResponse.json();
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to create salary breakdown",
      );
    }
    showSuccessMessage("Employee added successfully!");
    setTimeout(() => {
      emit("save-success");
    }, 2000);
  } catch (error) {
    console.error("Error saving employee data:", error);
    showErrorMessage(
      `An error occurred while saving the employee data: ${error.message}`,
    );
  }
}

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      selectedAvatarFile.value = file;
      avatarImage.value = URL.createObjectURL(file);
      event.target.value = "";
    } catch (error) {
      console.error("Error handling avatar change:", error);
      alert("Failed to process avatar. Please try again.");
    }
  }
};

const handleAvatarUpload = async (personalModuleId) => {
  if (!selectedAvatarFile.value) return null;

  try {
    const file = selectedAvatarFile.value;
    const tenantId = await resolveTenantId();

    // Get the tenant's profile folder ID
    const profileFolderId = await getProfileFolderId(tenantId);

    const formData = new FormData();

    // If we have a profile folder ID, use it
    if (profileFolderId) {
      formData.append("folder", profileFolderId);
    }

    // Use personalModuleId-tenantId as the filename
    const fileExtension = file.name.split(".").pop();
    const customFileName = `${personalModuleId}-${tenantId}.${fileExtension}`;

    formData.append("file", file, customFileName);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload avatar");
    }

    const data = await response.json();
    return data.data.id;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return null;
  }
};

async function getProfileFolderId(tenantId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tenant data");
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].foldersId) {
      // Find the Profiles folder
      const profilesFolder = data.data[0].foldersId.find(
        (folder) => folder.name === "Profiles",
      );

      if (profilesFolder) {
        return profilesFolder.id;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching profile folder ID:", error);
    return null;
  }
}

const activeTab = ref("working-hours");
const weekDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

onMounted(async () => {
  userRole.value = authService.getUserRole() || "Employee";

  // await fetchHolidays(); // No longer needed here
  await fetchOrganizations();
  await fetchDepartments();
  await fetchLocations();
  await fetchAccessLevels();
  await fetchRoles();
  await fetchSalarySettings();
  fetchAttendanceCategories();
  await filterReportingManagers();
  await filterManagesEmployee();
  await filterApprovers();
  // await fetchLeaveSettings();
  await fetchLeavePolicies();
  await fetchCycleTypes();
  formData.tenantName = authService.getTenantName();
});

// Watch for organization changes to fetch dependent options
watch(
  () => formData.organization,
  async (newOrgId) => {
    formData.department = "";
    formData.branchLocation = "";
    if (newOrgId) {
      await fetchDepartments(newOrgId);
      await fetchLocations(newOrgId);
    } else {
      departmentOptions.value = [];
      locationOptions.value = [];
    }
  },
);
watch(
  () => formData.accessOn,
  (newValue) => {
    if (!newValue) {
      formData.status = "false";
    } else {
      formData.status = "true";
    }
  },
  { immediate: true },
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
watch(
  () => formData.role,
  (newRole, oldRole) => {
    if (newRole !== oldRole) {
      formData.approver = null; // Reset approver when role changes
      filterApprovers(); // Refresh the approver list
    }
  },
);
watch(currentTab, (newTab, oldTab) => {
  if (oldTab && tabRequiredFields[oldTab]) {
    const mandatoryFields = tabRequiredFields[oldTab];
    if (Array.isArray(mandatoryFields)) {
      mandatoryFields.forEach((field) => {
        if (!formData[field]) {
          touchedFields.value[field] = true;
          formErrors.value[field] = "This field is required";
        }
      });
    }
  }

  if (newTab === "company") {
    filterReportingManagers(); // Trigger API call when company tab is selected
    filterManagesEmployee();
    filterApprovers();
  }

  if (newTab === "salary") {
    fetchSalarySettings();
  }
  if (newTab === "LeavePolicy") {
    fetchLeavePolicies();
  }
});

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<style scoped>
.filter-dropdown {
  position: absolute;
  right: 0;
  width: 300px;
  z-index: 100;
  background: white;
}
.first-name-container,
.config-name-container {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f0f0f0;
}

.first-name-container {
  margin-left: 16px;
}

.employee-form-container {
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

.form-content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-left: 1rem;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 1rem;
}

.form-content {
  flex: 1;
  padding: 24px;
  height: calc(80vh - 70px);
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 8px;
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
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}

.v-list-item.has-error:not(.v-list-item--active) {
  background-color: rgb(var(--v-theme-error), 0.1);
}

:deep(.v-list-item--active) {
  background-color: #f5f5f5 !important;
  color: #1976d2 !important;
}

:deep(.v-list-item:hover) {
  background-color: #f0f0f0;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  background-color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.payroll-category {
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 64px);
  overflow-x: hidden;
  border-radius: 8px;
}

.config-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-icon {
  margin-top: 4px;
}

.salary-select,
.ctc-input,
.net-salary-input {
  flex: 1;
  background-color: white;
  border-radius: 8px;
}

.card-header {
  padding: 20px;
  color: white;
}

.card-header.earnings {
  background: linear-gradient(135deg, #66cdaa 0%, #c4e17f 100%);
}

.card-header.employer {
  background: linear-gradient(135deg, #6faedb 0%, #b6e3f7 100%);
}

.card-header.employee {
  background: linear-gradient(135deg, #f9a17c 0%, #fbc28d 100%);
}

.card-header.deductions {
  background: linear-gradient(135deg, #f08d7d 0%, #f7a68f 100%);
}

.header-text {
  flex: 1;
}

.header-text h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 4px;
}

.amount {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.percentage {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

.action-footer {
  background: #f5f5f5;
  border-radius: 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.salary-breakdown {
  margin-bottom: 60px; /* Add space for the fixed footer */
}

.net-salary-input {
  display: inline-block;
  margin-left: 16px;
  vertical-align: middle;
}

.salary-config .v-col {
  display: flex;
  align-items: center;
}

.salary-config .v-col > * {
  flex: 1;
}

@media (max-width: 960px) {
  .salary-config .v-col {
    flex-direction: column;
    align-items: stretch;
  }

  .net-salary-input {
    margin-left: 0;
    margin-top: 16px;
  }
}

:deep(.v-list-item) {
  padding: 0px !important;
  margin-bottom: 4px;
  border-radius: 8px;
}

:deep(.v-input) {
  border-radius: 8px;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-input__prepend) {
  margin-right: 8px;
}

.v-list-item {
  padding: 0px !important;
  margin-bottom: 4px;
  border-radius: 8px;
}

.shift-details {
  padding: 8px 0;
}

.time-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.no-shifts {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #444343;
}

.leave-card {
  transition: transform 0.2s ease;
}

.leave-card:hover {
  transform: translateY(-2px);
}

.holidays-list {
  margin: 0 auto;
}

:deep(.v-list-item.has-error) {
  background-color: rgba(244, 67, 54, 0.1) !important;
  color: #f44336 !important;
}

:deep(.v-list-item.has-error .v-list-item-title) {
  color: #f44336 !important;
}

:deep(.v-list-item.has-error .v-icon) {
  color: #f44336 !important;
}

/* Override active state when there's an error */
:deep(.v-list-item.has-error.v-list-item--active) {
  background-color: rgba(244, 67, 54, 0.15) !important;
  color: #f44336 !important;
}

:deep(.v-list-item.has-error.v-list-item--active .v-list-item-title) {
  color: #f44336 !important;
}

:deep(.v-list-item.has-error.v-list-item--active .v-icon) {
  color: #f44336 !important;
}
</style>
