'use client';

import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card } from '@/components/ui/Card';
import ChartHeading from '@/components/ui/ChartHeading/ChartHeading';
import Select from '@/components/ui/Select/Select';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function FinancialBreakdownPieChart() {
  const [selectedPeriod, setSelectedPeriod] = useState('Daily');

  const periodData = {
    Daily: { labels: ['Entertainment', 'Groceries', 'Transportation'], values: [25, 45, 30] },
    Weekly: { labels: ['Entertainment', 'Groceries', 'Transportation'], values: [22, 50, 28] },
    Monthly: { labels: ['Entertainment', 'Groceries', 'Transportation'], values: [20, 55, 25] },
    Yearly: { labels: ['Entertainment', 'Groceries', 'Transportation'], values: [18, 60, 22] },
  };
  const periods = ["Daily", "Weekly", "Monthly", "Yearly"];

  const colors = ['#7C4DFF', '#7A9BFF', '#8E97FD'];

  const data = useMemo(() => {
    const dataset = periodData[selectedPeriod];
    return {
      labels: dataset.labels,
      datasets: [
        {
          data: dataset.values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }, [selectedPeriod]);

  const totalAmounts = { Entertainment: 645, Groceries: 980, Transportation: 475 };

  return (
    <Card className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100 max-h-[383px]">
      <div className="flex justify-between items-center mb-4">
        <ChartHeading chartTitle={"Financial Breakdown"} />
        <Select selectedPeriod={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} periods={periods} />
      </div>

      <div className="h-[240px] flex items-center">
        <Chart type="doughnut" data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
      </div>

      <div className="flex justify-center text-center gap-3 mt-2 text-xs text-gray-700">
        {periodData[selectedPeriod].labels.map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx] }} />
            <div className="flex flex-col">
              <span className="font-semibold text-xl text-[#000000B2]">${totalAmounts[label]}</span>
              <span className="text-[#000000B2] text-xs">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
