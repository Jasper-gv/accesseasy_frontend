<template>
  <div class="container">
    <div class="header">
      <!-- Client Information in Header -->
      <div class="header-client-info">
        <div class="header-title-container">
          <i class="fas fa-arrow-left back-icon" @click="goBack"></i>
          <h2 class="header-title">
            Add New {{ client.category === "contact" ? "Contact" : "Client" }}
          </h2>
        </div>
      </div>
      <div class="header-buttons">
        <BaseButton variant="danger" size="md" text="Cancel" @click="goBack" />
        <BaseButton
          type="submit"
          form="clientForm"
          variant="primary"
          size="md"
          text="Save"
          :loading="isSubmitting"
          @click="handleSubmit"
        />
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="main-layout" id="clientForm">
      <!-- Left Column: Client Info -->
      <div class="left-column">
        <!-- Client Information Box -->
        <div class="info-box">
          <h2 class="box-title">
            {{
              client.category === "contact"
                ? "Contact Information"
                : "Client Information"
            }}
          </h2>
          <div class="form-group">
            <label for="clientName"
              >{{
                client.category === "contact" ? "Contact Name" : "Client Name"
              }}
              *</label
            >
            <input
              v-model="client.orgName"
              id="clientName"
              type="text"
              class="input"
              :placeholder="
                client.category === 'contact'
                  ? 'Enter Contact name'
                  : 'Enter Client name'
              "
              required
            />
          </div>

          <div class="form-group">
            <label for="clientEmail">{{
              client.category === "contact" ? "Contact Email" : "Client Email"
            }}</label>
            <input
              v-model="client.email"
              id="clientEmail"
              type="email"
              class="input"
              :placeholder="
                client.category === 'contact'
                  ? 'Enter Contact email'
                  : 'Enter Client email'
              "
            />
          </div>

          <div class="form-group">
            <label for="contactNumber"
              >{{
                client.category === "contact"
                  ? "Contact Number"
                  : "Client Number"
              }}
              *</label
            >
            <input
              v-model="client.orgNumber"
              id="contactNumber"
              type="tel"
              class="input"
              :placeholder="
                client.category === 'contact'
                  ? 'Enter Contact number'
                  : 'Enter Client number'
              "
              maxlength="10"
              pattern="[0-9]{10}"
              title="Please enter exactly 10 digits"
              @input="validatePhoneNumber"
              required
            />
            <div v-if="phoneError" class="error-message">{{ phoneError }}</div>
          </div>

          <div class="form-group">
            <label for="category">Category *</label>
            <select
              v-model="client.category"
              id="category"
              class="input"
              required
            >
              <option value="clientorg">Client</option>
              <option value="contact">Contact</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Right Column: Address and Map -->
      <div class="right-column">
        <!-- Address Information Box -->
        <div class="info-box address-box">
          <h2 class="box-title">Address</h2>
          <div class="address-grid">
            <div class="form-group address-full">
              <input
                v-model="client.orgAddress"
                id="address"
                type="text"
                class="input"
                placeholder="Enter full address"
                required
                @input="updateMap"
              />
            </div>
          </div>
          <div class="form-group">
            <input
              v-model="client.googleSearch"
              id="googleSearch"
              type="text"
              class="input search-input"
              placeholder="Search Google"
              @input="searchLocation"
            />
          </div>
        </div>

        <!-- Map -->
        <div id="map" class="map"></div>
      </div>
    </form>
  </div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";
import { reactive, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { authService } from "@/services/authService";
import BaseButton from "@/components/common/buttons/BaseButton.vue";

export default {
  name: "AddClient",
  components: {
    BaseButton,
  },
  setup() {
    const router = useRouter();
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const tenantId = currentUserTenant.getTenantId();
    const token = authService.getToken();
    const client = reactive({
      orgName: "",
      email: "",
      orgNumber: "",
      orgAddress: "",
      googleSearch: "",
      latitude: "",
      longitude: "",
      category: "clientorg", // Default to clientorg
    });
    const isSubmitting = ref(false);
    const phoneError = ref("");
    let map;
    let geocoder;
    let marker;

    const initMap = async () => {
      const loader = new Loader({
        apiKey,
        version: "weekly",
      });
      const google = await loader.load();
      geocoder = new google.maps.Geocoder();
      map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });
    };

    const validatePhoneNumber = () => {
      // Remove any non-digit characters
      client.orgNumber = client.orgNumber.replace(/\D/g, "");

      // Validate length and format
      if (client.orgNumber.length > 10) {
        client.orgNumber = client.orgNumber.slice(0, 10);
      }

      if (client.orgNumber && client.orgNumber.length !== 10) {
        phoneError.value = "Phone number must be exactly 10 digits";
      } else {
        phoneError.value = "";
      }
    };

    const updateMap = () => {
      if (!client.orgAddress || !geocoder) return;
      geocoder.geocode({ address: client.orgAddress }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          map.setZoom(15);
          client.latitude = location.lat().toFixed(8);
          client.longitude = location.lng().toFixed(8);
          if (marker) marker.setMap(null);
          marker = new google.maps.Marker({
            map,
            position: location,
          });
        }
      });
    };

    const searchLocation = () => {
      if (!client.googleSearch || !geocoder) return;
      geocoder.geocode({ address: client.googleSearch }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          client.orgAddress = results[0].formatted_address;
          client.latitude = location.lat().toFixed(8);
          client.longitude = location.lng().toFixed(8);
          map.setCenter(location);
          map.setZoom(15);
          if (marker) marker.setMap(null);
          marker = new google.maps.Marker({
            map,
            position: location,
          });
        }
      });
    };

    const handleSubmit = async () => {
      // Validate phone number before submission
      validatePhoneNumber();

      if (phoneError.value) {
        alert("Please fix the phone number error before submitting.");
        return;
      }

      if (client.orgNumber.length !== 10) {
        alert("Phone number must be exactly 10 digits.");
        return;
      }

      isSubmitting.value = true;
      try {
        const response = await axios.post(
          "https://appv1.fieldseasy.com/directus/items/organization",
          {
            orgName: client.orgName,
            email: client.email,
            orgNumber: client.orgNumber,
            orgAddress: client.orgAddress,
            status: "draft",
            tenant: tenantId,
            orgType: client.category, // Maps to "clientorg" or "contact"
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        console.log(
          `${client.category === "contact" ? "Contact" : "Client"} added:`,
          response.data,
        );
        alert(
          `${client.category === "contact" ? "Contact" : "Client"} added successfully!`,
        );
        router.push("/organization/orgmainui");

        // Reset form
        Object.assign(client, {
          orgName: "",
          email: "",
          orgNumber: "",
          orgAddress: "",
          googleSearch: "",
          latitude: "",
          longitude: "",
          category: "clientorg",
        });
        phoneError.value = "";
        if (marker) marker.setMap(null);
        map.setCenter({ lat: 20.5937, lng: 78.9629 });
        map.setZoom(5);
      } catch (error) {
        console.error(
          `Error adding ${client.category === "contact" ? "contact" : "client"}:`,
          error,
        );
        alert(
          `Failed to add ${client.category === "contact" ? "contact" : "client"}. Please try again.`,
        );
      } finally {
        isSubmitting.value = false;
      }
    };

    const goBack = () => {
      router.push("/organization/orgmainui");
    };

    onMounted(initMap);

    return {
      client,
      updateMap,
      searchLocation,
      handleSubmit,
      isSubmitting,
      phoneError,
      validatePhoneNumber,
      goBack,
    };
  },
};
</script>

<style scoped>
.container {
  height: calc(105vh - 190px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e1e4e8;
}

.header-client-info {
  flex: 1;
}

.header-title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-icon {
  font-size: 18px;
  color: #007bff;
  cursor: pointer;
  transition: color 0.2s;
}

.back-icon:hover {
  color: #0056b3;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  flex: 1;
  overflow: visible;
  padding-bottom: 20px;
}

.main-layout::-webkit-scrollbar {
  width: 8px;
}

.main-layout::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-layout::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.main-layout::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-box {
  border-radius: 8px;
  padding: 20px;
}

.box-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #555;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.input:disabled {
  background: #f1f1f1;
  cursor: not-allowed;
}

.address-box {
  background: #f8f9fc;
}

.address-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.address-full {
  grid-column: 1 / -1;
  margin-bottom: 0;
}

.search-input {
  margin-top: 8px;
}

.map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  background: #f8f9fc;
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .map {
    height: 350px;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-end;
  }

  .header-buttons {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
    height: 100vh;
  }

  .header {
    margin-bottom: 15px;
  }

  .header-title {
    font-size: 18px;
  }

  .back-icon {
    font-size: 16px;
  }

  .info-box {
    padding: 15px;
  }

  .address-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .map {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px;
  }

  .main-layout {
    gap: 15px;
    padding-right: 5px;
  }

  .info-box {
    padding: 12px;
  }

  .box-title {
    font-size: 16px;
    margin-bottom: 15px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .input {
    padding: 8px 10px;
    font-size: 13px;
  }

  .header-title {
    font-size: 16px;
  }

  .header-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }

  .back-icon {
    font-size: 14px;
  }
}
</style>
