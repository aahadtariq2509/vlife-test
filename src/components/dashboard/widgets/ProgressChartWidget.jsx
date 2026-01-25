'use client';

import { Card } from '@/components/ui/Card';
import React from 'react';

const ProgressChartWidget = ({ widget }) => {
  // Get chart data from widget
  const chartData = widget?.chartData;

  // Handle empty data case
  if (!chartData || chartData.isEmpty || !chartData.rings || chartData.rings.length === 0) {
    return (
      <Card className="p-4 bg-white border-[0.5px] border-[#0000001A] rounded-[14.01px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] w-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] duration-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg text-black dark:text-white">
            {chartData?.title || widget?.title || 'Steps Progress'}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p>No data available</p>
          </div>
        </div>
      </Card>
    );
  }

  const { rings, title } = chartData;

  // Order rings: Today (Daily) is always first, then Monthly, then Weekly/Yearly
  const todayRing = rings.find(r => r.label === 'Today' || r.label === 'Daily') || rings[0];
  const monthlyRing = rings.find(r => r.label === 'Monthly') || rings[1];
  const thirdRing = rings.find(r => r.label === 'Weekly' || r.label === 'Yearly') || rings[2];

  // Display order: Today, Monthly, Weekly/Yearly (from left to right at bottom)
  const displayedRings = [
    todayRing,
    monthlyRing,
    thirdRing
  ].filter(Boolean);

  return (
    <Card className="p-4 bg-white border-[0.5px] border-[#0000001A] rounded-[14.01px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] w-full hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] duration-200 h-full flex flex-col">
      {/* Chart Card */}
      <div>
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-lg text-black dark:text-white">
            {title || widget?.title || 'Steps Progress'}
          </h2>
        </div>

        {/* Radial Progress Chart */}
        <div className="flex justify-center items-center mb-12">
          <div className="relative w-64 h-64">
            <svg width="256" height="256" viewBox="0 0 256 256" className="transform rotate-90">
              {/* Background circles */}
              <circle cx="128" cy="128" r="110" fill="none" stroke="#F3F4F6" strokeWidth="12" />
              <circle cx="128" cy="128" r="85" fill="none" stroke="#F3F4F6" strokeWidth="12" />
              <circle cx="128" cy="128" r="60" fill="none" stroke="#F3F4F6" strokeWidth="12" />
              
                  {/* Show all three rings */}
              {/* Outer ring: Today */}
              {todayRing && (
                  <circle
                    cx="128"
                    cy="128"
                    r="110"
                    fill="none"
                  stroke={todayRing.color}
                    strokeWidth="12"
                  strokeDasharray={`${(todayRing.progress / 100) * 2 * Math.PI * 110} ${2 * Math.PI * 110}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
              )}
              {/* Middle ring: Monthly */}
              {monthlyRing && (
                  <circle
                    cx="128"
                    cy="128"
                    r="85"
                    fill="none"
                  stroke={monthlyRing.color}
                    strokeWidth="12"
                  strokeDasharray={`${(monthlyRing.progress / 100) * 2 * Math.PI * 85} ${2 * Math.PI * 85}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
              )}
              {/* Inner ring: Weekly/Yearly */}
              {thirdRing && (
                  <circle
                    cx="128"
                    cy="128"
                    r="60"
                    fill="none"
                  stroke={thirdRing.color}
                    strokeWidth="12"
                  strokeDasharray={`${(thirdRing.progress / 100) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
              )}
            </svg>

            {/* Center text - Always shows Today's progress */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: todayRing?.color }}>
                  {todayRing?.progress || 0}%
                </div>
                <div className="text-base text-gray-600 mt-1">
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-8">
          {displayedRings.map((ring, index) => {
            const label = ring.label === 'Daily' ? 'Today' : ring.label;            
            return (
              <div key={ring.label} className={`flex flex-col items-center py-6 px-4 ${index !== displayedRings.length - 1 ? 'border-r border-[#00000026]' : ''}`}>
                <div className="text-xs text-[#00000066] font-normal mb-3">
                  {label}
                </div>
                
                <div className="mb-3 flex items-center gap-2 justify-center">
                  <img 
                    src={index === 0 ? '/images/icons/step-1.svg' : index === 1 ? '/images/icons/step-2.svg' : '/images/icons/step-3.svg'}
                    alt={label}
                    className="w-2"
                  />
                  <div className="text-xl font-semibold text-[#4D4D4D] mb-0.5">
                    {ring.current.toLocaleString()}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  /{ring.goal.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ProgressChartWidget;