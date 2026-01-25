'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ChartHeading from '@/components/ui/ChartHeading/ChartHeading';
import { getCurrentQuarterIndex } from '@/lib/dashboard-utils';

const ReverseHeatmapChartWidget = ({ chartData: initialChartData, title = 'Add Income' }) => {

  // Use provided chartData or fallback to empty state
  const chartData = initialChartData || {
    quarters: [],
    series: [],
  };

  // Determine initial quarter index (current quarter if available, otherwise 0)
  const initialQuarterIndex = chartData.quarters && chartData.quarters.length > 0
    ? getCurrentQuarterIndex(chartData.quarters)
    : 0;

  // State for current quarter selection
  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(initialQuarterIndex);
  const quarters = chartData.quarters || [];
  const currentQuarter = quarters[currentQuarterIndex] || { name: 'Q1 2026', months: ['Jan', 'Feb', 'Mar'] };

  // Update quarter index when chartData changes
  useEffect(() => {
    if (chartData.quarters && chartData.quarters.length > 0) {
      const newIndex = getCurrentQuarterIndex(chartData.quarters);
      setCurrentQuarterIndex(newIndex);
    }
  }, [chartData.quarters]);

  // Navigate to previous quarter
  const handlePrevQuarter = () => {
    if (currentQuarterIndex > 0) {
      setCurrentQuarterIndex(currentQuarterIndex - 1);
    }
  };

  // Navigate to next quarter
  const handleNextQuarter = () => {
    if (currentQuarterIndex < quarters.length - 1) {
      setCurrentQuarterIndex(currentQuarterIndex + 1);
    }
  };

  // Get current quarter data for each series
  const currentSeries = chartData.series.map(s => ({
    ...s,
    data: s.quarterlyData ? s.quarterlyData[currentQuarterIndex] || [0, 0, 0] : s.data || [0, 0, 0],
    unit: s.unit || 'USD' // Get unit from series data
  }));

  // Calculate summary totals for each month in current quarter
  const summaryTotals = new Array(3).fill(0);
  currentSeries.forEach((s) => {
    s.data.forEach((v, index) => {
      summaryTotals[index] += v;
    });
  });

  // Calculate total target for summary (sum of all income targets)
  const totalTarget = currentSeries.reduce((sum, s) => sum + s.budget, 0);

  // Helper function to get cell color based on percentage of target (REVERSED for income)
  const getCellColor = (value, budget) => {
    if (budget === 0) return '#F3F4F6'; // Gray for no budget

    const percentage = (value / budget) * 100;

    // REVERSED: For income, higher is better, so use reverse color scheme
    if (percentage >= 90) return '#16A34A'; // Green: 90-100% (Good!)
    if (percentage >= 75) return '#FDE047'; // Yellow: 75-90%
    if (percentage >= 50) return '#F59E0B'; // Orange: 50-75%
    return '#EF4444'; // Red: 0-50% (Bad - not meeting income goals)
  };

  return (
    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100">
      {/* Header with Title and Quarter Navigation */}
      <div className="mb-4">
        <ChartHeading chartTitle={title} />

        {/* Quarter Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handlePrevQuarter}
            disabled={currentQuarterIndex === 0}
            className={`p-1 rounded ${currentQuarterIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <div className="text-base font-semibold text-[#6366f1]">{currentQuarter.name}</div>
            <div className="text-xs text-gray-500">{currentQuarter.months.join(' • ')}</div>
          </div>

          <button
            onClick={handleNextQuarter}
            disabled={currentQuarterIndex === quarters.length - 1}
            className={`p-1 rounded ${currentQuarterIndex === quarters.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-gray-600 p-2"></th>
              {currentQuarter.months.map((month, index) => (
                <th key={index} className="text-center text-xs font-medium text-gray-600 p-2">{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Income Rows */}
            {currentSeries.map((series, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                <td className="p-2">
                  <div className="text-sm font-medium text-gray-700">{series.name}</div>
                  <div className="text-xs text-gray-500">Target: {series.budget} {series.unit}</div>
                </td>
                {series.data.map((value, colIndex) => (
                  <td key={colIndex} className="p-2">
                    <div
                      className="rounded text-center text-sm font-medium flex items-center justify-center"
                      style={{
                        backgroundColor: getCellColor(value, series.budget),
                        color: '#FFFFFF',
                        minWidth: '100px',
                        minHeight: '48px',
                        width: '100px',
                        height: '48px'
                      }}
                    >
                      {value} {series.unit}
                    </div>
                  </td>
                ))}
              </tr>
            ))}

            {/* Summary Row */}
            <tr className="bg-gray-50">
              <td className="p-2">
                <div className="text-sm font-semibold text-gray-700">Summary</div>
              </td>
              {summaryTotals.map((total, index) => {
                // Get unit from first series (all series should have same unit)
                const unit = currentSeries[0]?.unit || 'USD';
                // Calculate color based on total target percentage (reverse color scheme for income)
                const summaryColor = getCellColor(total, totalTarget);
                return (
                  <td key={index} className="p-2">
                    <div
                      className="rounded text-center text-sm font-medium flex items-center justify-center"
                      style={{
                        backgroundColor: summaryColor,
                        color: '#FFFFFF',
                        minWidth: '100px',
                        minHeight: '48px',
                        width: '100px',
                        height: '48px'
                      }}
                    >
                      {total} {unit}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress Legend - REVERSED for income - Green is good (exceeding goals) */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-600 pt-4 border-t border-gray-100 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
          <span>0-50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
          <span>50-75%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FDE047' }}></div>
          <span>75-90%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16A34A' }}></div>
          <span>90-100%</span>
        </div>
      </div>
    </Card>
  );
};

export default ReverseHeatmapChartWidget;
