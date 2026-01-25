'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/hooks';
import { DashboardLayout } from './DashboardLayout';
import { Footer } from './Footer';

export function AuthenticatedLayout({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Define auth pages where we don't want the authenticated layout
  const authPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/password-reset-success',
    '/verify'
  ];

  // Check if current page is an auth page
  const isAuthPage = authPages.includes(pathname);

  // For auth pages, render children directly without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For authenticated routes, render with proper layout
  if (isAuthenticated) {
    return (
      <DashboardLayout>
        {children}
      </DashboardLayout>
    );
  }

  // For non-authenticated, non-auth pages, render children with footer
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
}
