import { apiAuth } from './api-client';

/**
 * Calendar Events API Client
 * Handles all calendar event-related API calls with proper error handling
 * Automatically syncs with Google Calendar and Microsoft Calendar if connected
 */

const CALENDAR_BASE_URL = '/api/calendar-events';

/**
 * Get all calendar events for the authenticated user
 * This endpoint automatically syncs Google Calendar and Microsoft Calendar events if connected
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of events to return (default: 50)
 * @param {number} options.offset - Number of events to skip (default: 0)
 * @param {string} options.orderBy - Order by field and direction (default: 'start_date ASC')
 * @returns {Promise<Array>} Array of calendar events
 */
export async function getCalendarEvents({ limit = 50, offset = 0, orderBy = 'start_date ASC' } = {}) {
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      orderBy,
    });

    const response = await apiAuth(`${CALENDAR_BASE_URL}?${queryParams}`, {
      method: 'GET',
    });

    return response.data || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error(error.message || 'Failed to fetch calendar events');
  }
}

/**
 * Create a new calendar event
 * @param {Object} eventData - Event data
 * @param {string} eventData.title - Event title (required)
 * @param {string} eventData.description - Event description (required)
 * @param {string} eventData.start_date - Start date/time ISO string (required)
 * @param {string} eventData.end_date - End date/time ISO string (required)
 * @param {string} eventData.location - Event location (required)
 * @param {Array<string>} eventData.attendees - Array of attendee email addresses (required)
 * @returns {Promise<Object>} Created event object
 */
export async function createCalendarEvent(eventData) {
  try {
    // Validate required fields
    const requiredFields = ['title', 'description', 'start_date', 'end_date', 'location', 'attendees'];
    const missingFields = requiredFields.filter(field => !eventData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate attendees is an array
    if (!Array.isArray(eventData.attendees)) {
      throw new Error('Attendees must be an array of email addresses');
    }

    // Validate date range
    const startDate = new Date(eventData.start_date);
    const endDate = new Date(eventData.end_date);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    const response = await apiAuth(CALENDAR_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error(error.message || 'Failed to create calendar event');
  }
}

/**
 * Update an existing calendar event
 * @param {number} id - Event ID
 * @param {Object} eventData - Updated event data (all fields optional)
 * @returns {Promise<Object>} Updated event object
 */
export async function updateCalendarEvent(id, eventData) {
  try {
    if (!id) {
      throw new Error('Event ID is required');
    }

    // Validate date range if both dates provided
    if (eventData.start_date && eventData.end_date) {
      const startDate = new Date(eventData.start_date);
      const endDate = new Date(eventData.end_date);

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    // Validate attendees is an array if provided
    if (eventData.attendees && !Array.isArray(eventData.attendees)) {
      throw new Error('Attendees must be an array of email addresses');
    }

    const response = await apiAuth(`${CALENDAR_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw new Error(error.message || 'Failed to update calendar event');
  }
}

/**
 * Delete a calendar event
 * @param {number} id - Event ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteCalendarEvent(id) {
  try {
    if (!id) {
      throw new Error('Event ID is required');
    }

    const response = await apiAuth(`${CALENDAR_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    return response;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw new Error(error.message || 'Failed to delete calendar event');
  }
}

/**
 * Get events within a specific date range
 * @param {Date} startDate - Range start date
 * @param {Date} endDate - Range end date
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Filtered array of events
 */
export async function getEventsByDateRange(startDate, endDate, options = {}) {
  try {
    const events = await getCalendarEvents(options);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      return eventStart >= start && eventStart <= end;
    });
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    throw new Error(error.message || 'Failed to fetch events by date range');
  }
}

/**
 * Get events for today
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Array of today's events
 */
export async function getTodayEvents(options = {}) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await getEventsByDateRange(today, tomorrow, options);
  } catch (error) {
    console.error('Error fetching today\'s events:', error);
    throw new Error(error.message || 'Failed to fetch today\'s events');
  }
}

/**
 * Get upcoming events (from now onwards)
 * @param {number} days - Number of days to look ahead (default: 7)
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Array of upcoming events
 */
export async function getUpcomingEvents(days = 7, options = {}) {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return await getEventsByDateRange(now, future, options);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw new Error(error.message || 'Failed to fetch upcoming events');
  }
}

/**
 * Get events for a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11, where 0 = January)
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Array of events for the month
 */
export async function getEventsByMonth(year, month, options = {}) {
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    return await getEventsByDateRange(startDate, endDate, options);
  } catch (error) {
    console.error('Error fetching events by month:', error);
    throw new Error(error.message || 'Failed to fetch events by month');
  }
}

export default {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventsByDateRange,
  getTodayEvents,
  getUpcomingEvents,
  getEventsByMonth,
};
