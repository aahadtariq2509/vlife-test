import { cookies } from 'next/headers';

/**
 * Get token from httpOnly cookies
 * @returns {string|null} - Token string or null if not found
 */
export function getTokenFromCookies() {
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('token');
    return tokenCookie?.value || null;
  } catch (error) {
    console.error('Error reading token from cookies:', error);
    return null;
  }
}

/**
 * Validate token and return user data (mock implementation)
 * @param {string} token - JWT token
 * @returns {Object|null} - User object or null if invalid
 */
export function validateToken(token) {
  if (!token) return null;
  
  // Mock token validation - in real app, you'd verify JWT signature
  if (token === 'mock.jwt.token') {
    return {
      id: '1',
      name: 'John Doe',
      email: 'john@gmail.com',
      role: 'user'
    };
  }
  
  return null;
}

/**
 * Require authentication for server components/route handlers
 * @returns {Object} - User object
 * @throws {Error} - If not authenticated
 */
export function requireAuth() {
  const token = getTokenFromCookies();
  const user = validateToken(token);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Check if user is authenticated (doesn't throw)
 * @returns {Object|null} - User object or null
 */
export function getAuthUser() {
  const token = getTokenFromCookies();
  return validateToken(token);
}
