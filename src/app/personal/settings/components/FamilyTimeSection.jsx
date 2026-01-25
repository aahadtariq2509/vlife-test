"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Icon } from "@iconify/react";
import { apiAuth } from "@/lib/api-client";
import { useToastContext } from "@/components/providers/ToastProvider";
import { calculateDayOfYear } from "@/lib/dashboard-utils";

export default function FamilyTimeSection({
  dashboardId,
  familyTimeAttr,
  isOpen,
  onClose,
}) {
  const { success, error: showError } = useToastContext();
  const [familyTimeEntries, setFamilyTimeEntries] = useState([]);
  const [newFamilyTimeHours, setNewFamilyTimeHours] = useState(0);
  const [newFamilyTimeDate, setNewFamilyTimeDate] = useState("");
  const [editingFamilyTime, setEditingFamilyTime] = useState(null);

  // Initialize entries from familyTimeAttr if provided
  useState(() => {
    if (familyTimeAttr && familyTimeAttr.values && familyTimeAttr.values.length > 0) {
      const timeEntries = familyTimeAttr.values.map((value, index) => ({
        id: `${familyTimeAttr.attribute_id}_${index}`,
        date: value.timestamp
          ? new Date(value.timestamp).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        hours: parseFloat(value.value) || 0,
        createdBy: value.created_by_name || "You",
      }));
      setFamilyTimeEntries(timeEntries);
    }
  }, [familyTimeAttr]);

  const handleAddFamilyTime = async () => {
    if (
      !newFamilyTimeHours ||
      newFamilyTimeHours <= 0 ||
      !newFamilyTimeDate ||
      !dashboardId ||
      !familyTimeAttr
    ) {
      showError("Error", "Please fill all fields with valid values");
      return;
    }

    try {
      const timestamp = new Date(newFamilyTimeDate).toISOString();
      const requestBody = {
        attributeId: familyTimeAttr.attribute_id,
        value: String(newFamilyTimeHours),
        timestamp: timestamp,
        createdWith: "M", // M = Manual
      };

      // Add dayOfYear if is_multivalue is false
      if (familyTimeAttr.is_multivalue === false || familyTimeAttr.is_multi_value === false) {
        requestBody.dayOfYear = calculateDayOfYear(new Date(newFamilyTimeDate));
      }

      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.success || response.status === "success") {
        success("Success", "Family time logged successfully");

        // Add to UI
        const newEntry = {
          id: `${familyTimeAttr.attribute_id}_${Date.now()}`,
          date: newFamilyTimeDate,
          hours: parseFloat(newFamilyTimeHours),
          createdBy: "You",
        };
        setFamilyTimeEntries([newEntry, ...familyTimeEntries]);

        setNewFamilyTimeHours(0);
        setNewFamilyTimeDate("");
      } else {
        throw new Error(response.message || "Failed to log family time");
      }
    } catch (err) {
      console.error("Error adding family time:", err);
      showError("Error", err.message || "Failed to log family time");
    }
  };

  const handleDeleteFamilyTime = async (entryId) => {
    try {
      // Note: Deletion of attribute values requires the value ID, not the attribute ID
      // This is a UI-only deletion for now. Backend needs to provide value IDs in the response
      setFamilyTimeEntries(
        familyTimeEntries.filter((entry) => entry.id !== entryId)
      );
      success("Success", "Family time entry removed");
    } catch (err) {
      console.error("Error deleting family time:", err);
      showError("Error", "Failed to delete family time entry");
    }
  };

  const handleUpdateFamilyTime = async (entry, newHours, newDate) => {
    if (!newHours || newHours <= 0 || !newDate) {
      showError("Error", "Please provide valid hours and date");
      return;
    }

    try {
      // Note: Backend needs to provide value IDs for this to work via API
      // For now, updating UI only

      setFamilyTimeEntries(
        familyTimeEntries.map((item) =>
          item.id === entry.id
            ? {
                ...item,
                hours: parseFloat(newHours),
                date: new Date(newDate).toISOString().split("T")[0],
              }
            : item
        )
      );

      success(
        "Success",
        "Family time updated successfully (UI only - will persist when backend provides value IDs)"
      );
      setEditingFamilyTime(null);
    } catch (err) {
      console.error("Error updating family time:", err);
      showError("Error", err.message || "Failed to update family time");
    }
  };

  return (
    <>
      {/* Main Family Time Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Family Time Spent"
        size="xl"
      >
        <div className="space-y-6">
          {/* Add Family Time Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Log Family Time
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Hours Spent"
                placeholder="Enter hours"
                min="0"
                step="0.5"
                value={newFamilyTimeHours || ""}
                onChange={(e) =>
                  setNewFamilyTimeHours(parseFloat(e.target.value) || 0)
                }
              />
              <Input
                type="date"
                label="Date"
                value={newFamilyTimeDate}
                onChange={(e) => setNewFamilyTimeDate(e.target.value)}
              />
            </div>
            <Button onClick={handleAddFamilyTime} width="w-full" className="mt-4">
              Log Time
            </Button>
          </div>

          {/* Existing Family Time Entries */}
          {familyTimeEntries.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Recent Entries
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Logged By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyTimeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-blue-600">
                          {entry.hours} hrs
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {entry.createdBy}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => setEditingFamilyTime(entry)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFamilyTime(entry.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon
                icon="mdi:family"
                className="w-16 h-16 mx-auto mb-3 text-gray-300"
              />
              <p>No family time logged yet</p>
              <p className="text-sm">Log your first entry above</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Family Time Modal */}
      <Modal
        isOpen={editingFamilyTime !== null}
        onClose={() => setEditingFamilyTime(null)}
        title="Edit Family Time"
        size="md"
      >
        {editingFamilyTime && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Editing Entry</p>
              <p className="font-medium">
                {new Date(editingFamilyTime.date).toLocaleDateString()} -{" "}
                {editingFamilyTime.hours} hours
              </p>
            </div>
            <Input
              type="number"
              label="Hours Spent"
              placeholder="Enter hours"
              min="0"
              step="0.5"
              defaultValue={editingFamilyTime.hours}
              onChange={(e) => {
                setEditingFamilyTime({
                  ...editingFamilyTime,
                  hours: parseFloat(e.target.value) || 0,
                });
              }}
            />
            <Input
              type="date"
              label="Date"
              defaultValue={editingFamilyTime.date}
              onChange={(e) => {
                setEditingFamilyTime({
                  ...editingFamilyTime,
                  date: e.target.value,
                });
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  handleUpdateFamilyTime(
                    editingFamilyTime,
                    editingFamilyTime.hours,
                    editingFamilyTime.date
                  )
                }
                width="w-full"
              >
                Update Entry
              </Button>
              <Button
                onClick={() => setEditingFamilyTime(null)}
                variant="outline"
                width="w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
