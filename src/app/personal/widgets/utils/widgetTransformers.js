/**
 * Widget data transformers for API integration
 */

export const formatWidgetNameFromCode = (code) => {
  if (!code || typeof code !== "string") return "Widget";
  return code
    .split("_")
    .map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(" ");
};

export const mapWidgetTypeToDisplay = (code) => {
  const typeMap = {
    progress_chart: "Progress Bar",
    pie_chart: "Pie Chart",
    bar_chart: "Bar Chart",
    line_chart: "Line Chart",
  };
  return typeMap[code] || code || "Widget";
};

export const mapApiWidgetToUI = (w, idx, attributes = []) => {
  // Find the attribute by attribute_id to get the display name
  const attribute = attributes.find(attr => attr.attribute_id === w.attribute_id);
  const attributeName = attribute?.display_name || attribute?.name || formatWidgetNameFromCode(w.widget_type?.code);

  return {
    id: String(w.id ?? idx + 1),
    title: attributeName,
    type: mapWidgetTypeToDisplay(w.widget_type?.code),
    code: w.widget_type?.code || "",
    visible: w.is_visible ?? true,
    position: w.display_order ?? idx + 1,
  };
};

export const sortWidgetsByPosition = (widgets) => {
  return [...widgets].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
};

export const createWidgetOrderPayload = (widgets) => {
  return widgets.map((w, idx) => ({
    id: Number(w.id),
    displayOrder: idx + 1,
  }));
};

export const createWidgetPayload = (
  selectedAttributeId,
  selectedWidgetTypeId,
  selectedChildAttributeIds,
  selectedWidgetMapping,
  widgetsLength
) => ({
  attributeId: Number(selectedAttributeId),
  widgetTypeId: Number(selectedWidgetTypeId),
  childAttributeIds: selectedChildAttributeIds.map((id) => String(id)),
  config: selectedWidgetMapping.config || [],
  calculation: selectedWidgetMapping.calculation || "avg",
  displayOrder: widgetsLength + 1,
});
