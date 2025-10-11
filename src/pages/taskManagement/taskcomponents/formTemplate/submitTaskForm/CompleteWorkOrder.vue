<!-- CompleteTaskSidebar.vue  -->
<template>
  <!-- Internal Task Completion -->
  <InternalTaskCompletionSidebar
    v-if="isInternalTask"
    :modelValue="modelValue"
    :task="task"
    @update:modelValue="$emit('update:modelValue', $event)"
    @complete="handleTaskComplete"
    @saveDraft="handleTaskSaveDraft"
  />

  <!-- Work Order Task Completion -->
  <WorkOrderTaskCompletionSidebar
    v-else
    :modelValue="modelValue"
    :task="task"
    @update:modelValue="$emit('update:modelValue', $event)"
    @complete="handleTaskComplete"
    @saveDraft="handleTaskSaveDraft"
  />
</template>

<script setup>
import { computed } from "vue";
import InternalTaskCompletionSidebar from "./CompleteTask/completeInternalTask.vue";
import WorkOrderTaskCompletionSidebar from "./CompleteTask/completeWorkOrder.vue";
import { useTaskCompletionApi } from "@/composables/workorder/completeWorkOrderForm/useTaskCompletionApi";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  task: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:modelValue", "complete", "saveDraft"]);

// Initialize the API composable
const {
  completeInternalTask,
  completeWorkOrderTask,
  saveTaskDraft,
  loading,
  error,
} = useTaskCompletionApi();

// Check if this is an internal task
const isInternalTask = computed(() => {
  const assignFormId = props.task?.assignFormId;
  return !assignFormId || assignFormId === "" || assignFormId === null;
});

// Handle task completion based on task type
const handleTaskComplete = async (completionData) => {
  try {
    let result;

    if (completionData.isInternalTask) {
      result = await completeInternalTask(completionData);
    } else {
      result = await completeWorkOrderTask(completionData);
    }

    if (result.success) {
      // Emit success to parent component
      emit("complete", {
        ...completionData,
        result: result.data,
        message: result.message,
      });
    } else {
      // Handle error - could emit error event or show toast
      console.error("Task completion failed:", result.error);
      throw new Error(result.error);
    }
  } catch (err) {
    console.error("Error in handleTaskComplete:", err);
    // Re-emit the error to parent for toast handling
    emit("complete", {
      ...completionData,
      error: err.message || "Failed to complete task",
    });
  }
};

// Handle save draft
const handleTaskSaveDraft = async (draftData) => {
  try {
    const result = await saveTaskDraft(draftData);

    if (result.success) {
      // Emit success to parent component
      emit("saveDraft", {
        ...draftData,
        result: result.data,
        message: result.message,
      });
    } else {
      // Handle error
      console.error("Save draft failed:", result.error);
      throw new Error(result.error);
    }
  } catch (err) {
    console.error("Error in handleTaskSaveDraft:", err);
    // Re-emit the error to parent for toast handling
    emit("saveDraft", {
      ...draftData,
      error: err.message || "Failed to save draft",
    });
  }
};
</script>
<style></style>
