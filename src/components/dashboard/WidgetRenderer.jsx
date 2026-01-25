'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import HealthMetricsWidget from './widgets/HealthMetricsWidget';
import ProgressChartWidget from './widgets/ProgressChartWidget';
import SingleProgressChartWidget from './widgets/SingleProgressChartWidget';
import PieChartWidget from './widgets/PieChartWidget';
import BarChartWidget from './widgets/BarChartWidget';
import LineChartWidget from './widgets/LineChartWidget';
import HeatmapChartWidget from './widgets/HeatmapChartWidget';
import ReverseHeatmapChartWidget from './widgets/ReverseHeatmapChartWidget';

const WidgetRenderer = ({ widget }) => {
  // The widget now comes pre-processed with chartData from the dashboard utils
  // No need to manually process the data here

  // Render different widget types based on widget_type.code
  const renderWidget = () => {
    switch (widget.widget_type.code) {
      case 'progress_chart':
        return <ProgressChartWidget widget={widget} />;
      case 'single_progress':
        return <SingleProgressChartWidget chartData={widget.chartData} title={widget.chartData?.title || widget.matchedAttribute?.display_name || widget.name} />;
      case 'pie_chart':
        return <PieChartWidget widget={widget} />;
      case 'bar_chart':
        return <BarChartWidget widget={widget} />;
      case 'line_chart':
        return <LineChartWidget widget={widget} />;
      case 'heat_map':
        return <HeatmapChartWidget chartData={widget.chartData} title={widget.chartData?.title || widget.matchedAttribute?.display_name || widget.name} />;
      case 'reverse_heat_map':
        return <ReverseHeatmapChartWidget chartData={widget.chartData} title={widget.chartData?.title || widget.matchedAttribute?.display_name || widget.name} />;
      default:
        return (
          <Card className="p-6">
            <div className="text-center text-gray-500">
              <p>Widget type "{widget.widget_type.code}" not supported</p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="h-full">
      {renderWidget()}
    </div>
  );
};

export default WidgetRenderer;


