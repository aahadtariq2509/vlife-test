'use client';

import React, { useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Icon } from '@iconify/react';

const localizer = momentLocalizer(moment);

export default function CustomCalendar() {
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date(2021, 2, 1));

  const events = [
    {
      id: 1,
      title: 'Groomers appt.',
      start: new Date(2021, 2, 1),
      end: new Date(2021, 2, 1),
      color: 'pink'
    },
    {
      id: 2,
      title: 'Meeting w/ Chris',
      start: new Date(2021, 2, 3),
      end: new Date(2021, 2, 3),
      color: 'blue'
    },
    {
      id: 3,
      title: 'Lunch w/ Mom',
      start: new Date(2021, 2, 5),
      end: new Date(2021, 2, 5),
      color: 'green'
    },
    {
      id: 4,
      title: 'Financial Advisor Meeting',
      start: new Date(2021, 2, 7),
      end: new Date(2021, 2, 7),
      color: 'blue'
    },
    {
      id: 5,
      title: 'Interview w/ Figma',
      start: new Date(2021, 2, 8),
      end: new Date(2021, 2, 8),
      color: 'blue'
    },
    {
      id: 6,
      title: 'Send follow-up email!',
      start: new Date(2021, 2, 8),
      end: new Date(2021, 2, 8),
      color: 'pink'
    },
    {
      id: 7,
      title: "Ashley's Choir Recital",
      start: new Date(2021, 2, 12),
      end: new Date(2021, 2, 12),
      color: 'green'
    },
  ];

  const eventStyleGetter = (event) => {
    let backgroundColor = '#559EFE';
    let textColor = '#ffffff';

    if (event.color === 'pink') {
      backgroundColor = '#FFE0E0';
      textColor = '#C42828';
    } else if (event.color === 'green') {
      backgroundColor = '#E0F5E0';
      textColor = '#2E7D32';
    } else if (event.color === 'blue') {
      backgroundColor = '#E0E7FF';
      textColor = '#3D5AFE';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.8,
        color: textColor,
        border: 'none',
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 6px'
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="grid md:grid-cols-2 gap-3 mb-8">
          <div className="flex items-center gap-4 relative ">
            <h1 className="text-3xl font-extrabold text-[#4D4D4D]">
              <span className="text-[#4D4D4D] ">{moment(date).format('MMMM')}</span>
              <span className="text-gray-500 ml-2 font-thin">{moment(date).format('YYYY')}</span>
            </h1>
            <div className='flex items-center absolute left-[50%] gap-3'>
              <button
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronLeft size={20} className="text-[#561FE8]" />
              </button>
              <button
                onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight size={20} className="text-[#561FE8]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex gap-2 bg-white rounded-full border border-[#561FE8]">
              {[Views.MONTH, Views.WEEK, Views.DAY].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 h-9 rounded-full text-xs font-medium transition-colors capitalize ${view === v
                      ? 'bg-[#561FE8] text-white'
                      : 'text-[#561FE8] hover:bg-gray-100'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="border border-[#561FE8] rounded-full">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-[#561FE8] text-sm font-medium">
                <Icon icon="circum:filter" width="14" />
                Filter events
              </button>
            </div>
            <button className="flex items-center text-sm gap-2 px-4 py-2 bg-[#561FE8] text-white rounded-full hover:bg-[#561FE8] font-medium">
              <Plus size={20} />
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            toolbar={false}
          />
        </div>
      </div>
    </div>
  );
}