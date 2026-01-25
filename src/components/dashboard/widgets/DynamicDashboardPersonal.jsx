'use client';

import { processDashboardData } from '@/lib/dashboard-utils';
import SocialMediaCards from '../personal-dashboard/SocialMediaCards';
import WidgetRenderer from '../WidgetRenderer';
import HeatmapChartWidget from './HeatmapChartWidget';
import FinancialSpendingBarChart from './FinancialSpendingBarChart';
import FinancialBreakdownPieChart from './FinancialBreakdownPieChart';
import SpendingTrendsChart from './SpendingTrendsChart';

const DynamicDashboardPersonal = ({ dashboardData, showHeatmap = false, onCloseHeatmap }) => {
  console.log('DynamicDashboard: Received dashboardData:', {
    hasData: !!dashboardData.data,
    keys: Object.keys(dashboardData),
    dataKeys: dashboardData.data ? Object.keys(dashboardData.data) : []
  });

  const { processedWidgets, unmatchedAttributes, allAttributes } = processDashboardData(dashboardData);

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

      // Exclude Family Time related widgets from personal dashboard
      const widgetName = (widget.name || widget.title || '').toLowerCase();
      const attributeName = (widget.matchedAttribute?.name || '').toLowerCase();
      const attributeDisplayName = (widget.matchedAttribute?.display_name || '').toLowerCase();
      const chartTitle = (widget.chartData?.title || '').toLowerCase();
      if (
        widgetName.includes('family time') ||
        attributeName.includes('family time') ||
        attributeDisplayName.includes('family time') ||
        chartTitle.includes('family time')
      ) {
        return false;
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

  return (
    <div className="space-y-">
      <SocialMediaCards />
      {/* Dynamic widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 gap-3">
        {widgetsToShow.map((widget, index) => (
          <div key={widget.id || index} className="min-h-[500px]">
            <WidgetRenderer widget={widget} />
          </div>
        ))}
      </div>
      {/* Inline Heatmap toggle */}


      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-10 gap-3 mt-3">
        {showHeatmap && (
               <HeatmapChartWidget />
         )}
        <FinancialSpendingBarChart />
        <FinancialBreakdownPieChart />
        <SpendingTrendsChart />
      </div>

      {/* Empty state intentionally hidden for personal dashboard */}
    </div>
  );
};

export default DynamicDashboardPersonal;
