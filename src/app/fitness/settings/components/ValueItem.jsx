"use client";

/**
 * Component for displaying individual value items with timestamp
 * Extracted from nested JSX for better reusability
 */
export default function ValueItem({ valueItem, unit, onEdit }) {
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
