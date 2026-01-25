import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';

const StepsCountChart = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');

  // Extract data from the new API structure
  const dashboardAttributes = data?.dashboard_attributes || [];
  const stepsCountAttr = dashboardAttributes.find(attr => attr.name === 'steps_count');
  
  // Get steps count data
  const stepsData = stepsCountAttr?.values || [];
  
  // Helpers to aggregate per-day sums and build period-aligned labels
  const sumByDay = (values) => {
    const map = new Map(); // key: YYYY-MM-DD -> { steps, date }
    (values || []).forEach((v) => {
      const d = new Date(v.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split('T')[0];
      const n = parseInt(v.value);
      const add = Number.isNaN(n) ? 0 : n;
      if (!map.has(key)) {
        map.set(key, { steps: add, date: new Date(d) });
      } else {
        const existing = map.get(key);
        existing.steps += add;
      }
    });
    return map;
  };

  const buildPeriodData = (values, period) => {
    const byDay = sumByDay(values);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (period === 'Weekly') {
      // Current week (Mon-Sun)
      const currentDay = now.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = d.toISOString().split('T')[0];
        return {
          day: daysOfWeek[i],
          steps: byDay.get(key)?.steps || 0,
          date: d,
        };
      });
    }

    if (period === 'Monthly') {
      // Current month (1..N)
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }).map((_, i) => {
        const d = new Date(year, month, i + 1);
        const key = d.toISOString().split('T')[0];
        return {
          day: String(i + 1),
          steps: byDay.get(key)?.steps || 0,
          date: d,
        };
      });
    }

    // Daily: last 7 days
    return Array.from({ length: 7 }).map((_, iFromEnd) => {
      const i = 6 - iFromEnd; // oldest to newest
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      return {
        day: `${dayName} ${dayNumber} ${monthName}`,
        steps: byDay.get(key)?.steps || 0,
        date: d,
      };
    });
  };

  const periodData = buildPeriodData(stepsData, selectedPeriod);

  // Calculate total steps for pie chart
  const totalSteps = periodData.reduce((sum, item) => sum + item.steps, 0);
  
  // Generate pie chart data
  const pieData = periodData.map((item, index) => {
    const percentage = totalSteps > 0 ? (item.steps / totalSteps) * 100 : 0;
    return {
      day: item.day,
      steps: item.steps,
      percentage: percentage,
      color: `hsl(${(index * 360) / periodData.length}, 70%, 50%)`
    };
  });

  // Calculate cumulative percentages for pie slices
  let cumulativePercentage = 0;
  const pieSlices = pieData.map((item, index) => {
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360;
    cumulativePercentage += item.percentage;
    
    return {
      ...item,
      startAngle,
      endAngle,
      largeArcFlag: item.percentage > 50 ? 1 : 0
    };
  });

  // SVG path calculation for pie slices
  const createArcPath = (startAngle, endAngle, radius = 60) => {
    const start = polarToCartesian(radius, radius, radius, endAngle);
    const end = polarToCartesian(radius, radius, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", radius, radius,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200 flex-1">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Steps Count
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Daily step distribution over the last 7 days
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="flex items-center justify-center">
        {totalSteps > 0 ? (
          <div className="flex items-center space-x-6">
            {/* Pie Chart */}
            <div className="relative">
              <svg width="140" height="140" className="transform -rotate-90">
                {pieSlices.map((slice, index) => (
                  <path
                    key={index}
                    d={createArcPath(slice.startAngle, slice.endAngle)}
                    fill={slice.color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                    title={`${slice.day}: ${slice.steps.toLocaleString()} steps (${slice.percentage.toFixed(1)}%)`}
                  />
                ))}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalSteps.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Steps
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{item.day}</span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              No steps data available
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StepsCountChart;
