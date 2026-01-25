import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export const DeleteWidgetModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Widget" size="sm">
      <div className="p-2">
        <p className="text-gray-700 mb-5">
          Are you sure you want to delete this widget? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            className="rounded-full bg-gray-200 text-gray-700"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="rounded-full bg-red-500 text-white"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
