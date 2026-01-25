"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";
import FitnessSettingsCard from "@/components/fitness/FitnessSettingsCard";
import Button from "@/components/ui/Button";
import { createDashboardAPI } from "@/lib/dashboard-api";
import { useAuth } from "@/store/hooks";
import { Card } from "@/components/ui/Card";
import getAttributeIcon from "@/components/fitness/getAttributeIcon";
import { useToastContext } from "@/components/providers/ToastProvider";

// Refactored components
import SettingsModal from "./components/SettingsModal";
import AttributeCard from "./components/AttributeCard";
import ChildAttributeList from "./components/ChildAttributeList";

// Refactored utility functions
import {
  updateTargetAttribute,
  addAttributeValue,
  deleteAttributeValue,
  updateAttributeValue,
  refreshDashboardData,
  extractValueFromForm,
} from "./utils/saveHandlers";

function FitnessSettingsContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { accessToken, isAuthenticated } = useAuth();
  const { success, error: showError } = useToastContext();
  const [dashboardId, setDashboardId] = useState(null);

  const [expandedCard, setExpandedCard] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [openModal, setOpenModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [formValues, setFormValues] = useState({});

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editingValue, setEditingValue] = useState(null);

  // Fetch the dashboard ID if not provided in URL
  useEffect(() => {
    const fetchDashboardId = async () => {
      const urlDashboardId = searchParams.get("dashboardId");
      if (urlDashboardId) {
        setDashboardId(urlDashboardId);
        return;
      }

      if (!isAuthenticated || !accessToken) {
        return;
      }

      try {
        const api = createDashboardAPI(accessToken);
        const dashboardsResponse = await api.fetchDashboards(10, 0);

        // Find the user's OWN fitness dashboard (not shared ones)
        // CRITICAL: Settings should ALWAYS use the owner's dashboard, never shared dashboards
        const fitnessDashboard = dashboardsResponse.data.dashboards.find(
          (dashboard) =>
            (dashboard.category === "fitness" ||
              dashboard.name.toLowerCase().includes("fitness")) &&
            !dashboard.is_shared_dashboard // Exclude shared dashboards
        );

        if (!fitnessDashboard) {
          setError("Fitness dashboard not found");
          setLoading(false);
          return;
        }

        setDashboardId(fitnessDashboard.id.toString());
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
        setLoading(false);
      }
    };

    void fetchDashboardId();
  }, [searchParams, isAuthenticated, accessToken]);

  // Fetch dashboard data once dashboardId is available
  useEffect(() => {
    if (!dashboardId) return;

    let isCancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const api = createDashboardAPI(accessToken);
        const response = await api.fetchDashboardData(dashboardId);

        if (isCancelled) return;

        const dashboardAttributes = response.data?.dashboard_attributes || [];

        if (Array.isArray(dashboardAttributes)) {
          setAttributes(dashboardAttributes);
        } else {
          setAttributes([]);
        }
      } catch (err) {
        if (isCancelled) return;

        setError(err.message || "Failed to load dashboard data");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void fetchDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [dashboardId, accessToken]);

  const toggleCard = (cardId, attribute) => {
    // Always expand/collapse the card to show the buttons (Add and History)
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const openParameterModal = (data) => {
    setModalData(data);
    setOpenModal(true);
    setEditMode(false);
    setEditingValue(null);

    const initialValues = {};

    // Special handling for blood pressure
    if (
      data.name === "blood_pressure" ||
      data.display_name?.toLowerCase().includes("blood pressure")
    ) {
      const existingValue = data.value || data.defaultValue || "";
      if (existingValue) {
        const parts = existingValue
          .toString()
          .split(/[\/,]/)
          .map((p) => p.trim());
        initialValues.systolic = parts[0] || "";
        initialValues.diastolic = parts[1] || "";
      } else {
        initialValues.systolic = "";
        initialValues.diastolic = "";
      }
    } else if (data.fields && Array.isArray(data.fields)) {
      data.fields.forEach((field) => {
        initialValues[field.name || field.id] =
          field.defaultValue || field.value || "";
      });
    } else if (data.value !== undefined) {
      initialValues.value = data.value;
    }
    setFormValues(initialValues);
  };

  const openEditModal = (attributeData, valueItem) => {
    setModalData(attributeData);
    setOpenModal(true);
    setEditMode(true);
    setEditingValue(valueItem);

    const initialValues = {};

    const isBloodPressure =
      attributeData.name === "blood_pressure" ||
      attributeData.display_name?.toLowerCase().includes("blood pressure");

    if (isBloodPressure) {
      const existingValue = valueItem.value || "";
      if (existingValue) {
        const parts = existingValue
          .toString()
          .split(/[\/,]/)
          .map((p) => p.trim());
        initialValues.systolic = parts[0] || "";
        initialValues.diastolic = parts[1] || "";
      } else {
        initialValues.systolic = "";
        initialValues.diastolic = "";
      }
    } else {
      initialValues.value = valueItem.value || "";
    }

    // Add the date from the valueItem's timestamp
    if (valueItem.timestamp) {
      const date = new Date(valueItem.timestamp);
      initialValues.date = date.toISOString().split('T')[0];
    } else {
      initialValues.date = new Date().toISOString().split('T')[0];
    }

    setFormValues(initialValues);
  };

  const closeModal = () => {
    setOpenModal(null);
    setModalData(null);
    setFormValues({});
    setEditMode(false);
    setEditingValue(null);
  };

  const handleInputChange = (fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = async () => {
    if (!modalData) return;

    try {
      const valueToSave = extractValueFromForm(modalData, formValues);
      const isTargetAttribute = modalData.value_type === "target";

      if (isTargetAttribute) {
        await updateTargetAttribute(modalData, valueToSave, dashboardId);
        success("Success", "Target value updated successfully");
      } else if (editMode && editingValue) {
        // EDIT MODE: Update existing value
        const valueId = editingValue.id;
        if (!valueId) {
          showError("Error", "Cannot update this entry - missing ID");
          return;
        }

        // Get the date from form values or use existing timestamp
        const timestamp = formValues.date
          ? new Date(formValues.date).toISOString()
          : editingValue.timestamp;

        await updateAttributeValue(
          valueId,
          modalData,
          valueToSave,
          timestamp,
          dashboardId
        );
        success("Success", "Value updated successfully");
      } else {
        // ADD MODE: For regular attributes
        await addAttributeValue(modalData, valueToSave, dashboardId);
        success("Success", "Attribute value saved successfully");
      }

      closeModal();

      // Refresh the dashboard data
      if (dashboardId && accessToken) {
        const updatedAttributes = await refreshDashboardData(
          dashboardId,
          accessToken
        );
        setAttributes(updatedAttributes);
      }
    } catch (err) {
      showError("Error", err.message || "Failed to save attribute value");
    }
  };

  const handleDelete = async (attributeData, valueItem) => {
    if (!valueItem.id || !dashboardId) {
      showError("Error", "Cannot delete this entry");
      return;
    }

    // Confirm delete
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await deleteAttributeValue(valueItem.id, dashboardId);
      success("Success", "Entry deleted successfully");

      // Refresh the dashboard data
      if (dashboardId && accessToken) {
        const updatedAttributes = await refreshDashboardData(
          dashboardId,
          accessToken
        );
        setAttributes(updatedAttributes);
      }
    } catch (err) {
      showError("Error", err.message || "Failed to delete entry");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attributes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="w-full p-4 md:p-4">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold text-[#4D4D4D] mb-1">
            Settings
          </h1>
          <p className="text-sm font-medium text-[#4D4D4D]">
            Manage your fitness and health tracking preferences.
          </p>
        </div>

        {/* Attributes Cards */}
        <Card className="p-4 md:p-12 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
          <div className="space-y-4">
            {attributes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No attributes found.</p>
              </div>
            ) : (
              attributes.map((attribute, index) => {
                const attributeId =
                  attribute.attributeId ||
                  attribute.attribute_id ||
                  attribute.id ||
                  `attr-${index}`;
                const attributeName =
                  attribute.display_name ||
                  attribute.name ||
                  attribute.title ||
                  attribute.label ||
                  "Untitled";
                const isExpanded = expandedCard === attributeId;
                const children = attribute.attributes || [];
                const hasChildren = children.length > 0;

                return (
                  <FitnessSettingsCard
                    key={attributeId}
                    title={attributeName}
                    icon={getAttributeIcon(attribute)}
                    isExpanded={isExpanded}
                    onToggle={() => toggleCard(attributeId, attribute)}
                    parameters={[]}
                  >
                    {isExpanded && (
                      <div className="space-y-4">
                        {hasChildren ? (
                          <ChildAttributeList
                            children={children}
                            attributeId={attributeId}
                            onAddClick={openParameterModal}
                            onEditClick={openEditModal}
                            onDeleteClick={handleDelete}
                            dashboardId={dashboardId}
                          />
                        ) : (
                          <AttributeCard
                            attribute={attribute}
                            attributeId={attributeId}
                            onAddClick={openParameterModal}
                            onEditClick={openEditModal}
                            onDeleteClick={handleDelete}
                            dashboardId={dashboardId}
                          />
                        )}
                      </div>
                    )}
                  </FitnessSettingsCard>
                );
              })
            )}

            {/* Widgets Card */}
            <Link href="/fitness/widgets" className="block">
              <Card
                variant="filled"
                hover
                className="transition-all duration-200 !bg-[#F3F3F3] border-[2px] rounded-[15px] w-full !border-[#F3F3F3] hover:!bg-[#E8E8E8]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#559EFE] flex items-center justify-center text-white">
                      <Icon icon="ic:sharp-widgets" className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-lg font-medium ${
                        pathname === "/fitness/widgets"
                          ? "text-[#9747FF]"
                          : "text-gray-900"
                      }`}
                    >
                      Widgets
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 ${
                      pathname === "/fitness/widgets"
                        ? "text-[#9747FF]"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              </Card>
            </Link>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <SettingsModal
        isOpen={!!openModal}
        onClose={closeModal}
        modalData={modalData}
        formValues={formValues}
        onInputChange={handleInputChange}
        onSave={handleSave}
        editMode={editMode}
      />
    </div>
  );
}

export default function FitnessSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <FitnessSettingsContent />
    </Suspense>
  );
}
