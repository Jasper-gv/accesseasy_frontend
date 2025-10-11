// src/utils/currentUserTenant.js
import { authService } from "@/services/authService";

class CurrentUserTenant {
  constructor() {
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null; // Added accountSettings property
    this.role = null;
    this.userId = null;
    this.isLoading = false;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      await this.fetchLoginUserDetails();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize user data:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchLoginUserDetails() {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error("User not authenticated");
      }

      const phone = authService.getPhone();
      if (!phone) {
        throw new Error("Phone number not found");
      }

      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      const userResponse = await authService.protectedApi.get("/users", {
        params: {
          filter: {
            _and: [{ phone: formattedPhone }, { userApp: "fieldeasy" }],
          },
          fields:
            "id,tenant.tenantId,tenant.tenantName,role.name,phone,tenant.plan,tenant.accountSettings",
        },
      });

      if (userResponse.data.data?.length) {
        const userData = userResponse.data.data[0];

        this.tenantId = userData.tenant?.tenantId || userData.tenant;
        this.tenantName = userData.tenant?.tenantName || null;

        // Handle plan data - it could be a JSON object or string
        this.tenantPlan = userData.tenant?.plan || null;
        if (typeof this.tenantPlan === "string") {
          try {
            this.tenantPlan = JSON.parse(this.tenantPlan);
          } catch (parseError) {
            console.warn("Failed to parse tenant plan JSON:", parseError);
            // Keep as string if parsing fails
          }
        }

        // Handle accountSettings data - it could be a JSON object or string
        this.accountSettings = userData.tenant?.accountSettings || null;
        if (typeof this.accountSettings === "string") {
          try {
            this.accountSettings = JSON.parse(this.accountSettings);
          } catch (parseError) {
            console.warn("Failed to parse account settings JSON:", parseError);
            // Keep as string if parsing fails
          }
        }

        this.role = userData.role.name;
        this.userId = userData.id;

        return userData;
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching login user details:", error);
      if (error.response?.status === 401) {
        this.clearUserData();
        authService.logout();
      }
      throw error;
    }
  }

  clearUserData() {
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null; // Clear accountSettings data
    this.role = null;
    this.userId = null;
    this.initialized = false;
    this.isLoading = false;
  }

  // Existing getters remain unchanged
  getTenantId() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantId;
  }

  getRole() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.role;
  }

  getUserId() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.userId;
  }

  getTenantName() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantName;
  }

  getTenantPlan() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.tenantPlan;
  }

  // New getter for accountSettings
  getAccountSettings() {
    if (!this.initialized && !this.isLoading) {
      this.initialize();
    }
    return this.accountSettings;
  }

  async refresh() {
    this.initialized = false;
    this.tenantId = null;
    this.tenantName = null;
    this.tenantPlan = null;
    this.accountSettings = null; // Reset accountSettings data
    this.role = null;
    this.userId = null;
    await this.fetchLoginUserDetails();
    this.initialized = true;
  }

  async getTenantIdAsync() {
    await this.initialize();
    return this.tenantId;
  }

  async getRoleAsync() {
    await this.initialize();
    return this.role;
  }

  async getUserIdAsync() {
    await this.initialize();
    return this.userId;
  }

  async getTenantNameAsync() {
    await this.initialize();
    return this.tenantName;
  }

  async getTenantPlanAsync() {
    await this.initialize();
    return this.tenantPlan;
  }

  // New async getter for accountSettings
  async getAccountSettingsAsync() {
    await this.initialize();
    return this.accountSettings;
  }

  // Helper methods to access specific plan properties
  getPlanProperty(propertyName) {
    const plan = this.getTenantPlan();
    return plan && typeof plan === "object" ? plan[propertyName] : null;
  }

  async getPlanPropertyAsync(propertyName) {
    const plan = await this.getTenantPlanAsync();
    return plan && typeof plan === "object" ? plan[propertyName] : null;
  }

  // Helper methods to access specific accountSettings properties (e.g., currency)
  getAccountSetting(propertyName) {
    const settings = this.getAccountSettings();
    return settings && typeof settings === "object"
      ? settings[propertyName]
      : null;
  }

  async getAccountSettingAsync(propertyName) {
    const settings = await this.getAccountSettingsAsync();
    return settings && typeof settings === "object"
      ? settings[propertyName]
      : null;
  }

  // Convenience method to get currency specifically
  getCurrency() {
    return this.getAccountSetting("currency");
  }

  async getCurrencyAsync() {
    return await this.getAccountSettingAsync("currency");
  }
}

export const currentUserTenant = new CurrentUserTenant();
