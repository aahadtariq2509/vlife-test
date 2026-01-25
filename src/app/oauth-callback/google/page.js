'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Handle OAuth error from Google
      if (error) {
        const errorDescription = searchParams.get('error_description') || 'Authentication failed';
        setError(errorDescription);

        if (window.opener && window.opener !== window) {
          window.opener.postMessage(
            {
              type: 'google-oauth-error',
              message: errorDescription
            },
            window.location.origin
          );
          setTimeout(() => window.close(), 2000);
        }
        return;
      }

      if (!code) {
        setError('Invalid callback parameters from Google');
        return;
      }

      try {
        // Backend handles the token exchange
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015';
        const callbackUrl = `${baseUrl}/oauth/google/callback?code=${encodeURIComponent(code)}`;

        console.log('Calling Google callback:', callbackUrl);

        const response = await fetch(callbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Google callback response:', data);

        if (data.status === 'success' && data.data) {
          const { accessToken, refreshToken, user, expiresIn } = data.data;

          // Store tokens and user data in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userData', JSON.stringify(user));

            // Store token expiry time
            if (expiresIn) {
              const expiryTime = Date.now() + (expiresIn * 1000);
              localStorage.setItem('tokenExpiry', expiryTime.toString());
            }
          }

          // Check if we're in a popup window
          if (window.opener && window.opener !== window) {
            console.log('Sending success message to parent window');

            // Send message to parent window with login data
            window.opener.postMessage(
              {
                type: 'google-oauth-success',
                data: {
                  accessToken,
                  refreshToken,
                  user,
                  expiresIn
                }
              },
              window.location.origin
            );

            // Give the parent window time to process the message
            setTimeout(() => {
              console.log('Closing popup window');
              window.close();
            }, 500);
          } else {
            // Fallback: redirect to dashboards
            console.log('Not in popup, redirecting to dashboards');
            router.push('/dashboards');
          }
        } else {
          throw new Error(data.message || 'Failed to login with Google');
        }
      } catch (err) {
        console.error('Google callback error:', err);
        const errorMessage = err.message || 'An unexpected error occurred';

        // Send error to parent if in popup
        if (window.opener && window.opener !== window) {
          window.opener.postMessage(
            {
              type: 'google-oauth-error',
              message: errorMessage
            },
            window.location.origin
          );
        }

        setError(errorMessage);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => {
              if (window.opener) {
                window.close();
              } else {
                router.push('/login');
              }
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {window.opener ? 'Close Window' : 'Back to Login'}
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen message="Logging in with Google..." />;
}
