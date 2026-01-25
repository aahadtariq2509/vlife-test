import { useState, useEffect } from 'react';
import { useAuth } from '@/store/hooks';
import { apiAuth } from '@/lib/api-client';

export function useSocialMediaStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiAuth('/api/social-media/stats', {
          method: 'GET'
        });

        console.log('Social media stats response:', response);
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching social media stats:', err);
        setError(err.message || 'Failed to load social media stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [accessToken, isAuthenticated]);

  const refetch = async () => {
    if (!isAuthenticated || !accessToken) return;

    try {
      setLoading(true);
      const response = await apiAuth('/api/social-media/stats', {
        method: 'GET'
      });
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load social media stats');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
}
