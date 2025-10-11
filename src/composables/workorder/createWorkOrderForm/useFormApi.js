// usecreateWorkoder.js
import { ref, computed } from "vue";
import { authService } from "../../../services/authService";
import { currentUserTenant } from "../../../utils/currentUserTenant";

export function useFormApi() {
  const formDetails = ref(null);
  const clients = ref([]);
  const users = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const submissionError = ref(null);

  const token = ref(authService.getToken());
  const tenantId = computed(() => currentUserTenant.getTenantId());

  const fetchFormDetails = async (formTemplateId) => {
    loading.value = true;
    error.value = null;

    try {
      if (!token.value)
        throw new Error("Authentication token not found. Please log in.");

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
        .map((key) => {
          if (Array.isArray(params[key]))
            return params[key].map((field) => `${key}=${field}`).join("&");
          return `${key}=${params[key]}`;
        })
        .join("&");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant_template/${formTemplateId}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
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
      formDetails.value = data.data;
    } catch (err) {
      console.error("Error fetching form details:", err);
      error.value =
        err.message || "Failed to fetch form details. Please try again.";
    } finally {
      loading.value = false;
    }
  };

  const fetchDropdownData = async () => {
    if (!token.value || !tenantId.value) {
      console.warn(
        "Token or Tenant ID not available for fetching dropdown data.",
      );
      return;
    }

    try {
      // Clients
      const clientParams = new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "orgName"],
        ["fields[]", "id"],
        ["fields[]", "orgId.email"],
        ["filter[_and][0][_and][0][tenant][tenantId][_eq]", tenantId.value],
        ["filter[_and][1][status][_neq]", "archived"],
      ]).toString();

      const clientsResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/organization?${clientParams}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );
      if (!clientsResponse.ok) throw new Error("Failed to fetch clients");

      const clientsData = await clientsResponse.json();
      clients.value = clientsData.data.map((c) => ({
        orgName: c.orgName,
        id: c.id,
      }));

      // Employees (personalModule)
      const employeeParams = new URLSearchParams([
        ["limit", "-1"],
        ["fields[]", "employeeId"],
        ["fields[]", "assignedUser.first_name"],
        ["fields[]", "assignedUser.last_name"],
        ["fields[]", "id"],
        [
          "filter[_and][0][assignedUser][tenant][tenantId][_eq]",
          tenantId.value,
        ],
      ]).toString();

      const usersResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/items/personalModule?${employeeParams}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );
      if (!usersResponse.ok) throw new Error("Failed to fetch employees");

      const usersJson = await usersResponse.json();
      const pmList = usersJson.data || [];
      const personalIds = pmList.map((u) => u.id).filter(Boolean);

      const today = new Date().toISOString().slice(0, 10);
      const attendanceMap = new Map();
      if (personalIds.length > 0) {
        const attParams = new URLSearchParams([
          ["limit", "-1"],
          ["fields[]", "id"],
          ["fields[]", "status"],
          ["fields[]", "employeeId.id"],
          ["fields[]", "employeeId.employeeId"],
          ["filter[_and][0][date][_eq]", today],
          ["filter[_and][1][employeeId][id][_in]", personalIds.join(",")],
        ]).toString();

        const attRes = await fetch(
          `${import.meta.env.VITE_API_URL}/items/attendance?${attParams}`,
          {
            headers: { Authorization: `Bearer ${token.value}` },
          },
        );

        if (attRes.ok) {
          const attJson = await attRes.json();
          (attJson.data || []).forEach((a) => {
            attendanceMap.set(a?.employeeId?.id, { status: a?.status || null });
          });
        } else {
          console.warn(
            "Attendance fetch failed, proceeding without status badges",
          );
        }
      }

      const statusLabel = (s) =>
        s === "in"
          ? "Punched In"
          : s === "out"
            ? "Punched Out"
            : "Not Punched In";
      const statusColor = (s) =>
        s === "in" ? "green" : s === "out" ? "red" : "orange";

      users.value = pmList.map((u) => {
        const first = u.assignedUser?.first_name || "";
        const last = u.assignedUser?.last_name || "";
        const empId = u.employeeId || "N/A";
        const name = `${first} ${last}`.trim();
        const display = `${name} (${empId})`;

        const att = attendanceMap.get(u.id) || { status: null };
        return {
          id: u.id,
          employeeId: empId,
          firstName: display,
          label: display,
          attendance: {
            status: att.status,
            label: statusLabel(att.status),
            color: statusColor(att.status),
          },
          assignedUser: u.assignedUser,
        };
      });
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const normalizeDate = (v) => {
    if (!v) return v;
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === "string") {
      const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1];
    }
    return v;
  };

  const toIsoMidday = (input, formDataContext = {}) => {
    if (!input) return null;
    if (typeof input === "string") {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(input)) {
        return input;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return `${input}T12:00:00`;
      }
      if (
        formDataContext[`${input}_date`] &&
        formDataContext[`${input}_time`]
      ) {
        const date = formDataContext[`${input}_date`];
        const time = formDataContext[`${input}_time`];
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time)) {
          return `${date}T${time}:00`;
        }
      }
    }
    if (input instanceof Date && !isNaN(input)) {
      return input.toISOString().slice(0, 19);
    }
    return input;
  };

  const getWorkOrdersFolderId = async () => {
    try {
      const tokenValue = token.value;
      const tenantIdValue = tenantId.value;
      if (!tenantIdValue) throw new Error("Tenant ID not found");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/items/tenant?filter[tenantId][_eq]=${tenantIdValue}&fields[]=foldersId`,
        { headers: { Authorization: `Bearer ${tokenValue}` } },
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

  const uploadImage = async (file) => {
    try {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG, JPEG, or PNG files are allowed");
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("Image size must be less than 5MB");
      }

      const formData = new FormData();
      const tenantIdValue = tenantId.value;
      const workOrdersFolderId = await getWorkOrdersFolderId();
      if (workOrdersFolderId) {
        formData.append("folder", workOrdersFolderId);
      }
      const fileExtension = file.name.split(".").pop();
      const customFileName = `task-${tenantIdValue}-${Date.now()}.${fileExtension}`;
      formData.append("file", file, customFileName);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const result = await response.json();
      return result.data.id; // Return file ID
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const submitForm = async (formData, formDetails, clients) => {
    try {
      const determinedInitialStatus = "pending";
      const tokenValue = token.value;
      const apiUrl = `${import.meta.env.VITE_API_URL}/items/tasks`;

      const payloads = Array.isArray(formData) ? formData : [formData];

      const processedPayloads = await Promise.all(
        payloads.map(async (data) => {
          let uploadedImageId = null;
          if (data.taskimage && data.taskimage.length > 0) {
            uploadedImageId = await uploadImage(data.taskimage[0]);
          }

          const getFirstPresent = (obj, keys) => {
            for (const k of keys) {
              const v = obj?.[k];
              if (v !== undefined && v !== null && v !== "") return v;
            }
            return undefined;
          };

          const payload = {
            assignFormId: formDetails?.id,
            status: determinedInitialStatus,
            tenant: tenantId.value,
            taskType: formDetails?.formName,
            ...(data?.title
              ? { title: data.title }
              : formDetails?.formName
                ? { title: formDetails.formName }
                : {}),
            ...(data.description && { description: data.description }),
            ...(uploadedImageId && { taskimage: uploadedImageId }),
            ...(data.task_priority && { task_priority: data.task_priority }),
            ...(data.amountExpected && { amountExpected: data.amountExpected }),
            ...(data.amountCollected && {
              amountCollected: data.amountCollected,
            }),
            ...(data.demo && { demo: data.demo }),
            ...(data.eAmountCollected && {
              eAmountCollected: data.eAmountCollected,
            }),
            ...(data.issueReport && { issueReport: data.issueReport }),
            ...(data.partsReplaced && { partsReplaced: data.partsReplaced }),
            ...(data.prodName && { prodName: data.prodName }),
            ...(data.orgId && { orgId: data.orgId }),
            ...(data.snNumber && { snNumber: data.snNumber }),
            ...(data.currentLat && { currentLat: data.currentLat }),
            ...(data.currentLng && { currentLng: data.currentLng }),
            ...(data.radiusInMeters && { radiusInMeters: data.radiusInMeters }),
            ...(data.lat && { lat: data.lat }),
            ...(data.lng && { lng: data.lng }),
            ...(data.happy_code && { happy_code: data.happy_code }),
          };

          const employeeIdAlt = getFirstPresent(data, [
            "UsersId",
            "employeeId",
            "empId",
            "assignedEmployee",
            "assignedUserId",
          ]);
          if (employeeIdAlt !== undefined) payload.employeeId = employeeIdAlt;

          const startDateAlt = getFirstPresent(data, [
            "from",
            "startDate",
            "start_date",
            "fromDate",
            "from_date",
            "expectedStartDate",
            "start",
          ]);
          if (startDateAlt !== undefined) {
            payload.from = toIsoMidday(startDateAlt, data);
          }

          const dueTimeAlt = getFirstPresent(data, [
            "dueTime",
            "due_time",
            "dueDate",
            "due_date",
            "endDate",
            "end_date",
            "toDate",
            "to_date",
            "expectedEndDate",
            "end",
          ]);
          if (dueTimeAlt !== undefined) {
            payload.dueTime = toIsoMidday(dueTimeAlt, data);
          }

          Object.keys(payload).forEach((key) => {
            if (payload[key] === undefined) delete payload[key];
          });

          return payload;
        }),
      );

      console.log("Final Payload Sent:", processedPayloads);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenValue}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          processedPayloads.length === 1
            ? processedPayloads[0]
            : processedPayloads,
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to submit task: ${response.statusText} - ${errorData.message || "Unknown error"}`,
        );
      }

      return await response.json();
    } catch (err) {
      submissionError.value =
        err.message || "Failed to submit form. Please try again.";
      throw err;
    }
  };

  return {
    formDetails,
    clients,
    users,
    loading,
    error,
    submissionError,
    fetchFormDetails,
    fetchDropdownData,
    submitForm,
    uploadImage,
  };
}
