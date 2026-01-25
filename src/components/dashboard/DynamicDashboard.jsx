'use client';

import React, { useState, useMemo } from 'react';
import { processDashboardData, processExpenseHeatmapData } from '@/lib/dashboard-utils';
import WidgetRenderer from './WidgetRenderer';
import UnmatchedAttributesCards from './UnmatchedAttributesCards';
import HeatmapChartWidget from './widgets/HeatmapChartWidget';
import FitnessDashboardCards from '@/components/fitness/FitnessDashboardCards';
import SocialMediaCards from './personal-dashboard/SocialMediaCards';

const DynamicDashboard = ({ dashboardData, showHeatmap = false, onCloseHeatmap }) => {
  const [heatmapPeriod, setHeatmapPeriod] = useState('Weekly');
  console.log('DynamicDashboard: Received dashboardData:', {
    hasData: !!dashboardData.data,
    keys: Object.keys(dashboardData),
    dataKeys: dashboardData.data ? Object.keys(dashboardData.data) : []
  });
  
  // Process the dashboard data to match widgets with attributes
  const { processedWidgets, unmatchedAttributes, allAttributes } = processDashboardData(dashboardData);
  
  console.log('DynamicDashboard: Processed results:', {
    processedWidgetsCount: processedWidgets.length,
    unmatchedAttributesCount: unmatchedAttributes.length,
    unmatchedAttributesNames: unmatchedAttributes.map(a => a.name),
    widgetsWithoutData: processedWidgets.filter(w => !w.chartData).map(w => ({ id: w.id, attribute_id: w.attribute_id }))
  });
  
  // Filter out duplicate widgets by ID (multiple widgets can share the same attribute_id)
  // Show widgets even if they have no data - they will display empty charts
  const seenWidgetIds = new Set();
  const widgetsToShow = processedWidgets
    .filter(widget => {
      const hasData = widget.chartData !== null && widget.chartData !== undefined;
      
      // Check for duplicate widget ID (not attribute_id, as multiple widgets can use same attribute)
      if (seenWidgetIds.has(widget.id)) {
        console.log(`DynamicDashboard: Skipping duplicate widget ID ${widget.id}`, {
          widgetType: widget.widget_type?.code,
          attributeId: widget.attribute_id
        });
        return false;
      }
      
      // If widget has no data, log why but still include it
      if (!hasData) {
        console.log(`DynamicDashboard: Widget ${widget.id} (attribute_id: ${widget.attribute_id}, type: ${widget.widget_type?.code}) has no chart data - will show empty chart`, {
          hasMatchedAttribute: !!widget.matchedAttribute,
          attributeName: widget.matchedAttribute?.name,
          hasChildren: widget.matchedAttribute?.attributes?.length > 0
        });
      }
      
      seenWidgetIds.add(widget.id);
      return true; // Include all widgets, even those without data
    })
    .sort((a, b) => {
      // Sort by display_order to ensure widgets appear in the correct order
      const orderA = a.display_order ?? 999;
      const orderB = b.display_order ?? 999;
      return orderA - orderB;
    });

  // Check dashboard category
  const dashboardCategory = dashboardData?.data?.category;

  // Process expense data for heatmap (personal dashboard only)
  const heatmapData = useMemo(() => {
    if (dashboardCategory !== 'personal') return null;
    const attributes = dashboardData?.data?.dashboard_attributes || [];
    return processExpenseHeatmapData(attributes, heatmapPeriod);
  }, [dashboardCategory, dashboardData, heatmapPeriod]);

  // Handle heatmap period change
  const handleHeatmapPeriodChange = (newPeriod) => {
    setHeatmapPeriod(newPeriod);
  };

  return (
    <div className="space-y-">
      {/* Fitness Dashboard: Show only Heart Beat, Blood Pressure, and Sleep Management cards */}
      {/* Personal Dashboard: Show SocialMediaCards */}
      {/* Professional Dashboard: Don't show unmatched attributes (TasksDashboard handles that) */}
      {/* Other dashboards: Show unmatched attributes cards */}
      {dashboardCategory === 'fitness' ? (
        <FitnessDashboardCards dashboardAttributes={dashboardData?.data?.dashboard_attributes || []} />
      ) : dashboardCategory === 'personal' ? (
        <SocialMediaCards />
      ) : dashboardCategory === 'professional' ? (
        // Professional dashboard: Don't show unmatched attributes
        // TasksDashboard and CustomCalendar are rendered in the parent page
        null
      ) : (
        <UnmatchedAttributesCards unmatchedAttributes={unmatchedAttributes} />
      )}

      {/* Dynamic widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 gap-3">
        {widgetsToShow.map((widget, index) => (
          <div key={widget.id || index} className="min-h-[500px]">
            <WidgetRenderer widget={{...widget, allAttributes: dashboardData?.data?.dashboard_attributes || []}} />
          </div>
        ))}
      </div>

      {/* Inline Heatmap toggle */}
      {showHeatmap && dashboardCategory === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 gap-3 mt-3">
          <div className="lg:col-span-2">
            <HeatmapChartWidget
              chartData={heatmapData}
              title="Spending Heatmap"
              onPeriodChange={handleHeatmapPeriodChange}
            />
          </div>
        </div>
      )}

      {/* Show message if no widgets */}
      {widgetsToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">No widgets configured</p>
            <p className="text-sm">Configure widgets in your dashboard settings to see data visualizations.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicDashboard;
