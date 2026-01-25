'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function HealthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Health Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Monitor your health metrics and medical data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vital Signs
          </h3>
          <p className="text-gray-600 text-sm">
            Track blood pressure, heart rate, and temperature.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Medications
          </h3>
          <p className="text-gray-600 text-sm">
            Manage your medication schedule and reminders.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Appointments
          </h3>
          <p className="text-gray-600 text-sm">
            Schedule and track your medical appointments.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Health Overview
        </h2>
        <p className="text-gray-600">
          Health dashboard is under development. Here you will be able to:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• View comprehensive health metrics</li>
          <li>• Track medication adherence</li>
          <li>• Monitor vital signs trends</li>
          <li>• Manage medical appointments</li>
          <li>• Set health goals and reminders</li>
        </ul>
      </div>
    </div>
  );
}
