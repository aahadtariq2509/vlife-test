'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { handleGoogleCallback } from '@/store/slices/authSlice';
import { useToastContext } from '@/components/providers/ToastProvider';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { success, error: showError } = useToastContext();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Check if this is a Google OAuth callback (has 'code' parameter)
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (code) {
        // This is a Google OAuth callback, redirect to the specific page
        router.push(`/oauth/google/callback${window.location.search}`);
        return;
      }

      // Extract query parameters for other OAuth providers
      const statusParam = searchParams.get('status');
      const provider = searchParams.get('provider');
      const messageParam = searchParams.get('message');
      const dataParam = searchParams.get('data');

      if (!statusParam) {
        setStatus('error');
        setMessage('Invalid callback - missing status parameter');
        showError('OAuth Error', 'Invalid callback parameters');
        return;
      }

      // Parse data if present
      let callbackData = null;
      if (dataParam) {
        try {
          callbackData = JSON.parse(decodeURIComponent(dataParam));
        } catch (e) {
          setStatus('error');
          setMessage('Failed to parse OAuth response');
          showError('OAuth Error', 'Failed to process authentication data');
          return;
        }
      }

      if (statusParam === 'success') {
        setStatus('success');
        setMessage(messageParam || `${provider} connection successful`);

        // Check if opened in popup (for integrations)
        const isPopup = window.opener && !window.opener.closed;

        // Handle success based on provider
        if (provider === 'google') {
          // Google login returns tokens and user info
          if (callbackData?.accessToken && callbackData?.refreshToken) {
            try {
              // Store tokens in localStorage
              localStorage.setItem('accessToken', callbackData.accessToken);
              localStorage.setItem('refreshToken', callbackData.refreshToken);
              localStorage.setItem('userData', JSON.stringify(callbackData.user));

              if (callbackData.expiresIn) {
                const expiryTime = Date.now() + (callbackData.expiresIn * 1000);
                localStorage.setItem('tokenExpiry', expiryTime.toString());
              }

              // Dispatch action to save tokens and user data to Redux store
              await dispatch(
                handleGoogleCallback({
                  accessToken: callbackData.accessToken,
                  refreshToken: callbackData.refreshToken,
                  user: callbackData.user,
                  expiresIn: callbackData.expiresIn
                })
              ).unwrap();

              success('Login Successful', `Welcome back, ${callbackData.user?.name || 'User'}!`);

              // Redirect to dashboard
              setTimeout(() => {
                router.push('/dashboards');
              }, 1500);
            } catch (err) {
              setStatus('error');
              setMessage(err.message || 'Failed to complete Google login');
              showError('Login Failed', err.message || 'Failed to complete Google login');
            }
          } else {
            setStatus('error');
            setMessage('Missing authentication tokens');
            showError('OAuth Error', 'Missing authentication tokens');
          }
        } else if (provider === 'jira' || provider === 'google-calendar' || provider === 'microsoft') {
          // Integration connection successful
          if (isPopup) {
            // Send success message to parent window
            window.opener.postMessage({
              type: 'oauth-success',
              provider: provider,
              data: callbackData
            }, window.location.origin);

            success(`${provider} Connected`, `Your ${provider} account has been connected successfully`);

            // Close popup after a short delay
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            // Normal page flow (not in popup)
            success(`${provider} Connected`, `Your ${provider} account has been connected successfully`);
            setTimeout(() => {
              router.push('/professional/settings');
            }, 1500);
          }
        } else {
          setStatus('error');
          setMessage('Unknown OAuth provider');
          showError('OAuth Error', 'Unknown provider: ' + provider);
        }
      } else {
        setStatus('error');
        setMessage(messageParam || `${provider} connection failed`);

        // Check if opened in popup (for integrations)
        const isPopup = window.opener && !window.opener.closed;

        if (isPopup) {
          // Send error message to parent window
          window.opener.postMessage({
            type: 'oauth-error',
            provider: provider,
            message: messageParam || 'Authentication failed'
          }, window.location.origin);

          showError('OAuth Error', messageParam || 'Authentication failed');

          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          // Normal page flow (not in popup)
          showError('OAuth Error', messageParam || 'Authentication failed');

          // Redirect to login page after error
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, router, dispatch, success, showError]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {status === 'loading' && (
          <LoadingScreen message="Processing OAuth callback..." />
        )}

        {status === 'success' && (
          <div className="max-w-md p-8">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Success!</h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
            <p className="text-sm text-gray-400 mt-2">Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-md p-8">
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
