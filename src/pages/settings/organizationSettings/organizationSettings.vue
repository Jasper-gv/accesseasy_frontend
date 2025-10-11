<template>
  <v-container
    fluid
    class="bg-grey-lighten-5 min-h-screen"
    style="height: 85vh; overflow-y: auto"
  >
    <!-- Main Container with Blue Border -->
    <div class="main-container">
      <div v-if="isLoading" class="loading-container">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="loading-text">Loading Organization details...</div>
      </div>

      <div v-else class="content-wrapper">
        <!-- Company Details Section -->
        <v-card class="section-card company-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <div class="company-icon-wrapper">
                <v-icon class="company-icon">mdi-domain</v-icon>
              </div>
              <h2 class="section-title">Company Details</h2>
            </div>

            <div class="action-buttons">
              <template v-if="!editModes.address">
                <BaseButton
                  variant="primary"
                  size="sm"
                  :left-icon="Edit2"
                  @click="toggleEdit('address')"
                >
                  Edit
                </BaseButton>
              </template>
              <template v-else>
                <BaseButton
                  variant="danger"
                  size="sm"
                  :left-icon="XCircle"
                  color="red"
                  @click="cancelEdit('address')"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="sm"
                  :left-icon="Check"
                  color="green"
                  class="me-2"
                  @click="saveChanges"
                >
                  Save
                </BaseButton>
              </template>
            </div>
          </div>

          <v-row class="company-content">
            <div class="position-relative; d-flex justify-center">
              <div
                class="logo-box elevation-2 rounded-lg overflow-hidden d-flex align-center justify-center position-relative"
                :style="{
                  width: '280px',
                  height: '280px',
                  cursor: 'pointer',
                  backgroundColor: tenantData?.logo ? 'transparent' : '#f5f5f5',
                }"
                @click="!tenantData?.logo && $refs.logoInput.click()"
              >
                <v-img
                  v-if="tenantData?.logo"
                  :src="tenantData.logo"
                  alt="Company Logo"
                  cover
                />
                <v-icon v-else size="32" color="grey">mdi-plus</v-icon>

                <!-- Remove button (neutral color, small) -->
                <v-btn
                  v-if="tenantData?.logo"
                  icon
                  small
                  class="position-absolute"
                  style="top: 4px; right: 4px"
                  @click.stop="tenantData.logo = null"
                >
                  <v-icon size="20" color="red-darken-1">mdi-close</v-icon>
                </v-btn>
              </div>

              <input
                ref="logoInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleLogoChange"
              />
            </div>

            <div class="company-info">
              <div class="company-name-section">
                <div class="field-label">Company Name</div>
                <div class="field-value d-flex align-center">
                  {{ tenantData?.tenantName || "Senzr" }}
                  <v-select
                    v-model="tenantData.accountSettings.currency"
                    :items="currencyOptions"
                    label="Currency"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="ml-4"
                    style="max-width: 120px"
                    :disabled="!editModes.address"
                  />
                </div>
              </div>

              <div class="address-section">
                <div class="field-label">Company Address</div>
              </div>

              <template v-if="!editModes.address">
                <v-row class="address-grid">
                  <v-col cols="12" md="4" class="address-field">
                    <div class="field-label-small">Building No</div>
                    <div class="field-value-small">
                      {{ tenantData?.companyAddress?.house || "125" }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" class="address-field">
                    <div class="field-label-small">Street</div>
                    <div class="field-value-small">
                      {{ tenantData?.companyAddress?.street || "arasalwar" }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" class="address-field">
                    <div class="field-label-small">City</div>
                    <div class="field-value-small">
                      {{ tenantData?.companyAddress?.vtc || "srivaikundam" }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" class="address-field">
                    <div class="field-label-small">District</div>
                    <div class="field-value-small">
                      {{ tenantData?.companyAddress?.dist || "thoothukudi" }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" class="address-field">
                    <div class="field-label-small">State</div>
                    <div class="field-value-small">
                      {{ tenantData?.companyAddress?.state || "tamilNadu" }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="4" class="address-field">
                    <div class="field-label-small">Pincode</div>
                    <div class="field-value-small">
                      {{ tenantData?.companyAddress?.zip || "62002" }}
                    </div>
                  </v-col>
                </v-row>
              </template>

              <template v-else>
                <v-row class="g-2">
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="tenantData.companyAddress.house"
                      label="Building No"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-text-field
                      v-model="tenantData.companyAddress.street"
                      label="Street"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="tenantData.companyAddress.vtc"
                      label="City"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="tenantData.companyAddress.dist"
                      label="District"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="tenantData.companyAddress.state"
                      label="State"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="tenantData.companyAddress.zip"
                      label="Pincode"
                      variant="outlined"
                      density="compact"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </template>
            </div>
          </v-row>
        </v-card>

        <!-- ESI Accounts Section -->
        <v-card class="section-card">
          <div class="section-header">
            <div class="section-title-wrapper">
              <v-icon class="section-icon">mdi-shield-account</v-icon>
              <h2 class="section-title">ESI Number</h2>
            </div>

            <div v-if="!showAddESI">
              <BaseButton
                variant="primary"
                size="sm"
                :left-icon="Plus"
                @click="openAddESI"
              >
                Add ESI Number
              </BaseButton>
            </div>
          </div>

          <div class="section-content">
            <v-row v-show="showAddESI" class="align-center mb-4">
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="newESI.accountNumber"
                  label="ESI Account Number"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="newESI.state"
                  :items="stateOptions"
                  label="Select State"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-file-input
                  v-model="newESI.document"
                  label="Upload Document"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  prepend-inner-icon="mdi-file-document"
                  prepend-icon=""
                />
              </v-col>
              <v-col cols="12" md="3" class="d-flex justify-end action-buttons">
                <BaseButton
                  variant="danger"
                  size="md"
                  :left-icon="XCircle"
                  color="red"
                  @click="cancelAddESI"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="md"
                  :left-icon="Check"
                  class="me-2"
                  @click="saveChanges"
                >
                  Save
                </BaseButton>
              </v-col>
            </v-row>

            <div
              v-if="!tenantData?.esiAccountNumber?.length"
              class="empty-state"
            >
              No ESI accounts added yet.
            </div>

            <div v-else class="mt-4">
              <v-row>
                <v-col
                  v-for="(esi, index) in tenantData.esiAccountNumber"
                  :key="index"
                  cols="12"
                  md="4"
                  lg="3"
                >
                  <v-card
                    class="h-100"
                    style="
                      max-height: 250px;
                      overflow-y: auto;
                      border-left: 4px solid #1976d2;
                    "
                  >
                    <v-card-text class="pa-4">
                      <div
                        class="d-flex align-center justify-space-between mb-3"
                      >
                        <v-chip
                          color="deep-orange lighten-2"
                          text-color="white"
                          class="font-weight-semibold"
                          style="text-transform: uppercase"
                          small
                        >
                          {{ esi.state }}
                        </v-chip>

                        <div class="d-flex align-center gap-2">
                          <template v-if="!editModes['esi-' + index]">
                            <ActionButton
                              text="Edit"
                              :icon="Edit2"
                              variant="edit"
                              size="sm"
                              @click="toggleEdit('esi-' + index)"
                            />
                          </template>
                          <template v-else>
                            <ActionButton
                              text="Save"
                              :icon="Check"
                              variant="outlined"
                              size="sm"
                              color="green"
                              class="me-2"
                              @click="saveESIEdit(index, esi)"
                            />

                            <ActionButton
                              text="Cancel"
                              :icon="XCircle"
                              variant="outlined"
                              size="sm"
                              @click="cancelEdit('esi-' + index, esi)"
                            />
                          </template>
                        </div>
                      </div>

                      <div v-if="!editModes['esi-' + index]">
                        <div class="mb-3">
                          <div class="text-caption text-grey-darken-1 mb-1">
                            ESI Number
                          </div>
                          <div class="text-body-2 font-weight-medium">
                            {{ esi.esiAccount }}
                          </div>
                        </div>
                        <div
                          v-if="esi.documents?.length"
                          class="d-flex flex-column gap-2"
                        >
                          <div
                            v-for="(doc, docIndex) in esi.documents"
                            :key="docIndex"
                            class="d-flex align-center"
                          >
                            <v-chip
                              size="small"
                              color="success"
                              variant="tonal"
                            >
                              <v-icon left size="12">mdi-file-check</v-icon>
                              ESI Document
                            </v-chip>
                          </div>
                        </div>
                      </div>

                      <div v-else>
                        <v-text-field
                          v-model="esi.esiAccount"
                          label="Account Number"
                          variant="outlined"
                          density="compact"
                          hide-details
                          class="mb-3"
                        />
                        <v-file-input
                          v-model="esi.documents"
                          label="ESI Document"
                          variant="outlined"
                          density="compact"
                          hide-details
                          prepend-inner-icon="mdi-file-document"
                          prepend-icon=""
                        />
                      </div>

                      <div class="d-flex justify-end">
                        <ActionButton
                          text="Delete"
                          :icon="Trash2"
                          variant="red"
                          size="sm"
                          color="red"
                          @click="
                            () => {
                              selectedIndex = index;
                              selectedESI = esi;
                              showDeleteModal = true;
                            }
                          "
                        />
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card>

        <!-- Shop Accounts Section -->
        <v-card class="section-card">
          <div class="section-header">
            <div class="section-title-wrapper">
              <v-icon class="section-icon">mdi-store</v-icon>
              <h2 class="section-title">Shop Account Number</h2>
            </div>

            <div class="action-buttons">
              <template v-if="!editModes.shop">
                <BaseButton
                  variant="primary"
                  size="sm"
                  :left-icon="Edit2"
                  @click="toggleEdit('shop')"
                >
                  Edit
                </BaseButton>
              </template>
              <template v-else>
                <BaseButton
                  variant="danger"
                  size="sm"
                  :left-icon="XCircle"
                  color="red"
                  @click="cancelEdit('shop')"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="sm"
                  :left-icon="Check"
                  color="green"
                  class="me-2"
                  @click="saveChanges"
                >
                  Save
                </BaseButton>
              </template>
            </div>
          </div>

          <div class="section-content">
            <template v-if="!editModes.shop">
              <v-row class="shop-info-grid">
                <v-col cols="12" md="3" class="info-field">
                  <div class="field-label-small">
                    Shop & Establishment License
                  </div>
                  <div class="field-value-small">
                    {{ tenantData.shopAccount || "55666666" }}
                  </div>
                </v-col>
                <v-col cols="12" md="3" class="info-field">
                  <div class="field-label-small">Valid Till</div>
                  <div class="field-value-small">
                    {{ tenantData.shopValidity || "2025-09-10" }}
                  </div>
                </v-col>
                <v-col cols="12" md="3" class="info-field">
                  <div class="field-label-small">Shop Document</div>
                  <v-chip
                    v-if="tenantData.shopDocument"
                    size="small"
                    class="document-chip"
                    variant="tonal"
                  >
                    <v-icon left size="12">mdi-file-check</v-icon>
                    Shop Document
                  </v-chip>
                  <span v-else class="text-grey-darken-1">No document</span>
                </v-col>
              </v-row>
            </template>

            <template v-else>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="tenantData.shopAccount"
                    label="Shop & Establishment License"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-file-input
                    v-model="tenantData.shopDocument"
                    label="Shop Document"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    prepend-icon=""
                    prepend-inner-icon="mdi-file-document"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="tenantData.shopValidity"
                    label="Valid Till"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
              </v-row>
            </template>
          </div>
        </v-card>

        <!-- PF Accounts Section -->
        <v-card class="section-card">
          <div class="section-header">
            <div class="section-title-wrapper">
              <v-icon class="section-icon">mdi-account-cash</v-icon>
              <h2 class="section-title">PF Accounts</h2>
            </div>

            <div class="action-buttons">
              <template v-if="!editModes.pf">
                <BaseButton
                  variant="primary"
                  size="sm"
                  :left-icon="Edit2"
                  @click="toggleEdit('pf')"
                >
                  Edit
                </BaseButton>
              </template>
              <template v-else>
                <BaseButton
                  variant="danger"
                  size="sm"
                  :left-icon="XCircle"
                  color="red"
                  @click="cancelEdit('pf')"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  variant="primary"
                  size="sm"
                  :left-icon="Check"
                  color="green"
                  class="me-2"
                  @click="saveChanges"
                >
                  Save
                </BaseButton>
              </template>
            </div>
          </div>

          <div class="section-content">
            <template v-if="!editModes.pf">
              <v-row class="pf-info-grid">
                <v-col cols="12" md="3" class="info-field">
                  <div class="field-label-small">PF Account Number</div>
                  <div class="field-value-small">
                    {{ tenantData.pfAccount || "-" }}
                  </div>
                </v-col>
                <v-col cols="12" md="3" class="info-field">
                  <div class="field-label-small">PF Document</div>
                  <v-chip
                    v-if="tenantData.pfDocumentUrl"
                    size="small"
                    class="document-chip"
                    variant="tonal"
                  >
                    <v-icon left size="12">mdi-file-check</v-icon>
                    PF Document
                  </v-chip>
                  <span v-else class="text-grey-darken-1">-</span>
                </v-col>
              </v-row>
            </template>

            <template v-else>
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="tenantData.pfAccount"
                    label="PF Account Number"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-file-input
                    v-model="tenantData.pfDocumentUrl"
                    label="Upload PF Document"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    prepend-icon=""
                    prepend-inner-icon="mdi-file-document"
                  />
                </v-col>
              </v-row>
            </template>
          </div>
        </v-card>
      </div>
    </div>
    <DeleteModal
      v-if="showDeleteModal"
      :show="showDeleteModal"
      title="Confirm Deletion"
      confirmMessage="Are you sure you want to delete"
      :itemLabel="'ESI Account'"
      :itemName="`${tenantData.esiAccountNumber[selectedIndex].state} - ${tenantData.esiAccountNumber[selectedIndex].esiAccount}`"
      cancelText="Cancel"
      confirmText="Delete"
      :deleting="deleting"
      :deletingText="'Deleting...'"
      @close="showDeleteModal = false"
      @confirm="
        () => {
          tenantData.esiAccountNumber.splice(selectedIndex, 1);
          saveESIEdit(selectedIndex, selectedESI, true);
          showDeleteModal = false;
        }
      "
    />
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import DeleteModal from "@/components/common/modals/ConfirmDeleteModal.vue";

import {
  DownloadIcon,
  XCircle,
  Plus,
  Edit2,
  Check,
  Trash2,
} from "lucide-vue-next";
import ActionButton from "@/components/common/buttons/ActionButton.vue";

const token = authService.getToken();
const tenantId = currentUserTenant.getTenantId();
const isLoading = ref(false);
const showDeleteModal = ref(false);
const selectedIndex = ref(null);
const selectedESI = ref(null);
const deleting = ref(false);

const logoInput = ref(null);
const stateOptions = ref([]);
const currencyOptions = ref(["AED", "USD", "INR"]);
const editModes = reactive({
  address: false,
  esi: false,
  shop: false,
  pf: false,
});
const tenantData = ref({
  accountSettings: { currency: "INR" }, // Initialize with default currency
});

const originalTenantDataRef = ref(null);
const fetchAssets = async (fileId) => {
  if (!fileId) return null;
  const url = `${import.meta.env.VITE_API_URL}/assets/${fileId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

const fetchCompanyData = async () => {
  try {
    isLoading.value = true;
    const fields = [
      "tenantName",
      "shopAccount",
      "documents",
      "pfDocument",
      "logo",
      "companyAddress",
      "esiAccount",
      "pfAccount",
      "esiAccountNumber",
      "gstDetails",
      "accountSettings",
    ];

    const query =
      fields.map((f) => `fields[]=${f}`).join("&") +
      `&filter[tenantId][_eq]=${tenantId}`;
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch tenant data");
    const data = await response.json();
    const tenant = data.data[0] || null;
    if (!tenant) return null;

    // Ensure companyAddress object exists with all required properties
    tenant.companyAddress = tenant.companyAddress || {};

    // Initialize all address fields with empty strings if they don't exist
    const addressFields = ["house", "street", "vtc", "dist", "state", "zip"];
    addressFields.forEach((field) => {
      if (!tenant.companyAddress[field]) {
        tenant.companyAddress[field] = "";
      }
    });

    // Ensure accountSettings exists
    tenant.accountSettings = tenant.accountSettings || { currency: "INR" };

    // Map logo
    tenant.logo = tenant.logo ? await fetchAssets(tenant.logo) : null;

    // Map PF document
    const pfDoc = tenant.documents?.find((d) => d.type === "PF");
    tenant.pfDocumentUrl = pfDoc?.file_id
      ? await fetchAssets(pfDoc.file_id)
      : null;

    const shopDoc = tenant.documents?.find((d) => d.type === "Shop");
    tenant.shopDocument = shopDoc?.file_id
      ? await fetchAssets(shopDoc.file_id)
      : null;
    tenant.shopValidity = shopDoc?.validity || null;

    // Map ESI documents
    if (tenant.esiAccountNumber?.length) {
      tenant.esiAccounts = await Promise.all(
        tenant.esiAccountNumber.map(async (esi) => ({
          ...esi,
          documents: esi.documents?.length
            ? await Promise.all(
                esi.documents.map(async (d) => ({
                  ...d,
                  url: await fetchAssets(d.file_id),
                })),
              )
            : [],
        })),
      );
    }

    // Directly assign to tenantData.value
    tenantData.value = tenant;
    originalTenantDataRef.value = JSON.parse(JSON.stringify(tenant));
  } catch (error) {
    console.error("Error fetching company data:", error);
    return null;
  } finally {
    isLoading.value = false;
  }
};

const addDocument = async (fileType, file, validity = null, state = null) => {
  const token = authService.getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  const uploadedId = data.data.id;

  const fileUrl = await fetchAssets(uploadedId);
  const newDoc = { id: uploadedId, fileType, validity, state, url: fileUrl };
  return newDoc;
};

const saveChanges = async () => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();
    const payload = {};

    const originalTenantData = JSON.parse(
      JSON.stringify(originalTenantDataRef.value),
    );

    const currentAddress = tenantData.value.companyAddress || {};
    const originalAddress = originalTenantData.companyAddress || {};
    const addressChanged = Object.keys(currentAddress).some(
      (key) => currentAddress[key] !== originalAddress[key],
    );
    if (addressChanged) {
      payload.companyAddress = { ...currentAddress };
    }

    if (
      tenantData.value.logo &&
      tenantData.value.logo !== originalTenantDataRef.value.logo
    ) {
      const logoDoc = await addDocument("Logo", tenantData.value.logofile);
      payload.logo = logoDoc.id;
    }

    // Check if currency has changed
    if (
      tenantData.value.accountSettings.currency !==
      (originalTenantData.accountSettings?.currency || "INR")
    ) {
      payload.accountSettings = {
        ...tenantData.value.accountSettings,
        currency: tenantData.value.accountSettings.currency,
      };
    }

    payload.documents = [...(originalTenantData.documents || [])];

    const currentPf = { pfAccount: tenantData.value.pfAccount };
    const originalPf = { pfAccount: originalTenantData.pfAccount };

    const pfChanged = currentPf.pfAccount !== originalPf.pfAccount;

    if (pfChanged) {
      payload.pfAccount = currentPf.pfAccount;
    }

    const existingPfDocIndex = payload.documents.findIndex(
      (d) => d.type === "PF",
    );

    if (
      tenantData.value.pfDocumentUrl &&
      tenantData.value.pfDocumentUrl !== originalTenantData.pfDocumentUrl
    ) {
      const pfDoc = await addDocument("PF", tenantData.value.pfDocumentUrl);

      if (existingPfDocIndex > -1) {
        payload.documents[existingPfDocIndex] = {
          file_id: pfDoc.id,
          type: "PF",
        };
      } else {
        payload.documents.push({
          file_id: pfDoc.id,
          type: "PF",
        });
      }
    } else if (existingPfDocIndex > -1) {
      payload.documents[existingPfDocIndex] = {
        ...payload.documents[existingPfDocIndex],
      };
    }

    const currentShop = { shopAccount: tenantData.value.shopAccount };
    const originalShop = { shopAccount: originalTenantData.shopAccount };
    const shopChanged = Object.keys(currentShop).some(
      (key) => currentShop[key] !== originalShop[key],
    );

    const existingShopDocIndex = payload.documents.findIndex(
      (d) => d.type === "Shop",
    );

    if (shopChanged) {
      payload.shopAccount = currentShop.shopAccount;
    }

    if (
      tenantData.value.shopDocument &&
      tenantData.value.shopDocument !== originalTenantData.shopDocument
    ) {
      const shopDoc = await addDocument("Shop", tenantData.value.shopDocument);

      if (existingShopDocIndex > -1) {
        payload.documents[existingShopDocIndex] = {
          file_id: shopDoc.id,
          type: "Shop",
          validity: tenantData.value.shopValidity || null,
        };
      } else {
        payload.documents.push({
          file_id: shopDoc.id,
          type: "Shop",
          validity: tenantData.value.shopValidity || null,
        });
      }
    } else if (existingShopDocIndex > -1) {
      payload.documents[existingShopDocIndex] = {
        ...payload.documents[existingShopDocIndex],
      };
    }

    if (newESI.accountNumber && newESI.state) {
      const esiDoc = newESI.document
        ? await addDocument("ESI", newESI.document)
        : null;

      payload.esiAccountNumber = [
        ...(tenantData.value.esiAccountNumber || []),
        {
          esiAccount: newESI.accountNumber,
          state: newESI.state,
          documents: esiDoc ? [esiDoc] : [],
        },
      ];
    }

    if (!Object.keys(payload).length && payload.documents.length === 0) return;

    await fetch(`${import.meta.env.VITE_API_URL}/items/tenant/${tenantId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    newESI.accountNumber = "";
    newESI.state = null;
    newESI.document = null;
    await fetchCompanyData();
    editModes.address = false;
    editModes.shop = false;
    editModes.pf = false;
  } catch (error) {
    console.error(error);
  }
};

const cancelEdit = (field) => {
  // Restore original data
  tenantData.value = JSON.parse(JSON.stringify(originalTenantDataRef.value));
  editModes[field] = false;
};
const fetchStateOptions = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/locationManagement?filter[tenant]=${tenantId}&fields[]=state&fields[]=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    stateOptions.value = data.data
      .map((item) => item.state)
      .filter((state) => state);
  } catch (error) {
    console.error("Failed to fetch state options:", error);
  }
};
const newESI = reactive({
  accountNumber: "",
  state: "",
  document: null,
});
const saveESIEdit = async (index, esi, isDelete = false) => {
  try {
    const token = authService.getToken();
    const tenantId = await currentUserTenant.getTenantId();

    if (
      !isDelete &&
      esi.documents &&
      esi.documents.length > 0 &&
      esi.documents[0].name
    ) {
      const esiDoc = await addDocument("ESI", esi.documents[0]);
      esi.documents = [{ file_id: esiDoc.id }];
    } else if (
      !isDelete &&
      esi.documents &&
      typeof esi.documents === "object" &&
      esi.documents.name
    ) {
      const esiDoc = await addDocument("ESI", esi.documents);
      esi.documents = [{ file_id: esiDoc.id }];
    }

    const payload = {
      esiAccountNumber: isDelete
        ? tenantData.value.esiAccountNumber.filter((_, i) => i !== index)
        : [
            ...(tenantData.value.esiAccountNumber || []).map((e, i) =>
              i === index ? esi : e,
            ),
          ],
    };

    await fetch(`${import.meta.env.VITE_API_URL}/items/tenant/${tenantId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!isDelete) {
      editModes[`esi-${index}`] = false;
    }
    await fetchCompanyData();
  } catch (error) {
    console.error(error);
  }
};

const cancelAddESI = () => {
  newESI.accountNumber = "";
  newESI.state = "";
  newESI.document = null;
  showAddESI.value = false;
};
const showAddESI = ref(false);

const openAddESI = async () => {
  Object.keys(editModes).forEach((key) => (editModes[key] = false));
  showAddESI.value = true;
  await fetchStateOptions();
};

const toggleEdit = (section) => {
  showAddESI.value = false;
  if (!(section in editModes)) editModes[section] = false;
  Object.keys(editModes).forEach((key) => {
    editModes[key] = key === section ? !editModes[key] : false;
  });
};

const triggerLogoUpload = () => {
  logoInput.value.click();
};

const handleLogoChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    tenantData.value.logo = URL.createObjectURL(file);
    tenantData.value.logofile = file;
  }
};

onMounted(async () => {
  await fetchCompanyData();
});
</script>

<style scoped>
.main-container {
  margin: 0 auto;
  background: #f8fafc;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 32px;
  margin-top: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e8eaed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}

.company-icon {
  font-size: 24px;
  color: #666;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  color: #666;
  letter-spacing: 0.5px;
}

.section-icon {
  font-size: 20px;
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.edit-btn {
  background-color: #4285f4 !important;
  color: white !important;
}

.add-btn {
  background-color: #4285f4 !important;
  color: white !important;
}

.company-content {
  padding: 24px;
}

.company-info {
  padding-left: 16px;
}

.company-name-section {
  margin-bottom: 24px;
}

.address-section {
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.field-value {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.address-grid {
  margin-top: 16px;
}

.address-field {
  padding: 8px 12px;
}

.field-label-small {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.field-value-small {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.section-content {
  padding: 24px;
}

.empty-state {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0px;
}

.shop-info-grid,
.pf-info-grid {
  margin: 0;
}

.info-field {
  padding: 12px;
}

.document-chip {
  background-color: #e8f5e8 !important;
  color: #2e7d32 !important;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
}

.loading-text {
  margin-top: 16px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
