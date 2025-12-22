import { authService } from "@/services/authService";

class AntipassbackService {
  /**
   * Fetch all doors from the items/doors collection
   * @returns {Promise<Array>} List of doors
   */
  async fetchDoors() {
    try {
      const tenantId = authService.getTenantId();
      const response = await authService.protectedApi.get(
        `/items/doors?filter[_and][0][_and][0][tenant][tenantId][_eq]=${tenantId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching doors:", error);
      throw error;
    }
  }

  /**
   * Create a new antipassback zone
   * @param {string} zoneName - Name of the zone
   * @returns {Promise<Object>} Created zone object
   */
  async createZone(zoneName) {
    try {
      const response = await authService.protectedApi.post(
        "/items/antiPassbackModeZones",
        {
          zoneName: zoneName,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating zone:", error);
      throw error;
    }
  }

  /**
   * Update a door with antipassback configuration
   * @param {number|string} doorId - ID of the door to update
   * @param {Object} antipassbackData - Configuration object { id: zoneId, direction: 'entry'|'exit' }
   * @returns {Promise<Object>} Updated door object
   */
  async updateDoor(doorId, antipassbackData) {
    try {
      const response = await authService.protectedApi.patch(
        `/items/doors/${doorId}`,
        {
          antipassbackMode: antipassbackData,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating door ${doorId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all antipassback zones
   * @returns {Promise<Array>} List of zones
   */
  async fetchZones() {
    try {
      const response = await authService.protectedApi.get(
        "/items/antiPassbackModeZones"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching zones:", error);
      throw error;
    }
  }
}

export const antipassbackService = new AntipassbackService();
