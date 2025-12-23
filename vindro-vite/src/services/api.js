/**
 * API Service Layer
 * Centralized API communication with authentication support
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Fetch wrapper with credentials support for session-based auth
 */
async function apiRequest(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: 'include', // CRITICAL: Include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    // Re-throw with more context
    if (error.message) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - {username, email, password, password_confirm}
   * @returns {Promise<Object>} Response with user data
   */
  register: (userData) => apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  /**
   * Login user
   * @param {Object} credentials - {username, password}
   * @returns {Promise<Object>} Response with user data
   */
  login: (credentials) => apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  /**
   * Logout current user
   * @returns {Promise<Object>} Success response
   */
  logout: () => apiRequest('/auth/logout/', {
    method: 'POST',
  }),

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User data or null
   */
  getCurrentUser: () => apiRequest('/auth/me/', {
    method: 'GET',
  }),

  /**
   * Change user password
   * @param {Object} passwords - {current_password, new_password, new_password_confirm}
   * @returns {Promise<Object>} Success response
   */
  changePassword: (passwords) => apiRequest('/auth/change-password/', {
    method: 'POST',
    body: JSON.stringify(passwords),
  }),
};

/**
 * Generic API client for other endpoints
 */
export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
