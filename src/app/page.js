'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/hooks';
import { AuthWelcomeSection, LoginScreen } from '@/features/auth/components';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [checkingWelcome, setCheckingWelcome] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check welcome screen status from localStorage
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const welcomeScreenStatus = localStorage.getItem('welcomeScreen');
      // If welcomeScreen is null (first visit) or 'true', show welcome screen
      // If welcomeScreen is 'false', skip welcome screen
      if (welcomeScreenStatus === null || welcomeScreenStatus === 'true') {
        setShowWelcome(true);
      } else {
        setShowWelcome(false);
      }
      setCheckingWelcome(false);
    }
  }, [isMounted]);

  // Debug logging
  useEffect(() => {
    if (isMounted) {
      console.log('HomePage: Auth state:', {
        isAuthenticated,
        isLoading,
        hasLocalStorageToken: typeof window !== 'undefined' && !!localStorage.getItem('accessToken')
      });

      // Additional debugging
      console.log('HomePage: useAuth hook returned:', {
        isAuthenticated,
        isLoading,
        typeofIsAuthenticated: typeof isAuthenticated,
        isAuthenticatedValue: isAuthenticated
      });
    }
  }, [isAuthenticated, isLoading, isMounted]);

  useEffect(() => {
    // Only run redirects on client-side after mounting
    if (!isMounted) return;

    // Check authentication status immediately
    if (!isLoading && !checkingWelcome) {
      if (isAuthenticated) {
        // If user is already authenticated, redirect to dashboard
        console.log('HomePage: User is authenticated, redirecting to dashboard');
        router.push('/dashboard');
      } else if (!showWelcome) {
        // Check if user is not on OAuth callback or verification pages before redirecting to login
        const isOnOAuthCallback = pathname === '/oauth/google/callback';
        const isOnVerification = pathname === '/verification';

        if (!isOnOAuthCallback && !isOnVerification) {
          // If not authenticated and welcome screen already shown, redirect to login
          console.log('HomePage: User not authenticated and welcome shown, redirecting to login');
          router.push('/login');
        }
      }
    }
  }, [isAuthenticated, isLoading, showWelcome, checkingWelcome, router, pathname, isMounted]);

  // Show loading on server-side render and initial client mount
  if (!isMounted || isLoading || checkingWelcome) {
    return <LoadingScreen />;
  }

  // Show welcome screen if it hasn't been shown yet
  if (showWelcome) {
    return <AuthWelcomeSection />;
  }

  // Don't show login screen if on OAuth callback or verification pages
  const isOnOAuthCallback = pathname === '/oauth/google/callback';
  const isOnVerification = pathname === '/verification';

  if (isOnOAuthCallback || isOnVerification) {
    return <LoadingScreen />;
  }

  // Show login screen while redirecting
  return <LoginScreen />;
}