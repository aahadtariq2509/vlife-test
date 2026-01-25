'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Icon } from '@iconify/react';
import { useCalendar } from '@/hooks/useCalendar';
import { useToastContext } from '@/components/providers/ToastProvider';
import CreateNewEventModal from './CreateNewEventModal';
import Modal from '@/components/ui/Modal';

const localizer = momentLocalizer(moment);

export default function CustomCalendar() {
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { success, error: showError } = useToastContext();

  // Calendar hook integration
  const {
    events: apiEvents,
    loading,
    error: calendarError,
    create: createEvent,
    update: updateEvent,
    remove: deleteEvent,
    getByMonth,
  } = useCalendar({
    fetchOnMount: true,
    queryOptions: { limit: 100, orderBy: 'start_date ASC' },
  });

  // Transform API events to react-big-calendar format
  const events = useMemo(() => {
    return apiEvents.map(event => ({
      ...event,
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      title: event.title,
      // Assign colors based on event source or randomly
      color: event.source === 'google' ? 'blue' : event.source === 'microsoft' ? 'green' : 'pink'
    }));
  }, [apiEvents]);

  // Fetch events for the current month whenever the date changes
  useEffect(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    getByMonth(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]); // Only depend on date, not getByMonth

  const eventStyleGetter = (event) => {
    let backgroundColor = '#559EFE';
    let textColor = '#000000';

    if (event.color === 'pink') {
      backgroundColor = '#FFE0E0';
      textColor = '#000000';
    } else if (event.color === 'green') {
      backgroundColor = '#95D0D533';
      textColor = '#000000';
    } else if (event.color === 'blue') {
      backgroundColor = '#589BFF33';
      textColor = '#000000';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '2px',
        opacity: 0.8,
        color: textColor,
        border: 'none',
        display: 'block',
        fontSize: '8px',
        fontWeight: '400',
        padding: '2px 6px'
      }
    };
  };

  const handleCreateEvent = async (eventData) => {
    const result = await createEvent(eventData);
    if (result.success) {
      success('Event Created', 'Your event has been created successfully');
      setIsCreateModalOpen(false);
    } else {
      showError('Error', result.error || 'Failed to create event');
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    const result = await deleteEvent(selectedEvent.id);
    if (result.success) {
      success('Event Deleted', 'Event has been deleted successfully');
      setIsViewModalOpen(false);
      setSelectedEvent(null);
    } else {
      showError('Error', result.error || 'Failed to delete event');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
       <div className="w-full mt-10">
        {/* Header */}
        <div className="grid md:grid-cols-2 gap-3 mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold text-[#4D4D4D]">
              <span className="text-[#4D4D4D] ">
                {moment(date).startOf('week').format('MMM D')} - {moment(date).endOf('week').format('MMM D')}
              </span>
              <span className="text-gray-500 ml-2 font-thin">{moment(date).format('YYYY')}</span>
            </h1>
            <div className='flex items-center gap-3 ml-4'>
              <button
                onClick={() => setDate(moment(date).subtract(1, 'week').toDate())}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronLeft size={20} className="text-[#561FE8]" />
              </button>
              <button
                onClick={() => setDate(moment(date).add(1, 'week').toDate())}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight size={20} className="text-[#561FE8]" />
              </button>
            </div>
          </div>

          <div className="flex md:justify-end items-center gap-5">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center text-sm gap-2 px-4 py-2 bg-[#561FE8] text-white rounded-full hover:bg-[#4a17c9] transition font-medium"
            >
              <Plus size={20} />
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-transparent rounded-lg border-none p-4">
          {loading ? (
            <div className="flex justify-center items-center h-[450px]">
              <Icon icon="mdi:loading" className="text-[#561FE8] text-4xl animate-spin" />
            </div>
          ) : calendarError ? (
            <div className="flex justify-center items-center h-[450px]">
              <p className="text-red-500">{calendarError}</p>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 450 }}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={[Views.WEEK]}
              toolbar={false}
            />
          )}
        </div>

        {/* Create Event Modal */}
        <CreateNewEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
        />

        {/* View Event Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedEvent(null);
          }}
          title={selectedEvent?.title || 'Event Details'}
          className="!max-w-[500px]"
        >
          {selectedEvent && (
            <div className="space-y-4">
              {/* Event Info */}
              <div>
                <h3 className="text-sm font-semibold text-[#4D4D4D] mb-2">Description</h3>
                <p className="text-xs text-[#777777]">{selectedEvent.description}</p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#4D4D4D] mb-1">Start</h3>
                  <p className="text-xs text-[#777777]">{formatDateTime(selectedEvent.start_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#4D4D4D] mb-1">End</h3>
                  <p className="text-xs text-[#777777]">{formatDateTime(selectedEvent.end_date)}</p>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-[#4D4D4D] mb-1">Location</h3>
                <p className="text-xs text-[#777777]">{selectedEvent.location}</p>
              </div>

              {/* Attendees */}
              <div>
                <h3 className="text-sm font-semibold text-[#4D4D4D] mb-1">Attendees</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.attendees?.map((email, index) => (
                    <span key={index} className="text-xs bg-[#F6F6F6] px-3 py-1 rounded-full text-[#4D4D4D]">
                      {email}
                    </span>
                  ))}
                </div>
              </div>

              {/* Source */}
              {selectedEvent.source && (
                <div>
                  <h3 className="text-sm font-semibold text-[#4D4D4D] mb-1">Source</h3>
                  <p className="text-xs text-[#777777] capitalize">{selectedEvent.source} Calendar</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDeleteEvent}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
                >
                  Delete Event
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-[#4D4D4D] text-sm font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
   );
}