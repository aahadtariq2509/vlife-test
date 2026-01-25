import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createDashboardAPI } from "@/lib/dashboard-api";
import {
  mapApiWidgetToUI,
  sortWidgetsByPosition,
  createWidgetOrderPayload,
} from "../utils/widgetTransformers";
import { normalizeAttributes } from "../utils/apiNormalizers";

export const useWidgetManagement = (isAuthenticated, accessToken) => {
  const [widgets, setWidgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialOrder, setInitialOrder] = useState([]);
  const [isReordered, setIsReordered] = useState(false);
  const [dashboardId, setDashboardId] = useState(null);
  const [attributes, setAttributes] = useState([]);

  // Fetch widgets from API
  useEffect(() => {
    const fetchWidgets = async () => {
      if (!isAuthenticated || !accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const api = createDashboardAPI(accessToken);

        // Get dashboards, find the user's OWN fitness dashboard (not shared ones)
        // CRITICAL: Widgets should ALWAYS use the owner's dashboard, never shared dashboards
        const dashboardsResponse = await api.fetchDashboards(10, 0);
        const fitnessDashboard = dashboardsResponse.data.dashboards.find(
          (d) =>
            (d.category === "fitness" ||
              d.name?.toLowerCase().includes("fitness")) &&
            !d.is_shared_dashboard // Exclude shared dashboards
        );

        if (!fitnessDashboard) {
          throw new Error("Fitness dashboard not found");
        }

        const currentDashboardId = fitnessDashboard.id;
        setDashboardId(currentDashboardId);

        // Fetch widgets for the selected dashboard
        const dashboardData = await api.fetchDashboardData(currentDashboardId);
        console.log("[Widgets] fetchDashboardData response:", dashboardData);
        const apiWidgets = dashboardData?.data?.widgets || [];
        const dashboardAttributes = dashboardData?.data?.dashboard_attributes || [];

        // Map API widgets to UI model with attributes for name lookup
        const mapped = apiWidgets.map((w, idx) => mapApiWidgetToUI(w, idx, dashboardAttributes));

        // Sort and set widgets
        const sorted = sortWidgetsByPosition(mapped);
        setWidgets(sorted);
        setInitialOrder(sorted.map((w) => w.id));
        setIsReordered(false);

        // Fetch attributes for the dashboard
        try {
          const attrs = await api.getDashboardAttributes(currentDashboardId);
          const list = normalizeAttributes(attrs);
          console.log(
            "[Widgets] getDashboardAttributes on page load:",
            attrs,
            "→ normalized:",
            list
          );
          setAttributes(Array.isArray(list) ? list : []);
        } catch (attrErr) {
          console.error(
            "[Widgets] getDashboardAttributes error on page load:",
            attrErr
          );
          setAttributes([]);
        }
      } catch (err) {
        console.error("[Widgets] Error loading widgets:", err);
        setError(err.message || "Failed to load widgets");
        toast.error(err.message || "Failed to load widgets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWidgets();
  }, [isAuthenticated, accessToken]);

  // Handle drag reorder
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updated = items.map((item, idx) => ({ ...item, position: idx + 1 }));
    setWidgets(updated);

    // Enable Save only if order differs from initial
    const newOrder = updated.map((w) => w.id);
    const changed =
      newOrder.length !== initialOrder.length ||
      newOrder.some((id, i) => id !== initialOrder[i]);
    setIsReordered(changed);
  };

  // Delete widget
  const handleDelete = async (widgetId) => {
    if (!widgetId || !dashboardId) return;
    try {
      const api = createDashboardAPI(accessToken);
      await api.deleteWidget(dashboardId, widgetId);
      const filtered = widgets.filter((item) => item.id !== widgetId);
      const updated = filtered.map((item, idx) => ({
        ...item,
        position: idx + 1,
      }));
      setWidgets(updated);
      setInitialOrder(updated.map((w) => w.id));
      setIsReordered(false);
      toast.success("Widget deleted!");
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to delete widget");
      return false;
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!isReordered || !dashboardId) return;
    try {
      const payload = createWidgetOrderPayload(widgets);
      const api = createDashboardAPI(accessToken);
      await api.updateWidgetsOrder(dashboardId, payload);
      setInitialOrder(widgets.map((w) => w.id));
      setIsReordered(false);
      toast.success("Changes saved successfully!");
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to save order");
      return false;
    }
  };

  // Refresh widgets from API
  const refreshWidgets = async () => {
    if (!dashboardId || !accessToken) return;
    try {
      const api = createDashboardAPI(accessToken);
      const dashboardData = await api.fetchDashboardData(dashboardId);
      const apiWidgets = dashboardData?.data?.widgets || [];
      const mapped = apiWidgets.map(mapApiWidgetToUI);
      const sorted = sortWidgetsByPosition(mapped);
      setWidgets(sorted);
      setInitialOrder(sorted.map((w) => w.id));
      setIsReordered(false);
    } catch (err) {
      console.error("[Widgets] Error refreshing widgets:", err);
      toast.error("Failed to refresh widgets");
    }
  };

  return {
    widgets,
    isLoading,
    error,
    isReordered,
    dashboardId,
    attributes,
    handleDragEnd,
    handleDelete,
    handleSaveChanges,
    refreshWidgets,
  };
};
