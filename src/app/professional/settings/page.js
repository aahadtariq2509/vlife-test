"use client";

import { Card } from "@/components/ui/Card";
import { ChevronRight, Plus } from "lucide-react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import OfficeTimeModal from "@/components/dashboard/Professional-dahboard/OfficeTimeModal";
import { useAuth } from "@/store/hooks";
import { createDashboardAPI } from "@/lib/dashboard-api";
import { useToastContext } from "@/components/providers/ToastProvider";
import { apiClient } from "@/lib/api-client";
import { apiAuth } from "@/lib/api-client";
import { calculateDayOfYear } from "@/lib/dashboard-utils";
import { oauthAPI } from "@/lib/oauth-api";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SingleSelect from "@/components/ui/SingleSelect";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";

// Helper function to get appropriate icon for each attribute
const getIconForAttribute = (attributeName) => {
  const iconMap = {
    office_duration: "mdi:clock-outline",
    task_todo: "mdi:clipboard-list-outline",
    total_meetings: "mdi:calendar-clock",
    screen_time_social: "mdi:cellphone",
    screen_time_professional: "mdi:laptop",
    screen_time: "mdi:monitor-screenshot",
    widget_configuration: "ic:sharp-widgets",
  };

  return iconMap[attributeName] || "mdi:cog-outline";
};

export default function ProfessionalSettingsPage() {
  const pathname = usePathname();
  const { accessToken } = useAuth();
  const { success, error: showError } = useToastContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardId, setDashboardId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [oauthWindow, setOauthWindow] = useState(null);
  const [dynamicSettings, setDynamicSettings] = useState([]);

  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  // Tasks Stats states
  const [taskTypeOptions, setTaskTypeOptions] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [taskValue, setTaskValue] = useState("");
  const [viewingTaskHistory, setViewingTaskHistory] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [editingTaskHistory, setEditingTaskHistory] = useState(null);

  // Total Meeting Time states
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [editingMeetingHistory, setEditingMeetingHistory] = useState(null);

  // Screen Time states
  const [screenTime, setScreenTime] = useState("");
  const [screenTimeHistory, setScreenTimeHistory] = useState([]);
  const [editingScreenTimeHistory, setEditingScreenTimeHistory] =
    useState(null);

  // General states
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [integrations, setIntegrations] = useState([
    {
      id: "jira",
      icon: "mdi:jira",
      title: "Jira",
      connected: false,
      button: "Connect",
    },
    {
      id: "microsoft-calendar",
      icon: "mdi:calendar-outline",
      title: "Microsoft Calendar",
      connected: false,
      button: "Connect",
    },
    {
      id: "google-calendar",
      icon: "mdi:google",
      title: "Google Calendar",
      connected: false,
      button: "Connect",
    },
    {
      id: "apple-calendar",
      icon: "mdi:apple",
      title: "Apple Calendar",
      connected: false,
      button: "Connect",
    },
  ]);

  // Fetch professional dashboard data and check connection status
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!accessToken) return;

      try {
        const api = createDashboardAPI(accessToken);
        const dashboardsResponse = await api.fetchDashboards(10, 0);

        const professionalDashboard = dashboardsResponse.data.dashboards.find(
          (dashboard) =>
            (dashboard.category === "professional" ||
              dashboard.name.toLowerCase().includes("professional")) &&
            !dashboard.is_shared_dashboard,
        );

        if (professionalDashboard) {
          setDashboardId(professionalDashboard.id);

          // Fetch full dashboard data with attributes
          const fullDashboardData = await api.fetchDashboardData(
            professionalDashboard.id,
          );
          setDashboardData(fullDashboardData.data);

          // Process dashboard attributes to create dynamic settings
          const attributes = fullDashboardData.data?.dashboard_attributes || [];
          const settings = attributes.map((attr, index) => ({
            id: `attr-${attr.attribute_id}`,
            icon: getIconForAttribute(attr.name),
            title: attr.display_name || attr.name,
            attributeId: attr.attribute_id,
            attributeName: attr.name,
            attribute: attr,
            isDynamic: true,
          }));
          setDynamicSettings(settings);

          // Update integrations based on connectedAccounts from the API
          const connectedAccounts = dashboardsResponse.data.connectedAccounts || {};
          setIntegrations((prevIntegrations) =>
            prevIntegrations.map((item) => {
              let isConnected = false;

              // Map integration IDs to connectedAccounts keys
              if (item.id === "jira") {
                isConnected = connectedAccounts.jira || false;
              } else if (item.id === "microsoft-calendar") {
                isConnected = connectedAccounts.microsoft || false;
              } else if (item.id === "google-calendar") {
                isConnected = connectedAccounts.google || false;
              } else if (item.id === "apple-calendar") {
                isConnected = connectedAccounts.apple || false;
              }

              return { ...item, connected: isConnected };
            }),
          );
        }
      } catch (err) {
        // Error fetching dashboard
      }
    };

    fetchDashboardData();
  }, [accessToken]);


  // Listen for OAuth callback messages from popup window
  useEffect(() => {
    const handleMessage = async (event) => {
      // Security: verify origin if needed
      if (event.data?.type === "oauth-success") {
        const { provider } = event.data;

        // Close the popup window if it's still open
        if (oauthWindow && !oauthWindow.closed) {
          oauthWindow.close();
        }
        setOauthWindow(null);

        success("Success", `${provider} connected successfully!`);

        // Refresh dashboard data to get updated connectedAccounts status
        try {
          const api = createDashboardAPI(accessToken);
          const dashboardsResponse = await api.fetchDashboards(10, 0);
          const connectedAccounts = dashboardsResponse.data.connectedAccounts || {};

          setIntegrations((prevIntegrations) =>
            prevIntegrations.map((item) => {
              let isConnected = false;

              // Map integration IDs to connectedAccounts keys
              if (item.id === "jira") {
                isConnected = connectedAccounts.jira || false;
              } else if (item.id === "microsoft-calendar") {
                isConnected = connectedAccounts.microsoft || false;
              } else if (item.id === "google-calendar") {
                isConnected = connectedAccounts.google || false;
              } else if (item.id === "apple-calendar") {
                isConnected = connectedAccounts.apple || false;
              }

              return { ...item, connected: isConnected };
            }),
          );
        } catch (err) {
          // If refresh fails, still update the specific integration
          setIntegrations((prevIntegrations) =>
            prevIntegrations.map((item) => {
              const platform = item.title.toLowerCase();
              if (
                (provider === "jira" && platform.includes("jira")) ||
                (provider === "google-calendar" &&
                  platform.includes("google calendar")) ||
                (provider === "microsoft" &&
                  platform.includes("microsoft calendar"))
              ) {
                return { ...item, connected: true };
              }
              return item;
            }),
          );
        }
      } else if (event.data?.type === "oauth-error") {
        // Close the popup window if it's still open
        if (oauthWindow && !oauthWindow.closed) {
          oauthWindow.close();
        }
        setOauthWindow(null);

        showError("Error", event.data.message || "Authentication failed");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [success, showError, oauthWindow, accessToken]);

  // Handle OAuth connection
  const handleConnect = async (integration) => {
    try {
      let authUrl;
      const platform = integration.title.toLowerCase();

      // Check if user is authenticated before attempting OAuth
      const token = localStorage.getItem("accessToken");
      if (!token) {
        showError(
          "Authentication Required",
          "Please log in again to connect integrations.",
        );
        return;
      }

      if (platform === "jira") {
        const response = await oauthAPI.getJiraAuthUrl();
        authUrl = response.data?.authorizationUrl || response.authorizationUrl;
      } else if (platform === "google calendar") {
        const response = await oauthAPI.getGoogleCalendarAuthUrl();
        authUrl = response.data?.authorizationUrl || response.authorizationUrl;
      } else if (platform === "microsoft calendar") {
        const response = await oauthAPI.getMicrosoftCalendarAuthUrl();
        authUrl = response.data?.authorizationUrl || response.authorizationUrl;
      }

      if (authUrl) {
        // Open OAuth in popup window (centered on screen)
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          authUrl,
          `${platform}_oauth`,
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
        );

        setOauthWindow(popup);

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          throw new Error(
            "Popup was blocked. Please allow popups for this site.",
          );
        }
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (err) {
      // Show more user-friendly error messages
      let errorMessage = err.message;
      if (err.message && err.message.includes("Authentication required")) {
        errorMessage =
          "Your session has expired. Please log in again to connect integrations.";
      } else if (err.message && err.message.includes("401")) {
        errorMessage = "Authentication failed. Please log in again.";
      }

      showError(
        "Error",
        `Failed to connect ${integration.title}: ${errorMessage}`,
      );
    }
  };

  // Handle OAuth disconnection
  const handleDisconnect = async (integration) => {
    try {
      let provider;

      // Map integration IDs to API provider names for the unlink endpoint
      if (integration.id === "jira") {
        provider = "jira";
      } else if (integration.id === "microsoft-calendar") {
        provider = "microsoft";
      } else if (integration.id === "google-calendar") {
        provider = "google-calendar";
      } else if (integration.id === "apple-calendar") {
        provider = "apple";
      } else {
        throw new Error("Unknown provider");
      }

      await oauthAPI.disconnectProvider(provider);
      success("Success", `${integration.title} disconnected successfully`);

      // Refresh dashboard data to get updated connectedAccounts status
      try {
        const api = createDashboardAPI(accessToken);
        const dashboardsResponse = await api.fetchDashboards(10, 0);
        const connectedAccounts = dashboardsResponse.data.connectedAccounts || {};

        setIntegrations((prevIntegrations) =>
          prevIntegrations.map((item) => {
            let isConnected = false;

            // Map integration IDs to connectedAccounts keys
            if (item.id === "jira") {
              isConnected = connectedAccounts.jira || false;
            } else if (item.id === "microsoft-calendar") {
              isConnected = connectedAccounts.microsoft || false;
            } else if (item.id === "google-calendar") {
              isConnected = connectedAccounts.google || false;
            } else if (item.id === "apple-calendar") {
              isConnected = connectedAccounts.apple || false;
            }

            return { ...item, connected: isConnected };
          }),
        );
      } catch (err) {
        // If refresh fails, still update the specific integration
        setIntegrations((prevIntegrations) =>
          prevIntegrations.map((item) =>
            item.id === integration.id ? { ...item, connected: false } : item,
          ),
        );
      }
    } catch (err) {
      showError(
        "Error",
        `Failed to disconnect ${integration.title}: ${err.message}`,
      );
    }
  };

  const handleConnectToggle = (integration) => {
    if (integration.connected) {
      handleDisconnect(integration);
    } else {
      handleConnect(integration);
    }
  };

  const handleOfficeTimeSubmit = async (data) => {
    if (!dashboardId || !accessToken) {
      showError("Error", "Dashboard not found");
      return;
    }

    try {
      // Calculate office duration in hours
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      // Handle cases where end time is next day (e.g., night shift)
      let durationMinutes = endMinutes - startMinutes;
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60; // Add 24 hours
      }

      const durationHours = (durationMinutes / 60).toFixed(2);

      // Find office_duration attribute from dashboardData
      const officeDurationAttr = dashboardData?.dashboard_attributes?.find(
        (attr) => attr.name === "office_duration",
      );
      const attributeId = officeDurationAttr?.attribute_id;

      if (!attributeId) {
        showError("Error", "Office duration attribute not found");
        return;
      }

      // Create attribute value payload
      const timestamp = new Date().toISOString();
      const payload = {
        attributeId: attributeId,
        value: durationHours.toString(),
        timestamp: timestamp,
        dayOfYear: calculateDayOfYear(new Date()), // Format: "DDD/YYYY" (e.g., "001/2025")
        createdWith: "M", // Manual entry
      };

      // Call API to save the attribute value using apiClient
      await apiClient.postAuth(
        `/api/dashboards/attribute-values/${dashboardId}`,
        payload,
      );

      success(
        "Office Time Saved",
        `Office duration of ${durationHours} hours has been saved`,
      );
      setIsModalOpen(false);
    } catch (err) {
      showError("Error", err.message || "Failed to save office time");
    }
  };

  // Handle attribute click
  const handleClickAttribute = (item) => {
    setSelectedAttribute(item.attribute);

    if (item.attributeName === "office_duration") {
      setIsModalOpen(true);
    } else if (item.attributeName === "task_todo") {
      // Show task type selection modal
      const taskOptions = (item.attribute.attributes || []).map((child) => ({
        value: child.id,
        label: child.display_name || child.name,
        attributeId: child.id,
        is_multivalue: child.is_multi_value,
      }));
      setTaskTypeOptions(taskOptions);
      setActiveModal("task-type-selection");
    } else if (item.attributeName === "total_meetings") {
      setActiveModal("meeting-time");
    } else if (
      item.attributeName === "screen_time_social" ||
      item.attributeName === "screen_time_professional"
    ) {
      // Show app selection modal
      const appOptions = (item.attribute.attributes || []).map((child) => ({
        value: child.id,
        label: child.display_name || child.name,
        attributeId: child.id,
        is_multivalue: child.is_multi_value,
      }));
      setTaskTypeOptions(appOptions); // Reuse same state for options
      setActiveModal(
        item.attributeName === "screen_time_social"
          ? "screen-time-social"
          : "screen-time-professional",
      );
    }
  };

  // Tasks Stats handlers
  const handleSelectTaskType = (taskType) => {
    setSelectedTaskType(taskType);
    setActiveModal("add-task");
  };

  const handleAddTask = async () => {
    if (
      !selectedTaskType ||
      !taskValue ||
      parseFloat(taskValue) < 0 ||
      !dashboardId
    ) {
      showError("Error", "Please enter a valid value");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const requestBody = {
        attributeId: selectedTaskType.attributeId,
        value: String(taskValue),
        timestamp: timestamp,
        createdWith: "M",
      };

      if (selectedTaskType.is_multivalue === false) {
        requestBody.dayOfYear = calculateDayOfYear(new Date());
      }

      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      if (response.success || response.status === "success" || response.data) {
        success("Success", `${selectedTaskType.label} added successfully!`);
        setTaskValue("");
        setSelectedTaskType(null);
        setActiveModal(null);
      } else {
        throw new Error(response.message || "Failed to add task");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to add task");
    }
  };

  const handleViewTaskHistory = async (taskType) => {
    setViewingTaskHistory(taskType);
    setLoadingHistory(true);

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${taskType.attributeId}?limit=100`,
        {
          method: "GET",
        },
      );

      if (response.data && Array.isArray(response.data)) {
        const history = response.data.map((value) => ({
          id: value.id,
          valueId: value.id,
          value: value.value,
          timestamp: value.timestamp,
          date: new Date(value.timestamp).toLocaleDateString(),
          createdBy: value.created_by_name || "Unknown",
        }));
        setTaskHistory(history);
      } else {
        setTaskHistory([]);
      }
    } catch (err) {
      showError("Error", "Failed to load task history");
      setTaskHistory([]);
    } finally {
      setLoadingHistory(false);
    }

    setActiveModal("task-history");
  };

  const handleEditTaskHistory = (entry) => {
    setEditingTaskHistory(entry);
  };

  const handleUpdateTaskHistory = async () => {
    if (!editingTaskHistory || !editingTaskHistory.valueId || !dashboardId) {
      showError("Error", "Cannot update this entry");
      return;
    }

    if (!editingTaskHistory.value || parseFloat(editingTaskHistory.value) < 0) {
      showError("Error", "Please enter a valid value");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${editingTaskHistory.valueId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            value: String(editingTaskHistory.value),
            timestamp: editingTaskHistory.timestamp,
          }),
        },
      );

      if (response.success || response.status === "success") {
        success("Success", "Task entry updated successfully!");
        setTaskHistory(
          taskHistory.map((item) =>
            item.id === editingTaskHistory.id ? editingTaskHistory : item,
          ),
        );
        setEditingTaskHistory(null);
      } else {
        throw new Error(response.message || "Failed to update task entry");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to update task entry");
    }
  };

  const handleDeleteTaskHistory = async (entry) => {
    if (!entry.valueId || !dashboardId) {
      showError("Error", "Cannot delete this entry");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${entry.valueId}`,
        {
          method: "DELETE",
        },
      );

      if (response.success || response.status === "success") {
        success("Success", "Task entry deleted successfully!");
        setTaskHistory(taskHistory.filter((item) => item.id !== entry.id));
      } else {
        throw new Error(response.message || "Failed to delete task entry");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to delete task entry");
    }
  };

  // Total Meeting Time handlers
  const handleAddMeetingTime = async () => {
    if (!meetingTime || parseFloat(meetingTime) <= 0 || !dashboardId) {
      showError("Error", "Please enter valid meeting time");
      return;
    }

    try {
      const meetingAttr = selectedAttribute;
      if (!meetingAttr) {
        showError("Error", "Attribute not found");
        return;
      }

      const timestamp = new Date().toISOString();
      const requestBody = {
        attributeId: meetingAttr.attribute_id,
        value: String(meetingTime),
        timestamp: timestamp,
        createdWith: "M",
      };

      if (meetingAttr.is_multi_value === false) {
        requestBody.dayOfYear = calculateDayOfYear(new Date());
      }

      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      if (response.success || response.status === "success" || response.data) {
        success("Success", "Meeting time added successfully!");
        setMeetingTime("");
        setActiveModal(null);
      } else {
        throw new Error(response.message || "Failed to add meeting time");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to add meeting time");
    }
  };

  const handleViewMeetingHistory = async () => {
    if (!selectedAttribute) return;

    setLoadingHistory(true);

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${selectedAttribute.attribute_id}?limit=100`,
        {
          method: "GET",
        },
      );

      if (response.data && Array.isArray(response.data)) {
        const history = response.data.map((value) => ({
          id: value.id,
          valueId: value.id,
          value: value.value,
          timestamp: value.timestamp,
          date: new Date(value.timestamp).toLocaleDateString(),
          createdBy: value.created_by_name || "Unknown",
        }));
        setMeetingHistory(history);
      } else {
        setMeetingHistory([]);
      }
    } catch (err) {
      showError("Error", "Failed to load meeting history");
      setMeetingHistory([]);
    } finally {
      setLoadingHistory(false);
    }

    setActiveModal("meeting-history");
  };

  const handleEditMeetingHistory = (entry) => {
    setEditingMeetingHistory(entry);
  };

  const handleUpdateMeetingHistory = async () => {
    if (
      !editingMeetingHistory ||
      !editingMeetingHistory.valueId ||
      !dashboardId
    ) {
      showError("Error", "Cannot update this entry");
      return;
    }

    if (
      !editingMeetingHistory.value ||
      parseFloat(editingMeetingHistory.value) <= 0
    ) {
      showError("Error", "Please enter a valid value");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${editingMeetingHistory.valueId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            value: String(editingMeetingHistory.value),
            timestamp: editingMeetingHistory.timestamp,
          }),
        },
      );

      if (response.success || response.status === "success") {
        success("Success", "Meeting time updated successfully!");
        setMeetingHistory(
          meetingHistory.map((item) =>
            item.id === editingMeetingHistory.id ? editingMeetingHistory : item,
          ),
        );
        setEditingMeetingHistory(null);
      } else {
        throw new Error(response.message || "Failed to update meeting time");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to update meeting time");
    }
  };

  const handleDeleteMeetingHistory = async (entry) => {
    if (!entry.valueId || !dashboardId) {
      showError("Error", "Cannot delete this entry");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${entry.valueId}`,
        {
          method: "DELETE",
        },
      );

      if (response.success || response.status === "success") {
        success("Success", "Meeting time deleted successfully!");
        setMeetingHistory(
          meetingHistory.filter((item) => item.id !== entry.id),
        );
      } else {
        throw new Error(response.message || "Failed to delete meeting time");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to delete meeting time");
    }
  };

  // Screen Time handlers (works for both social and professional)
  const handleSelectApp = (app) => {
    setSelectedTaskType(app); // Reuse same state
    setActiveModal("add-screen-time");
  };

  const handleAddScreenTime = async () => {
    if (
      !selectedTaskType ||
      !screenTime ||
      parseFloat(screenTime) < 0 ||
      !dashboardId
    ) {
      showError("Error", "Please enter valid screen time");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const requestBody = {
        attributeId: selectedTaskType.attributeId,
        value: String(screenTime),
        timestamp: timestamp,
        createdWith: "M",
      };

      if (selectedTaskType.is_multivalue === false) {
        requestBody.dayOfYear = calculateDayOfYear(new Date());
      }

      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      if (response.success || response.status === "success" || response.data) {
        success(
          "Success",
          `Screen time for ${selectedTaskType.label} added successfully!`,
        );
        setScreenTime("");
        setSelectedTaskType(null);
        setActiveModal(null);
      } else {
        throw new Error(response.message || "Failed to add screen time");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to add screen time");
    }
  };

  const handleViewScreenTimeHistory = async (app) => {
    setViewingTaskHistory(app); // Reuse same state
    setLoadingHistory(true);

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${app.attributeId}?limit=100`,
        {
          method: "GET",
        },
      );

      if (response.data && Array.isArray(response.data)) {
        const history = response.data.map((value) => ({
          id: value.id,
          valueId: value.id,
          value: value.value,
          timestamp: value.timestamp,
          date: new Date(value.timestamp).toLocaleDateString(),
          createdBy: value.created_by_name || "Unknown",
        }));
        setScreenTimeHistory(history);
      } else {
        setScreenTimeHistory([]);
      }
    } catch (err) {
      showError("Error", "Failed to load screen time history");
      setScreenTimeHistory([]);
    } finally {
      setLoadingHistory(false);
    }

    setActiveModal("screen-time-history");
  };

  const handleEditScreenTimeHistory = (entry) => {
    setEditingScreenTimeHistory(entry);
  };

  const handleUpdateScreenTimeHistory = async () => {
    if (
      !editingScreenTimeHistory ||
      !editingScreenTimeHistory.valueId ||
      !dashboardId
    ) {
      showError("Error", "Cannot update this entry");
      return;
    }

    if (
      !editingScreenTimeHistory.value ||
      parseFloat(editingScreenTimeHistory.value) < 0
    ) {
      showError("Error", "Please enter a valid value");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${editingScreenTimeHistory.valueId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            value: String(editingScreenTimeHistory.value),
            timestamp: editingScreenTimeHistory.timestamp,
          }),
        },
      );

      if (response.success || response.status === "success") {
        success("Success", "Screen time updated successfully!");
        setScreenTimeHistory(
          screenTimeHistory.map((item) =>
            item.id === editingScreenTimeHistory.id
              ? editingScreenTimeHistory
              : item,
          ),
        );
        setEditingScreenTimeHistory(null);
      } else {
        throw new Error(response.message || "Failed to update screen time");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to update screen time");
    }
  };

  const handleDeleteScreenTimeHistory = async (entry) => {
    if (!entry.valueId || !dashboardId) {
      showError("Error", "Cannot delete this entry");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${entry.valueId}`,
        {
          method: "DELETE",
        },
      );

      if (response.success || response.status === "success") {
        success("Success", "Screen time deleted successfully!");
        setScreenTimeHistory(
          screenTimeHistory.filter((item) => item.id !== entry.id),
        );
      } else {
        throw new Error(response.message || "Failed to delete screen time");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to delete screen time");
    }
  };

  return (
    <>
      <div className="mb-8 mt-3 md:mt-4">
        <h3 className="text-2xl font-semibold text-[#4D4D4D]">Settings</h3>
        <p className="mt-2 text-sm text-[#777777]">
          Manage your professional settings and integrations.
        </p>
      </div>

      <Card className="p-4 md:p-8 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
        <div className="space-y-3">
          {/* Dynamic settings from API */}
          {dynamicSettings.map((item) => (
            <Card
              key={item.id}
              variant="filled"
              className="transition-all duration-200 !bg-[#F9F9F9] border-[1px] rounded-[12px] w-full !border-[#EFEFEF] hover:!bg-[#F0F0F0] cursor-pointer"
              onClick={() => handleClickAttribute(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#559EFE] flex items-center justify-center text-white">
                    <Icon icon={item.icon} width="20" height="20" />
                  </div>
                  <span className="text-base font-medium text-[#333333]">
                    {item.title}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#999999]" />
              </div>
            </Card>
          ))}

          {/* Integration settings (Jira, Calendars, etc.) */}
          {integrations.map((item) => (
            <Card
              key={item.id}
              variant="filled"
              className="transition-all duration-200 !bg-[#F9F9F9] border-[1px] rounded-[12px] w-full !border-[#EFEFEF]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#559EFE] flex items-center justify-center text-white">
                    <Icon icon={item.icon} width="20" height="20" />
                  </div>
                  <span className="text-base font-medium text-[#333333]">
                    {item.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectToggle(item);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    item.connected
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {item.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </Card>
          ))}

          {/* Widgets Link */}
          <Link href="/professional/widgets" className="block">
            <Card
              variant="filled"
              className="transition-all duration-200 !bg-[#F9F9F9] border-[1px] rounded-[12px] w-full !border-[#EFEFEF] hover:!bg-[#F0F0F0]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#559EFE] flex items-center justify-center text-white">
                    <Icon icon="ic:sharp-widgets" width="20" height="20" />
                  </div>
                  <span
                    className={`text-base font-medium ${pathname === "/professional/widgets" ? "text-[#9747FF]" : "text-[#333333]"}`}
                  >
                    Widgets
                  </span>
                </div>
                <ChevronRight
                  className={`w-5 h-5 ${pathname === "/professional/widgets" ? "text-[#9747FF]" : "text-[#999999]"}`}
                />
              </div>
            </Card>
          </Link>
        </div>
      </Card>

      <OfficeTimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleOfficeTimeSubmit}
      />

      {/* Task Type Selection Modal (for Tasks Stats) */}
      <Modal
        isOpen={activeModal === "task-type-selection"}
        onClose={() => setActiveModal(null)}
        title="Select Task Type"
        size="md"
      >
        <div className="space-y-4">
          {taskTypeOptions.map((taskType) => (
            <Card
              key={taskType.value}
              variant="filled"
              className="transition-all duration-200 !bg-[#F9F9F9] border-[1px] rounded-[12px] w-full !border-[#EFEFEF] hover:!bg-[#F0F0F0] cursor-pointer"
              onClick={() => handleSelectTaskType(taskType)}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-[#333333]">
                  {taskType.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTaskHistory(taskType);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View History
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={activeModal === "add-task"}
        onClose={() => {
          setActiveModal("task-type-selection");
          setTaskValue("");
        }}
        title={`Add ${selectedTaskType?.label || "Task"}`}
        size="md"
      >
        <div className="space-y-6">
          <Input
            type="number"
            label="Number of Tasks"
            placeholder="Enter number of tasks"
            value={taskValue}
            onChange={(e) => setTaskValue(e.target.value)}
          />
          <Button
            onClick={handleAddTask}
            disabled={!taskValue || parseFloat(taskValue) < 0}
            width="w-full"
          >
            Add Task
          </Button>
        </div>
      </Modal>

      {/* Task History Modal */}
      <Modal
        isOpen={activeModal === "task-history"}
        onClose={() => {
          setActiveModal("task-type-selection");
          setViewingTaskHistory(null);
          setTaskHistory([]);
        }}
        title={`History - ${viewingTaskHistory?.label || ""}`}
        size="lg"
      >
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm">Loading history...</p>
            </div>
          ) : taskHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon
                icon="mdi:history"
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
              />
              <p className="text-sm">No history available</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#559EFE]">
                    <TableHead>Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-medium">
                        {entry.value}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => handleEditTaskHistory(entry)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTaskHistory(entry)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Task History Modal */}
      <Modal
        isOpen={editingTaskHistory !== null}
        onClose={() => setEditingTaskHistory(null)}
        title="Edit Task Entry"
        size="md"
      >
        {editingTaskHistory && (
          <div className="space-y-6">
            <Input
              type="number"
              label="Value"
              placeholder="Enter value"
              value={editingTaskHistory.value}
              onChange={(e) => {
                setEditingTaskHistory({
                  ...editingTaskHistory,
                  value: e.target.value,
                });
              }}
            />
            <Input
              type="datetime-local"
              label="Date & Time"
              value={
                editingTaskHistory.timestamp
                  ? new Date(editingTaskHistory.timestamp)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                const newTimestamp = e.target.value
                  ? new Date(e.target.value).toISOString()
                  : editingTaskHistory.timestamp;
                setEditingTaskHistory({
                  ...editingTaskHistory,
                  timestamp: newTimestamp,
                  date: newTimestamp
                    ? new Date(newTimestamp).toLocaleDateString()
                    : editingTaskHistory.date,
                });
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdateTaskHistory} width="w-full">
                Update Entry
              </Button>
              <Button
                onClick={() => setEditingTaskHistory(null)}
                variant="outline"
                width="w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Meeting Time Modal */}
      <Modal
        isOpen={activeModal === "meeting-time"}
        onClose={() => {
          setActiveModal(null);
          setMeetingTime("");
        }}
        title="Total Meeting Time"
        size="md"
      >
        <div className="space-y-6">
          <Input
            type="number"
            label="Meeting Time (hours)"
            placeholder="Enter total meeting time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAddMeetingTime}
              disabled={!meetingTime || parseFloat(meetingTime) <= 0}
              width="w-full"
            >
              Add Meeting Time
            </Button>
            <Button
              onClick={handleViewMeetingHistory}
              backgroundColor="#9747FF"
              width="w-auto"
            >
              View History
            </Button>
          </div>
        </div>
      </Modal>

      {/* Meeting History Modal */}
      <Modal
        isOpen={activeModal === "meeting-history"}
        onClose={() => {
          setActiveModal("meeting-time");
          setMeetingHistory([]);
        }}
        title="Meeting Time History"
        size="lg"
      >
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm">Loading history...</p>
            </div>
          ) : meetingHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon
                icon="mdi:history"
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
              />
              <p className="text-sm">No history available</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#559EFE]">
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetingHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-medium">
                        {entry.value}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => handleEditMeetingHistory(entry)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMeetingHistory(entry)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Meeting History Modal */}
      <Modal
        isOpen={editingMeetingHistory !== null}
        onClose={() => setEditingMeetingHistory(null)}
        title="Edit Meeting Time"
        size="md"
      >
        {editingMeetingHistory && (
          <div className="space-y-6">
            <Input
              type="number"
              label="Meeting Time (hours)"
              placeholder="Enter meeting time"
              value={editingMeetingHistory.value}
              onChange={(e) => {
                setEditingMeetingHistory({
                  ...editingMeetingHistory,
                  value: e.target.value,
                });
              }}
            />
            <Input
              type="datetime-local"
              label="Date & Time"
              value={
                editingMeetingHistory.timestamp
                  ? new Date(editingMeetingHistory.timestamp)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                const newTimestamp = e.target.value
                  ? new Date(e.target.value).toISOString()
                  : editingMeetingHistory.timestamp;
                setEditingMeetingHistory({
                  ...editingMeetingHistory,
                  timestamp: newTimestamp,
                  date: newTimestamp
                    ? new Date(newTimestamp).toLocaleDateString()
                    : editingMeetingHistory.date,
                });
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdateMeetingHistory} width="w-full">
                Update Entry
              </Button>
              <Button
                onClick={() => setEditingMeetingHistory(null)}
                variant="outline"
                width="w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Screen Time Social - App Selection Modal */}
      <Modal
        isOpen={activeModal === "screen-time-social"}
        onClose={() => setActiveModal(null)}
        title="Select Social App"
        size="md"
      >
        <div className="space-y-4">
          {taskTypeOptions.map((app) => (
            <Card
              key={app.value}
              variant="filled"
              className="transition-all duration-200 !bg-[#F9F9F9] border-[1px] rounded-[12px] w-full !border-[#EFEFEF] hover:!bg-[#F0F0F0] cursor-pointer"
              onClick={() => handleSelectApp(app)}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-[#333333]">
                  {app.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewScreenTimeHistory(app);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View History
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* Screen Time Professional - App Selection Modal */}
      <Modal
        isOpen={activeModal === "screen-time-professional"}
        onClose={() => setActiveModal(null)}
        title="Select Professional App"
        size="md"
      >
        <div className="space-y-4">
          {taskTypeOptions.map((app) => (
            <Card
              key={app.value}
              variant="filled"
              className="transition-all duration-200 !bg-[#F9F9F9] border-[1px] rounded-[12px] w-full !border-[#EFEFEF] hover:!bg-[#F0F0F0] cursor-pointer"
              onClick={() => handleSelectApp(app)}
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-[#333333]">
                  {app.label}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewScreenTimeHistory(app);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View History
                </button>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* Add Screen Time Modal */}
      <Modal
        isOpen={activeModal === "add-screen-time"}
        onClose={() => {
          setActiveModal(
            selectedAttribute?.name === "screen_time_social"
              ? "screen-time-social"
              : "screen-time-professional",
          );
          setScreenTime("");
        }}
        title={`Add Screen Time - ${selectedTaskType?.label || ""}`}
        size="md"
      >
        <div className="space-y-6">
          <Input
            type="number"
            label="Screen Time (minutes)"
            placeholder="Enter screen time in minutes"
            value={screenTime}
            onChange={(e) => setScreenTime(e.target.value)}
          />
          <Button
            onClick={handleAddScreenTime}
            disabled={!screenTime || parseFloat(screenTime) < 0}
            width="w-full"
          >
            Add Screen Time
          </Button>
        </div>
      </Modal>

      {/* Screen Time History Modal */}
      <Modal
        isOpen={activeModal === "screen-time-history"}
        onClose={() => {
          setActiveModal(
            selectedAttribute?.name === "screen_time_social"
              ? "screen-time-social"
              : "screen-time-professional",
          );
          setViewingTaskHistory(null);
          setScreenTimeHistory([]);
        }}
        title={`Screen Time History - ${viewingTaskHistory?.label || ""}`}
        size="lg"
      >
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm">Loading history...</p>
            </div>
          ) : screenTimeHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon
                icon="mdi:history"
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
              />
              <p className="text-sm">No history available</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#559EFE]">
                    <TableHead>Date</TableHead>
                    <TableHead>Minutes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenTimeHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-medium">
                        {entry.value}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => handleEditScreenTimeHistory(entry)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteScreenTimeHistory(entry)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Screen Time History Modal */}
      <Modal
        isOpen={editingScreenTimeHistory !== null}
        onClose={() => setEditingScreenTimeHistory(null)}
        title="Edit Screen Time"
        size="md"
      >
        {editingScreenTimeHistory && (
          <div className="space-y-6">
            <Input
              type="number"
              label="Screen Time (minutes)"
              placeholder="Enter screen time"
              value={editingScreenTimeHistory.value}
              onChange={(e) => {
                setEditingScreenTimeHistory({
                  ...editingScreenTimeHistory,
                  value: e.target.value,
                });
              }}
            />
            <Input
              type="datetime-local"
              label="Date & Time"
              value={
                editingScreenTimeHistory.timestamp
                  ? new Date(editingScreenTimeHistory.timestamp)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                const newTimestamp = e.target.value
                  ? new Date(e.target.value).toISOString()
                  : editingScreenTimeHistory.timestamp;
                setEditingScreenTimeHistory({
                  ...editingScreenTimeHistory,
                  timestamp: newTimestamp,
                  date: newTimestamp
                    ? new Date(newTimestamp).toLocaleDateString()
                    : editingScreenTimeHistory.date,
                });
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdateScreenTimeHistory} width="w-full">
                Update Entry
              </Button>
              <Button
                onClick={() => setEditingScreenTimeHistory(null)}
                variant="outline"
                width="w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
