import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';

const CaloriesBreakdownChart = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');

  // Extract data from the new API structure
  const dashboardAttributes = data?.dashboard_attributes || [];
  
  // Find calorie intake attribute
  const calorieIntakeAttr = dashboardAttributes.find(attr => attr.name === 'calorie_intake');
  
  // Get latest calorie data for each meal
  const getLatestValue = (attributeName) => {
    if (!calorieIntakeAttr?.attributes) {
      return 0;
    }
    const attribute = calorieIntakeAttr.attributes.find(attr => attr.name === attributeName);
    return parseInt(attribute?.values?.[0]?.value) || 0;
  };

  const breakfast = getLatestValue('breakfast');
  const lunch = getLatestValue('lunch');
  const dinner = getLatestValue('dinner');
  const brunch = getLatestValue('brunch');
  const snack = getLatestValue('snack');

  const totalCalories = breakfast + lunch + dinner + brunch + snack;

  // Calculate percentages
  const breakfastPercent = totalCalories > 0 ? Math.round((breakfast / totalCalories) * 100) : 0;
  const lunchPercent = totalCalories > 0 ? Math.round((lunch / totalCalories) * 100) : 0;
  const dinnerPercent = totalCalories > 0 ? Math.round((dinner / totalCalories) * 100) : 0;
  const brunchPercent = totalCalories > 0 ? Math.round((brunch / totalCalories) * 100) : 0;
  const snackPercent = totalCalories > 0 ? Math.round((snack / totalCalories) * 100) : 0;

  // Create data for the donut chart
  const chartData = [
    { name: 'Breakfast', value: breakfast, percentage: breakfastPercent, color: '#3b82f6' },
    { name: 'Lunch', value: lunch, percentage: lunchPercent, color: '#60a5fa' },
    { name: 'Dinner', value: dinner, percentage: dinnerPercent, color: '#8b5cf6' },
    { name: 'Brunch', value: brunch, percentage: brunchPercent, color: '#f59e0b' },
    { name: 'Snack', value: snack, percentage: snackPercent, color: '#ef4444' }
  ];

  // Calculate angles for the pie chart
  let cumulativeAngle = 0;
  const chartSegments = chartData.map(item => {
    const angle = (item.percentage / 100) * 360;
    const segment = {
      ...item,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle
    };
    cumulativeAngle += angle;
    return segment;
  });

  // Calculate path for each pie segment
  const getPathData = (startAngle, endAngle, radius = 50) => {
    const centerX = 60;
    const centerY = 60;
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
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
            Calories Breakdown
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Daily calorie intake by meal
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

      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg className="w-32 h-32" viewBox="0 0 120 120">
            {chartSegments.map((segment, index) => (
              <path
                key={index}
                d={getPathData(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-500 ease-out hover:opacity-80"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {totalCalories.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total Calories
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center min-w-0 flex-1">
              <div 
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {item.value.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CaloriesBreakdownChart;
