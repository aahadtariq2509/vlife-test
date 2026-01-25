'use client';

import React, { useState } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card } from '@/components/ui/Card';
import ChartHeading from '@/components/ui/ChartHeading/ChartHeading';
import Select from '@/components/ui/Select/Select';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function FinancialSpendingBarChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('Yearly');

  const labels = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const periods = ["Daily", "Weekly", "Monthly", "Yearly"];

  const periodData = {
    Daily: [45, 60, 55, 80, 70, 95, 75, 68, 72, 90],
    Weekly: [320, 410, 380, 520, 480, 600, 540, 520, 540, 620],
    Monthly: [1200, 1500, 1400, 1800, 1700, 2000, 1850, 1700, 1750, 1900],
    Yearly: [6000, 7200, 6900, 8400, 8000, 9200, 8800, 8600, 9000, 9500],
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Amount',
        data: periodData[selectedPeriod],
        backgroundColor: '#7C4DFF',
        borderRadius: 8,
        barThickness: 18,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => `Amount: $${item.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
      y: {
        grid: { color: '#EEF2F7' },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
    },
  };

  return (
    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100 max-h-[383px]">
      <div className="flex justify-between items-center mb-4">
        <ChartHeading chartTitle={"Financial Spending"} />
        <Select selectedPeriod={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} periods={periods} />
      </div>

      <div className="h-[280px]">
        <Chart type="bar" data={data} options={options} />
      </div>
    </Card>
  );
}
