'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function ConditionalHeader() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Define auth pages where header should not be shown
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
  
  // Don't render header on auth pages
  if (isAuthPage) {
    return null;
  }
  
  // Don't render anything while loading
  if (isLoading) {
    return null;
  }
  
  // For authenticated routes, header and sidebar are handled by DashboardLayout
  // For non-authenticated, non-auth pages, render basic header
  return null;
}
