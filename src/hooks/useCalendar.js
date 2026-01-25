import { useState, useEffect, useCallback } from 'react';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getEventsByDateRange,
  getTodayEvents,
  getUpcomingEvents,
  getEventsByMonth,
} from '@/lib/calendar-api';

/**
 * Custom hook for managing calendar events
 * Provides data fetching, mutations, and state management for calendar events
 * Automatically syncs with Google Calendar and Microsoft Calendar if connected
 *
 * @param {Object} options - Hook options
 * @param {boolean} options.fetchOnMount - Whether to fetch events on mount (default: true)
 * @param {Object} options.queryOptions - Options to pass to getCalendarEvents API
 * @returns {Object} Calendar events data and mutation functions
 */
export function useCalendar({ fetchOnMount = true, queryOptions = {} } = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch calendar events from API
   * Automatically syncs with Google Calendar and Microsoft Calendar if connected
   */
  const fetchEvents = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const fetchedEvents = await getCalendarEvents(mergedOptions);
      setEvents(fetchedEvents);
      return fetchedEvents;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching calendar events:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Create a new calendar event
   */
  const create = useCallback(async (eventData) => {
    try {
      setIsCreating(true);
      setError(null);
      const newEvent = await createCalendarEvent(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return { success: true, data: newEvent };
    } catch (err) {
      setError(err.message);
      console.error('Error creating calendar event:', err);
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  }, []);

  /**
   * Update an existing calendar event
   */
  const update = useCallback(async (id, eventData) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedEvent = await updateCalendarEvent(id, eventData);
      setEvents(prev =>
        prev.map(event => (event.id === id ? { ...event, ...updatedEvent } : event))
      );
      return { success: true, data: updatedEvent };
    } catch (err) {
      setError(err.message);
      console.error('Error updating calendar event:', err);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Delete a calendar event
   */
  const remove = useCallback(async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteCalendarEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Error deleting calendar event:', err);
      return { success: false, error: err.message };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  /**
   * Get events for a specific date range
   */
  const getByDateRange = useCallback(async (startDate, endDate, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const rangeEvents = await getEventsByDateRange(startDate, endDate, mergedOptions);
      return rangeEvents;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events by date range:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get today's events
   */
  const getToday = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const todayEvents = await getTodayEvents(mergedOptions);
      return todayEvents;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching today\'s events:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get upcoming events
   */
  const getUpcoming = useCallback(async (days = 7, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const upcomingEvents = await getUpcomingEvents(days, mergedOptions);
      return upcomingEvents;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching upcoming events:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get events for a specific month
   */
  const getByMonth = useCallback(async (year, month, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedOptions = { ...queryOptions, ...options };
      const monthEvents = await getEventsByMonth(year, month, mergedOptions);
      setEvents(monthEvents); // Update state with month events
      return monthEvents;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching events by month:', err);
      return [];
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Refresh events (refetch)
   */
  const refresh = useCallback(() => {
    return fetchEvents();
  }, [fetchEvents]);

  /**
   * Get events for a specific day
   */
  const getByDay = useCallback((date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= targetDate && eventDate < nextDay;
    });
  }, [events]);

  // Fetch events on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchEvents();
    }
  }, [fetchOnMount, fetchEvents]);

  // Computed values
  const todayEventsCount = events.filter(event => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(event.start_date);
    return eventDate >= today && eventDate < tomorrow;
  }).length;

  const upcomingEventsCount = events.filter(event => {
    const now = new Date();
    const eventDate = new Date(event.start_date);
    return eventDate > now;
  }).length;

  return {
    events,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,

    // Actions
    fetchEvents,
    create,
    update,
    remove,
    getByDateRange,
    getToday,
    getUpcoming,
    getByMonth,
    getByDay,
    refresh,

    // Computed values
    todayEventsCount,
    upcomingEventsCount,
    totalEventsCount: events.length,
  };
}

export default useCalendar;
