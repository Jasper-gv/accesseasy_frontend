<template>
  <div class="status-tab">
    <div class="status-container">
      <div class="status-guide">
        <div class="guide-content">
          <div class="guide-icon">
            <InfoIcon class="w-8 h-8" />
          </div>
          <div class="guide-text">
            <h3 class="guide-title">Workflow Configuration</h3>
            <p class="guide-description">
              Define which roles can change work order status.
            </p>
          </div>
        </div>
      </div>
      <!-- ✅ Form Visibility (same design as Status Transitions) -->
      <h3 class="section-title">Form Visibility</h3>
      <div class="status-item enhanced-status-item">
        <div class="status-header">
          <h4 class="status-name">Form Visibility To</h4>
        </div>

        <div class="status-config-grid">
          <div class="status-roles">
            <label class="section-label">Visible To Roles</label>
            <div class="toggle-group">
              <div
                v-for="role in roleOptions"
                :key="role.id"
                class="toggle-item"
              >
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    :checked="
                      selectedForm.custom_FormTemplate.form_visibility_to?.roles.includes(
                        role.name,
                      )
                    "
                    @change="
                      toggleFormVisibility(role.name, $event.target.checked)
                    "
                    class="toggle-input"
                  />
                  <span class="toggle-slider toggle-slider-small"></span>
                </label>
                <span class="toggle-label">{{ role.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ Status Transitions -->
      <h3 class="section-title">Status</h3>
      <div
        v-for="(transition, statusKey) in selectedForm.custom_FormTemplate
          ?.status_transitions || {}"
        :key="statusKey"
        class="status-item enhanced-status-item"
      >
        <div class="status-header">
          <h4 class="status-name">{{ statusKey }}</h4>
        </div>

        <div class="status-config-grid">
          <!-- Closed-Overdue special case -->
          <template v-if="statusKey === 'closed-overDue'">
            <div class="status-roles">
              <label class="section-label">Auto-Closure Settings</label>
              <div class="toggle-item">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="transition.enabled"
                    class="toggle-input"
                  />
                  <span class="toggle-slider toggle-slider-small"></span>
                </label>
                <span class="toggle-label">Enable Auto-Closure</span>
              </div>
              <div v-if="transition.enabled" class="form-group mt-4">
                <label class="form-label"
                  >Max Days Allowed After Due Date</label
                >
                <input
                  type="number"
                  v-model.number="transition.max_days_allowed"
                  min="1"
                  class="form-input form-select-sm"
                />
                <div class="field-help">
                  Form will automatically close if due date is exceeded by this
                  many days.
                </div>
              </div>
            </div>
          </template>

          <!-- Role-Based Allowed Transitions -->
          <div class="status-roles" v-else>
            <label class="section-label">Allowed Roles</label>
            <div class="toggle-group">
              <div
                v-for="role in roleOptions"
                :key="role.id"
                class="toggle-item"
              >
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    :checked="
                      transition.can_set_by_roles?.includes(role.name) || false
                    "
                    @change="
                      toggleStatusRole(
                        statusKey,
                        role.name,
                        $event.target.checked,
                      )
                    "
                    class="toggle-input"
                  />
                  <span class="toggle-slider toggle-slider-small"></span>
                </label>
                <span class="toggle-label">{{ role.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { InfoIcon } from "lucide-vue-next";

const props = defineProps({
  selectedForm: Object,
  roleOptions: Array,
});

const toggleStatusRole = (statusKey, roleName, isAllowed) => {
  const transition =
    props.selectedForm.custom_FormTemplate.status_transitions[statusKey];
  if (!transition.can_set_by_roles) transition.can_set_by_roles = [];

  if (isAllowed) {
    if (!transition.can_set_by_roles.includes(roleName)) {
      transition.can_set_by_roles.push(roleName);
    }
  } else {
    transition.can_set_by_roles = transition.can_set_by_roles.filter(
      (r) => r !== roleName,
    );
  }
};

const toggleFormVisibility = (roleName, isVisible) => {
  const vis = props.selectedForm.custom_FormTemplate.form_visibility_to;
  if (!vis.roles) vis.roles = [];

  if (isVisible) {
    if (!vis.roles.includes(roleName)) vis.roles.push(roleName);
  } else {
    vis.roles = vis.roles.filter((r) => r !== roleName);
  }
};
</script>
