/**
 * Authentication utility functions
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns boolean - true if email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if user is authenticated by verifying token exists
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  return !!(token && userId);
};

/**
 * Get the authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Get the user ID
 */
export const getUserId = (): string | null => {
  return localStorage.getItem('userId');
};

/**
 * Get stored user data
 */
export const getStoredUser = (): any | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('user');
};

/**
 * Validate token by making a request to backend
 * @param token - JWT token to validate
 * @returns Promise<boolean> - true if token is valid
 */
export const validateToken = async (token?: string): Promise<boolean> => {
  const authToken = token || getAuthToken();
  
  if (!authToken) {
    return false;
  }

  try {
    const response = await fetch('http://localhost:5050/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

/**
 * Make an authenticated API request
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return fetch(url, {
    ...options,
    headers
  });
};
