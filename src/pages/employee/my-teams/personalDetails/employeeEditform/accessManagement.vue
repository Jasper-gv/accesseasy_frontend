<template>
  <div class="access-management">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Main Content -->
    <div v-else-if="employeeData" class="content-container">
      <!-- Header -->
      <div class="header">
        <div class="title">
          <v-icon size="24" color="primary" class="mr-2">mdi-shield-key</v-icon>
          <h1>Access Management</h1>
        </div>
        <v-btn
          color="black"
          variant="elevated"
          @click="updateAccessCatagory"
          :disabled="!hasChanges"
          class="save-btn"
        >
          SAVE CHANGES
        </v-btn>
      </div>

      <!-- Warning Message -->
      <div v-if="!accessOn" class="warning-message">
        <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
        <span
          >To assign cards, please enable access or check the Access Level's
          access type.</span
        >
      </div>

      <!-- Main Content Columns -->
      <div class="main-content">
        <!-- Access Level Details -->
        <div class="access-details">
          <div class="section-header">
            <v-icon size="20" color="primary" class="mr-2"
              >mdi-shield-account</v-icon
            >
            <h2>Access Level Details</h2>
          </div>

          <!-- Access Level Selection - Moved here -->
          <div class="access-controls">
            <div class="access-level-container">
              <div class="access-level-label">Access Level Category</div>
              <v-select
                v-model="selectedAccessLevel"
                :items="accessLevelOptions"
                item-title="accessLevelName"
                item-value="id"
                return-object
                @update:model-value="handleAccessLevelChange"
                variant="outlined"
                hide-details
                class="access-level-select"
              >
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props" :disabled="!item.raw.accessType">
                    <template v-slot:prepend>
                      <v-icon
                        :color="item.raw.accessType ? 'success' : 'error'"
                      >
                        {{
                          item.raw.accessType
                            ? "mdi-shield-check"
                            : "mdi-shield-off"
                        }}
                      </v-icon>
                    </template>
                    <template v-slot:append>
                      <span
                        :class="
                          item.raw.accessType ? 'text-success' : 'text-error'
                        "
                      >
                        ({{ item.raw.accessType ? "Enabled" : "Disabled" }})
                      </span>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </div>

            <div class="access-toggle">
              <v-switch
                v-model="accessOn"
                color="success"
                hide-details
                @change="handleAccessToggle"
              >
                <template v-slot:label>
                  <span class="access-label"
                    >Access: {{ accessOn ? "Enabled" : "Disabled" }}</span
                  >
                </template>
              </v-switch>
            </div>
          </div>

          <div v-if="accessLevelDetails" class="details-content">
            <div class="tabs">
              <div
                class="tab"
                :class="{ active: activeTab === 'general' }"
                @click="activeTab = 'general'"
              >
                <v-icon size="18" class="mr-1">mdi-information</v-icon>
                GENERAL
              </div>
              <div
                class="tab"
                :class="{ active: activeTab === 'doors' }"
                @click="activeTab = 'doors'"
              >
                <v-icon size="18" class="mr-1">mdi-door</v-icon>
                ASSIGNED DOORS
              </div>
            </div>

            <div v-if="activeTab === 'general'" class="general-info">
              <div
                class="info-card"
                :class="{ 'disabled-card': !accessLevelDetails._24hrs }"
              >
                <div class="info-header">
                  <v-icon
                    :color="accessLevelDetails._24hrs ? 'success' : 'error'"
                    size="24"
                    class="mr-2"
                  >
                    mdi-clock-time-four
                  </v-icon>
                  <span class="info-title">24 Hours Access</span>
                </div>
                <div class="info-value">
                  {{ accessLevelDetails._24hrs ? "Enabled" : "Disabled" }}
                </div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <v-icon color="primary" size="24" class="mr-2"
                    >mdi-timer-outline</v-icon
                  >
                  <span class="info-title">Max Hours</span>
                </div>
                <div class="info-value">
                  {{ accessLevelDetails.maxWorkHours }} hours
                </div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <v-icon color="primary" size="24" class="mr-2"
                    >mdi-calendar-clock</v-icon
                  >
                  <span class="info-title">Working Hours</span>
                </div>
                <div class="info-value">
                  {{ accessLevelDetails.workingHours || "Not set" }}
                </div>
              </div>

              <div class="info-card">
                <div class="info-header">
                  <v-icon color="primary" size="24" class="mr-2"
                    >mdi-calendar-star</v-icon
                  >
                  <span class="info-title">Holidays</span>
                </div>
                <div class="info-value">
                  {{ accessLevelDetails.holidays ? "Allowed" : "Not Allowed" }}
                </div>
              </div>
            </div>

            <!-- In the doors-info section -->
            <div v-if="activeTab === 'doors'" class="doors-info">
              <div
                v-if="
                  !accessLevelDetails.assignedDoors ||
                  accessLevelDetails.assignedDoors.length === 0
                "
                class="no-doors"
              >
                No doors assigned to this access level
              </div>

              <div v-else class="doors-grid">
                <div
                  v-for="door in accessLevelDetails.assignedDoors"
                  :key="door.doors_id.id"
                  class="door-item"
                >
                  <v-icon color="primary" size="20" class="mr-2"
                    >mdi-door</v-icon
                  >
                  <div>
                    <div class="door-number">
                      {{ door.doors_id.doorNumber }}
                    </div>
                    <div class="door-name">{{ door.doors_id.doorName }}</div>
                    <div class="door-type">{{ door.doors_id.doorType }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-access-level">
            <v-icon size="40" color="grey" class="mb-2">mdi-shield-off</v-icon>
            <div>No access level selected</div>
          </div>
        </div>

        <!-- Card Management -->
        <div class="card-management">
          <div class="section-header">
            <v-icon size="20" color="primary" class="mr-2"
              >mdi-credit-card-multiple</v-icon
            >
            <h2>Card Management</h2>
          </div>

          <div class="card-input-container">
            <v-text-field
              v-model="cardInput"
              label="Swipe card to enter"
              variant="outlined"
              type="number"
              density="comfortable"
              @focus="handleCardFocus"
              :disabled="!accessOn"
              maxlength="10"
              minlength="10"
              @input="handleCardInput"
              hide-details
              class="card-input"
            ></v-text-field>

            <v-select
              v-model="selectedCardType"
              :items="['rfid', 'tag']"
              variant="outlined"
              density="comfortable"
              :disabled="!accessOn"
              hide-details
              class="card-type"
            ></v-select>
          </div>

          <v-btn
            color="black"
            variant="elevated"
            @click="addNewCard"
            :disabled="!cardInput || !accessOn"
            class="add-card-btn"
            prepend-icon="mdi-plus"
          >
            ADD NEW CARD
          </v-btn>

          <div class="assigned-cards">
            <div class="assigned-cards-header">
              <span>Assigned Cards</span>
              <span class="card-count">{{ assignedCards.length }} cards</span>
            </div>

            <div class="cards-list">
              <div v-if="assignedCards.length === 0" class="no-cards">
                No cards assigned
              </div>

              <div
                v-for="card in assignedCards"
                :key="card.id"
                class="card-item"
              >
                <div class="card-info">
                  <v-icon size="20" color="primary" class="mr-2"
                    >mdi-credit-card</v-icon
                  >
                  <div>
                    <div class="card-number">{{ card.rfidCard }}</div>
                    <div class="card-type-label">
                      Type: {{ card.type.toUpperCase() }}
                    </div>
                  </div>
                </div>

                <div class="card-actions">
                  <v-switch
                    v-model="card.enabled"
                    :disabled="!accessOn"
                    color="success"
                    density="compact"
                    hide-details
                    @change="updateCardAccess(card)"
                    class="card-toggle"
                  ></v-switch>

                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="removeCard(card.id)"
                    :disabled="!accessOn"
                    class="delete-btn"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="info-text">
          <v-icon color="info" size="18" class="mr-2">mdi-information</v-icon>
          <span>Need to modify access level categories?</span>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          @click="redirectToAccessLevelCategory"
          class="settings-btn"
          prepend-icon="mdi-cog"
        >
          ACCESS LEVEL CATEGORY SETTINGS
        </v-btn>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="no-data">
      <v-icon size="64" color="grey" class="mb-4">mdi-account-question</v-icon>
      <h3>No Employee Data Found</h3>
      <p>The requested employee information could not be found</p>
    </div>

    <!-- Notifications -->
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
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  defineProps,
  defineEmits,
  computed,
} from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { convertToCardAccessHex } from "@/utils/helpers/convertToCardAccessHex";

const props = defineProps({
  employeeData: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:employeeData"]);
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const accessLevelOptions = ref([]);
const accessLevelDetails = ref(null);
const activeTab = ref("general");
const cardInput = ref("");
const selectedCardType = ref("rfid");
const assignedCards = ref([]);
const selectedAccessLevel = ref(null);
const accessOn = ref(true);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Track original state for change detection
const originalAccessLevel = ref(null);
const originalAccessOn = ref(true);
const originalCards = ref([]);
const removedCardIds = ref([]);

let cardListener = null;

const showSuccessMessage = (message) => {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
};

const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
};

const hasChanges = computed(() => {
  // Check if access level changed
  const accessLevelChanged =
    selectedAccessLevel.value?.id !== originalAccessLevel.value?.id;

  const accessToggleChanged = accessOn.value !== originalAccessOn.value;
  const cardsChanged = assignedCards.value.some(
    (card) => card.isNew || card.isChanged
  );
  const cardsRemoved = removedCardIds.value.length > 0;

  return (
    accessLevelChanged || accessToggleChanged || cardsChanged || cardsRemoved
  );
});

const fetchEmployeeData = async () => {
  const token = authService.getToken();
  try {
    const tenantId = currentUserTenant.getTenantId();
    if (!token || !tenantId) {
      throw new Error("Authentication required or tenant not found");
    }

    const fields = [
      "assignedAccessLevel.id",
      "assignedAccessLevel.accessLevelName",
      "assignedAccessLevel.accessLevelNumber",
      "assignedAccessLevel._24hrs",
      "assignedAccessLevel.holidays",
      "assignedAccessLevel.maxWorkHours",
      "assignedAccessLevel.workingHours",
      "assignedAccessLevel.assignDoorsGroup",
      "id",
      "accessOn",
    ];

    const queryString = `fields[]=${fields.join("&fields[]=")}&filter[id][_eq]=${props.id}`;
    const finalUrl = `${import.meta.env.VITE_API_URL}/items/personalModule?${queryString}`;

    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const employee = data.data[0];
      emit("update:employeeData", employee);

      const cardsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[employeeId][_eq]=${props.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json();
        const cards = (cardsData.data || []).map((card) => ({
          id: card.id,
          rfidCard: card.rfidCard,
          type: card.type,
          enabled: card.cardAccess,
          isNew: false,
          isChanged: false,
          originalId: card.id,
        }));

        assignedCards.value = cards;
        originalCards.value = JSON.parse(JSON.stringify(cards));
      }

      if (employee.assignedAccessLevel) {
        selectedAccessLevel.value = employee.assignedAccessLevel;
        originalAccessLevel.value = employee.assignedAccessLevel;
        await handleAccessLevelChange(selectedAccessLevel.value);
      }

      accessOn.value = employee.accessOn;
      originalAccessOn.value = employee.accessOn;

      removedCardIds.value = [];
    } else {
      throw new Error("No employee data found");
    }
  } catch (err) {
    console.error("Error fetching employee data:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchAccessLevels = async () => {
  try {
    const tenantId = currentUserTenant.getTenantId();
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels?filter[tenant][tenantId][_eq]=${tenantId}&fields=*,assignDoorsGroup`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );
    const data = await response.json();
    accessLevelOptions.value = data.data.map((level) => ({
      id: level.id,
      accessLevelName: level.accessLevelName,
      accessLevelNumber: level.accessLevelNumber,
      accessType: level.accessType,
      _24hrs: level._24hrs,
      holidays: level.holidays,
      maxWorkHours: level.maxWorkHours,
      workingHours: level.workingHours,
      assignDoorsGroup: level.assignDoorsGroup,
    }));
  } catch (error) {
    console.error("Error fetching access levels:", error);
  }
};

const handleAccessLevelChange = async (value) => {
  if (!value) {
    accessLevelDetails.value = null;
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/accesslevels/${value.id}?fields=*,assignDoorsGroup`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch access level details");
    }

    const data = await response.json();

    // Fetch door details for the assigned door IDs
    let assignedDoors = [];
    if (data.data.assignDoorsGroup && data.data.assignDoorsGroup.length > 0) {
      const doorIds = data.data.assignDoorsGroup.join(",");
      const doorsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/doors?filter[id][_in]=${doorIds}&fields=id,doorNumber,doorName,doorType,doorsConfigure,tenant.tenantName`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      if (doorsResponse.ok) {
        const doorsData = await doorsResponse.json();
        assignedDoors = doorsData.data || [];
      }
    }

    accessLevelDetails.value = {
      ...data.data,
      _24hrs: data.data._24hrs,
      holidays: data.data.holidays,
      maxWorkHours: data.data.maxWorkHours,
      workingHours: data.data.workingHours,
      assignedDoors: assignedDoors.map((door) => ({
        doors_id: {
          id: door.id,
          doorNumber: door.doorNumber,
          doorName: door.doorName,
          doorType: door.doorType,
          doorsConfigure: door.doorsConfigure,
          tenant: door.tenant,
        },
      })),
    };
  } catch (error) {
    console.error("Error fetching access level details:", error);
    showErrorMessage("Failed to load access level details");
  }
};

const updateAccessCatagory = async () => {
  if (!hasChanges.value) return;

  try {
    const payload = {
      accessOn: accessOn.value,
      status: accessOn.value ? "active" : "inactive",
    };

    const accessLevelNumber = selectedAccessLevel.value?.accessLevelNumber || 0;

    if (selectedAccessLevel.value) {
      payload.assignedAccessLevel = selectedAccessLevel.value.id;
    }
    for (const card of assignedCards.value) {
      const cardAccess = accessOn.value ? card.enabled : false;

      const cardPayload = {
        rfidCard: card.rfidCard,
        type: card.type.toLowerCase(),
        enabled: cardAccess,
        cardAccess: cardAccess,
        accessLevelsId: accessLevelNumber,
        cardAccessLevelArray: `${card.rfidCard}:${cardAccess ? 1 : 0}:${accessLevelNumber}`,
        cardAccessLevelHex: convertToCardAccessHex(
          card.rfidCard,
          cardAccess,
          accessLevelNumber
        ),
        employeeId: props.id,
      };

      if (card.isNew) {
        cardPayload.tenant = currentUserTenant.getTenantId();

        await fetch(`${import.meta.env.VITE_API_URL}/items/cardManagement`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cardPayload),
        });
      } else {
        await fetch(
          `${import.meta.env.VITE_API_URL}/items/cardManagement/${card.originalId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cardPayload),
          }
        );
      }
    }

    // Delete removed cards
    for (const removedCardId of removedCardIds.value) {
      await fetch(
        `${import.meta.env.VITE_API_URL}/items/cardManagement/${removedCardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/personalModule/${props.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error response:", errorData);
      throw new Error(
        errorData.errors?.[0]?.message || "Failed to update access category"
      );
    }

    assignedCards.value = assignedCards.value.map((card) => ({
      ...card,
      isNew: false,
      isChanged: false,
      enabled: accessOn.value ? card.enabled : false,
    }));

    removedCardIds.value = [];
    originalAccessLevel.value = selectedAccessLevel.value;
    originalAccessOn.value = accessOn.value;

    showSuccessMessage("Access level has been updated successfully!");
    await fetchEmployeeData();
  } catch (error) {
    console.error("Error updating access category:", error);
    showErrorMessage(`Error updating access level: ${error.message}`);
  }
};

const addNewCard = async () => {
  if (!cardInput.value) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${cardInput.value}`,
      {
        headers: {
          Authorization: `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check card existence");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      showErrorMessage("This card already exists in the system.");
      return;
    }

    const newCard = {
      id: `new_${Date.now()}_${Math.random()}`,
      rfidCard: cardInput.value,
      type: selectedCardType.value,
      enabled: accessOn.value,
      isNew: true,
      isChanged: false,
      originalId: null,
    };

    assignedCards.value.push(newCard);
    cardInput.value = "";
    showSuccessMessage(`Card ${newCard.rfidCard} added successfully!`);
  } catch (error) {
    console.error("Error adding new card:", error);
    showErrorMessage(`Failed to add new card: ${error.message}`);
  }
};

const updateCardAccess = async (card) => {
  if (!card.isNew) {
    card.isChanged = true;
  }
  showSuccessMessage(
    `Card ${card.rfidCard} ${card.enabled ? "enabled" : "disabled"} successfully!`
  );
};

const handleCardFocus = () => {
  cardListener = window.addEventListener("keypress", handleCardSwipe);
};

const handleCardInput = (event) => {
  if (cardInput.value.length > 10) {
    cardInput.value = cardInput.value.slice(0, 10);
  }
};

const handleCardSwipe = (event) => {
  if (event.keyCode === 13) {
    window.removeEventListener("keypress", handleCardSwipe);
    processCardData(cardInput.value);
  }
};

const processCardData = (cardData) => {
  const existingCard = assignedCards.value.find(
    (card) => card.rfidCard === cardData
  );
  if (existingCard) {
    showErrorMessage("This card is already assigned");
    cardInput.value = "";
    return;
  }
  addNewCard();
};

const removeCard = async (cardId) => {
  const cardToRemove = assignedCards.value.find((card) => card.id === cardId);

  if (cardToRemove) {
    if (!cardToRemove.isNew && cardToRemove.originalId) {
      removedCardIds.value.push(cardToRemove.originalId);
    }

    assignedCards.value = assignedCards.value.filter(
      (card) => card.id !== cardId
    );

    showSuccessMessage(`Card ${cardToRemove.rfidCard} removed successfully!`);
  }
};

const handleAccessToggle = async () => {
  assignedCards.value = assignedCards.value.map((card) => ({
    ...card,
    enabled: accessOn.value,
    isChanged: !card.isNew,
  }));

  showSuccessMessage(
    `Access ${accessOn.value ? "enabled" : "disabled"} successfully! All cards have been ${accessOn.value ? "enabled" : "disabled"}.`
  );
};

const redirectToAccessLevelCategory = () => {
  router.push("/configuration/accesslevel-configurator");
};

onMounted(() => {
  fetchEmployeeData();
  fetchAccessLevels();
});

watch(
  () => props.id,
  () => {
    fetchEmployeeData();
  }
);

onUnmounted(() => {
  if (cardListener) {
    window.removeEventListener("keypress", handleCardSwipe);
  }
});
</script>

<style scoped>
.access-management {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  margin: 0 auto;
  padding: 0;
  color: #333;
  overflow-y: auto;
  height: calc(80vh - 64px);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  display: flex;
  align-items: center;
}

.title h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.save-btn {
  font-weight: 500;
}

/* Warning Message */
.warning-message {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff3e0;
  border-radius: 8px;
  color: #e65100;
  font-size: 14px;
  margin-bottom: 16px;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 0vh !important;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

/* Card Management */
.card-management {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-input-container {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.card-input {
  flex: 3;
}

.card-type {
  flex: 1;
}

.add-card-btn {
  width: 100%;
  margin-bottom: 20px;
}

.assigned-cards {
  margin-top: 20px;
}

.assigned-cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-count {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.cards-list {
  max-height: 170px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 4px;
}

.no-cards {
  padding: 24px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.card-item:last-child {
  border-bottom: none;
}

.card-info {
  display: flex;
  align-items: center;
}

.card-number {
  font-weight: 500;
  font-size: 16px;
}

.card-type-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Access Details */
.access-details {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Access Controls - New section for the moved elements */
.access-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.access-level-container {
  flex: 1;
  max-width: 300px;
}

.access-level-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.access-toggle {
  display: flex;
  align-items: center;
}

.access-label {
  font-weight: 500;
  margin-left: 8px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  color: #666;
}

.tab.active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}

.general-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.2s;
  background-color: #eeee;
}

.disabled-card {
  border-left: 3px solid #f44336;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-title {
  font-weight: 500;
  font-size: 16px;
}

.info-value {
  font-size: 14px;
  color: #666;
}

.doors-info {
  max-height: 300px;
  overflow-y: auto;
}

.no-doors {
  padding: 24px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

.doors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.door-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  background-color: #eeee;
  border-radius: 6px;
}

.door-number {
  font-weight: 500;
  font-size: 14px;
}

.door-name {
  font-size: 12px;
  color: #666;
}

.no-access-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #888;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

.info-text {
  display: flex;
  align-items: center;
  color: #1976d2;
  font-size: 14px;
}

/* No Data */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
  color: #888;
}

.no-data h3 {
  margin: 16px 0 8px;
  font-weight: 500;
}

.no-data p {
  margin: 0;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .access-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .access-level-container {
    width: 100%;
    max-width: none;
  }

  .general-info {
    grid-template-columns: 1fr;
  }

  .footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .settings-btn {
    width: 100%;
  }
}
</style>
