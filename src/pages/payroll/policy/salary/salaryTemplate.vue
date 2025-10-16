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
              Create Payroll Policy
            </h2>
          </div>

          <div class="d-flex align-center ga-2">
            <BaseButton
              variant="danger"
              size="sm"
              color="grey"
              class="me-2 text-none"
              :left-icon="XCircle"
              @click="goBack"
            >
              Cancel
            </BaseButton>

            <BaseButton
              variant="primary"
              size="sm"
              color="#122f68"
              class="text-none text-white"
              :left-icon="Check"
              :loading="saving"
              @click="save"
            >
              Save Category
            </BaseButton>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row style="margin-top: -24px">
      <v-col cols="10">
        <div
          class="d-flex align-center justify-space-between pa-4"
          style="background-color: #f8fafc; border-radius: 8px"
        >
          <v-row>
            <!-- <v-col cols="3">
              <v-select
                v-model="selectedState"
                :items="states"
                item-title="text"
                item-value="value"
                label="Select State *"
                variant="outlined"
                density="compact"
                @update:model-value="stateLimit"
                required
                :error-messages="limitMessage"
              />
            </v-col> -->
            <v-col cols="3">
              <v-text-field
                v-model="categoryName"
                label="Category Name *"
                variant="outlined"
                density="compact"
                required
              />
            </v-col>
          </v-row>
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
          <!-- Updated header with professional styling -->

          <div>
            <!-- Added professional background for basic information section -->

            <!-- Updated Earning section with professional styling -->
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
                        />
                      </v-col>
                      <v-col cols="1" class="d-flex align-center justify-end">
                        <ActionButton
                          v-if="!['Basic Pay'].includes(row.label)"
                          :icon="Trash2"
                          text=""
                          variant="text"
                          size="sm"
                          color="black"
                          @click="() => removeEarning(idx)"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </div>

                <!-- Dropdown menu attached to the Add allowance button -->
                <div class="d-flex align-center ga-2 mt-4">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <BaseButton
                        variant="primary"
                        size="sm"
                        color="black"
                        class="mr-2"
                        :left-icon="Plus"
                        v-bind="props"
                      >
                        Add allowance
                      </BaseButton>
                    </template>
                    <v-list
                      style="
                        max-height: 200px;
                        overflow-y: auto;
                        justify-content: space-between;
                      "
                    >
                      <v-list-item
                        v-for="(item, index) in availableEarningOptions"
                        :key="index"
                        @click="addSelectedEarning(item.name)"
                      >
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </section>

            <!-- Updated Employer Contribution section with professional styling -->
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
                          <BaseButton
                            variant="primary"
                            size="sm"
                            color="primary"
                            :left-icon="Plus"
                            @click="handleAddPfClick"
                          >
                            Add PF Account
                          </BaseButton>
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
                            style="max-height: 80px; overflow-y: auto"
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
                      <!-- <v-row v-if="!hasESIAccount" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >ESI Not Available</span
                          >
                        </v-col>
                        <v-col cols="3" class="text-right">
                          <BaseButton
                            variant="primary"
                            size="sm"
                            color="primary"
                            :left-icon="Plus"
                            @click="handleAddESIClick"
                          >
                            Add ESI Account
                          </BaseButton>
                        </v-col>
                      </v-row> -->
                      <v-row dense>
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
                            :disabled="
                              form.employerPF.value === '' ||
                              form.employerPF.value === null ||
                              !hasPFAccount
                            "
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
                  <!-- Labour Welfare Fund -->
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
                        <v-col cols="6">
                          <v-select
                            v-model="selectedState"
                            :items="states"
                            item-title="text"
                            item-value="value"
                            label="Select State"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>

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

            <!-- Updated Deduction section with professional styling -->
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
                          <BaseButton
                            variant="primary"
                            size="sm"
                            color="primary"
                            :left-icon="Plus"
                            @click="addAccount"
                          >
                            Add PF Account
                          </BaseButton>
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
                      <!-- <v-row v-if="!hasESIAccount" class="align-center">
                        <v-col cols="3" class="d-flex align-center">
                          <v-icon color="red" class="mr-2"
                            >mdi-alert-circle</v-icon
                          >
                          <span class="text-red font-weight-bold"
                            >ESI Not Available</span
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
                            Add ESI Account
                          </BaseButton>
                        </v-col>
                      </v-row> -->
                      <v-row dense>
                        <v-col cols="3">
                          <v-select
                            :items="[
                              { title: '0.75%', value: 0.75 },
                              { title: 'NoValue', value: null },
                            ]"
                            v-model="form.employeeESI.value"
                            label="Value"
                            variant="outlined"
                            density="comfortable"
                            hide-details
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
                        <v-col cols="6">
                          <v-select
                            v-model="selectedState"
                            :items="states"
                            item-title="text"
                            item-value="value"
                            label="Select State"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
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
                        <v-col cols="6">
                          <v-select
                            v-model="selectedState"
                            :items="states"
                            item-title="text"
                            item-value="value"
                            label="Select State"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="6" class="d-flex align-center">
                          <v-icon color="grey-darken-1" class="mr-2"
                            >mdi-information-outline</v-icon
                          >
                          <span class="text-grey-darken-1"
                            >System Calculated</span
                          >
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
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
                      />
                    </v-col>
                    <v-col cols="1" class="d-flex align-center justify-end">
                      <ActionButton
                        text="Delete"
                        :icon="Trash2"
                        variant="text"
                        size="sm"
                        color="black"
                        @click="
                          () => {
                            removeDeduction(idx);
                          }
                        "
                      />
                    </v-col>
                  </v-row>
                </div>

                <div class="d-flex align-center ga-2 mt-4">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <BaseButton
                        variant="primary"
                        size="sm"
                        color="black"
                        :left-icon="Plus"
                        class="mr-2"
                        v-bind="props"
                      >
                        Add deduction
                      </BaseButton>
                    </template>
                    <v-list
                      style="
                        max-height: 200px;
                        overflow-y: auto;
                        justify-content: space-between;
                      "
                    >
                      <v-list-item
                        v-for="(item, index) in deductionOptions.filter(
                          (opt) =>
                            !form.deduction.some((d) => d.name === opt.name),
                        )"
                        :key="index"
                        @click="addSelectedDeduction(item)"
                      >
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
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
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="showAddDialog = false"> Cancel </v-btn>
          <v-btn color="green" :disabled="!formValid" @click="saveAccount">
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
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveAccount">Save</v-btn>
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
const isLoading = ref(true);
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

const state = ref("");

const addAccount = () => {
  router.push("/settings/organization");
};

const fetchStateData = async () => {
  isLoading.value = true;

  try {
    await fetchTenant();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/items/tax`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    states.value = data.data
      .filter(
        (item) =>
          item.state &&
          ["Tamil Nadu", "Maharashtra", "Delhi", "Karnataka"].includes(
            item.state,
          ),
      )
      .map((item) => ({
        text: item.state,
        value: item.id,
      }));

    selectedState.value = null; // Reset selection if previous value is not valid
  } catch (error) {
    console.error("Error fetching state data:", error);
  }
  isLoading.value = false;
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

    hasESIAccount.value = data.data.some((tenant) => {
      const esiAccountsFromApi = tenant.esiAccountNumber || [];
      return esiAccountsFromApi.some(
        (acc) =>
          acc.state ===
          states.value.find((s) => s.value === selectedState.value)?.text,
      );
    });
  } catch (error) {
    console.error("Error fetching tenant data:", error);
  }
};
const handleAddPfClick = () => {
  if (!categoryName.value) {
    alert("Please select State and Category first");
    return;
  }
  showAddPfDialog.value = true;
};
const handleAddESIClick = () => {
  if (!selectedState.value || !categoryName.value) {
    alert("Please select State and Category first");
    return;
  }
  showAddDialog.value = true;
};
const save = async () => {
  if (!categoryName.value) {
    alert("Please  enter category name before saving.");
    return;
  }
  const percentageEarnings = form.value.earning.filter(
    (earning) => earning.unit === "Percentage",
  );
  if (percentageEarnings.length > 0) {
    const totalPercentage = percentageEarnings.reduce(
      (sum, earning) => sum + (earning.value || 0),
      0,
    );
    if (totalPercentage !== 100) {
      alert(
        `Total percentage of earnings must equal 100%. Current total: ${totalPercentage}%`,
      );
      return;
    }
  }
  saving.value = true;
  try {
    const earnings = form.value.earning
      .filter((earning) => earning.label !== "Basic Pay")
      .map((earning) => ({
        name: earning.label || earning.name || "Allowance",
        calculations: earning.unit === "Percentage" ? "Percentage" : "Fixed",
        Fixed: earning.unit === "Fixed" ? earning.value : 0,
        Percentage: earning.unit === "Percentage" ? earning.value : 0,
      }));

    const deductions = form.value.deduction.map((deduction) => ({
      name: deduction.label || deduction.name,
      calculations: deduction.unit === "Percentage" ? "Percentage" : "Fixed",
      Fixed: deduction.unit === "Fixed" ? deduction.value : 0,
      Percentage: deduction.unit === "Percentage" ? deduction.value : 0,
    }));

    const employersContributions = {
      EmployerPF: {
        selectedOption: form.value.employerPF.value,
        withinCTC: form.value.employerPF.withinCTC || false,
        options: [
          { label: "No Value", value: null },
          { label: "Minimum Amount", value: 1800 },
          { label: "Percentage", value: 12 },
        ],
        Calculations: form.value.employerPF.calculations.flat().map((name) => ({
          name,
          percentage: 100,
        })),
      },
      EmployerESI: {
        selectedOption: form.value.employerESI.value,
        withinCTC: form.value.employerESI.withinCTC || false,
        options: [
          { label: "No Value", value: null },
          { label: "Percentage", value: 3.25 },
        ],
        Calculations: form.value.employerESI.calculations
          .flat()
          .map((name) => ({
            name,
            percentage: 100,
          })),
      },
    };
    const employeeDeductions = {
      EmployeePF: {
        selectedOption: form.value.employeePF.value,

        options: [
          { label: "No Value", value: null },
          { label: "Minimum Amount", value: 1800 },
          { label: "Percentage", value: 12 },
        ],
        Calculations: form.value.employeePF.calculations.flat().map((name) => ({
          name,
          percentage: 100,
        })),
      },
      EmployeeESI: {
        selectedOption: form.value.employeeESI.value,

        options: [
          { label: "No Value", value: null },
          { label: "Percentage", value: 0.75 },
        ],
        Calculations: form.value.employeeESI.calculations
          .flat()
          .map((name) => ({
            name,
            percentage: 100,
          })),
      },
    };

    const payload = {
      configName: categoryName.value,
      stateTaxes: selectedState.value,
      basicPay:
        form.value.earning.find((row) => row.label === "Basic Pay")?.value || 0,
      employersContributions,
      earnings,
      employeeDeductions,
      adminCharges: {
        enable: form.value.includeEdli,
        charge: form.value.includeEdli ? "1" : "0",
      },

      LWF: selectedState.value,
      tenant: {
        tenantId: tenantId,
      },
      professionalTax: selectedState.value,
      deductions: deductions.length > 0 ? deductions : null,
      allowances: form.value.earning
        .filter((e) => e.isAllowance)
        .map((allowance) => ({
          name: allowance.label || allowance.name,
          calculation: "On Attendance",
        })),
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/salarySetting`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();
    console.log("Save successful", payload);
    alert("saved successfully");
  } catch (error) {
    console.error("Save failed", error);
  } finally {
    saving.value = false;
    goBack();
  }
};
const saveAccount = async () => {
  try {
    const stateText = states.value.find(
      (s) => s.value === selectedState.value,
    )?.text;

    const payload = {};

    if (newAccount.value.number) {
      payload.esiAccountNumber = [
        ...(tenantData.value?.esiAccountNumber || []),
        { esiAccount: newAccount.value.number, state: stateText },
      ];
    }

    if (pfNumber.value) {
      payload.pfAccount = pfNumber.value;
    }

    console.log("payload", payload);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/tenant/${tenantId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update Account");
    }

    await response.json();
    showAddDialog.value = false;
    newAccount.number = "";
    showAddPfDialog.value = false;
    pfNumber.value = "";
    await fetchTenant();
  } catch (error) {
    console.error("failed to update", error);
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
    value: 0.75,
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

// Computed property to show only available earning options (excluding already selected ones)
const availableEarningOptions = computed(() => {
  const usedLabels = form.value.earning.map((item) => item.label);
  return earningOptions.filter((option) => !usedLabels.includes(option.name));
});

const rules = {
  required: (v) => (!!v && v.trim().length > 0) || "Required",
};

function addSelectedEarning(allowanceName) {
  if (allowanceName) {
    const selectedOption = earningOptions.find(
      (opt) => opt.name === allowanceName,
    );
    const defaultUnit =
      selectedOption?.type === "Percentage" ? "Percentage" : "Fixed";

    form.value.earning.push({
      id: rid(),
      label: allowanceName,
      value: 0,
      unit: defaultUnit,
      isBasic: false,
    });
  }
}

function removeEarning(idx) {
  if (!form.value.earning[idx].isBasic) {
    form.value.earning.splice(idx, 1);
  }
}

function addDeduction() {
  form.value.deduction.push({
    label: "",
    value: 0,
    unit: "Percentage",
  });
}

function removeDeduction(idx) {
  form.value.deduction.splice(idx, 1);
}

const goBack = () => {
  emit("close");
  router.push("/configuration");
};

watch(
  () => form.value.earning.map((e) => e.label),
  (newEarnings) => {
    form.value.employerPF.calculations =
      form.value.employerPF.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );

    form.value.employerESI.calculations =
      form.value.employerESI.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );

    form.value.employeePF.calculations =
      form.value.employeePF.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );

    form.value.employeeESI.calculations =
      form.value.employeeESI.calculations.filter(
        (calc) => newEarnings.includes(calc) || calc === "Basic Pay",
      );
  },
  { deep: true },
);

// watch(selectedState, async (newVal) => {
//   const selectedItem = states.value.find((s) => s.value === newVal);
//   if (selectedItem) {
//     const res = await fetch(
//       `${import.meta.env.VITE_API_URL}/items/salarySetting?filter[stateTaxes][_eq]=${newVal}&filter[tenant][tenantId][_eq]=${tenantId}`,
//       { headers: { Authorization: `Bearer ${token}` } },
//     );
//     const data = await res.json();
//     categoryName.value = `${selectedItem.text} ${data.data.length + 1}`;
//     await fetchTenant();
//   }
// });

onMounted(async () => {
  await fetchStateData();
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
