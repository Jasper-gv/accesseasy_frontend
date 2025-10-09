import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Helper functions for formatting data
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  switch (status.toLowerCase()) {
    case "inprogress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "pending":
      return "Pending";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const formatTaskType = (type) => {
  if (!type) return "Unknown";
  switch (type) {
    case "siteVisit":
      return "Site Visit";
    case "moneyCollection":
      return "Money Collection";
    case "installation":
      return "Installation";
    case "service":
      return "Service";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

/**
 * Formats raw task data into a human-readable format for export.
 * @param {Array} rawData - The raw task data from the API.
 * @returns {Array} Formatted data with proper headers.
 */
export const getFormattedExportData = (rawData) => {
  return rawData.map((task) => {
    const formattedTask = {
      Title: task.title || "Untitled Task",
      Description: task.description || "No description available",
      "Task Type": formatTaskType(task.taskType),
      Status: formatStatus(task.status),
      "Assigned User":
        task.employeeId?.assignedUser?.first_name || "Unassigned",
      "Client Name": task.orgId?.orgName || "No Client",
      "Date Created": formatDate(task.date_created),
      "Amount Collected": task.amountCollected || 0,
      "Amount Expected": task.amountExpected || 0,
      "Current Latitude": task.currentLat || "N/A",
      "Current Longitude": task.currentLng || "N/A",
      Demo: task.demo || "N/A",
      "Device Type": task.deviceType || "N/A",
      "Due Time": task.dueTime || "N/A",
      "E-Amount Collected": task.eAmountCollected || 0,
      From: task.from || "N/A",
      "Issue Report": task.issueReport || "N/A",
      Latitude: task.lat || "N/A",
      Longitude: task.lng || "N/A",
      "Payment Mode": task.paymentMode || "N/A",
      "Radius in Meters": task.radiusInMeters || 0,
      "Reference Number": task.referenceNumber || "N/A",
      "SN Number": task.snNumber || "N/A",
      "Product Name": task.prodName?.productName || "N/A",
      "Location Type": task.orgLocation?.locType || "N/A",
      "Tenant Name": task.tenant?.tenantName || "N/A",
    };

    // If you want ALL data (including numbers) to be left-aligned in Excel,
    // convert all values to strings here. Be aware this might affect numerical operations in Excel.
    /*
    for (const key in formattedTask) {
      if (Object.hasOwnProperty.call(formattedTask, key)) {
        formattedTask[key] = String(formattedTask[key]);
      }
    }
    */

    return formattedTask;
  });
};

/**
 * Generates a consistent filename for exported reports.
 * @param {string} type - The file type (e.g., 'csv', 'excel', 'pdf').
 * @returns {string} The generated filename.
 */
export const generateFileName = (type) => {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "");
  let extension = type;
  if (type === "excel") {
    extension = "xlsx"; // Ensure .xlsx extension for Excel files
  }
  return `WorkOrders_Report_${date}_${time}.${extension}`;
};

/**
 * Exports data to a CSV file.
 * @param {Array} data - The formatted data to export.
 * @param {string} filename - The desired filename.
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((value) => {
        const stringValue = String(value);
        return `"${stringValue.replace(/"/g, '""')}"`; // Escape double quotes
      })
      .join(","),
  );
  const csvContent = [header, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(
      "Your browser does not support downloading files directly. Please copy the content manually.",
    );
    console.log(csvContent);
  }
};

/**
 * Exports data to an Excel file (requires 'xlsx' library).
 * @param {Array} data - The formatted data to export.
 * @param {string} filename - The desired filename.
 */
export const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);

  // --- Excel Column Widths (Header Spacing) ---
  // Define column widths in pixels (wpx) or characters (wch)
  // This array should match the order of your headers in getFormattedExportData
  ws["!cols"] = [
    { wpx: 50 }, // ID
    { wpx: 100 }, // Title
    { wpx: 180 }, // Description
    { wpx: 90 }, // Task Type
    { wpx: 80 }, // Status
    { wpx: 120 }, // Assigned User
    { wpx: 120 }, // Client Name
    { wpx: 100 }, // Date Created
    { wpx: 100 }, // Amount Collected
    { wpx: 100 }, // Amount Expected
    { wpx: 100 }, // Current Latitude
    { wpx: 100 }, // Current Longitude
    { wpx: 60 }, // Demo
    { wpx: 90 }, // Device Type
    { wpx: 90 }, // Due Time
    { wpx: 100 }, // E-Amount Collected
    { wpx: 60 }, // From
    { wpx: 120 }, // Issue Report
    { wpx: 90 }, // Latitude
    { wpx: 90 }, // Longitude
    { wpx: 100 }, // Payment Mode
    { wpx: 100 }, // Radius in Meters
    { wpx: 120 }, // Reference Number
    { wpx: 100 }, // SN Number
    { wpx: 120 }, // Product Name
    { wpx: 120 }, // Organization Name
    { wpx: 100 }, // Location Type
    { wpx: 100 }, // Tenant Name
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Work Orders");
  XLSX.writeFile(wb, filename, { bookType: "xlsx", type: "buffer" });
};

/**
 * Exports data to a PDF file (requires 'jspdf' and 'jspdf-autotable' libraries).
 * @param {Array} data - The formatted data to export.
 * @param {string} filename - The desired filename.
 */
export const exportToPDF = (data, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const doc = new jsPDF("landscape");

  // ✅ Explicit headers and body
  const headers = Object.keys(data[0]);
  const body = data.map((row) => headers.map((h) => row[h]));

  const now = new Date();
  const generationDate = now.toLocaleString();

  doc.autoTable({
    head: [headers],
    body: body,
    startY: 20,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      overflow: "linebreak",
      halign: "left",
      valign: "middle",
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [71, 85, 105],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      Description: { minCellWidth: 35, cellWidth: "auto" },
      "Issue Report": { minCellWidth: 25, cellWidth: "auto" },
      "Product Name": { minCellWidth: 25, cellWidth: "auto" },
      "Organization Name": { minCellWidth: 25, cellWidth: "auto" },
      "Location Type": { minCellWidth: 20, cellWidth: "auto" },
      "Tenant Name": { minCellWidth: 20, cellWidth: "auto" },
    },
    tableWidth: "auto",
    didDrawPage: (data) => {
      let str = "Page " + doc.internal.getNumberOfPages();
      if (typeof doc.putTotalPages === "function") {
        str = str + " of " + doc.putTotalPages();
      }
      doc.setFontSize(8);
      doc.text(
        str,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10,
      );
      doc.text(
        `Generated: ${generationDate}`,
        doc.internal.pageSize.width - data.settings.margin.right,
        doc.internal.pageSize.height - 10,
        { align: "right" },
      );
    },
  });

  if (typeof doc.putTotalPages === "function") {
    doc.putTotalPages(doc.internal.getNumberOfPages());
  }

  doc.save(filename);
};
