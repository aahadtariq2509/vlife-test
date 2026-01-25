"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import BudgetGoalsCard from "../BudgetGoalsCard";
import { apiAuth } from "@/lib/api-client";
import { useToastContext } from "@/components/providers/ToastProvider";
import { createDashboardAPI } from "@/lib/dashboard-api";

export default function BudgetGoalsSection({
  budgetGoals,
  setBudgetGoals,
  dashboardId,
  manageExpensesAttr,
  setManageExpensesAttr,
  accessToken,
}) {
  const { success, error: showError } = useToastContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");

  const handleAddBudget = async () => {
    const amount = parseFloat(newBudgetAmount);
    if (
      !newBudgetCategory ||
      !newBudgetAmount ||
      isNaN(amount) ||
      amount <= 0 ||
      !dashboardId ||
      !manageExpensesAttr
    ) {
      showError("Error", "Please fill all fields with valid values");
      return;
    }

    try {
      const requestBody = {
        parent_id: manageExpensesAttr.attribute_id,
        displayName: newBudgetCategory,
        unit: "USD",
        value_type: "number",
        targetValue: String(amount),
      };

      const response = await apiAuth(
        `/api/dashboards/attributes/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.success || response.status === "success") {
        success("Success", "Budget category added successfully");
        setNewBudgetCategory("");
        setNewBudgetAmount("");
        setShowAddModal(false);

        // Refresh dashboard data to get the new category
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes =
          dashboardDataResponse.data?.dashboard_attributes || [];

        const manageExpenses = attributes.find(
          (attr) => attr.name === "manage_expenses"
        );

        if (manageExpenses) {
          setManageExpensesAttr(manageExpenses);

          const budgets = (manageExpenses.attributes || []).map((child) => ({
            id: child.id,
            title: child.display_name || child.name,
            budget: parseInt(child.target_value?.value) || 0,
            target_value_id: child.target_value_id,
            attribute_id: child.id,
            spent: 0,
          }));

          setBudgetGoals(budgets);
        }
      } else {
        throw new Error(response.message || "Failed to add budget category");
      }
    } catch (err) {
      console.error("Error adding budget:", err);
      showError("Error", err.message || "Failed to add budget category");
    }
  };

  const handleDeleteBudget = async (budgetItem) => {
    try {
      const response = await apiAuth(
        `/api/dashboards/attributes/${dashboardId}/${budgetItem.attribute_id}`,
        {
          method: "DELETE",
        }
      );

      if (response.success || response.status === "success") {
        success("Success", "Budget category deleted successfully");
        setBudgetGoals(budgetGoals.filter((b) => b.id !== budgetItem.id));
      } else {
        throw new Error(response.message || "Failed to delete budget category");
      }
    } catch (err) {
      console.error("Error deleting budget:", err);
      showError("Error", err.message || "Failed to delete budget category");
    }
  };

  const handleUpdateBudget = async (budgetItem, newAmount, newName = null) => {
    if (newAmount < 0) return;

    try {
      const requestBody = {
        attribute_id: budgetItem.attribute_id,
        displayName: newName || budgetItem.title,
        unit: "USD",
        value_type: "number",
        target_value_id: budgetItem.target_value_id,
        targetValue: String(newAmount),
      };

      const response = await apiAuth(
        `/api/dashboards/attributes/update/${dashboardId}`,
        {
          method: "PUT",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.success || response.status === "success") {
        setBudgetGoals(
          budgetGoals.map((b) =>
            b.id === budgetItem.id
              ? { ...b, budget: newAmount, title: newName || b.title }
              : b
          )
        );
        success("Success", "Budget updated successfully");
      } else {
        throw new Error(response.message || "Failed to update budget");
      }
    } catch (err) {
      console.error("Error updating budget:", err);
      showError("Error", err.message || "Failed to update budget");
    }
  };

  return (
    <>
      <BudgetGoalsCard
        budgetGoals={budgetGoals}
        handleDeleteBudget={handleDeleteBudget}
        handleUpdateBudget={handleUpdateBudget}
        onAddClick={() => setShowAddModal(true)}
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Budget Category"
        size="md"
      >
        <div className="space-y-2">
          <Input
            type="text"
            label="Category Name"
            placeholder="e.g., Groceries, Rent, Travel"
            value={newBudgetCategory}
            onChange={(e) => setNewBudgetCategory(e.target.value)}
            autoFocus
          />
          <Input type="text" label="Unit" value="USD" disabled />
          <Input
            type="number"
            label="Budget Amount ($)"
            placeholder="Enter target amount"
            value={newBudgetAmount}
            onChange={(e) => setNewBudgetAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <Button onClick={handleAddBudget} width="w-full">
            Add Budget Category
          </Button>
        </div>
      </Modal>
    </>
  );
}
