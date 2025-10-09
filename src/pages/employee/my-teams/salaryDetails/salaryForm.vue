<template>
  <!-- Added main container styling -->
  <div class="employee-form-container">
    <!-- Enhanced header with shadow and better spacing -->
    <div class="form-header">
      <div class="header-content">
        <v-btn icon variant="text" @click="$emit('cancel')" class="back-button">
          <v-icon color="primary">mdi-arrow-left</v-icon>
        </v-btn>
        <h2 class="text-h5 font-weight-medium">{{ isEditing ? "Update" : "Add" }} Salary</h2>
        <div class="first-name-container">
          <v-icon left>mdi-account</v-icon>
          <span class="first-name">{{ props.firstName }}</span>
          <v-tooltip bottom>
            <span>{{ props.titleAttachment }}</span>
          </v-tooltip>
        </div>
      </div>
      <div class="action-buttons">
        <v-btn variant="outlined" color="grey-darken-1" @click="$emit('cancel')"
          >CANCEL</v-btn
        >
        <v-btn color="black" variant="flat" @click="saveChanges" :loading="isSaving"
          >SAVE</v-btn
        >
      </div>
    </div>

    <div class="form-content">
      <v-form @submit.prevent="saveChanges">
        <!-- Loading spinner styling -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            width="4"
          ></v-progress-circular>
        </div>

        <!-- Error message styling -->
        <div v-else-if="error" class="text-center px-4">
          <v-alert type="error" density="compact" class="rounded-lg">
            <span class="text-body-1">{{ error }}</span>
          </v-alert>
        </div>

        <div v-else>
          <v-row class="ma-0">
            <!-- Left Column - Enhanced profile section -->
            <v-col cols="12" md="8" class="pr-md-6">
              <v-card class="profile-card pa-6 mb-6" elevation="0">
                <v-row justify="center" class="ma-0">
                  <v-col cols="12" class="text-center pa-0">
                    <v-avatar size="128" class="elevation-2">
                      <v-img
                        src="../../../../../public/images/profile.jpg"
                        alt="Employee Avatar"
                      ></v-img>
                    </v-avatar>
                  </v-col>
                  <v-col cols="12" class="pt-4">
                    <h2 class="text-h4 font-weight-medium text-grey-darken-3">{{ employeeName }}</h2>
                    <div class="d-flex justify-center flex-wrap gap-2 mt-2">
                      <v-chip color="primary" variant="outlined" prepend-icon="mdi-identifier">
                        {{ employeeId }}
                      </v-chip>
                      <v-chip color="secondary" variant="outlined" prepend-icon="mdi-account-group">
                        {{ employeeDepartment }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>

                <!-- Salary structure section with new layout -->
                <v-row class="ma-0 mt-6">
                  <v-col cols="12" md="6" class="py-0">
                    <v-card variant="outlined" class="pa-4 rounded-lg">
                      <div class="d-flex align-center gap-2 mb-2">
                        <v-icon color="primary" size="24">mdi-currency-inr</v-icon>
                        <span class="text-subtitle-1 text-grey-darken-2">CTC</span>
                      </div>
                      <v-text-field
                        v-model="ctc"
                        variant="plain"
                        density="comfortable"
                        hide-details
                        prefix="₹"
                        class="text-h5 font-weight-bold text-primary"
                        @input="updateBasicSalary"
                      ></v-text-field>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6" class="py-0">
                    <v-card variant="outlined" class="pa-4 rounded-lg">
                      <div class="d-flex align-center gap-2 mb-2">
                        <v-icon color="primary" size="24">mdi-percent</v-icon>
                        <span class="text-subtitle-1 text-grey-darken-2">Basic Pay %</span>
                      </div>
                      <v-text-field
                        v-model="basicPayPercentage"
                        variant="plain"
                        density="comfortable"
                        hide-details
                        suffix="%"
                        type="number"
                        disabled
                        class="text-h5 font-weight-bold text-primary"
                      ></v-text-field>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <!-- Right Column - Scrollable Salary Components -->
            <v-col cols="12" md="4" class="salary-details-container">
              <div class="salary-components">
                <!-- Earnings Section -->
                <div v-if="earnings.length" class="section-container earnings">
                <div class="section-header">
                  <v-icon color="success" class="mr-2">mdi-wallet</v-icon>
                  <h3 class="section-title">Earnings</h3>
                </div>
                  <div class="component-grid">
                    <div class="grid-header">
                      <div>Heads</div>
                      <div>Calculation</div>
                      <div>Amount</div>
                    </div>
                    <div class="grid-row">
                      <div class="head-label">Basic Pay</div>
                      <v-text-field
                        v-model="basicPayPercentage"
                        variant="outlined"
                        density="compact"
                        hide-details
                        suffix="%"
                        type="number"
                        disabled
                      ></v-text-field>
                      <v-text-field
                        v-model="basicSalary"
                        variant="outlined"
                        density="compact"
                        hide-details
                        prefix="₹"
                        type="number"
                        disabled
                      ></v-text-field>
                    </div>
                    <template v-for="(item, index) in earnings" :key="index">
                      <div class="grid-row">
                        <div class="head-label">{{ item.name }}</div>
                        <v-text-field
                          v-model="item.calculationValue"
                          variant="outlined"
                          density="compact"
                          hide-details
                          :suffix="
                            item.calculation === 'Percentage' ? '%' : '₹'
                          "
                          type="number"
                          disabled
                        ></v-text-field>
                        <v-text-field
                          v-model="item.amount"
                          variant="outlined"
                          density="compact"
                          hide-details
                          prefix="₹"
                          type="number"
                          disabled
                        ></v-text-field>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Employer Contributions Section -->
                <div v-if="employerContributions.length" class="section-container contributions">
                <div class="section-header">
                  <v-icon color="info" class="mr-2">mdi-handshake</v-icon>
                  <h3 class="section-title">Employer Contributions</h3>
                </div>
                  <div class="component-grid">
                    <div class="grid-header">
                      <div>Type</div>
                      <div>Calculation</div>
                      <div>Amount</div>
                    </div>
                    <template
                      v-for="(item, index) in employerContributions"
                      :key="index"
                    >
                      <div class="grid-row">
                        <div class="head-label">{{ item.name }}</div>
                        <v-select
                          v-model="selectedCalculation"
                          :items="item.calculationOptions"
                          variant="outlined"
                          density="compact"
                          :disabled="true"
                          hide-details
                        ></v-select>
                        <v-text-field
                          v-model="item.amount"
                          variant="outlined"
                          density="compact"
                          hide-details
                          prefix="₹"
                          type="number"
                          disabled
                        ></v-text-field>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Employee Contributions Section -->
                <div v-if="employeeContributions.length" class="section-container contributions">
                <div class="section-header">
                  <v-icon color="info" class="mr-2">mdi-handshake</v-icon>
                  <h3 class="section-title">Employee Contributions</h3>
                </div>
                  <div class="component-grid">
                    <div class="grid-header">
                      <div>Type</div>
                      <div>Calculation</div>
                      <div>Amount</div>
                    </div>
                    <template
                      v-for="(item, index) in employeeContributions"
                      :key="index"
                    >
                      <div class="grid-row">
                        <div class="head-label">{{ item.name }}</div>
                        <v-select
                          v-model="item.calculation"
                          :items="item.calculationOptions"
                          variant="outlined"
                          density="compact"
                          disabled
                          hide-details
                        ></v-select>
                        <v-text-field
                          v-model="item.amount"
                          variant="outlined"
                          density="compact"
                          hide-details
                          prefix="₹"
                          type="number"
                          disabled
                        ></v-text-field>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Deductions Section -->
                <div v-if="deductions.length" class="section-container deductions">
                < class="section-header">
                  <v-icon color="error" class="mr-2">mdi-cash-remove</v-icon>
                  <h3 class="section-title">Deductions</h3>
                </div>
                  <div class="component-grid">
                    <div class="grid-header">
                      <div>Heads</div>
                      <div>Calculation</div>
                      <div>Amount</div>
                    </div>
                    <template v-for="(item, index) in deductions" :key="index">
                      <div class="grid-row">
                        <div class="head-label">{{ item.name }}</div>
                        <v-text-field
                          v-model="item.calculationValue"
                          variant="outlined"
                          density="compact"
                          disabled
                          hide-details
                          :suffix="
                            item.calculation === 'Percentage' ? '%' : '₹'
                          "
                          type="number"
                          @input="updateDeductionAmount(item)"
                        ></v-text-field>
                        <v-text-field
                          v-model="item.amount"
                          variant="outlined"
                          density="compact"
                          hide-details
                          prefix="₹"
                          type="number"
                          disabled
                        ></v-text-field>
                      </div>
                    </template>
                  </div>
                  </
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { authService } from "@/services/authService";

export default {
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    employeeData: {
      type: [Object, Number],
      default: false,
    },
  },
  data() {
    return {
      employeeName: "John Doe",
      employeeId: "EMP001",
      employeeDepartment: "IT Department",
      token: authService.getToken(),
      employee: null,
      salary: null,
      salaryConfig: null,
      employeeCategory: "",
      basicSalary: 0,
      basicPayPercentage: 0,
      ctc: 0,
      earnings: [],
      employerContributions: [],
      employeeContributions: [],
      deductions: [],
      isLoading: false,
      error: null,
      isSaving: false,
      stateName: "",
    };
  },
  watch: {
    ctc: {
      handler(newValue) {
        this.updateBasicSalary();
      },
      immediate: true,
    },
  },
  computed: {
    basicPay() {
      return this.basicSalary || 0; 
    },
  },

  methods: {
    calculatePercentageAmount(base, percentage) {
      return percentage ? ((base * percentage) / 100).toFixed(2) : 0;
    },

    updateEmployerContributions() {
      this.employerContributions = this.employerContributions.map(
        (contribution) => {
          let amount = 0;
          const selectedOption = contribution.calculation;

          // Check if the calculation is based on percentage
          if (selectedOption && selectedOption.includes("%")) {
            // Extract percentage value from the option string
            const percentageMatch = selectedOption.match(/(\d+)%/);
            if (percentageMatch) {
              const percentage = parseFloat(percentageMatch[1]);

              // Calculate based on basic pay for PF and other basic-pay based contributions
              if (contribution.name.toLowerCase().includes("pf")) {
                amount = this.calculatePercentageAmount(
                  this.basicSalary,
                  percentage
                );
              }
              // Calculate ESI based on gross salary (basic + earnings)
              else if (contribution.name.toLowerCase().includes("esi")) {
                const grossSalary = this.calculateGrossSalary();
                amount = this.calculatePercentageAmount(
                  grossSalary,
                  percentage
                );
              }
              // For other percentage-based calculations, use CTC
              else {
                amount = this.calculatePercentageAmount(this.ctc, percentage);
              }
            }
          }
          // Handle fixed amount calculations
          else if (selectedOption && selectedOption.includes("₹")) {
            const fixedMatch = selectedOption.match(/₹(\d+)/);
            if (fixedMatch) {
              amount = parseFloat(fixedMatch[1]);
            }
          }

          return {
            ...contribution,
            amount: parseFloat(amount).toFixed(2),
          };
        }
      );
    },
    updateEmployeeContributions() {
      this.employeeContributions = this.employeeContributions.map(
        (contribution) => {
          let amount = 0;
          // Use the original selectedOption format from the data
          const selectedOption = contribution.calculation; // This currently holds the transformed value
          const base = this.calculateContributionBase(
            this.employee?.salaryConfig?.employeeDeductions[contribution.name]
              ?.Calculations
          );

          // Match the same condition format as in transformEmployeeContributions
          if (selectedOption === "No Value") {
            amount = 0;
          } else if (selectedOption.includes("Variable")) {
            const percentage = parseFloat(selectedOption.match(/(\d+)%/)[1]);
            amount = ((base * percentage) / 100).toFixed(2);
          } else if (selectedOption.includes("Fixed")) {
            const fixedMatch = selectedOption.match(/₹(\d+)/);
            amount = fixedMatch ? parseFloat(fixedMatch[1]) : 0;
          }

          return {
            ...contribution,
            amount: parseFloat(amount).toFixed(2),
          };
        }
      );
    },

    calculateGrossSalary() {
      // Calculate total earnings including basic salary
      const totalEarnings = this.earnings.reduce((sum, earning) => {
        return sum + parseFloat(earning.amount || 0);
      }, parseFloat(this.basicSalary));

      return totalEarnings;
    },

    updateBasicSalary() {
      // Update basic salary
      this.basicSalary =
        ((this.ctc * this.basicPayPercentage) / 100).toFixed(2) || 0;

      // Update all calculations in sequence
      this.updateEarnings();
      this.updateEmployerContributions();
      this.updateEmployeeContributions();
    },
    calculateContributionBase(calculations) {
      if (!calculations || !Array.isArray(calculations)) {
        return 0;
      }

      return calculations.reduce((base, componentName) => {
        if (componentName.toLowerCase() === "basic pay") {
          return base + (parseFloat(this.basicSalary) || 0);
        }

        // Find the earning component by name (case insensitive)
        const earningComponent = this.earnings.find(
          (e) => e.name.toLowerCase() === componentName.toLowerCase()
        );

        if (earningComponent) {
          return base + (parseFloat(earningComponent.amount) || 0);
        }

        return base;
      }, 0);
    },
    updateEarningAmount(item) {
      if (item.calculation === "Percentage") {
        item.amount = this.calculatePercentageAmount(
          this.ctc,
          item.calculationValue
        );
      } else {
        item.amount = parseFloat(item.calculationValue) || 0;
      }
      console.log(`${item.name}: ${item.amount}`);
    },
    updateDeductionAmount(item) {
      if (item.calculation === "Percentage") {
        item.amount = this.calculatePercentageAmount(
          this.ctc,
          item.calculationValue
        );
      } else {
        item.amount = parseFloat(item.calculationValue) || 0;
      }
    },

    updateEarnings() {
      this.earnings.forEach((item) => {
        this.updateEarningAmount(item);
      });
    },
    transformEmployerContributions(contributions, earnings) {
      const nameMapping = {
        EmployerPF: "Employer PF",
        EmployerESI: "Employer ESI",
      };

      // Ensure that contributions and earnings are valid before applying map()
      if (!contributions || !earnings) return []; // Return an empty array if data is missing

      const transformed = Object.entries(contributions || {}).map(
        ([name, details]) => {
          const displayName = nameMapping[name] || name;
          const earningNames = earnings.map((earning) => earning.name);

          const calculationOptions = [
            details.NoValue ? "No Value" : 0,
            `${details.Percentage || 0}% Variable`,
            `₹${details.Amount || 0} Fixed`,
          ];

          const allOptions = [...earningNames, ...calculationOptions];

          return {
            name: displayName,
            calculationOptions: allOptions,
          };
        }
      );

      return transformed;
    },

    // transformEmployerContributions(contributions) {
    //   const transformed = Object.entries(contributions || {}).map(([name, details]) => {
    //     const selectedOption = details.selectedOption;
    //     let calculationType, amount = 0;

    //     if (selectedOption === "0") {
    //       calculationType = "No Value";
    //     } else if (details.Percentage) {
    //       calculationType = `${details.Percentage}% Variable`;
    //       // Initial calculation based on basic pay or gross salary
    //       if (name.toLowerCase().includes('pf')) {
    //         amount = this.calculatePercentageAmount(this.basicSalary, details.Percentage);
    //       } else if (name.toLowerCase().includes('esi')) {
    //         const grossSalary = this.calculateGrossSalary();
    //         amount = this.calculatePercentageAmount(grossSalary, details.Percentage);
    //       } else {
    //         amount = this.calculatePercentageAmount(this.ctc, details.Percentage);
    //       }
    //     } else {
    //       calculationType = `₹${details.Amount} Fixed`;
    //       amount = details.Amount || 0;
    //     }

    //     return {
    //       name,
    //       calculation: details.selectedOption === "0"
    //     ? "No Value"
    //     : details.Amount
    //       ? `₹${details.Amount}`
    //       : `${details.Percentage}%`,
    //       calculationOptions: [
    //         "None",
    //         `${details.Percentage}% Variable`,
    //         `₹${details.Amount} Fixed`
    //       ],
    //       amount: parseFloat(amount).toFixed(2)
    //     };
    //   });

    //   return transformed;
    // },

    transformEmployeeContributions(contributions) {
      const transformed = Object.entries(contributions || {}).map(
        ([name, details]) => {
          let amount = 0;
          const base = this.calculateContributionBase(details.Calculations);

          // First check selected option to determine calculation type
          if (details.selectedOption === "0") {
            amount = 0;
          } else if (
            details.selectedOption.includes("%") &&
            details.Percentage
          ) {
            // Only calculate percentage if percentage option is selected
            amount = ((base * details.Percentage) / 100).toFixed(2);
          } else if (details.selectedOption.includes("₹") && details.Amount) {
            // Only use fixed amount if amount option is selected
            amount = details.Amount;
          }

          return {
            name,
            calculation:
              details.selectedOption === "0"
                ? "No Value"
                : details.selectedOption, // Use the actual selected option
            calculationOptions: [
              `${details.Percentage}% Variable`,
              `₹${details.Amount} Fixed`,
            ],
            amount: amount,
            base: base,
          };
        }
      );

      return transformed;
    },
    transformEarnings(earnings) {
      return (earnings || []).map((earning) => ({
        name: earning.name,
        calculation: earning.calculation,
        calculationValue:
          earning.calculation === "Percentage"
            ? earning.percentage
            : earning.amount,
        amount:
          earning.calculation === "Percentage"
            ? ((this.ctc * earning.percentage) / 100).toFixed(2)
            : earning.amount,
      }));
    },
    transformDeductions(deductions) {
      return (deductions || []).map((deduction) => ({
        name: deduction.name,
        calculation: deduction.calculation,
        calculationValue:
          deduction.calculation === "Percentage"
            ? deduction.percentage
            : deduction.amount,
        // amount: this.calculatePercentageAmount(this.ctc, deduction.percentage),
      }));
    },
    async fetchEmployeeData() {
      if (!this.employeeData) return;

      this.isLoading = true;
      this.error = null;

      try {
        const fields = [
          "employee.assignedUser.avatar.title",
          "employee.assignedUser.avatar.id",
          "employee.assignedUser.avatar.type",
          "employee.assignedUser.first_name",
          "employee.assignedUser.role.name",
          "basicSalary",
          "basicPay",
          "totalEarnings",
          "totalDeductions",
          "esi",
          "pf",
          "bonus",
          "professionalTax",
          "ctc",
          "employerpf",
          "employeresi",
          "earnings",
          "employeeDeduction",
          "employersContribution",
          "deduction",
          "employee.salaryConfig.basicPay",
          "employee.salaryConfig.earnings",
          "employee.salaryConfig.deductions",
          "employee.salaryConfig.employerContribution",
          "employee.salaryConfig.allowances",
          "employee.salaryConfig.deduction",
          "employee.salaryConfig.professionalTax",
          "employee.salaryConfig.LWF",
          "employee.salaryConfig.employersContributions",
          "employee.salaryConfig.employeeDeductions",
          "employee.salaryConfig.configName",
          "employee.salaryConfig.adminCharges",
          "employee.salaryConfig.payrollBranch",
          "employee.salaryConfig.stateTaxes",
          "employee.salaryConfig.deductions",
          "id",
          "employee.salaryConfig.professionalTax.id",
          "employee.salaryConfig.professionalTax.state",
          "employee.salaryConfig.professionalTax.stateTaxRules",
          "employee.salaryConfig.LWF.id",
          "employee.salaryConfig.LWF.state",
          "employee.salaryConfig.LWF.stateTaxRules",
        ];

        const queryString = fields
          .map((field) => `fields[]=${field}`)
          .join("&");

        const apiUrl = `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${
          this.employeeData
        }?${queryString}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }

        const data = await response.json();

        if (
          data.data &&
          data.data.employee &&
          data.data.employee.salaryConfig
        ) {
          this.employee = data.data.employee;
          const config = data.data.employee.salaryConfig;

          this.employeeCategory = config.configName || "Default";
          this.ctc = config.ctc || 0;
          this.basicPayPercentage = config.basicPay || 0;
          this.basicSalary =
            ((this.ctc * this.basicPayPercentage) / 100).toFixed(2) || 0;

          this.earnings = this.transformEarnings(config.earnings);
          this.deductions = this.transformDeductions(config.deductions);
          this.employerContributions = this.transformEmployerContributions(
            config.employersContributions
          );
          this.employeeContributions = this.transformEmployeeContributions(
            config.employeeDeductions
          );

          if (config.professionalTax && config.professionalTax.state) {
            this.stateName = config.professionalTax.state;
          }
        }
      } catch (err) {
        console.error("Error fetching employee data:", err);
        this.error = "Failed to load employee data. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },
    async saveChanges() {
      this.isSaving = true;
      this.error = null;

      try {
        const saveData = {
          employeeCategory: this.employeeCategory,
          ctc: this.ctc,
          basicSalary: this.basicSalary,
          basicSalaryPercentage: this.basicPayPercentage,
          earnings: [
            {
              name: "Basic Salary",
              calculation: "Percentage",
              amount: null,
              percentage: this.basicPayPercentage,
            },
            ...this.earnings.map((item) => ({
              name: item.name,
              calculation: item.calculation,
              amount: item.calculation === "Percentage" ? null : item.amount,
              percentage:
                item.calculation === "Percentage" ? item.calculationValue : 0,
            })),
          ],
          employerContributions: this.employerContributions,
          employeeContributions: this.employeeContributions,
          deductions: this.deductions.map((item) => ({
            name: item.name,
            calculation: item.calculation,
            amount: item.calculation === "Percentage" ? null : item.amount,
            percentage:
              item.calculation === "Percentage" ? item.calculationValue : 0,
          })),
          stateTaxes: {
            state: this.stateName,
            professionalTax:
              this.employee?.salaryConfig?.professionalTax?.amount,
            laborWelfareFund: this.employee?.salaryConfig?.LWF?.amount,
          },
        };

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/items/SalaryBreakdown/${
            this.employeeData || ""
          }`,
          {
            method: this.isEditing ? "PATCH" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify(saveData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save employee data");
        }

        const savedData = await response.json();
        // Emit save-success event
        this.$emit("save-success", savedData);
      } catch (err) {
        console.error("Error saving employee data:", err);
        this.error = "Failed to save employee data. Please try again.";
      } finally {
        this.isSaving = false;
      }
    },
  },
  mounted() {
    this.fetchEmployeeData();
  },
};
</script>

<style scoped>
/* Updated CSS with modern styling */
.employee-form-container {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  background: white;
  padding: 12px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.profile-card {
  background: white !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.section-container {
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 2px solid;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.earnings .section-header { border-color: #4caf50; }
.contributions .section-header { border-color: #2196f3; }
.deductions .section-header { border-color: #f44336; }

.component-grid {
  padding: 16px;
}

.grid-header {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr;
  gap: 12px;
  padding: 8px 0;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.grid-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.head-label {
  font-weight: 500;
  color: #334155;
}

:deep(.v-field) {
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

:deep(.v-field--disabled) {
  background: #f8fafc !important;
}

.salary-details-container {
  height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 8px;
}

/* Custom scrollbar */
.salary-details-container::-webkit-scrollbar {
  width: 6px;
}

.salary-details-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.salary-details-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.text-field-center :deep(input) {
  text-align: center;
  font-weight: 500;
  color: #1e293b;
}
.first-name-container, .config-name-container {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f0f0f0;
}

.first-name-container {
  margin-left: 16px;
}

</style>

