'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/hooks';

/**
 * Custom hook for handling authentication errors consistently
 * @returns {Object} - Object containing error handling functions
 */
export function useAuthErrorHandler() {
  const router = useRouter();
  const { logout } = useAuth();

  /**
   * Handles 401/403 authentication errors by logging out and redirecting
   * @param {Error} error - The error object
   * @param {string} redirectTo - Optional redirect path (defaults to '/login')
   * @returns {boolean} - True if the error was handled as an auth error
   */
  const handleAuthError = async (error, redirectTo = '/login') => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAuthError = errorMessage.includes('401') || 
                       errorMessage.includes('unauthorized') || 
                       errorMessage.includes('403') ||
                       errorMessage.includes('forbidden');

    if (isAuthError) {
      console.log('Authentication error detected, logging out and redirecting:', errorMessage);
      
      try {
        // Clear authentication state
        await logout();
        
        // Redirect to login page
        router.push(redirectTo);
        
        return true;
      } catch (logoutError) {
        console.error('Error during logout:', logoutError);
        // Still redirect even if logout fails
        router.push(redirectTo);
        return true;
      }
    }

    return false;
  };

  /**
   * Wraps an async function to automatically handle auth errors
   * @param {Function} asyncFn - The async function to wrap
   * @param {string} redirectTo - Optional redirect path (defaults to '/login')
   * @returns {Function} - Wrapped function that handles auth errors
   */
  const withAuthErrorHandling = (asyncFn, redirectTo = '/login') => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        const wasHandled = await handleAuthError(error, redirectTo);
        if (!wasHandled) {
          throw error; // Re-throw if not an auth error
        }
      }
    };
  };

  return {
    handleAuthError,
    withAuthErrorHandling,
  };
}
