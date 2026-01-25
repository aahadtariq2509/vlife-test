import { apiAuth } from './api-client';

/**
 * Todos API Client
 * Handles all todo-related API calls with proper error handling
 */

const TODOS_BASE_URL = '/api/todos';

/**
 * Get all todos for the authenticated user
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of todos to return (default: 50)
 * @param {number} options.offset - Number of todos to skip (default: 0)
 * @param {string} options.orderBy - Order by field and direction (default: 'created_at DESC')
 * @returns {Promise<Array>} Array of todos
 */
export async function getTodos({ limit = 50, offset = 0, orderBy = 'created_at DESC' } = {}) {
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy,
    });

    const response = await apiAuth(`${TODOS_BASE_URL}?${queryParams}`, {
      method: 'GET',
    });

    return response.data || [];
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error(error.message || 'Failed to fetch todos');
  }
}

/**
 * Create a new todo
 * @param {Object} todoData - Todo data
 * @param {string} todoData.title - Todo title (required)
 * @param {string} todoData.description - Todo description (required)
 * @param {string} todoData.project - Project name (required)
 * @param {string} todoData.start_date - Start date ISO string (required)
 * @param {string} todoData.due_date - Due date ISO string (required)
 * @param {string} todoData.priority - Priority: 'low', 'medium', or 'high' (required)
 * @param {boolean} todoData.completed - Completion status (optional, default: false)
 * @returns {Promise<Object>} Created todo object
 */
export async function createTodo(todoData) {
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'project', 'start_date', 'due_date', 'priority'];
    const missingFields = requiredFields.filter(field => !todoData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(todoData.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    const response = await apiAuth(TODOS_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(todoData),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw new Error(error.message || 'Failed to create todo');
  }
}

/**
 * Update an existing todo
 * @param {number} id - Todo ID
 * @param {Object} todoData - Updated todo data (all fields optional)
 * @returns {Promise<Object>} Updated todo object
 */
export async function updateTodo(id, todoData) {
  try {
    if (!id) {
      throw new Error('Todo ID is required');
    }

    // Validate priority if provided
    if (todoData.priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(todoData.priority)) {
        throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
      }
    }

    const response = await apiAuth(`${TODOS_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todoData),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw new Error(error.message || 'Failed to update todo');
  }
}

/**
 * Delete a todo
 * @param {number} id - Todo ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteTodo(id) {
  try {
    if (!id) {
      throw new Error('Todo ID is required');
    }

    const response = await apiAuth(`${TODOS_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    return response;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw new Error(error.message || 'Failed to delete todo');
  }
}

/**
 * Toggle todo completion status
 * @param {number} id - Todo ID
 * @param {boolean} completed - New completion status
 * @returns {Promise<Object>} Updated todo object
 */
export async function toggleTodoComplete(id, completed) {
  try {
    const updateData = {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    };

    return await updateTodo(id, updateData);
  } catch (error) {
    console.error('Error toggling todo completion:', error);
    throw new Error(error.message || 'Failed to toggle todo completion');
  }
}

/**
 * Get todos filtered by completion status
 * @param {boolean} completed - Filter by completed status
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Filtered array of todos
 */
export async function getTodosByStatus(completed, options = {}) {
  try {
    const todos = await getTodos(options);
    return todos.filter(todo => todo.completed === completed);
  } catch (error) {
    console.error('Error fetching todos by status:', error);
    throw new Error(error.message || 'Failed to fetch todos by status');
  }
}

/**
 * Get todos filtered by priority
 * @param {string} priority - Priority level: 'low', 'medium', or 'high'
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Filtered array of todos
 */
export async function getTodosByPriority(priority, options = {}) {
  try {
    const todos = await getTodos(options);
    return todos.filter(todo => todo.priority === priority);
  } catch (error) {
    console.error('Error fetching todos by priority:', error);
    throw new Error(error.message || 'Failed to fetch todos by priority');
  }
}

export default {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  getTodosByStatus,
  getTodosByPriority,
};
