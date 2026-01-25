import { useState, useEffect, useCallback } from 'react';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  getTodosByStatus,
  getTodosByPriority,
} from '@/lib/todos-api';

/**
 * Custom hook for managing todos
 * Provides data fetching, mutations, and state management for todos
 *
 * @param {Object} options - Hook options
 * @param {boolean} options.fetchOnMount - Whether to fetch todos on mount (default: true)
 * @param {Object} options.queryOptions - Options to pass to getTodos API
 * @returns {Object} Todos data and mutation functions
 */
export function useTodos({ fetchOnMount = true, queryOptions = {} } = {}) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch todos from API
   */
  const fetchTodos = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const fetchedTodos = await getTodos(mergedOptions);
      setTodos(fetchedTodos);
      return fetchedTodos;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching todos:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - queryOptions is accessed directly from closure

  /**
   * Create a new todo
   */
  const create = useCallback(async (todoData) => {
    try {
      setIsCreating(true);
      setError(null);
      const newTodo = await createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      return { success: true, data: newTodo };
    } catch (err) {
      setError(err.message);
      console.error('Error creating todo:', err);
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Update an existing todo
   */
  const update = useCallback(async (id, todoData) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedTodo = await updateTodo(id, todoData);
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? { ...todo, ...updatedTodo } : todo))
      );
      return { success: true, data: updatedTodo };
    } catch (err) {
      setError(err.message);
      console.error('Error updating todo:', err);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Delete a todo
   */
  const remove = useCallback(async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error deleting todo:', err);
      return { success: false, error: err.message };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  /**
   * Toggle todo completion status
   */
  const toggleComplete = useCallback(async (id, completed) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedTodo = await toggleTodoComplete(id, completed);
      setTodos(prev =>
        prev.map(todo => (todo.id === id ? { ...todo, ...updatedTodo } : todo))
      );
      return { success: true, data: updatedTodo };
    } catch (err) {
      setError(err.message);
      console.error('Error toggling todo completion:', err);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Get completed todos
   */
  const getCompleted = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const completedTodos = await getTodosByStatus(true, mergedOptions);
      return completedTodos;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching completed todos:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get pending todos
   */
  const getPending = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const pendingTodos = await getTodosByStatus(false, mergedOptions);
      return pendingTodos;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching pending todos:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get todos by priority
   */
  const getByPriority = useCallback(async (priority, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const priorityTodos = await getTodosByPriority(priority, mergedOptions);
      return priorityTodos;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching todos by priority:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Refresh todos (refetch)
   */
  const refresh = useCallback(() => {
    return fetchTodos();
  }, [fetchTodos]);

  // Fetch todos on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchTodos();
    }
  }, [fetchOnMount, fetchTodos]);

  return {
    todos,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,

    // Actions
    fetchTodos,
    create,
    update,
    remove,
    toggleComplete,
    getCompleted,
    getPending,
    getByPriority,
    refresh,

    // Computed values
    completedCount: todos.filter(t => t.completed).length,
    pendingCount: todos.filter(t => !t.completed).length,
    highPriorityCount: todos.filter(t => t.priority === 'high').length,
  };
}

export default useTodos;
