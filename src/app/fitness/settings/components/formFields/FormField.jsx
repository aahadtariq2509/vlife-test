"use client";

import Input from "@/components/ui/Input";
import SingleSelect from "@/components/ui/SingleSelect";

/**
 * Universal form field component that renders different field types
 * Replaces the massive 192-line renderFormField switch statement
 */
export default function FormField({ field, value, onChange }) {
  const commonClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const renderField = () => {
    switch (field.type) {
      case "select":
      case "dropdown":
        const options = field.options?.map((opt) => ({
          value: opt.value || opt,
          label: opt.label || opt,
        })) || [];
        return (
          <SingleSelect
            options={options}
            value={value || ""}
            onChange={(selected) => onChange(field.name, selected)}
            placeholder={field.placeholder || `Select ${field.label}`}
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option.value || option}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.name}
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  {option.label || option}
                </span>
              </label>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder || "Enter value"}
            min={field.min}
            max={field.max}
            step={field.step || "any"}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder || "Enter text"}
            rows={field.rows || 4}
            className={commonClasses + " resize-none"}
          />
        );

      case "text":
      default:
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder || "Enter value"}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== "checkbox" && (
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderField()}
      {field.description && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
    </div>
  );
}
