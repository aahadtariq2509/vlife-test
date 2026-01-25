"use client";

import { useState } from "react";
import { History } from "lucide-react";
import HistoryModal from "./HistoryModal";

/**
 * Component for displaying attribute cards with add/edit/delete functionality
 * Extracted from the deeply nested JSX in the main page (lines 761-927)
 */
export default function AttributeCard({ attribute, attributeId, onAddClick, onEditClick, onDeleteClick, dashboardId }) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const attributeName =
    attribute.display_name ||
    attribute.name ||
    attribute.title ||
    attribute.label ||
    "Untitled";

  const attributeValues = attribute.values || [];
  const hasValues = attributeValues.length > 0;

  // Helper function to check if a date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Filter to show only today's values
  const todayValues = attributeValues.filter((valueItem) =>
    isToday(valueItem.timestamp || valueItem.created_at || valueItem.date)
  );

  return (
    <>
      <div className="space-y-3">
        {/* Header with attribute name and buttons */}
        <div className="flex items-center justify-between">
          <span className="text-[#4D4D4D] text-sm font-semibold">
            {attributeName}
          </span>
          <div className="flex items-center gap-2">
            {/* History Button */}
            {hasValues && (
              <button
                onClick={() => setHistoryModalOpen(true)}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                title="View history"
              >
                <History className="w-3 h-3" />
                History
              </button>
            )}
            {/* Add Button */}
            <button
              onClick={() =>
                onAddClick({
                  ...attribute,
                  attributeId,
                  type: "attribute",
                })
              }
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Display today's values only */}
        {todayValues.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {todayValues.map((valueItem, vIndex) => (
              <ValueItem
                key={vIndex}
                valueItem={valueItem}
                unit={attribute.unit || ""}
                onEdit={() =>
                  onEditClick(
                    { ...attribute, attributeId, type: "attribute" },
                    valueItem
                  )
                }
              />
            ))}
          </div>
        )}

        {/* Show message if no today's values but has history */}
        {todayValues.length === 0 && attributeValues.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">No entries for today</p>
          </div>
        )}
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        childAttribute={attribute}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        dashboardId={dashboardId}
      />
    </>
  );
}

/**
 * Component for displaying individual value items
 * Separated for better reusability
 */
function ValueItem({ valueItem, unit, onEdit }) {
  return (
    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-200">
      <div className="flex-1">
        <span className="text-sm text-gray-900">
          {valueItem.value} {unit}
        </span>
        {valueItem.timestamp && (
          <span className="text-xs text-gray-500 ml-2">
            ({new Date(valueItem.timestamp).toLocaleDateString()})
          </span>
        )}
      </div>
      <button
        onClick={onEdit}
        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
      >
        Edit
      </button>
    </div>
  );
}
