"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "./formFields/FormField";

/**
 * Modal component for fitness settings
 * Extracted from the main page to reduce complexity
 */
export default function SettingsModal({
  isOpen,
  onClose,
  modalData,
  formValues,
  onInputChange,
  onSave,
  editMode,
}) {
  if (!modalData) return null;

  const isBloodPressure =
    modalData.name === "blood_pressure" ||
    modalData.display_name?.toLowerCase().includes("blood pressure");

  const renderBloodPressureForm = () => (
    <div className="space-y-6">
      {/* Blood Pressure Input Fields */}
      <div className="flex items-start gap-3">
        {/* Systolic Input */}
        <div className="flex-1">
          <input
            type="number"
            value={formValues.systolic || ""}
            onChange={(e) => onInputChange("systolic", e.target.value)}
            placeholder=""
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
          />
          <label className="block text-[13px] font-normal text-[#4D4D4D] mt-2 text-center">
            Systolic
          </label>
        </div>

        {/* Separator */}
        <div className="flex items-center pt-3">
          <span className="text-2xl text-gray-400">/</span>
        </div>

        {/* Diastolic Input */}
        <div className="flex-1 flex items-start gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={formValues.diastolic || ""}
              onChange={(e) => onInputChange("diastolic", e.target.value)}
              placeholder=""
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
            />
            <label className="block text-[13px] font-normal text-[#4D4D4D] mt-2 text-center">
              Diastolic
            </label>
          </div>
          <div className="flex items-center pt-3">
            <span className="text-sm text-gray-600">
              {modalData.unit || "mmHg"}
            </span>
          </div>
        </div>
      </div>

      {/* Date picker for edit mode */}
      {editMode && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#4D4D4D]">
            Date
          </label>
          <input
            type="date"
            value={formValues.date || new Date().toISOString().split('T')[0]}
            onChange={(e) => onInputChange("date", e.target.value)}
            className="w-full h-12 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 px-4"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onClose}
          variant="ghost"
          className="flex-1 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </Button>
        <Button onClick={onSave} variant="primary" className="flex-1">
          Save
        </Button>
      </div>
    </div>
  );

  const renderFieldsForm = () => {
    if (modalData.fields && Array.isArray(modalData.fields) && modalData.fields.length > 0) {
      return (
        <div className="space-y-4">
          {modalData.fields.map((field) => (
            <FormField
              key={field.name || field.id}
              field={field}
              value={formValues[field.name || field.id] || ""}
              onChange={onInputChange}
            />
          ))}
          <Button onClick={onSave} variant="primary" className="w-full">
            Save
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderDefaultForm = () => {
    const displayName =
      modalData.display_name ||
      modalData.name ||
      modalData.title ||
      modalData.label ||
      "Attribute";
    const displayValue = modalData.value || modalData.defaultValue || "";
    const unit = modalData.unit || "";

    return (
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium ml-2 text-[#4D4D4D]">
            {displayName}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formValues.value || displayValue}
              onChange={(e) => onInputChange("value", e.target.value)}
              placeholder={`Enter ${displayName.toLowerCase()}`}
              className="w-full h-12 border-0 rounded-full outline-none focus-visible:outline-none focus:ring-0 bg-[#F3F3F3] pl-4"
              style={{ paddingRight: unit ? "4rem" : "1rem" }}
            />
            {unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-600 pointer-events-none">
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Date picker for edit mode */}
        {editMode && (
          <div className="space-y-2">
            <label className="block text-sm font-medium ml-2 text-[#4D4D4D]">
              Date
            </label>
            <input
              type="date"
              value={formValues.date || new Date().toISOString().split('T')[0]}
              onChange={(e) => onInputChange("date", e.target.value)}
              className="w-full h-12 border-0 rounded-full outline-none focus-visible:outline-none focus:ring-0 bg-[#F3F3F3] pl-4 pr-4"
            />
          </div>
        )}

        <Button onClick={onSave} variant="primary" className="w-full">
          Save
        </Button>
      </div>
    );
  };

  const renderModalContent = () => {
    if (isBloodPressure) {
      return renderBloodPressureForm();
    }

    const fieldsForm = renderFieldsForm();
    if (fieldsForm) {
      return fieldsForm;
    }

    return renderDefaultForm();
  };

  const modalTitle = modalData
    ? `${editMode ? "Edit" : "Add"} ${
        modalData.display_name ||
        modalData.name ||
        modalData.title ||
        modalData.label ||
        "Attribute"
      }`
    : "Settings";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md">
      {renderModalContent()}
    </Modal>
  );
}
