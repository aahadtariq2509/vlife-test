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

  const isServer = typeof window === 'undefined';
  const baseUrl = isServer 
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015' 
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015';

  // Get refresh token
  let refreshTokenValue = null;
  if (isServer) {
    // Server-side: read from httpOnly cookies
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      const refreshTokenCookie = cookieStore.get('refreshToken');
      refreshTokenValue = refreshTokenCookie?.value;
    } catch (error) {
      console.warn('Could not read cookies on server:', error);
    }
  } else {
    // Client-side: read from localStorage
    refreshTokenValue = localStorage.getItem('refreshToken');
  }

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
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const result = await response.json();

      // Check if refresh token itself is invalid/expired
      if (response.status === 401) {
        console.error('Refresh token is invalid or expired. User needs to login again.');
        // Clear tokens and redirect to login
        if (!isServer && typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');

          // Don't redirect if we're in a popup window (OAuth flow)
          const isPopup = window.opener && !window.opener.closed;
          if (!isPopup) {
            window.location.href = '/login';
          }
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

      // Update tokens in localStorage (client-side only) IMMEDIATELY before returning
      if (!isServer && typeof window !== 'undefined') {
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
 * Universal API client that works both on server and client
 * @param {string} path - API endpoint path
 * @param {Object} options - Fetch options
 * @param {Object} nextOpts - Next.js specific options
 * @param {boolean} retryOn401 - Whether to retry on 401 (default: true)
 * @returns {Promise<Object>} - Parsed JSON response
 */
export async function api(path, options = {}, nextOpts = {}, retryOn401 = true) {
  const {
    method = 'GET',
    body,
    headers = {},
    ...fetchOptions
  } = options;

  const isServer = typeof window === 'undefined';
  const baseUrl = isServer 
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015' 
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015';

  // Get token based on environment
  let token = null;
  if (isServer) {
    // Server-side: read from httpOnly cookies
    try {
      // Dynamically import next/headers only on server
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      const tokenCookie = cookieStore.get('token');
      token = tokenCookie?.value;
    } catch (error) {
      console.warn('Could not read cookies on server:', error);
    }
  } else {
    // Client-side: read from localStorage
    token = localStorage.getItem('accessToken');
  }

  // Prepare headers
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // Prepare request body
  let requestBody;
  if (body) {
    if (typeof body === 'object') {
      requestBody = JSON.stringify(body);
    } else {
      requestBody = body;
    }
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
      ...fetchOptions,
      ...nextOpts,
    });

    // Handle 401 Unauthorized - try to refresh token automatically
    if (response.status === 401 && retryOn401 && !isServer) {
      // Check if this is not already a refresh request
      if (!path.includes('/auth/refresh')) {
        console.log('Received 401, attempting to refresh token...');
        try {
          // Try to refresh the token
          await refreshAccessToken();
          
          // ALWAYS get the token from localStorage after refresh (most up-to-date)
          const storedToken = localStorage.getItem('accessToken');
          
          if (!storedToken) {
            console.error('No token available after refresh');
            throw new Error('Authentication required');
          }
          
          console.log('Retrying request with refreshed token...');
          
          // Retry the original request with the fresh token from localStorage
          const retryHeaders = {
            ...requestHeaders,
            Authorization: `Bearer ${storedToken}`,
          };

          const retryResponse = await fetch(`${baseUrl}${path}`, {
            method,
            headers: retryHeaders,
            body: requestBody,
            ...fetchOptions,
            ...nextOpts,
          });

          // If retry still gets 401, don't retry again (prevent infinite loop)
          if (retryResponse.status === 401) {
            console.error('Request still returns 401 after token refresh');
            throw new Error('Authentication required');
          }

          if (!retryResponse.ok) {
            let errorMessage = `HTTP ${retryResponse.status}: ${retryResponse.statusText}`;
            
            try {
              const errorData = await retryResponse.json();
              errorMessage = errorData.message || errorMessage;
            } catch {
              // If response is not JSON, use the status text
            }

            throw new Error(errorMessage);
          }

          console.log('Request succeeded after token refresh');
          const contentType = retryResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await retryResponse.json();
          }

          return await retryResponse.text();
        } catch (refreshError) {
          // If refresh fails, throw a generic error (don't show token expired)
          console.error('Token refresh failed:', refreshError);
          // Throw a generic unauthorized error instead of token expired
          throw new Error('Authentication required');
        }
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the status text
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    // Don't log "token expired" errors - they're handled silently
    if (!error.message.includes('expired') && !error.message.includes('token')) {
      console.error('API request failed:', error);
    }
    throw error;
  }
}

/**
 * API client that requires authentication
 * @param {string} path - API endpoint path
 * @param {Object} options - Fetch options
 * @param {Object} nextOpts - Next.js specific options
 * @returns {Promise<Object>} - Parsed JSON response
 * @throws {Error} - If no token is available
 */
export async function apiAuth(path, options = {}, nextOpts = {}) {
  const isServer = typeof window === 'undefined';
  let token = null;

  if (isServer) {
    try {
      // Dynamically import next/headers only on server
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      const tokenCookie = cookieStore.get('token');
      token = tokenCookie?.value;
    } catch (error) {
      console.warn('Could not read cookies on server:', error);
    }
  } else {
    token = localStorage.getItem('accessToken');
  }

  if (!token) {
    throw new Error('Authentication required');
  }

  return api(path, options, nextOpts);
}

// Convenience methods
export const apiClient = {
  get: (path, options = {}) => api(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => api(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => api(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => api(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => api(path, { ...options, method: 'DELETE' }),
  
  // Authenticated methods
  getAuth: (path, options = {}) => apiAuth(path, { ...options, method: 'GET' }),
  postAuth: (path, body, options = {}) => apiAuth(path, { ...options, method: 'POST', body }),
  putAuth: (path, body, options = {}) => apiAuth(path, { ...options, method: 'PUT', body }),
  patchAuth: (path, body, options = {}) => apiAuth(path, { ...options, method: 'PATCH', body }),
  deleteAuth: (path, options = {}) => apiAuth(path, { ...options, method: 'DELETE' }),
};
