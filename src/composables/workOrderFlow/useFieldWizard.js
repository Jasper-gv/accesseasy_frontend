import { ref } from "vue";

export function useFieldWizard(selectedForm, showNotification) {
  const showFieldWizard = ref(false);

  const closeFieldWizard = () => {
    showFieldWizard.value = false;
  };

  const saveWizardField = (fieldData) => {
    if (!selectedForm.value || !fieldData.label) return;

    if (!selectedForm.value.custom_FormTemplate) {
      selectedForm.value.custom_FormTemplate = {
        fields: [],
        status_transitions: {},
      };
    }

    selectedForm.value.custom_FormTemplate.fields.push(fieldData);
    closeFieldWizard();
    showNotification("Field added successfully!", "success");
  };

  return {
    showFieldWizard,
    closeFieldWizard,
    saveWizardField,
  };
}
