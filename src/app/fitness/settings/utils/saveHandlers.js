import { apiClient } from "@/lib/api-client";
import { createDashboardAPI } from "@/lib/dashboard-api";
import { calculateDayOfYear } from "@/lib/dashboard-utils";

/**
 * Handles saving blood pressure values (systolic/diastolic)
 * Extracted from the 133-line handleSave function
 */
export async function saveBloodPressure(modalData, formValues, dashboardId) {
  const attributeId = modalData.attributeId || modalData.id;
  const childId =
    modalData.childId ||
    (modalData.id && modalData.type === "child" ? modalData.id : null);
  const targetAttributeId = childId || attributeId;

  const systolic = formValues.systolic || "";
  const diastolic = formValues.diastolic || "";
  let valueToSave = "";

  if (systolic && diastolic) {
    valueToSave = `${systolic},${diastolic}`;
  } else if (systolic || diastolic) {
    valueToSave = `${systolic || ""},${diastolic || ""}`;
  }

  const timestamp = new Date().toISOString();
  const requestBody = {
    attributeId: targetAttributeId,
    value: String(valueToSave || ""),
    timestamp: timestamp,
  };

  // Add dayOfYear if is_multivalue is false
  if (modalData.is_multivalue === false || modalData.is_multi_value === false) {
    requestBody.dayOfYear = calculateDayOfYear(new Date());
  }

  console.log("Saving blood pressure value:", requestBody);

  await apiClient.postAuth(
    `/api/dashboards/attribute-values/${dashboardId}`,
    requestBody
  );

  return requestBody;
}

/**
 * Updates a target attribute value (value_type === "target")
 * Extracted from the handleSave function
 */
export async function updateTargetAttribute(modalData, valueToSave, dashboardId) {
  const attributeId = modalData.attributeId || modalData.id;
  const childId =
    modalData.childId ||
    (modalData.id && modalData.type === "child" ? modalData.id : null);
  const targetAttributeId = childId || attributeId;

  const requestBody = {
    attribute_id: targetAttributeId,
    displayName: modalData.display_name || modalData.name,
    unit: modalData.unit || "",
    value_type: modalData.value_type,
    target_value_id: modalData.target_value_id || modalData.target_read,
    targetValue: String(valueToSave || ""),
  };

  console.log("Updating target value:", requestBody);

  await apiClient.putAuth(
    `/api/dashboards/attributes/update/${dashboardId}`,
    requestBody
  );

  return requestBody;
}

/**
 * Adds a new attribute value to the dashboard
 * Extracted from the handleSave function
 */
export async function addAttributeValue(modalData, valueToSave, dashboardId) {
  const attributeId = modalData.attributeId || modalData.id;
  const childId =
    modalData.childId ||
    (modalData.id && modalData.type === "child" ? modalData.id : null);
  const targetAttributeId = childId || attributeId;

  const timestamp = new Date().toISOString();
  const requestBody = {
    attributeId: targetAttributeId,
    value: String(valueToSave || ""),
    timestamp: timestamp,
  };

  // Add dayOfYear if is_multivalue is false
  if (modalData.is_multivalue === false || modalData.is_multi_value === false) {
    requestBody.dayOfYear = calculateDayOfYear(new Date());
  }

  console.log("Saving attribute value:", requestBody);

  await apiClient.postAuth(
    `/api/dashboards/attribute-values/${dashboardId}`,
    requestBody
  );

  return requestBody;
}

/**
 * Refreshes dashboard data after save operations
 * Extracted from the handleSave function
 */
export async function refreshDashboardData(dashboardId, accessToken) {
  try {
    const api = createDashboardAPI(accessToken);
    const response = await api.fetchDashboardData(dashboardId);
    const dashboardAttributes = response.data?.dashboard_attributes || [];
    return dashboardAttributes;
  } catch (refreshErr) {
    console.error("Error refreshing dashboard data:", refreshErr);
    throw refreshErr;
  }
}

/**
 * Deletes an attribute value from the dashboard
 * Used to remove historical entries
 */
export async function deleteAttributeValue(valueId, dashboardId) {
  if (!valueId || !dashboardId) {
    throw new Error("Missing valueId or dashboardId");
  }

  await apiClient.deleteAuth(
    `/api/dashboards/attribute-values/${dashboardId}/${valueId}`
  );

  return { success: true };
}

/**
 * Updates an existing attribute value
 * Used when editing historical entries
 */
export async function updateAttributeValue(valueId, modalData, valueToSave, timestamp, dashboardId) {
  if (!valueId || !dashboardId) {
    throw new Error("Missing valueId or dashboardId");
  }

  const requestBody = {
    value: String(valueToSave || ""),
    timestamp: timestamp || new Date().toISOString(),
  };

  await apiClient.putAuth(
    `/api/dashboards/attribute-values/${dashboardId}/${valueId}`,
    requestBody
  );

  return requestBody;
}

/**
 * Extracts the value to save from form values
 * Handles special cases like blood pressure and multi-field forms
 */
export function extractValueFromForm(modalData, formValues) {
  let valueToSave = formValues.value;

  // Special handling for blood pressure
  if (
    modalData.name === "blood_pressure" ||
    modalData.display_name?.toLowerCase().includes("blood pressure")
  ) {
    const systolic = formValues.systolic || "";
    const diastolic = formValues.diastolic || "";
    if (systolic && diastolic) {
      valueToSave = `${systolic},${diastolic}`;
    } else if (systolic || diastolic) {
      valueToSave = `${systolic || ""},${diastolic || ""}`;
    } else {
      valueToSave = "";
    }
  } else if (valueToSave === undefined) {
    // If no direct 'value' field, check if we have field-specific values
    const fieldKeys = Object.keys(formValues);
    if (fieldKeys.length > 0) {
      // If there's only one field, use its value directly
      if (fieldKeys.length === 1) {
        valueToSave = formValues[fieldKeys[0]];
      } else {
        // If multiple fields, serialize as JSON string or use the first available value
        const firstKey = fieldKeys.find(
          (key) => formValues[key] !== undefined
        );
        valueToSave = firstKey
          ? formValues[firstKey]
          : JSON.stringify(formValues);
      }
    }
  }

  return valueToSave;
}
