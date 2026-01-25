"use client";

import { useState } from "react";
import ValueItem from "./ValueItem";
import HistoryModal from "./HistoryModal";
import { History } from "lucide-react";

/**
 * Component for displaying child attributes with their values
 * Extracted from the deeply nested JSX in the main page
 */
export default function ChildAttributeList({ children, attributeId, onAddClick, onEditClick, onDeleteClick, dashboardId }) {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedChildForHistory, setSelectedChildForHistory] = useState(null);

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

  const openHistoryModal = (child) => {
    setSelectedChildForHistory(child);
    setHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedChildForHistory(null);
  };
  return (
    <>
      <div className="space-y-3">
        {children.map((child, index) => {
          const childName =
            child.display_name ||
            child.name ||
            child.title ||
            child.label ||
            `Child ${index + 1}`;
          const childId = child.id || child.childId || index;
          const childValues = child.values || [];

          // Filter to show only today's values
          const todayValues = childValues.filter((valueItem) =>
            isToday(valueItem.timestamp || valueItem.created_at || valueItem.date)
          );

          return (
            <div key={childId} className="space-y-2">
              {/* Child Header with Add and History Buttons */}
              <div className="flex items-center justify-between">
                <span className="text-[#4D4D4D] text-sm font-semibold">
                  {childName}
                </span>
                <div className="flex items-center gap-2">
                  {/* History Button */}
                  {childValues.length > 0 && (
                    <button
                      onClick={() => openHistoryModal(child)}
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
                        ...child,
                        attributeId,
                        childId,
                        type: "child",
                      })
                    }
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Display today's values only */}
              {todayValues.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {todayValues.map((valueItem, vIndex) => (
                    <ValueItem
                      key={vIndex}
                      valueItem={valueItem}
                      unit={child.unit || ""}
                      onEdit={() =>
                        onEditClick(
                          { ...child, attributeId, childId, type: "child" },
                          valueItem
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400">No entries for today</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={closeHistoryModal}
        childAttribute={selectedChildForHistory}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        dashboardId={dashboardId}
      />
    </>
  );
}
