'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ProgressChartWidget = ({ widget }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');

  // Get chart data from widget
  const chartData = widget.chartData;
  
  // Handle empty data case - show empty progress chart
  if (!chartData || chartData.isEmpty || !chartData.rings || chartData.rings.length === 0) {
    // Create empty chart data for visualization with gaps
    const emptyChartData = {
      labels: ['Daily', 'Weekly', 'Monthly'],
      datasets: [
        {
          data: [0, 100], // Empty ring - outer
          backgroundColor: ['#F3F4F6', '#F3F4F6'],
          borderColor: ['#E5E7EB', '#E5E7EB'],
          borderWidth: 0,
          cutout: '70%', // Outer ring
          weight: 1
        },
        {
          data: [0, 100], // Empty ring - middle
          backgroundColor: ['#F3F4F6', '#F3F4F6'],
          borderColor: ['#E5E7EB', '#E5E7EB'],
          borderWidth: 0,
          cutout: '78%', // Middle ring with gap
          weight: 1
        },
        {
          data: [0, 100], // Empty ring - inner
          backgroundColor: ['#F3F4F6', '#F3F4F6'],
          borderColor: ['#E5E7EB', '#E5E7EB'],
          borderWidth: 0,
          cutout: '86%', // Inner ring with gap
          weight: 1
        }
      ]
    };

    const emptyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      elements: {
        arc: {
          borderWidth: 0
        }
      }
    };

    return (
      <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {chartData?.title || widget.title || widget.widget_type.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Progress tracking over time
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

        <div className="flex-1 relative min-h-[256px]">
          <Doughnut data={emptyChartData} options={emptyChartOptions} />
          
          {/* Center percentage display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                0%
              </div>
              <div className="text-sm text-gray-400">
                No Data
              </div>
            </div>
          </div>
        </div>

        {/* Bottom metrics - matching Figma design */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {['Monthly', 'Weekly', 'Today'].map((period, index) => {
            const iconColors = ['#8b5cf6', '#3b82f6', '#60a5fa']; // Purple, Blue, Light Blue
            
            return (
              <div key={index} className="flex flex-col items-center">
                {/* Label */}
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                  {period}
                </div>
                
                {/* Human Foot Icon */}
                <div className="mb-3 flex items-center justify-center">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: iconColors[index] }}
                  >
                    {/* Foot shape - realistic human foot/print */}
                    <path 
                      d="M12 18C15 18 18 16 18 13C18 10 16 8 13 8C10 8 8 10 8 13C8 16 9 18 12 18Z" 
                      fill="currentColor"
                      fillOpacity="0.3"
                    />
                    <ellipse cx="15" cy="9" rx="2" ry="2.5" fill="currentColor"/>
                    <ellipse cx="14" cy="7" rx="1.5" ry="2" fill="currentColor"/>
                    <ellipse cx="12.5" cy="6.5" rx="1.2" ry="1.8" fill="currentColor"/>
                    <ellipse cx="11" cy="6.5" rx="1" ry="1.5" fill="currentColor"/>
                    <ellipse cx="9.5" cy="7" rx="0.8" ry="1.2" fill="currentColor"/>
                    <ellipse cx="12" cy="19" rx="3" ry="2" fill="currentColor" fillOpacity="0.4"/>
                  </svg>
                </div>
                
                {/* Values */}
                <div className="text-base font-bold text-gray-400 dark:text-gray-500 mb-0.5">
                  0
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  / 0
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  const { rings, timeRange = ['Daily', 'Weekly', 'Monthly'] } = chartData;

  // Order rings: Today (outermost), Weekly (middle), Monthly (innermost)
  // Based on Figma design, Today should be outermost
  const orderedRings = [
    rings.find(r => r.label === 'Today' || r.label === 'Daily') || rings[0],
    rings.find(r => r.label === 'Weekly') || rings[1],
    rings.find(r => r.label === 'Monthly') || rings[2]
  ].filter(Boolean);

  // Prepare data for Chart.js - create concentric rings with gaps
  // Outer ring (Today), middle ring (Weekly), inner ring (Monthly)
  // Add spacing between rings: 70%, 78%, 86% (8% gap between each)
  const chartDataConfig = {
    labels: orderedRings.map(ring => ring.label),
    datasets: orderedRings.map((ring, index) => ({
      data: [ring.progress, 100 - ring.progress],
      backgroundColor: [ring.color, '#F3F4F6'],
      borderColor: [ring.color, '#F3F4F6'],
      borderWidth: 0,
      cutout: `${70 + (index * 8)}%`, // Outer to inner: 70%, 78%, 86% (8% gap between rings)
      weight: 1
    }))
  };

  // Chart.js configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Hide legend as we have custom bottom metrics
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const ring = orderedRings[context.datasetIndex];
            return `${ring.label}: ${ring.current}/${ring.goal} (${ring.progress}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0,
        borderRadius: 4
      }
    }
  };

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {chartData?.title || widget.title || widget.widget_type.name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Progress tracking over time
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {timeRange && Array.isArray(timeRange) && timeRange.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 relative min-h-[280px] flex flex-col">
        {/* Chart area */}
        <div className="flex-1 relative">
          <Doughnut data={chartDataConfig} options={chartOptions} />
          
          {/* Center percentage display - matching Figma design */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-500" style={{ lineHeight: '1.2' }}>
                {orderedRings[0]?.progress || 0}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {orderedRings[0]?.label === 'Daily' ? 'Today' : orderedRings[0]?.label || 'Today'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom metrics - matching Figma design */}
        {/* Order: Monthly (left), Weekly (middle), Today (right) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {[
            orderedRings.find(r => r.label === 'Monthly') || orderedRings[2],
            orderedRings.find(r => r.label === 'Weekly') || orderedRings[1],
            orderedRings.find(r => r.label === 'Today' || r.label === 'Daily') || orderedRings[0]
          ].filter(Boolean).map((ring, index) => {
            const label = ring.label === 'Daily' ? 'Today' : ring.label;
            // Colors based on Figma: Monthly (purple), Weekly (blue), Today (light blue)
            const iconColors = ['#8b5cf6', '#3b82f6', '#60a5fa']; // Purple, Blue, Light Blue
            
            return (
              <div key={ring.label} className="flex flex-col items-center">
                {/* Label */}
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                  {label}
                </div>
                
                {/* Human Foot Icon - realistic footprint */}
                <div className="mb-3 flex items-center justify-center">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: iconColors[index] || ring.color }}
                  >
                    {/* Foot shape - realistic human foot/print */}
                    {/* Main foot pad */}
                    <path 
                      d="M12 18C15 18 18 16 18 13C18 10 16 8 13 8C10 8 8 10 8 13C8 16 9 18 12 18Z" 
                      fill="currentColor"
                      fillOpacity="0.3"
                    />
                    {/* Big toe */}
                    <ellipse cx="15" cy="9" rx="2" ry="2.5" fill="currentColor"/>
                    {/* Second toe */}
                    <ellipse cx="14" cy="7" rx="1.5" ry="2" fill="currentColor"/>
                    {/* Third toe */}
                    <ellipse cx="12.5" cy="6.5" rx="1.2" ry="1.8" fill="currentColor"/>
                    {/* Fourth toe */}
                    <ellipse cx="11" cy="6.5" rx="1" ry="1.5" fill="currentColor"/>
                    {/* Little toe */}
                    <ellipse cx="9.5" cy="7" rx="0.8" ry="1.2" fill="currentColor"/>
                    {/* Heel area */}
                    <ellipse cx="12" cy="19" rx="3" ry="2" fill="currentColor" fillOpacity="0.4"/>
                  </svg>
                </div>
                
                {/* Values */}
                <div className="text-base font-bold text-gray-900 dark:text-white mb-0.5">
                  {ring.current.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  / {ring.goal.toLocaleString()}
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
