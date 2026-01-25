'use client';

import React, { useState } from 'react';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card } from '@/components/ui/Card';
import ChartHeading from '@/components/ui/ChartHeading/ChartHeading';
import Select from '@/components/ui/Select/Select';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const SpendingTrendsChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const periods = ["Daily", "Weekly", "Monthly"];

  // Dummy data for different filters
  const periodData = {
    Daily: {
      eating: [200, 300, 250, 400, 350, 500, 450, 420, 480, 510],
      commute: [150, 200, 180, 250, 230, 300, 280, 260, 290, 310],
    },
    Weekly: {
      eating: [1000, 2000, 3000, 4000, 5000, 5200, 5400, 6000, 6200, 6500],
      commute: [1000, 1500, 2000, 2500, 3000, 3800, 4200, 4800, 5300, 5800],
    },
    Monthly: {
      eating: [4000, 4500, 4700, 4900, 5100, 5500, 6000, 6500, 7000, 7500],
      commute: [2500, 2800, 3000, 3200, 3500, 4000, 4200, 4700, 5200, 5700],
    },
  };

  const eatingData = periodData[selectedPeriod].eating;
  const commuteData = periodData[selectedPeriod].commute;

  const data = {
    labels,
    datasets: [
      {
        label: 'Eating',
        data: eatingData,
        borderColor: '#6366F1',
        backgroundColor: '#6366F1',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.3,
      },
      {
        label: 'Commute',
        data: commuteData,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          color: '#6B7280',
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        titleColor: '#111827',
        bodyColor: '#374151',
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (tooltipItem) => {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.formattedValue;
            return `${datasetLabel}: $${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 },
        },
      },
      y: {
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          color: '#6B7280',
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100 max-h-[383px]">
      {/* Header with title and dropdown */}
      <div className="flex justify-between items-center mb-4">
         <ChartHeading chartTitle={"Spending Trends"} />
        <Select selectedPeriod={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} periods={periods} />
      </div>

      {/* Chart */}
      <div className="h-[280px] transition-all duration-300 ease-in-out">
        <Chart type="line" data={data} options={options} />
      </div>
    </Card>
  );
};

export default SpendingTrendsChart;
