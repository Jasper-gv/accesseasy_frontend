import { ref } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export const useTaskCompletionApi = () => {
  const loading = ref(false);
  const error = ref(null);

  const getAuthToken = () => {
    const token = authService.getToken();
    if (!token)
      throw new Error("Authentication token not found. Please log in.");
    return token;
  };

  const getWorkOrdersFolderId = async () => {
    try {
      const token = getAuthToken();
      const tenantId = await currentUserTenant.getTenantId();
      if (!tenantId) throw new Error("Tenant ID not found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantId}&fields[]=foldersId`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) throw new Error("Failed to fetch tenant data");

      const data = await response.json();
      if (data.data?.[0]?.foldersId) {
        const workordersFolder = data.data[0].foldersId.find(
          (folder) => folder.name === "Workorders",
        );
        if (workordersFolder) return workordersFolder.id;
      }
      return null;
    } catch (err) {
      console.error("Error fetching Workorders folder ID:", err);
      return null;
    }
  };

  const uploadTaskImage = async (file, taskId) => {
    try {
      const token = getAuthToken();

      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file only");
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 10MB");
      }

      // Get tenant ID and folder ID
      const tenantId = await currentUserTenant.getTenantId();
      if (!tenantId) throw new Error("Tenant ID not found");

      const workOrdersFolderId = await getWorkOrdersFolderId();

      // Prepare form data
      const formData = new FormData();
      if (workOrdersFolderId) {
        formData.append("folder", workOrdersFolderId);
      }

      const fileExtension = file.name.split(".").pop();
      const customFileName = `${taskId || "task"}-${tenantId}.${fileExtension}`;
      formData.append("file", file, customFileName);

      // Upload file
      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access. Token might be expired.");
        }
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: {
          id: result.data.id,
          name: file.name,
          type: file.type,
          file,
          url: URL.createObjectURL(file),
        },
        message: "Image uploaded successfully!",
      };
    } catch (err) {
      console.error("Error uploading image:", err);
      return {
        success: false,
        error: err.message || "Failed to upload image",
      };
    }
  };

  const uploadTaskFiles = async (taskId, files) => {
    try {
      const token = getAuthToken();
      const tenantId = await currentUserTenant.getTenantId();
      if (!tenantId) throw new Error("Tenant ID not found");

      const workOrdersFolderId = await getWorkOrdersFolderId();
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        if (workOrdersFolderId) {
          formData.append("folder", workOrdersFolderId);
        }

        const fileExtension = file.name.split(".").pop();
        const customFileName = `${taskId}-${tenantId}-${Date.now()}.${fileExtension}`;
        formData.append("file", file, customFileName);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to upload file ${file.name}: ${response.status}`,
          );
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      return {
        success: true,
        data: results,
        message: "Files uploaded successfully!",
      };
    } catch (err) {
      console.error("Error uploading files:", err);
      return {
        success: false,
        error: err.message || "Failed to upload files",
      };
    }
  };

  const isTaskOverdue = (dueTime) => {
    if (!dueTime) return false;
    const dueDateTime = new Date(dueTime);
    const now = new Date();
    return dueDateTime < now;
  };

  const completeInternalTask = async (completionData) => {
    loading.value = true;
    error.value = null;
    try {
      const token = getAuthToken();
      const status = isTaskOverdue(completionData.task.dueTime)
        ? "overdue"
        : "completed";

      const updateData = {
        status,
        complete_Task_Note: completionData.notes || "",
      };

      if (completionData.image && completionData.image.id) {
        updateData.taskimage = completionData.image.id;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${completionData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: `Internal task marked as ${status}!`,
      };
    } catch (err) {
      console.error("Error completing internal task:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to complete internal task",
      };
    } finally {
      loading.value = false;
    }
  };

  const saveTaskDraft = async (draftData) => {
    loading.value = true;
    error.value = null;
    try {
      const token = getAuthToken();
      const updateData = {
        complete_Task_Note: draftData.notes || "",
      };

      if (draftData.image && draftData.image.id) {
        updateData.taskimage = draftData.image.id;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${draftData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`Failed to save draft: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: "Task draft saved successfully!",
      };
    } catch (err) {
      console.error("Error saving task draft:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to save task draft",
      };
    } finally {
      loading.value = false;
    }
  };

  const completeWorkOrderTask = async (completionData) => {
    loading.value = true;
    error.value = null;

    try {
      const token = getAuthToken();

      // Determine status based on due time - same logic as old work order
      const isOverdue =
        completionData.task?.dueTime &&
        new Date(completionData.task.dueTime) < new Date();
      const status = isOverdue ? "overdue" : "completed";

      // Build payload exactly like old work order
      const updateData = { status };

      // Add completion notes if provided
      if (completionData.notes) {
        updateData.completion_notes = completionData.notes;
      }

      // Map form data to task fields (same mapping as old work order)
      const formData = completionData.formData || {};
      const imageFileIds = completionData.imageFileIds || {};

      // Field mapping from old work order
      const fieldMapping = {
        // Core task fields
        description: "description",
        taskType: "taskType",
        employeeId: "employeeId",
        UsersId: "employeeId",
        dueTime: "dueTime",
        from: "from",
        title: "title",

        // Financial fields
        amountExpected: "amountExpected",
        amountCollected: "amountCollected",
        eAmountCollected: "eAmountCollected",
        paymentMode: "paymentMode",
        referenceNumber: "referenceNumber",

        // Location fields
        orgId: "orgId",
        orgLocation: "orgLocation",
        radiusInMeters: "radiusInMeters",

        // Technical fields
        snNumber: "snNumber",
        issueReport: "issueReport",
        partsReplaced: "partsReplaced",
        prodName: "prodName",
        deviceType: "deviceType",
        demo: "demo",
      };

      // Apply form data using field mapping
      Object.entries(formData).forEach(([key, value]) => {
        const mappedField = fieldMapping[key] || key;
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !Array.isArray(value) &&
          typeof value !== "object"
        ) {
          updateData[mappedField] = value;
        }
      });

      // Add image file IDs
      Object.entries(imageFileIds).forEach(([key, fileId]) => {
        if (fileId) {
          updateData[key] = fileId;
        }
      });

      // Add GPS coordinates if available
      const currentLocation = completionData.currentLocation;
      if (currentLocation?.lat !== null && currentLocation?.lng !== null) {
        updateData.currentLat = currentLocation.lat;
        updateData.currentLng = currentLocation.lng;
      }

      // Add any additional payload data
      if (completionData.payload) {
        Object.entries(completionData.payload).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            !updateData.hasOwnProperty(key)
          ) {
            updateData[key] = value;
          }
        });
      }

      console.log("Work Order Completion Payload:", updateData);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${completionData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access. Token might be expired.");
        }
        const errorData = await response.json();
        throw new Error(
          `Failed to complete work order: ${response.status} - ${
            errorData.errors?.[0]?.message ||
            errorData.message ||
            "Unknown error"
          }`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: `Work order marked as ${status}!`,
      };
    } catch (err) {
      console.error("Error completing work order:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to complete work order",
      };
    } finally {
      loading.value = false;
    }
  };

  const saveWorkOrderDraft = async (draftData) => {
    loading.value = true;
    error.value = null;

    try {
      const token = getAuthToken();

      // For draft, don't change status - just save form data
      const updateData = {};

      // Add completion notes if provided
      if (draftData.notes) {
        updateData.completion_notes = draftData.notes;
      }

      // Map form data to task fields (same as completion)
      const formData = draftData.formData || {};
      const imageFileIds = draftData.imageFileIds || {};

      // Field mapping from old work order
      const fieldMapping = {
        // Core task fields
        description: "description",
        taskType: "taskType",
        employeeId: "employeeId",
        UsersId: "employeeId",
        dueTime: "dueTime",
        from: "from",
        title: "title",

        // Financial fields
        amountExpected: "amountExpected",
        amountCollected: "amountCollected",
        eAmountCollected: "eAmountCollected",
        paymentMode: "paymentMode",
        referenceNumber: "referenceNumber",

        // Location fields
        orgId: "orgId",
        orgLocation: "orgLocation",
        radiusInMeters: "radiusInMeters",

        // Technical fields
        snNumber: "snNumber",
        issueReport: "issueReport",
        partsReplaced: "partsReplaced",
        prodName: "prodName",
        deviceType: "deviceType",
        demo: "demo",
      };

      // Apply form data using field mapping
      Object.entries(formData).forEach(([key, value]) => {
        const mappedField = fieldMapping[key] || key;
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !Array.isArray(value) &&
          typeof value !== "object"
        ) {
          updateData[mappedField] = value;
        }
      });

      // Add image file IDs
      Object.entries(imageFileIds).forEach(([key, fileId]) => {
        if (fileId) {
          updateData[key] = fileId;
        }
      });

      // Add GPS coordinates if available
      const currentLocation = draftData.currentLocation;
      if (currentLocation?.lat !== null && currentLocation?.lng !== null) {
        updateData.currentLat = currentLocation.lat;
        updateData.currentLng = currentLocation.lng;
      }

      // Add any additional payload data
      if (draftData.payload) {
        Object.entries(draftData.payload).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            !updateData.hasOwnProperty(key)
          ) {
            updateData[key] = value;
          }
        });
      }

      console.log("Work Order Draft Payload:", updateData);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${draftData.task.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access. Token might be expired.");
        }
        const errorData = await response.json();
        throw new Error(
          `Failed to save work order draft: ${response.status} - ${
            errorData.errors?.[0]?.message ||
            errorData.message ||
            "Unknown error"
          }`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: "Work order draft saved successfully!",
      };
    } catch (err) {
      console.error("Error saving work order draft:", err);
      error.value = err.message;
      return {
        success: false,
        error: err.message || "Failed to save work order draft",
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchWorkOrderDetails = async (assignFormId) => {
    try {
      const token = getAuthToken();
      const params = {
        "fields[]": [
          "formName",
          "custom_FormTemplate",
          "tenant.tenantName",
          "assignedOrgnization.orgName",
          "id",
        ],
      };

      const queryString = Object.keys(params)
        .map((key) =>
          Array.isArray(params[key])
            ? params[key].map((field) => `${key}=${field}`).join("&")
            : `${key}=${params[key]}`,
        )
        .join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${assignFormId}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (err) {
      console.error("Error fetching work order details:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch work order details.",
      };
    }
  };

  const fetchTaskDetails = async (taskId) => {
    try {
      const token = getAuthToken();

      // Only fetch the specific fields you need
      const fields = [
        "complete_Task_Note",
        "task_priority",
        "dueTime",
        "from",
        "taskimage",
        "status",
        "taskType",
        "description",
        "title",
        "employeeId.employeeId",
        "employeeId.assignedUser.first_name",
      ];

      const fieldsQuery = fields.map((field) => `fields[]=${field}`).join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tasks/${taskId}?${fieldsQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (err) {
      console.error("Error fetching task details:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch task details.",
      };
    }
  };

  const fetchTaskImageBlob = async (imageId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/assets/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Unauthorized access. Token might be expired.");
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      return {
        success: true,
        data: {
          id: imageId,
          url: imageUrl,
          blob: blob,
          type: blob.type,
          size: blob.size,
        },
      };
    } catch (err) {
      console.error("Error fetching task image blob:", err);
      return {
        success: false,
        error: err.message || "Failed to fetch task image.",
      };
    }
  };

  return {
    loading,
    error,
    completeInternalTask,
    completeWorkOrderTask,
    saveTaskDraft,
    uploadTaskImage,
    uploadTaskFiles,
    fetchWorkOrderDetails,
    fetchTaskDetails,
    fetchTaskImageBlob,
    getWorkOrdersFolderId,
  };
};
