/**
 * API Service Layer
 * Centralized API communication with authentication support
 */

const LOCAL_FALLBACK = 'http://localhost:8000/api';
const DEFAULT_BACKEND = 'https://backend.vindrogames.com/api';
const VITE_API = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined;

function getApiBase() {
    if (VITE_API) return VITE_API.replace(/\/$/, '');
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') return LOCAL_FALLBACK;
        if (host.endsWith('vindrogames.com') || host.endsWith('netlify.app')) return DEFAULT_BACKEND;
        return `${window.location.origin.replace(/\/$/, '')}/api`;
    }
    return LOCAL_FALLBACK;
}

const API_BASE_URL = getApiBase();

function buildUrl(endpoint) {
    const trimmedBase = API_BASE_URL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${trimmedBase}${path}`;
}

/**
 * Get the backend base URL (without /api)
 * Used for OAuth endpoints which are at /accounts/
 */
export function getBackendUrl() {
    return API_BASE_URL.replace(/\/api\/?$/, '');
}

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
        const response = await fetch(buildUrl(endpoint), config);
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
