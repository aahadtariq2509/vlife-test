'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Card } from '@/components/ui/Card';

export default function HealthSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
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
          Health Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Configure your health dashboard settings and medical preferences.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Health Configuration
        </h2>
        <p className="text-gray-600">
          Health settings page is under development. Here you will be able to:
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Set up medical conditions and medications</li>
          <li>• Configure health monitoring devices</li>
          <li>• Manage doctor appointments and records</li>
          <li>• Set up emergency contacts</li>
          <li>• Configure health alerts and reminders</li>
        </ul>
      </div>

      {/* Widgets Card */}
      <Card className="mt-4 p-4 md:p-8 bg-white border-[0.5px] border-[#0000001A] !rounded-[14.01px] shadow-[0px_14px_54px_0px_#00000008] w-full hover:shadow-[0px_14px_54px_0px_#00000008] duration-200">
        <Link
          href="/health/widgets"
          className={pathname === '/health/widgets' ? 'text-[#9747FF]' : 'text-[#4D4D4D] hover:text-[#7847FF]'}
        >
          <Card
            variant="filled"
            hover
            className="transition-all duration-200 !bg-[#F3F3F3] border-[2px] rounded-[15px] w-full !border-[#F3F3F3]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#559EFE] flex items-center justify-center text-white">
                  <Icon icon="ic:sharp-widgets" width="24" height="24" />
                </div>
                <span className="text-lg font-medium text-gray-900">Widgets</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </Link>
      </Card>
    </div>
  );
}
