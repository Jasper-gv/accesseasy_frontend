<template>
  <v-container fluid>
    <v-row>
      <v-col cols="10">
        <div
          class="d-flex align-center justify-space-between pa-4"
          style="background-color: #f8fafc; border-radius: 8px"
        >
          <!-- Left section: Back button + Title -->
          <div class="d-flex align-center">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              color="black"
              @click="goBack"
              class="mr-2"
            ></v-btn>
            <h2 class="text-h5 font-weight-bold text-black mb-0">
              view {{ categoryName }}
            </h2>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row style="height: 70vh; overflow-y: auto">
      <v-col cols="10">
        <div v-if="isLoading" class="loading-container">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <div class="loading-text">Loading data...</div>
        </div>
        <div
          v-else
          style="
            padding-top: 0;
            padding-right: 20px;
            padding-bottom: 20px;
            padding-left: 20px;
          "
        >
          <div>
            <section>
              <div
                class="pa-4 mb-4"
                style="
                  background-color: rgb(252 253 255);
                  border-radius: 8px;
                  border-left: 4px solid #22c55e;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                "
              >
                <h3
                  class="text-h6 font-weight-medium mb-4"
                  style="color: #166534"
                >
                  Earning Components
                </h3>

                <div
                  class="fields-container"
                  style="max-height: 300px; overflow-y: auto"
                >
                  <v-card-text>
                    <v-row
                      v-for="(row, idx) in form.earning"
                      :key="row.id"
                      class="mb-4 align-center"
                      dense
                    >
                      <v-col cols="3">
                        <div
                          :style="{
                            fontWeight: '500',
                            color: 'rgba(0, 0, 0, 0.87)',
                            lineHeight: '1.5',
                            paddingTop: '16px',
                            fontSize: '16px',
                            fontFamily: 'Roboto, sans-serif',
                          }"
                        >
                          {{ row.label }}
                        </div>
                      </v-col>
                      <v-col
                        cols="2"
                        v-if="
                          !['Basic Pay', 'HRA', 'Dearness Allowance'].includes(
                            row.label,
                          )
                        "
                      >
                        <v-select
                          v-model="row.unit"
                          :items="unitItems"
                          label="Type"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                          readonly
                          style="background-color: #f5f5f5"
                        />
                      </v-col>
                      <v-col cols="2">
                        <v-text-field
                          v-model.number="row.value"
                          type="number"
                          min="0"
                          label="Value"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                          :prefix="row.unit === 'Percentage' ? '%' : '₹'"
                          :placeholder="
                            row.unit === 'Percentage' ? 'Percentage' : 'Fixed'
                          "
                          readonly
                          style="background-color: #f5f5f5"
                        />
                      </v-col>
                      <v-col cols="1" class="d-flex align-center justify-end">
                      </v-col>
                    </v-row>
                  </v-card-text>
                </div>
              </div>
            </section>

            <section>
              <div
                class="pa-4 mb-4"
                style="
                  background-color: rgb(252 253 255);
                  border-radius: 8px;
                  border-left: 4px solid #3b82f6;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                "
              >
                <h3
                  class="text-h6 font-weight-medium mb-4"
                  style="color: #1e40af"
                >
                  Employer Contribution
                </h3>
                <v-divider class="mb-4" />

                <div class="fields-container">
                  <!-- Employer PF -->
                  <v-row class="mb-4 align-center" dense>
                    <v-col cols="3">
                      <div class="field-name">Employer PF</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row v-if="!hasPFAccount" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >PF Not Available</span
                          >
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <!-- Remove or disable Add PF Account button -->
                        </v-col>
                      </v-row>
                      <v-row v-else dense>
                        <v-col cols="3">
                          <v-select
                            :items="[
                              { title: '12% No limit', value: 12 },
                              { title: '12% ₹1800 limit', value: 1800 },
                              { title: 'NoValue', value: null },
                            ]"
                            v-model="form.employerPF.value"
                            label="Value"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            class="ml-4 value-input"
                            item-title="title"
                            item-value="value"
                            readonly
                            style="background-color: #f5f5f5"
                          ></v-select>
                        </v-col>
                        <v-col cols="4">
                          <v-select
                            :items="componentOptions"
                            v-model="form.employerPF.calculations"
                            label="Component"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            multiple
                            item-title="label"
                            item-value="value"
                            :menu-props="{ maxHeight: 200 }"
                            style="
                              max-height: 80px;
                              overflow-y: auto;
                              background-color: #f5f5f5;
                            "
                            readonly
                          >
                          </v-select>
                        </v-col>
                        <v-col cols="3">
                          <v-checkbox
                            v-model="form.employerPF.withinCTC"
                            label="Within CTC"
                            class="ml-4"
                            density="comfortable"
                            hide-details
                            readonly
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                  <!-- Employer ESI -->
                  <v-row class="mb-4 align-center" dense>
                    <v-col cols="3">
                      <div class="field-name">Employer ESI</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row v-if="!hasESIAccount" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >ESI Not Available</span
                          >
                        </v-col>
                      </v-row>
                      <v-row v-else dense>
                        <v-col cols="3">
                          <v-select
                            :items="[
                              { title: '3.25%', value: 3.25 },
                              { title: 'NoValue', value: null },
                            ]"
                            v-model="form.employerESI.value"
                            label="Value"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            class="ml-4 value-input"
                            item-title="title"
                            item-value="value"
                            readonly
                            style="background-color: #f5f5f5"
                          ></v-select>
                        </v-col>
                        <v-col cols="3">
                          <v-select
                            :items="componentOptions"
                            v-model="form.employerESI.calculations"
                            label="Component"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            multiple
                            item-title="label"
                            item-value="value"
                            readonly
                            style="background-color: #f5f5f5"
                          >
                          </v-select>
                        </v-col>
                        <v-col cols="3">
                          <v-checkbox
                            v-model="form.employerESI.withinCTC"
                            label="Within CTC"
                            class="ml-4"
                            density="comfortable"
                            hide-details
                            readonly
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                  <!-- PF EDLI & Admin Charges -->
                  <v-row class="mb-4 align-center" dense>
                    <v-col cols="3">
                      <div class="field-name">PF EDLI & Admin Charges</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row dense>
                        <v-col cols="3">
                          <v-switch
                            v-model="form.includeEdli"
                            hide-details
                            density="comfortable"
                            readonly
                            color="success"
                            inset
                          ></v-switch>
                        </v-col>
                        <v-col cols="3">
                          <v-text-field
                            v-if="form.includeEdli"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            class="component-input"
                            value="1"
                            suffix="%"
                            readonly
                            style="background-color: #f5f5f5"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row class="mb-4 align-center" dense>
                    <v-col cols="3">
                      <div class="field-name">Labour Welfare Fund</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row v-if="!hasShopEstablishment" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >Shop Account Not Available</span
                          >
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <BaseButton
                            variant="primary"
                            size="sm"
                            color="primary"
                            :left-icon="Plus"
                            @click="addAccount"
                          >
                            Add Shop Account
                          </BaseButton>
                        </v-col>
                      </v-row>
                      <v-row v-else class="align-center">
                        <v-col cols="6" class="d-flex align-center">
                          <v-icon color="grey-darken-1" class="mr-2"
                            >mdi-information-outline</v-icon
                          >
                          <span class="text-grey-darken-1"
                            >Value based on state rules</span
                          >
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </section>
            <section>
              <div
                class="pa-4 mb-4"
                style="
                  background-color: rgb(252 253 255);
                  border-radius: 8px;
                  border-left: 4px solid #ef4444;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                "
              >
                <h3
                  class="text-h6 font-weight-medium mb-6"
                  style="color: #dc2626"
                >
                  Deduction Components
                </h3>

                <div
                  class="mb-6"
                  style="
                    max-height: 300px;
                    overflow-y: auto;
                    overflow-x: hidden;
                  "
                >
                  <!-- Employee PF -->
                  <v-row class="mb-4 align-center" dense>
                    <v-col cols="3">
                      <div class="field-name">Employee PF</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row v-if="!hasPFAccount" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >PF Not Available</span
                          >
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <!-- Remove or disable Add PF Account button -->
                        </v-col>
                      </v-row>
                      <v-row v-else dense>
                        <v-col cols="3">
                          <v-select
                            :items="[
                              { title: '12% No limit', value: 12 },
                              { title: '12% ₹1800 limit', value: 1800 },
                              { title: 'NoValue', value: null },
                            ]"
                            v-model="form.employeePF.value"
                            label="Value"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            readonly
                            style="background-color: #f5f5f5"
                          ></v-select>
                        </v-col>
                        <v-col cols="3">
                          <v-select
                            :items="componentOptions"
                            v-model="form.employeePF.calculations"
                            label="Component"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            multiple
                            item-title="label"
                            item-value="value"
                            readonly
                            style="background-color: #f5f5f5"
                          >
                          </v-select>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                  <!-- Employee ESI -->
                  <v-row class="mb-4 align-center">
                    <v-col cols="3">
                      <div class="field-name">Employee ESI</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row v-if="!hasESIAccount" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >ESI Not Available</span
                          >
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <!-- Remove or disable Add ESI Account button -->
                        </v-col>
                      </v-row>
                      <v-row v-else dense>
                        <v-col cols="3">
                          <v-select
                            :items="[
                              { title: '3.25%', value: 3.25 },
                              { title: 'NoValue', value: null },
                            ]"
                            v-model="form.employeeESI.value"
                            label="Value"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            readonly
                            style="background-color: #f5f5f5"
                          ></v-select>
                        </v-col>
                        <v-col cols="3">
                          <v-select
                            :items="componentOptions"
                            v-model="form.employeeESI.calculations"
                            label="Component"
                            variant="outlined"
                            density="comfortable"
                            hide-details
                            multiple
                            item-title="label"
                            item-value="value"
                            readonly
                            style="background-color: #f5f5f5"
                          >
                          </v-select>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row class="mb-4 align-center" dense>
                    <v-col cols="3">
                      <div class="field-name">Labour Welfare Fund</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row v-if="!hasShopEstablishment" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >Shop Account Not Available</span
                          >
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <BaseButton
                            variant="primary"
                            size="sm"
                            color="primary"
                            :left-icon="Plus"
                            @click="addAccount"
                          >
                            Add Shop Account
                          </BaseButton>
                        </v-col>
                      </v-row>
                      <v-row v-else class="align-center">
                        <v-col cols="6" class="d-flex align-center">
                          <v-icon color="grey-darken-1" class="mr-2"
                            >mdi-information-outline</v-icon
                          >
                          <span class="text-grey-darken-1"
                            >Value based on state rules</span
                          >
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <!-- Professional Tax -->
                  <v-row class="mb-4 align-center" dense>
                    <v-col cols="3">
                      <div class="field-name">Professional Tax</div>
                    </v-col>
                    <v-col cols="8">
                      <v-row class="align-center">
                        <v-col cols="6" class="d-flex align-center">
                          <v-icon
                            color="grey-darken-1"
                            class="mr-2"
                            @click="showProfessionalTaxDialog = true"
                            >mdi-information-outline</v-icon
                          >
                          <span class="text-grey-darken-1"
                            >System Calculated</span
                          >
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                  <v-dialog
                    v-model="showProfessionalTaxDialog"
                    max-width="500px"
                  >
                    <v-card>
                      <v-card-title class="text-h6 font-weight-bold">
                        Professional Tax Rules
                      </v-card-title>
                      <v-card-text>
                        <div style="max-width: 300px">
                          <ul>
                            <li
                              v-for="rule in professionalTaxRules"
                              :key="rule.salaryRange"
                            >
                              Salary Range: {{ rule.salaryRange }} - Tax: ₹{{
                                rule.professionalTax
                              }}
                            </li>
                          </ul>
                        </div>
                      </v-card-text>
                      <v-card-actions class="justify-end">
                        <v-btn
                          variant="text"
                          @click="showProfessionalTaxDialog = false"
                        >
                          Close
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-row
                    v-for="(row, idx) in form.deduction"
                    :key="row.id"
                    class="mb-4 align-center"
                  >
                    <v-col cols="3">
                      <div class="field-name">{{ row.label }}</div>
                    </v-col>

                    <v-col cols="3">
                      <v-text-field
                        v-model.number="row.value"
                        type="number"
                        min="0"
                        label="Value"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        prefix="₹"
                        placeholder="Fixed"
                        readonly
                        style="background-color: #f5f5f5"
                      />
                    </v-col>
                    <v-col cols="1" class="d-flex align-center justify-end">
                      <!-- Remove delete button -->
                    </v-col>
                  </v-row>
                </div>

                <!-- Remove Add deduction button -->
              </div>
            </section>
          </div>
        </div>
      </v-col>
      <v-col cols="2"> </v-col>
    </v-row>
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">
          Add ESI Account
        </v-card-title>

        <v-card-text>
          <v-form ref="addAccountForm" v-model="formValid">
            <v-text-field
              v-model="newAccount.number"
              label="ESI Number"
              variant="outlined"
              required
              disabled
              style="background-color: #f5f5f5"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showAddDialog = false" disabled>
            Cancel
          </v-btn>
          <v-btn color="green" :disabled="true" @click="saveAccount" disabled>
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showAddPfDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Add PF Account</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="pfNumber"
            label="PF Account Number"
            variant="outlined"
            dense
            hide-details
            disabled
            style="background-color: #f5f5f5"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="showAddDialog = false" disabled>Cancel</v-btn>
          <v-btn color="primary" @click="saveAccount" disabled>Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ToastContainer />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import ToastContainer from "@/components/common/notifications/ToastContainer.vue";
// import { toast } from "better-vue-toast";

import {
  DownloadIcon,
  XCircle,
  Plus,
  Edit2,
  Check,
  Trash2,
} from "lucide-vue-next";
import { currentUserTenant } from "@/utils/currentUserTenant";
import ActionButton from "@/components/common/buttons/ActionButton.vue";

const tenantId = currentUserTenant.getTenantId();
const token = authService.getToken();
const router = useRouter();
const route = useRoute();

const selectedNewAllowance = ref(null);
const selectedNewDeduction = ref(null);
const emit = defineEmits(["close"]);

const saving = ref(false);
const isLoading = ref(false);
const showAddDialog = ref(false);
const formValid = ref(false);

const newAccount = ref({
  number: "",
});
const showAddPfDialog = ref(false);
const pfNumber = ref(null);

const unitItems = ["Fixed", "Percentage"];
const states = ref([]);
const selectedState = ref(null);
const hasPFAccount = ref(false);
const hasESIAccount = ref(false);
const tenantData = ref(null);
const hasShopEstablishment = ref(false);
const salaryState = ref(null);
const state = ref("");

const showProfessionalTaxDialog = ref(false);
const professionalTaxRules = ref([]);

const addAccount = () => {
  router.push("/settings/organization");
};

const fetchTenant = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await response.json();

    tenantData.value = data.data[0];

    hasPFAccount.value = data.data.some((tenant) => tenant.pfAccount);
    hasShopEstablishment.value = data.data.some((tenant) => tenant.shopAccount);

    const esiMatch = data.data.some((tenant) => {
      const esiAccounts = tenant.esiAccountNumber || [];
      return esiAccounts.some((acc) => acc.state === salaryState.value);
    });

    hasESIAccount.value = esiMatch;

    if (esiMatch) {
      selectedState.value = salaryState.value;
    }
  } catch (error) {
    console.error("Error fetching tenant data:", error);
  }
};
const fetchTaxRules = async (state) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tax?filter[_and][0][state][_icontains]=${encodeURIComponent(state)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].stateTaxRules?.PT) {
      professionalTaxRules.value = data.data[0].stateTaxRules.PT;
    } else {
      professionalTaxRules.value = [];
    }
  } catch (error) {
    console.error("Error fetching tax rules:", error);
    professionalTaxRules.value = [];
  }
};
const allBranches = ref([]);
const areaTypes = ref([]);
const selectedAreaType = ref(null);

const skillLevels = ref([
  "Unskilled",
  "Semi-Skilled",
  "Skilled",
  "Highly Skilled",
]);
const selectedSkillLevels = ref(null);

const categoryName = ref("");

const form = ref({
  earning: [
    {
      label: "Basic Pay",
      value: 100,
      unit: "Percentage",
    },
  ],
  deduction: [],
  employerPF: {
    withinCTC: false,
    value: 1800,
    calculations: ["Basic Pay"],
  },
  employerESI: {
    withinCTC: false,
    value: 3.25,
    calculations: ["Basic Pay"],
  },
  employeePF: {
    value: 1800,
    calculations: ["Basic Pay"],
  },
  employeeESI: {
    value: 3.25,
    calculations: ["Basic Pay"],
  },

  includeEdli: false,
});

const earningOptions = [
  { name: "Basic Pay", type: "Percentage" },
  { name: "HRA", type: "Percentage" },
  { name: "Dearness Allowance", type: "Percentage" },
  { name: "Special Allowance", type: "Percentage" },
  { name: "Travel Allowance", type: "Percentage" },
  { name: "Accomodation and Food", type: "Fixed" },
  { name: "Bonus and Incentives", type: "Fixed" },
  { name: "Cash Allowance", type: "Fixed" },
  { name: "Conveyance Allowance", type: "Fixed" },
  { name: "Children Education Allowance", type: "Fixed" },
  { name: "Distance Allowance", type: "Fixed" },
  { name: "Transport Allowance", type: "Fixed" },
];

const deductionOptions = [
  {
    name: "Benevolent Fund",

    type: "Fixed",
  },
  {
    name: "Term Insurance",

    type: "Fixed",
  },
  {
    name: "Group Accidental Policy & WC",

    type: "Fixed",
  },
  { name: "Gratuity", type: "Fixed" },
  {
    name: "Statutory Bonus Deduction",

    type: "Fixed",
  },
  {
    name: "Security Deposit",

    type: "Fixed",
  },
  {
    name: "Uniform Deduction",

    type: "Fixed",
  },
  {
    name: "Transport Charges",

    type: "Fixed",
  },
  {
    name: "Miscellaneous Deduction",

    type: "Fixed",
  },
  {
    name: "Food Deduction",

    type: "Fixed",
  },
  {
    name: "Medical Insurance Premium",

    type: "Fixed",
  },
];

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

const componentOptions = computed(() => {
  return form.value.earning.map((e) => ({
    label: e.label,
    value: e.label,
    props: e.label === "Basic Pay" ? { disabled: true } : {},
  }));
});

const addSelectedDeduction = (item) => {
  form.value.deduction.push({
    id: Date.now(),
    label: item.name,
    value: 0,
    unit: "Fixed",
    type: item.type,
  });
  console.log("Deduction rows:", form.value.deduction);
};

function removeComponent(section, componentName) {
  if (componentName !== "Basic Pay") {
    form.value[section].calculations = form.value[section].calculations.filter(
      (calc) => calc !== componentName,
    );
  }
}
// Computed property to show only available earning options (excluding already selected ones)
const availableEarningOptions = computed(() => {
  const usedLabels = form.value.earning.map((item) => item.label);
  return earningOptions.filter((option) => !usedLabels.includes(option.name));
});

const rules = {
  required: (v) => (!!v && v.trim().length > 0) || "Required",
};

function addDeduction() {
  form.value.deduction.push({
    label: "",
    value: 0,
    unit: "Percentage",
  });
}

const goBack = () => {
  emit("close");
  router.push("/configuration");
};

const fetchSettings = async (categoryData) => {
  isLoading.value = true;
  try {
    const categoryId = categoryData?.id || categoryData;

    const fields = [
      "basicPay",
      "earnings",
      "deductions",
      "employerContribution",
      "allowances",
      "deduction",
      "professionalTax",
      "LWF",
      "employersContributions",
      "employeeDeductions",
      "configName",
      "adminCharges",
      "stateTaxes.state",
    ];

    const query =
      fields.map((f) => `fields[]=${f}`).join("&") +
      `&filter[id][_eq]=${categoryId}`;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/salarySetting?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch salary settings");
    const data = await response.json();
    const salarySetting = data.data[0] || null;
    salaryState.value = salarySetting.stateTaxes?.state;

    if (salarySetting?.stateTaxes?.state) {
      await fetchTaxRules(salarySetting.stateTaxes.state);
    }
    if (!salarySetting) return null;

    const mappedEarnings = [
      {
        label: "Basic Pay",
        value: salarySetting.basicPay || 100,
        unit: "Percentage",
      },
      ...(salarySetting.earnings || []).map((item) => ({
        label: item.name,
        value:
          item.calculations === "Percentage" ? item.Percentage : item.Fixed,
        unit: item.calculations === "Percentage" ? "Percentage" : "Fixed",
      })),
    ];

    form.value.earning = mappedEarnings;

    form.value.deduction = (salarySetting.deductions || []).map((item) => ({
      label: item.name,
      value: item.amount,
      unit: "Fixed",
    }));

    form.value.employerPF.value =
      salarySetting.employersContributions?.EmployerPF?.selectedOption || 1800;
    form.value.employerPF.withinCTC =
      salarySetting.employersContributions?.EmployerPF?.withinCTC || false;
    form.value.employerPF.calculations =
      salarySetting.employersContributions?.EmployerPF?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.employerESI.value =
      salarySetting.employersContributions?.EmployerESI?.selectedOption || null;
    form.value.employerESI.withinCTC =
      salarySetting.employersContributions?.EmployerESI?.withinCTC || false;
    form.value.employerESI.calculations =
      salarySetting.employersContributions?.EmployerESI?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.employeePF.value =
      salarySetting.employeeDeductions?.EmployeePF?.selectedOption || 1800;
    form.value.employeePF.calculations =
      salarySetting.employeeDeductions?.EmployeePF?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.employeeESI.value =
      salarySetting.employeeDeductions?.EmployeeESI?.selectedOption || null;
    form.value.employeeESI.calculations =
      salarySetting.employeeDeductions?.EmployeeESI?.Calculations?.map(
        (c) => c.name,
      ) || ["Basic Pay"];

    form.value.includeEdli = salarySetting.adminCharges?.enable || false;

    categoryName.value = salarySetting.configName;
    selectedState.value = salarySetting.stateTaxes || selectedState.value;

    await fetchTenant();
  } catch (error) {
    console.error("Error fetching salary settings:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const receivedCategory = route.params.categoryData;

  await fetchSettings(receivedCategory);
});
</script>

<style scoped>
.v-container {
  max-width: 100% !important;
}

.text-pretty {
  text-wrap: pretty;
}

.ga-2 {
  gap: 8px;
}

.pe-md-3 {
  padding-right: 12px;
}

.pe-2 {
  padding-right: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-md-0 {
  margin-top: 0;
}

.mt-6 {
  margin-top: 24px;
}

.mt-8 {
  margin-top: 32px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1rem;
  color: #4a5568;
}
</style>
