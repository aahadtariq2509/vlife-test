'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import DynamicDashboard from '@/components/dashboard/DynamicDashboard';
import { fitnessData } from '@/data/fitnessData';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Load fitness data and auto-select fitness dashboard
    setData(fitnessData.data);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!data) {
    return <LoadingScreen />;
  }


  return (
    <div className="space-y-6 pb-6">
      {/* Header with Title and HEATMAP Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {data.name || 'Health Dashboard'}
          </h1>
          <p className="mt-0.5 text-xs text-gray-600">
            {data.description || 'Track your fitness progress and health metrics'}
          </p>
        </div>
        
        {/* HEATMAP Button */}
        <button className="px-3 py-1.5 text-xs font-medium bg-blue-50/30 text-blue-700 rounded-lg hover:bg-blue-100:bg-blue-900/50 flex items-center gap-2 transition-colors duration-200 border border-blue-200">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>HEATMAP</span>
        </button>
      </div>

      {/* Dynamic Dashboard with Chart.js - Uses main page scroll */}
      <DynamicDashboard dashboardData={{ data }} />
    </div>
  );
}