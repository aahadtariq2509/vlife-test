'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';

/**
 * Higher-order component to protect routes
 * Redirects to login if user is not authenticated
 */
export function withAuthGuard(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      // If not loading and not authenticated, redirect to login
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking authentication
    if (isLoading) {
      return <LoadingScreen />;
    }

    // Don't render anything if not authenticated (will redirect)
    if (!isAuthenticated) {
      return null;
    }

    // Render the protected component
    return <Component {...props} />;
  };
}
