import { apiRequest } from '../../../services/api';

/*
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
     * Update user profile (username and/or avatar)
     * @param {Object} data - { username?: string, avatar?: string }
     * @returns {Promise<Object>} Updated user data
     */
    updateProfile: (data) => apiRequest('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
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

    /**
     * Get public profile data for any user by ID (no auth required)
     * @param {string|number} userId
     * @returns {Promise<Object>} { user: { id, username, avatar, joined } }
     */
    getPublicProfile: (userId) => apiRequest(`/users/${userId}/`, {
        method: 'GET',
    }),

    getUserBracketSummary: (userId) => apiRequest(`/users/${userId}/brackets/`, {
        method: 'GET',
    }),
};