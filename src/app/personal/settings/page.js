"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/hooks";
import { useAuthErrorHandler } from "@/hooks/useAuthErrorHandler";
import { createDashboardAPI } from "@/lib/dashboard-api";
import { apiAuth } from "@/lib/api-client";
import { useToastContext } from "@/components/providers/ToastProvider";
import { calculateDayOfYear } from "@/lib/dashboard-utils";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import SingleSelect from "@/components/ui/SingleSelect";
import {
  Users,
  Wallet,
  TrendingUp,
  FileText,
  Share2,
  ChevronRight,
  Plus,
} from "lucide-react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Icon } from "@iconify/react";

// Import new components
import SectionCard from "./components/SectionCard";
import FamilyTimeSection from "./components/FamilyTimeSection";
import BudgetGoalsSection from "./components/BudgetGoalsSection";
import SocialMediaSection from "./components/SocialMediaSection";
import BudgetGoalsCard from "./BudgetGoalsCard";

export default function PersonalSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const { handleAuthError } = useAuthErrorHandler();
  const { success, error: showError } = useToastContext();

  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardId, setDashboardId] = useState(null);

  // Budget Goals state
  const [budgetGoals, setBudgetGoals] = useState([]);
  const [manageExpensesAttr, setManageExpensesAttr] = useState(null);
  const [budgetHeadsAttr, setBudgetHeadsAttr] = useState(null);

  // Income Sources state
  const [incomeSources, setIncomeSources] = useState([]);
  const [newIncomeSource, setNewIncomeSource] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeDate, setNewIncomeDate] = useState("");
  const [newIncomeType, setNewIncomeType] = useState(null);
  const [incomeTypeOptions, setIncomeTypeOptions] = useState([]);
  const [addIncomeAttr, setAddIncomeAttr] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingIncomeHistory, setEditingIncomeHistory] = useState(null);

  // Income Source Types management state
  const [newIncomeSourceName, setNewIncomeSourceName] = useState("");
  const [newIncomeSourceTargetValue, setNewIncomeSourceTargetValue] = useState("");
  const [addingIncomeSource, setAddingIncomeSource] = useState(false);
  const [editingIncomeSource, setEditingIncomeSource] = useState(null);

  // Income History state
  const [viewingIncomeHistory, setViewingIncomeHistory] = useState(null);
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Expenses state
  const [expenses, setExpenses] = useState([]);
  const [newExpenseCategory, setNewExpenseCategory] = useState(null);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseDate, setNewExpenseDate] = useState("");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [expenseCategoryOptions, setExpenseCategoryOptions] = useState([]);
  const [activeSection, setActiveSection] = useState("main");
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpenseHistory, setViewingExpenseHistory] = useState(null);
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [editingExpenseHistory, setEditingExpenseHistory] = useState(null);

  // Family Time Spent state
  const [familyTimeAttr, setFamilyTimeAttr] = useState(null);

  // Contacts Management state
  const [contacts, setContacts] = useState({ friends: [], family: [] });
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState("friend");

  // Live Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addingContact, setAddingContact] = useState(false);

  // Share Dashboard state
  const [sharingDashboard, setSharingDashboard] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState("friends");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !accessToken) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const api = createDashboardAPI(accessToken);
        const dashboardsResponse = await api.fetchDashboards(10, 0);

        // Find the user's OWN personal dashboard (not shared ones)
        // CRITICAL: Settings should ALWAYS use the owner's dashboard, never shared dashboards
        const personalDashboard = dashboardsResponse.data.dashboards.find(
          (dashboard) =>
            (dashboard.category === "personal" ||
              dashboard.name.toLowerCase().includes("personal")) &&
            !dashboard.is_shared_dashboard // Exclude shared dashboards
        );

        if (!personalDashboard) {
          throw new Error("Personal dashboard not found");
        }

        setDashboardId(personalDashboard.id);

        // Fetch the specific dashboard data
        const dashboardDataResponse = await api.fetchDashboardData(
          personalDashboard.id
        );

        // Extract and map attributes to settings
        const attributes =
          dashboardDataResponse.data?.dashboard_attributes || [];

        // Find the manage_expenses attribute (parent with expense categories)
        const manageExpenses = attributes.find(
          (attr) => attr.name === "manage_expenses"
        );

        // Find the budget_heads attribute (mutable parent for adding budget categories)
        const budgetHeads = attributes.find(
          (attr) => attr.name === "budget_heads"
        );

        // Find the add_income attribute (parent with income types)
        const addIncome = attributes.find((attr) => attr.name === "add_income");

        if (manageExpenses) {
          setManageExpensesAttr(manageExpenses);

          // Map existing expense categories to budget goals
          const budgets = (manageExpenses.attributes || []).map((child) => ({
            id: child.id,
            title: child.display_name || child.name,
            budget: parseInt(child.target_value?.value) || 0,
            target_value_id: child.target_value_id,
            attribute_id: child.id,
            spent: 0, // TODO: Calculate from values
          }));

          setBudgetGoals(budgets);

          // Create expense category options from child attributes
          const expenseOptions = (manageExpenses.attributes || []).map(
            (child) => ({
              value: child.id,
              label: child.display_name || child.name,
              attributeId: child.id,
              is_multivalue: child.is_multivalue ?? child.is_multi_value, // Store is_multivalue flag
            })
          );
          setExpenseCategoryOptions(expenseOptions);
        }

        if (budgetHeads) {
          setBudgetHeadsAttr(budgetHeads);
        }

        if (addIncome) {
          setAddIncomeAttr(addIncome);

          // Create income type options from child attributes
          const incomeOptions = (addIncome.attributes || []).map((child) => ({
            value: child.id,
            label: child.display_name || child.name,
            attributeId: child.id,
            is_multivalue: child.is_multivalue ?? child.is_multi_value, // Store is_multivalue flag
            targetValue: child.target_value?.value || "0",
            target_value_id: child.target_value_id,
          }));
          setIncomeTypeOptions(incomeOptions);
        }

        // Map income sources from attributes - Store full child attribute data
        const addIncomeAttr = attributes.find((attr) => attr.name === "add_income");
        if (addIncomeAttr && addIncomeAttr.attributes && addIncomeAttr.attributes.length > 0) {
          const incomes = addIncomeAttr.attributes.map((child) => {
            const latestValue = child.values?.[0];
            return {
              id: child.id,
              attributeId: child.id,
              title: child.display_name || child.name || "Income Source",
              date: latestValue?.timestamp
                ? new Date(latestValue.timestamp).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              salary: parseInt(latestValue?.value) || 0,
              type: "monthly",
              // Store the full child attribute for history
              childAttribute: child,
            };
          });
          setIncomeSources(incomes);
        }

        // Map expenses from attributes
        const expenseAttributes = attributes.filter(
          (attr) =>
            attr.name?.toLowerCase().includes("expense") ||
            attr.name?.toLowerCase().includes("spending") ||
            attr.name?.toLowerCase().includes("transaction")
        );

        if (expenseAttributes.length > 0) {
          const expenseList = [];
          expenseAttributes.forEach((attr, index) => {
            if (attr.attributes && attr.attributes.length > 0) {
              attr.attributes.forEach((child, childIndex) => {
                const latestValue = child.values?.[0];
                expenseList.push({
                  id: child.attribute_id || Date.now() + childIndex,
                  title: child.display_name || child.name || "Expense",
                  name: child.display_name || child.name || "Expense Item",
                  date: latestValue?.timestamp
                    ? new Date(latestValue.timestamp)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  amount: -Math.abs(parseInt(latestValue?.value) || 0),
                });
              });
            } else if (attr.values && attr.values.length > 0) {
              attr.values.slice(0, 10).forEach((value, valueIndex) => {
                expenseList.push({
                  id:
                    `${attr.attribute_id}_${valueIndex}` ||
                    Date.now() + valueIndex,
                  title: attr.display_name || attr.name || "Expense",
                  name: attr.display_name || attr.name || "Expense Item",
                  date: value.timestamp
                    ? new Date(value.timestamp).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  amount: -Math.abs(parseInt(value.value) || 0),
                });
              });
            }
          });
          setExpenses(expenseList);
        }

        // Find and process family_time_spent attribute
        const familyTimeAttribute = attributes.find(
          (attr) => attr.name === "family_time_spent"
        );

        if (familyTimeAttribute) {
          setFamilyTimeAttr(familyTimeAttribute);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        const wasAuthError = await handleAuthError(err);
        if (!wasAuthError) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, accessToken, router]);

  // Income Source Types handlers
  const handleEditIncomeSource = (incomeSource) => {
    setEditingIncomeSource(incomeSource);
    setNewIncomeSourceName(incomeSource.label);
    setNewIncomeSourceTargetValue(incomeSource.targetValue);
  };

  const handleUpdateIncomeSource = async () => {
    if (!newIncomeSourceName || !newIncomeSourceName.trim()) {
      showError("Error", "Please enter an income source name");
      return;
    }

    if (!newIncomeSourceTargetValue || !newIncomeSourceTargetValue.trim()) {
      showError("Error", "Please enter a target value");
      return;
    }

    if (!editingIncomeSource || !dashboardId) {
      showError("Error", "Dashboard not loaded properly");
      return;
    }

    try {
      setAddingIncomeSource(true);

      const response = await apiAuth(
        `/api/dashboards/attributes/update/${dashboardId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            attribute_id: editingIncomeSource.attributeId,
            displayName: newIncomeSourceName.trim(),
            unit: "USD",
            value_type: "number",
            targetValue: newIncomeSourceTargetValue.trim(),
            target_value_id: editingIncomeSource.target_value_id,
          }),
        }
      );

      if (response.success || response.status === "success" || response.data) {
        success("Success", `Income source "${newIncomeSourceName}" updated successfully!`);
        setNewIncomeSourceName("");
        setNewIncomeSourceTargetValue("");
        setEditingIncomeSource(null);

        // Refresh dashboard data
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes = dashboardDataResponse.data?.dashboard_attributes || [];

        const addIncome = attributes.find((attr) => attr.name === "add_income");
        if (addIncome) {
          setAddIncomeAttr(addIncome);

          const incomeOptions = (addIncome.attributes || []).map((child) => ({
            value: child.id,
            label: child.display_name || child.name,
            attributeId: child.id,
            is_multivalue: child.is_multivalue ?? child.is_multi_value,
            targetValue: child.target_value?.value || "0",
            target_value_id: child.target_value_id,
          }));
          setIncomeTypeOptions(incomeOptions);
        }

        setActiveModal("manage-income-sources");
      } else {
        throw new Error(response.message || "Failed to update income source");
      }
    } catch (err) {
      console.error("Error updating income source:", err);
      showError("Error", err.message || "Failed to update income source");
    } finally {
      setAddingIncomeSource(false);
    }
  };

  const handleDeleteIncomeSource = async (incomeSource) => {
    if (!incomeSource.attributeId || !dashboardId) {
      showError("Error", "Cannot delete this income source");
      return;
    }

    // Confirm delete
    if (!window.confirm(`Are you sure you want to delete "${incomeSource.label}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attributes/${dashboardId}/${incomeSource.attributeId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success || response.status === "success") {
        success("Success", `Income source "${incomeSource.label}" deleted successfully!`);

        // Refresh dashboard data
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes = dashboardDataResponse.data?.dashboard_attributes || [];

        const addIncome = attributes.find((attr) => attr.name === "add_income");
        if (addIncome) {
          setAddIncomeAttr(addIncome);

          const incomeOptions = (addIncome.attributes || []).map((child) => ({
            value: child.id,
            label: child.display_name || child.name,
            attributeId: child.id,
            is_multivalue: child.is_multivalue ?? child.is_multi_value,
            targetValue: child.target_value?.value || "0",
            target_value_id: child.target_value_id,
          }));
          setIncomeTypeOptions(incomeOptions);
        }
      } else {
        throw new Error(response.message || "Failed to delete income source");
      }
    } catch (err) {
      console.error("Error deleting income source:", err);
      showError("Error", err.message || "Failed to delete income source");
    }
  };

  const handleAddIncomeSource = async () => {
    if (!newIncomeSourceName || !newIncomeSourceName.trim()) {
      showError("Error", "Please enter an income source name");
      return;
    }

    if (!newIncomeSourceTargetValue || !newIncomeSourceTargetValue.trim()) {
      showError("Error", "Please enter a target value");
      return;
    }

    if (!addIncomeAttr || !dashboardId) {
      showError("Error", "Dashboard not loaded properly");
      return;
    }

    try {
      setAddingIncomeSource(true);

      const response = await apiAuth(
        `/api/dashboards/attributes/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify({
            parent_id: addIncomeAttr.attribute_id,
            displayName: newIncomeSourceName.trim(),
            unit: "USD",
            value_type: "number",
            targetValue: newIncomeSourceTargetValue.trim(),
          }),
        }
      );

      if (response.success || response.status === "success" || response.data) {
        success("Success", `Income source "${newIncomeSourceName}" added successfully!`);
        setNewIncomeSourceName("");
        setNewIncomeSourceTargetValue("");

        // Refresh dashboard data to get the new income source
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes = dashboardDataResponse.data?.dashboard_attributes || [];

        // Update add_income attribute with new child
        const addIncome = attributes.find((attr) => attr.name === "add_income");
        if (addIncome) {
          setAddIncomeAttr(addIncome);

          // Update income type options
          const incomeOptions = (addIncome.attributes || []).map((child) => ({
            value: child.id,
            label: child.display_name || child.name,
            attributeId: child.id,
            is_multivalue: child.is_multivalue ?? child.is_multi_value,
          }));
          setIncomeTypeOptions(incomeOptions);
        }

        // Clear form and go back to list
        setNewIncomeSourceName("");
        setNewIncomeSourceTargetValue("");
        setActiveModal("manage-income-sources");
      } else {
        throw new Error(response.message || "Failed to add income source");
      }
    } catch (err) {
      console.error("Error adding income source:", err);
      showError("Error", err.message || "Failed to add income source");
    } finally {
      setAddingIncomeSource(false);
    }
  };

  // Income History handlers
  const handleViewIncomeHistory = async (incomeSource) => {
    setViewingIncomeHistory(incomeSource);
    setLoadingHistory(true);

    try {
      // Fetch values with IDs using the proper API endpoint
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${incomeSource.attributeId}?limit=100`,
        {
          method: "GET",
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const history = response.data.map((value) => ({
          id: value.id,
          valueId: value.id, // Store the actual value ID for edit/delete
          value: value.value,
          timestamp: value.timestamp,
          date: new Date(value.timestamp).toLocaleDateString(),
          createdBy: value.created_by_name || "Unknown",
        }));
        setIncomeHistory(history);
      } else {
        setIncomeHistory([]);
      }
    } catch (err) {
      console.error("Error fetching income history:", err);
      showError("Error", "Failed to load income history");
      setIncomeHistory([]);
    } finally {
      setLoadingHistory(false);
    }

    setActiveModal("income-history");
  };

  // Handle delete income history entry
  const handleDeleteIncomeHistory = async (entry) => {
    if (!entry.valueId || !dashboardId) {
      showError("Error", "Cannot delete this entry");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${entry.valueId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success || response.status === "success") {
        success("Success", "Income entry deleted successfully!");

        // Refresh income history
        setIncomeHistory(incomeHistory.filter(item => item.id !== entry.id));

        // Refresh dashboard data to update the main list
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes = dashboardDataResponse.data?.dashboard_attributes || [];

        const addIncomeRefreshed = attributes.find((attr) => attr.name === "add_income");
        if (addIncomeRefreshed && addIncomeRefreshed.attributes) {
          const incomes = addIncomeRefreshed.attributes.map((child) => {
            const latestValue = child.values?.[0];
            return {
              id: child.id,
              attributeId: child.id,
              title: child.display_name || child.name || "Income Source",
              date: latestValue?.timestamp
                ? new Date(latestValue.timestamp).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              salary: parseInt(latestValue?.value) || 0,
              type: "monthly",
              childAttribute: child,
            };
          });
          setIncomeSources(incomes);
        }
      } else {
        throw new Error(response.message || "Failed to delete income entry");
      }
    } catch (err) {
      console.error("Error deleting income entry:", err);
      showError("Error", err.message || "Failed to delete income entry");
    }
  };

  // Handle edit income history entry
  const handleEditIncomeHistory = (entry) => {
    setEditingIncomeHistory(entry);
  };

  // Handle update income history entry
  const handleUpdateIncomeHistory = async () => {
    if (!editingIncomeHistory || !editingIncomeHistory.valueId || !dashboardId) {
      showError("Error", "Cannot update this entry");
      return;
    }

    if (!editingIncomeHistory.value || parseFloat(editingIncomeHistory.value) <= 0) {
      showError("Error", "Please enter a valid amount");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${editingIncomeHistory.valueId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            value: String(editingIncomeHistory.value),
            timestamp: editingIncomeHistory.timestamp,
          }),
        }
      );

      if (response.success || response.status === "success") {
        success("Success", "Income entry updated successfully!");

        // Update local history
        setIncomeHistory(incomeHistory.map(item =>
          item.id === editingIncomeHistory.id ? editingIncomeHistory : item
        ));
        setEditingIncomeHistory(null);

        // Refresh dashboard data
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes = dashboardDataResponse.data?.dashboard_attributes || [];

        const addIncomeRefreshed = attributes.find((attr) => attr.name === "add_income");
        if (addIncomeRefreshed && addIncomeRefreshed.attributes) {
          const incomes = addIncomeRefreshed.attributes.map((child) => {
            const latestValue = child.values?.[0];
            return {
              id: child.id,
              attributeId: child.id,
              title: child.display_name || child.name || "Income Source",
              date: latestValue?.timestamp
                ? new Date(latestValue.timestamp).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              salary: parseInt(latestValue?.value) || 0,
              type: "monthly",
              childAttribute: child,
            };
          });
          setIncomeSources(incomes);
        }
      } else {
        throw new Error(response.message || "Failed to update income entry");
      }
    } catch (err) {
      console.error("Error updating income entry:", err);
      showError("Error", err.message || "Failed to update income entry");
    }
  };

  // Income Sources handlers
  const handleAddIncome = async () => {
    if (
      !newIncomeAmount ||
      parseFloat(newIncomeAmount) <= 0 ||
      !newIncomeType ||
      !dashboardId
    ) {
      showError("Error", "Please fill all required fields");
      return;
    }

    try {
      // Use current date since we removed the date field
      const timestamp = new Date().toISOString();
      const requestBody = {
        attributeId: newIncomeType.attributeId,
        value: String(newIncomeAmount),
        timestamp: timestamp,
        createdWith: "M",
      };

      // Add dayOfYear if is_multivalue is false
      if (newIncomeType.is_multivalue === false) {
        requestBody.dayOfYear = calculateDayOfYear(new Date());
      }

      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.success || response.status === "success" || response.data) {
        success("Success", "Income added successfully!");
        setNewIncomeSource("");
        setNewIncomeAmount("");
        setNewIncomeDate("");
        setNewIncomeType(null);
        setActiveModal(null);

        // Refresh dashboard data to get the new income
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes =
          dashboardDataResponse.data?.dashboard_attributes || [];

        // Update income sources from refreshed data
        const addIncomeRefreshed = attributes.find((attr) => attr.name === "add_income");
        if (addIncomeRefreshed && addIncomeRefreshed.attributes && addIncomeRefreshed.attributes.length > 0) {
          const incomes = addIncomeRefreshed.attributes.map((child) => {
            const latestValue = child.values?.[0];
            return {
              id: child.id,
              attributeId: child.id,
              title: child.display_name || child.name || "Income Source",
              date: latestValue?.timestamp
                ? new Date(latestValue.timestamp).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              salary: parseInt(latestValue?.value) || 0,
              type: "monthly",
              childAttribute: child,
            };
          });
          setIncomeSources(incomes);
        }
      } else {
        throw new Error(response.message || "Failed to add income");
      }
    } catch (err) {
      console.error("Error adding income:", err);
      showError("Error", err.message || "Failed to add income");
    }
  };

  // Expenses handlers
  const handleAddExpense = async () => {
    if (
      !newExpenseCategory ||
      !newExpenseAmount ||
      parseFloat(newExpenseAmount) <= 0 ||
      !newExpenseDate ||
      !dashboardId
    ) {
      showError("Error", "Please fill all required fields");
      return;
    }

    try {
      const timestamp = new Date(newExpenseDate).toISOString();
      const requestBody = {
        attributeId: newExpenseCategory.attributeId,
        value: String(newExpenseAmount),
        timestamp: timestamp,
        createdWith: "M",
      };

      // Add dayOfYear if is_multivalue is false
      if (newExpenseCategory.is_multivalue === false) {
        requestBody.dayOfYear = calculateDayOfYear(new Date(newExpenseDate));
      }

      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.success || response.status === "success" || response.data) {
        success("Success", "Expense added successfully!");
        setNewExpenseCategory(null);
        setNewExpenseAmount("");
        setNewExpenseDate("");
        setNewExpenseDescription("");
        setActiveModal(null);

        // Refresh dashboard data to get the new expense
        const api = createDashboardAPI(accessToken);
        const dashboardDataResponse = await api.fetchDashboardData(dashboardId);
        const attributes =
          dashboardDataResponse.data?.dashboard_attributes || [];

        // Update expenses from refreshed data
        const expenseAttributes = attributes.filter(
          (attr) =>
            attr.name?.toLowerCase().includes("expense") ||
            attr.name?.toLowerCase().includes("spending") ||
            attr.name?.toLowerCase().includes("transaction")
        );

        if (expenseAttributes.length > 0) {
          const expenseList = [];
          expenseAttributes.forEach((attr, index) => {
            if (attr.attributes && attr.attributes.length > 0) {
              attr.attributes.forEach((child, childIndex) => {
                const latestValue = child.values?.[0];
                expenseList.push({
                  id: child.attribute_id || Date.now() + childIndex,
                  title: child.display_name || child.name || "Expense",
                  name: child.display_name || child.name || "Expense Item",
                  date: latestValue?.timestamp
                    ? new Date(latestValue.timestamp)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  amount: -Math.abs(parseInt(latestValue?.value) || 0),
                });
              });
            } else if (attr.values && attr.values.length > 0) {
              attr.values.slice(0, 10).forEach((value, valueIndex) => {
                expenseList.push({
                  id:
                    `${attr.attribute_id}_${valueIndex}` ||
                    Date.now() + valueIndex,
                  title: attr.display_name || attr.name || "Expense",
                  name: attr.display_name || attr.name || "Expense Item",
                  date: value.timestamp
                    ? new Date(value.timestamp).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  amount: -Math.abs(parseInt(value.value) || 0),
                });
              });
            }
          });
          setExpenses(expenseList);
        }
      } else {
        throw new Error(response.message || "Failed to add expense");
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      showError("Error", err.message || "Failed to add expense");
    }
  };

  const handleDeleteExpense = async (expenseItem) => {
    try {
      showError(
        "Error",
        "Delete functionality for expense values is not yet available in the API."
      );
      setExpenses(expenses.filter((item) => item.id !== expenseItem.id));
    } catch (err) {
      console.error("Error deleting expense:", err);
      showError("Error", err.message || "Failed to delete expense");
    }
  };

  // Expense History handlers
  const handleViewExpenseHistory = async (expenseCategory) => {
    setViewingExpenseHistory(expenseCategory);
    setLoadingHistory(true);

    try {
      // Fetch values with IDs using the proper API endpoint
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${expenseCategory.attributeId}?limit=100`,
        {
          method: "GET",
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const history = response.data.map((value) => ({
          id: value.id,
          valueId: value.id,
          value: value.value,
          timestamp: value.timestamp,
          date: new Date(value.timestamp).toLocaleDateString(),
          createdBy: value.created_by_name || "Unknown",
        }));
        setExpenseHistory(history);
      } else {
        setExpenseHistory([]);
      }
    } catch (err) {
      console.error("Error fetching expense history:", err);
      showError("Error", "Failed to load expense history");
      setExpenseHistory([]);
    } finally {
      setLoadingHistory(false);
    }

    setActiveModal("expense-history");
  };

  const handleDeleteExpenseHistory = async (entry) => {
    if (!entry.valueId || !dashboardId) {
      showError("Error", "Cannot delete this entry");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${entry.valueId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success || response.status === "success") {
        success("Success", "Expense entry deleted successfully!");

        // Refresh expense history
        setExpenseHistory(expenseHistory.filter(item => item.id !== entry.id));
      } else {
        throw new Error(response.message || "Failed to delete expense entry");
      }
    } catch (err) {
      console.error("Error deleting expense entry:", err);
      showError("Error", err.message || "Failed to delete expense entry");
    }
  };

  const handleEditExpenseHistory = (entry) => {
    setEditingExpenseHistory(entry);
  };

  const handleUpdateExpenseHistory = async () => {
    if (!editingExpenseHistory || !editingExpenseHistory.valueId || !dashboardId) {
      showError("Error", "Cannot update this entry");
      return;
    }

    if (!editingExpenseHistory.value || parseFloat(editingExpenseHistory.value) <= 0) {
      showError("Error", "Please enter a valid amount");
      return;
    }

    try {
      const response = await apiAuth(
        `/api/dashboards/attribute-values/${dashboardId}/${editingExpenseHistory.valueId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            value: String(editingExpenseHistory.value),
            timestamp: editingExpenseHistory.timestamp,
          }),
        }
      );

      if (response.success || response.status === "success") {
        success("Success", "Expense entry updated successfully!");

        // Update local history
        setExpenseHistory(expenseHistory.map(item =>
          item.id === editingExpenseHistory.id ? editingExpenseHistory : item
        ));
        setEditingExpenseHistory(null);
      } else {
        throw new Error(response.message || "Failed to update expense entry");
      }
    } catch (err) {
      console.error("Error updating expense entry:", err);
      showError("Error", err.message || "Failed to update expense entry");
    }
  };

  const handleUpdateExpense = async (expenseItem, newAmount, newDate) => {
    if (!newAmount || newAmount <= 0 || !newDate) {
      showError("Error", "Please provide valid amount and date");
      return;
    }

    try {
      setExpenses(
        expenses.map((item) =>
          item.id === expenseItem.id
            ? {
                ...item,
                amount: -Math.abs(newAmount),
                date: new Date(newDate).toISOString().split("T")[0]
              }
            : item
        )
      );

      success("Success", "Expense updated successfully (UI only - will persist when backend provides value IDs)");
      setEditingExpense(null);
    } catch (err) {
      console.error("Error updating expense:", err);
      showError("Error", err.message || "Failed to update expense");
    }
  };

  // Contacts Management handlers
  const fetchContacts = async () => {
    if (!accessToken) return;

    try {
      setLoadingContacts(true);

      // Fetch friends
      const friendsResponse = await apiAuth(
        "/api/dashboard-share/contacts/friends",
        {
          method: "GET",
        }
      );

      // Fetch family
      const familyResponse = await apiAuth(
        "/api/dashboard-share/contacts/family",
        {
          method: "GET",
        }
      );

      setContacts({
        friends: friendsResponse.data || [],
        family: familyResponse.data || [],
      });
    } catch (err) {
      console.error("Error fetching contacts:", err);
      showError("Error", "Failed to load contacts");
    } finally {
      setLoadingContacts(false);
    }
  };

  // Live search handler
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);

      // Call both email and phone APIs simultaneously
      const [emailResponse, phoneResponse] = await Promise.allSettled([
        apiAuth("/api/dashboard-share/users/search/email", {
          method: "POST",
          body: JSON.stringify({ email: query }),
        }),
        apiAuth("/api/dashboard-share/users/search/phone", {
          method: "POST",
          body: JSON.stringify({ phoneNumber: query }),
        }),
      ]);

      const results = [];

      // Process email results
      if (emailResponse.status === "fulfilled" && emailResponse.value?.data) {
        const data = Array.isArray(emailResponse.value.data)
          ? emailResponse.value.data
          : [emailResponse.value.data];
        results.push(...data);
      }

      // Process phone results
      if (phoneResponse.status === "fulfilled" && phoneResponse.value?.data) {
        const data = Array.isArray(phoneResponse.value.data)
          ? phoneResponse.value.data
          : [phoneResponse.value.data];
        // Avoid duplicates
        data.forEach((user) => {
          const userId = user.user_id || user.id || user.userId;
          if (
            !results.find((r) => (r.user_id || r.id || r.userId) === userId)
          ) {
            results.push(user);
          }
        });
      }

      setSearchResults(results);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Handle user selection from search results
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Handle adding selected user as contact
  const handleAddSelectedContact = async () => {
    if (!selectedUser) {
      showError("Error", "Please select a user first");
      return;
    }

    try {
      setAddingContact(true);

      const userId =
        selectedUser.user_id || selectedUser.id || selectedUser.userId;
      if (!userId) {
        throw new Error("Could not find user ID");
      }

      const response = await apiAuth("/api/dashboard-share/contacts", {
        method: "POST",
        body: JSON.stringify({
          relation_with_user_id: userId,
          relationshipTypeCode: selectedRelationship,
        }),
      });

      if (response.success || response.data) {
        success(
          "Success",
          `Added to ${
            selectedRelationship === "friend" ? "Friends" : "Family"
          }!`
        );
        setSelectedUser(null);
        setSearchQuery("");
        setActiveModal(null);
        fetchContacts();
      } else {
        throw new Error(response.message || "Failed to add contact");
      }
    } catch (err) {
      console.error("Error adding contact:", err);
      showError("Error", err.message || "Failed to add contact");
    } finally {
      setAddingContact(false);
    }
  };

  // Reset search when modal closes
  const handleCloseAddContactModal = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setActiveModal(null);
  };

  const handleDeleteContact = async (contact) => {
    const contactName = contact.contact_user_name || "Contact";

    try {
      const contactId = contact.id;

      const response = await apiAuth(
        `/api/dashboard-share/contacts/${contactId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success || response.status === "success") {
        success("Success", `${contactName} removed successfully`);
        fetchContacts();
      } else {
        throw new Error(response.message || "Failed to remove contact");
      }
    } catch (err) {
      console.error("Error deleting contact:", err);
      showError("Error", err.message || "Failed to remove contact");
    }
  };

  const handleOpenContactsModal = () => {
    setActiveModal("contacts");
    fetchContacts();
  };

  // Update Share Dashboard to use existing contacts
  const handleOpenShareModal = () => {
    setActiveModal("share");
    fetchContacts();
  };

  // Share dashboard with a single contact
  const handleShareWithContact = async (contact) => {
    if (!dashboardId) {
      showError("Error", "Dashboard not loaded");
      return;
    }

    const contactId = contact.id;
    const contactName =
      contact.contact_user_name ||
      (activeShareTab === "friends" ? "Friend" : "Family Member");

    try {
      setSharingDashboard(true);

      const response = await apiAuth("/api/dashboard-share/shares", {
        method: "POST",
        body: JSON.stringify([
          {
            dashboardId: dashboardId,
            contactId: contactId,
          },
        ]),
      });

      if (response.success || response.data) {
        success("Success", `Dashboard shared with ${contactName}!`);
      } else {
        throw new Error(response.message || "Failed to share dashboard");
      }
    } catch (err) {
      console.error("Error sharing dashboard:", err);
      showError("Error", err.message || "Failed to share dashboard");
    } finally {
      setSharingDashboard(false);
    }
  };

  if (isLoading || loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Settings
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const settingsCards = [
    {
      id: "social-media",
      icon: <Users className="w-6 h-6" />,
      title: "Social Media",
      onClick: () => setActiveModal("social-media"),
    },
    {
      id: "add-friends",
      icon: <Icon icon="mdi:account-multiple-plus" className="w-6 h-6" />,
      title: "Add Friends",
      onClick: () => {
        setSelectedRelationship("friend");
        setActiveModal("add-contact");
        fetchContacts();
      },
    },
    {
      id: "add-family",
      icon: <Icon icon="mdi:account-heart" className="w-6 h-6" />,
      title: "Add Family Members",
      onClick: () => {
        setSelectedRelationship("family");
        setActiveModal("add-contact");
        fetchContacts();
      },
    },
    {
      id: "budget",
      icon: <Wallet className="w-6 h-6" />,
      title: "Budget",
      onClick: () => setActiveSection("budget"),
    },
    {
      id: "manage-income-sources",
      icon: <Icon icon="mdi:wallet-plus" className="w-6 h-6" />,
      title: "Add Income Source",
      onClick: () => setActiveModal("manage-income-sources"),
    },
    {
      id: "income",
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Add Income",
      onClick: () => setActiveModal("income"),
    },
    {
      id: "expenses",
      icon: <FileText className="w-6 h-6" />,
      title: "Manage Expenses",
      onClick: () => setActiveModal("expenses"),
    },
    {
      id: "family-time",
      icon: <Icon icon="mdi:family" className="w-6 h-6" />,
      title: "Family Time Spent",
      onClick: () => setActiveModal("family-time"),
    },
    {
      id: "share",
      icon: <Share2 className="w-6 h-6" />,
      title: "Share Dashboard",
      onClick: handleOpenShareModal,
    },
    {
      id: "widgets",
      icon: <Icon icon="ic:sharp-widgets" className="w-6 h-6" />,
      title: "Widgets",
      href: "/personal/widgets",
      isLink: true,
    },
  ];

  return (
    <>
      {activeSection === "main" && (
        <>
          <div className="mb-8 mt-3 md:mt-4">
            <h3 className="text-2xl font-semibold text-[#4D4D4D]">Settings</h3>
            <p className="mt-2 text-sm text-[#777777]">
              Manage your personal settings and preferences.
            </p>
          </div>

          <Card className="p-4 md:p-12 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
            <div className="space-y-3">
              {settingsCards.map((card) => {
                if (card.isLink) {
                  return (
                    <Link key={card.id} href={card.href} className="block">
                      <Card
                        variant="filled"
                        hover
                        className="transition-all duration-200 !bg-[#F3F3F3] border-[2px] rounded-[15px] w-full !border-[#F3F3F3] hover:!bg-[#E8E8E8]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#559EFE] flex items-center justify-center text-white">
                              {card.icon}
                            </div>
                            <span
                              className={`text-lg font-medium ${
                                pathname === card.href
                                  ? "text-[#9747FF]"
                                  : "text-gray-900"
                              }`}
                            >
                              {card.title}
                            </span>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 ${
                              pathname === card.href
                                ? "text-[#9747FF]"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      </Card>
                    </Link>
                  );
                }
                return (
                  <Card
                    key={card.id}
                    variant="filled"
                    hover
                    className="transition-all duration-200 !bg-[#F3F3F3] border-[2px] rounded-[15px] w-full !border-[#F3F3F3]"
                    onClick={card.onClick}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#559EFE] flex items-center justify-center text-white">
                          {card.icon}
                        </div>
                        <span className="text-lg font-medium text-gray-900">
                          {card.title}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* Budget Section - Using BudgetGoalsSection component */}
      {activeSection === "budget" && (
        <div className="relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[#4D4D4D]">
              Budget Goals
            </h2>
            <button
              onClick={() => setActiveSection("main")}
              className="flex items-center gap-2 px-4 py-2 bg-[#9747FF] text-white rounded-full shadow hover:bg-[#8636EE] transition"
            >
              ← Back
            </button>
          </div>

          <BudgetGoalsSection
            budgetGoals={budgetGoals}
            setBudgetGoals={setBudgetGoals}
            dashboardId={dashboardId}
            manageExpensesAttr={manageExpensesAttr}
            setManageExpensesAttr={setManageExpensesAttr}
            accessToken={accessToken}
          />
        </div>
      )}

      {/* Social Media Modal - Using SocialMediaSection component */}
      <SocialMediaSection
        isOpen={activeModal === "social-media"}
        onClose={() => setActiveModal(null)}
        accessToken={accessToken}
      />

      {/* Family Time Modal - Using FamilyTimeSection component */}
      <FamilyTimeSection
        isOpen={activeModal === "family-time"}
        onClose={() => setActiveModal(null)}
        dashboardId={dashboardId}
        familyTimeAttr={familyTimeAttr}
      />

      {/* Income Source Types Modal (List) */}
      <Modal
        isOpen={activeModal === "manage-income-sources"}
        onClose={() => setActiveModal(null)}
        title="Income Source Types"
        size="xl"
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setActiveModal("add-income-source")}
              icon={<Plus className="w-5 h-5" />}
              width="w-auto"
              fullWidth={false}
            >
              Add Income Source
            </Button>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#559EFE]">
                  <TableHead>Source Name</TableHead>
                  <TableHead>Expected Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeTypeOptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No income sources added yet. Click "Add Income Source" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeTypeOptions.map((option) => {
                    // Find the full attribute data to get target value
                    const fullAttribute = addIncomeAttr?.attributes?.find(
                      (attr) => attr.id === option.attributeId
                    );
                    const targetValue = fullAttribute?.target_value?.value || option.targetValue || "Not set";

                    return (
                      <TableRow key={option.value}>
                        <TableCell className="font-medium">{option.label}</TableCell>
                        <TableCell>${targetValue}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <button
                            onClick={() => {
                              handleEditIncomeSource(option);
                              setActiveModal("edit-income-source");
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteIncomeSource(option)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Modal>

      {/* Add Income Source Modal (Form) */}
      <Modal
        isOpen={activeModal === "add-income-source"}
        onClose={() => {
          setActiveModal("manage-income-sources");
          setNewIncomeSourceName("");
          setNewIncomeSourceTargetValue("");
        }}
        title="Add Income Source"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Create a new income source type that will appear when adding income.
          </p>

          <Input
            type="text"
            label="Income Source Name"
            placeholder="e.g., Salary, Freelance, Investments..."
            value={newIncomeSourceName}
            onChange={(e) => setNewIncomeSourceName(e.target.value)}
          />

          <Input
            type="text"
            label="Unit"
            value="USD"
            disabled
            className="bg-gray-50"
          />

          <Input
            type="number"
            label="Target Value"
            placeholder="Enter target income amount"
            value={newIncomeSourceTargetValue}
            onChange={(e) => setNewIncomeSourceTargetValue(e.target.value)}
          />

          <Button
            onClick={handleAddIncomeSource}
            disabled={addingIncomeSource || !newIncomeSourceName.trim() || !newIncomeSourceTargetValue.trim()}
            width="w-full"
          >
            {addingIncomeSource ? "Adding..." : "Add Income Source"}
          </Button>
        </div>
      </Modal>

      {/* Edit Income Source Modal */}
      <Modal
        isOpen={activeModal === "edit-income-source"}
        onClose={() => {
          setActiveModal("manage-income-sources");
          setNewIncomeSourceName("");
          setNewIncomeSourceTargetValue("");
          setEditingIncomeSource(null);
        }}
        title="Edit Income Source"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Update the income source name and target value.
          </p>

          <Input
            type="text"
            label="Income Source Name"
            placeholder="e.g., Salary, Freelance, Investments..."
            value={newIncomeSourceName}
            onChange={(e) => setNewIncomeSourceName(e.target.value)}
          />

          <Input
            type="text"
            label="Unit"
            value="USD"
            disabled
            className="bg-gray-50"
          />

          <Input
            type="number"
            label="Target Value"
            placeholder="Enter target income amount"
            value={newIncomeSourceTargetValue}
            onChange={(e) => setNewIncomeSourceTargetValue(e.target.value)}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleUpdateIncomeSource}
              disabled={addingIncomeSource || !newIncomeSourceName.trim() || !newIncomeSourceTargetValue.trim()}
              width="w-full"
            >
              {addingIncomeSource ? "Updating..." : "Update Income Source"}
            </Button>
            <Button
              onClick={() => {
                setActiveModal("manage-income-sources");
                setNewIncomeSourceName("");
                setNewIncomeSourceTargetValue("");
                setEditingIncomeSource(null);
              }}
              variant="outline"
              width="w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Income Sources Modal */}
      <Modal
        isOpen={activeModal === "income"}
        onClose={() => setActiveModal(null)}
        title="Income Sources"
        size="xl"
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setActiveModal("add-income")}
              icon={<Plus className="w-5 h-5" />}
              width="w-auto"
              fullWidth={false}
            >
              Add Income
            </Button>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#559EFE]">
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeSources.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      {item.date}
                    </TableCell>
                    <TableCell>${item.salary.toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <button
                        onClick={() => handleViewIncomeHistory(item)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        History
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Modal>

      {/* Add Income Modal */}
      <Modal
        isOpen={activeModal === "add-income"}
        onClose={() => setActiveModal("income")}
        title="Add Income"
        size="md"
      >
        <div className="space-y-6">
          <SingleSelect
            options={incomeTypeOptions}
            value={newIncomeType}
            onChange={setNewIncomeType}
            placeholder="Select Income Type"
            label="Income Type"
          />
          <Input
            type="number"
            label="Amount ($)"
            placeholder="Enter amount"
            value={newIncomeAmount}
            onChange={(e) => setNewIncomeAmount(e.target.value)}
          />
          <Button onClick={handleAddIncome} width="w-full">
            Add Income
          </Button>
        </div>
      </Modal>

      {/* Income History Modal */}
      <Modal
        isOpen={activeModal === "income-history"}
        onClose={() => {
          setActiveModal("income");
          setViewingIncomeHistory(null);
          setIncomeHistory([]);
        }}
        title={`Income History - ${viewingIncomeHistory?.title || ""}`}
        size="lg"
      >
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm">Loading history...</p>
            </div>
          ) : incomeHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="mdi:history" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No income history available</p>
              <p className="text-xs mt-1">Income entries will appear here once added</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#559EFE]">
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${parseFloat(entry.value).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => handleEditIncomeHistory(entry)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteIncomeHistory(entry)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setActiveModal("income");
                setViewingIncomeHistory(null);
                setIncomeHistory([]);
              }}
              backgroundColor="#9747FF"
              width="w-auto"
            >
              Back to Income Sources
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Income History Modal */}
      <Modal
        isOpen={editingIncomeHistory !== null}
        onClose={() => setEditingIncomeHistory(null)}
        title="Edit Income Entry"
        size="md"
      >
        {editingIncomeHistory && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Editing Entry</p>
              <p className="font-medium">Original Date: {editingIncomeHistory.date}</p>
            </div>
            <Input
              type="number"
              label="Amount ($)"
              placeholder="Enter amount"
              value={editingIncomeHistory.value}
              onChange={(e) => {
                setEditingIncomeHistory({
                  ...editingIncomeHistory,
                  value: e.target.value
                });
              }}
            />
            <Input
              type="datetime-local"
              label="Date & Time"
              value={editingIncomeHistory.timestamp ? new Date(editingIncomeHistory.timestamp).toISOString().slice(0, 16) : ""}
              onChange={(e) => {
                const newTimestamp = e.target.value ? new Date(e.target.value).toISOString() : editingIncomeHistory.timestamp;
                setEditingIncomeHistory({
                  ...editingIncomeHistory,
                  timestamp: newTimestamp,
                  date: newTimestamp ? new Date(newTimestamp).toLocaleDateString() : editingIncomeHistory.date
                });
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateIncomeHistory}
                width="w-full"
              >
                Update Entry
              </Button>
              <Button
                onClick={() => setEditingIncomeHistory(null)}
                variant="outline"
                width="w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manage Expenses Modal */}
      <Modal
        isOpen={activeModal === "expenses"}
        onClose={() => setActiveModal(null)}
        title="Manage Expenses"
        size="xl"
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setActiveModal("add-expense")}
              icon={<Plus className="w-5 h-5" />}
              width="w-auto"
              fullWidth={false}
            >
              Add Expense
            </Button>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#559EFE]">
                  <TableHead>Category</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseCategoryOptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No expense categories available.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseCategoryOptions.map((category) => {
                    // Find the full attribute data to get target value
                    const fullAttribute = manageExpensesAttr?.attributes?.find(
                      (attr) => attr.id === category.attributeId
                    );
                    const budget = fullAttribute?.target_value?.value || "Not set";

                    return (
                      <TableRow key={category.value}>
                        <TableCell className="font-medium">{category.label}</TableCell>
                        <TableCell>${budget}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <button
                            onClick={() => handleViewExpenseHistory(category)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            History
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Modal>

      {/* Add Expense Modal */}
      <Modal
        isOpen={activeModal === "add-expense"}
        onClose={() => setActiveModal("expenses")}
        title="Add Expense"
        size="md"
      >
        <div className="space-y-6">
          <SingleSelect
            options={expenseCategoryOptions}
            value={newExpenseCategory}
            onChange={setNewExpenseCategory}
            placeholder="Select Expense Category"
            label="Category"
          />
          <Input
            type="number"
            label="Amount ($)"
            placeholder="Enter amount"
            value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(e.target.value)}
          />
          <Input
            type="date"
            label="Date"
            value={newExpenseDate}
            onChange={(e) => setNewExpenseDate(e.target.value)}
          />
          <Input
            type="text"
            label="Description (Optional)"
            placeholder="Add notes about this expense"
            value={newExpenseDescription}
            onChange={(e) => setNewExpenseDescription(e.target.value)}
          />
          <Button onClick={handleAddExpense} width="w-full">
            Add Expense
          </Button>
        </div>
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
        size="md"
      >
        {editingExpense && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Editing</p>
              <p className="font-medium">{editingExpense.title}</p>
            </div>
            <Input
              type="number"
              label="Amount ($)"
              placeholder="Enter amount"
              defaultValue={Math.abs(editingExpense.amount)}
              onChange={(e) => {
                setEditingExpense({
                  ...editingExpense,
                  amount: parseInt(e.target.value) || 0
                });
              }}
            />
            <Input
              type="date"
              label="Date"
              defaultValue={editingExpense.date}
              onChange={(e) => {
                setEditingExpense({
                  ...editingExpense,
                  date: e.target.value
                });
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleUpdateExpense(editingExpense, Math.abs(editingExpense.amount), editingExpense.date)}
                width="w-full"
              >
                Update Expense
              </Button>
              <Button
                onClick={() => setEditingExpense(null)}
                variant="outline"
                width="w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Expense History Modal */}
      <Modal
        isOpen={activeModal === "expense-history"}
        onClose={() => {
          setActiveModal("expenses");
          setViewingExpenseHistory(null);
          setExpenseHistory([]);
        }}
        title={`Expense History - ${viewingExpenseHistory?.label || ""}`}
        size="lg"
      >
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm">Loading history...</p>
            </div>
          ) : expenseHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="mdi:history" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No expense history available</p>
              <p className="text-xs mt-1">Expense entries will appear here once added</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#559EFE]">
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        ${parseFloat(entry.value).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <button
                          onClick={() => handleEditExpenseHistory(entry)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpenseHistory(entry)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setActiveModal("expenses");
                setViewingExpenseHistory(null);
                setExpenseHistory([]);
              }}
              backgroundColor="#9747FF"
              width="w-auto"
            >
              Back to Expense Categories
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Expense History Modal */}
      <Modal
        isOpen={editingExpenseHistory !== null}
        onClose={() => setEditingExpenseHistory(null)}
        title="Edit Expense Entry"
        size="md"
      >
        {editingExpenseHistory && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Editing Entry</p>
              <p className="font-medium">Original Date: {editingExpenseHistory.date}</p>
            </div>
            <Input
              type="number"
              label="Amount ($)"
              placeholder="Enter amount"
              value={editingExpenseHistory.value}
              onChange={(e) => {
                setEditingExpenseHistory({
                  ...editingExpenseHistory,
                  value: e.target.value
                });
              }}
            />
            <Input
              type="datetime-local"
              label="Date & Time"
              value={editingExpenseHistory.timestamp ? new Date(editingExpenseHistory.timestamp).toISOString().slice(0, 16) : ""}
              onChange={(e) => {
                const newTimestamp = e.target.value ? new Date(e.target.value).toISOString() : editingExpenseHistory.timestamp;
                setEditingExpenseHistory({
                  ...editingExpenseHistory,
                  timestamp: newTimestamp,
                  date: newTimestamp ? new Date(newTimestamp).toLocaleDateString() : editingExpenseHistory.date
                });
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateExpenseHistory}
                width="w-full"
              >
                Update Entry
              </Button>
              <Button
                onClick={() => setEditingExpenseHistory(null)}
                variant="outline"
                width="w-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Contact Modal (Friends or Family) */}
      <Modal
        isOpen={activeModal === "add-contact"}
        onClose={handleCloseAddContactModal}
        title={`${
          selectedRelationship === "friend" ? "Friends" : "Family Members"
        }`}
        size="md"
      >
        <div className="space-y-6">
          {!selectedUser ? (
            <>
              {/* Search Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Add New{" "}
                  {selectedRelationship === "friend"
                    ? "Friend"
                    : "Family Member"}
                </h3>
                {/* Search Input */}
                <div className="relative">
                  <Input
                    type="text"
                    label="Search by Email or Phone"
                    placeholder="Start typing email or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-10">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    <p className="text-sm text-gray-600 mb-2">
                      {searchResults.length} result
                      {searchResults.length !== 1 ? "s" : ""} found:
                    </p>
                    {searchResults.map((user, index) => (
                      <button
                        key={user.user_id || user.id || index}
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                      >
                        <p className="font-medium text-gray-900">
                          {user.name || "User"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.email || user.phone || "No contact info"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchQuery.length >= 2 &&
                  !isSearching &&
                  searchResults.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">
                        No users found matching "{searchQuery}"
                      </p>
                    </div>
                  )}

                {/* Helper Text */}
                {searchQuery.length < 2 && !isSearching && (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">
                      Type at least 2 characters to search
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Existing Contacts List */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Your{" "}
                  {selectedRelationship === "friend"
                    ? "Friends"
                    : "Family Members"}
                </h3>

                {loadingContacts ? (
                  <p className="text-center text-gray-500 py-4">Loading...</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {selectedRelationship === "friend" ? (
                      contacts.friends.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No friends added yet</p>
                        </div>
                      ) : (
                        contacts.friends.map((contact) => (
                          <div
                            key={contact.id}
                            className="w-full text-left p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {contact.contact_user_name || "Friend"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {contact.contact_user_email ||
                                    contact.contact_user_phone_number ||
                                    "No contact info"}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteContact(contact)}
                                className="ml-3 text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                              >
                                <Icon icon="mdi:delete" className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )
                    ) : contacts.family.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No family members added yet</p>
                      </div>
                    ) : (
                      contacts.family.map((contact) => (
                        <div
                          key={contact.id}
                          className="w-full text-left p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {contact.contact_user_name || "Family Member"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {contact.contact_user_email ||
                                  contact.contact_user_phone_number ||
                                  "No contact info"}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteContact(contact)}
                              className="ml-3 text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                            >
                              <Icon icon="mdi:delete" className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected User Confirmation */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-lg">
                      {selectedUser.name || "User"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedUser.email || selectedUser.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSelectedContact}
                    disabled={addingContact}
                    width="w-full"
                  >
                    {addingContact
                      ? "Adding..."
                      : `Add to ${
                          selectedRelationship === "friend"
                            ? "Friends"
                            : "Family"
                        }`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Share Dashboard Modal */}
      <Modal
        isOpen={activeModal === "share"}
        onClose={() => setActiveModal(null)}
        title="Share Dashboard"
        size="md"
      >
        <div className="space-y-4">
          {loadingContacts ? (
            <p className="text-center text-gray-500 py-8">
              Loading contacts...
            </p>
          ) : contacts.friends.length === 0 && contacts.family.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No contacts available</p>
              <p className="text-sm text-gray-400 mb-4">
                Add friends or family members first to share your dashboard
              </p>
              <Button
                onClick={() => {
                  setActiveModal(null);
                }}
                width="w-auto"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveShareTab("friends")}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeShareTab === "friends"
                      ? "text-[#559EFE] border-b-2 border-[#559EFE]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Friends ({contacts.friends.length})
                </button>
                <button
                  onClick={() => setActiveShareTab("family")}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeShareTab === "family"
                      ? "text-[#559EFE] border-b-2 border-[#559EFE]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Family ({contacts.family.length})
                </button>
              </div>

              {/* Contact List */}
              <div className="max-h-96 overflow-y-auto">
                {activeShareTab === "friends" && (
                  <div className="space-y-2">
                    {contacts.friends.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No friends added yet</p>
                      </div>
                    ) : (
                      contacts.friends.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleShareWithContact(contact)}
                          disabled={sharingDashboard}
                          className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {contact.contact_user_name || "Friend"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {contact.contact_user_email ||
                                  contact.contact_user_phone_number ||
                                  "No contact info"}
                              </p>
                            </div>
                            <Icon
                              icon="mdi:share-variant"
                              className="w-5 h-5 text-blue-600"
                            />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {activeShareTab === "family" && (
                  <div className="space-y-2">
                    {contacts.family.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No family members added yet</p>
                      </div>
                    ) : (
                      contacts.family.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => handleShareWithContact(contact)}
                          disabled={sharingDashboard}
                          className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {contact.contact_user_name || "Family Member"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {contact.contact_user_email ||
                                  contact.contact_user_phone_number ||
                                  "No contact info"}
                              </p>
                            </div>
                            <Icon
                              icon="mdi:share-variant"
                              className="w-5 h-5 text-blue-600"
                            />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
