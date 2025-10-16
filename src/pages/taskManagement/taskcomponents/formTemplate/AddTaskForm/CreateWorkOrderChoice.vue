<template>
  <v-navigation-drawer
    :model-value="open"
    @update:model-value="onDrawerModelUpdate"
    location="right"
    width="460"
    :temporary="false"
    :scrim="false"
    class="cwo-drawer"
  >
    <div class="drawer-root">
      <header class="drawer-header">
        <div class="title-wrap">
          <v-icon color="primary" class="mr-2">mdi-file-document-plus</v-icon>
          <h3 class="title">{{ headerTitle }}</h3>
        </div>
        <v-btn icon variant="text" @click="onClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </header>

      <section class="drawer-body">
        <v-card elevation="2" rounded="lg" class="mb-4">
          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <v-select
                  v-model="mode"
                  :items="[
                    { label: 'Internal Work Order', value: 'internal' },
                    { label: 'Work Order ', value: 'workorder' },
                  ]"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  prepend-inner-icon="mdi-format-list-bulleted"
                  hide-details="auto"
                  clearable
                  @update:model-value="onTaskTypeChange"
                  placeholder="Select task type"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <InternalTaskForm
          v-if="mode === 'internal'"
          :users="users"
          @created="onCreated"
          @back="mode = 'internal'"
          @cancel="onClose"
        />

        <CreateWorkOrder
          v-else-if="mode === 'workorder'"
          :embedded="true"
          @created="onCreated"
        />
      </section>

      <footer class="drawer-footer">
        <small class="muted">
          Actions stay visible at the bottom. No need to scroll to submit.
        </small>
      </footer>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import CreateWorkOrder from "./createWorkOrder.vue";
import InternalTaskForm from "@/components/WorkOrdeForm_Components/form/InternalTaskForm.vue";
import { useFormApi as formApi } from "@/composables/workorder/createWorkOrderForm/useFormApi";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["update:modelValue", "created"]);

const mode = ref("internal"); // 'none' | 'internal' | 'workorder'
const { users, fetchDropdownData } = formApi(); // call alias instead of useFormApi()

const headerTitle = computed(() => {
  if (mode.value === "internal") return "Create Internal Work Order";
  if (mode.value === "workorder") return "Create Work Order";
  return "Create Work Order";
});

const choose = (next) => {
  mode.value = next;
  if (next === "internal") {
    Promise.resolve(fetchDropdownData()).catch(() => {});
  }
};

const resetState = () => {
  mode.value = "internal";
};

const onClose = () => {
  resetState();
  emit("update:modelValue", false);
};

const resetAndClose = () => {
  resetState();
  emit("update:open", false);
};

const onCreated = () => {
  emit("created");
  resetAndClose();
};

const onTaskTypeChange = (val) => {
  if (!val) {
    mode.value = "internal";
  } else {
    mode.value = val;
  }
  if (mode.value === "internal") {
    Promise.resolve(fetchDropdownData()).catch(() => {});
  }
};

const onDrawerModelUpdate = (v) => {
  emit("update:open", v);
  if (v) {
    mode.value = "internal";
    Promise.resolve(fetchDropdownData()).catch(() => {});
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("exclusive-sidebar-open", { detail: "create-wo" }),
      );
    }
  }
};

const onExclusiveEvent = (e) => {
  const who = e?.detail;
  if (who && who !== "create-wo") emit("update:open", false);
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("exclusive-sidebar-open", onExclusiveEvent);
  }
});
onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("exclusive-sidebar-open", onExclusiveEvent);
  }
});
</script>

<style scoped>
.cwo-drawer {
  top: 0 !important;
  height: 100% !important;
  right: 0;
  position: fixed !important;
  width: 460px !important;
  z-index: 904 !important;
}

.drawer-root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-top: 60px;
}

.title-wrap {
  display: flex;
  align-items: center;
}

.title {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0;
}

.drawer-body {
  flex: 1 1 auto;
  overflow: auto;
  background: #fafbff;
}

.drawer-footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 10px 16px 14px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.muted {
  color: #6b7280;
}

.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.choice-card {
  cursor: pointer;
  border-radius: 12px !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.choice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.choice-card-inner {
  padding: 16px;
  text-align: center;
}

.choice-title {
  font-weight: 700;
  margin-bottom: 4px;
}

.choice-sub {
  font-size: 0.9rem;
  color: #64748b;
}

:deep(.form-actions) {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: #fff;
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
