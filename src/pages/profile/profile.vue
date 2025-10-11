<template>
  <v-app>
    <v-main class="profile-page">
      <v-container fluid class="pa-0 fill-height">
        <div class="profile-content">
          <!-- Left Section -->
          <div class="profile-sidebar">
            <div class="profile-image-section">
              <div class="profile-image-container">
                <v-avatar size="200" class="profile-avatar">
                  <v-img
                    :src="profileImage"
                    :alt="profileData.avatar?.title || 'Profile Image'"
                    @error="handleImageError"
                  >
                    <template v-slot:placeholder>
                      <v-icon size="200" color="grey lighten-1"
                        >mdi-account-circle</v-icon
                      >
                    </template>
                  </v-img>
                </v-avatar>
                <!-- <v-btn
                  color="primary"
                  fab
                  small
                  class="camera-btn"
                  @click="triggerImageUpload"
                >
                  <v-icon>mdi-camera</v-icon>
                </v-btn> -->
              </div>
              <h1 class="profile-name">{{ fullName }}</h1>
              <div class="profile-role">{{ profileData.roleName }}</div>
              <div class="profile-tenant">{{ profileData.tenantName }}</div>
            </div>

            <div class="quick-info">
              <div class="info-item">
                <v-icon color="primary">mdi-domain</v-icon>
                <div class="info-details">
                  <span class="info-label">Department</span>
                  <span class="info-value">{{
                    profileData.departmentName
                  }}</span>
                </div>
              </div>
              <div class="info-item">
                <v-icon color="primary">mdi-office-building</v-icon>
                <div class="info-details">
                  <span class="info-label">Branch</span>
                  <span class="info-value">{{ profileData.branchName }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Section -->
          <div class="profile-main">
            <v-tabs
              v-model="activeTab"
              background-color="transparent"
              color="primary"
              class="profile-tabs"
            >
              <v-tab class="custom-tab">Profile Details</v-tab>
              <!-- <v-tab class="custom-tab">Additional Info</v-tab> -->
            </v-tabs>

            <v-tabs-items v-model="activeTab" class="profile-tabs-content">
              <v-tab-item>
                <div class="details-grid">
                  <div
                    v-for="field in profileFields"
                    :key="field.name"
                    class="detail-item"
                  >
                    <div class="detail-label">{{ field.label }}</div>
                    <div class="detail-value">
                      {{ profileData[field.name] || "Not Set" }}
                    </div>
                  </div>
                </div>
              </v-tab-item>

              <v-tab-item>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Department</div>
                    <div class="detail-value with-icon">
                      <v-icon color="primary" small>mdi-domain</v-icon>
                      {{ profileData.departmentName }}
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Access Level</div>
                    <div class="detail-value with-icon">
                      <v-icon color="primary" small>mdi-shield-account</v-icon>
                      {{ profileData.accessLevelName }}
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Branch</div>
                    <div class="detail-value with-icon">
                      <v-icon color="primary" small>mdi-office-building</v-icon>
                      {{ profileData.branchName }}
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Location</div>
                    <div class="detail-value with-icon">
                      <v-icon color="primary" small>mdi-map-marker</v-icon>
                      {{ profileData.location }}
                    </div>
                  </div>
                </div>
              </v-tab-item>
            </v-tabs-items>
          </div>
        </div>
      </v-container>
    </v-main>
    <input
      type="file"
      ref="imageInput"
      @change="handleImageUpload"
      accept="image/*"
      style="display: none"
    />
  </v-app>
</template>

<script>
import { authService } from "@/services/authService";

export default {
  name: "ProfilePage",
  data() {
    return {
      profileData: {},
      profileFields: [
        { name: "first_name", label: "First Name", editable: true },
        { name: "last_name", label: "Last Name", editable: true },
        { name: "phone", label: "Phone Number", editable: true },
        { name: "email", label: "Email", editable: true },
        { name: "roleName", label: "Role", editable: false },
        { name: "tenantName", label: "Tenant Name", editable: false },
      ],
      tenantId: null,
      profileImage: null,
      isLoadingImage: false,
    };
  },

  computed: {
    fullName() {
      return `${this.profileData.first_name || ""} ${
        this.profileData.last_name || ""
      }`.trim();
    },
  },

  mounted() {
    this.fetchLoginUserDetails();
  },

  methods: {
    async fetchLoginUserDetails() {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          throw new Error("User not authenticated");
        }
        const phone = authService.getPhone();
        if (!phone) {
          throw new Error("Phone number not found");
        }
        const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
        // Use protectedApi from authService
        const userResponse = await authService.protectedApi.get("/users", {
          params: {
            "filter[_and][0][phone][_contains]": formattedPhone,
            "fields[]": ["id", "tenant", "role.name", "phone"],
          },
        });
        if (userResponse.data.data?.length) {
          const userData = userResponse.data.data[0];
          this.tenantId = userData.tenant;
          await this.fetchProfileData(userData.id);
        } else {
          throw new Error("User not found");
        }
      } catch (error) {
        console.error("Error fetching login user details:", error);
        if (error.response?.status === 401) {
          authService.logout(); // Use authService logout method
        }
      }
    },
    async fetchProfileData(userId) {
      try {
        const phone = authService.getPhone();
        const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
        // Use protectedApi from authService
        const response = await authService.protectedApi.get(
          "/items/personalModule",
          {
            params: {
              fields: [
                "id",
                "assignedUser.first_name",
                "assignedUser.last_name",
                "assignedUser.phone",
                "assignedUser.email",
                "assignedUser.role.name",
                "assignedUser.tenant.tenantName",
                "assignedDepartment.department_id.departmentName",
                "assignedAccessLevels.accesslevels_id.accessLevelName",
                "assignedBranch.branch_id.branchName",
                "assignedUser.location",
                "assignedUser.avatar.id",
                "assignedUser.avatar.type",
                "assignedUser.avatar.title",
              ],
              filter: {
                _and: [
                  { assignedUser: { phone: { _contains: formattedPhone } } },
                ],
              },
            },
          },
        );
        if (response.data.data?.length) {
          const userData = response.data.data[0];
          this.profileData = {
            first_name: userData.assignedUser.first_name,
            last_name: userData.assignedUser.last_name,
            phone: userData.assignedUser.phone,
            email: userData.assignedUser.email,
            roleName: userData.assignedUser.role.name,
            tenantName: userData.assignedUser.tenant.tenantName,
            departmentName:
              userData.assignedDepartment?.[0]?.department_id?.departmentName ||
              "Not Set",
            accessLevelName:
              userData.assignedAccessLevels?.[0]?.accesslevels_id
                ?.accessLevelName || "Not Set",
            branchName:
              userData.assignedBranch?.[0]?.branch_id?.branchName || "Not Set",
            location: userData.assignedUser.location || "Not Set",
            avatar: userData.assignedUser.avatar || null,
          };
          // Set profile image if avatar exists
          if (this.profileData.avatar?.id) {
            await this.fetchAuthorizedImage(
              `${import.meta.env.VITE_API_URL}/assets/${
                this.profileData.avatar.id
              }`,
            );
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        if (error.response?.status === 401) {
          authService.logout(); // Use authService logout method
        }
      }
    },
    async fetchAuthorizedImage(imageUrl) {
      this.isLoadingImage = true;
      try {
        // Use the stored user token for image fetch
        const token = authService.getToken();
        const response = await fetch(imageUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load image");
        const blob = await response.blob();
        this.profileImage = URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error loading profile image:", error);
        this.profileImage = null;
      } finally {
        this.isLoadingImage = false;
      }
    },
    handleImageError() {
      this.profileImage = null;
      console.warn("Failed to load profile image");
    },
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          // Use protectedApi for file upload
          const response = await authService.protectedApi.post(
            "/files",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );
          if (response.data.id) {
            // Update profile image
            const reader = new FileReader();
            reader.onload = (e) => {
              this.profileImage = e.target.result;
            };
            reader.readAsDataURL(file);
            // Update user avatar in backend
            await authService.protectedApi.patch(
              `/users/${this.profileData.id}`,
              {
                avatar: response.data.id,
              },
            );
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          if (error.response?.status === 401) {
            authService.logout();
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.profile-page {
  background-color: #ffffff;
  min-height: 100vh;
}

.profile-content {
  display: flex;
  min-height: 100vh;
}

.profile-sidebar {
  /* width: 320px; */
  background-color: #f8fafc;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #e2e8f0;
}

.profile-image-section {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-image-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.camera-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 2;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.profile-role {
  font-size: 1.1rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.profile-tenant {
  font-size: 0.9rem;
  color: #718096;
}

.quick-info {
  width: 100%;
  margin-top: 2rem;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 1rem;
}

.info-details {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
}
.custom-tab {
  font-weight: 550;
  font-family: Lato, sans-serif, Arial;
}

.profile-main {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
  width: 1100px;
}

.profile-tabs {
  margin-bottom: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-item {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
}

.detail-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
}

.detail-value.with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 960px) {
  .profile-content {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .profile-main {
    padding: 1rem;
  }
}

/* Updated media query for mobile view */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr; /* Single column on mobile */
  }
}
</style>
