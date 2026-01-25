import { apiAuth } from './api-client';

/**
 * JIRA Tasks API Client
 * Handles JIRA task-related API calls
 * Note: This fetches tasks from the database (JIRA_TASKS table), not directly from Jira API
 */

const JIRA_BASE_URL = '/api/jira';

/**
 * Get all JIRA tasks for the authenticated user
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of tasks to return (default: 50)
 * @param {number} options.offset - Number of tasks to skip (default: 0)
 * @param {string} options.orderBy - Order by field and direction (default: 'created_at DESC')
 * @returns {Promise<Array>} Array of JIRA tasks
 */
export async function getJiraTasks({ limit = 50, offset = 0, orderBy = 'created_at DESC' } = {}) {
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy,
    });

    const response = await apiAuth(`${JIRA_BASE_URL}/tasks?${queryParams}`, {
      method: 'GET',
    });

    return response.data || [];
  } catch (error) {
    console.error('Error fetching JIRA tasks:', error);
    throw new Error(error.message || 'Failed to fetch JIRA tasks');
  }
}

/**
 * Get JIRA tasks filtered by status
 * @param {string} status - Task status to filter by
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Filtered array of JIRA tasks
 */
export async function getJiraTasksByStatus(status, options = {}) {
  try {
    const tasks = await getJiraTasks(options);
    return tasks.filter(task => task.status?.toLowerCase() === status.toLowerCase());
  } catch (error) {
    console.error('Error fetching JIRA tasks by status:', error);
    throw new Error(error.message || 'Failed to fetch JIRA tasks by status');
  }
}

/**
 * Get JIRA tasks filtered by priority
 * @param {string} priority - Task priority to filter by
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Filtered array of JIRA tasks
 */
export async function getJiraTasksByPriority(priority, options = {}) {
  try {
    const tasks = await getJiraTasks(options);
    return tasks.filter(task => task.priority?.toLowerCase() === priority.toLowerCase());
  } catch (error) {
    console.error('Error fetching JIRA tasks by priority:', error);
    throw new Error(error.message || 'Failed to fetch JIRA tasks by priority');
  }
}

/**
 * Get JIRA tasks filtered by project
 * @param {string} project - Project key or name to filter by
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Filtered array of JIRA tasks
 */
export async function getJiraTasksByProject(project, options = {}) {
  try {
    const tasks = await getJiraTasks(options);
    return tasks.filter(task =>
      task.project?.toLowerCase().includes(project.toLowerCase()) ||
      task.project_key?.toLowerCase().includes(project.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching JIRA tasks by project:', error);
    throw new Error(error.message || 'Failed to fetch JIRA tasks by project');
  }
}

/**
 * Get JIRA tasks assigned to a specific user
 * @param {string} assignee - Assignee name or email
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Filtered array of JIRA tasks
 */
export async function getJiraTasksByAssignee(assignee, options = {}) {
  try {
    const tasks = await getJiraTasks(options);
    return tasks.filter(task =>
      task.assignee?.toLowerCase().includes(assignee.toLowerCase()) ||
      task.assignee_email?.toLowerCase().includes(assignee.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching JIRA tasks by assignee:', error);
    throw new Error(error.message || 'Failed to fetch JIRA tasks by assignee');
  }
}

/**
 * Get JIRA task statistics
 * @returns {Promise<Object>} Task statistics
 */
export async function getJiraTaskStats() {
  try {
    const tasks = await getJiraTasks({ limit: 1000 });

    const stats = {
      total: tasks.length,
      byStatus: {},
      byPriority: {},
      byProject: {},
    };

    tasks.forEach(task => {
      // Count by status
      const status = task.status || 'Unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by priority
      const priority = task.priority || 'Unknown';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

      // Count by project
      const project = task.project || 'Unknown';
      stats.byProject[project] = (stats.byProject[project] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching JIRA task stats:', error);
    throw new Error(error.message || 'Failed to fetch JIRA task stats');
  }
}

export default {
  getJiraTasks,
  getJiraTasksByStatus,
  getJiraTasksByPriority,
  getJiraTasksByProject,
  getJiraTasksByAssignee,
  getJiraTaskStats,
};
