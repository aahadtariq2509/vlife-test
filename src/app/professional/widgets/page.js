"use client";
import React, { useState } from "react";
import { Plus, Save } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/store/hooks";
import { useWidgetManagement } from "./hooks/useWidgetManagement";
import { useAddWidgetFlow } from "./hooks/useAddWidgetFlow";
import { WidgetList } from "../../fitness/widgets/components/WidgetList";
import { AddWidgetModal } from "../../fitness/widgets/components/AddWidgetModal";
import { DeleteWidgetModal } from "../../fitness/widgets/components/DeleteWidgetModal";

export default function ProfessionalDashboardCustomizer() {
  const { isAuthenticated, accessToken } = useAuth();

  // Widget management hook
  const {
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
  } = useWidgetManagement(isAuthenticated, accessToken);

  // Add widget flow hook
  const {
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
  } = useAddWidgetFlow(accessToken, dashboardId, refreshWidgets);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState(null);

  // Add widget modal handlers
  const openAddWidget = () => {
    setOpenModal(true);
    clearAllStepData();
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    clearAllStepData();
  };

  // Delete widget handlers
  const handleConfirmDelete = (id) => {
    setWidgetToDelete(id);
    setDeleteModal(true);
  };

  const handleConfirmDeleteWidget = async () => {
    const success = await handleDelete(widgetToDelete);
    if (success) {
      setDeleteModal(false);
      setWidgetToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(false);
    setWidgetToDelete(null);
  };

  return (
    <div className="min-h-screen py-8">
      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <div className="w-full p-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl font-semibold text-[#4D4D4D] mb-1">
            Customize Your Professional Dashboard
          </h2>
          <p className="text-sm font-medium text-[#4D4D4D]">
            Drag and drop to reorder widgets. Delete or add new ones easily.
          </p>
        </div>

        <Card className="p-4 md:p-12 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
          {isLoading ? (
            <div className="py-8 text-center text-gray-600">
              Loading widgets...
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600">{error}</div>
          ) : (
            <>
              <WidgetList
                widgets={widgets}
                onDragEnd={handleDragEnd}
                onDeleteClick={handleConfirmDelete}
              />
            </>
          )}

          <div className="flex justify-end gap-5 mt-6">
            <div className="max-w-sm grid gap-3 grid-cols-2">
              <Button
                className="rounded-full bg-blue-100 text-blue-600 w-auto"
                onClick={openAddWidget}
                variant="secondary"
              >
                <Plus size={18} /> Add Widget
              </Button>
              <Button
                className="rounded-full w-auto"
                onClick={handleSaveChanges}
                variant="primary"
                disabled={!isReordered}
              >
                <Save size={18} /> Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <AddWidgetModal
        isOpen={openModal}
        onClose={handleCloseModal}
        step={step}
        attributes={attributes}
        mappings={mappings}
        childAttributes={childAttributes}
        selectedAttributeId={selectedAttributeId}
        selectedWidgetTypeId={selectedWidgetTypeId}
        selectedChildAttributeIds={selectedChildAttributeIds}
        minChildAttributes={minChildAttributes}
        maxChildAttributes={maxChildAttributes}
        isLoadingChildAttributes={isLoadingChildAttributes}
        onSelectAttribute={handleSelectAttribute}
        onSelectWidget={handleSelectWidget}
        onToggleChildAttribute={handleToggleChildAttribute}
        onNextFromStep1={handleNextFromStep1}
        onBackFromStep2={handleBackFromStep2}
        onBackFromStep3={handleBackFromStep3}
        onProceedToChildren={handleProceedToChildren}
        onCreate={handleCreateWidget}
        isStep3Valid={isStep3Valid}
        widgetsLength={widgets.length}
      />

      <DeleteWidgetModal
        isOpen={deleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteWidget}
      />
    </div>
  );
}
