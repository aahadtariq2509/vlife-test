'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { filterValuesByUTCPeriod, getUTCTimePoints, calculateValue, calculateValueWithPeriodAverage, getColorForIndex, getChildAttributesByIds, parseDoubleNumber, normalizePeriod } from '@/lib/dashboard-utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChartWidget = ({ widget }) => {
  // Get available periods from widget config, default to Daily if not available
  const availablePeriods = widget.config && widget.config.length > 0 ? widget.config : ['Daily'];
  const [selectedPeriod, setSelectedPeriod] = useState(availablePeriods[0]);

  // Get chart data from widget
  const chartData = widget.chartData;
  const attribute = widget.matchedAttribute;
  const allAttributes = widget.allAttributes || [];

  // Filter and process data based on selected period
  const normalizedSelectedPeriod = useMemo(() => normalizePeriod(selectedPeriod), [selectedPeriod]);

  // Determine calculation method based on selected period
  const calculation = useMemo(() => {
    if (normalizedSelectedPeriod === 'Yearly' && widget.yearly_calculation) {
      return widget.yearly_calculation;
    }
    return widget.calculation || 'sum';
  }, [normalizedSelectedPeriod, widget.yearly_calculation, widget.calculation]);

  const processedData = useMemo(() => {
    if (!attribute) return { labels: [], datasets: [] };
    
    // Handle child_attribute_ids for line charts
    let children = [];
    if (widget.child_attribute_ids && widget.child_attribute_ids.length > 0) {
      children = getChildAttributesByIds(widget.child_attribute_ids, allAttributes);
    } else {
      children = attribute.attributes || [];
    }
    
    let labels, datasets;
    
    if (children.length > 0) {
      // Case 1: Attribute has children (multiple lines)
      const firstChildWithValues = children.find(child => child.values && child.values.length > 0);
      if (!firstChildWithValues) {
        return { labels: [], datasets: [] };
      }
      
      // Get time points for selected period
      const timePoints = getUTCTimePoints(normalizedSelectedPeriod);
      labels = timePoints.map(tp => tp.label);
      
      datasets = children.map((child, index) => {
        const dataPoints = timePoints.map(timePoint => {
          // Filter values for this time point
          let valuesForPoint = [];
          if (normalizedSelectedPeriod === 'Daily') {
            const filteredValues = filterValuesByUTCPeriod(child.values || [], normalizedSelectedPeriod);
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              return vDate.getUTCHours() === timePoint.date.getUTCHours();
            });
          } else {
            const filteredValues = filterValuesByUTCPeriod(child.values || [], normalizedSelectedPeriod);
            if (timePoint.dayKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vDayKey = vDate.toISOString().split('T')[0];
                return vDayKey === timePoint.dayKey;
              });
            } else if (timePoint.monthKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
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
        const color = getColorForIndex(index, childName);
        return {
          label: child.display_name || child.name,
          data: dataPoints,
          borderColor: color,
          backgroundColor: color + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          unit: child.unit
        };
      });
    } else if (attribute.values && attribute.values.length > 0) {
      // Case 2: Attribute has direct values
      // Check if this is a double_number type (e.g., blood_pressure)
      const isDoubleNumber = attribute.value_type === 'double_number';
      
      const timePoints = getUTCTimePoints(normalizedSelectedPeriod);
      labels = timePoints.map(tp => tp.label);
      
      if (isDoubleNumber) {
        // For double_number type, create two lines (systolic and diastolic)
        const systolicDataPoints = timePoints.map(timePoint => {
          // Filter values for this time point
          let valuesForPoint = [];
          if (normalizedSelectedPeriod === 'Daily') {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              return vDate.getUTCHours() === timePoint.date.getUTCHours();
            });
          } else {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
            if (timePoint.dayKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vDayKey = vDate.toISOString().split('T')[0];
                return vDayKey === timePoint.dayKey;
              });
            } else if (timePoint.monthKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
                return vMonthKey === timePoint.monthKey;
              });
            }
          }
          
          // Parse double_number values and extract systolic values
          const systolicValues = valuesForPoint
            .map(v => {
              const parsed = parseDoubleNumber(v.value);
              return parsed ? parsed.systolic : null;
            })
            .filter(v => v !== null);
          
          // Calculate value based on calculation type and period
          return calculateValueWithPeriodAverage(systolicValues, calculation, normalizedSelectedPeriod);
        });
        
        const diastolicDataPoints = timePoints.map(timePoint => {
          // Filter values for this time point
          let valuesForPoint = [];
          if (normalizedSelectedPeriod === 'Daily') {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              return vDate.getUTCHours() === timePoint.date.getUTCHours();
            });
          } else {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
            if (timePoint.dayKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vDayKey = vDate.toISOString().split('T')[0];
                return vDayKey === timePoint.dayKey;
              });
            } else if (timePoint.monthKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
                return vMonthKey === timePoint.monthKey;
              });
            }
          }
          
          // Parse double_number values and extract diastolic values
          const diastolicValues = valuesForPoint
            .map(v => {
              const parsed = parseDoubleNumber(v.value);
              return parsed ? parsed.diastolic : null;
            })
            .filter(v => v !== null);
          
          // Calculate value based on calculation type and period
          return calculateValueWithPeriodAverage(diastolicValues, calculation, normalizedSelectedPeriod);
        });
        
        // Create two datasets: systolic and diastolic
        datasets = [
          {
            label: 'Systolic',
            data: systolicDataPoints,
            borderColor: getColorForIndex(0),
            backgroundColor: getColorForIndex(0) + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: getColorForIndex(0),
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            unit: attribute.unit
          },
          {
            label: 'Diastolic',
            data: diastolicDataPoints,
            borderColor: getColorForIndex(1),
            backgroundColor: getColorForIndex(1) + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: getColorForIndex(1),
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            unit: attribute.unit
          }
        ];
      } else {
        // Regular single line over time
        const dataPoints = timePoints.map(timePoint => {
          // Filter values for this time point
          let valuesForPoint = [];
          if (normalizedSelectedPeriod === 'Daily') {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
            valuesForPoint = filteredValues.filter(v => {
              const vDate = new Date(v.timestamp);
              return vDate.getUTCHours() === timePoint.date.getUTCHours();
            });
          } else {
            const filteredValues = filterValuesByUTCPeriod(attribute.values || [], normalizedSelectedPeriod);
            if (timePoint.dayKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vDayKey = vDate.toISOString().split('T')[0];
                return vDayKey === timePoint.dayKey;
              });
            } else if (timePoint.monthKey) {
              valuesForPoint = filteredValues.filter(v => {
                const vDate = new Date(v.timestamp);
                const vMonthKey = `${vDate.getUTCFullYear()}-${(vDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
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
          borderColor: getColorForIndex(0),
          backgroundColor: getColorForIndex(0) + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: getColorForIndex(0),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          unit: attribute.unit
        }];
      }
    } else {
      return { labels: [], datasets: [] };
    }
    
    return { labels, datasets };
  }, [attribute, normalizedSelectedPeriod, widget.child_attribute_ids, allAttributes, calculation]);
  
  // Handle empty data case - show empty line chart
  if (!chartData || chartData.isEmpty || !processedData.labels || processedData.labels.length === 0 || !processedData.datasets || processedData.datasets.length === 0) {
    // Create empty chart data for visualization
    const emptyChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'No Data',
        data: [],
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0
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
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: '#F3F4F6'
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#9CA3AF'
          }
        },
        y: {
          display: true,
          grid: {
            color: '#F3F4F6',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#9CA3AF'
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: '#fff'
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
              Line chart visualization
            </p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availablePeriods.map((period) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-h-[256px] relative">
          <Line data={emptyChartData} options={emptyChartOptions} />
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

  const { timeRange = ['Daily', 'Weekly', 'Monthly'] } = chartData;

  // Chart.js configuration
  const chartOptions = useMemo(() => {
    const isDaily = normalizedSelectedPeriod === 'Daily';
    const isWeekly = normalizedSelectedPeriod === 'Weekly';
    const isMonthly = normalizedSelectedPeriod === 'Monthly';
    const isYearly = normalizedSelectedPeriod === 'Yearly';
    const disableAutoSkip = isDaily || isWeekly || isMonthly || isYearly;
    
    return {
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
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#374151',
          bodyColor: '#6B7280',
          borderColor: '#E5E7EB',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const dataset = processedData.datasets[context.datasetIndex];
              return `${dataset.label}: ${context.parsed.y} ${dataset.unit || ''}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#6B7280',
            autoSkip: isDaily ? false : disableAutoSkip ? false : undefined,
            maxRotation: isDaily ? 45 : (isYearly ? 45 : disableAutoSkip ? 0 : undefined),
            minRotation: isDaily ? 45 : (isYearly ? 45 : disableAutoSkip ? 0 : undefined),
            maxTicksLimit: disableAutoSkip ? processedData.labels.length || undefined : undefined,
            callback: (value, index, ticks) => {
              // Get the label from processedData.labels array using the index
              // The index parameter from Chart.js corresponds to the position in our labels array
              if (processedData.labels && index >= 0 && index < processedData.labels.length) {
                const label = processedData.labels[index];
                
                // For yearly period, labels should already be month names from getUTCTimePoints
                // Just return them as-is
                if (isYearly) {
                  return label;
                }
                
                // For other periods, handle as before
                if (typeof label === 'number') return label.toString();
                if (typeof label === 'string') {
                  // Check if it's a month name (shouldn't happen for non-yearly, but handle it)
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                     'July', 'August', 'September', 'October', 'November', 'December'];
                  if (monthNames.includes(label)) {
                    return label;
                  }
                  
                  // Try to parse as number
                  const directNumber = Number(label);
                  if (!Number.isNaN(directNumber)) {
                    return directNumber.toString();
                  }
                  
                  // Try to extract day number from date string
                  const parts = label.split('-');
                  const possibleDay = parts[parts.length - 1];
                  if (possibleDay) {
                    const dayNumber = Number(possibleDay);
                    if (!Number.isNaN(dayNumber)) {
                      return dayNumber.toString();
                    }
                  }
                  
                  return label;
                }
                return label;
              }
              
              // Fallback: if label not found, try to use value as month index for yearly
              if (isYearly && typeof value === 'number' && value >= 0 && value < 12) {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                   'July', 'August', 'September', 'October', 'November', 'December'];
                return monthNames[value];
              }
              
              // Last resort: return value as string
              return value?.toString() || '';
            }
          }
        },
        y: {
          display: true,
          grid: {
            color: '#F3F4F6',
            drawBorder: false
          },
          ticks: {
            font: {
              size: 11
            },
            color: '#6B7280'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      elements: {
        point: {
          hoverBackgroundColor: '#fff'
        }
      }
    };
  }, [processedData, normalizedSelectedPeriod]);

  const chartDataConfig = {
    labels: processedData.labels,
    datasets: processedData.datasets
  };

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {chartData?.title || widget.title || widget.widget_type.name}
          </h3>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {availablePeriods.map((period) => (
            <option key={period} value={period}>{period}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-[256px]">
        <Line data={chartDataConfig} options={chartOptions} />
      </div>
    </Card>
  );
};

export default LineChartWidget;
