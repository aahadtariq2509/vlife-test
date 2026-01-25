import { useState } from "react";
import { toast } from "react-hot-toast";
import { createDashboardAPI } from "@/lib/dashboard-api";
import {
  normalizeChildren,
  normalizeMappings,
  getMappingId,
} from "../../../fitness/widgets/utils/apiNormalizers";
import { createWidgetPayload } from "../../../fitness/widgets/utils/widgetTransformers";

export const useAddWidgetFlow = (accessToken, dashboardId, refreshWidgets) => {
  // Step state
  const [step, setStep] = useState(1);

  // Step 1: Attribute selection
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);
  const [selectedAttributeTemplateId, setSelectedAttributeTemplateId] =
    useState(null);

  // Step 2: Widget type selection
  const [mappings, setMappings] = useState([]);
  const [selectedWidgetTypeId, setSelectedWidgetTypeId] = useState(null);
  const [selectedWidgetMapping, setSelectedWidgetMapping] = useState(null);

  // Step 3: Child attributes selection
  const [childAttributes, setChildAttributes] = useState([]);
  const [selectedChildAttributeIds, setSelectedChildAttributeIds] = useState(
    []
  );
  const [minChildAttributes, setMinChildAttributes] = useState(null);
  const [maxChildAttributes, setMaxChildAttributes] = useState(null);
  const [hasChildAttributes, setHasChildAttributes] = useState(false);

  // Loading states
  const [isLoadingChildAttributes, setIsLoadingChildAttributes] =
    useState(false);

  // Clear all step data
  const clearAllStepData = () => {
    setStep(1);
    setSelectedAttributeId(null);
    setSelectedAttributeTemplateId(null);
    setChildAttributes([]);
    setSelectedChildAttributeIds([]);
    setMappings([]);
    setSelectedWidgetTypeId(null);
    setSelectedWidgetMapping(null);
    setMinChildAttributes(null);
    setMaxChildAttributes(null);
    setIsLoadingChildAttributes(false);
    setHasChildAttributes(false);
  };

  // Handle attribute selection in step 1
  const handleSelectAttribute = async (attrOrId) => {
    const attrId =
      typeof attrOrId === "object"
        ? attrOrId.attribute_id ?? attrOrId.id
        : attrOrId;
    const templateId =
      typeof attrOrId === "object"
        ? attrOrId.attribute_template_id ?? null
        : null;

    setSelectedAttributeId(attrId);
    if (templateId) setSelectedAttributeTemplateId(templateId);
    setChildAttributes([]);
    setSelectedChildAttributeIds([]);
    setMappings([]);
    setSelectedWidgetTypeId(null);
    setSelectedWidgetMapping(null);
    setMinChildAttributes(null);
    setMaxChildAttributes(null);
    setIsLoadingChildAttributes(true);
    setHasChildAttributes(false);

    const api = createDashboardAPI(accessToken);

    // Fetch mappings for widget selection (step 2)
    if (templateId) {
      try {
        const mappingsRes = await api.getWidgetMappings(templateId);
        const maps = normalizeMappings(mappingsRes);
        console.log(
          "[Widgets] getWidgetMappings on attribute select:",
          mappingsRes,
          "→ normalized:",
          maps
        );
        setMappings(Array.isArray(maps) ? maps : []);
      } catch (err) {
        console.error(
          "[Widgets] getWidgetMappings error on attribute select:",
          err
        );
        setMappings([]);
      }
    }

    // Fetch children for later use in step 3
    try {
      const res = await api.getDashboardChildAttributes(attrId);
      const children = normalizeChildren(res);
      console.log(
        "[Widgets] getDashboardChildAttributes:",
        res,
        "→ normalized:",
        children
      );
      const childrenArray = Array.isArray(children) ? children : [];
      setChildAttributes(childrenArray);
      setHasChildAttributes(childrenArray.length > 0);
    } catch (err) {
      console.warn(
        "[Widgets] getDashboardChildAttributes error (continuing):",
        err
      );
      setChildAttributes([]);
      setHasChildAttributes(false);
    } finally {
      setIsLoadingChildAttributes(false);
    }
  };

  // Handle widget selection in step 2
  const handleSelectWidget = (map) => {
    const mapId = getMappingId(map);
    setSelectedWidgetTypeId(mapId);
    setSelectedWidgetMapping(map);
    setMinChildAttributes(map.min ?? null);
    setMaxChildAttributes(map.max ?? null);
    console.log("[Widgets] Selected widget:", map, "with min/max:", {
      min: map.min,
      max: map.max,
    });
  };

  // Handle child attribute selection/deselection in step 3
  const handleToggleChildAttribute = (id, isChecked, isRadio) => {
    if (isRadio) {
      setSelectedChildAttributeIds([id]);
    } else {
      setSelectedChildAttributeIds((prev) => {
        if (isChecked) {
          // Check max limit before adding
          if (
            maxChildAttributes !== null &&
            prev.length >= maxChildAttributes
          ) {
            toast.error(
              `Maximum ${maxChildAttributes} child attribute(s) allowed for this widget type`
            );
            return prev;
          }
          return Array.from(new Set([...prev, id]));
        } else {
          // Check min limit when unchecking
          const newLength = prev.length - 1;
          if (minChildAttributes !== null && newLength < minChildAttributes) {
            toast.error(
              `At least ${minChildAttributes} child attribute(s) required for this widget type`
            );
            return prev;
          }
          return prev.filter((x) => x !== id);
        }
      });
    }
  };

  // Navigation handlers
  const handleNextFromStep1 = () => {
    if (isLoadingChildAttributes) return;
    setStep(2);
  };

  const handleBackFromStep2 = () => {
    setSelectedWidgetTypeId(null);
    setSelectedWidgetMapping(null);
    setMinChildAttributes(null);
    setMaxChildAttributes(null);
    setSelectedChildAttributeIds([]);
    setStep(1);
  };

  const handleBackFromStep3 = () => {
    setSelectedChildAttributeIds([]);
    setStep(2);
  };

  const handleProceedToChildren = () => {
    // If no child attributes are available, skip step 3 and create widget directly
    if (!hasChildAttributes || childAttributes.length === 0) {
      handleCreateWidget();
      return;
    }
    setStep(3);
  };

  // Create widget
  const handleCreateWidget = async (widgetsLength = 0) => {
    if (
      !dashboardId ||
      !selectedAttributeId ||
      !selectedWidgetTypeId ||
      !selectedWidgetMapping
    )
      return;

    try {
      const api = createDashboardAPI(accessToken);
      const payload = createWidgetPayload(
        selectedAttributeId,
        selectedWidgetTypeId,
        selectedChildAttributeIds,
        selectedWidgetMapping,
        widgetsLength
      );
      await api.createWidget(dashboardId, payload);
      toast.success("Widget created successfully");
      clearAllStepData();
      // Refresh widgets to reflect server state
      await refreshWidgets();
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to create widget");
      return false;
    }
  };

  // Validation for step 3
  const isStep3Valid = () => {
    return !(
      (minChildAttributes !== null &&
        minChildAttributes > 0 &&
        selectedChildAttributeIds.length < minChildAttributes) ||
      (maxChildAttributes !== null &&
        selectedChildAttributeIds.length > maxChildAttributes)
    );
  };

  return {
    // State
    step,
    selectedAttributeId,
    selectedWidgetTypeId,
    selectedWidgetMapping,
    childAttributes,
    selectedChildAttributeIds,
    mappings,
    minChildAttributes,
    maxChildAttributes,
    hasChildAttributes,
    isLoadingChildAttributes,

    // Actions
    clearAllStepData,
    handleSelectAttribute,
    handleSelectWidget,
    handleToggleChildAttribute,
    handleNextFromStep1,
    handleBackFromStep2,
    handleBackFromStep3,
    handleProceedToChildren,
    handleCreateWidget,
    isStep3Valid,
  };
};
