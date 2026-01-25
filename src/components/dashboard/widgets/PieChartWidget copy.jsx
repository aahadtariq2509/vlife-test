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

// Custom plugin to display percentage in center
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    
    // Get segments from chart options
    const segments = chart.options.plugins?.centerText?.segments || [];
    
    ctx.save();
    
    if (segments.length > 0) {
      // Show the largest segment's percentage as requested
      const largestSegment = segments.reduce((max, seg) => 
        seg.percentage > max.percentage ? seg : max, segments[0]);
      
      // Display percentage prominently in center
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = chart.options.plugins?.centerText?.color || '#374151';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const percentageText = `${largestSegment.percentage}%`;
      ctx.fillText(percentageText, centerX, centerY);
    }
    
    ctx.restore();
  }
};

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  centerTextPlugin
);

const PieChartWidget = ({ widget }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');

  // Get chart data from widget
  const chartData = widget.chartData;
  
  // Handle empty data case - show empty pie chart
  if (!chartData || chartData.isEmpty || !chartData.segments || chartData.segments.length === 0) {
    // Create empty chart data for visualization
    const emptyChartData = {
      labels: ['No Data'],
      datasets: [{
        data: [100],
        backgroundColor: ['#F3F4F6'],
        borderColor: ['#E5E7EB'],
        borderWidth: 2,
        hoverOffset: 0
      }]
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
      cutout: '60%', // Makes it a donut chart
      elements: {
        arc: {
          borderWidth: 2
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
              Breakdown by category
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

        <div className="flex-1 min-h-[256px] relative">
          <Doughnut data={emptyChartData} options={emptyChartOptions} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs">Start logging to see your chart</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const { segments, total, timeRange = ['Daily', 'Weekly', 'Monthly'] } = chartData;

  // Prepare data for Chart.js
  const chartDataConfig = {
    labels: segments.map(segment => segment.name),
    datasets: [
      {
        data: segments.map(segment => segment.value),
        backgroundColor: segments.map(segment => segment.color),
        borderColor: segments.map(segment => segment.color),
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  // Chart.js configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
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
            const segment = segments[context.dataIndex];
            return `${segment.name}: ${segment.value} (${segment.percentage}%)`;
          }
        }
      },
      centerText: {
        color: '#374151',
        showTotal: false,
        segments: segments
      }
    },
    cutout: '60%', // Makes it a donut chart
    elements: {
      arc: {
        borderWidth: 2
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
            Breakdown by category
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

      <div className="flex-1 min-h-[256px]">
        <Doughnut data={chartDataConfig} options={chartOptions} />
      </div>
    </Card>
  );
};

export default PieChartWidget;
