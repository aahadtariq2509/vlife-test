'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function WorkPage() {
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
          Work Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your work tasks, projects, and productivity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tasks
          </h3>
          <p className="text-gray-600 text-sm">
            Track your daily tasks and to-do items.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Projects
          </h3>
          <p className="text-gray-600 text-sm">
            Manage ongoing projects and deadlines.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Time Tracking
          </h3>
          <p className="text-gray-600 text-sm">
            Monitor your work hours and productivity.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Work Overview
        </h2>
        <p className="text-gray-600">
          Work dashboard is under development. Here you will be able to:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Track daily tasks and projects</li>
          <li>• Monitor productivity metrics</li>
          <li>• Manage team collaboration</li>
          <li>• Set work goals and deadlines</li>
          <li>• Generate work reports</li>
        </ul>
      </div>
    </div>
  );
}
