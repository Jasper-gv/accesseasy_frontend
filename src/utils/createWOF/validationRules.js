// Check if field is mandatory
export const isFieldMandatory = (field, userRole) => {
  const mandatory = field.roleBasedMandatory;
  const required = field.roleBasedRequired;
  const validationRequired = field.validations?.required;

  if (
    mandatory &&
    typeof mandatory === "object" &&
    mandatory[userRole] !== undefined
  ) {
    return mandatory[userRole];
  }

  if (
    required &&
    typeof required === "object" &&
    required[userRole] !== undefined
  ) {
    return required[userRole];
  }

  return validationRequired || false;
};

// Check if field is start date
const isStartDateField = (field) => {
  return field.key === "from" || field.label.toLowerCase().includes("start");
};

// Check if field is end date
const isEndDateField = (field) => {
  return (
    field.key === "dueTime" ||
    field.label.toLowerCase().includes("end") ||
    field.label.toLowerCase().includes("due")
  );
};

// Get field type as string
const getFieldTypeString = (fieldType) => {
  if (typeof fieldType === "object" && fieldType.date === true) {
    return "date";
  }
  return fieldType;
};

// Get validation rules for a field
export const getValidationRules = (field, userRole, formData) => {
  const rules = [];
  const validations = field.validations;
  const mandatory = isFieldMandatory(field, userRole);
  const fieldType = getFieldTypeString(field.type);

  // Required validation
  if (mandatory || validations?.required) {
    rules.push((v) =>
      !v && v !== 0
        ? validations?.message || `${field.label} is required.`
        : true,
    );
  }

  if (validations) {
    // Text/BigText validations
    if (fieldType === "text" || fieldType === "bigtext") {
      if (validations.minLength) {
        rules.push((v) => {
          if (v && v.length < validations.minLength) {
            return (
              validations.message || `Min length is ${validations.minLength}.`
            );
          }
          return true;
        });
      }
      if (validations.maxLength) {
        rules.push((v) => {
          if (v && v.length > validations.maxLength) {
            return (
              validations.message || `Max length is ${validations.maxLength}.`
            );
          }
          return true;
        });
      }
    }

    // Number validations
    if (fieldType === "number") {
      const toNum = (val) => {
        const n = Number(val);
        return Number.isFinite(n) ? n : null;
      };

      if (validations.min !== undefined) {
        rules.push((v) => {
          if (v === null || v === "" || v === undefined) return true;
          const n = toNum(v);
          if (n === null) return validations.message || "Must be a number.";
          return n < Number(validations.min)
            ? validations.message ||
                `Value must be at least ${validations.min}.`
            : true;
        });
      }

      if (validations.max !== undefined) {
        rules.push((v) => {
          if (v === null || v === "" || v === undefined) return true;
          const n = toNum(v);
          if (n === null) return validations.message || "Must be a number.";
          return n > Number(validations.max)
            ? validations.message || `Value must be at most ${validations.max}.`
            : true;
        });
      }

      // Optional: exact integer range helper if provided by schema
      if (
        validations.range &&
        Array.isArray(validations.range) &&
        validations.range.length === 2
      ) {
        const [minR, maxR] = validations.range;
        rules.push((v) => {
          if (v === null || v === "" || v === undefined) return true;
          const n = toNum(v);
          if (n === null) return validations.message || "Must be a number.";
          return n < Number(minR) || n > Number(maxR)
            ? validations.message ||
                `Value must be between ${minR} and ${maxR}.`
            : true;
        });
      }
    }

    // Date validations (simplified: keep format + enforce end/due > start)
    if (fieldType === "date") {
      if (validations.format) {
        rules.push((v) => {
          if (!v) return true;
          // If a custom format is specified, do a light check; otherwise skip strict regex
          if (validations.format === "YYYY-MM-DD") {
            return /^\d{4}-\d{2}-\d{2}$/.test(v)
              ? true
              : validations.message ||
                  `Date format must be ${validations.format}.`;
          }
          return true;
        });
      }

      if (isEndDateField(field)) {
        rules.push((v) => {
          if (!v) return true;
          if (!formData || typeof formData !== "object") return true;

          const endVal = new Date(v);

          const fallbackStartKey = [
            "from",
            "startDate",
            "start_date",
            "fromDate",
            "from_date",
            "expectedStartDate",
            "start",
          ].find(
            (k) =>
              Object.prototype.hasOwnProperty.call(formData, k) && formData[k],
          );

          const refKey = validations?.mustBeAfterField || fallbackStartKey;
          if (!refKey) return true;

          const startRaw = formData[refKey];
          if (!startRaw) return true;

          const startVal = new Date(startRaw);
          if (
            Number.isFinite(startVal.getTime()) &&
            Number.isFinite(endVal.getTime()) &&
            endVal <= startVal
          ) {
            return (
              validations?.message || `End/Due date must be after ${refKey}.`
            );
          }
          return true;
        });
      }
    }

    // Image validations
    if (fieldType === "image") {
      if (validations.maxSizeMB) {
        rules.push((v) => {
          if (v && v.size > validations.maxSizeMB * 1024 * 1024) {
            return (
              validations.message ||
              `Image size must be less than ${validations.maxSizeMB} MB.`
            );
          }
          return true;
        });
      }
      if (
        validations.fileTypeAllowed &&
        validations.fileTypeAllowed.length > 0
      ) {
        rules.push((v) => {
          if (v) {
            const fileExtension = v.name.split(".").pop().toLowerCase();
            if (!validations.fileTypeAllowed.includes(fileExtension)) {
              return (
                validations.message ||
                `Allowed types: ${validations.fileTypeAllowed.join(", ")}.`
              );
            }
          }
          return true;
        });
      }
    }

    // OTP/Happy Code validations
    if (
      (fieldType === "otp" || fieldType === "happy-code") &&
      validations.length
    ) {
      rules.push((v) => {
        if (v && String(v).length !== validations.length) {
          return (
            validations.message ||
            `Must be exactly ${validations.length} digits.`
          );
        }
        return true;
      });
    }
  }

  return rules;
};
