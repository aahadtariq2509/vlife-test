'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import ChartHeading from '@/components/ui/ChartHeading/ChartHeading';

const SingleProgressChartWidget = ({ chartData: initialChartData, title = 'Progress' }) => {
  // Use provided chartData or fallback to empty state
  const chartData = initialChartData || {
    current: 0,
    target: 0,
    percentage: 0,
    label: 'No Data',
    unit: 'USD',
    isEmpty: true,
  };

  console.log('SingleProgressChartWidget - chartData:', chartData);

  if (chartData.isEmpty) {
    return (
      <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100">
        <ChartHeading chartTitle={title} />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-center">No data available</p>
        </div>
      </Card>
    );
  }

  // Calculate the stroke-dasharray for the progress circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (chartData.percentage / 100) * circumference;

  // Use vibrant blue color to match Android design
  const progressColor = '#3b82f6'; // Bright blue to match Android

  return (
    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100">
      {/* Header with Title */}
      <div className="mb-6">
        <ChartHeading chartTitle={title} />
      </div>

      {/* Progress Circle */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative" style={{ width: '200px', height: '200px' }}>
          {/* Background Circle */}
          <svg
            className="transform -rotate-90"
            width="200"
            height="200"
            viewBox="0 0 200 200"
          >
            {/* Light gray background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="16"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>

          {/* Centered Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: progressColor }}>
                {Math.round(chartData.percentage)}%
              </div>
            </div>
          </div>
        </div>

        {/* Label and Value */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {chartData.label}
          </h3>
          <p className="text-base text-gray-600">
            {chartData.current}/{chartData.target} {chartData.unit}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SingleProgressChartWidget;
