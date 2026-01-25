"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";

/**
 * Modal to display full history of attribute entries
 * Allows users to view, edit, and delete past entries
 * Fetches full history with IDs from the API
 */
export default function HistoryModal({
  isOpen,
  onClose,
  childAttribute,
  onEditClick,
  onDeleteClick,
  dashboardId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch full history with IDs when modal opens
  useEffect(() => {
    if (!isOpen || !childAttribute || !dashboardId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const attributeId = childAttribute.id || childAttribute.attribute_id;
        const response = await apiClient.getAuth(
          `/api/dashboards/attribute-values/${dashboardId}/${attributeId}?limit=100`
        );

        if (response.data && Array.isArray(response.data)) {
          setHistoryData(response.data);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, childAttribute, dashboardId]);

  if (!isOpen || !childAttribute) return null;

  const childName = childAttribute.display_name || childAttribute.name || "History";
  const unit = childAttribute.unit || "";

  // Use fetched history data (with IDs) instead of attribute.values
  const childValues = historyData.length > 0 ? historyData : (childAttribute.values || []);

  // Filter values based on search query
  const filteredValues = childValues.filter((valueItem) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const value = valueItem.value?.toString() || "";
    const date = new Date(valueItem.timestamp).toLocaleDateString();
    return value.includes(searchLower) || date.includes(searchLower);
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {childName} History
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {childValues.length} {childValues.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by value or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading history...</p>
            </div>
          ) : filteredValues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? "No entries found" : "No history available"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredValues.map((valueItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-900">
                        {valueItem.value} {unit}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(valueItem.timestamp)}
                      </span>
                    </div>
                    {valueItem.created_by_name && (
                      <p className="text-xs text-gray-400 mt-1">
                        Added by {valueItem.created_by_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onEditClick(childAttribute, valueItem);
                        onClose();
                      }}
                      className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    {valueItem.id && (
                      <button
                        onClick={() => onDeleteClick(childAttribute, valueItem)}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
