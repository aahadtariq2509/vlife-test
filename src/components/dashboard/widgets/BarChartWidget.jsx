'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { filterValuesByUTCPeriod, getUTCTimePoints, calculateValue, calculateValueWithPeriodAverage, getColorForIndex, normalizePeriod } from '@/lib/dashboard-utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChartWidget = ({ widget }) => {
  // Get available periods from widget config, default to Daily if not available
  const availablePeriods = widget.config && widget.config.length > 0 ? widget.config : ['Daily'];

  // Determine initial selected period
  // For steps logging (steps_count), default to Weekly instead of first item
  const isStepsLogging = widget.matchedAttribute?.name === 'steps_count';
  const initialPeriod = isStepsLogging && availablePeriods.includes('Weekly')
    ? 'Weekly'
    : availablePeriods[0];

  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const chartData = widget.chartData;
  const attribute = widget.matchedAttribute;

  // Determine calculation method based on selected period
  const normalizedSelectedPeriod = useMemo(() => normalizePeriod(selectedPeriod), [selectedPeriod]);
  const calculation = useMemo(() => {
    if (normalizedSelectedPeriod === 'Yearly' && widget.yearly_calculation) {
      return widget.yearly_calculation;
    }
    return widget.calculation || 'sum';
  }, [normalizedSelectedPeriod, widget.yearly_calculation, widget.calculation]);

  // Empty state fallback
  if (!chartData || chartData.isEmpty || !attribute || ((!attribute.values || attribute.values.length === 0) && (!attribute.attributes || attribute.attributes.length === 0))) {
    const emptyChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'No Data',
          data: [],
          backgroundColor: '#E5E7EB',
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    };

    const emptyChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9CA3AF', font: { size: 11 } },
          barPercentage: 0.2,
          categoryPercentage: 0.5
        },
        y: {
          beginAtZero: true,
          grid: { color: '#F3F4F6' },
          ticks: { color: '#9CA3AF', font: { size: 11 } }
        }
      }
    };

    return (
      <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {chartData?.title || widget.title || 'Steps Count'}
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-1 text-sm border rounded-full bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {availablePeriods.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>

        <div className="relative h-[300px]">
          <Bar data={emptyChartData} options={emptyChartOptions} />
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs">Start logging to see your chart</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Filter and process data based on selected period
  const processedData = useMemo(() => {
    if (!attribute) return { labels: [], datasets: [] };

    // Get children - filter by child_attribute_ids if specified
    let children = attribute.attributes || [];

    // If child_attribute_ids is specified, filter children to only include those
    if (widget.child_attribute_ids && widget.child_attribute_ids.length > 0) {
      const childIdStrings = widget.child_attribute_ids.map(id => id.toString());
      children = children.filter(child =>
        childIdStrings.includes(child.id?.toString()) ||
        childIdStrings.includes(child.attribute_id?.toString())
      );
    }

    let categories, datasets;
    
    if (children.length > 0) {
      // Case 1: Attribute has children (multiple series)
      const firstChildWithValues = children.find(child => child.values && child.values.length > 0);
      if (!firstChildWithValues) {
        return { labels: [], datasets: [] };
      }
      
      // Get time points for selected period
      const timePoints = getUTCTimePoints(normalizedSelectedPeriod);
      categories = timePoints.map(tp => tp.label);

      datasets = children.map((child, index) => {
        const dataPoints = timePoints.map(timePoint => {
          // Filter values for this time point
          let valuesForPoint = [];
          if (normalizedSelectedPeriod === 'Daily') {
            const filteredValues = filterValuesByUTCPeriod(child.values || [], normalizedSelectedPeriod);
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              return vDate.getHours() === timePoint.date.getHours(); // Use local hours
            });
          } else {
            const filteredValues = filterValuesByUTCPeriod(child.values || [], normalizedSelectedPeriod);
            if (timePoint.dayKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                // Create local date key
                const year = vDate.getFullYear();
                const month = String(vDate.getMonth() + 1).padStart(2, '0');
                const day = String(vDate.getDate()).padStart(2, '0');
                const vDayKey = `${year}-${month}-${day}`;
                return vDayKey === timePoint.dayKey;
              });
            } else if (timePoint.monthKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vMonthKey = `${vDate.getFullYear()}-${(vDate.getMonth() + 1).toString().padStart(2, '0')}`; // Use local month
                return vMonthKey === timePoint.monthKey;
              });
            }
          }
          
          // Calculate value based on calculation type and period
          return calculateValueWithPeriodAverage(
            valuesForPoint.map(v => parseFloat(v.value) || 0),
            calculation,
            normalizedSelectedPeriod
          );
        });
        
        const childName = child.name || child.display_name || '';
        return {
          label: child.display_name || child.name,
          data: dataPoints,
          backgroundColor: getColorForIndex(index, childName),
          borderRadius: 6,
          borderSkipped: false
        };
      });
    } else if (attribute.values && attribute.values.length > 0) {
      // Case 2: Attribute has direct values (single series over time)
      const timePoints = getUTCTimePoints(normalizedSelectedPeriod);
      categories = timePoints.map(tp => tp.label);

      const dataPoints = timePoints.map(timePoint => {
        // Filter values for this time point
        let valuesForPoint = [];
        if (normalizedSelectedPeriod === 'Daily') {
          const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
          valuesForPoint = filteredValues.filter(v => {
            const vDate = new Date(v.timestamp);
            return vDate.getHours() === timePoint.date.getHours(); // Use local hours
          });
        } else {
          const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
          if (timePoint.dayKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              // Create local date key
              const year = vDate.getFullYear();
              const month = String(vDate.getMonth() + 1).padStart(2, '0');
              const day = String(vDate.getDate()).padStart(2, '0');
              const vDayKey = `${year}-${month}-${day}`;
              return vDayKey === timePoint.dayKey;
            });
          } else if (timePoint.monthKey) {
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              const vMonthKey = `${vDate.getFullYear()}-${(vDate.getMonth() + 1).toString().padStart(2, '0')}`; // Use local month
              return vMonthKey === timePoint.monthKey;
            });
          }
        }
        
        // Calculate value based on calculation type and period
        return calculateValueWithPeriodAverage(
          valuesForPoint.map(v => parseFloat(v.value) || 0),
          calculation,
          normalizedSelectedPeriod
        );
      });
      
      datasets = [{
        label: attribute.display_name || attribute.name,
        data: dataPoints,
        backgroundColor: getColorForIndex(0, attribute.name || attribute.display_name),
        borderRadius: 6,
        borderSkipped: false
      }];
    } else {
      return { labels: [], datasets: [] };
    }
    
    return { labels: categories, datasets };
  }, [attribute, normalizedSelectedPeriod, calculation, widget.child_attribute_ids]);

  const chartOptions = useMemo(() => {
    const isDaily = normalizedSelectedPeriod === 'Daily';
    const shouldRotateLabels = normalizedSelectedPeriod === 'Daily' || normalizedSelectedPeriod === 'Yearly';
    const disableAutoSkip = ['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(normalizedSelectedPeriod);

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#9CA3AF',
            font: { size: 11 },
            autoSkip: disableAutoSkip ? false : undefined,
            maxRotation: shouldRotateLabels ? 45 : 0,
            minRotation: shouldRotateLabels ? 45 : 0,
            maxTicksLimit: disableAutoSkip ? processedData.labels.length || undefined : undefined,
            callback: (value, index) => {
              const label = processedData.labels[index] ?? value;
              return label;
            }
          },
          barPercentage: 0.2, // ✅ slim columns
          categoryPercentage: 0.5
        },
        y: {
          beginAtZero: true,
          grid: { color: '#F3F4F6', drawBorder: false },
          ticks: { color: '#9CA3AF', font: { size: 11 } }
        }
      }
    };
  }, [normalizedSelectedPeriod, processedData.labels]);

  const chartDataConfig = { labels: processedData.labels, datasets: processedData.datasets };

  return (
    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {chartData?.title || widget.title || 'Steps Count'}
        </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-1 text-sm border rounded-full bg-white text-black shadow-sm focus:outline-none ring-[#DFDFDF] ring-1 outline-none"
          >
            {availablePeriods.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
      </div>

      {/* Chart container */}
          <div className="md:h-[500px] h-[250px]">
            <Bar data={chartDataConfig} options={chartOptions} />
          </div>
    </Card>
  );
};

export default BarChartWidget;
