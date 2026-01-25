'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Clock } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StepsProgressChart({ completed = 0, pending = 0, title = 'Steps Progress' }) {
  const total = completed + pending;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const data = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: ['#6C3BFF', '#E5E7EB'],
        borderWidth: 0,
        cutout: '90%',
        circumference: 360, // full circle
        rotation: 180, // start from bottom (6 o’clock)
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">{title}</h2>

      {/* Circular Chart */}
      <div className="relative flex justify-center mb-6">
        <div className="w-60 h-60 relative">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#6C3BFF]">{percentage}%</span>
            <span className="text-gray-500 text-sm">Complete</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex justify-between items-center pt-10 text-sm">
        <div className="flex flex-col items-center w-1/2">
          <div className="flex items-center text-xs gap-2 text-[#4D4D4D99]">
            <CheckCircle size={16} className="text-[#561FE8]" />
            <span>Completed</span>
          </div>
          <p className="text-[#4D4D4D] text-xl font-semibold mt-1">{completed}</p>
        </div>

        <div className="h-10 border-l border-gray-200" />

        <div className="flex flex-col items-center w-1/2">
          <div className="flex items-center text-xs gap-2 text-[#4D4D4D99]">
            <Clock size={16} className="text-[#561FE8]" />
            <span>Pending</span>
          </div>
          <p className="text-[#4D4D4D] text-xl font-semibold mt-1">{pending}</p>
        </div>
      </div>
    </Card>
  );
}
