/**
 * Dashboard API client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015';
const DASHBOARD_API_BASE_URL = `${API_BASE_URL}/api`;

// Global refresh token promise to prevent concurrent refresh requests
let refreshTokenPromise = null;
let isRefreshing = false;

/**
 * Refresh access token using refresh token
 * @returns {Promise<string>} - New access token
 */
async function refreshAccessToken() {
  // If a refresh is already in progress, wait for it
  if (refreshTokenPromise && isRefreshing) {
    console.log('Refresh already in progress, waiting for it...');
    return refreshTokenPromise;
  }
  
  // Prevent concurrent refresh attempts
  if (isRefreshing) {
    throw new Error('Token refresh already in progress');
  }
  
  isRefreshing = true;

  // Get refresh token from localStorage
  const refreshTokenValue = typeof window !== 'undefined' 
    ? localStorage.getItem('refreshToken') 
    : null;

  if (!refreshTokenValue) {
    const error = new Error('No refresh token available');
    refreshTokenPromise = null;
    isRefreshing = false;
    throw error;
  }

  console.log('Starting token refresh...');

  // Create refresh promise
  refreshTokenPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const result = await response.json();

      // Check if refresh token itself is invalid/expired
      if (response.status === 401) {
        console.error('Refresh token is invalid or expired. User needs to login again.');
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }
        throw new Error('Refresh token expired. Please login again.');
      }

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Token refresh failed');
      }

      const newAccessToken = result.data?.accessToken;
      const newRefreshToken = result.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error('No access token received from refresh');
      }

      console.log('Token refresh successful, updating localStorage...');

      // Update tokens in localStorage IMMEDIATELY before returning
      if (typeof window !== 'undefined') {
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Double-check the token was stored correctly
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken !== newAccessToken) {
          console.warn('Token storage verification failed, storing again...');
          localStorage.setItem('accessToken', newAccessToken);
        }
        
        console.log('Token updated in localStorage successfully');
      }

      return newAccessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't clear tokens on random errors, only on auth failures
      throw error;
    } finally {
      // Clear the promise and flag so we can refresh again if needed
      refreshTokenPromise = null;
      isRefreshing = false;
    }
  })();

  return refreshTokenPromise;
}

/**
 * Make a fetch request with automatic token refresh on 401
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithRefresh(url, options) {
  // ALWAYS read the latest token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  // Handle 401 Unauthorized - try to refresh token automatically
  if (response.status === 401 && typeof window !== 'undefined') {
    console.log('Received 401, attempting to refresh token...');
    try {
      // Try to refresh the token
      await refreshAccessToken();
      
      // ALWAYS get the token from localStorage after refresh (most up-to-date)
      const storedToken = localStorage.getItem('accessToken');
      
      if (!storedToken) {
        console.error('No token available after refresh');
        return response; // Return original 401
      }
      
      console.log('Retrying request with refreshed token...');
      
      // Retry the original request with the fresh token from localStorage
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${storedToken}`
        }
      });

      // If retry still gets 401, don't retry again (prevent infinite loop)
      if (retryResponse.status === 401) {
        console.error('Request still returns 401 after token refresh');
        return retryResponse; // Return 401 to be handled by caller
      }

      console.log('Request succeeded after token refresh');
      return retryResponse;
    } catch (refreshError) {
      // If refresh fails, log the error and return the original 401 response
      console.error('Token refresh failed:', refreshError);
      // Don't try to refresh again - let the error bubble up
      return response; // Return original 401 response
    }
  }

  return response;
}

export class DashboardAPI {
  constructor(token) {
    this.token = token;
  }

  async fetchDashboards(limit = 10, offset = 0) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards?limit=${limit}&offset=${offset}`,
      {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      }
      }
    );

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // Token refresh was attempted but failed, throw generic error
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error(`Forbidden: 403 - Access denied`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch dashboards');
    }

    return data;
  }

  async fetchDashboardData(dashboardId) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards/${dashboardId}`,
      {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      }
      }
    );

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // Token refresh was attempted but failed, throw generic error
        throw new Error('Authentication required');
      }
      if (response.status === 403) {
        throw new Error(`Forbidden: 403 - Access denied`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch dashboard data');
    }

    return data;
  }

  async updateWidgetsOrder(dashboardId, widgets) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards/widgets/bulk/${dashboardId}`,
      {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ widgets }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Forbidden: 403 - Access denied');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to update widgets order');
    }
    return data;
  }

  async deleteWidget(dashboardId, widgetId) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards/widgets/${dashboardId}/${widgetId}`,
      {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Forbidden: 403 - Access denied');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Some DELETEs may not return JSON, guard parsing
    try {
      const data = await response.json();
      if (data.status && data.status !== 'success') {
        throw new Error(data.message || 'Failed to delete widget');
      }
      return data;
    } catch (_) {
      return { status: 'success' };
    }
  }

  async getDashboardAttributes(dashboardId) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards/attributes/${dashboardId}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Forbidden: 403 - Access denied');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch dashboard attributes');
    }
    return data;
  }

  async getDashboardChildAttributes(attributeId) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards/attributes/children/${attributeId}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Forbidden: 403 - Access denied');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch child attributes');
    }
    return data;
  }

  async getWidgetMappings(attributeTemplateId) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards/mappings/${attributeTemplateId}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Forbidden: 403 - Access denied');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch widget mappings');
    }
    return data;
  }

  async createWidget(dashboardId, payload) {
    const response = await fetchWithRefresh(
      `${DASHBOARD_API_BASE_URL}/dashboards/widgets/${dashboardId}`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication required');
      if (response.status === 403) throw new Error('Forbidden: 403 - Access denied');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to create widget');
    }
    return data;
  }
}

export const createDashboardAPI = (token) => new DashboardAPI(token);


