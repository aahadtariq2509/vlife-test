'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { preparePieChartData, normalizePeriod } from '@/lib/dashboard-utils';

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
  const chartData = widget.chartData;
  const attribute = widget.matchedAttribute;
  const allAttributes = widget.allAttributes || [];

  const availablePeriods = useMemo(() => {
    if (chartData?.timeRange?.length > 0) {
      return chartData.timeRange;
    }
    if (widget.config?.length > 0) {
      return widget.config;
    }
    return ['Daily'];
  }, [chartData?.timeRange?.join?.('|'), widget.config?.join?.('|')]);

  const [selectedPeriod, setSelectedPeriod] = useState(() => availablePeriods[0]);

  useEffect(() => {
    if (availablePeriods.length > 0 && !availablePeriods.includes(selectedPeriod)) {
      setSelectedPeriod(availablePeriods[0]);
    }
  }, [availablePeriods, selectedPeriod]);

  // Determine calculation method based on selected period
  const normalizedSelectedPeriod = useMemo(() => normalizePeriod(selectedPeriod), [selectedPeriod]);
  const calculation = useMemo(() => {
    if (normalizedSelectedPeriod === 'Yearly' && widget.yearly_calculation) {
      return widget.yearly_calculation;
    }
    return widget.calculation || 'sum';
  }, [normalizedSelectedPeriod, widget.yearly_calculation, widget.calculation]);

  // Recalculate chart data when period changes (fallback to original data if recalculation fails)
  const computedChartData = useMemo(() => {
    if (!chartData || !attribute) {
      return chartData;
    }

    try {
      const recalculated = preparePieChartData(
        {
          ...widget,
          calculation,
          config: [selectedPeriod]
        },
        attribute,
        allAttributes
      );

      return {
        ...chartData,
        ...recalculated,
        timeRange: availablePeriods,
        isEmpty: recalculated?.isEmpty ?? false
      };
    } catch (error) {
      console.error('PieChartWidget: Failed to recalculate pie chart data', { error });
      return chartData;
    }
  }, [
    attribute,
    allAttributes,
    availablePeriods,
    calculation,
    chartData,
    selectedPeriod,
    widget
  ]);

  const activeChartData = computedChartData || chartData;
  const hasSegments = activeChartData?.segments && activeChartData.segments.length > 0;

  // Handle empty data case - show empty pie chart
  if (!activeChartData || activeChartData.isEmpty || !hasSegments) {
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
              {activeChartData?.title || widget.title || widget.widget_type.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Breakdown by category
            </p>
          </div>
          {availablePeriods.length > 0 && (
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availablePeriods.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
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

  const { segments, total, timeRange = ['Daily', 'Weekly', 'Monthly'], data } = activeChartData;

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
        display: false
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
            {activeChartData?.title || widget.title || widget.widget_type.name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Breakdown by category
          </p>
        </div>
        {availablePeriods.length > 0 && (
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availablePeriods.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 max-h-[256px] flex justify-center items-center mb-12">
        <Doughnut data={chartDataConfig} options={chartOptions} />
      </div>

      <div className="mt-6 py-6 flex flex-wrap gap-6 justify-center">
        {segments && Array.isArray(segments) && segments.map((segment, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xl font-semibold text-[#4D4D4D] mb-0.5">
              {segment.value.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-xs text-[#00000066] font-normal">
                {segment.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data && Array.isArray(data) && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs text-[#00000066] font-normal dark:text-white mb-3">Data Details</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Index</th>
                  <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((value, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-2 px-2 text-xl font-semibold text-[#4D4D4D] ">{index}</td>
                    <td className="text-right py-2 px-2 text-sm text-gray-500">{value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PieChartWidget;