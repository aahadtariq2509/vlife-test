import { useState, useEffect, useCallback } from 'react';
import {
  getJiraTasks,
  getJiraTasksByStatus,
  getJiraTasksByPriority,
  getJiraTasksByProject,
  getJiraTasksByAssignee,
  getJiraTaskStats,
} from '@/lib/jira-api';

/**
 * Custom hook for managing JIRA tasks
 * Provides data fetching and state management for JIRA tasks from database
 * Note: This fetches tasks from JIRA_TASKS table, not directly from Jira API
 *
 * @param {Object} options - Hook options
 * @param {boolean} options.fetchOnMount - Whether to fetch tasks on mount (default: true)
 * @param {Object} options.queryOptions - Options to pass to getJiraTasks API
 * @param {boolean} options.fetchStats - Whether to fetch task statistics (default: false)
 * @returns {Object} JIRA tasks data and utility functions
 */
export function useJiraTasks({ fetchOnMount = true, queryOptions = {}, fetchStats = false } = {}) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  /**
   * Fetch JIRA tasks from API
   */
  const fetchTasks = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const fetchedTasks = await getJiraTasks(mergedOptions);
      setTasks(fetchedTasks);
      return fetchedTasks;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching JIRA tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch task statistics
   */
  const fetchTaskStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const taskStats = await getJiraTaskStats();
      setStats(taskStats);
      return taskStats;
    } catch (err) {
      console.error('Error fetching JIRA task stats:', err);
      return null;
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /**
   * Get tasks by status
   */
  const getByStatus = useCallback(async (status, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const statusTasks = await getJiraTasksByStatus(status, mergedOptions);
      return statusTasks;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching JIRA tasks by status:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get tasks by priority
   */
  const getByPriority = useCallback(async (priority, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const priorityTasks = await getJiraTasksByPriority(priority, mergedOptions);
      return priorityTasks;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching JIRA tasks by priority:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get tasks by project
   */
  const getByProject = useCallback(async (project, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const projectTasks = await getJiraTasksByProject(project, mergedOptions);
      return projectTasks;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching JIRA tasks by project:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get tasks by assignee
   */
  const getByAssignee = useCallback(async (assignee, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const assigneeTasks = await getJiraTasksByAssignee(assignee, mergedOptions);
      return assigneeTasks;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching JIRA tasks by assignee:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Refresh tasks (refetch)
   */
  const refresh = useCallback(() => {
    return fetchTasks();
  }, [fetchTasks]);

  /**
   * Refresh statistics
   */
  const refreshStats = useCallback(() => {
    return fetchTaskStats();
  }, [fetchTaskStats]);

  // Fetch tasks on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchTasks();
    }
  }, [fetchOnMount, fetchTasks]);

  // Fetch stats on mount if enabled
  useEffect(() => {
    if (fetchStats && fetchOnMount) {
      fetchTaskStats();
    }
  }, [fetchStats, fetchOnMount, fetchTaskStats]);

  // Computed values from local tasks
  const todoTasks = tasks.filter(t =>
    t.status?.toLowerCase().includes('to do') ||
    t.status?.toLowerCase().includes('todo') ||
    t.status?.toLowerCase().includes('open')
  );

  const inProgressTasks = tasks.filter(t =>
    t.status?.toLowerCase().includes('in progress') ||
    t.status?.toLowerCase().includes('doing')
  );

  const doneTasks = tasks.filter(t =>
    t.status?.toLowerCase().includes('done') ||
    t.status?.toLowerCase().includes('closed') ||
    t.status?.toLowerCase().includes('resolved')
  );

  const highPriorityTasks = tasks.filter(t =>
    t.priority?.toLowerCase().includes('high') ||
    t.priority?.toLowerCase().includes('critical') ||
    t.priority?.toLowerCase().includes('urgent')
  );

  const mediumPriorityTasks = tasks.filter(t =>
    t.priority?.toLowerCase().includes('medium') ||
    t.priority?.toLowerCase().includes('normal')
  );

  const lowPriorityTasks = tasks.filter(t =>
    t.priority?.toLowerCase().includes('low') ||
    t.priority?.toLowerCase().includes('minor')
  );

  // Group tasks by project
  const tasksByProject = tasks.reduce((acc, task) => {
    const project = task.project || 'Unknown';
    if (!acc[project]) {
      acc[project] = [];
    }
    acc[project].push(task);
    return acc;
  }, {});

  return {
    tasks,
    stats,
    loading,
    error,
    statsLoading,

    // Actions
    fetchTasks,
    fetchTaskStats,
    getByStatus,
    getByPriority,
    getByProject,
    getByAssignee,
    refresh,
    refreshStats,

    // Computed values
    todoTasks,
    inProgressTasks,
    doneTasks,
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,
    tasksByProject,
    totalTasksCount: tasks.length,
    todoCount: todoTasks.length,
    inProgressCount: inProgressTasks.length,
    doneCount: doneTasks.length,
    highPriorityCount: highPriorityTasks.length,
  };
}

export default useJiraTasks;
