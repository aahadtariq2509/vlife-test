'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function FacebookCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        setError('Invalid callback parameters from Facebook');
        return;
      }

      try {
        // Backend handles the token exchange
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015';
        const callbackUrl = `${baseUrl}/oauth/facebook/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

        console.log('Calling Facebook callback:', callbackUrl);

        const response = await fetch(callbackUrl, {
          credentials: 'include'
        });

        const data = await response.json();
        console.log('Facebook callback response:', data);

        if (data.success || response.ok) {
          // Check if we're in an iframe
          if (window.opener || window.parent !== window) {
            // Send message to parent window
            const target = window.opener || window.parent;
            target.postMessage(
              { type: 'oauth-success', provider: 'facebook' },
              window.location.origin
            );
            // Close the window or show success message
            window.close();
          } else {
            // Fallback: redirect back to settings
            router.push('/personal/settings?oauth=success&provider=facebook');
          }
        } else {
          setError(data.message || 'Failed to connect Facebook account');
        }
      } catch (err) {
        console.error('Facebook callback error:', err);
        const errorMessage = err.message || 'An unexpected error occurred';

        // Send error to parent if in iframe
        if (window.opener || window.parent !== window) {
          const target = window.opener || window.parent;
          target.postMessage(
            { type: 'oauth-error', message: errorMessage },
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/personal/settings')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen message="Connecting Facebook account..." />;
}
