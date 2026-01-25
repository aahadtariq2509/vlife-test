'use client';

import React from 'react';
import DynamicDashboard from './DynamicDashboard';
import { testDashboardData } from '@/data/testDashboardData';

const DynamicDashboardTest = () => {
  return (
    <DynamicDashboard dashboardData={testDashboardData} />
  );
};

export default DynamicDashboardTest;

