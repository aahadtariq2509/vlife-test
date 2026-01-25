'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';

/**
 * HOC to protect client components that require authentication
 * @param {React.Component} WrappedComponent - Component to protect
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - Path to redirect to if not authenticated
 * @param {React.Component} options.fallback - Component to show while loading
 */
export function withAuth(WrappedComponent, options = {}) {
  const {
    redirectTo = '/login',
    fallback: FallbackComponent = () => <LoadingScreen />
  } = options;

  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectTo);
      }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    if (isLoading) {
      return <FallbackComponent />;
    }

    if (!isAuthenticated) {
      return null; // Will redirect
    }

    return <WrappedComponent {...props} />;
  };
}
