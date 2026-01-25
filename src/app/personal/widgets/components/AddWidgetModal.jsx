import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { getMappingId } from "../utils/apiNormalizers";

const Step1AttributeSelection = ({
  attributes,
  selectedAttributeId,
  isLoadingChildAttributes,
  onSelectAttribute,
  onNext,
}) => {
  return (
    <div className="relative">
      {isLoadingChildAttributes && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#3B84E3] animate-spin" />
            <p className="text-sm text-[#4D4D4D]">
              Loading child attributes...
            </p>
          </div>
        </div>
      )}
      <label className="block text-sm font-medium text-[#4D4D4D] mb-2">
        Choose an attribute
      </label>
      <div className="max-h-64 overflow-auto space-y-2">
        {attributes.map((attr) => (
          <label
            key={attr.attribute_id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#F3F3F3]"
          >
            <input
              type="radio"
              name="attribute"
              checked={attr.attribute_id === selectedAttributeId}
              onChange={() => onSelectAttribute(attr)}
            />
            <span className="text-sm font-medium text-[#4D4D4D]">
              {attr.display_name || attr.name}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button
          variant="primary"
          className="rounded-full w-auto"
          disabled={!selectedAttributeId || isLoadingChildAttributes}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const Step2WidgetTypeSelection = ({
  mappings,
  selectedWidgetTypeId,
  onSelectWidget,
  onBack,
  onNext,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-[#4D4D4D] mb-2">
        Choose widget type
      </label>
      <div className="space-y-2 max-h-64 overflow-auto">
        {mappings.map((map, idx) => {
          const mid = getMappingId(map);
          return (
            <label
              key={String(mid ?? idx)}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#F3F3F3]"
            >
              <input
                type="radio"
                name="widgetType"
                checked={String(selectedWidgetTypeId) === String(mid)}
                onChange={() => onSelectWidget(map)}
              />
              <span className="text-sm font-medium text-[#4D4D4D]">
                {map.name || map.code}
              </span>
            </label>
          );
        })}
        {mappings.length === 0 && (
          <div className="text-sm text-[#4D4D4D] p-3 bg-[#F3F3F3] rounded-xl">
            No widget types available for this selection.
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <Button
          variant="secondary"
          className="rounded-full w-auto"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="primary"
          className="rounded-full w-auto"
          disabled={!selectedWidgetTypeId}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const Step3ChildAttributeSelection = ({
  childAttributes,
  selectedChildAttributeIds,
  minChildAttributes,
  maxChildAttributes,
  onToggleChildAttribute,
  onBack,
  onCreate,
  isValid,
}) => {
  const useRadioButtons = minChildAttributes === 1 && maxChildAttributes === 1;

  return (
    <div>
      <label className="block text-sm font-medium text-[#4D4D4D] mb-2">
        {useRadioButtons
          ? "Select child attribute"
          : "Select child attributes"}
      </label>
      <div className="max-h-64 overflow-auto space-y-2">
        {childAttributes.map((child) => {
          const id = child.attribute_id || child.id;
          const isSelected = selectedChildAttributeIds.includes(id);

          return (
            <label
              key={id}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#F3F3F3]"
            >
              <input
                type={useRadioButtons ? "radio" : "checkbox"}
                name={
                  useRadioButtons
                    ? "childAttribute"
                    : `childAttribute-${id}`
                }
                checked={isSelected}
                onChange={(e) =>
                  onToggleChildAttribute(id, e.target.checked, useRadioButtons)
                }
              />
              <span className="text-sm font-medium text-[#4D4D4D]">
                {child.display_name || child.name}
              </span>
            </label>
          );
        })}
      </div>
      {childAttributes.length === 0 ? (
        <div className="text-sm text-[#4D4D4D] p-3 bg-[#F3F3F3] rounded-xl mt-2">
          No child attributes available for this attribute.
        </div>
      ) : (
        <p className="text-xs text-[#4D4D4D] mt-2">
          {useRadioButtons
            ? "Please select one child attribute"
            : minChildAttributes !== null || maxChildAttributes !== null
            ? `Select ${
                minChildAttributes !== null
                  ? `at least ${minChildAttributes}`
                  : ""
              }${
                minChildAttributes !== null && maxChildAttributes !== null
                  ? " and "
                  : ""
              }${
                maxChildAttributes !== null
                  ? `at most ${maxChildAttributes}`
                  : ""
              } child attribute(s)`
            : "Please select child attribute(s)"}
        </p>
      )}
      <div className="flex justify-between mt-4">
        <Button
          variant="secondary"
          className="rounded-full w-auto"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="primary"
          className="rounded-full w-auto"
          disabled={!isValid}
          onClick={onCreate}
        >
          Create Widget
        </Button>
      </div>
    </div>
  );
};

export const AddWidgetModal = ({
  isOpen,
  onClose,
  step,
  attributes,
  mappings,
  childAttributes,
  selectedAttributeId,
  selectedWidgetTypeId,
  selectedChildAttributeIds,
  minChildAttributes,
  maxChildAttributes,
  isLoadingChildAttributes,
  onSelectAttribute,
  onSelectWidget,
  onToggleChildAttribute,
  onNextFromStep1,
  onBackFromStep2,
  onBackFromStep3,
  onProceedToChildren,
  onCreate,
  isStep3Valid,
  widgetsLength,
}) => {
  const handleCreate = async () => {
    const success = await onCreate(widgetsLength);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Widget"
      size="md"
    >
      <div className="space-y-4 mt-2">
        <div className="text-sm text-[#4D4D4D]">Step {step} of 3</div>

        {step === 1 && (
          <Step1AttributeSelection
            attributes={attributes}
            selectedAttributeId={selectedAttributeId}
            isLoadingChildAttributes={isLoadingChildAttributes}
            onSelectAttribute={onSelectAttribute}
            onNext={onNextFromStep1}
          />
        )}

        {step === 2 && (
          <Step2WidgetTypeSelection
            mappings={mappings}
            selectedWidgetTypeId={selectedWidgetTypeId}
            onSelectWidget={onSelectWidget}
            onBack={onBackFromStep2}
            onNext={onProceedToChildren}
          />
        )}

        {step === 3 && (
          <Step3ChildAttributeSelection
            childAttributes={childAttributes}
            selectedChildAttributeIds={selectedChildAttributeIds}
            minChildAttributes={minChildAttributes}
            maxChildAttributes={maxChildAttributes}
            onToggleChildAttribute={onToggleChildAttribute}
            onBack={onBackFromStep3}
            onCreate={handleCreate}
            isValid={isStep3Valid()}
          />
        )}
      </div>
    </Modal>
  );
};
