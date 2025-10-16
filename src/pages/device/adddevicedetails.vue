<template>
  <v-container fluid>
    <v-row>
      <!-- Left Side: Tabs -->
      <v-col cols="3">
        <v-tabs
          v-model="activeTab"
          direction="vertical"
          color="primary"
          class="tabs"
        >
          <v-tab value="basic">Basic Details</v-tab>
          <v-tab value="door1">Door 1</v-tab>
          <v-tab value="door2">Door 2</v-tab>
          <v-tab value="door3">Door 3</v-tab>
          <v-tab value="door4">Door 4</v-tab>
        </v-tabs>
      </v-col>

      <!-- Right Side: Tab Content -->
      <v-col cols="9">
        <v-window v-model="activeTab">
          <!-- Basic Details Tab -->
          <v-window-item value="basic">
            <v-card>
              <v-card-title>Basic Details</v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field
                    label="Device Type"
                    value="4 Door Device"
                    variant="outlined"
                    readonly
                  ></v-text-field>
                  <v-text-field
                    v-model="form.deviceName"
                    label="Device Name"
                    required
                    variant="outlined"
                  ></v-text-field>
                  <v-text-field
                    v-model="form.serialNumber"
                    label="Serial Number"
                    required
                    variant="outlined"
                  ></v-text-field>
                  <v-select
                    v-model="form.branch"
                    label="Branch"
                    :items="branches"
                    required
                    variant="outlined"
                  ></v-select>

                  <!-- Action Buttons -->
                  <div class="d-flex justify-end mt-4">
                    <BaseButton
                      variant="ghost"
                      text="Cancel"
                      @click="$emit('close')"
                      class="mr-2"
                    ></BaseButton>
                    <BaseButton
                      variant="primary"
                      text="Save Device"
                      :loading="isSaving"
                      @click="saveDevice"
                    ></BaseButton>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Door 1 Tab -->
          <v-window-item value="door1">
            <v-card>
              <v-card-title>Door 1</v-card-title>
              <v-card-text>
                <v-form>
                  <v-select
                    v-model="form.doors.door1.selectedDoor"
                    label="Select Door"
                    :items="availableDoors"
                    variant="outlined"
                    required
                  ></v-select>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium"
                              >Door open duration</span
                            ><br />
                            <small
                              >Set the maximum time the door can remain
                              open</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-row dense>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door1.dotlDuration"
                                label="Duration (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door1.dotlDelay"
                                label="DOTL Alarm Delay (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Sensor Mode</span
                            ><br />
                            <small>Unauthorised when the door is open</small>
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door1.sensorStatus"
                            label="Sensor Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Passage Mode</span
                            ><br />
                            <small
                              >Enable passage mode for schedule opening</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door1.passageStatus"
                            label="Passage Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>

                        <v-col cols="12" v-if="form.doors.door1.passageStatus">
                          <v-radio-group
                            v-model="form.doors.door1.passageMode"
                            inline
                          >
                            <v-radio
                              label="24 Hours Access"
                              value="24hours"
                            ></v-radio>
                            <v-radio
                              label="Limit Time"
                              value="limittime"
                            ></v-radio>
                          </v-radio-group>
                          <v-text-field
                            v-if="form.doors.door1.passageMode === 'limittime'"
                            v-model="form.doors.door1.passageTime"
                            label="Select Time"
                            type="time"
                            variant="outlined"
                            dense
                            class="small-field"
                            style="max-width: 150px"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- Door Action Buttons -->
                  <div class="d-flex justify-end mt-4">
                    <BaseButton
                      variant="ghost"
                      text="Cancel"
                      @click="cancelDoor('door1')"
                      class="mr-2"
                    ></BaseButton>
                    <BaseButton
                      variant="primary"
                      text="Save Door"
                      :loading="isSavingDoor.door1"
                      @click="saveDoor('door1')"
                    ></BaseButton>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Door 2 Tab -->
          <v-window-item value="door2">
            <v-card>
              <v-card-title>Door 2</v-card-title>
              <v-card-text>
                <v-form>
                  <v-select
                    v-model="form.doors.door2.selectedDoor"
                    label="Select Door"
                    :items="availableDoors"
                    variant="outlined"
                    required
                  ></v-select>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium"
                              >Door open duration</span
                            ><br />
                            <small
                              >Set the maximum time the door can remain
                              open</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-row dense>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door2.dotlDuration"
                                label="Duration (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door2.dotlDelay"
                                label="DOTL Alarm Delay (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Sensor Mode</span
                            ><br />
                            <small>Unauthorised when the door is open</small>
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door2.sensorStatus"
                            label="Sensor Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Passage Mode</span
                            ><br />
                            <small
                              >Enable passage mode for schedule opening</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door2.passageStatus"
                            label="Passage Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>

                        <v-col cols="12" v-if="form.doors.door2.passageStatus">
                          <v-radio-group
                            v-model="form.doors.door2.passageMode"
                            inline
                          >
                            <v-radio
                              label="24 Hours Access"
                              value="24hours"
                            ></v-radio>
                            <v-radio
                              label="Limit Time"
                              value="limittime"
                            ></v-radio>
                          </v-radio-group>
                          <v-text-field
                            v-if="form.doors.door2.passageMode === 'limittime'"
                            v-model="form.doors.door2.passageTime"
                            label="Select Time"
                            type="time"
                            variant="outlined"
                            dense
                            class="small-field"
                            style="max-width: 150px"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- Door Action Buttons -->
                  <div class="d-flex justify-end mt-4">
                    <BaseButton
                      variant="ghost"
                      text="Cancel"
                      @click="cancelDoor('door2')"
                      class="mr-2"
                    ></BaseButton>
                    <BaseButton
                      variant="primary"
                      text="Save Door"
                      :loading="isSavingDoor.door2"
                      @click="saveDoor('door2')"
                    ></BaseButton>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Door 3 Tab -->
          <v-window-item value="door3">
            <v-card>
              <v-card-title>Door 3</v-card-title>
              <v-card-text>
                <v-form>
                  <v-select
                    v-model="form.doors.door3.selectedDoor"
                    label="Select Door"
                    :items="availableDoors"
                    variant="outlined"
                    required
                  ></v-select>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium"
                              >Door open duration</span
                            ><br />
                            <small
                              >Set the maximum time the door can remain
                              open</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-row dense>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door3.dotlDuration"
                                label="Duration (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door3.dotlDelay"
                                label="DOTL Alarm Delay (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Sensor Mode</span
                            ><br />
                            <small>Unauthorised when the door is open</small>
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door3.sensorStatus"
                            label="Sensor Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Passage Mode</span
                            ><br />
                            <small
                              >Enable passage mode for schedule opening</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door3.passageStatus"
                            label="Passage Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>

                        <v-col cols="12" v-if="form.doors.door3.passageStatus">
                          <v-radio-group
                            v-model="form.doors.door3.passageMode"
                            inline
                          >
                            <v-radio
                              label="24 Hours Access"
                              value="24hours"
                            ></v-radio>
                            <v-radio
                              label="Limit Time"
                              value="limittime"
                            ></v-radio>
                          </v-radio-group>
                          <v-text-field
                            v-if="form.doors.door3.passageMode === 'limittime'"
                            v-model="form.doors.door3.passageTime"
                            label="Select Time"
                            type="time"
                            variant="outlined"
                            dense
                            class="small-field"
                            style="max-width: 150px"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- Door Action Buttons -->
                  <div class="d-flex justify-end mt-4">
                    <BaseButton
                      variant="ghost"
                      text="Cancel"
                      @click="cancelDoor('door3')"
                      class="mr-2"
                    ></BaseButton>
                    <BaseButton
                      variant="primary"
                      text="Save Door"
                      :loading="isSavingDoor.door3"
                      @click="saveDoor('door3')"
                    ></BaseButton>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>

          <!-- Door 4 Tab -->
          <v-window-item value="door4">
            <v-card>
              <v-card-title>Door 4</v-card-title>
              <v-card-text>
                <v-form>
                  <v-select
                    v-model="form.doors.door4.selectedDoor"
                    label="Select Door"
                    :items="availableDoors"
                    variant="outlined"
                    required
                  ></v-select>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium"
                              >Door open duration</span
                            ><br />
                            <small
                              >Set the maximum time the door can remain
                              open</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-row dense>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door4.dotlDuration"
                                label="Duration (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="6">
                              <v-text-field
                                v-model="form.doors.door4.dotlDelay"
                                label="DOTL Alarm Delay (seconds)"
                                type="number"
                                variant="outlined"
                                dense
                                class="small-field"
                                :min="1"
                                :max="99"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Sensor Mode</span
                            ><br />
                            <small>Unauthorised when the door is open</small>
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door4.sensorStatus"
                            label="Sensor Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <v-card outlined class="mb-4">
                    <v-card-text>
                      <v-row dense align="center">
                        <v-col cols="12" sm="6">
                          <div>
                            <span class="font-weight-medium">Passage Mode</span
                            ><br />
                            <small
                              >Enable passage mode for schedule opening</small
                            >
                          </div>
                        </v-col>
                        <v-col cols="12" sm="6" class="d-flex justify-end">
                          <v-switch
                            v-model="form.doors.door4.passageStatus"
                            label="Passage Status"
                            color="primary"
                            inset
                            hide-details
                          ></v-switch>
                        </v-col>

                        <v-col cols="12" v-if="form.doors.door4.passageStatus">
                          <v-radio-group
                            v-model="form.doors.door4.passageMode"
                            inline
                          >
                            <v-radio
                              label="24 Hours Access"
                              value="24hours"
                            ></v-radio>
                            <v-radio
                              label="Limit Time"
                              value="limittime"
                            ></v-radio>
                          </v-radio-group>
                          <v-text-field
                            v-if="form.doors.door4.passageMode === 'limittime'"
                            v-model="form.doors.door4.passageTime"
                            label="Select Time"
                            type="time"
                            variant="outlined"
                            dense
                            class="small-field"
                            style="max-width: 150px"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>

                  <!-- Door Action Buttons -->
                  <div class="d-flex justify-end mt-4">
                    <BaseButton
                      variant="ghost"
                      text="Cancel"
                      @click="cancelDoor('door4')"
                      class="mr-2"
                    ></BaseButton>
                    <BaseButton
                      variant="primary"
                      text="Save Door"
                      :loading="isSavingDoor.door4"
                      @click="saveDoor('door4')"
                    ></BaseButton>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import BaseButton from "@/components/common/buttons/BaseButton.vue";

export default {
  name: "AddDeviceDetail",
  components: {
    BaseButton,
  },
  data() {
    return {
      activeTab: "basic",
      isSaving: false,
      isSavingDoor: {
        door1: false,
        door2: false,
        door3: false,
        door4: false,
      },
      form: {
        deviceType: "4 Door Device",
        deviceName: "",
        serialNumber: "",
        branch: "",
        doors: {
          door1: {
            selectedDoor: "",
            dotlDuration: 10,
            sensorStatus: false,
            dotlDelay: 5,
            passageStatus: false,
            passageMode: "24hours",
            passageTime: "",
          },
          door2: {
            selectedDoor: "",
            dotlDuration: 10,
            sensorStatus: false,
            dotlDelay: 5,
            passageStatus: false,
            passageMode: "24hours",
            passageTime: "",
          },
          door3: {
            selectedDoor: "",
            dotlDuration: 10,
            sensorStatus: false,
            dotlDelay: 5,
            passageStatus: false,
            passageMode: "24hours",
            passageTime: "",
          },
          door4: {
            selectedDoor: "",
            dotlDuration: 10,
            sensorStatus: false,
            dotlDelay: 5,
            passageStatus: false,
            passageMode: "24hours",
            passageTime: "",
          },
        },
      },
      branches: ["Branch A", "Branch B", "Branch C"],
      availableDoors: ["Door A", "Door B", "Door C", "Door D"],
    };
  },
  methods: {
    async saveDevice() {
      this.isSaving = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Device Data:", this.form);
        this.$router.push("/device-details");
      } catch (error) {
        console.error("Error saving device:", error);
      } finally {
        this.isSaving = false;
      }
    },
    async saveDoor(doorKey) {
      this.isSavingDoor[doorKey] = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log(`Saved ${doorKey} Data:`, this.form.doors[doorKey]);
        // Implement API call to save door configuration
        // Example: await api.saveDoor(doorKey, this.form.doors[doorKey]);
      } catch (error) {
        console.error(`Error saving ${doorKey}:`, error);
      } finally {
        this.isSavingDoor[doorKey] = false;
      }
    },
    cancelDoor(doorKey) {
      // Reset door form to initial state
      this.form.doors[doorKey] = {
        selectedDoor: "",
        dotlDuration: 10,
        sensorStatus: false,
        dotlDelay: 5,
        passageStatus: false,
        passageMode: "24hours",
        passageTime: "",
      };
      // Optionally navigate back
      this.$router.push("/device-details");
    },
  },
};
</script>

<style scoped>
.tabs {
  border-right: 1px solid #ddd;
  height: 100%;
}
.v-card {
  padding: 16px;
}
</style>
