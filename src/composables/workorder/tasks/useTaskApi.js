import { ref } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";
import { useTaskFilters } from "@/composables/workorder/tasks/useTaskFilters";

export function useTaskApi() {
  const API_TOKEN = authService.getToken();
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
  const API_ENDPOINTS = {
    tasks: "/items/tasks",
    branches: "/items/branch",
    formTemplates: "/items/tenant_template",
  };

  const { buildTaskFilterParams } = useTaskFilters();

  // State
  const tasks = ref([]);
  const branches = ref([]);
  const formTemplates = ref([]);
  const loading = ref(false);
  const error = ref("");
  const totalItems = ref(0);
  const taskCounts = ref({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const statusCounts = ref({
    total: 0,
    pending: 0,
    overdue: 0,
    completed: 0,
  });

  // Validate credentials
  const validateCredentials = async () => {
    if (!API_TOKEN) {
      throw new Error("Authentication token not found. Please log in again.");
    }
    const tenantId = await currentUserTenant.getTenantIdAsync();
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please check your session.");
    }
    return tenantId;
  };

  // Methods
  const fetchTaskAggregateCount = async (filters = {}) => {
    try {
      const tenantId = await validateCredentials();
      const params = {
        "aggregate[count]": "id",
        [`filter[tenant][tenantId][_eq]`]: tenantId,
        ...filters,
      };
      const queryString = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.tasks}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      totalItems.value = Number(data?.data?.[0]?.count?.id) || 0;
    } catch (err) {
      console.error("Error fetching aggregate count:", err);
      totalItems.value = 0;
      throw err;
    }
  };

  const fetchStatusAggregateCounts = async (filters = {}) => {
    try {
      const tenantId = await validateCredentials();
      const params = {
        "aggregate[count]": "id",
        "groupBy[]": "status",
        [`filter[tenant][tenantId][_eq]`]: tenantId,
        ...filters,
      };
      const queryString = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.tasks}?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const groups = data?.data || [];
      const byStatus = Object.fromEntries(
        groups.map((g) => [g.status, Number(g?.count?.id) || 0]),
      );
      statusCounts.value = {
        total: Object.values(byStatus).reduce((a, b) => a + b, 0),
        pending: byStatus.pending || 0,
        overdue: byStatus.overdue || 0,
        completed: byStatus.completed || 0,
      };
    } catch (err) {
      console.error("Error fetching status aggregates:", err);
      statusCounts.value = {
        total: 0,
        pending: 0,
        overdue: 0,
        completed: 0,
      };
    }
  };

  const fetchTasks = async ({
    page = 20,
    itemsPerPage = 25,
    sortBy = "date_created",
    sortDirection = "desc",
    filters = {},
    skipAggregateCount = false,
  } = {}) => {
    loading.value = true;
    error.value = "";
    try {
      const tenantId = await validateCredentials();
      if (!skipAggregateCount) {
        await fetchTaskAggregateCount(filters);
        await fetchStatusAggregateCounts(buildTaskFilterParams(true));
      }
      const fields = [
        "radiusInMeters",
        "taskType",
        "status",
        "title",
        "description",
        "employeeId.employeeId",
        "employeeId.assignedUser.first_name",
        "tenant.tenantName",
        "dueTime",
        "from",
        "orgId.orgName",
        "orgLocation.locdetail",
        "orgLocation.locSize",
        "task_priority",
        "assignFormId",
        "amountExpected",
        "clientOtp",
        "client_HappyCode",
      ];
      let url = `${API_BASE_URL}${API_ENDPOINTS.tasks}?filter[tenant][tenantId][_eq]=${tenantId}&fields[]=${fields.join(
        "&fields[]=",
      )}`;
      url += `&page=${page}&limit=${itemsPerPage}`;
      if (sortBy) {
        url += `&sort=${sortDirection === "desc" ? "-" : ""}${sortBy}`;
      }
      const queryString = Object.keys(filters)
        .map((key) => `${key}=${encodeURIComponent(filters[key])}`)
        .join("&");
      if (queryString) {
        url += `&${queryString}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      if (data && data.data) {
        tasks.value = data.data.map((task) => ({
          id: task.id || Math.random().toString(36).substr(2, 9),
          title: task.title || "",
          description: task.description || "",
          taskType: task.taskType || "",
          status: task.status || "pending",
          assignFormId: task.assignFormId,
          employeeId: task.employeeId?.employeeId || "",
          assignedUser: task.employeeId?.assignedUser?.first_name || "",
          orgName: task.orgId?.orgName || "",
          dueTime: task.dueTime || "",
          from: task.from || "",
          tenantName: task.tenant?.tenantName || "",
          radiusInMeters: task.radiusInMeters || null,
          locationName: task.orgLocation?.locdetail?.locationName || "",
          address: task.orgLocation?.locdetail?.address || "",
          pincodes: task.orgLocation?.locdetail?.pincodes || [],
          locSize: task.orgLocation?.locSize || "",
          task_priority: task.task_priority || "medium",
          amountExpected: task.amountExpected || null,
          clientOtp: task.clientOtp || "",
          client_HappyCode: task.client_HappyCode || "",
        }));
        calculateTaskCounts();
      } else {
        tasks.value = [];
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      error.value =
        err.message ||
        "Failed to load tasks. Please check your connection and try again.";
      tasks.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchBranches = async () => {
    try {
      const tenantId = await validateCredentials();
      const url = `${API_BASE_URL}${API_ENDPOINTS.branches}?fields[]=id&fields[]=branchName&filter[tenant][tenantId][_eq]=${tenantId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data) {
        branches.value = data.data.map((branch) => ({
          id: branch.id,
          branchName: branch.branchName || "",
        }));
      } else {
        branches.value = [];
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      throw err;
    }
  };

  const fetchFormTemplates = async () => {
    try {
      const tenantId = await validateCredentials();
      const url = `${API_BASE_URL}${API_ENDPOINTS.formTemplates}?fields[]=id&fields[]=formName&filter[tenant][tenantId][_eq]=${tenantId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data) {
        formTemplates.value = data.data.map((form) => ({
          id: form.id,
          formName: form.formName || "",
        }));
      } else {
        formTemplates.value = [];
      }
    } catch (err) {
      console.error("Error fetching form templates:", err);
      throw err;
    }
  };

  const deleteSelectedTasks = async (taskIds) => {
    if (!taskIds || taskIds.length === 0) {
      error.value = "No tasks selected for deletion.";
      return false;
    }
    try {
      const tenantId = await validateCredentials();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.tasks}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keys: taskIds,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.errors?.[0]?.message ||
            `HTTP error! status: ${response.status}`,
        );
      }
      await fetchTasks();
      return true;
    } catch (err) {
      console.error("Error deleting tasks:", err);
      error.value = err.message || "Failed to delete tasks. Please try again.";
      return false;
    }
  };

  const calculateTaskCounts = () => {
    const allTasks = tasks.value;
    taskCounts.value = {
      total: totalItems.value,
      pending: allTasks.filter((t) => t.status === "pending").length,
      inProgress: allTasks.filter((t) => t.status === "inprogress").length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      overdue: allTasks.filter((t) => t.status === "overdue").length,
    };
  };

  return {
    tasks,
    branches,
    formTemplates,
    loading,
    error,
    totalItems,
    taskCounts,
    statusCounts,
    fetchStatusAggregateCounts,
    fetchTasks,
    fetchBranches,
    fetchFormTemplates,
    deleteSelectedTasks,
  };
}
