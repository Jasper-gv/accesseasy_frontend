<template>
  <div class="settings-container">
    <BaseButton
      variant="primary"
      size="md"
      :leftIcon="Plus"
      class="add-button"
      @click="openModal('add')"
      :text="'Add New Setting'"
    />
    <!-- Box View for Settings -->
    <div class="box-container">
      <div v-for="item in transportSettings" :key="item.id" class="setting-box">
        <div class="setting-content">
          <h3>{{ item.transportName }}</h3>
          <p>Rate per /km: {{ item.ratePerKm }} /km</p>
          <div class="setting-actions">
            <button class="edit-button" @click="openModal('edit', item)">
              Edit
            </button>
            <button class="delete-button" @click="deleteSetting(item.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Adding/Editing Setting -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>
          {{
            modalMode === "add"
              ? "Add Transport Setting"
              : "Edit Transport Setting"
          }}
        </h3>
        <form
          @submit.prevent="modalMode === 'add' ? addSetting() : updateSetting()"
        >
          <div class="form-group">
            <label for="transportType">Transport Type</label>
            <select
              v-model="currentSetting.transportName"
              id="transportType"
              required
              class="form-select"
            >
              <option value="" disabled>Select a transport type</option>
              <option value="Bus">Bus</option>
              <option value="Bike">Bike</option>
              <option value="Car">Car</option>

              <option value="Others">Others</option>
            </select>
          </div>
          <div class="form-group">
            <label for="rate">Rate per KM</label>
            <input
              v-model.number="currentSetting.ratePerKm"
              id="rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 10.50"
              required
            />
          </div>
          <div class="modal-buttons">
            <button type="submit" class="submit-button">
              {{ modalMode === "add" ? "Add" : "Update" }}
            </button>
            <button type="button" class="cancel-button" @click="closeModal">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from "@/components/common/buttons/BaseButton.vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import axios from "axios";
import { Plus } from "lucide-vue-next";

export default {
  name: "TransportSettings",
  components: {
    BaseButton,
  },
  data() {
    return {
      transportSettings: [],
      showModal: false,
      modalMode: "add", // 'add' or 'edit'
      currentSetting: {
        id: null,
        transportName: "",
        ratePerKm: null,
        status: "draft",
        tenant: null,
      },
      token: null,
      tenantId: null,
      apiUrl: `${import.meta.env.VITE_API_URL}/items/transport`,
    };
  },
  async created() {
    try {
      this.token = await authService.getToken();
      this.tenantId = await currentUserTenant.getTenantId();
      this.currentSetting.tenant = this.tenantId;
      await this.fetchSettings();
    } catch (error) {
      console.error("Error initializing component:", error);
    }
  },
  methods: {
    async fetchSettings() {
      try {
        const response = await axios.get(
          `${this.apiUrl}?filter[_and][0][_and][0][tenant][tenantId][_eq]=${this.tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );
        this.transportSettings = response.data.data;
      } catch (error) {
        console.error("Error fetching transport settings:", error);
      }
    },
    openModal(mode, item = null) {
      this.modalMode = mode;
      if (mode === "edit" && item) {
        this.currentSetting = {
          id: item.id,
          transportName: item.transportName,
          ratePerKm: item.ratePerKm,
          status: item.status,
          tenant: this.tenantId,
        };
      } else {
        this.currentSetting = {
          id: null,
          transportName: "",
          ratePerKm: null,
          status: "draft",
          tenant: this.tenantId,
        };
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.currentSetting = {
        id: null,
        transportName: "",
        ratePerKm: null,
        status: "draft",
        tenant: this.tenantId,
      };
    },
    async addSetting() {
      if (
        this.currentSetting.transportName &&
        this.currentSetting.ratePerKm !== null
      ) {
        try {
          const response = await axios.post(
            this.apiUrl,
            {
              transportName: this.currentSetting.transportName,
              ratePerKm: this.currentSetting.ratePerKm,
              status: this.currentSetting.status,
              tenant: this.currentSetting.tenant,
            },
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            },
          );
          this.transportSettings.push(response.data.data);
          this.closeModal();
        } catch (error) {
          console.error("Error adding transport setting:", error);
        }
      }
    },
    async updateSetting() {
      if (
        this.currentSetting.transportName &&
        this.currentSetting.ratePerKm !== null
      ) {
        try {
          const response = await axios.patch(
            `${this.apiUrl}/${this.currentSetting.id}`,
            {
              transportName: this.currentSetting.transportName,
              ratePerKm: this.currentSetting.ratePerKm,
              status: this.currentSetting.status,
              tenant: this.currentSetting.tenant,
            },
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            },
          );
          const updatedIndex = this.transportSettings.findIndex(
            (item) => item.id === this.currentSetting.id,
          );
          if (updatedIndex !== -1) {
            this.transportSettings[updatedIndex] = response.data.data;
          }
          this.closeModal();
        } catch (error) {
          console.error("Error updating transport setting:", error);
        }
      }
    },
    async deleteSetting(id) {
      try {
        await axios.delete(`${this.apiUrl}/${id}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.transportSettings = this.transportSettings.filter(
          (item) => item.id !== id,
        );
      } catch (error) {
        console.error("Error deleting transport setting:", error);
      }
    },
  },
};
</script>

<style scoped>
.settings-container {
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  color: #333;
}

.add-button {
  color: white;

  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  display: block;
  margin-left: auto;
}

.add-button:hover {
  background-color: #218838;
}

/* Box View Styles */
.box-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.setting-box {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  width: 250px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.setting-box:hover {
  background-color: #f1f1f1;
}

.setting-content h3 {
  margin: 0 0 10px;
  font-size: 1.2em;
  color: #333;
}

.setting-content p {
  margin: 0 0 10px;
  color: #555;
}

.setting-actions {
  display: flex;
  gap: 10px;
}

.edit-button,
.delete-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="%23333" d="M2 4l4 4 4-4H2z"/></svg>')
    no-repeat right 8px center;
  background-size: 12px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.submit-button,
.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  background-color: #28a745;
  color: white;
}

.submit-button:hover {
  background-color: #218838;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}
</style>
